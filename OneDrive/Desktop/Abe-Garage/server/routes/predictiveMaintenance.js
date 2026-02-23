import express from "express";
import mysql from "mysql2/promise";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  requireAdmin,
  requireCustomerOrAdmin,
} from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiting for AI predictions
const predictionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: "Too many prediction requests, please try again later.",
  },
});

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "abe_garage",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// AI-Powered Predictive Maintenance Engine
class PredictiveMaintenanceEngine {
  constructor() {
    this.componentModels = {
      brakePads: {
        baselineLife: 30000, // miles
        wearRatePerMile: 1 / 30000,
        criticalThreshold: 0.8,
        cost: 120,
        maintenanceInterval: 25000,
      },
      engineOil: {
        baselineLife: 5000, // miles
        wearRatePerMile: 1 / 5000,
        criticalThreshold: 0.9,
        cost: 45,
        maintenanceInterval: 5000,
      },
      tires: {
        baselineLife: 40000, // miles
        wearRatePerMile: 1 / 40000,
        criticalThreshold: 0.3,
        cost: 400,
        maintenanceInterval: 35000,
      },
      transmission: {
        baselineLife: 60000, // miles
        wearRatePerMile: 1 / 60000,
        criticalThreshold: 0.7,
        cost: 85,
        maintenanceInterval: 50000,
      },
      sparkPlugs: {
        baselineLife: 30000, // miles
        wearRatePerMile: 1 / 30000,
        criticalThreshold: 0.8,
        cost: 60,
        maintenanceInterval: 25000,
      },
    };
  }

  // Calculate wear level based on mileage and time since last service
  calculateWearLevel(
    component,
    currentMileage,
    lastServiceMileage,
    serviceAge
  ) {
    const model = this.componentModels[component];
    if (!model) return 0;

    // Miles driven since last service
    const milesDriven = currentMileage - lastServiceMileage;
    const mileageWear = milesDriven * model.wearRatePerMile * 100;

    // Time-based wear (vehicles in harsh conditions wear faster)
    const timeWear = (serviceAge / 365) * 20; // 20% per year additional wear

    // Environmental factors (simplified)
    const environmentalWear = 0; // Would be calculated based on climate, driving conditions

    const totalWear = Math.min(100, mileageWear + timeWear + environmentalWear);
    return Math.round(totalWear);
  }

  // Predict failure date based on wear rate
  predictFailureDate(wearLevel, currentMileage, monthlyMileage) {
    const daysUntilCritical = ((80 - wearLevel) / 80) * 90; // Simplified calculation
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + daysUntilCritical);
    return predictedDate;
  }

  // Calculate risk score based on multiple factors
  calculateRiskScore(wearLevel, vehicleAge, serviceHistory, drivingConditions) {
    let riskScore = wearLevel;

    // Vehicle age factor
    if (vehicleAge > 5) riskScore += 10;
    if (vehicleAge > 10) riskScore += 15;

    // Service history factor
    if (serviceHistory.length === 0) riskScore += 20;

    // Driving conditions (high mileage, city driving)
    if (drivingConditions === "severe") riskScore += 15;
    else if (drivingConditions === "moderate") riskScore += 8;

    return Math.min(100, riskScore);
  }

  // Generate predictions for a vehicle
  async generatePredictions(userId, vehicleInfo) {
    const {
      make,
      model,
      year,
      mileage,
      drivingConditions = "normal",
    } = vehicleInfo;

    // Get service history for this vehicle
    const serviceHistory = await this.getServiceHistory(userId, vehicleInfo);

    // Calculate vehicle age
    const vehicleAge = new Date().getFullYear() - year;

    const predictions = [];

    // Analyze each component
    for (const [component, model] of Object.entries(this.componentModels)) {
      const lastService = serviceHistory.find((s) => s.component === component);

      let lastServiceMileage = mileage - (lastService?.milesDriven || 0);
      let serviceAge = lastService?.daysSinceService || 365;

      // If no service history, assume it's the original component
      if (!lastService) {
        lastServiceMileage = 0;
        serviceAge = vehicleAge * 365;
      }

      const wearLevel = this.calculateWearLevel(
        component,
        mileage,
        lastServiceMileage,
        serviceAge
      );

      if (wearLevel > 20) {
        // Only predict for components with significant wear
        const predictedFailureDate = this.predictFailureDate(
          wearLevel,
          mileage
        );
        const riskScore = this.calculateRiskScore(
          wearLevel,
          vehicleAge,
          serviceHistory,
          drivingConditions
        );

        const urgency =
          riskScore > 75 ? "high" : riskScore > 50 ? "medium" : "low";

        predictions.push({
          component: this.formatComponentName(component),
          urgency,
          predictedFailureDate: predictedFailureDate
            .toISOString()
            .split("T")[0],
          currentWearLevel: wearLevel,
          estimatedMilesUntilFailure: Math.round(
            ((100 - wearLevel) * model.baselineLife) / 100
          ),
          riskScore,
          recommendedAction: this.generateRecommendation(
            component,
            wearLevel,
            riskScore
          ),
          cost: model.cost,
          serviceHistory: lastService
            ? `Last ${this.formatComponentName(
              component
            ).toLowerCase()}: ${Math.round(serviceAge / 30)} months ago`
            : `Original component - ${vehicleAge} years old`,
        });
      }
    }

    return predictions.sort((a, b) => b.riskScore - a.riskScore);
  }

  formatComponentName(component) {
    return component
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  generateRecommendation(component, wearLevel, riskScore) {
    if (riskScore > 80) {
      return `Schedule ${component.toLowerCase()} replacement immediately`;
    } else if (riskScore > 60) {
      return `Schedule ${component.toLowerCase()} service within 2 weeks`;
    } else if (riskScore > 40) {
      return `Monitor ${component.toLowerCase()} and schedule service within 1 month`;
    } else {
      return `Regular monitoring of ${component.toLowerCase()} recommended`;
    }
  }

  async getServiceHistory(userId, vehicleInfo) {
    try {
      // Mock service history - in real implementation, this would query the database
      return [
        {
          component: "brakePads",
          milesDriven: 15000,
          daysSinceService: 180,
        },
        {
          component: "engineOil",
          milesDriven: 4000,
          daysSinceService: 90,
        },
      ];
    } catch (error) {
      console.error("Error fetching service history:", error);
      return [];
    }
  }
}

