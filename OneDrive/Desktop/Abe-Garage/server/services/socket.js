import { Server } from "socket.io";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { getSingleRecord } from "../config/database.js";

let io;

export const initializeSocket = (server, corsOptions = {}) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173", // Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
      ...corsOptions,
    },
    transports: ["websocket", "polling"],
  });

  // Socket.io middleware for authentication (optional for development)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      // Allow connections without token for development
      if (!token) {
        console.log("🔓 Socket connection without token (development mode)");
        socket.user = { id: 0, role: "guest", email: "guest@localhost" };
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      // Get user details from database
      const user = await getSingleRecord(
        "SELECT id, email, first_name, last_name, role FROM users WHERE id = ?",
        [decoded.id]
      );

      if (!user) {
        console.log("⚠️ Socket user not found, allowing guest connection");
        socket.user = { id: 0, role: "guest", email: "guest@localhost" };
        return next();
      }

      socket.user = user;
      next();
    } catch (error) {
      console.log(
        "⚠️ Socket auth error, allowing guest connection:",
        error.message
      );
      // Allow connection without authentication for development
      socket.user = { id: 0, role: "guest", email: "guest@localhost" };
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ User connected: ${socket.user.email} (${socket.user.role})`
    );

    // Join room based on user role
    socket.join(`user_${socket.user.id}`);
    socket.join(`role_${socket.user.role}`);

    // Handle appointment updates
    socket.on("join_appointment", (appointmentId) => {
      socket.join(`appointment_${appointmentId}`);
      console.log(
        `User ${socket.user.email} joined appointment ${appointmentId}`
      );
    });

    socket.on("leave_appointment", (appointmentId) => {
      socket.leave(`appointment_${appointmentId}`);
      console.log(
        `User ${socket.user.email} left appointment ${appointmentId}`
      );
    });

    // Handle chat messages
    socket.on("send_message", async (data) => {
      try {
        const { appointmentId, message, type = "text" } = data;

        if (!appointmentId || !message) {
          socket.emit("error", "Invalid message data");
          return;
        }

        // Create message object
        const messageData = {
          id: Date.now().toString(),
          appointmentId,
          message,
          type,
          sender: {
            id: socket.user.id,
            name: `${socket.user.first_name || "Guest"} ${
              socket.user.last_name || ""
            }`.trim(),
            role: socket.user.role,
          },
          timestamp: new Date().toISOString(),
          readBy: [socket.user.id],
        };

        // Save to database (implement later)
        // await saveMessage(messageData);

        // Broadcast to appointment room
        io.to(`appointment_${appointmentId}`).emit("new_message", messageData);
      } catch (error) {
        socket.emit("error", "Failed to send message");
      }
    });

    // Handle real-time progress updates
    socket.on("update_progress", async (data) => {
      try {
        const { appointmentId, status, message } = data;

        // Verify user has permission (admin or mechanic only)
        if (socket.user.role !== "admin" && socket.user.role !== "mechanic") {
          socket.emit("error", "Unauthorized");
          return;
        }

        // Create progress update
        const progressUpdate = {
          id: Date.now().toString(),
          appointmentId,
          status,
          message,
          updatedBy: {
            id: socket.user.id,
            name: `${socket.user.first_name} ${socket.user.last_name}`,
            role: socket.user.role,
          },
          timestamp: new Date().toISOString(),
        };

        // Broadcast to customer
        io.to(`appointment_${appointmentId}`).emit(
          "progress_update",
          progressUpdate
        );

        console.log(
          `Progress update for appointment ${appointmentId}: ${status} - ${message}`
        );
      } catch (error) {
        socket.emit("error", "Failed to update progress");
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.to(`appointment_${data.appointmentId}`).emit("user_typing", {
        userId: socket.user.id,
        userName: `${socket.user.first_name || "Guest"} ${
          socket.user.last_name || ""
        }`.trim(),
        typing: true,
      });
    });

    socket.on("typing_stop", (data) => {
      socket.to(`appointment_${data.appointmentId}`).emit("user_typing", {
        userId: socket.user.id,
        userName: `${socket.user.first_name || "Guest"} ${
          socket.user.last_name || ""
        }`.trim(),
        typing: false,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.email}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Utility functions for emitting events
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role_${role}`).emit(event, data);
  }
};

export const emitToAppointment = (appointmentId, event, data) => {
  if (io) {
    io.to(`appointment_${appointmentId}`).emit(event, data);
  }
};

// Service-specific event emitters
export const emitAppointmentStatusUpdate = (
  appointmentId,
  status,
  customerId
) => {
  emitToAppointment(appointmentId, "status_update", {
    appointmentId,
    status,
    timestamp: new Date().toISOString(),
  });
  emitToUser(customerId, "appointment_update", {
    appointmentId,
    status,
    timestamp: new Date().toISOString(),
  });
};

export const emitProgressUpdate = (appointmentId, update, customerId) => {
  emitToAppointment(appointmentId, "progress_update", update);
  emitToUser(customerId, "appointment_progress", {
    appointmentId,
    update,
    timestamp: new Date().toISOString(),
  });
};

export const emitNewMessage = (appointmentId, message, recipients) => {
  emitToAppointment(appointmentId, "new_message", message);
  recipients.forEach((recipientId) => {
    emitToUser(recipientId, "unread_message", {
      appointmentId,
      message,
      timestamp: new Date().toISOString(),
    });
  });
};

export const emitLowStockAlert = (partName, currentStock) => {
  emitToRole("admin", "low_stock_alert", {
    partName,
    currentStock,
    timestamp: new Date().toISOString(),
  });
};

export const emitAppointmentReminder = (appointmentId, customerId, message) => {
  emitToUser(customerId, "appointment_reminder", {
    appointmentId,
    message,
    timestamp: new Date().toISOString(),
  });
};

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToAppointment,
  emitAppointmentStatusUpdate,
  emitProgressUpdate,
  emitNewMessage,
  emitLowStockAlert,
  emitAppointmentReminder,
};
