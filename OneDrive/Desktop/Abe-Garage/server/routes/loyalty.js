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

// Rate limiting for loyalty operations
const loyaltyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    error: "Too many loyalty requests, please try again later.",
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

// GET /api/loyalty/:userId - Get user's loyalty program details
router.get("/:userId", loyaltyLimiter, authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user authorization
    if (String(req.user.id) !== String(userId)) {

      return res.status(403).json({
        success: false,
        message: "Unauthorized access to user loyalty data",
      });
    }

    // Get user's loyalty program data
    const [loyaltyRows] = await db.execute(
      `SELECT 
        clp.*,
        CASE clp.tier
          WHEN 'bronze' THEN 1000
          WHEN 'silver' THEN 2500
          WHEN 'gold' THEN 5000
          WHEN 'platinum' THEN 10000
          WHEN 'diamond' THEN 20000
        END as current_tier_threshold
       FROM customer_loyalty_programs clp 
       WHERE clp.user_id = ?`,
      [userId]
    );

    if (loyaltyRows.length === 0) {
      // Create new loyalty program for user if doesn't exist
      const [insertResult] = await db.execute(
        `INSERT INTO customer_loyalty_programs 
         (user_id, tier, total_points, available_points, lifetime_points, total_spent, visit_count, member_since, next_tier_threshold, tier_benefits)
         VALUES (?, 'bronze', 0, 0, 0, 0, 0, CURDATE(), 1000, JSON_ARRAY('Priority booking', 'Early appointment scheduling'))`,
        [userId]
      );

      // Return the newly created program
      const [newProgramRows] = await db.execute(
        "SELECT * FROM customer_loyalty_programs WHERE id = ?",
        [insertResult.insertId]
      );

      return res.json({
        success: true,
        data: {
          program: newProgramRows[0],
          monthlyActivity: [],
          tierProgress: {
            current: 0,
            next: 1000,
            percentage: 0,
            pointsNeeded: 1000,
          },
        },
      });
    }

    const loyaltyData = loyaltyRows[0];

    // Get monthly activity data
    const [activityRows] = await db.execute(
      `SELECT 
        DATE_FORMAT(lpt.transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN lpt.transaction_type = 'earned' THEN lpt.points ELSE 0 END) as points,
        COUNT(CASE WHEN lpt.transaction_type = 'earned' THEN 1 END) as visits,
        0 as spent
       FROM loyalty_points_transactions lpt
       WHERE lpt.user_id = ? 
         AND lpt.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         AND lpt.is_active = TRUE
       GROUP BY DATE_FORMAT(lpt.transaction_date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 6`,
      [userId]
    );

    // Format monthly activity data
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyActivity = activityRows.reverse().map((row) => ({
      month: monthNames[parseInt(row.month.split("-")[1]) - 1],
      points: row.points || 0,
      visits: row.visits || 0,
      spent: row.spent || 0,
    }));

    // Calculate tier progress
    const currentThreshold =
      loyaltyData.tier === "bronze"
        ? 0
        : loyaltyData.tier === "silver"
          ? 1000
          : loyaltyData.tier === "gold"
            ? 2500
            : loyaltyData.tier === "platinum"
              ? 5000
              : 10000;

    const nextThreshold =
      loyaltyData.tier === "bronze"
        ? 1000
        : loyaltyData.tier === "silver"
          ? 2500
          : loyaltyData.tier === "gold"
            ? 5000
            : loyaltyData.tier === "platinum"
              ? 10000
              : 20000;

    const percentage =
      nextThreshold > currentThreshold
        ? ((loyaltyData.total_points - currentThreshold) /
          (nextThreshold - currentThreshold)) *
        100
        : 100;

    const tierProgress = {
      current: loyaltyData.total_points,
      next: nextThreshold,
      percentage: Math.min(100, Math.max(0, percentage)),
      pointsNeeded: Math.max(0, nextThreshold - loyaltyData.total_points),
    };

    res.json({
      success: true,
      data: {
        program: loyaltyData,
        monthlyActivity,
        tierProgress,
      },
    });
  } catch (error) {
    console.error("Loyalty program error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/loyalty/:userId/rewards - Get available rewards
router.get(
  "/:userId/rewards",
  loyaltyLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Verify user authorization
      if (String(req.user.id) !== String(userId)) {

        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      // Get user's current tier
      const [userRows] = await db.execute(
        "SELECT tier FROM customer_loyalty_programs WHERE user_id = ?",
        [userId]
      );

      const userTier = userRows.length > 0 ? userRows[0].tier : "bronze";

      // Get available rewards based on user's tier
      const tierHierarchy = ["bronze", "silver", "gold", "platinum", "diamond"];
      const userTierIndex = tierHierarchy.indexOf(userTier);

      const [rewardRows] = await db.execute(
        `SELECT * FROM rewards_catalog 
       WHERE is_active = TRUE 
         AND (valid_from IS NULL OR valid_from <= CURDATE())
         AND (valid_until IS NULL OR valid_until >= CURDATE())
         AND FIND_IN_SET(?, tier_requirements) > 0
       ORDER BY points_cost ASC`,
        [userTier]
      );

      // Get user's available points
      const [pointsRows] = await db.execute(
        "SELECT available_points FROM customer_loyalty_programs WHERE user_id = ?",
        [userId]
      );

      const availablePoints =
        pointsRows.length > 0 ? pointsRows[0].available_points : 0;

      // Mark rewards as available/unavailable based on points
      const rewards = rewardRows.map((reward) => ({
        ...reward,
        isAvailable: availablePoints >= reward.points_cost,
        tierRequirements: JSON.parse(reward.tier_requirements || "[]"),
      }));

      res.json({
        success: true,
        data: rewards,
      });
    } catch (error) {
      console.error("Rewards fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// POST /api/loyalty/:userId/redeem - Redeem a reward
router.post(
  "/:userId/redeem",
  loyaltyLimiter,
  authenticateToken,
  [
    body("rewardId").isInt(),
    body("deliveryMethod")
      .optional()
      .isIn(["email", "sms", "pickup", "mail", "instant"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid redemption data",
          errors: errors.array(),
        });
      }

      const { userId } = req.params;
      const { rewardId, deliveryMethod = "email" } = req.body;

      // Verify user authorization
      if (String(req.user.id) !== String(userId)) {

        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      // Start transaction
      await db.beginTransaction();

      try {
        // Get reward details
        const [rewardRows] = await db.execute(
          "SELECT * FROM rewards_catalog WHERE id = ? AND is_active = TRUE",
          [rewardId]
        );

        if (rewardRows.length === 0) {
          throw new Error("Reward not found or inactive");
        }

        const reward = rewardRows[0];

        // Get user's loyalty program and points
        const [programRows] = await db.execute(
          "SELECT * FROM customer_loyalty_programs WHERE user_id = ?",
          [userId]
        );

        if (programRows.length === 0) {
          throw new Error("Loyalty program not found");
        }

        const program = programRows[0];

        // Check if user has enough points
        if (program.available_points < reward.points_cost) {
          throw new Error("Insufficient points");
        }

        // Check redemption limits
        const [redemptionCountRows] = await db.execute(
          "SELECT COUNT(*) as count FROM loyalty_rewards_redemptions WHERE user_id = ? AND reward_id = ? AND redemption_status != 'expired'",
          [userId, rewardId]
        );

        const redemptionCount = redemptionCountRows[0].count;
        if (redemptionCount >= reward.max_redemptions_per_user) {
          throw new Error("Maximum redemptions reached for this reward");
        }

        // Generate redemption code
        const redemptionCode = `ABG-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`;

        // Calculate expiry date (1 year from now for most rewards)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Create redemption record
        const [redemptionResult] = await db.execute(
          `INSERT INTO loyalty_rewards_redemptions 
           (user_id, program_id, reward_id, points_redeemed, redemption_code, expiry_date, delivery_method)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            program.id,
            rewardId,
            reward.points_cost,
            redemptionCode,
            expiryDate,
            deliveryMethod,
          ]
        );

        // Deduct points from user's account
        await db.execute(
          "UPDATE customer_loyalty_programs SET available_points = available_points - ? WHERE user_id = ?",
          [reward.points_cost, userId]
        );

        // Create points transaction record
        await db.execute(
          `INSERT INTO loyalty_points_transactions 
           (user_id, program_id, transaction_type, points, description, reference_id, reference_type)
           VALUES (?, ?, 'redeemed', ?, ?, ?, 'reward_redemption')`,
          [
            userId,
            program.id,
            -reward.points_cost,
            `Redeemed: ${reward.reward_name}`,
            redemptionResult.insertId,
          ]
        );

        // Commit transaction
        await db.commit();

        res.json({
          success: true,
          message: "Reward redeemed successfully",
          data: {
            redemptionId: redemptionResult.insertId,
            redemptionCode,
            expiryDate: expiryDate.toISOString().split("T")[0],
            pointsDeducted: reward.points_cost,
          },
        });
      } catch (transactionError) {
        await db.rollback();
        throw transactionError;
      }
    } catch (error) {
      console.error("Reward redemption error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Redemption failed",
      });
    }
  }
);

// GET /api/loyalty/:userId/transactions - Get user's loyalty transactions
router.get(
  "/:userId/transactions",
  loyaltyLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Verify user authorization
      if (String(req.user.id) !== String(userId)) {

        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      const [transactionRows] = await db.execute(
        `SELECT 
        lpt.*,
        rc.reward_name
       FROM loyalty_points_transactions lpt
       LEFT JOIN loyalty_rewards_redemptions lrr ON lpt.reference_id = lrr.id AND lpt.reference_type = 'reward_redemption'
       LEFT JOIN rewards_catalog rc ON lrr.reward_id = rc.id
       WHERE lpt.user_id = ?
       ORDER BY lpt.transaction_date DESC
       LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), parseInt(offset)]
      );

      // Format transactions for response
      const transactions = transactionRows.map((transaction) => ({
        id: transaction.id,
        type: transaction.transaction_type,
        points: transaction.points,
        description: transaction.description,
        date: transaction.transaction_date,
        reference:
          transaction.reward_name || transaction.reference_type || "Service",
        isActive: transaction.is_active,
      }));

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error("Transactions fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// POST /api/loyalty/:userId/award-points - Award points (admin/mechanic function)
router.post(
  "/:userId/award-points",
  authenticateToken,
  [
    body("points").isInt({ min: 1, max: 10000 }),
    body("description").isLength({ min: 1, max: 255 }),
    body("reason")
      .optional()
      .isIn(["service_completion", "referral", "bonus", "adjustment"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid points award data",
          errors: errors.array(),
        });
      }

      // Check if user has permission (admin or mechanic)
      if (!["admin", "mechanic"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      const { userId } = req.params;
      const { points, description, reason = "bonus" } = req.body;

      // Start transaction
      await db.beginTransaction();

      try {
        // Get user's program
        const [programRows] = await db.execute(
          "SELECT * FROM customer_loyalty_programs WHERE user_id = ?",
          [userId]
        );

        let program;
        if (programRows.length === 0) {
          // Create new program if doesn't exist
          const [insertResult] = await db.execute(
            `INSERT INTO customer_loyalty_programs 
             (user_id, tier, total_points, available_points, lifetime_points, total_spent, visit_count, member_since, next_tier_threshold)
             VALUES (?, 'bronze', 0, 0, 0, 0, 0, CURDATE(), 1000)`,
            [userId]
          );

          const [newProgramRows] = await db.execute(
            "SELECT * FROM customer_loyalty_programs WHERE id = ?",
            [insertResult.insertId]
          );
          program = newProgramRows[0];
        } else {
          program = programRows[0];
        }

        // Award points
        await db.execute(
          `UPDATE customer_loyalty_programs 
           SET total_points = total_points + ?, 
               available_points = available_points + ?,
               lifetime_points = lifetime_points + ?,
               last_activity = CURDATE()
           WHERE id = ?`,
          [points, points, points, program.id]
        );

        // Create transaction record
        await db.execute(
          `INSERT INTO loyalty_points_transactions 
           (user_id, program_id, transaction_type, points, description, reference_type)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, program.id, reason, points, description, "manual_award"]
        );

        // Check for tier upgrade
        // This would call the CheckTierUpgrade procedure in a real implementation

        await db.commit();

        res.json({
          success: true,
          message: "Points awarded successfully",
          data: {
            pointsAwarded: points,
            reason,
            description,
          },
        });
      } catch (transactionError) {
        await db.rollback();
        throw transactionError;
      }
    } catch (error) {
      console.error("Points award error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default router;
