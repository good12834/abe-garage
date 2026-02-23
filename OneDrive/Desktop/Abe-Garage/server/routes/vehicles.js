import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Get all vehicles (admin only or for specific customer)
router.get("/", async (req, res) => {
  try {
    const { customer_id, active_only } = req.query;

    let query = `
      SELECT v.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email AS customer_email
      FROM vehicles v
      JOIN users u ON v.customer_id = u.id
      WHERE 1=1
    `;

    if (customer_id) {
      query += ` AND v.customer_id = ?`;
    }

    if (active_only === "true") {
      query += ` AND v.is_active = TRUE`;
    }

    query += ` ORDER BY v.created_at DESC`;

    const vehicles = await db.query(query, customer_id ? [customer_id] : []);
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// Get vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT v.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name, u.email AS customer_email
      FROM vehicles v
      JOIN users u ON v.customer_id = u.id
      WHERE v.id = ?
    `;

    const vehicles = await db.query(query, [id]);

    if (vehicles.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(vehicles[0]);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

// Get vehicles by license plate or VIN search
router.get("/search/:term", async (req, res) => {
  try {
    const { term } = req.params;

    const query = `
      SELECT v.*, CONCAT(u.first_name, ' ', u.last_name) AS customer_name
      FROM vehicles v
      JOIN users u ON v.customer_id = u.id
      WHERE v.license_plate LIKE ? OR v.vin LIKE ? OR CONCAT(v.make, ' ', v.model) LIKE ?
      ORDER BY v.created_at DESC
      LIMIT 20
    `;

    const searchTerm = `%${term}%`;
    const vehicles = await db.query(query, [
      searchTerm,
      searchTerm,
      searchTerm,
    ]);
    res.json(vehicles);
  } catch (error) {
    console.error("Error searching vehicles:", error);
    res.status(500).json({ error: "Failed to search vehicles" });
  }
});

// Create new vehicle
router.post("/", async (req, res) => {
  try {
    const {
      customer_id,
      license_plate,
      vin,
      make,
      model,
      year,
      color,
      vehicle_type,
      engine_type,
      transmission,
      mileage,
      last_service_date,
      next_service_due,
      registration_expiry,
      insurance_expiry,
      notes,
    } = req.body;

    // Validate required fields
    if (!customer_id || !license_plate || !make || !model || !year) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: customer_id, license_plate, make, model, year",
        });
    }

    // Check if license plate already exists
    const existingVehicle = await db.query(
      "SELECT id FROM vehicles WHERE license_plate = ?",
      [license_plate],
    );

    if (existingVehicle.length > 0) {
      return res
        .status(400)
        .json({ error: "License plate already registered" });
    }

    // Check if VIN already exists (if provided)
    if (vin) {
      const existingVin = await db.query(
        "SELECT id FROM vehicles WHERE vin = ?",
        [vin],
      );

      if (existingVin.length > 0) {
        return res.status(400).json({ error: "VIN already registered" });
      }
    }

    const query = `
      INSERT INTO vehicles (
        customer_id, license_plate, vin, make, model, year, color,
        vehicle_type, engine_type, transmission, mileage, last_service_date,
        next_service_due, registration_expiry, insurance_expiry, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(query, [
      customer_id,
      license_plate,
      vin || null,
      make,
      model,
      year,
      color || null,
      vehicle_type || "sedan",
      engine_type || "gasoline",
      transmission || "automatic",
      mileage || 0,
      last_service_date || null,
      next_service_due || null,
      registration_expiry || null,
      insurance_expiry || null,
      notes || null,
    ]);

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});

// Update vehicle
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      license_plate,
      vin,
      make,
      model,
      year,
      color,
      vehicle_type,
      engine_type,
      transmission,
      mileage,
      last_service_date,
      next_service_due,
      registration_expiry,
      insurance_expiry,
      notes,
      is_active,
    } = req.body;

    // Check if vehicle exists
    const existingVehicle = await db.query(
      "SELECT id FROM vehicles WHERE id = ?",
      [id],
    );

    if (existingVehicle.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Check if license plate is being changed and if it already exists
    if (license_plate) {
      const plateExists = await db.query(
        "SELECT id FROM vehicles WHERE license_plate = ? AND id != ?",
        [license_plate, id],
      );

      if (plateExists.length > 0) {
        return res
          .status(400)
          .json({
            error: "License plate already registered to another vehicle",
          });
      }
    }

    // Check if VIN is being changed and if it already exists
    if (vin) {
      const vinExists = await db.query(
        "SELECT id FROM vehicles WHERE vin = ? AND id != ?",
        [vin, id],
      );

      if (vinExists.length > 0) {
        return res
          .status(400)
          .json({ error: "VIN already registered to another vehicle" });
      }
    }

    const query = `
      UPDATE vehicles SET
        license_plate = COALESCE(?, license_plate),
        vin = COALESCE(?, vin),
        make = COALESCE(?, make),
        model = COALESCE(?, model),
        year = COALESCE(?, year),
        color = COALESCE(?, color),
        vehicle_type = COALESCE(?, vehicle_type),
        engine_type = COALESCE(?, engine_type),
        transmission = COALESCE(?, transmission),
        mileage = COALESCE(?, mileage),
        last_service_date = COALESCE(?, last_service_date),
        next_service_due = COALESCE(?, next_service_due),
        registration_expiry = COALESCE(?, registration_expiry),
        insurance_expiry = COALESCE(?, insurance_expiry),
        notes = COALESCE(?, notes),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `;

    await db.query(query, [
      license_plate,
      vin,
      make,
      model,
      year,
      color,
      vehicle_type,
      engine_type,
      transmission,
      mileage,
      last_service_date,
      next_service_due,
      registration_expiry,
      insurance_expiry,
      notes,
      is_active,
      id,
    ]);

    res.json({ message: "Vehicle updated successfully" });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ error: "Failed to update vehicle" });
  }
});

