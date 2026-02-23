import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { executeQuery as query } from "../config/database.js";

const router = express.Router();

// Get all emergency services
router.get("/", async (req, res) => {
  try {
    const services = await query(`
      SELECT * FROM emergency_services 
      WHERE is_active = TRUE AND is_24_7_available = TRUE
      ORDER BY base_price ASC
    `);

    res.json(services);
  } catch (error) {
    console.error("Error fetching emergency services:", error);
    res.status(500).json({ error: "Failed to fetch emergency services" });
  }
});

// Get single emergency service
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const services = await query(
      "SELECT * FROM emergency_services WHERE id = ?",
      [id],
    );

    if (services.length === 0) {
      return res.status(404).json({ error: "Emergency service not found" });
    }

    res.json(services[0]);
  } catch (error) {
    console.error("Error fetching emergency service:", error);
    res.status(500).json({ error: "Failed to fetch emergency service" });
  }
});

// Create emergency booking
router.post("/book", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vehicle_id,
      emergency_service_id,
      location_lat,
      location_lng,
      address,
      description,
      priority,
    } = req.body;

    // Validate vehicle
    const vehicle = await query(
      "SELECT * FROM vehicles WHERE id = ? AND user_id = ?",
      [vehicle_id, userId],
    );
    if (vehicle.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Get service details for pricing
    const service = await query(
      "SELECT * FROM emergency_services WHERE id = ?",
      [emergency_service_id],
    );
    if (service.length === 0) {
      return res.status(404).json({ error: "Emergency service not found" });
    }

    // Create booking
    const result = await query(
      `
      INSERT INTO emergency_bookings 
      (user_id, vehicle_id, emergency_service_id, location_lat, location_lng, address, description, priority, estimated_cost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userId,
        vehicle_id,
        emergency_service_id,
        location_lat || null,
        location_lng || null,
        address || null,
        description,
        priority || "high",
        service[0].base_price,
      ],
    );

    const bookingId = result.insertId;

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("new-emergency-booking", {
        id: bookingId,
        user_id: userId,
        priority: priority || "high",
        status: "pending",
      });
    }

    res.status(201).json({
      message: "Emergency service booked successfully",
      booking_id: bookingId,
      estimated_cost: service[0].base_price,
      estimated_arrival: service[0].response_time_estimate,
    });
  } catch (error) {
    console.error("Error booking emergency service:", error);
    res.status(500).json({ error: "Failed to book emergency service" });
  }
});

// Get user's emergency bookings
router.get("/bookings/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await query(
      `
      SELECT eb.*, es.name as service_name, es.base_price, v.make, v.model, v.year, v.license_plate
      FROM emergency_bookings eb
      JOIN emergency_services es ON eb.emergency_service_id = es.id
      JOIN vehicles v ON eb.vehicle_id = v.id
      WHERE eb.user_id = ?
      ORDER BY eb.created_at DESC
    `,
      [userId],
    );

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching emergency bookings:", error);
    res.status(500).json({ error: "Failed to fetch emergency bookings" });
  }
});

// Get single booking details
router.get("/bookings/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const bookings = await query(
      `
      SELECT eb.*, es.name as service_name, es.base_price, es.response_time_estimate,
        v.make, v.model, v.year, v.license_plate,
        m.name as mechanic_name, m.phone as mechanic_phone
      FROM emergency_bookings eb
      JOIN emergency_services es ON eb.emergency_service_id = es.id
      JOIN vehicles v ON eb.vehicle_id = v.id
      LEFT JOIN mechanics m ON eb.assigned_mechanic_id = m.id
      WHERE eb.id = ? AND eb.user_id = ?
    `,
      [id, userId],
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(bookings[0]);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
});

// Cancel emergency booking
router.post("/bookings/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const bookings = await query(
      `
      SELECT * FROM emergency_bookings 
      WHERE id = ? AND user_id = ? AND status NOT IN ('completed', 'cancelled')
    `,
      [id, userId],
    );

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ error: "Booking not found or cannot be cancelled" });
    }

    await query(
      "UPDATE emergency_bookings SET status = 'cancelled' WHERE id = ?",
      [id],
    );

    res.json({ message: "Emergency booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// Admin: Get all emergency bookings
router.get("/admin/bookings", authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    let sql = `
      SELECT eb.*, es.name as service_name,
        u.email, u.first_name, u.last_name, u.phone as user_phone,
        v.make, v.model, v.year, v.license_plate
      FROM emergency_bookings eb
      JOIN emergency_services es ON eb.emergency_service_id = es.id
      JOIN users u ON eb.user_id = u.id
      JOIN vehicles v ON eb.vehicle_id = v.id
      WHERE 1=1
    `;

    if (status) {
      sql += ` AND eb.status = '${status}'`;
    }
    if (priority) {
      sql += ` AND eb.priority = '${priority}'`;
    }

    sql +=
      " ORDER BY FIELD(eb.priority, 'critical', 'high', 'medium', 'low'), eb.created_at ASC";

    const bookings = await query(sql);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Admin: Update booking status
router.put(
  "/admin/bookings/:id/status",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, assigned_mechanic_id } = req.body;

      let sql = "UPDATE emergency_bookings SET status = ?";
      const params = [status];

      if (status === "dispatched") {
        sql += ", dispatched_at = NOW()";
      } else if (status === "arrived") {
        sql += ", arrived_at = NOW()";
      } else if (status === "completed") {
        sql += ", completed_at = NOW()";
      }

      if (assigned_mechanic_id) {
        sql += ", assigned_mechanic_id = ?";
        params.push(assigned_mechanic_id);
      }

      sql += " WHERE id = ?";
      params.push(id);

      await query(sql, params);

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.emit(`emergency-booking-${id}`, { status, assigned_mechanic_id });
      }

      res.json({ message: "Booking status updated successfully" });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  },
);

export default router;