const predictiveEngine = new PredictiveMaintenanceEngine();

// GET /api/predictive-maintenance/:userId
router.get(
  "/:userId",
  predictionLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = "3months" } = req.query;

      // Verify user authorization
      if (String(req.user.id) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to user data",
        });
      }

      // Get user's vehicle information
      const [vehicleRows] = await db.execute(
        "SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        [userId]
      );

      if (vehicleRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No vehicle information found for user",
        });
      }

      const vehicleInfo = vehicleRows[0];

      // Generate AI predictions
      const predictions = await predictiveEngine.generatePredictions(
        userId,
        vehicleInfo
      );

      // Calculate overall vehicle health score
      const avgRiskScore =
        predictions.reduce((sum, p) => sum + p.riskScore, 0) /
        predictions.length;
      const overallHealth = Math.max(0, 100 - avgRiskScore);

      const response = {
        success: true,
        data: {
          vehicleInfo: {
            make: vehicleInfo.make,
            model: vehicleInfo.model,
            year: vehicleInfo.year,
            mileage: vehicleInfo.mileage,
            overallHealth: Math.round(overallHealth),
            nextService:
              predictions.length > 0
                ? predictions[0].predictedFailureDate
                : null,
          },
          predictions,
          timeframe,
          generatedAt: new Date().toISOString(),
          aiModel: "v2.1",
        },
      };

      // Cache the result for 1 hour
      res.set("Cache-Control", "public, max-age=3600");

      res.json(response);
    } catch (error) {
      console.error("Predictive maintenance error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// POST /api/predictive-maintenance/feedback
router.post(
  "/feedback",
  authenticateToken,
  [
    body("predictionId").isInt(),
    body("accuracy").isIn(["accurate", "inaccurate"]),
    body("actualFailureDate").optional().isISO8601(),
    body("comments").optional().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid feedback data",
          errors: errors.array(),
        });
      }

      const { predictionId, accuracy, actualFailureDate, comments } = req.body;

      // Store feedback for ML model improvement
      const [result] = await db.execute(
        `INSERT INTO prediction_feedback 
         (prediction_id, user_id, accuracy, actual_failure_date, comments, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [predictionId, req.user.id, accuracy, actualFailureDate, comments]
      );

      res.json({
        success: true,
        message: "Feedback recorded successfully",
        feedbackId: result.insertId,
      });
    } catch (error) {
      console.error("Feedback submission error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// GET /api/predictive-maintenance/analytics/:userId
router.get("/analytics/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get prediction accuracy analytics
    const [analyticsRows] = await db.execute(
      `SELECT 
         AVG(CASE WHEN accuracy = 'accurate' THEN 1 ELSE 0 END) as accuracy_rate,
         COUNT(*) as total_feedback,
         COUNT(CASE WHEN accuracy = 'accurate' THEN 1 END) as accurate_predictions
       FROM prediction_feedback 
       WHERE user_id = ?`,
      [userId]
    );

    const analytics = analyticsRows[0] || {
      accuracy_rate: 0,
      total_feedback: 0,
      accurate_predictions: 0,
    };

    res.json({
      success: true,
      data: {
        accuracyRate: Math.round((analytics.accuracy_rate || 0) * 100),
        totalFeedback: analytics.total_feedback || 0,
        accuratePredictions: analytics.accurate_predictions || 0,
        modelVersion: "v2.1",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
