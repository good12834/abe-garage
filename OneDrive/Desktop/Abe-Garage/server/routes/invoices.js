import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  requireCustomerOrAdmin,
} from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validatePositiveNumber,
} from "../middleware/errorHandler.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const router = express.Router();

// Create invoice for completed appointment (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("appointmentId")
      .isInt({ min: 1 })
      .withMessage("Valid appointment ID is required"),
    body("subtotal")
      .isFloat({ min: 0 })
      .withMessage("Subtotal must be a positive number"),
    body("taxRate")
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage("Tax rate must be between 0 and 1"),
    body("paymentMethod")
      .optional()
      .isIn(["cash", "credit_card", "debit_card", "bank_transfer", "insurance"])
      .withMessage("Invalid payment method"),
    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid due date"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const {
      appointmentId,
      subtotal,
      taxRate = 0.08,
      paymentMethod,
      dueDate,
    } = req.body;

    // Check if appointment exists and is completed
    const appointment = await getSingleRecord(
      `SELECT a.*, s.name as service_name,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name, c.email as customer_email
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users c ON a.customer_id = c.id
     WHERE a.id = ?`,
      [appointmentId]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found");
    }

    if (appointment.status !== "completed") {
      throw new ValidationError(
        "Can only create invoices for completed appointments"
      );
    }

    // Check if invoice already exists
    const existingInvoice = await getSingleRecord(
      "SELECT id FROM invoices WHERE appointment_id = ?",
      [appointmentId]
    );

    if (existingInvoice) {
      throw new ValidationError("Invoice already exists for this appointment");
    }

    // Calculate tax and total
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number using stored procedure
    let invoiceNumber = "";
    await new Promise((resolve, reject) => {
      const connection = require("../config/database.js").default;
      connection.query(
        "CALL GenerateInvoiceNumber(@invoice_num)",
        (err, results) => {
          if (err) reject(err);
          else {
            connection.query(
              "SELECT @invoice_num as invoice_num",
              (err, results) => {
                if (err) reject(err);
                else {
                  invoiceNumber = results[0].invoice_num;
                  resolve();
                }
              }
            );
          }
        }
      );
    });

    // Create invoice
    const invoiceId = await executeQuery(
      `INSERT INTO invoices 
     (appointment_id, invoice_number, subtotal, tax_rate, tax_amount, total_amount, payment_method, due_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId,
        invoiceNumber,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paymentMethod || null,
        dueDate || null,
      ]
    );

    // Create invoice items (service + additional work)
    await executeQuery(
      `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
     VALUES (?, ?, 1, ?, ?)`,
      [invoiceId, appointment.service_name, subtotal, subtotal]
    );

    // Update appointment final cost
    await executeQuery(
      "UPDATE appointments SET final_cost = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [totalAmount, appointmentId]
    );

    // Get created invoice
    const invoice = await getSingleRecord(
      `SELECT i.*, a.appointment_date, a.car_brand, a.car_model, a.car_year,
            s.name as service_name,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name, c.email as customer_email, c.phone as customer_phone
     FROM invoices i
     JOIN appointments a ON i.appointment_id = a.id
     JOIN services s ON a.service_id = s.id
     JOIN users c ON a.customer_id = c.id
     WHERE i.id = ?`,
      [invoiceId]
    );

    // Get invoice items
    const invoiceItems = await executeQuery(
      "SELECT * FROM invoice_items WHERE invoice_id = ?",
      [invoiceId]
    );

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        invoice: {
          ...invoice,
          items: invoiceItems,
        },
      },
    });
  })
);

// Get invoices for current user
router.get(
  "/my-invoices",
  authenticateToken,
  requireCustomerOrAdmin,
  asyncHandler(async (req, res) => {
    const customerId = req.user.id;

    const invoices = await executeQuery(
      `SELECT i.*, a.appointment_date, a.car_brand, a.car_model,
            s.name as service_name,
            CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
     FROM invoices i
     JOIN appointments a ON i.appointment_id = a.id
     JOIN services s ON a.service_id = s.id
     LEFT JOIN mechanics m ON a.mechanic_id = m.id
     WHERE a.customer_id = ?
     ORDER BY i.created_at DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: { invoices },
    });
  })
);

