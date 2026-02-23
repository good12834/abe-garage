import express from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Get all service packages
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    let sql = `
      SELECT sp.*, 
        GROUP_CONCAT(spi.service_id) as service_ids,
        GROUP_CONCAT(s.name ORDER BY spi.id) as service_names
      FROM service_packages sp
      LEFT JOIN service_package_items spi ON sp.id = spi.package_id
      LEFT JOIN services s ON spi.service_id = s.id
    `;

    if (active === "true") {
      sql += " WHERE sp.is_active = TRUE";
      sql += " AND (sp.valid_from IS NULL OR sp.valid_from <= CURDATE())";
      sql += " AND (sp.valid_until IS NULL OR sp.valid_until >= CURDATE())";
      sql += " AND (sp.max_uses IS NULL OR sp.current_uses < sp.max_uses)";
    }

    sql += " GROUP BY sp.id ORDER BY sp.created_at DESC";

    const packages = await query(sql);

    // Parse service_ids and service_names
    const formattedPackages = packages.map((pkg) => ({
      ...pkg,
      service_ids: pkg.service_ids
        ? pkg.service_ids.split(",").map(Number)
        : [],
      service_names: pkg.service_names ? pkg.service_names.split(",") : [],
    }));

    res.json(formattedPackages);
  } catch (error) {
    console.error("Error fetching service packages:", error);
    res.status(500).json({ error: "Failed to fetch service packages" });
  }
});

// Get single service package
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const packages = await query(
      `
      SELECT sp.*, 
        GROUP_CONCAT(spi.service_id) as service_ids,
        GROUP_CONCAT(s.name ORDER BY spi.id) as service_names
      FROM service_packages sp
      LEFT JOIN service_package_items spi ON sp.id = spi.package_id
      LEFT JOIN services s ON spi.service_id = s.id
      WHERE sp.id = ?
      GROUP BY sp.id
    `,
      [id],
    );

    if (packages.length === 0) {
      return res.status(404).json({ error: "Service package not found" });
    }

    const pkg = packages[0];
    const packageItems = await query(
      `
      SELECT spi.*, s.name as service_name, s.price as service_price
      FROM service_package_items spi
      JOIN services s ON spi.service_id = s.id
      WHERE spi.package_id = ?
    `,
      [id],
    );

    // Calculate total value
    const totalValue = packageItems.reduce(
      (sum, item) => sum + item.service_price * item.quantity,
      0,
    );
    const discount =
      pkg.discount_percentage > 0
        ? totalValue * (pkg.discount_percentage / 100)
        : pkg.discount_amount;
    const finalPrice = totalValue - discount;

    res.json({
      ...pkg,
      service_ids: pkg.service_ids
        ? pkg.service_ids.split(",").map(Number)
        : [],
      service_names: pkg.service_names ? pkg.service_names.split(",") : [],
      items: packageItems,
      total_value: totalValue,
      discount_amount: discount,
      final_price: finalPrice,
    });
  } catch (error) {
    console.error("Error fetching service package:", error);
    res.status(500).json({ error: "Failed to fetch service package" });
  }
});