// Delete vehicle (soft delete by setting is_active to false)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const existingVehicle = await db.query(
      "SELECT id FROM vehicles WHERE id = ?",
      [id],
    );

    if (existingVehicle.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Soft delete
    await db.query("UPDATE vehicles SET is_active = FALSE WHERE id = ?", [id]);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ error: "Failed to delete vehicle" });
  }
});

// Get vehicle service history
// Get vehicle service history
router.get("/:id/service-history", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const vehicleResult = await db.query(
      "SELECT id, customer_id, make, model, year, license_plate, vin FROM vehicles WHERE id = ?",
      [id]
    );

    if (vehicleResult.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehicle = vehicleResult[0];

    // Get service history from the dedicated service_history table
    // This table contains rich data like photos, parts, etc.
    // match by customer_id AND vehicle attributes since we don't have a direct link
    const query = `
      SELECT sh.*, s.name AS service_name,
             CONCAT(m.first_name, ' ', m.last_name) AS mechanic_name,
             (SELECT COUNT(*) FROM service_timeline_events ste WHERE ste.service_history_id = sh.id) as event_count,
             'completed' as status
      FROM service_history sh
      JOIN services s ON sh.service_id = s.id
      LEFT JOIN mechanics m ON sh.mechanic_id = m.id
      WHERE sh.user_id = ? 
      AND (
        (sh.car_brand = ? AND sh.car_model = ? AND sh.car_year = ?)
        OR
        (sh.vin = ? AND sh.vin IS NOT NULL AND sh.vin != '')
      )
      ORDER BY sh.service_date DESC
    `;

    const serviceHistory = await db.query(query, [
      vehicle.customer_id,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.vin || ''
    ]);

    // If no rich history found, fallback to appointments for this customer? 
    // No, let's stick to strict matching for "Pro" history to avoid confusion.
    // If the user wants generic appointments, they can view the appointments page.

    res.json(serviceHistory);
  } catch (error) {
    console.error("Error fetching vehicle service history:", error);
    res.status(500).json({ error: "Failed to fetch service history" });
  }
});

export default router;
