import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Get all active recalls (public)
router.get("/", async (req, res) => {
  try {
    const { manufacturer, severity } = req.query;
    let sql = `
      SELECT * FROM vehicle_recalls 
      WHERE is_active = TRUE
    `;

    if (manufacturer) {
      sql += ` AND manufacturer LIKE '%${manufacturer}%'`;
    }
    if (severity) {
      sql += ` AND severity = '${severity}'`;
    }

    sql +=
      " ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low'), created_at DESC";

    const recalls = await query(sql);
    res.json(recalls);
  } catch (error) {
    console.error("Error fetching recalls:", error);
    res.status(500).json({ error: "Failed to fetch recalls" });
  }
});

// Check recalls for specific vehicle
router.post("/check", async (req, res) => {
  try {
    const { manufacturer, model, year } = req.body;

    const recalls = await query(
      `
      SELECT * FROM vehicle_recalls 
      WHERE is_active = TRUE
      AND manufacturer LIKE ?
      AND model LIKE ?
      AND (year_start IS NULL OR year_start <= ?)
      AND (year_end IS NULL OR year_end >= ?)
    `,
      [`%${manufacturer}%`, `%${model}%`, year, year],
    );

    res.json({
      vehicle: { manufacturer, model, year },
      recalls_found: recalls.length,
      recalls: recalls,
    });
  } catch (error) {
    console.error("Error checking recalls:", error);
    res.status(500).json({ error: "Failed to check recalls" });
  }
});

// Get single recall
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const recalls = await query("SELECT * FROM vehicle_recalls WHERE id = ?", [
      id,
    ]);

    if (recalls.length === 0) {
      return res.status(404).json({ error: "Recall not found" });
    }

    res.json(recalls[0]);
  } catch (error) {
    console.error("Error fetching recall:", error);
    res.status(500).json({ error: "Failed to fetch recall" });
  }
});

// Get user's vehicle recalls
router.get("/my-vehicles", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const recalls = await query(
      `
      SELECT cvr.*, vr.*, v.make, v.model, v.year, v.license_plate
      FROM customer_vehicle_recalls cvr
      JOIN vehicle_recalls vr ON cvr.recall_id = vr.id
      JOIN vehicles v ON cvr.vehicle_id = v.id
      WHERE cvr.user_id = ?
      ORDER BY FIELD(vr.severity, 'critical', 'high', 'medium', 'low'), cvr.created_at DESC
    `,
      [userId],
    );

    // Group by vehicle
    const grouped = recalls.reduce((acc, recall) => {
      const vehicleKey = `${recall.vehicle_id}`;
      if (!acc[vehicleKey]) {
        acc[vehicleKey] = {
          vehicle: {
            id: recall.vehicle_id,
            make: recall.make,
            model: recall.model,
            year: recall.year,
            license_plate: recall.license_plate,
          },
          recalls: [],
        };
      }
      acc[vehicleKey].recalls.push(recall);
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("Error fetching user's vehicle recalls:", error);
    res.status(500).json({ error: "Failed to fetch recalls" });
  }
});

// Acknowledge a recall
router.post("/:id/acknowledge", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle_id } = req.body;
    const { id: recall_id } = req.params;

    const existing = await query(
      `
      SELECT * FROM customer_vehicle_recalls 
      WHERE user_id = ? AND vehicle_id = ? AND recall_id = ?
    `,
      [userId, vehicle_id, recall_id],
    );

    if (existing.length > 0) {
      await query(
        `
        UPDATE customer_vehicle_recalls SET status = 'acknowledged' 
        WHERE id = ?
      `,
        [existing[0].id],
      );

      res.json({ message: "Recall acknowledged successfully" });
    } else {
      await query(
        `
        INSERT INTO customer_vehicle_recalls (user_id, vehicle_id, recall_id, status)
        VALUES (?, ?, ?, 'acknowledged')
      `,
        [userId, vehicle_id, recall_id],
      );

      res.json({ message: "Recall acknowledged and tracked" });
    }
  } catch (error) {
    console.error("Error acknowledging recall:", error);
    res.status(500).json({ error: "Failed to acknowledge recall" });
  }
});