// Create service package (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      discount_percentage,
      discount_amount,
      valid_from,
      valid_until,
      max_uses,
      services,
    } = req.body;

    const result = await query(
      `
      INSERT INTO service_packages (name, description, discount_percentage, discount_amount, valid_from, valid_until, max_uses)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        description,
        discount_percentage || 0,
        discount_amount || 0,
        valid_from || null,
        valid_until || null,
        max_uses || null,
      ],
    );

    const packageId = result.insertId;

    // Add services to package
    if (services && services.length > 0) {
      for (const service of services) {
        await query(
          `
          INSERT INTO service_package_items (package_id, service_id, quantity)
          VALUES (?, ?, ?)
        `,
          [packageId, service.service_id, service.quantity || 1],
        );
      }
    }

    res.status(201).json({
      message: "Service package created successfully",
      id: packageId,
    });
  } catch (error) {
    console.error("Error creating service package:", error);
    res.status(500).json({ error: "Failed to create service package" });
  }
});

// Update service package (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      discount_percentage,
      discount_amount,
      valid_from,
      valid_until,
      max_uses,
      is_active,
      services,
    } = req.body;

    await query(
      `
      UPDATE service_packages 
      SET name = ?, description = ?, discount_percentage = ?, discount_amount = ?,
          valid_from = ?, valid_until = ?, max_uses = ?, is_active = ?
      WHERE id = ?
    `,
      [
        name,
        description,
        discount_percentage || 0,
        discount_amount || 0,
        valid_from || null,
        valid_until || null,
        max_uses || null,
        is_active !== undefined ? is_active : true,
        id,
      ],
    );

    // Update services if provided
    if (services && services.length > 0) {
      // Remove existing items
      await query("DELETE FROM service_package_items WHERE package_id = ?", [
        id,
      ]);

      // Add new items
      for (const service of services) {
        await query(
          `
          INSERT INTO service_package_items (package_id, service_id, quantity)
          VALUES (?, ?, ?)
        `,
          [id, service.service_id, service.quantity || 1],
        );
      }
    }

    res.json({ message: "Service package updated successfully" });
  } catch (error) {
    console.error("Error updating service package:", error);
    res.status(500).json({ error: "Failed to update service package" });
  }
});

// Delete service package (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await query("DELETE FROM service_package_items WHERE package_id = ?", [id]);
    await query("DELETE FROM service_packages WHERE id = ?", [id]);

    res.json({ message: "Service package deleted successfully" });
  } catch (error) {
    console.error("Error deleting service package:", error);
    res.status(500).json({ error: "Failed to delete service package" });
  }
});

// Apply service package to appointment
router.post("/:id/apply", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_id } = req.body;

    // Get package details
    const packages = await query(
      `
      SELECT sp.*, 
        GROUP_CONCAT(spi.service_id) as service_ids
      FROM service_packages sp
      LEFT JOIN service_package_items spi ON sp.id = spi.package_id
      WHERE sp.id = ? AND sp.is_active = TRUE
      GROUP BY sp.id
    `,
      [id],
    );

    if (packages.length === 0) {
      return res
        .status(404)
        .json({ error: "Service package not found or inactive" });
    }

    const pkg = packages[0];

    // Check validity
    if (pkg.valid_from && new Date(pkg.valid_from) > new Date()) {
      return res
        .status(400)
        .json({ error: "Service package is not yet valid" });
    }
    if (pkg.valid_until && new Date(pkg.valid_until) < new Date()) {
      return res.status(400).json({ error: "Service package has expired" });
    }
    if (pkg.max_uses && pkg.current_uses >= pkg.max_uses) {
      return res
        .status(400)
        .json({ error: "Service package has reached maximum uses" });
    }

    // Check if appointment has the required services
    const appointment = await query("SELECT * FROM appointments WHERE id = ?", [
      appointment_id,
    ]);
    if (appointment.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify services match
    const requiredServices = pkg.service_ids.split(",").map(Number);
    if (!requiredServices.includes(appointment[0].service_id)) {
      return res.status(400).json({
        error:
          "Appointment does not have the required service for this package",
      });
    }

    // Calculate discount
    const service = await query("SELECT price FROM services WHERE id = ?", [
      appointment[0].service_id,
    ]);
    const originalPrice = service[0]?.price || 0;
    const discount =
      pkg.discount_percentage > 0
        ? originalPrice * (pkg.discount_percentage / 100)
        : pkg.discount_amount;
    const finalPrice = Math.max(0, originalPrice - discount);

    // Update appointment with package discount
    await query(
      `
      UPDATE appointments 
      SET service_package_id = ?, original_price = ?, discounted_price = ?
      WHERE id = ?
    `,
      [id, originalPrice, finalPrice, appointment_id],
    );

    // Increment package usage
    await query(
      "UPDATE service_packages SET current_uses = current_uses + 1 WHERE id = ?",
      [id],
    );

    res.json({
      message: "Service package applied successfully",
      original_price: originalPrice,
      discount_amount: discount,
      final_price: finalPrice,
    });
  } catch (error) {
    console.error("Error applying service package:", error);
    res.status(500).json({ error: "Failed to apply service package" });
  }
});

export default router;
