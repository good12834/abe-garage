import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireCustomerOrAdmin,
  requireCustomerOwnership,
} from "../middleware/auth.js";
import { asyncHandler, ValidationError } from "../middleware/errorHandler.js";

const router = express.Router();

// Get timeline events for a customer's vehicle service history
router.get(
  "/customer/:customerId",
  authenticateToken,
  requireCustomerOwnership,
  [
    param("customerId").isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
    query("eventType")
      .optional()
      .isIn([
        "service_completed",
        "issue_found",
        "part_replaced",
        "recommendation_made",
        "follow_up_scheduled",
        "warranty_expires",
      ]),
    query("severity")
      .optional()
      .isIn(["info", "warning", "critical", "success"]),
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

    const customerId = req.params.customerId;
    const { limit = 20, offset = 0, eventType, severity } = req.query;

    // Build the main query
    let query = `
      SELECT 
        ste.*,
        sh.service_date,
        sh.car_brand,
        sh.car_model,
        sh.car_year,
        sh.cost as service_cost,
        s.name as service_name,
        CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
      FROM service_timeline_events ste
      JOIN service_history sh ON ste.service_history_id = sh.id
      JOIN services s ON sh.service_id = s.id
      LEFT JOIN mechanics m ON ste.mechanic_id = m.id
      WHERE sh.user_id = ?
    `;
    const params = [customerId];

    if (eventType) {
      query += " AND ste.event_type = ?";
      params.push(eventType);
    }

    if (severity) {
      query += " AND ste.severity = ?";
      params.push(severity);
    }

    query += ` ORDER BY ste.event_date DESC, ste.event_time DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const timelineEvents = await executeQuery(query, params);

    // Process JSON fields
    const processedEvents = timelineEvents.map((event) => ({
      ...event,
      related_parts: event.related_parts ? JSON.parse(event.related_parts) : [],
      before_photos: event.before_photos ? JSON.parse(event.before_photos) : [],
      after_photos: event.after_photos ? JSON.parse(event.after_photos) : [],
      warranty_info: event.warranty_info
        ? JSON.parse(event.warranty_info)
        : null,
    }));

    // Get summary statistics
    const summary = await executeQuery(
      `SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_events,
        COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_events,
        COUNT(CASE WHEN event_type = 'service_completed' THEN 1 END) as completed_services,
        COUNT(CASE WHEN event_type = 'recommendation_made' THEN 1 END) as recommendations_made,
        MIN(event_date) as first_event_date,
        MAX(event_date) as last_event_date
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       WHERE sh.user_id = ?`,
      [customerId]
    );

    // Get events grouped by service for timeline visualization
    const servicesTimeline = await executeQuery(
      `SELECT 
        sh.id as service_history_id,
        sh.service_date,
        sh.car_brand,
        sh.car_model,
        sh.car_year,
        s.name as service_name,
        sh.cost,
        COUNT(ste.id) as event_count,
        GROUP_CONCAT(ste.event_type ORDER BY ste.event_date, ste.event_time) as event_types,
        MAX(CASE WHEN ste.severity = 'critical' THEN ste.event_title END) as critical_issues
       FROM service_history sh
       JOIN services s ON sh.service_id = s.id
       LEFT JOIN service_timeline_events ste ON sh.id = ste.service_history_id
       WHERE sh.user_id = ?
       GROUP BY sh.id
       ORDER BY sh.service_date DESC`,
      [customerId]
    );

    res.json({
      success: true,
      data: {
        timeline_events: processedEvents,
        services_timeline: servicesTimeline,
        summary: summary[0],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: processedEvents.length,
        },
      },
    });
  })
);

// Get timeline events for a specific service
router.get(
  "/service/:serviceHistoryId",
  authenticateToken,
  [
    param("serviceHistoryId").isInt({ min: 1 }),
    query("includePhotos").optional().isBoolean(),
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

    const serviceHistoryId = req.params.serviceHistoryId;
    const { includePhotos = false } = req.query;

    // Check if service history exists and user has access
    const serviceHistory = await getSingleRecord(
      `SELECT sh.*, u.id as user_id 
       FROM service_history sh
       JOIN users u ON sh.user_id = u.id
       WHERE sh.id = ?`,
      [serviceHistoryId]
    );

    if (!serviceHistory) {
      throw new ValidationError("Service history not found");
    }

    // Check ownership or admin access
    if (req.user.role !== "admin" && String(serviceHistory.user_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Get timeline events for this service
    let query = `
      SELECT 
        ste.*,
        CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM service_timeline_events ste
       LEFT JOIN mechanics m ON ste.mechanic_id = m.id
       WHERE ste.service_history_id = ?
       ORDER BY ste.event_date, ste.event_time
    `;
    const params = [serviceHistoryId];

    const timelineEvents = await executeQuery(query, params);

    // Process JSON fields
    const processedEvents = timelineEvents.map((event) => {
      const processed = {
        ...event,
        related_parts: event.related_parts
          ? JSON.parse(event.related_parts)
          : [],
        warranty_info: event.warranty_info
          ? JSON.parse(event.warranty_info)
          : null,
      };

      // Include photos only if requested
      if (includePhotos) {
        processed.before_photos = event.before_photos
          ? JSON.parse(event.before_photos)
          : [];
        processed.after_photos = event.after_photos
          ? JSON.parse(event.after_photos)
          : [];
      }

      return processed;
    });

    // Group events by type for better visualization
    const eventsByType = processedEvents.reduce((acc, event) => {
      if (!acc[event.event_type]) {
        acc[event.event_type] = [];
      }
      acc[event.event_type].push(event);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        service_history: {
          id: serviceHistory.id,
          service_date: serviceHistory.service_date,
          car_brand: serviceHistory.car_brand,
          car_model: serviceHistory.car_model,
          car_year: serviceHistory.car_year,
          cost: serviceHistory.cost,
        },
        timeline_events: processedEvents,
        events_by_type: eventsByType,
        total_events: processedEvents.length,
      },
    });
  })
);

// Create new timeline event
router.post(
  "/service/:serviceHistoryId",
  authenticateToken,
  [
    param("serviceHistoryId").isInt({ min: 1 }),
    body("eventType")
      .isIn([
        "service_completed",
        "issue_found",
        "part_replaced",
        "recommendation_made",
        "follow_up_scheduled",
        "warranty_expires",
      ])
      .withMessage("Invalid event type"),
    body("eventDate").isISO8601().withMessage("Valid event date is required"),
    body("eventTime")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Valid event time is required (HH:MM format)"),
    body("eventTitle")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage(
        "Event title is required and must not exceed 255 characters"
      ),
    body("eventDescription")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Event description must not exceed 1000 characters"),
    body("severity")
      .optional()
      .isIn(["info", "warning", "critical", "success"])
      .withMessage("Invalid severity level"),
    body("cost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cost must be a positive number"),
    body("mechanicId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid mechanic ID is required"),
    body("relatedParts")
      .optional()
      .isArray()
      .withMessage("Related parts must be an array"),
    body("beforePhotos")
      .optional()
      .isArray()
      .withMessage("Before photos must be an array"),
    body("afterPhotos")
      .optional()
      .isArray()
      .withMessage("After photos must be an array"),
    body("warrantyInfo")
      .optional()
      .isObject()
      .withMessage("Warranty info must be an object"),
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

    const serviceHistoryId = req.params.serviceHistoryId;
    const {
      eventType,
      eventDate,
      eventTime,
      eventTitle,
      eventDescription,
      severity = "info",
      cost,
      mechanicId,
      relatedParts,
      beforePhotos,
      afterPhotos,
      warrantyInfo,
    } = req.body;

    // Check if service history exists and user has access
    const serviceHistory = await getSingleRecord(
      `SELECT sh.*, u.id as user_id 
       FROM service_history sh
       JOIN users u ON sh.user_id = u.id
       WHERE sh.id = ?`,
      [serviceHistoryId]
    );

    if (!serviceHistory) {
      throw new ValidationError("Service history not found");
    }

    // Check ownership or admin/mechanic access
    if (
      req.user.role !== "admin" &&
      req.user.role !== "mechanic" &&
      String(serviceHistory.user_id) !== String(req.user.id)
    ) {
      throw new ValidationError("Access denied");
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

    // Create timeline event
    const eventId = await executeQuery(
      `INSERT INTO service_timeline_events 
       (service_history_id, event_type, event_date, event_time, event_title, event_description, severity, cost, mechanic_id, related_parts, before_photos, after_photos, warranty_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceHistoryId,
        eventType,
        eventDate,
        eventTime || null,
        eventTitle,
        eventDescription || null,
        severity,
        cost || null,
        mechanicId || null,
        relatedParts ? JSON.stringify(relatedParts) : null,
        beforePhotos ? JSON.stringify(beforePhotos) : null,
        afterPhotos ? JSON.stringify(afterPhotos) : null,
        warrantyInfo ? JSON.stringify(warrantyInfo) : null,
      ]
    );

    const newEvent = await getSingleRecord(
      `SELECT ste.*, CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM service_timeline_events ste
       LEFT JOIN mechanics m ON ste.mechanic_id = m.id
       WHERE ste.id = ?`,
      [eventId]
    );

    // Process JSON fields
    newEvent.related_parts = newEvent.related_parts
      ? JSON.parse(newEvent.related_parts)
      : [];
    newEvent.before_photos = newEvent.before_photos
      ? JSON.parse(newEvent.before_photos)
      : [];
    newEvent.after_photos = newEvent.after_photos
      ? JSON.parse(newEvent.after_photos)
      : [];
    newEvent.warranty_info = newEvent.warranty_info
      ? JSON.parse(newEvent.warranty_info)
      : null;

    res.status(201).json({
      success: true,
      message: "Timeline event created successfully",
      data: { timeline_event: newEvent },
    });
  })
);