// Schedule recall repair
router.post("/:id/schedule", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle_id, preferred_date } = req.body;
    const { id: recall_id } = req.params;

    const existing = await query(
      `
      SELECT * FROM customer_vehicle_recalls 
      WHERE user_id = ? AND vehicle_id = ? AND recall_id = ?
    `,
      [userId, vehicle_id, recall_id],
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ error: "Customer recall record not found" });
    }

    await query(
      `
      UPDATE customer_vehicle_recalls 
      SET status = 'scheduled', scheduled_date = ?
      WHERE id = ?
    `,
      [preferred_date, existing[0].id],
    );

    // Optionally create appointment
    res.json({
      message: "Recall repair scheduled successfully",
      scheduled_date: preferred_date,
    });
  } catch (error) {
    console.error("Error scheduling recall repair:", error);
    res.status(500).json({ error: "Failed to schedule recall repair" });
  }
});

// Mark recall as completed
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle_id, notes } = req.body;
    const { id: recall_id } = req.params;

    await query(
      `
      UPDATE customer_vehicle_recalls 
      SET status = 'completed', completed_date = NOW(), notes = ?
      WHERE user_id = ? AND vehicle_id = ? AND recall_id = ?
    `,
      [notes || "", userId, vehicle_id, recall_id],
    );

    res.json({ message: "Recall marked as completed" });
  } catch (error) {
    console.error("Error completing recall:", error);
    res.status(500).json({ error: "Failed to complete recall" });
  }
});

// Admin: Create recall (admin)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      manufacturer,
      model,
      year_start,
      year_end,
      recall_number,
      description,
      severity,
      remedy,
      NHTSA_url,
    } = req.body;

    const result = await query(
      `
      INSERT INTO vehicle_recalls 
      (manufacturer, model, year_start, year_end, recall_number, description, severity, remedy, NHTSA_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        manufacturer,
        model,
        year_start || null,
        year_end || null,
        recall_number,
        description,
        severity || "medium",
        remedy || null,
        NHTSA_url || null,
      ],
    );

    res.status(201).json({
      message: "Recall created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating recall:", error);
    res.status(500).json({ error: "Failed to create recall" });
  }
});

// Admin: Update recall (admin)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      manufacturer,
      model,
      year_start,
      year_end,
      recall_number,
      description,
      severity,
      remedy,
      NHTSA_url,
      is_active,
    } = req.body;

    await query(
      `
      UPDATE vehicle_recalls 
      SET manufacturer = ?, model = ?, year_start = ?, year_end = ?,
          recall_number = ?, description = ?, severity = ?, remedy = ?,
          NHTSA_url = ?, is_active = ?
      WHERE id = ?
    `,
      [
        manufacturer,
        model,
        year_start || null,
        year_end || null,
        recall_number,
        description,
        severity || "medium",
        remedy || null,
        NHTSA_url || null,
        is_active !== undefined ? is_active : true,
        id,
      ],
    );

    res.json({ message: "Recall updated successfully" });
  } catch (error) {
    console.error("Error updating recall:", error);
    res.status(500).json({ error: "Failed to update recall" });
  }
});

// Admin: Get all recalls
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    const { active, severity } = req.query;
    let sql = "SELECT * FROM vehicle_recalls WHERE 1=1";

    if (active === "true") {
      sql += " AND is_active = TRUE";
    }
    if (severity) {
      sql += ` AND severity = '${severity}'`;
    }

    sql +=
      " ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low'), created_at DESC";

    const recalls = await query(sql);
    res.json(recalls);
  } catch (error) {
    console.error("Error fetching all recalls:", error);
    res.status(500).json({ error: "Failed to fetch recalls" });
  }
});

export default router;
