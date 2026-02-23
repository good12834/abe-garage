import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} from "../middleware/auth.js";
import { asyncHandler, ValidationError } from "../middleware/errorHandler.js";
import { getIO, emitToRole } from "../services/socket.js";

const router = express.Router();

// Get all service bays with current status
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { status, type, available_only } = req.query;

    let query = `
      SELECT 
        sb.id,
        sb.bay_number,
        sb.bay_name,
        sb.bay_type,
        sb.capacity_vehicle_size,
        sb.equipment,
        sb.is_active,
        sb.last_maintenance_date,
        sb.next_maintenance_due,
        sbs.status,
        sbs.estimated_completion_time,
        sbs.service_type,
        sbs.vehicle_info,
        sbs.started_at,
        CONCAT(m.first_name, ' ', m.last_name) as assigned_mechanic,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.phone as customer_phone,
        a.id as current_appointment_id
      FROM service_bays sb
      LEFT JOIN service_bay_status sbs ON sb.id = sbs.bay_id
      LEFT JOIN mechanics m ON sbs.mechanic_id = m.id
      LEFT JOIN appointments a ON sbs.current_appointment_id = a.id
      LEFT JOIN users c ON a.customer_id = c.id
      WHERE sb.is_active = TRUE
    `;
    const params = [];

    if (status) {
      query += " AND sbs.status = ?";
      params.push(status);
    }

    if (type) {
      query += " AND sb.bay_type = ?";
      params.push(type);
    }

    if (available_only === "true") {
      query += " AND (sbs.status = 'available' OR sbs.status IS NULL)";
    }

    query += " ORDER BY sb.bay_number";

    const serviceBays = await executeQuery(query, params);

    // Process the data for frontend consumption
    const processedBays = serviceBays.map((bay) => ({
      ...bay,
      equipment:
        bay.equipment && !Array.isArray(bay.equipment)
          ? JSON.parse(bay.equipment)
          : bay.equipment || [],
      vehicle_info:
        bay.vehicle_info && typeof bay.vehicle_info === "string"
          ? JSON.parse(bay.vehicle_info)
          : bay.vehicle_info,
      status_display: getStatusDisplay(bay.status),
      is_available: bay.status === "available" || !bay.status,
      estimated_wait_time:
        bay.status === "occupied"
          ? calculateEstimatedWait(bay.estimated_completion_time)
          : 0,
    }));

    res.json({
      success: true,
      data: {
        service_bays: processedBays,
        summary: {
          total_bays: processedBays.length,
          available_bays: processedBays.filter((bay) => bay.is_available)
            .length,
          occupied_bays: processedBays.filter(
            (bay) => bay.status === "occupied"
          ).length,
          maintenance_bays: processedBays.filter(
            (bay) => bay.status === "maintenance"
          ).length,
        },
      },
    });
  })
);

// Get service bay queue - moved before /:id to avoid route conflicts
router.get(
  "/queue",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const queue = await executeQuery(
      `SELECT 
        sq.*,
        a.appointment_date,
        a.car_brand,
        a.car_model,
        a.car_year,
        a.problem_description,
        s.name as service_name,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.phone as customer_phone,
        sb.bay_number as assigned_bay
       FROM service_queue sq
       JOIN appointments a ON sq.appointment_id = a.id
       JOIN services s ON a.service_id = s.id
       JOIN users c ON a.customer_id = c.id
       LEFT JOIN service_bays sb ON sq.bay_id = sb.id
       WHERE sq.queue_status IN ('waiting', 'called')
       ORDER BY 
         CASE sq.priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'normal' THEN 3 
           WHEN 'low' THEN 4 
         END,
         sq.queue_position`
    );

    res.json({
      success: true,
      data: {
        queue,
        summary: {
          total_waiting: queue.filter((item) => item.queue_status === "waiting")
            .length,
          total_called: queue.filter((item) => item.queue_status === "called")
            .length,
        },
      },
    });
  })
);

