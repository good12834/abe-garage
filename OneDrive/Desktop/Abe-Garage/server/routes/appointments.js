import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireAdmin,
  requireCustomerOrAdmin,
} from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validateDate,
  validatePositiveNumber,
} from "../middleware/errorHandler.js";

const router = express.Router();

// Create new appointment (customer)
router.post(
  "/",
  authenticateToken,
  requireCustomerOrAdmin,
  [
    body("serviceId")
      .isInt({ min: 1 })
      .withMessage("Valid service ID is required"),
    body("appointmentDate")
      .isISO8601()
      .withMessage("Valid appointment date is required"),
    body("carBrand")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Car brand is required"),
    body("carModel")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Car model is required"),
    body("carYear")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Valid car year is required"),
    body("problemDescription")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Problem description must be at least 10 characters long"),
    body("estimatedCost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Estimated cost must be a positive number"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const {
      serviceId,
      appointmentDate,
      carBrand,
      carModel,
      carYear,
      problemDescription,
      estimatedCost,
    } = req.body;
    const customerId = req.user.id;

    // Validate appointment date is not in the past
    validateDate(appointmentDate);

    // Convert date to MySQL format
    const date = new Date(appointmentDate);
    const mysqlDate = date.toISOString().slice(0, 19).replace("T", " ");

    // Check if service exists
    const service = await getSingleRecord(
      "SELECT * FROM services WHERE id = ? AND is_active = TRUE",
      [serviceId]
    );

    if (!service) {
      throw new ValidationError("Service not found or inactive");
    }

    // Check for conflicting appointments (same mechanic, overlapping time)
    // For now, we'll just check for the same time slot
    const conflictingAppointment = await getSingleRecord(
      'SELECT id FROM appointments WHERE appointment_date = ? AND status != "cancelled"',
      [mysqlDate]
    );

    if (conflictingAppointment) {
      throw new ValidationError(
        "This time slot is already booked. Please choose another time."
      );
    }

    // Create appointment
    const appointmentId = await executeQuery(
      `INSERT INTO appointments
      (customer_id, service_id, appointment_date, car_brand, car_model, car_year, problem_description, estimated_cost, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        customerId,
        serviceId,
        mysqlDate,
        carBrand,
        carModel,
        carYear,
        problemDescription,
        estimatedCost || service.base_price,
      ]
    );

    // Get created appointment with related data
    const appointment = await getSingleRecord(
      `SELECT a.*, s.name as service_name, s.base_price, s.duration_minutes,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u ON a.customer_id = u.id
     WHERE a.id = ?`,
      [appointmentId]
    );

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: { appointment },
    });
  })
);

// Get appointments for current user
router.get(
  "/my-appointments",
  authenticateToken,
  requireCustomerOrAdmin,
  asyncHandler(async (req, res) => {
    const customerId = req.user.id;

    const appointments = await executeQuery(
      `SELECT a.*, s.name as service_name, s.base_price, s.duration_minutes,
            CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     LEFT JOIN mechanics m ON a.mechanic_id = m.id
     JOIN users u ON a.customer_id = u.id
     WHERE a.customer_id = ?
     ORDER BY a.appointment_date DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: { appointments },
    });
  })
);

