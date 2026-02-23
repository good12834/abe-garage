import express from "express";
import Stripe from "stripe";
import { body, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { asyncHandler, ValidationError } from "../middleware/errorHandler.js";

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Create Payment Intent
router.post(
    "/create-intent",
    authenticateToken,
    [
        body("appointmentId").isInt().withMessage("Valid appointment ID is required"),
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ValidationError(errors.array()[0].msg);
        }

        const { appointmentId, paymentMethod = "card" } = req.body;
        const userId = req.user.id; // User must be authenticated

        // 1. Fetch Appointment & Verify Ownership
        const appointment = await getSingleRecord(
            `SELECT a.*, i.total_amount as invoice_amount, i.id as invoice_id 
       FROM appointments a
       LEFT JOIN invoices i ON a.id = i.appointment_id
       WHERE a.id = ?`,
            [appointmentId]
        );

        if (!appointment) {
            throw new ValidationError("Appointment not found");
        }

        // Allow admin to pay for anyone, but customers only for themselves
        if (req.user.role !== "admin" && appointment.customer_id !== userId) {
            throw new ValidationError("Access denied");
        }

        // 2. Determine Amount to Charge
        // Priority: Invoice Amount > Final Cost > Estimated Cost
        let amountToPay = appointment.invoice_amount || appointment.final_cost || appointment.estimated_cost;

        if (!amountToPay || amountToPay <= 0) {
            throw new ValidationError("No valid amount to charge for this appointment.");
        }

        // Convert to smallest currency unit (cents for USD)
        const amountInCents = Math.round(amountToPay * 100);

        // 3. Create Stripe PaymentIntent
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: "usd",
                metadata: {
                    appointmentId: appointmentId.toString(),
                    userId: userId.toString(),
                    invoiceId: appointment.invoice_id ? appointment.invoice_id.toString() : "none"
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // 4. (Optional) Create Pending Payment Record in DB
            await executeQuery(
                `INSERT INTO payments 
        (appointment_id, stripe_payment_id, amount, currency, status, payment_method)
        VALUES (?, ?, ?, 'usd', 'pending', ?)`,
                [appointmentId, paymentIntent.id, amountToPay, paymentMethod]
            );

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                paymentId: paymentIntent.id,
                amount: amountToPay
            });

        } catch (err) {
            console.error("Stripe Error:", err);
            throw new ValidationError("Payment processing failed: " + err.message);
        }
    })
);

// Webhook (Optional - for advanced usage)
// In a real app, you'd configure raw body parsing for this specific route.
// For now, we'll skip detailed implementation but reserve the spot.

export default router;
