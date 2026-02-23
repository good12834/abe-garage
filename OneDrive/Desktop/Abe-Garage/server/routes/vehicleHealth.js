import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireCustomerOrAdmin,
  requireCustomerOwnership,
} from "../middleware/auth.js";
import { asyncHandler, ValidationError } from "../middleware/errorHandler.js";

const router = express.Router();

// Get vehicle health scores for a customer
router.get(
  "/customer/:customerId",
  authenticateToken,
  requireCustomerOwnership,
  [
    param("customerId").isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
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
    const { limit = 10, offset = 0 } = req.query;

    // Get vehicle health scores
    const healthScores = await executeQuery(
      `SELECT 
        vhs.*,
        CONCAT(m.first_name, ' ', m.last_name) as assessor_name
       FROM vehicle_health_scores vhs
       LEFT JOIN mechanics m ON vhs.assessor_name = CONCAT(m.first_name, ' ', m.last_name)
       WHERE vhs.user_id = ?
       ORDER BY vhs.assessment_date DESC
       LIMIT ? OFFSET ?`,
      [customerId, limit, offset]
    );

    // Process JSON fields
    const processedScores = healthScores.map((score) => ({
      ...score,
      score_breakdown: score.score_breakdown
        ? JSON.parse(score.score_breakdown)
        : {},
      critical_issues: score.critical_issues
        ? JSON.parse(score.critical_issues)
        : [],
      recommendations: score.recommendations
        ? JSON.parse(score.recommendations)
        : [],
    }));

    // Get latest score for summary
    const latestScore = processedScores.length > 0 ? processedScores[0] : null;

    // Calculate trends
    const trends = await executeQuery(
      `SELECT 
        vehicle_brand,
        vehicle_model,
        vehicle_year,
        overall_score,
        assessment_date,
        LAG(overall_score) OVER (PARTITION BY vehicle_brand, vehicle_model, vehicle_year ORDER BY assessment_date) as previous_score,
        overall_score - LAG(overall_score) OVER (PARTITION BY vehicle_brand, vehicle_model, vehicle_year ORDER BY assessment_date) as score_change
       FROM vehicle_health_scores 
       WHERE user_id = ?
       ORDER BY vehicle_brand, vehicle_model, vehicle_year, assessment_date DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: {
        health_scores: processedScores,
        latest_score: latestScore,
        trends: trends.filter((t) => t.previous_score !== null),
        summary: {
          total_assessments: processedScores.length,
          average_score:
            processedScores.length > 0
              ? Math.round(
                processedScores.reduce(
                  (sum, score) => sum + score.overall_score,
                  0
                ) / processedScores.length
              )
              : 0,
          last_assessment: latestScore?.assessment_date || null,
        },
      },
    });
  })
);

// Create new vehicle health score
router.post(
  "/customer/:customerId",
  authenticateToken,
  requireCustomerOwnership,
  [
    param("customerId").isInt({ min: 1 }),
    body("vehicleBrand")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Vehicle brand is required"),
    body("vehicleModel")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Vehicle model is required"),
    body("vehicleYear")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Valid vehicle year is required"),
    body("vehicleVin")
      .optional()
      .trim()
      .isLength({ min: 17, max: 17 })
      .withMessage("VIN must be exactly 17 characters"),
    body("currentMileage")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Current mileage must be a positive integer"),
    body("overallScore")
      .isInt({ min: 0, max: 100 })
      .withMessage("Overall score must be between 0 and 100"),
    body("scoreBreakdown")
      .optional()
      .isObject()
      .withMessage("Score breakdown must be an object"),
    body("criticalIssues")
      .optional()
      .isArray()
      .withMessage("Critical issues must be an array"),
    body("recommendations")
      .optional()
      .isArray()
      .withMessage("Recommendations must be an array"),
    body("assessmentType")
      .optional()
      .isIn(["routine", "diagnostic", "pre_purchase", "service_based"])
      .withMessage("Invalid assessment type"),
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

    const customerId = req.params.customerId;
    const {
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleVin,
      currentMileage,
      overallScore,
      scoreBreakdown,
      criticalIssues,
      recommendations,
      assessmentType = "routine",
      notes,
    } = req.body;

    // Create vehicle health score
    const healthScoreId = await executeQuery(
      `INSERT INTO vehicle_health_scores 
       (user_id, vehicle_brand, vehicle_model, vehicle_year, vehicle_vin, current_mileage, overall_score, score_breakdown, critical_issues, recommendations, assessment_date, assessment_type, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [
        customerId,
        vehicleBrand,
        vehicleModel,
        vehicleYear,
        vehicleVin || null,
        currentMileage || null,
        overallScore,
        scoreBreakdown ? JSON.stringify(scoreBreakdown) : null,
        criticalIssues ? JSON.stringify(criticalIssues) : null,
        recommendations ? JSON.stringify(recommendations) : null,
        assessmentType,
        notes || null,
      ]
    );

    const newHealthScore = await getSingleRecord(
      "SELECT * FROM vehicle_health_scores WHERE id = ?",
      [healthScoreId]
    );

    // Process JSON fields
    newHealthScore.score_breakdown = newHealthScore.score_breakdown
      ? JSON.parse(newHealthScore.score_breakdown)
      : {};
    newHealthScore.critical_issues = newHealthScore.critical_issues
      ? JSON.parse(newHealthScore.critical_issues)
      : [];
    newHealthScore.recommendations = newHealthScore.recommendations
      ? JSON.parse(newHealthScore.recommendations)
      : [];

    res.status(201).json({
      success: true,
      message: "Vehicle health score created successfully",
      data: { health_score: newHealthScore },
    });
  })
);