// Get single service bay by ID - moved after /queue
router.get(
  "/:id",
  optionalAuth,
  [param("id").isInt({ min: 1 })],
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

    const bayId = req.params.id;

    const serviceBay = await getSingleRecord(
      `SELECT 
        sb.*,
        sbs.status,
        sbs.estimated_completion_time,
        sbs.service_type,
        sbs.vehicle_info,
        sbs.started_at,
        CONCAT(m.first_name, ' ', m.last_name) as assigned_mechanic,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.phone as customer_phone,
        a.id as current_appointment_id,
        a.appointment_date
       FROM service_bays sb
       LEFT JOIN service_bay_status sbs ON sb.id = sbs.bay_id
       LEFT JOIN mechanics m ON sbs.mechanic_id = m.id
       LEFT JOIN appointments a ON sbs.current_appointment_id = a.id
       LEFT JOIN users c ON a.customer_id = c.id
       WHERE sb.id = ?`,
      [bayId]
    );

    if (!serviceBay) {
      throw new ValidationError("Service bay not found");
    }

    serviceBay.equipment =
      serviceBay.equipment && !Array.isArray(serviceBay.equipment)
        ? JSON.parse(serviceBay.equipment)
        : serviceBay.equipment || [];
    serviceBay.vehicle_info =
      serviceBay.vehicle_info && typeof serviceBay.vehicle_info === "string"
        ? JSON.parse(serviceBay.vehicle_info)
        : serviceBay.vehicle_info;
    serviceBay.status_display = getStatusDisplay(serviceBay.status);
    serviceBay.is_available =
      serviceBay.status === "available" || !serviceBay.status;

    res.json({
      success: true,
      data: { service_bay: serviceBay },
    });
  })
);

// Update service bay status (admin only)
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("status")
      .isIn(["available", "occupied", "maintenance", "out_of_service"])
      .withMessage("Invalid status"),
    body("appointmentId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid appointment ID is required"),
    body("mechanicId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid mechanic ID is required"),
    body("estimatedCompletionTime")
      .optional()
      .isISO8601()
      .withMessage("Valid estimated completion time is required"),
    body("serviceType")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Service type must not exceed 100 characters"),
    body("vehicleInfo")
      .optional()
      .isObject()
      .withMessage("Vehicle info must be an object"),
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

    const bayId = req.params.id;
    const {
      status,
      appointmentId,
      mechanicId,
      estimatedCompletionTime,
      serviceType,
      vehicleInfo,
    } = req.body;

    // Check if service bay exists
    const serviceBay = await getSingleRecord(
      "SELECT * FROM service_bays WHERE id = ?",
      [bayId]
    );

    if (!serviceBay) {
      throw new ValidationError("Service bay not found");
    }

    // Verify appointment exists if provided
    if (appointmentId) {
      const appointment = await getSingleRecord(
        "SELECT id FROM appointments WHERE id = ?",
        [appointmentId]
      );

      if (!appointment) {
        throw new ValidationError("Appointment not found");
      }
    }

    // Verify mechanic exists if provided
    if (mechanicId) {
      const mechanic = await getSingleRecord(
        "SELECT id FROM mechanics WHERE id = ?",
        [mechanicId]
      );

      if (!mechanic) {
        throw new ValidationError("Mechanic not found");
      }
    }

    // Update service bay status
    await executeQuery(
      `INSERT INTO service_bay_status 
       (bay_id, status, current_appointment_id, mechanic_id, estimated_completion_time, service_type, vehicle_info, started_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         current_appointment_id = VALUES(current_appointment_id),
         mechanic_id = VALUES(mechanic_id),
         estimated_completion_time = VALUES(estimated_completion_time),
         service_type = VALUES(service_type),
         vehicle_info = VALUES(vehicle_info),
         started_at = VALUES(started_at),
         updated_at = CURRENT_TIMESTAMP`,
      [
        bayId,
        status,
        appointmentId || null,
        mechanicId || null,
        estimatedCompletionTime || null,
        serviceType || null,
        vehicleInfo ? JSON.stringify(vehicleInfo) : null,
        status === "occupied" ? new Date() : null,
      ]
    );

    // Emit real-time update via Socket.io
    try {
      const io = getIO();
      if (io) {
        io.emit("service_bay_status_update", {
          bay_id: bayId,
          status,
          appointment_id: appointmentId,
          mechanic_id: mechanicId,
          estimated_completion_time: estimatedCompletionTime,
          service_type: serviceType,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to emit socket event:", error);
    }

    // Get updated service bay
    const updatedBay = await getSingleRecord(
      `SELECT 
        sb.*,
        sbs.status,
        sbs.estimated_completion_time,
        sbs.service_type,
        sbs.vehicle_info,
        sbs.started_at,
        CONCAT(m.first_name, ' ', m.last_name) as assigned_mechanic
       FROM service_bays sb
       LEFT JOIN service_bay_status sbs ON sb.id = sbs.bay_id
       LEFT JOIN mechanics m ON sbs.mechanic_id = m.id
       WHERE sb.id = ?`,
      [bayId]
    );

    updatedBay.equipment =
      updatedBay.equipment && !Array.isArray(updatedBay.equipment)
        ? JSON.parse(updatedBay.equipment)
        : updatedBay.equipment || [];
    updatedBay.vehicle_info =
      updatedBay.vehicle_info && typeof updatedBay.vehicle_info === "string"
        ? JSON.parse(updatedBay.vehicle_info)
        : updatedBay.vehicle_info;

    res.json({
      success: true,
      message: "Service bay status updated successfully",
      data: { service_bay: updatedBay },
    });
  })
);

