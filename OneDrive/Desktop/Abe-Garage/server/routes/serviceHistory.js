import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireCustomerOrAdmin,
  requireCustomerOwnership,
} from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validatePositiveNumber,
} from "../middleware/errorHandler.js";

const router = express.Router();

// Get customer service history
router.get(
  "/customer/:customerId",
  authenticateToken,
  requireCustomerOwnership,
  [
    param("customerId").isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
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

    const customerId = req.params.customerId;
    const { limit = 20, offset = 0 } = req.query;

    // Get service history
    const history = await executeQuery(
      `SELECT 
        sh.*,
        s.name as service_name,
        s.category as service_category,
        s.base_price,
        CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
        i.invoice_number,
        i.total_amount,
        i.payment_status
      FROM service_history sh
      JOIN services s ON sh.service_id = s.id
      LEFT JOIN mechanics m ON sh.appointment_id IN (
        SELECT id FROM appointments WHERE mechanic_id = m.id
      )
      LEFT JOIN invoices i ON sh.appointment_id = i.appointment_id
      WHERE sh.user_id = ?
      ORDER BY sh.service_date DESC
      LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );

    // Get summary statistics
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_services,
        COALESCE(SUM(cost), 0) as total_spent,
        AVG(cost) as average_cost,
        MAX(service_date) as last_service_date,
        MIN(service_date) as first_service_date
      FROM service_history 
      WHERE user_id = ?`,
      [customerId]
    );

    // Get service category breakdown
    const categoryStats = await executeQuery(
      `SELECT 
        s.category,
        COUNT(*) as service_count,
        SUM(sh.cost) as total_cost,
        AVG(sh.cost) as average_cost
      FROM service_history sh
      JOIN services s ON sh.service_id = s.id
      WHERE sh.user_id = ?
      AND s.category IS NOT NULL
      GROUP BY s.category
      ORDER BY service_count DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: {
        history,
        summary: stats[0],
        categoryBreakdown: categoryStats,
      },
    });
  })
);

// Add service to history (typically when appointment is completed)
router.post(
  "/customer/:customerId",
  authenticateToken,
  requireCustomerOwnership,
  [
    param("customerId").isInt({ min: 1 }),
    body("appointmentId").optional().isInt({ min: 1 }),
    body("serviceId")
      .isInt({ min: 1 })
      .withMessage("Valid service ID is required"),
    body("carBrand")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Car brand is required"),
    body("carModel")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Car model is required"),
    body("carYear").isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body("serviceDate")
      .isISO8601()
      .withMessage("Valid service date is required"),
    body("mileageAtService").optional().isInt({ min: 0 }),
    body("cost").isFloat({ min: 0 }).withMessage("Valid cost is required"),
    body("partsUsed").optional().isArray(),
    body("recommendations").optional().isArray(),
    body("notes").optional().trim().isLength({ max: 1000 }),
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

    const customerId = req.params.customerId;
    const {
      appointmentId,
      serviceId,
      carBrand,
      carModel,
      carYear,
      serviceDate,
      mileageAtService,
      cost,
      partsUsed,
      recommendations,
      notes,
    } = req.body;

    // Verify service exists
    const service = await getSingleRecord(
      "SELECT id, name FROM services WHERE id = ?",
      [serviceId]
    );

    if (!service) {
      throw new ValidationError("Service not found");
    }

    // Create service history record
    const historyId = await executeQuery(
      `INSERT INTO service_history 
      (user_id, appointment_id, service_id, car_brand, car_model, car_year, service_date, mileage_at_service, cost, parts_used, recommendations, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        appointmentId || null,
        serviceId,
        carBrand,
        carModel,
        carYear,
        serviceDate,
        mileageAtService || null,
        cost,
        partsUsed ? JSON.stringify(partsUsed) : null,
        recommendations ? JSON.stringify(recommendations) : null,
        notes || null,
      ]
    );

    // Update customer's total spent and last service date
    await executeQuery(
      `UPDATE users 
       SET total_spent = total_spent + ?,
           last_service_date = ?
       WHERE id = ?`,
      [cost, serviceDate, customerId]
    );

    const newRecord = await getSingleRecord(
      `SELECT sh.*, s.name as service_name
       FROM service_history sh
       JOIN services s ON sh.service_id = s.id
       WHERE sh.id = ?`,
      [historyId]
    );

    res.status(201).json({
      success: true,
      message: "Service history record created successfully",
      data: { record: newRecord },
    });
  })
);

