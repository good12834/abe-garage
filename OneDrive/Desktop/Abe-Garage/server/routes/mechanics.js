import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validatePositiveNumber,
} from "../middleware/errorHandler.js";

const router = express.Router();

// Get all mechanics (public endpoint for appointment assignment)
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { active } = req.query;

    let query =
      "SELECT id, first_name, last_name, specialties, hourly_rate FROM mechanics";
    const params = [];

    if (active !== undefined) {
      query += " WHERE is_active = ?";
      params.push(active === "true");
    }

    query += " ORDER BY first_name, last_name";

    const mechanics = await executeQuery(query, params);

    res.json({
      success: true,
      data: { mechanics },
    });
  })
);

// Get single mechanic by ID
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const mechanicId = req.params.id;

    const mechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    if (!mechanic) {
      throw new ValidationError("Mechanic not found");
    }

    res.json({
      success: true,
      data: { mechanic },
    });
  })
);

// Create new mechanic (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("firstName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("specialties")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Specialties must not exceed 500 characters"),
    body("hourlyRate")
      .isFloat({ min: 0 })
      .withMessage("Hourly rate must be a positive number"),
    body("hireDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid hire date"),
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
      firstName,
      lastName,
      email,
      phone,
      specialties,
      hourlyRate,
      hireDate,
    } = req.body;

    // Check if email already exists (if provided)
    if (email) {
      const existingMechanic = await getSingleRecord(
        "SELECT id FROM mechanics WHERE email = ?",
        [email]
      );

      if (existingMechanic) {
        throw new ValidationError("Mechanic with this email already exists");
      }
    }

    // Insert new mechanic
    const mechanicId = await executeQuery(
      `INSERT INTO mechanics (first_name, last_name, email, phone, specialties, hourly_rate, hire_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email || null,
        phone || null,
        specialties || null,
        hourlyRate,
        hireDate || null,
      ]
    );

    // Get created mechanic
    const newMechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    res.status(201).json({
      success: true,
      message: "Mechanic created successfully",
      data: { mechanic: newMechanic },
    });
  })
);

// Update mechanic (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("specialties")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Specialties must not exceed 500 characters"),
    body("hourlyRate")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Hourly rate must be a positive number"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
    body("hireDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid hire date"),
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

    const mechanicId = req.params.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      specialties,
      hourlyRate,
      isActive,
      hireDate,
    } = req.body;

    // Check if mechanic exists
    const existingMechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    if (!existingMechanic) {
      throw new ValidationError("Mechanic not found");
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingMechanic.email) {
      const emailExists = await getSingleRecord(
        "SELECT id FROM mechanics WHERE email = ? AND id != ?",
        [email, mechanicId]
      );

      if (emailExists) {
        throw new ValidationError(
          "Another mechanic with this email already exists"
        );
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (firstName !== undefined) {
      updateFields.push("first_name = ?");
      updateValues.push(firstName);
    }

    if (lastName !== undefined) {
      updateFields.push("last_name = ?");
      updateValues.push(lastName);
    }

    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    if (phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }

    if (specialties !== undefined) {
      updateFields.push("specialties = ?");
      updateValues.push(specialties);
    }

    if (hourlyRate !== undefined) {
      validatePositiveNumber(hourlyRate, "hourlyRate");
      updateFields.push("hourly_rate = ?");
      updateValues.push(hourlyRate);
    }

    if (isActive !== undefined) {
      updateFields.push("is_active = ?");
      updateValues.push(isActive);
    }

    if (hireDate !== undefined) {
      updateFields.push("hire_date = ?");
      updateValues.push(hireDate);
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateValues.push(mechanicId);

    // Update mechanic
    await executeQuery(
      `UPDATE mechanics SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated mechanic
    const updatedMechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    res.json({
      success: true,
      message: "Mechanic updated successfully",
      data: { mechanic: updatedMechanic },
    });
  })
);

// Delete mechanic (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const mechanicId = req.params.id;

    // Check if mechanic exists
    const existingMechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    if (!existingMechanic) {
      throw new ValidationError("Mechanic not found");
    }

    // Check if mechanic has active appointments
    const activeAppointments = await executeQuery(
      'SELECT COUNT(*) as count FROM appointments WHERE mechanic_id = ? AND status IN ("approved", "in_service")',
      [mechanicId]
    );

    if (activeAppointments[0].count > 0) {
      // Instead of deleting, mark as inactive
      await executeQuery(
        "UPDATE mechanics SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [mechanicId]
      );

      res.json({
        success: true,
        message: "Mechanic deactivated (has active appointments)",
        data: { deactivated: true },
      });
    } else {
      // Safe to delete
      await executeQuery("DELETE FROM mechanics WHERE id = ?", [mechanicId]);

      res.json({
        success: true,
        message: "Mechanic deleted successfully",
        data: { deleted: true },
      });
    }
  })
);

// Get mechanic workload (admin only)
router.get(
  "/:id/workload",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const mechanicId = req.params.id;

    // Check if mechanic exists
    const mechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ?",
      [mechanicId]
    );

    if (!mechanic) {
      throw new ValidationError("Mechanic not found");
    }

    // Get appointment counts by status
    const workloadStats = await executeQuery(
      `SELECT 
      COUNT(*) as total_appointments,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END) as in_service_count,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
     FROM appointments 
     WHERE mechanic_id = ?`,
      [mechanicId]
    );

    // Get recent appointments
    const recentAppointments = await executeQuery(
      `SELECT a.*, s.name as service_name,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users c ON a.customer_id = c.id
     WHERE a.mechanic_id = ?
     ORDER BY a.appointment_date DESC
     LIMIT 10`,
      [mechanicId]
    );

    res.json({
      success: true,
      data: {
        mechanic,
        workload: workloadStats[0],
        recentAppointments,
      },
    });
  })
);

// Get available mechanics for a specific date/time (for appointment scheduling)
router.get(
  "/available",
  asyncHandler(async (req, res) => {
    const { date, duration = 60 } = req.query;

    if (!date) {
      throw new ValidationError("Date parameter is required");
    }

    // This is a simplified availability check
    // In a real app, you'd check for overlapping appointments
    const availableMechanics = await executeQuery(
      `SELECT id, first_name, last_name, specialties, hourly_rate 
     FROM mechanics 
     WHERE is_active = TRUE
     ORDER BY first_name, last_name`
    );

    res.json({
      success: true,
      data: {
        availableMechanics,
        requestedDate: date,
        duration: parseInt(duration),
      },
    });
  })
);

// Get mechanics with pagination (admin only)
router.get(
  "/admin/list",
  authenticateToken,
  requireAdmin,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search").optional().trim(),
    query("active").optional().isBoolean(),
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const active = req.query.active;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause +=
        " AND (first_name LIKE ? OR last_name LIKE ? OR specialties LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (active !== undefined) {
      whereClause += " AND is_active = ?";
      params.push(active === "true");
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM mechanics ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get mechanics
    const mechanicsQuery = `
    SELECT * FROM mechanics 
    ${whereClause} 
    ORDER BY first_name, last_name 
    LIMIT ? OFFSET ?
  `;
    const mechanics = await executeQuery(mechanicsQuery, [
      ...params,
      limit,
      offset,
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        mechanics,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  })
);

export default router;