// Get all invoices (admin only)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  [
    query("status")
      .optional()
      .isIn(["pending", "paid", "partially_paid", "refunded"]),
    query("paymentMethod")
      .optional()
      .isIn([
        "cash",
        "credit_card",
        "debit_card",
        "bank_transfer",
        "insurance",
      ]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const { status, paymentMethod, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND i.payment_status = ?";
      params.push(status);
    }

    if (paymentMethod) {
      whereClause += " AND i.payment_method = ?";
      params.push(paymentMethod);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM invoices i ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get invoices
    const invoicesQuery = `
    SELECT i.*, a.appointment_date, a.car_brand, a.car_model, a.car_year,
           s.name as service_name,
           CONCAT(c.first_name, ' ', c.last_name) as customer_name, c.email as customer_email,
           CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
    FROM invoices i
    JOIN appointments a ON i.appointment_id = a.id
    JOIN services s ON a.service_id = s.id
    JOIN users c ON a.customer_id = c.id
    LEFT JOIN mechanics m ON a.mechanic_id = m.id
    ${whereClause}
    ORDER BY i.created_at DESC
    LIMIT ? OFFSET ?
  `;

    const invoices = await executeQuery(invoicesQuery, [
      ...params,
      limit,
      offset,
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  })
);

// Get single invoice by ID
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const invoiceId = req.params.id;

    const invoice = await getSingleRecord(
      `SELECT i.*, a.appointment_date, a.car_brand, a.car_model, a.car_year, a.problem_description,
            s.name as service_name,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name, c.email as customer_email, c.phone as customer_phone,
            CONCAT(m.first_name, ' ', m.last_name) as mechanic_name, m.phone as mechanic_phone
     FROM invoices i
     JOIN appointments a ON i.appointment_id = a.id
     JOIN services s ON a.service_id = s.id
     JOIN users c ON a.customer_id = c.id
     LEFT JOIN mechanics m ON a.mechanic_id = m.id
     WHERE i.id = ?`,
      [invoiceId]
    );

    if (!invoice) {
      throw new ValidationError("Invoice not found");
    }

    // Check authorization
    if (req.user.role !== "admin" && String(invoice.customer_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Get invoice items
    const invoiceItems = await executeQuery(
      "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id",
      [invoiceId]
    );

    res.json({
      success: true,
      data: {
        invoice: {
          ...invoice,
          items: invoiceItems,
        },
      },
    });
  })
);