// Get service recommendations for customer
router.get(
  "/customer/:customerId/recommendations",
  authenticateToken,
  requireCustomerOwnership,
  [param("customerId").isInt({ min: 1 })],
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

    const customerId = req.params.customerId;

    // Get customer data and recent history
    const customer = await getSingleRecord("SELECT * FROM users WHERE id = ?", [
      customerId,
    ]);

    if (!customer) {
      throw new ValidationError("Customer not found");
    }

    // Get recent service history (last 2 years)
    const recentHistory = await executeQuery(
      `SELECT sh.*, s.name as service_name, s.category
       FROM service_history sh
       JOIN services s ON sh.service_id = s.id
       WHERE sh.user_id = ? 
       AND sh.service_date >= DATE_SUB(NOW(), INTERVAL 2 YEAR)
       ORDER BY sh.service_date DESC`,
      [customerId]
    );

    // Generate recommendations based on service history and vehicle age
    const recommendations = generateRecommendations(customer, recentHistory);

    // Save recommendations to database
    for (const rec of recommendations) {
      await executeQuery(
        `INSERT INTO service_recommendations 
        (user_id, service_id, car_brand, car_model, car_year, recommendation_type, reason, priority, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 6 MONTH))
        ON DUPLICATE KEY UPDATE
        reason = VALUES(reason),
        priority = VALUES(priority),
        created_at = CURRENT_TIMESTAMP`,
        [
          customerId,
          rec.serviceId,
          customer.car_brand || rec.carBrand,
          customer.car_model || rec.carModel,
          customer.car_year || rec.carYear,
          rec.type,
          rec.reason,
          rec.priority,
        ]
      );
    }

    // Get saved recommendations
    const savedRecommendations = await executeQuery(
      `SELECT sr.*, s.name as service_name, s.base_price, s.duration_minutes
       FROM service_recommendations sr
       JOIN services s ON sr.service_id = s.id
       WHERE sr.user_id = ?
       AND sr.is_dismissed = FALSE
       AND (sr.expires_at IS NULL OR sr.expires_at > NOW())
       ORDER BY 
         CASE sr.priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'medium' THEN 3 
           WHEN 'low' THEN 4 
         END,
         sr.created_at DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: {
        recommendations: savedRecommendations,
        generated: recommendations.length,
      },
    });
  })
);

// Dismiss recommendation
router.put(
  "/recommendations/:id/dismiss",
  authenticateToken,
  [param("id").isInt({ min: 1 })],
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

    const recommendationId = req.params.id;

    // Verify recommendation belongs to user (or user is admin)
    const recommendation = await getSingleRecord(
      `SELECT sr.*, u.id as user_id
       FROM service_recommendations sr
       JOIN users u ON sr.user_id = u.id
       WHERE sr.id = ?`,
      [recommendationId]
    );

    if (!recommendation) {
      throw new ValidationError("Recommendation not found");
    }

    // Check if user owns this recommendation or is admin
    if (req.user.role !== "admin" && String(recommendation.user_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Mark as dismissed
    await executeQuery(
      "UPDATE service_recommendations SET is_dismissed = TRUE WHERE id = ?",
      [recommendationId]
    );

    res.json({
      success: true,
      message: "Recommendation dismissed successfully",
    });
  })
);

// Get customer loyalty points and transaction history
router.get(
  "/customer/:customerId/loyalty",
  authenticateToken,
  requireCustomerOwnership,
  [param("customerId").isInt({ min: 1 })],
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

    const customerId = req.params.customerId;

    // Get customer loyalty data
    const customer = await getSingleRecord(
      "SELECT loyalty_points, total_spent FROM users WHERE id = ?",
      [customerId]
    );

    // Get loyalty transactions
    const transactions = await executeQuery(
      `SELECT lt.*, a.service_id, s.name as service_name
       FROM loyalty_transactions lt
       LEFT JOIN appointments a ON lt.related_appointment_id = a.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE lt.user_id = ?
       ORDER BY lt.created_at DESC
       LIMIT 50`,
      [customerId]
    );

    // Calculate points earned this year
    const yearlyPoints = await executeQuery(
      `SELECT COALESCE(SUM(points), 0) as points_earned
       FROM loyalty_transactions 
       WHERE user_id = ? 
       AND transaction_type = 'earned'
       AND YEAR(created_at) = YEAR(NOW())`,
      [customerId]
    );

    // Calculate available rewards
    const availableRewards = calculateAvailableRewards(customer.loyalty_points);

    res.json({
      success: true,
      data: {
        loyalty: {
          currentPoints: customer.loyalty_points,
          totalSpent: customer.total_spent,
          pointsThisYear: yearlyPoints[0].points_earned,
          availableRewards,
        },
        transactions,
      },
    });
  })
);

// Helper function to generate recommendations
function generateRecommendations(customer, history) {
  const recommendations = [];
  const currentYear = new Date().getFullYear();
  const carAge = customer.car_year ? currentYear - customer.car_year : 0;

  // Mileage-based recommendations
  if (customer.car_mileage) {
    const mileage = customer.car_mileage;

    if (mileage >= 5000 && !hasRecentService(history, "Oil Change")) {
      recommendations.push({
        serviceId: 1, // Oil Change service ID
        type: "mileage_based",
        priority: mileage >= 7500 ? "urgent" : "high",
        reason: `Oil change recommended at ${mileage.toLocaleString()} miles`,
        carBrand: customer.car_brand,
        carModel: customer.car_model,
        carYear: customer.car_year,
      });
    }

    if (mileage >= 30000 && !hasRecentService(history, "Brake Inspection")) {
      recommendations.push({
        serviceId: 2, // Brake Inspection service ID
        type: "mileage_based",
        priority: mileage >= 35000 ? "high" : "medium",
        reason: `Brake inspection due at ${mileage.toLocaleString()} miles`,
        carBrand: customer.car_brand,
        carModel: customer.car_model,
        carYear: customer.car_year,
      });
    }

    if (
      mileage >= 60000 &&
      !hasRecentService(history, "Transmission Service")
    ) {
      recommendations.push({
        serviceId: 4, // Transmission Service
        type: "mileage_based",
        priority: mileage >= 65000 ? "high" : "medium",
        reason: `Transmission service recommended at ${mileage.toLocaleString()} miles`,
        carBrand: customer.car_brand,
        carModel: customer.car_model,
        carYear: customer.car_year,
      });
    }
  }

  // Time-based recommendations (if last service was over 6 months ago)
  const lastService = history[0];
  if (lastService) {
    const daysSinceLastService = Math.floor(
      (Date.now() - new Date(lastService.service_date).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (
      daysSinceLastService > 180 &&
      !hasRecentService(history, "General Inspection")
    ) {
      recommendations.push({
        serviceId: 3, // Engine Diagnostics
        type: "time_based",
        priority: daysSinceLastService > 365 ? "high" : "medium",
        reason: `General inspection recommended (${daysSinceLastService} days since last service)`,
        carBrand: customer.car_brand,
        carModel: customer.car_model,
        carYear: customer.car_year,
      });
    }
  }

  // Age-based recommendations
  if (carAge >= 5) {
    recommendations.push({
      serviceId: 6, // Air Conditioning Service
      type: "time_based",
      priority: carAge >= 7 ? "medium" : "low",
      reason: `AC system check recommended for ${carAge} year old vehicle`,
      carBrand: customer.car_brand,
      carModel: customer.car_model,
      carYear: customer.car_year,
    });
  }

  return recommendations;
}

// Helper function to check if service was recently performed
function hasRecentService(history, serviceName) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return history.some(
    (record) =>
      record.service_name === serviceName &&
      new Date(record.service_date) > oneYearAgo
  );
}

// Helper function to calculate available rewards
function calculateAvailableRewards(points) {
  const rewards = [
    {
      id: 1,
      name: "Free Car Wash",
      cost: 100,
      description: "Complimentary exterior car wash",
    },
    {
      id: 2,
      name: "10% Off Next Service",
      cost: 500,
      description: "Discount on your next service appointment",
    },
    {
      id: 3,
      name: "Free Oil Change",
      cost: 750,
      description: "Complimentary oil and filter change",
    },
    {
      id: 4,
      name: "Free Brake Inspection",
      cost: 1000,
      description: "Complimentary brake system inspection",
    },
  ];

  return rewards.map((reward) => ({
    ...reward,
    affordable: points >= reward.cost,
    canAffordMultiple: Math.floor(points / reward.cost),
  }));
}

export default router;