// Update timeline event
router.put(
  "/:eventId",
  authenticateToken,
  [
    param("eventId").isInt({ min: 1 }),
    body("eventTitle")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Event title must not exceed 255 characters"),
    body("eventDescription")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Event description must not exceed 1000 characters"),
    body("severity")
      .optional()
      .isIn(["info", "warning", "critical", "success"])
      .withMessage("Invalid severity level"),
    body("cost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cost must be a positive number"),
    body("relatedParts")
      .optional()
      .isArray()
      .withMessage("Related parts must be an array"),
    body("beforePhotos")
      .optional()
      .isArray()
      .withMessage("Before photos must be an array"),
    body("afterPhotos")
      .optional()
      .isArray()
      .withMessage("After photos must be an array"),
    body("warrantyInfo")
      .optional()
      .isObject()
      .withMessage("Warranty info must be an object"),
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

    const eventId = req.params.eventId;

    // Check if event exists and get ownership info
    const existingEvent = await getSingleRecord(
      `SELECT ste.*, sh.user_id 
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       WHERE ste.id = ?`,
      [eventId]
    );

    if (!existingEvent) {
      throw new ValidationError("Timeline event not found");
    }

    // Check ownership or admin/mechanic access
    if (
      req.user.role !== "admin" &&
      req.user.role !== "mechanic" &&
      String(existingEvent.user_id) !== String(req.user.id)
    ) {
      throw new ValidationError("Access denied");
    }

    const {
      eventTitle,
      eventDescription,
      severity,
      cost,
      relatedParts,
      beforePhotos,
      afterPhotos,
      warrantyInfo,
    } = req.body;

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (eventTitle !== undefined) {
      updateFields.push("event_title = ?");
      updateValues.push(eventTitle);
    }

    if (eventDescription !== undefined) {
      updateFields.push("event_description = ?");
      updateValues.push(eventDescription);
    }

    if (severity !== undefined) {
      updateFields.push("severity = ?");
      updateValues.push(severity);
    }

    if (cost !== undefined) {
      updateFields.push("cost = ?");
      updateValues.push(cost);
    }

    if (relatedParts !== undefined) {
      updateFields.push("related_parts = ?");
      updateValues.push(JSON.stringify(relatedParts));
    }

    if (beforePhotos !== undefined) {
      updateFields.push("before_photos = ?");
      updateValues.push(JSON.stringify(beforePhotos));
    }

    if (afterPhotos !== undefined) {
      updateFields.push("after_photos = ?");
      updateValues.push(JSON.stringify(afterPhotos));
    }

    if (warrantyInfo !== undefined) {
      updateFields.push("warranty_info = ?");
      updateValues.push(JSON.stringify(warrantyInfo));
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateValues.push(eventId);

    // Update timeline event
    await executeQuery(
      `UPDATE service_timeline_events SET ${updateFields.join(
        ", "
      )} WHERE id = ?`,
      updateValues
    );

    const updatedEvent = await getSingleRecord(
      `SELECT ste.*, CONCAT(m.first_name, ' ', m.last_name) as mechanic_name
       FROM service_timeline_events ste
       LEFT JOIN mechanics m ON ste.mechanic_id = m.id
       WHERE ste.id = ?`,
      [eventId]
    );

    // Process JSON fields
    updatedEvent.related_parts = updatedEvent.related_parts
      ? JSON.parse(updatedEvent.related_parts)
      : [];
    updatedEvent.before_photos = updatedEvent.before_photos
      ? JSON.parse(updatedEvent.before_photos)
      : [];
    updatedEvent.after_photos = updatedEvent.after_photos
      ? JSON.parse(updatedEvent.after_photos)
      : [];
    updatedEvent.warranty_info = updatedEvent.warranty_info
      ? JSON.parse(updatedEvent.warranty_info)
      : null;

    res.json({
      success: true,
      message: "Timeline event updated successfully",
      data: { timeline_event: updatedEvent },
    });
  })
);

