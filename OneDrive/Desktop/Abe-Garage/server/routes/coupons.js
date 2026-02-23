import express from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Get all coupons (admin)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { active, valid } = req.query;
    let sql = "SELECT * FROM coupons WHERE 1=1";

    if (active === "true") {
      sql += " AND is_active = TRUE";
    }
    if (valid === "true") {
      sql += " AND is_active = TRUE";
      sql += " AND (valid_from IS NULL OR valid_from <= NOW())";
      sql += " AND (valid_until IS NULL OR valid_until >= NOW())";
      sql += " AND (max_uses IS NULL OR current_uses < max_uses)";
    }

    sql += " ORDER BY created_at DESC";

    const coupons = await query(sql);
    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// Validate coupon code
router.post("/validate", async (req, res) => {
  try {
    const { code, order_amount } = req.body;

    const coupons = await query(
      `
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = TRUE
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until >= NOW())
      AND (max_uses IS NULL OR current_uses < max_uses)
    `,
      [code],
    );

    if (coupons.length === 0) {
      return res.status(404).json({
        valid: false,
        error: "Coupon not found, expired, or no longer available",
      });
    }

    const coupon = coupons[0];

    // Check minimum order amount
    if (coupon.min_order_amount && order_amount < coupon.min_order_amount) {
      return res.status(400).json({
        valid: false,
        error: `Minimum order amount of $${coupon.min_order_amount} required`,
      });
    }

    // Calculate discount
    let discount;
    if (coupon.discount_type === "percentage") {
      discount = order_amount * (coupon.discount_value / 100);
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = Math.min(coupon.discount_value, order_amount);
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        calculated_discount: discount,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

// Get single coupon (admin)
router.get("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const coupons = await query("SELECT * FROM coupons WHERE id = ?", [id]);

    if (coupons.length === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json(coupons[0]);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
});

// Create coupon (admin)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      valid_from,
      valid_until,
      max_uses,
      usage_per_user,
    } = req.body;

    // Check if code already exists
    const existing = await query("SELECT id FROM coupons WHERE code = ?", [
      code,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    const result = await query(
      `
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, max_uses, usage_per_user)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        code.toUpperCase(),
        description,
        discount_type || "percentage",
        discount_value,
        min_order_amount || 0,
        max_discount_amount || null,
        valid_from || null,
        valid_until || null,
        max_uses || null,
        usage_per_user || 1,
      ],
    );

    res.status(201).json({
      message: "Coupon created successfully",
      id: result.insertId,
      code: code.toUpperCase(),
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// Update coupon (admin)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      valid_from,
      valid_until,
      max_uses,
      usage_per_user,
      is_active,
    } = req.body;

    await query(
      `
      UPDATE coupons 
      SET description = ?, discount_type = ?, discount_value = ?, 
          min_order_amount = ?, max_discount_amount = ?,
          valid_from = ?, valid_until = ?, max_uses = ?, 
          usage_per_user = ?, is_active = ?
      WHERE id = ?
    `,
      [
        description,
        discount_type || "percentage",
        discount_value,
        min_order_amount || 0,
        max_discount_amount || null,
        valid_from || null,
        valid_until || null,
        max_uses || null,
        usage_per_user || 1,
        is_active !== undefined ? is_active : true,
        id,
      ],
    );

    res.json({ message: "Coupon updated successfully" });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// Delete coupon (admin)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM coupons WHERE id = ?", [id]);
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

// Use coupon (record usage)
router.post("/:id/use", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { order_amount } = req.body;
    const userId = req.user.id;

    // Check if coupon exists and is valid
    const coupons = await query(
      `
      SELECT * FROM coupons 
      WHERE id = ? AND is_active = TRUE
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until >= NOW())
    `,
      [id],
    );

    if (coupons.length === 0) {
      return res
        .status(404)
        .json({ error: "Coupon not found or no longer valid" });
    }

    const coupon = coupons[0];

    // Check max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return res.status(400).json({ error: "Coupon has reached maximum uses" });
    }

    // Check user's usage
    const userUsage = await query(
      `
      SELECT COUNT(*) as count FROM coupon_usage 
      WHERE coupon_id = ? AND user_id = ?
    `,
      [id, userId],
    );

    if (userUsage[0].count >= coupon.usage_per_user) {
      return res.status(400).json({
        error: "You have already used this coupon the maximum number of times",
      });
    }

    // Record usage
    await query(
      `
      INSERT INTO coupon_usage (coupon_id, user_id, order_amount, discount_given)
      VALUES (?, ?, ?, ?)
    `,
      [id, userId, order_amount, 0],
    ); // discount will be calculated separately

    // Increment usage count
    await query(
      "UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?",
      [id],
    );

    res.json({ message: "Coupon used successfully" });
  } catch (error) {
    console.error("Error using coupon:", error);
    res.status(500).json({ error: "Failed to use coupon" });
  }
});

// Get coupon usage stats (admin)
router.get("/:id/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await query("SELECT * FROM coupons WHERE id = ?", [id]);
    if (coupon.length === 0) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    const usage = await query(
      `
      SELECT cu.*, u.email, u.first_name, u.last_name
      FROM coupon_usage cu
      JOIN users u ON cu.user_id = u.id
      WHERE cu.coupon_id = ?
      ORDER BY cu.used_at DESC
    `,
      [id],
    );

    const totalDiscount = await query(
      `
      SELECT SUM(discount_given) as total FROM coupon_usage WHERE coupon_id = ?
    `,
      [id],
    );

    res.json({
      coupon: coupon[0],
      usage_count: usage.length,
      total_discount: totalDiscount[0]?.total || 0,
      usage_history: usage,
    });
  } catch (error) {
    console.error("Error fetching coupon stats:", error);
    res.status(500).json({ error: "Failed to fetch coupon stats" });
  }
});

export default router;
