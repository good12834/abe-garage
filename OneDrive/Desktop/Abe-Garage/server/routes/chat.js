import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import {
  authenticateToken,
  requireCustomerOrAdmin,
} from "../middleware/auth.js";
import { asyncHandler, ValidationError } from "../middleware/errorHandler.js";
import { emitNewMessage } from "../services/socket.js";

const router = express.Router();

// Get chat messages for an appointment
router.get(
  "/appointment/:id",
  authenticateToken,
  requireCustomerOrAdmin,
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

    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify user has access to this appointment
    const appointment = await getSingleRecord(
      `SELECT a.*, u.id as customer_id
       FROM appointments a
       JOIN users u ON a.customer_id = u.id
       WHERE a.id = ? AND (u.id = ? OR ? IN ('admin', 'mechanic'))`,
      [appointmentId, userId, userRole]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found or access denied");
    }

    // Get messages
    const messages = await executeQuery(
      `SELECT 
        cm.*,
        CASE 
          WHEN cm.sender_role = 'customer' THEN CONCAT(u.first_name, ' ', u.last_name)
          WHEN cm.sender_role = 'admin' THEN 'Admin'
          WHEN cm.sender_role = 'mechanic' THEN CONCAT(m.first_name, ' ', m.last_name)
        END as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id AND cm.sender_role = 'customer'
      LEFT JOIN mechanics m ON cm.sender_id = m.id AND cm.sender_role = 'mechanic'
      WHERE cm.appointment_id = ?
      ORDER BY cm.created_at ASC`,
      [appointmentId]
    );

    // Mark messages as read for current user
    await executeQuery(
      `UPDATE chat_messages 
       SET is_read = TRUE, 
           read_by = JSON_ARRAY_APPEND(COALESCE(read_by, '[]'), '$', ?)
       WHERE appointment_id = ? AND sender_id != ?`,
      [userId, appointmentId, userId]
    );

    res.json({
      success: true,
      data: {
        messages,
        appointment: {
          id: appointment.id,
          customer_id: appointment.customer_id,
          status: appointment.status,
        },
      },
    });
  })
);

// Send a new message
router.post(
  "/send",
  authenticateToken,
  requireCustomerOrAdmin,
  [
    body("appointmentId")
      .isInt({ min: 1 })
      .withMessage("Valid appointment ID is required"),
    body("message")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message is required and must be under 1000 characters"),
    body("messageType")
      .optional()
      .isIn(["text", "image", "file"])
      .withMessage("Invalid message type"),
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
      appointmentId,
      message,
      messageType = "text",
      fileUrl,
      fileName,
    } = req.body;

    const senderId = req.user.id;
    const senderRole = req.user.role;

    // Verify access to appointment
    const appointment = await getSingleRecord(
      `SELECT a.*, u.id as customer_id
       FROM appointments a
       JOIN users u ON a.customer_id = u.id
       WHERE a.id = ? AND (u.id = ? OR ? IN ('admin', 'mechanic'))`,
      [appointmentId, senderId, senderRole]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found or access denied");
    }

    // For image/file messages, fileUrl is required
    if ((messageType === "image" || messageType === "file") && !fileUrl) {
      throw new ValidationError("File URL is required for image/file messages");
    }

    // Create message
    const messageId = await executeQuery(
      `INSERT INTO chat_messages 
      (appointment_id, sender_id, sender_role, message, message_type, file_url, file_name, read_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, JSON_ARRAY(?))`,
      [
        appointmentId,
        senderId,
        senderRole,
        message,
        messageType,
        fileUrl || null,
        fileName || null,
        senderId, // Mark as read by sender
      ]
    );

    // Get the created message with sender info
    const newMessage = await getSingleRecord(
      `SELECT 
        cm.*,
        CASE 
          WHEN cm.sender_role = 'customer' THEN CONCAT(u.first_name, ' ', u.last_name)
          WHEN cm.sender_role = 'admin' THEN 'Admin'
          WHEN cm.sender_role = 'mechanic' THEN CONCAT(m.first_name, ' ', m.last_name)
        END as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id AND cm.sender_role = 'customer'
      LEFT JOIN mechanics m ON cm.sender_id = m.id AND cm.sender_role = 'mechanic'
      WHERE cm.id = ?`,
      [messageId]
    );

    // Get recipients (customer and assigned mechanic if any)
    const recipients = [];
    recipients.push(appointment.customer_id); // Customer

    if (appointment.mechanic_id) {
      recipients.push(appointment.mechanic_id);
    }

    // Emit real-time message
    emitNewMessage(appointmentId, newMessage, recipients);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: { message: newMessage },
    });
  })
);