// Delete timeline event
router.delete(
  "/:eventId",
  authenticateToken,
  [param("eventId").isInt({ min: 1 })],
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

    const eventId = req.params.eventId;

    // Check if event exists and get ownership info
    const existingEvent = await getSingleRecord(
      `SELECT ste.*, sh.user_id 
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       WHERE ste.id = ?`,
      [eventId]
    );

    if (!existingEvent) {
      throw new ValidationError("Timeline event not found");
    }

    // Check ownership or admin access
    if (req.user.role !== "admin" && String(existingEvent.user_id) !== String(req.user.id)) {
      throw new ValidationError("Access denied");
    }

    // Delete timeline event
    await executeQuery("DELETE FROM service_timeline_events WHERE id = ?", [
      eventId,
    ]);

    res.json({
      success: true,
      message: "Timeline event deleted successfully",
    });
  })
);

// Get timeline statistics
router.get(
  "/customer/:customerId/stats",
  authenticateToken,
  requireCustomerOwnership,
  [param("customerId").isInt({ min: 1 })],
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

    const customerId = req.params.customerId;

    // Get event type distribution
    const eventTypeStats = await executeQuery(
      `SELECT 
        ste.event_type,
        COUNT(*) as count,
        AVG(ste.cost) as average_cost
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       WHERE sh.user_id = ?
       GROUP BY ste.event_type
       ORDER BY count DESC`,
      [customerId]
    );

    // Get severity distribution
    const severityStats = await executeQuery(
      `SELECT 
        ste.severity,
        COUNT(*) as count
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       WHERE sh.user_id = ?
       GROUP BY ste.severity
       ORDER BY 
         CASE ste.severity 
           WHEN 'critical' THEN 1 
           WHEN 'warning' THEN 2 
           WHEN 'info' THEN 3 
           WHEN 'success' THEN 4 
         END`,
      [customerId]
    );

    // Get mechanic activity
    const mechanicStats = await executeQuery(
      `SELECT 
        CONCAT(m.first_name, ' ', m.last_name) as mechanic_name,
        COUNT(ste.id) as event_count,
        SUM(ste.cost) as total_cost
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       LEFT JOIN mechanics m ON ste.mechanic_id = m.id
       WHERE sh.user_id = ? AND ste.mechanic_id IS NOT NULL
       GROUP BY ste.mechanic_id, m.first_name, m.last_name
       ORDER BY event_count DESC
       LIMIT 5`,
      [customerId]
    );

    // Get recent critical issues
    const criticalIssues = await executeQuery(
      `SELECT 
        ste.*,
        sh.service_date,
        sh.car_brand,
        sh.car_model,
        sh.car_year,
        s.name as service_name
       FROM service_timeline_events ste
       JOIN service_history sh ON ste.service_history_id = sh.id
       JOIN services s ON sh.service_id = s.id
       WHERE sh.user_id = ?
       AND ste.severity = 'critical'
       AND ste.event_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
       ORDER BY ste.event_date DESC
       LIMIT 10`,
      [customerId]
    );

    res.json({
      success: true,
      data: {
        event_type_distribution: eventTypeStats,
        severity_distribution: severityStats,
        mechanic_activity: mechanicStats,
        recent_critical_issues: criticalIssues,
      },
    });
  })
);

export default router;
