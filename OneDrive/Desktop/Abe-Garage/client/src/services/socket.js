import { io } from "socket.io-client";
import { getToken } from "./api";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.appointmentListeners = new Map();
  }

  // Get socket URL from API base URL
  getSocketUrl() {
    const apiBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    // Remove /api from the end to get the base server URL
    return apiBaseUrl.replace(/\/api$/, "");
  }

  // Connect to Socket.io server
  connect() {
    if (this.socket) {
      return this.socket;
    }

    const token = getToken();

    // For development, allow connections without token
    const socketUrl = this.getSocketUrl();
    this.socket = io(socketUrl, {
      auth: token
        ? {
            token: token,
          }
        : {},
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅ Connected to server via Socket.io");
      this.isConnected = true;
      this.emit("socket_connected", { connected: true });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.isConnected = false;
      this.emit("socket_disconnected", { reason });
    });

    this.socket.on("connect_error", (error) => {
      console.error("🚫 Socket connection error:", error.message);
      // Don't emit error events for development without auth
      if (error.message.includes("Authentication")) {
        console.log("🔓 Continuing without authentication in development mode");
      } else {
        this.emit("socket_error", { error: error.message });
      }
    });

    // Authentication error
    this.socket.on("error", (error) => {
      console.error("🚫 Socket error:", error);
      // Don't treat auth errors as critical in development
    });

    return this.socket;
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      this.appointmentListeners.clear();
    }
  }

  // Check if connected
  isConnectedToServer() {
    return this.socket && this.isConnected;
  }

  // Generic event listener
  on(event, callback) {
    if (!this.socket) {
      // Store listener for when socket connects
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      console.log(
        `📝 Stored listener for event: ${event} (will activate when connected)`
      );
      return;
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event
  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected. Cannot emit event:", event);
      return false;
    }

    this.socket.emit(event, data);
    return true;
  }

  // Join appointment room for real-time updates
  joinAppointment(appointmentId) {
    if (!this.socket || !this.isConnected) {
      console.warn(
        "⚠️ Socket not connected. Cannot join appointment:",
        appointmentId
      );
      return;
    }

    this.emit("join_appointment", appointmentId);
    console.log(`👥 Joined appointment room: ${appointmentId}`);
  }

  // Leave appointment room
  leaveAppointment(appointmentId) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.emit("leave_appointment", appointmentId);
    console.log(`👋 Left appointment room: ${appointmentId}`);
  }

  // Send chat message
  sendMessage(
    appointmentId,
    message,
    type = "text",
    fileUrl = null,
    fileName = null
  ) {
    return this.emit("send_message", {
      appointmentId,
      message,
      type,
      fileUrl,
      fileName,
    });
  }

  // Update appointment progress (admin/mechanic only)
  updateProgress(appointmentId, status, message) {
    return this.emit("update_progress", {
      appointmentId,
      status,
      message,
    });
  }

  // Typing indicators
  startTyping(appointmentId) {
    this.emit("typing_start", { appointmentId });
  }

  stopTyping(appointmentId) {
    this.emit("typing_stop", { appointmentId });
  }

  // Real-time appointment updates
  onAppointmentUpdate(callback) {
    this.on("appointment_update", callback);
    this.on("status_update", callback);
    this.on("appointment_progress", callback);
  }

  // Real-time progress updates
  onProgressUpdate(callback) {
    this.on("progress_update", callback);
  }

  // Chat message events
  onNewMessage(callback) {
    this.on("new_message", callback);
  }

  // Typing indicators
  onUserTyping(callback) {
    this.on("user_typing", callback);
  }

  // Notification events
  onNotification(callback) {
    this.on("notification", callback);
    this.on("low_stock_alert", callback);
    this.on("appointment_reminder", callback);
  }

  // Unread message alerts
  onUnreadMessage(callback) {
    this.on("unread_message", callback);
  }

  // Clean up all listeners for appointment
  cleanupAppointmentListeners(appointmentId) {
    const appointmentEvents = [
      "new_message",
      "progress_update",
      "status_update",
      "appointment_update",
      "appointment_progress",
      "user_typing",
    ];

    appointmentEvents.forEach((event) => {
      // Remove all listeners for this appointment-related event
      const listeners = this.listeners.get(event) || [];
      listeners.forEach((callback) => {
        this.socket?.off(event, callback);
      });
    });
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null,
    };
  }

  // Join role-based room
  joinRoleRoom(role) {
    if (this.socket && this.isConnected) {
      // Users automatically join role rooms on connection
      // This method is for explicit room joining if needed
      console.log(`User in role room: ${role}`);
    }
  }

  // Send location update (for mechanics)
  updateLocation(location) {
    return this.emit("location_update", {
      mechanicId: this.getUserId(),
      location,
    });
  }

  // Get user ID from token
  getUserId() {
    const token = getToken();
    if (!token) return null;

    try {
      // JWT token is base64 encoded, decode to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  }

  // Get user role from token
  getUserRole() {
    const token = getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  }

  // Reconnect with new token
  reconnectWithToken(newToken) {
    this.disconnect();

    // Small delay to ensure cleanup
    setTimeout(() => {
      // Temporarily store token
      const originalToken = localStorage.getItem("token");
      if (originalToken !== newToken) {
        localStorage.setItem("token", newToken);
      }

      this.connect();
    }, 100);
  }

  // Activate stored listeners when socket connects
  activateStoredListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        if (this.socket) {
          this.socket.on(event, callback);
        }
      });
    });
  }
}

// Create singleton instance
const socketService = new SocketService();

// Auto-connect when token is available or in development mode
const checkAndConnect = () => {
  const token = getToken();
  if (!socketService.isConnectedToServer()) {
    console.log("🔄 Attempting to connect to Socket.io...");
    socketService.connect();

    // Activate stored listeners after connection
    setTimeout(() => {
      socketService.activateStoredListeners();
    }, 1000);
  }
};

// Check for token on page load
checkAndConnect();

// Check periodically for token changes
setInterval(checkAndConnect, 10000);

export default socketService;
