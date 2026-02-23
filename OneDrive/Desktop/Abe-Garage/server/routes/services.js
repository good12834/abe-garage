import express from "express";
import { body, query, validationResult } from "express-validator";
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

// Get all services (public endpoint)
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { category, active } = req.query;

    let query = "SELECT * FROM services";
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    if (active !== undefined) {
      conditions.push("is_active = ?");
      params.push(active === "true");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY category, name";

    const services = await executeQuery(query, params);

    res.json({
      success: true,
      data: { services },
    });
  })
);

// Get single service by ID
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const serviceId = req.params.id;

    const service = await getSingleRecord(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (!service) {
      throw new ValidationError("Service not found");
    }

    res.json({
      success: true,
      data: { service },
    });
  })
);

// Create new service (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Service name must be at least 2 characters long"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
    body("basePrice")
      .isFloat({ min: 0 })
      .withMessage("Base price must be a positive number"),
    body("durationMinutes")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("category")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Category must not exceed 100 characters"),
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
      name,
      description,
      basePrice,
      durationMinutes = 60,
      category,
    } = req.body;

    // Validate base price
    validatePositiveNumber(basePrice, "basePrice");
    if (durationMinutes && durationMinutes < 1) {
      throw new ValidationError("Duration must be at least 1 minute");
    }

    // Insert new service
    const serviceId = await executeQuery(
      `INSERT INTO services (name, description, base_price, duration_minutes, category) 
     VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, basePrice, durationMinutes, category || null]
    );

    // Get created service
    const newService = await getSingleRecord(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: { service: newService },
    });
  })
);

// Update service (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Service name must be at least 2 characters long"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
    body("basePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Base price must be a positive number"),
    body("durationMinutes")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
    body("category")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Category must not exceed 100 characters"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
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

    const serviceId = req.params.id;
    const {
      name,
      description,
      basePrice,
      durationMinutes,
      category,
      isActive,
    } = req.body;

    // Check if service exists
    const existingService = await getSingleRecord(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (!existingService) {
      throw new ValidationError("Service not found");
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }

    if (basePrice !== undefined) {
      validatePositiveNumber(basePrice, "basePrice");
      updateFields.push("base_price = ?");
      updateValues.push(basePrice);
    }

    if (durationMinutes !== undefined) {
      if (durationMinutes < 1) {
        throw new ValidationError("Duration must be at least 1 minute");
      }
      updateFields.push("duration_minutes = ?");
      updateValues.push(durationMinutes);
    }

    if (category !== undefined) {
      updateFields.push("category = ?");
      updateValues.push(category);
    }

    if (isActive !== undefined) {
      updateFields.push("is_active = ?");
      updateValues.push(isActive);
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateValues.push(serviceId);

    // Update service
    await executeQuery(
      `UPDATE services SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated service
    const updatedService = await getSingleRecord(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    res.json({
      success: true,
      message: "Service updated successfully",
      data: { service: updatedService },
    });
  })
);

// Delete service (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const serviceId = req.params.id;

    // Check if service exists
    const existingService = await getSingleRecord(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (!existingService) {
      throw new ValidationError("Service not found");
    }

    // Check if service is being used in appointments
    const appointmentsCount = await executeQuery(
      "SELECT COUNT(*) as count FROM appointments WHERE service_id = ?",
      [serviceId]
    );

    if (appointmentsCount[0].count > 0) {
      // Instead of deleting, mark as inactive
      await executeQuery(
        "UPDATE services SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [serviceId]
      );

      res.json({
        success: true,
        message: "Service deactivated (has existing appointments)",
        data: { deactivated: true },
      });
    } else {
      // Safe to delete
      await executeQuery("DELETE FROM services WHERE id = ?", [serviceId]);

      res.json({
        success: true,
        message: "Service deleted successfully",
        data: { deleted: true },
      });
    }
  })
);

// Get service categories
router.get(
  "/categories/list",
  asyncHandler(async (req, res) => {
    const categories = await executeQuery(
      "SELECT DISTINCT category FROM services WHERE category IS NOT NULL ORDER BY category"
    );

    const categoryList = categories.map((cat) => cat.category);

    res.json({
      success: true,
      data: { categories: categoryList },
    });
  })
);

// Get services with pagination
router.get(
  "/pagination",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("category").optional().trim(),
    query("search").optional().trim(),
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
    const category = req.query.category;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }

    if (search) {
      whereClause += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM services ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get services
    const servicesQuery = `
    SELECT * FROM services 
    ${whereClause} 
    ORDER BY category, name 
    LIMIT ? OFFSET ?
  `;
    const services = await executeQuery(servicesQuery, [
      ...params,
      limit,
      offset,
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        services,
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
