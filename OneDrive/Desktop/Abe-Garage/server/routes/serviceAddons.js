import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Get all add-ons
router.get("/", async (req, res) => {
  try {
    const addons = await query(`
      SELECT * FROM service_addons 
      WHERE is_active = TRUE 
      ORDER BY price ASC
    `);
    res.json(addons);
  } catch (error) {
    console.error("Error fetching add-ons:", error);
    res.status(500).json({ error: "Failed to fetch add-ons" });
  }
});

// Get add-on by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const addons = await query("SELECT * FROM service_addons WHERE id = ?", [
      id,
    ]);

    if (addons.length === 0) {
      return res.status(404).json({ error: "Add-on not found" });
    }

    res.json(addons[0]);
  } catch (error) {
    console.error("Error fetching add-on:", error);
    res.status(500).json({ error: "Failed to fetch add-on" });
  }
});

// Create add-on (admin)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, duration_minutes } = req.body;

    const result = await query(
      `
      INSERT INTO service_addons (name, description, price, duration_minutes)
      VALUES (?, ?, ?, ?)
    `,
      [name, description || "", price, duration_minutes || 15],
    );

    res.status(201).json({
      message: "Add-on created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating add-on:", error);
    res.status(500).json({ error: "Failed to create add-on" });
  }
});

// Update add-on (admin)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration_minutes, is_active } = req.body;

    await query(
      `
      UPDATE service_addons 
      SET name = ?, description = ?, price = ?, duration_minutes = ?, is_active = ?
      WHERE id = ?
    `,
      [
        name,
        description || "",
        price,
        duration_minutes || 15,
        is_active !== undefined ? is_active : true,
        id,
      ],
    );

    res.json({ message: "Add-on updated successfully" });
  } catch (error) {
    console.error("Error updating add-on:", error);
    res.status(500).json({ error: "Failed to update add-on" });
  }
});

// Delete add-on (admin)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM service_addons WHERE id = ?", [id]);
    res.json({ message: "Add-on deleted successfully" });
  } catch (error) {
    console.error("Error deleting add-on:", error);
    res.status(500).json({ error: "Failed to delete add-on" });
  }
});

// Add add-on to appointment
router.post("/:id/add-to-appointment", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_id, quantity } = req.body;

    // Verify add-on exists
    const addons = await query(
      "SELECT * FROM service_addons WHERE id = ? AND is_active = TRUE",
      [id],
    );
    if (addons.length === 0) {
      return res.status(404).json({ error: "Add-on not found" });
    }

    // Verify appointment exists and belongs to user
    const appointments = await query(
      `
      SELECT * FROM appointments 
      WHERE id = ? AND user_id = ?
    `,
      [appointment_id, req.user.id],
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const addon = addons[0];
    const qty = quantity || 1;

    // Add to appointment
    await query(
      `
      INSERT INTO appointment_addons (appointment_id, addon_id, quantity, price_at_booking)
      VALUES (?, ?, ?, ?)
    `,
      [appointment_id, id, qty, addon.price],
    );

    // Update appointment total
    const currentTotal =
      appointments[0].discounted_price || appointments[0].total_price || 0;
    const addonTotal = addon.price * qty;
    await query(
      `
      UPDATE appointments SET discounted_price = ? WHERE id = ?
    `,
      [currentTotal + addonTotal, appointment_id],
    );

    res.status(201).json({
      message: "Add-on added to appointment",
      price_added: addon.price * qty,
    });
  } catch (error) {
    console.error("Error adding add-on:", error);
    res.status(500).json({ error: "Failed to add add-on" });
  }
});

// Remove add-on from appointment
router.delete(
  "/:id/remove-from-appointment/:appointment_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id, appointment_id } = req.params;

      // Get the add-on record
      const addonRecords = await query(
        `
      SELECT * FROM appointment_addons 
      WHERE addon_id = ? AND appointment_id = ?
    `,
        [id, appointment_id],
      );

      if (addonRecords.length === 0) {
        return res
          .status(404)
          .json({ error: "Add-on not found on appointment" });
      }

      const record = addonRecords[0];
      const refundAmount = record.price_at_booking * record.quantity;

      // Remove from appointment
      await query("DELETE FROM appointment_addons WHERE id = ?", [record.id]);

      // Update appointment total
      const appointments = await query(
        "SELECT * FROM appointments WHERE id = ?",
        [appointment_id],
      );
      if (appointments.length > 0) {
        const currentTotal =
          appointments[0].discounted_price || appointments[0].total_price || 0;
        await query(
          `
        UPDATE appointments SET discounted_price = ? WHERE id = ?
      `,
          [Math.max(0, currentTotal - refundAmount), appointment_id],
        );
      }

      res.json({ message: "Add-on removed", refund_amount: refundAmount });
    } catch (error) {
      console.error("Error removing add-on:", error);
      res.status(500).json({ error: "Failed to remove add-on" });
    }
  },
);

// Get appointment add-ons
router.get(
  "/appointment/:appointment_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { appointment_id } = req.params;

      const addons = await query(
        `
      SELECT aa.*, sa.name, sa.description, sa.duration_minutes
      FROM appointment_addons aa
      JOIN service_addons sa ON aa.addon_id = sa.id
      WHERE aa.appointment_id = ?
    `,
        [appointment_id],
      );

      res.json(addons);
    } catch (error) {
      console.error("Error fetching appointment add-ons:", error);
      res.status(500).json({ error: "Failed to fetch add-ons" });
    }
  },
);

export default router;