// Mark messages as read
router.put(
  "/appointment/:id/read",
  authenticateToken,
  requireCustomerOrAdmin,
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

    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify access
    const appointment = await getSingleRecord(
      `SELECT a.*, u.id as customer_id
       FROM appointments a
       JOIN users u ON a.customer_id = u.id
       WHERE a.id = ? AND (u.id = ? OR ? IN ('admin', 'mechanic'))`,
      [appointmentId, userId, userRole]
    );

    if (!appointment) {
      throw new ValidationError("Appointment not found or access denied");
    }

    // Update read status
    await executeQuery(
      `UPDATE chat_messages 
       SET is_read = TRUE,
           read_by = JSON_ARRAY_APPEND(COALESCE(read_by, '[]'), '$', ?)
       WHERE appointment_id = ? AND sender_id != ?`,
      [userId, appointmentId, userId]
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  })
);

// Get unread message count for user
router.get(
  "/unread-count",
  authenticateToken,
  requireCustomerOrAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT COUNT(*) as unread_count
      FROM chat_messages cm
      JOIN appointments a ON cm.appointment_id = a.id
      WHERE cm.sender_id != ?
      AND JSON_CONTAINS(COALESCE(cm.read_by, '[]'), ? ) = FALSE
    `;

    const params = [userId, userId.toString()];

    // If customer, only count messages from their appointments
    if (userRole === "customer") {
      query += ` AND a.customer_id = ?`;
      params.push(userId);
    }

    const result = await executeQuery(query, params);
    const unreadCount = result[0].unread_count;

    res.json({
      success: true,
      data: { unreadCount },
    });
  })
);

// Get chat list for user (latest message per appointment)
router.get(
  "/conversations",
  authenticateToken,
  requireCustomerOrAdmin,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        a.id as appointment_id,
        a.status as appointment_status,
        a.appointment_date,
        s.name as service_name,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        cm.message as last_message,
        cm.message_type,
        cm.created_at as last_message_time,
        cm.sender_role as last_sender_role,
        COUNT(CASE WHEN cm.sender_id != ? AND JSON_CONTAINS(COALESCE(cm.read_by, '[]'), ?) = FALSE THEN 1 END) as unread_count,
        MAX(cm.created_at) as latest_message_time
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users c ON a.customer_id = c.id
      JOIN chat_messages cm ON a.id = cm.appointment_id
      WHERE 1=1
    `;

    const params = [userId, userId.toString()];

    // Filter by user role
    if (userRole === "customer") {
      query += ` AND a.customer_id = ?`;
      params.push(userId);
    } else if (userRole === "mechanic") {
      query += ` AND (a.mechanic_id = ? OR cm.sender_id = ?)`;
      params.push(userId, userId);
    } else {
      // Admin can see all
      query += ` AND (cm.sender_id = ? OR a.customer_id IN (SELECT id FROM users WHERE role = 'customer'))`;
      params.push(userId);
    }

    query += `
      GROUP BY a.id
      ORDER BY latest_message_time DESC
      LIMIT 20
    `;

    const conversations = await executeQuery(query, params);

    res.json({
      success: true,
      data: { conversations },
    });
  })
);

// Delete message (admin only or message sender)
router.delete(
  "/message/:id",
  authenticateToken,
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

    const messageId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get message with appointment info
    const message = await getSingleRecord(
      `SELECT cm.*, a.customer_id
       FROM chat_messages cm
       JOIN appointments a ON cm.appointment_id = a.id
       WHERE cm.id = ?`,
      [messageId]
    );

    if (!message) {
      throw new ValidationError("Message not found");
    }

    // Check if user can delete (admin or sender)
    if (userRole !== "admin" && message.sender_id !== userId) {
      throw new ValidationError("Access denied");
    }

    // Delete message
    await executeQuery("DELETE FROM chat_messages WHERE id = ?", [messageId]);

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  })
);

// Upload file for chat (returns file URL for message)
router.post(
  "/upload",
  authenticateToken,
  requireCustomerOrAdmin,
  [
    body("appointmentId")
      .isInt({ min: 1 })
      .withMessage("Valid appointment ID is required"),
    body("fileName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("File name is required"),
    body("fileType").isIn(["image", "file"]).withMessage("Invalid file type"),
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

    const { appointmentId, fileName, fileType } = req.body;
    const userId = req.user.id;

    // This is a placeholder - in a real implementation, you would:
    // 1. Handle file upload to cloud storage (AWS S3, Google Cloud, etc.)
    // 2. Validate file size and type
    // 3. Return the public URL

    // For now, return a mock URL
    const mockFileUrl = `/uploads/chat/${appointmentId}/${Date.now()}_${fileName}`;

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileUrl: mockFileUrl,
        fileName,
        fileType,
      },
    });
  })
);

export default router;