// Update payment status (admin only)
router.put(
  "/:id/payment-status",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("paymentStatus")
      .isIn(["pending", "paid", "partially_paid", "refunded"])
      .withMessage("Invalid payment status"),
    body("paymentMethod")
      .optional()
      .isIn(["cash", "credit_card", "debit_card", "bank_transfer", "insurance"])
      .withMessage("Invalid payment method"),
    body("paymentDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid payment date"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes must not exceed 1000 characters"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const invoiceId = req.params.id;
    const { paymentStatus, paymentMethod, paymentDate, notes } = req.body;

    // Check if invoice exists
    const invoice = await getSingleRecord(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );

    if (!invoice) {
      throw new ValidationError("Invoice not found");
    }

    // Update invoice
    const updateFields = [
      "payment_status = ?",
      "updated_at = CURRENT_TIMESTAMP",
    ];
    const updateValues = [paymentStatus, invoiceId];

    if (paymentMethod !== undefined) {
      updateFields.push("payment_method = ?");
      updateValues.splice(-1, 0, paymentMethod);
    }

    if (paymentDate !== undefined) {
      updateFields.push("payment_date = ?");
      updateValues.splice(-1, 0, paymentDate);
    }

    if (notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.splice(-1, 0, notes);
    }

    await executeQuery(
      `UPDATE invoices SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Get updated invoice
    const updatedInvoice = await getSingleRecord(
      `SELECT i.*, a.appointment_date, s.name as service_name,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name
     FROM invoices i
     JOIN appointments a ON i.appointment_id = a.id
     JOIN services s ON a.service_id = s.id
     JOIN users c ON a.customer_id = c.id
     WHERE i.id = ?`,
      [invoiceId]
    );

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: { invoice: updatedInvoice },
    });
  })
);

// Generate PDF invoice
router.get(
  "/:id/pdf",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const invoiceId = req.params.id;

    const invoice = await getSingleRecord(
      `SELECT i.*, a.appointment_date, a.car_brand, a.car_model, a.car_year, a.problem_description,
            s.name as service_name,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name, c.email as customer_email, c.phone as customer_phone,
            CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
     FROM invoices i
     JOIN appointments a ON i.appointment_id = a.id
     JOIN services s ON a.service_id = s.id
     JOIN users c ON a.customer_id = c.id
     LEFT JOIN mechanics m ON a.mechanic_id = m.id
     WHERE i.id = ?`,
      [invoiceId]
    );

    if (!invoice) {
      throw new ValidationError("Invoice not found");
    }

    // Check authorization
    if (req.user.role !== "admin" && String(invoice.customer_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Get invoice items
    const invoiceItems = await executeQuery(
      "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id",
      [invoiceId]
    );

    // Generate PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoice_number}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).text("Abe Garage", { align: "center" });
    doc
      .fontSize(12)
      .text("Auto Service Management System", { align: "center" });
    doc.moveDown();

    // Invoice info
    doc
      .fontSize(16)
      .text(`Invoice: ${invoice.invoice_number}`, { align: "left" });
    doc
      .fontSize(12)
      .text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`);
    if (invoice.due_date) {
      doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`);
    }
    doc.moveDown();

    // Customer info
    doc.fontSize(14).text("Customer Information", { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${invoice.customer_name}`);
    doc.text(`Email: ${invoice.customer_email}`);
    if (invoice.customer_phone) {
      doc.text(`Phone: ${invoice.customer_phone}`);
    }
    doc.moveDown();

    // Service info
    doc.fontSize(14).text("Service Details", { underline: true });
    doc.fontSize(12);
    doc.text(`Service: ${invoice.service_name}`);
    doc.text(
      `Appointment Date: ${new Date(
        invoice.appointment_date
      ).toLocaleDateString()}`
    );
    doc.text(
      `Vehicle: ${invoice.car_year} ${invoice.car_brand} ${invoice.car_model}`
    );
    if (invoice.problem_description) {
      doc.text(`Issue: ${invoice.problem_description}`);
    }
    if (invoice.mechanic_name) {
      doc.text(`Mechanic: ${invoice.mechanic_name}`);
    }
    doc.moveDown();

    // Invoice items
    doc.fontSize(14).text("Invoice Items", { underline: true });
    doc.moveDown(0.5);

    // Table headers
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Description", 50, doc.y);
    doc.text("Qty", 300, doc.y);
    doc.text("Unit Price", 350, doc.y);
    doc.text("Total", 450, doc.y);
    doc.moveDown();
    doc.font("Helvetica");

    // Table rows
    invoiceItems.forEach((item) => {
      doc.text(item.description, 50, doc.y);
      doc.text(item.quantity.toString(), 300, doc.y);
      doc.text(`$${item.unit_price.toFixed(2)}`, 350, doc.y);
      doc.text(`$${item.total_price.toFixed(2)}`, 450, doc.y);
      doc.moveDown();
    });

    doc.moveDown();

    // Totals
    doc.font("Helvetica-Bold");
    doc.text("Subtotal:", 350, doc.y, { align: "right" });
    doc.text(`$${invoice.subtotal.toFixed(2)}`, 450, doc.y, { align: "right" });
    doc.moveDown(0.5);

    doc.text("Tax:", 350, doc.y, { align: "right" });
    doc.text(`$${invoice.tax_amount.toFixed(2)}`, 450, doc.y, {
      align: "right",
    });
    doc.moveDown(0.5);

    doc.fontSize(14);
    doc.text("Total:", 350, doc.y, { align: "right" });
    doc.text(`$${invoice.total_amount.toFixed(2)}`, 450, doc.y, {
      align: "right",
    });

    // Payment status
    doc.moveDown();
    doc.fontSize(12).font("Helvetica");
    doc.text(`Payment Status: ${invoice.payment_status.toUpperCase()}`);
    if (invoice.payment_method) {
      doc.text(
        `Payment Method: ${invoice.payment_method
          .replace("_", " ")
          .toUpperCase()}`
      );
    }
    if (invoice.payment_date) {
      doc.text(
        `Payment Date: ${new Date(invoice.payment_date).toLocaleDateString()}`
      );
    }

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .text("Thank you for choosing Abe Garage!", { align: "center" });
    doc.text("For questions about this invoice, please contact us.", {
      align: "center",
    });

    doc.end();
  })
);

// Get invoice statistics (admin only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_invoices,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_revenue,
      COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_revenue,
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END), 0) as paid_invoices,
      COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END), 0) as pending_invoices
    FROM invoices
  `);

    // Get monthly revenue for the last 12 months
    const monthlyRevenue = await executeQuery(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      SUM(total_amount) as revenue,
      COUNT(*) as invoice_count
    FROM invoices
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        monthlyRevenue,
      },
    });
  })
);

// Delete invoice (admin only) - soft delete by setting status to refunded
router.put(
  "/:id/refund",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Reason must not exceed 500 characters"),
  ],
  asyncHandler(async (req, res) => {
    const invoiceId = req.params.id;
    const { reason } = req.body;

    // Check if invoice exists
    const invoice = await getSingleRecord(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );

    if (!invoice) {
      throw new ValidationError("Invoice not found");
    }

    // Update invoice status to refunded
    const refundNote = reason ? `Refunded: ${reason}` : "Invoice refunded";
    await executeQuery(
      'UPDATE invoices SET payment_status = ?, notes = CONCAT(COALESCE(notes, ""), "\\n", ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ["refunded", refundNote, invoiceId]
    );

    res.json({
      success: true,
      message: "Invoice refunded successfully",
    });
  })
);

export default router;