// Get specific vehicle health score
router.get(
  "/:id",
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

    const healthScoreId = req.params.id;

    const healthScore = await getSingleRecord(
      `SELECT 
        vhs.*,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email
       FROM vehicle_health_scores vhs
       JOIN users u ON vhs.user_id = u.id
       WHERE vhs.id = ?`,
      [healthScoreId]
    );

    if (!healthScore) {
      throw new ValidationError("Vehicle health score not found");
    }

    // Check ownership or admin access
    if (req.user.role !== "admin" && String(healthScore.user_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Process JSON fields
    healthScore.score_breakdown = healthScore.score_breakdown
      ? JSON.parse(healthScore.score_breakdown)
      : {};
    healthScore.critical_issues = healthScore.critical_issues
      ? JSON.parse(healthScore.critical_issues)
      : [];
    healthScore.recommendations = healthScore.recommendations
      ? JSON.parse(healthScore.recommendations)
      : [];

    res.json({
      success: true,
      data: { health_score: healthScore },
    });
  })
);

// Update vehicle health score
router.put(
  "/:id",
  authenticateToken,
  [
    param("id").isInt({ min: 1 }),
    body("overallScore")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Overall score must be between 0 and 100"),
    body("scoreBreakdown")
      .optional()
      .isObject()
      .withMessage("Score breakdown must be an object"),
    body("criticalIssues")
      .optional()
      .isArray()
      .withMessage("Critical issues must be an array"),
    body("recommendations")
      .optional()
      .isArray()
      .withMessage("Recommendations must be an array"),
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

    const healthScoreId = req.params.id;

    // Check if health score exists and get ownership info
    const existingScore = await getSingleRecord(
      "SELECT * FROM vehicle_health_scores WHERE id = ?",
      [healthScoreId]
    );

    if (!existingScore) {
      throw new ValidationError("Vehicle health score not found");
    }

    // Check ownership or admin access
    if (req.user.role !== "admin" && String(existingScore.user_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    const {
      overallScore,
      scoreBreakdown,
      criticalIssues,
      recommendations,
      notes,
    } = req.body;

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (overallScore !== undefined) {
      updateFields.push("overall_score = ?");
      updateValues.push(overallScore);
    }

    if (scoreBreakdown !== undefined) {
      updateFields.push("score_breakdown = ?");
      updateValues.push(JSON.stringify(scoreBreakdown));
    }

    if (criticalIssues !== undefined) {
      updateFields.push("critical_issues = ?");
      updateValues.push(JSON.stringify(criticalIssues));
    }

    if (recommendations !== undefined) {
      updateFields.push("recommendations = ?");
      updateValues.push(JSON.stringify(recommendations));
    }

    if (notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.push(notes);
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateValues.push(healthScoreId);

    // Update health score
    await executeQuery(
      `UPDATE vehicle_health_scores SET ${updateFields.join(
        ", "
      )} WHERE id = ?`,
      updateValues
    );

    const updatedScore = await getSingleRecord(
      "SELECT * FROM vehicle_health_scores WHERE id = ?",
      [healthScoreId]
    );

    // Process JSON fields
    updatedScore.score_breakdown = updatedScore.score_breakdown
      ? JSON.parse(updatedScore.score_breakdown)
      : {};
    updatedScore.critical_issues = updatedScore.critical_issues
      ? JSON.parse(updatedScore.critical_issues)
      : [];
    updatedScore.recommendations = updatedScore.recommendations
      ? JSON.parse(updatedScore.recommendations)
      : [];

    res.json({
      success: true,
      message: "Vehicle health score updated successfully",
      data: { health_score: updatedScore },
    });
  })
);

// Get vehicle health recommendations
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

    // Get latest health score for recommendations
    const latestScore = await getSingleRecord(
      `SELECT * FROM vehicle_health_scores 
       WHERE user_id = ? 
       ORDER BY assessment_date DESC 
       LIMIT 1`,
      [customerId]
    );

    if (!latestScore) {
      throw new ValidationError("No health scores found for customer");
    }

    // Parse recommendations
    const recommendations = latestScore.recommendations
      ? JSON.parse(latestScore.recommendations)
      : [];

    // Group recommendations by priority
    const prioritizedRecommendations = {
      urgent: recommendations.filter((rec) => rec.priority === "urgent"),
      high: recommendations.filter((rec) => rec.priority === "high"),
      medium: recommendations.filter((rec) => rec.priority === "medium"),
      low: recommendations.filter((rec) => rec.priority === "low"),
    };

    res.json({
      success: true,
      data: {
        vehicle_info: {
          brand: latestScore.vehicle_brand,
          model: latestScore.vehicle_model,
          year: latestScore.vehicle_year,
        },
        overall_score: latestScore.overall_score,
        recommendations: prioritizedRecommendations,
        critical_issues: latestScore.critical_issues
          ? JSON.parse(latestScore.critical_issues)
          : [],
        assessment_date: latestScore.assessment_date,
      },
    });
  })
);