// Get all appointments (admin only)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  [
    query("status")
      .optional()
      .isIn(["pending", "approved", "in_service", "completed", "cancelled"]),
    query("date").optional().isISO8601(),
    query("mechanicId").optional().isInt({ min: 1 }),
    query("customerId").optional().isInt({ min: 1 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
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

    const {
      status,
      date,
      mechanicId,
      customerId,
      page = 1,
      limit = 10,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND a.status = ?";
      params.push(status);
    }

    if (date) {
      whereClause += " AND DATE(a.appointment_date) = ?";
      params.push(date);
    }

    if (mechanicId) {
      whereClause += " AND a.mechanic_id = ?";
      params.push(mechanicId);
    }

    if (customerId) {
      whereClause += " AND a.customer_id = ?";
      params.push(customerId);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM appointments a ${whereClause}`;
    const countResult = await executeQuery(countQuery, params);
    const total = countResult[0].total;

    // Get appointments
    const appointmentsQuery = `
    SELECT a.*, s.name as service_name, s.base_price, s.duration_minutes,
           CONCAT(m.first_name, ' ', m.last_name) as mechanic_name, m.phone as mechanic_phone,
           CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    LEFT JOIN mechanics m ON a.mechanic_id = m.id
    JOIN users u ON a.customer_id = u.id
    ${whereClause}
    ORDER BY a.appointment_date DESC
    LIMIT ? OFFSET ?
  `;

    const appointments = await executeQuery(appointmentsQuery, [
      ...params,
      limit,
      offset,
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        appointments,
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

// Get appointment statistics (admin only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END) as in_service_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN final_cost ELSE 0 END), 0) as total_revenue
      FROM appointments
    `);

    res.json({
      success: true,
      data: { stats: stats[0] },
    });
  })
);

// Get single appointment by ID
router.get(
  "/:id",
  authenticateToken,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Valid appointment ID is required"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const appointmentId = req.params.id;

    let appointment;
    try {
      appointment = await getSingleRecord(
        `SELECT a.*, s.name as service_name, s.base_price, s.duration_minutes,
              CONCAT(m.first_name, ' ', m.last_name) as mechanic_name, m.phone as mechanic_phone, m.email as mechanic_email,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       LEFT JOIN mechanics m ON a.mechanic_id = m.id
       JOIN users u ON a.customer_id = u.id
       WHERE a.id = ?`,
        [appointmentId]
      );
    } catch (error) {
      console.error("Error fetching appointment:", error);
      throw new ValidationError("Failed to fetch appointment details");
    }

    if (!appointment) {
      throw new ValidationError("Appointment not found");
    }

    // Check authorization (customer can only see their own appointments, admin can see all)
    console.log("CRITICAL AUTH LOG:", {
      user: {
        id: req.user.id,
        role: req.user.role,
        type: typeof req.user.id,
        asString: String(req.user.id)
      },
      appointment: {
        id: appointment.id,
        customer_id: appointment.customer_id,
        type: typeof appointment.customer_id,
        asString: String(appointment.customer_id)
      },
      match: String(appointment.customer_id) === String(req.user.id)
    });
    if (req.user.role !== "admin" && String(appointment.customer_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Get service updates
    let serviceUpdates = [];
    try {
      serviceUpdates = await executeQuery(
        `SELECT su.*, CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM service_updates su
       LEFT JOIN mechanics m ON su.mechanic_id = m.id
       WHERE su.appointment_id = ?
       ORDER BY su.created_at DESC`,
        [appointmentId]
      );
    } catch (error) {
      console.error("Error fetching service updates:", error);
      // Continue without service updates rather than failing the entire request
      serviceUpdates = [];
    }

    res.json({
      success: true,
      data: {
        appointment,
        serviceUpdates,
      },
    });
  })
);

