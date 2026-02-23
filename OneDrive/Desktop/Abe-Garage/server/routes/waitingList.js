import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Join waiting list
router.post("/join", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferred_date, preferred_time, service_id, vehicle_id, priority } =
      req.body;

    // Check if already on waiting list for same date/service
    const existing = await query(
      `
      SELECT * FROM waiting_list 
      WHERE user_id = ? AND preferred_date = ? AND service_id = ? AND status = 'waiting'
    `,
      [userId, preferred_date, service_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "You're already on the waiting list for this date and service",
      });
    }

    const result = await query(
      `
      INSERT INTO waiting_list 
      (user_id, preferred_date, preferred_time, service_id, vehicle_id, priority, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `,
      [
        userId,
        preferred_date,
        preferred_time || null,
        service_id,
        vehicle_id || null,
        priority || 5,
      ],
    );

    res.status(201).json({
      message: "Added to waiting list successfully",
      waiting_list_id: result.insertId,
    });
  } catch (error) {
    console.error("Error joining waiting list:", error);
    res.status(500).json({ error: "Failed to join waiting list" });
  }
});

// Get user's waiting list entries
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const entries = await query(
      `
      SELECT wl.*, s.name as service_name, s.price as service_price,
        v.make, v.model, v.year, v.license_plate
      FROM waiting_list wl
      JOIN services s ON wl.service_id = s.id
      LEFT JOIN vehicles v ON wl.vehicle_id = v.id
      WHERE wl.user_id = ? AND wl.status IN ('waiting', 'notified')
      ORDER BY wl.created_at DESC
    `,
      [userId],
    );

    res.json(entries);
  } catch (error) {
    console.error("Error fetching waiting list:", error);
    res.status(500).json({ error: "Failed to fetch waiting list" });
  }
});

// Cancel waiting list entry
router.post("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query(
      `
      UPDATE waiting_list SET status = 'cancelled' 
      WHERE id = ? AND user_id = ? AND status = 'waiting'
    `,
      [id, userId],
    );

    res.json({ message: "Waiting list entry cancelled" });
  } catch (error) {
    console.error("Error cancelling waiting list entry:", error);
    res.status(500).json({ error: "Failed to cancel" });
  }
});

// Admin: Get all waiting list entries
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    const { status, date } = req.query;
    let sql = `
      SELECT wl.*, u.email, u.first_name, u.last_name, u.phone,
        s.name as service_name, s.price as service_price,
        v.make, v.model, v.year
      FROM waiting_list wl
      JOIN users u ON wl.user_id = u.id
      JOIN services s ON wl.service_id = s.id
      LEFT JOIN vehicles v ON wl.vehicle_id = v.id
      WHERE 1=1
    `;

    if (status) {
      sql += ` AND wl.status = '${status}'`;
    }
    if (date) {
      sql += ` AND wl.preferred_date = '${date}'`;
    }

    sql += " ORDER BY wl.priority DESC, wl.created_at ASC";

    const entries = await query(sql);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching all waiting list:", error);
    res.status(500).json({ error: "Failed to fetch waiting list" });
  }
});

// Admin: Notify waiting list entry
router.post("/:id/notify", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      `
      UPDATE waiting_list SET status = 'notified', notified_at = NOW() WHERE id = ?
    `,
      [id],
    );

    // Get user info for notification
    const entry = await query(
      `
      SELECT u.email, u.phone, wl.preferred_date, s.name as service_name
      FROM waiting_list wl
      JOIN users u ON wl.user_id = u.id
      JOIN services s ON wl.service_id = s.id
      WHERE wl.id = ?
    `,
      [id],
    );

    // TODO: Send email/SMS notification

    res.json({ message: "User notified successfully" });
  } catch (error) {
    console.error("Error notifying user:", error);
    res.status(500).json({ error: "Failed to notify user" });
  }
});

// Admin: Schedule from waiting list (create appointment)
router.post("/:id/schedule", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_id } = req.body;

    // Update waiting list
    await query(
      `
      UPDATE waiting_list SET status = 'scheduled', scheduled_appointment_id = ? WHERE id = ?
    `,
      [appointment_id, id],
    );

    // Notify other waiting users about the slot
    const entry = await query(
      `
      SELECT wl.*, s.name as service_name, wl.preferred_date
      FROM waiting_list wl
      JOIN services s ON wl.service_id = s.id
      WHERE wl.id = ?
    `,
      [id],
    );

    if (entry.length > 0) {
      // Notify other users waiting for same service/date
      const others = await query(
        `
        SELECT wl.id, u.email
        FROM waiting_list wl
        JOIN users u ON wl.user_id = u.id
        WHERE wl.service_id = ? AND wl.preferred_date = ? AND wl.status = 'waiting'
      `,
        [entry[0].service_id, entry[0].preferred_date],
      );

      // TODO: Send notifications to other waiting users
    }

    res.json({ message: "Appointment scheduled from waiting list" });
  } catch (error) {
    console.error("Error scheduling from waiting list:", error);
    res.status(500).json({ error: "Failed to schedule" });
  }
});

// Admin: Remove expired entries
router.delete("/admin/cleanup", authenticateToken, async (req, res) => {
  try {
    await query(`
      UPDATE waiting_list SET status = 'expired' 
      WHERE status = 'waiting' AND expires_at < NOW()
    `);

    res.json({ message: "Expired entries cleaned up" });
  } catch (error) {
    console.error("Error cleaning up:", error);
    res.status(500).json({ error: "Failed to cleanup" });
  }
});

export default router;