// Calculate health score based on vehicle data
router.post(
  "/calculate",
  authenticateToken,
  [
    body("vehicleBrand").trim().isLength({ min: 1 }),
    body("vehicleModel").trim().isLength({ min: 1 }),
    body("vehicleYear").isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body("currentMileage").optional().isInt({ min: 0 }),
    body("serviceHistory").optional().isArray(),
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

    const {
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      currentMileage = 0,
      serviceHistory = [],
    } = req.body;

    // Calculate health score
    const healthScore = calculateVehicleHealthScore(
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      currentMileage,
      serviceHistory
    );

    res.json({
      success: true,
      data: { calculated_score: healthScore },
    });
  })
);

// Helper function to calculate vehicle health score
function calculateVehicleHealthScore(
  brand,
  model,
  year,
  mileage,
  serviceHistory
) {
  let score = 85; // Base score

  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - year;

  // Age penalty
  if (vehicleAge > 5) {
    score -= Math.min(15, (vehicleAge - 5) * 2);
  }

  // Mileage penalty
  if (mileage > 50000) {
    score -= Math.min(20, Math.floor((mileage - 50000) / 15000));
  }

  // Service history bonus/penalty
  const recentServices = serviceHistory.filter((service) => {
    const serviceDate = new Date(service.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return serviceDate > oneYearAgo;
  }).length;

  if (recentServices >= 3) {
    score += 5; // Bonus for regular maintenance
  } else if (recentServices === 0) {
    score -= 10; // Penalty for no recent maintenance
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Generate score breakdown
  const breakdown = {
    overall: score,
    engine: Math.max(0, score - 5 + Math.floor(Math.random() * 10)),
    transmission: Math.max(0, score - 3 + Math.floor(Math.random() * 6)),
    brakes: Math.max(0, score - 2 + Math.floor(Math.random() * 4)),
    electrical: Math.max(0, score - 4 + Math.floor(Math.random() * 8)),
    suspension: Math.max(0, score - 3 + Math.floor(Math.random() * 6)),
  };

  // Generate recommendations based on score
  const recommendations = [];
  if (score < 70) {
    recommendations.push({
      service: "Comprehensive inspection",
      priority: "urgent",
      reason: "Overall vehicle health score indicates potential issues",
    });
  }
  if (breakdown.engine < 70) {
    recommendations.push({
      service: "Engine diagnostics",
      priority: "high",
      reason: "Engine system score is below optimal range",
    });
  }
  if (breakdown.brakes < 75) {
    recommendations.push({
      service: "Brake inspection",
      priority: "high",
      reason: "Brake system requires attention for safety",
    });
  }

  return {
    overall_score: score,
    score_breakdown: breakdown,
    recommendations,
    assessment_type: "calculated",
  };
}

export default router;