// Update appointment status (admin or mechanic)
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("status")
      .isIn(["pending", "approved", "in_service", "completed", "cancelled"])
      .withMessage("Invalid status"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes must not exceed 1000 characters"),
    body("finalCost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Final cost must be a positive number"),
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

    const appointmentId = req.params.id;
    const { status, notes, finalCost } = req.body;

    // Check if appointment exists
    const appointment = await getSingleRecord(
      "SELECT * FROM appointments WHERE id = ?",
      [appointmentId]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found");
    }

    // Update appointment
    const updateFields = ["status = ?", "updated_at = CURRENT_TIMESTAMP"];
    const updateValues = [status, appointmentId];

    if (notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.splice(-1, 0, notes);
    }

    if (finalCost !== undefined) {
      validatePositiveNumber(finalCost, "finalCost");
      updateFields.push("final_cost = ?");
      updateValues.splice(-1, 0, finalCost);
    }

    await executeQuery(
      `UPDATE appointments SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Create service update record
    await executeQuery(
      `INSERT INTO service_updates (appointment_id, update_type, status, message, updated_by) 
     VALUES (?, 'status_change', ?, ?, ?)`,
      [
        appointmentId,
        status,
        notes || "Status updated",
        req.user.firstName + " " + req.user.lastName,
      ]
    );

    // Get updated appointment
    const updatedAppointment = await getSingleRecord(
      `SELECT a.*, s.name as service_name,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u ON a.customer_id = u.id
     WHERE a.id = ?`,
      [appointmentId]
    );

    res.json({
      success: true,
      message: "Appointment status updated successfully",
      data: { appointment: updatedAppointment },
    });
  })
);

// Assign mechanic to appointment (admin only)
router.put(
  "/:id/assign-mechanic",
  authenticateToken,
  requireAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("mechanicId")
      .isInt({ min: 1 })
      .withMessage("Valid mechanic ID is required"),
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

    const appointmentId = req.params.id;
    const { mechanicId } = req.body;

    // Check if appointment exists
    const appointment = await getSingleRecord(
      "SELECT * FROM appointments WHERE id = ?",
      [appointmentId]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found");
    }

    // Check if mechanic exists
    const mechanic = await getSingleRecord(
      "SELECT * FROM mechanics WHERE id = ? AND is_active = TRUE",
      [mechanicId]
    );

    if (!mechanic) {
      throw new ValidationError("Mechanic not found or inactive");
    }

    // Update appointment with mechanic
    await executeQuery(
      "UPDATE appointments SET mechanic_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [mechanicId, appointmentId]
    );

    // Create service update record
    await executeQuery(
      `INSERT INTO service_updates (appointment_id, mechanic_id, update_type, message, updated_by) 
     VALUES (?, ?, 'progress_note', ?, ?)`,
      [
        appointmentId,
        mechanicId,
        `Mechanic assigned: ${mechanic.first_name} ${mechanic.last_name}`,
        req.user.firstName + " " + req.user.lastName,
      ]
    );

    // Get updated appointment
    const updatedAppointment = await getSingleRecord(
      `SELECT a.*, s.name as service_name,
            CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
            CONCAT(u.first_name, ' ', u.last_name) as customer_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     LEFT JOIN mechanics m ON a.mechanic_id = m.id
     JOIN users u ON a.customer_id = u.id
     WHERE a.id = ?`,
      [appointmentId]
    );

    res.json({
      success: true,
      message: "Mechanic assigned successfully",
      data: { appointment: updatedAppointment },
    });
  })
);

// Cancel appointment (customer or admin)
router.put(
  "/:id/cancel",
  authenticateToken,
  requireCustomerOrAdmin,
  [
    param("id").isInt({ min: 1 }),
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Reason must not exceed 500 characters"),
  ],
  asyncHandler(async (req, res) => {
    const appointmentId = req.params.id;
    const { reason } = req.body;

    // Check if appointment exists
    const appointment = await getSingleRecord(
      "SELECT * FROM appointments WHERE id = ?",
      [appointmentId]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found");
    }

    // Check authorization (customer can only cancel their own appointments)
    if (req.user.role !== "admin" && String(appointment.customer_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Check if appointment can be cancelled (not already completed)
    if (appointment.status === "completed") {
      throw new ValidationError("Cannot cancel a completed appointment");
    }

    // Update appointment status
    await executeQuery(
      "UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      ["cancelled", appointmentId]
    );

    // Create service update record
    await executeQuery(
      `INSERT INTO service_updates (appointment_id, update_type, status, message, updated_by) 
     VALUES (?, 'status_change', 'cancelled', ?, ?)`,
      [
        appointmentId,
        reason || "Appointment cancelled",
        req.user.firstName + " " + req.user.lastName,
      ]
    );

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  })
);



export default router;