// Update queue position (admin only)
router.put(
  "/queue/:appointmentId/position",
  authenticateToken,
  requireAdmin,
  [
    param("appointmentId").isInt({ min: 1 }),
    body("newPosition")
      .isInt({ min: 1 })
      .withMessage("Position must be a positive integer"),
    body("action")
      .isIn(["move", "call", "cancel"])
      .withMessage("Invalid action"),
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

    const appointmentId = req.params.appointmentId;
    const { newPosition, action } = req.body;

    // Get current queue item
    const queueItem = await getSingleRecord(
      "SELECT * FROM service_queue WHERE appointment_id = ?",
      [appointmentId]
    );

    if (!queueItem) {
      throw new ValidationError("Queue item not found");
    }

    if (action === "move") {
      // Update queue position
      await executeQuery(
        "UPDATE service_queue SET queue_position = ? WHERE appointment_id = ?",
        [newPosition, appointmentId]
      );
    } else if (action === "call") {
      // Mark as called and notify customer
      await executeQuery(
        "UPDATE service_queue SET queue_status = 'called', called_at = NOW() WHERE appointment_id = ?",
        [appointmentId]
      );

      // Emit real-time update
      try {
        const io = getIO();
        if (io) {
          io.emit("queue_status_update", {
            appointment_id: appointmentId,
            status: "called",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Failed to emit queue update:", error);
      }
    } else if (action === "cancel") {
      // Cancel queue position
      await executeQuery(
        "UPDATE service_queue SET queue_status = 'cancelled' WHERE appointment_id = ?",
        [appointmentId]
      );
    }

    res.json({
      success: true,
      message: `Queue ${action} completed successfully`,
    });
  })
);

// Helper functions
function getStatusDisplay(status) {
  switch (status) {
    case "available":
      return "Available Now";
    case "occupied":
      return "Currently in Service";
    case "maintenance":
      return "Under Maintenance";
    case "out_of_service":
      return "Out of Service";
    default:
      return "Unknown";
  }
}

function calculateEstimatedWait(estimatedCompletionTime) {
  if (!estimatedCompletionTime) return 0;

  const now = new Date();
  const estimated = new Date(estimatedCompletionTime);
  const diffMs = estimated - now;

  return Math.max(0, Math.ceil(diffMs / (1000 * 60))); // Return minutes
}

export default router;
