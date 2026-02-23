import express from "express";
import { query, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  requireCustomerOwnership,
} from "../middleware/auth.js";
import { asyncHandler, ValidationError } from "../middleware/errorHandler.js";

const router = express.Router();

// Get all users (admin only)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  [
    query("role").optional().isIn(["customer", "admin"]),
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

    const { role, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (role) {
      whereClause += " AND role = ?";
      params.push(role);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get users (excluding password_hash)
    const usersQuery = `
    SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at 
    FROM users 
    ${whereClause} 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
    const users = await executeQuery(usersQuery, [...params, limit, offset]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
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

// Get single user by ID
router.get(
  "/:id",
  authenticateToken,
  requireCustomerOwnership,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await getSingleRecord(
      "SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      throw new ValidationError("User not found");
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

// Update user status (admin only)
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [
    query("isActive")
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
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

    const userId = req.params.id;
    const { isActive } = req.query;

    // Check if user exists
    const existingUser = await getSingleRecord(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (!existingUser) {
      throw new ValidationError("User not found");
    }

    // Update user status
    await executeQuery(
      "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [isActive === "true", userId]
    );

    // Get updated user
    const updatedUser = await getSingleRecord(
      "SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: `User ${
        isActive === "true" ? "activated" : "deactivated"
      } successfully`,
      data: { user: updatedUser },
    });
  })
);

// Get user statistics (admin only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_users,
      SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customer_count,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
      SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
      SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_users
    FROM users
  `);

    // Get recent registrations (last 30 days)
    const recentRegistrations = await executeQuery(`
    SELECT DATE(created_at) as registration_date, COUNT(*) as count
    FROM users
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY registration_date DESC
    LIMIT 30
  `);

    res.json({
      success: true,
      data: {
        stats: stats[0],
        recentRegistrations,
      },
    });
  })
);

// Search users (admin only)
router.get(
  "/search",
  authenticateToken,
  requireAdmin,
  [
    query("q")
      .isLength({ min: 2 })
      .withMessage("Search query must be at least 2 characters long"),
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

    const { q } = req.query;

    const users = await executeQuery(
      `SELECT id, email, first_name, last_name, phone, role, is_active, created_at
     FROM users 
     WHERE email LIKE ? 
        OR first_name LIKE ? 
        OR last_name LIKE ?
     ORDER BY first_name, last_name
     LIMIT 20`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json({
      success: true,
      data: { users },
    });
  })
);

export default router;
