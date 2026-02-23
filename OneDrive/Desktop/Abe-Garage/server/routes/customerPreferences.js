import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Get customer preferences
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await query(
      `
      SELECT cp.*, m.name as preferred_mechanic_name
      FROM customer_preferences cp
      LEFT JOIN mechanics m ON cp.preferred_mechanic_id = m.id
      WHERE cp.user_id = ?
    `,
      [userId],
    );

    if (preferences.length === 0) {
      // Return default preferences if none exist
      return res.json({
        user_id: userId,
        preferred_communication: "email",
        preferred_mechanic_id: null,
        preferred_appointment_time: "09:00:00",
        reminder_days_before: 2,
        marketing_opt_in: false,
        language_preference: "en",
        special_instructions: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
    }

    res.json(preferences[0]);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// Update customer preferences
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      preferred_communication,
      preferred_mechanic_id,
      preferred_appointment_time,
      reminder_days_before,
      marketing_opt_in,
      language_preference,
      special_instructions,
      emergency_contact_name,
      emergency_contact_phone,
    } = req.body;

    // Check if preferences exist
    const existing = await query(
      "SELECT id FROM customer_preferences WHERE user_id = ?",
      [userId],
    );

    if (existing.length > 0) {
      await query(
        `
        UPDATE customer_preferences 
        SET preferred_communication = ?, 
            preferred_mechanic_id = ?,
            preferred_appointment_time = ?,
            reminder_days_before = ?,
            marketing_opt_in = ?,
            language_preference = ?,
            special_instructions = ?,
            emergency_contact_name = ?,
            emergency_contact_phone = ?
        WHERE user_id = ?
      `,
        [
          preferred_communication || "email",
          preferred_mechanic_id || null,
          preferred_appointment_time || "09:00:00",
          reminder_days_before || 2,
          marketing_opt_in !== undefined ? marketing_opt_in : false,
          language_preference || "en",
          special_instructions || "",
          emergency_contact_name || "",
          emergency_contact_phone || "",
          userId,
        ],
      );
    } else {
      await query(
        `
        INSERT INTO customer_preferences 
        (user_id, preferred_communication, preferred_mechanic_id, preferred_appointment_time, 
         reminder_days_before, marketing_opt_in, language_preference, special_instructions,
         emergency_contact_name, emergency_contact_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          userId,
          preferred_communication || "email",
          preferred_mechanic_id || null,
          preferred_appointment_time || "09:00:00",
          reminder_days_before || 2,
          marketing_opt_in !== undefined ? marketing_opt_in : false,
          language_preference || "en",
          special_instructions || "",
          emergency_contact_name || "",
          emergency_contact_phone || "",
        ],
      );
    }

    res.json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Get notification settings specifically
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await query(
      `
      SELECT preferred_communication, reminder_days_before, marketing_opt_in
      FROM customer_preferences 
      WHERE user_id = ?
    `,
      [userId],
    );

    if (preferences.length === 0) {
      return res.json({
        preferred_communication: "email",
        reminder_days_before: 2,
        marketing_opt_in: false,
      });
    }

    res.json(preferences[0]);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({ error: "Failed to fetch notification settings" });
  }
});

// Update notification settings
router.put("/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferred_communication, reminder_days_before, marketing_opt_in } =
      req.body;

    const existing = await query(
      "SELECT id FROM customer_preferences WHERE user_id = ?",
      [userId],
    );

    if (existing.length > 0) {
      await query(
        `
        UPDATE customer_preferences 
        SET preferred_communication = ?, reminder_days_before = ?, marketing_opt_in = ?
        WHERE user_id = ?
      `,
        [
          preferred_communication || "email",
          reminder_days_before || 2,
          marketing_opt_in !== undefined ? marketing_opt_in : false,
          userId,
        ],
      );
    } else {
      await query(
        `
        INSERT INTO customer_preferences 
        (user_id, preferred_communication, reminder_days_before, marketing_opt_in)
        VALUES (?, ?, ?, ?)
      `,
        [
          userId,
          preferred_communication || "email",
          reminder_days_before || 2,
          marketing_opt_in !== undefined ? marketing_opt_in : false,
        ],
      );
    }

    res.json({ message: "Notification settings updated successfully" });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

// Get mechanic preferences
router.get("/mechanic", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await query(
      `
      SELECT cp.preferred_mechanic_id, m.name as mechanic_name, m.specialization, m.rating
      FROM customer_preferences cp
      LEFT JOIN mechanics m ON cp.preferred_mechanic_id = m.id
      WHERE cp.user_id = ?
    `,
      [userId],
    );

    res.json(preferences[0] || { preferred_mechanic_id: null });
  } catch (error) {
    console.error("Error fetching mechanic preference:", error);
    res.status(500).json({ error: "Failed to fetch mechanic preference" });
  }
});

// Set preferred mechanic
router.put("/mechanic", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferred_mechanic_id } = req.body;

    // Verify mechanic exists
    if (preferred_mechanic_id) {
      const mechanic = await query(
        "SELECT id FROM mechanics WHERE id = ? AND is_active = TRUE",
        [preferred_mechanic_id],
      );
      if (mechanic.length === 0) {
        return res
          .status(404)
          .json({ error: "Mechanic not found or inactive" });
      }
    }

    const existing = await query(
      "SELECT id FROM customer_preferences WHERE user_id = ?",
      [userId],
    );

    if (existing.length > 0) {
      await query(
        "UPDATE customer_preferences SET preferred_mechanic_id = ? WHERE user_id = ?",
        [preferred_mechanic_id || null, userId],
      );
    } else {
      await query(
        "INSERT INTO customer_preferences (user_id, preferred_mechanic_id) VALUES (?, ?)",
        [userId, preferred_mechanic_id || null],
      );
    }

    res.json({ message: "Preferred mechanic updated successfully" });
  } catch (error) {
    console.error("Error updating preferred mechanic:", error);
    res.status(500).json({ error: "Failed to update preferred mechanic" });
  }
});

export default router;
