import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  requireAdminOrMechanic,
} from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validatePositiveNumber,
} from "../middleware/errorHandler.js";
import { emitLowStockAlert } from "../services/socket.js";

const router = express.Router();

// Get all parts (admin/mechanic) with filtering and pagination
router.get(
  "/",
  authenticateToken,
  requireAdminOrMechanic,
  [
    query("category").optional().trim().isLength({ min: 1 }),
    query("search").optional().trim().isLength({ min: 1 }),
    query("lowStock").optional().isBoolean(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const {
      category,
      search,
      lowStock,
      page = 1,
      limit = 20,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }

    if (search) {
      whereClause += " AND (name LIKE ? OR part_number LIKE ? OR description LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (lowStock === "true") {
      whereClause += " AND stock_quantity <= min_stock_level";
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM parts ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get parts
    const partsQuery = `
      SELECT * FROM parts 
      ${whereClause}
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `;

    const parts = await executeQuery(partsQuery, [...params, limit, offset]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        parts,
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

// Get single part by ID
router.get(
  "/:id",
  authenticateToken,
  requireAdminOrMechanic,
  [param("id").isInt({ min: 1 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const partId = req.params.id;
    const part = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    if (!part) {
      throw new ValidationError("Part not found");
    }

    res.json({
      success: true,
      data: { part },
    });
  })
);

// Create new part (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Part name is required"),
    body("partNumber").trim().isLength({ min: 1 }).withMessage("Part number is required"),
    body("category").trim().isLength({ min: 1 }).withMessage("Category is required"),
    body("unitPrice").isFloat({ min: 0 }).withMessage("Valid unit price is required"),
    body("stockQuantity").isInt({ min: 0 }).withMessage("Valid stock quantity is required"),
    body("minStockLevel").optional().isInt({ min: 0 }).withMessage("Valid minimum stock level required"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const {
      name,
      partNumber,
      description,
      category,
      brand,
      model,
      unitPrice,
      costPrice,
      stockQuantity,
      minStockLevel = 5,
      supplier,
      supplierContact,
      location,
    } = req.body;

    // Check if part number already exists
    const existingPart = await getSingleRecord(
      "SELECT id FROM parts WHERE part_number = ?",
      [partNumber]
    );

    if (existingPart) {
      throw new ValidationError("Part number already exists");
    }

    const partId = await executeQuery(
      `INSERT INTO parts 
      (name, description, part_number, category, brand, model, unit_price, cost_price, 
       stock_quantity, min_stock_level, supplier, supplier_contact, location) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        partNumber,
        category,
        brand || null,
        model || null,
        unitPrice,
        costPrice || null,
        stockQuantity,
        minStockLevel,
        supplier || null,
        supplierContact || null,
        location || null,
      ]
    );

    const newPart = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    res.status(201).json({
      success: true,
      message: "Part created successfully",
      data: { part: newPart },
    });
  })
);

// Update part (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("name").optional().trim().isLength({ min: 2 }),
    body("partNumber").optional().trim().isLength({ min: 1 }),
    body("category").optional().trim().isLength({ min: 1 }),
    body("unitPrice").optional().isFloat({ min: 0 }),
    body("stockQuantity").optional().isInt({ min: 0 }),
    body("minStockLevel").optional().isInt({ min: 0 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const partId = req.params.id;
    const updateFields = [];
    const updateValues = [];

    // Check if part exists
    const existingPart = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    if (!existingPart) {
      throw new ValidationError("Part not found");
    }

    const allowedFields = [
      "name", "description", "part_number", "category", "brand", "model",
      "unit_price", "cost_price", "stock_quantity", "min_stock_level",
      "supplier", "supplier_contact", "location", "is_active"
    ];

    // Build dynamic update query
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        updateFields.push(`${dbField} = ?`);
        updateValues.push(req.body[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(partId);

    await executeQuery(
      `UPDATE parts SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Check for low stock alert
    if (req.body.stockQuantity !== undefined || req.body.minStockLevel !== undefined) {
      const updatedPart = await getSingleRecord(
        "SELECT * FROM parts WHERE id = ?",
        [partId]
      );

      if (updatedPart.stock_quantity <= updatedPart.min_stock_level) {
        emitLowStockAlert(updatedPart.name, updatedPart.stock_quantity);
      }
    }

    const updatedPart = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    res.json({
      success: true,
      message: "Part updated successfully",
      data: { part: updatedPart },
    });
  })
);

// Update part stock (admin/mechanic)
router.patch(
  "/:id/stock",
  authenticateToken,
  requireAdminOrMechanic,
  [
    param("id").isInt({ min: 1 }),
    body("quantityChange").isInt().withMessage("Valid quantity change is required"),
    body("reason").optional().trim().isLength({ max: 255 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const partId = req.params.id;
    const { quantityChange, reason } = req.body;

    // Check if part exists
    const part = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    if (!part) {
      throw new ValidationError("Part not found");
    }

    const newStock = part.stock_quantity + quantityChange;

    if (newStock < 0) {
      throw new ValidationError("Stock quantity cannot be negative");
    }

    // Update stock
    await executeQuery(
      "UPDATE parts SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newStock, partId]
    );

    // Check for low stock alert
    if (newStock <= part.min_stock_level) {
      emitLowStockAlert(part.name, newStock);
    }

    const updatedPart = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    res.json({
      success: true,
      message: `Stock updated successfully. ${quantityChange > 0 ? 'Added' : 'Removed'} ${Math.abs(quantityChange)} units`,
      data: { 
        part: updatedPart,
        previousStock: part.stock_quantity,
        newStock,
        change: quantityChange,
        reason: reason || null
      },
    });
  })
);

// Delete part (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  [param("id").isInt({ min: 1 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors.array().map((err) => err.msg).join(", ")
      );
    }

    const partId = req.params.id;

    // Check if part exists
    const part = await getSingleRecord(
      "SELECT * FROM parts WHERE id = ?",
      [partId]
    );

    if (!part) {
      throw new ValidationError("Part not found");
    }

    // Check if part is used in any invoices (prevent deletion if in use)
    const usedInInvoices = await getSingleRecord(
      `SELECT COUNT(*) as count 
       FROM invoice_items ii 
       JOIN invoices i ON ii.invoice_id = i.id 
       WHERE ii.description LIKE ?`,
      [`%${part.part_number}%`]
    );

    if (usedInInvoices.count > 0) {
      // Instead of deleting, mark as inactive
      await executeQuery(
        "UPDATE parts SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [partId]
      );

      res.json({
        success: true,
        message: "Part marked as inactive (cannot delete as it's used in invoices)",
      });
    } else {
      // Safe to delete
      await executeQuery("DELETE FROM parts WHERE id = ?", [partId]);

      res.json({
        success: true,
        message: "Part deleted successfully",
      });
    }
  })
);

// Get parts categories
router.get(
  "/categories",
  authenticateToken,
  requireAdminOrMechanic,
  asyncHandler(async (req, res) => {
    const categories = await executeQuery(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM parts 
      WHERE is_active = TRUE AND category IS NOT NULL
      GROUP BY category
      ORDER BY category
    `);

    res.json({
      success: true,
      data: { categories },
    });
  })
);

// Get low stock alerts
router.get(
  "/alerts/low-stock",
  authenticateToken,
  requireAdminOrMechanic,
  asyncHandler(async (req, res) => {
    const lowStockParts = await executeQuery(`
      SELECT 
        id,
        name,
        part_number,
        category,
        stock_quantity,
        min_stock_level,
        (min_stock_level - stock_quantity) as shortage_amount,
        unit_price,
        supplier,
        location,
        updated_at
      FROM parts 
      WHERE stock_quantity <= min_stock_level 
      AND is_active = TRUE
      ORDER BY shortage_amount DESC, updated_at DESC
    `);

    res.json({
      success: true,
      data: { lowStockParts },
    });
  })
);

// Get inventory summary
router.get(
  "/summary",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const summary = await executeQuery(`
      SELECT 
        COUNT(*) as total_parts,
        COUNT(CASE WHEN stock_quantity <= min_stock_level THEN 1 END) as low_stock_count,
        SUM(stock_quantity * unit_price) as total_inventory_value,
        SUM(CASE 
          WHEN stock_quantity <= min_stock_level 
          THEN (min_stock_level - stock_quantity) * unit_price 
          ELSE 0 
        END) as shortage_value,
        COUNT(DISTINCT category) as total_categories,
        AVG(unit_price) as average_price
      FROM parts 
      WHERE is_active = TRUE
    `);

    const categoryBreakdown = await executeQuery(`
      SELECT 
        category,
        COUNT(*) as part_count,
        SUM(stock_quantity) as total_stock,
        SUM(stock_quantity * unit_price) as category_value
      FROM parts 
      WHERE is_active = TRUE
      AND category IS NOT NULL
      GROUP BY category
      ORDER BY category_value DESC
    `);

    res.json({
      success: true,
      data: {
        summary: summary[0],
        categoryBreakdown,
      },
    });
  })
);

export default router;