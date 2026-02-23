import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
// Restart trigger 3
// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import vehicleRoutes from "./routes/vehicles.js";
import serviceRoutes from "./routes/services.js";
import appointmentRoutes from "./routes/appointments.js";
import mechanicRoutes from "./routes/mechanics.js";
import invoiceRoutes from "./routes/invoices.js";
import partsRoutes from "./routes/parts.js";
import chatRoutes from "./routes/chat.js";
import serviceHistoryRoutes from "./routes/serviceHistory.js";
import paymentRoutes from "./routes/payments.js";
import certificationsRoutes from "./routes/certifications.js";
import serviceBaysRoutes from "./routes/serviceBays.js";
import vehicleHealthRoutes from "./routes/vehicleHealth.js";
import serviceTimelineRoutes from "./routes/serviceTimeline.js";
import predictiveMaintenanceRoutes from "./routes/predictiveMaintenance.js";
import loyaltyRoutes from "./routes/loyalty.js";
// New feature routes
import servicePackagesRoutes from "./routes/servicePackages.js";
import couponsRoutes from "./routes/coupons.js";
import customerPreferencesRoutes from "./routes/customerPreferences.js";
import referralsRoutes from "./routes/referrals.js";
import emergencyServicesRoutes from "./routes/emergencyServices.js";
import vehicleRecallsRoutes from "./routes/vehicleRecalls.js";
import serviceAddonsRoutes from "./routes/serviceAddons.js";
import waitingListRoutes from "./routes/waitingList.js";
import analyticsRoutes from "./routes/analytics.js";
// Import middleware
import { authenticateToken } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
// Import database
import { testConnection } from "./config/database.js";
// Import Socket.io service
import { initializeSocket } from "./services/socket.js";
// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers));
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3004",
      // MAMP origins
      "http://localhost",
      "http://localhost:80",
      "http://localhost:8080",
      "http://127.0.0.1:80",
      "http://127.0.0.1:8080",
    ],
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers));
  console.log("Body:", JSON.stringify(req.body));
  next();
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend build files from client/dist
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Abe Garage API is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/service-history", serviceHistoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/certifications", certificationsRoutes);
app.use("/api/service-bays", serviceBaysRoutes);
app.use("/api/vehicle-health", vehicleHealthRoutes);
app.use("/api/service-timeline", serviceTimelineRoutes);
app.use("/api/predictive-maintenance", predictiveMaintenanceRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/service-packages", servicePackagesRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/preferences", customerPreferencesRoutes);
app.use("/api/referrals", referralsRoutes);
app.use("/api/emergency", emergencyServicesRoutes);
app.use("/api/recalls", vehicleRecallsRoutes);
app.use("/api/addons", serviceAddonsRoutes);
app.use("/api/waiting-list", waitingListRoutes);
app.use("/api/analytics", analyticsRoutes);

// Protected routes example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

// Serve frontend for all non-API routes (SPA support)
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
    });
  }

  // Serve the index.html for frontend routes
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

// Initialize Socket.io
initializeSocket(httpServer);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    console.log("✅ Database connected successfully");

    let currentPort = parseInt(PORT);
    const maxPort = currentPort + 10;
    let serverStarted = false;

    while (currentPort <= maxPort && !serverStarted) {
      try {
        console.log(`🔄 Attempting to start server on port ${currentPort}...`);
        await new Promise((resolve, reject) => {
          const onListen = () => {
            console.log(`🚀 Server is running on port ${currentPort}`);
            console.log(
              `📝 API Documentation: http://localhost:${currentPort}/api/health`,
            );
            console.log(`🌍 Frontend: http://localhost:${currentPort}`);
            console.log(`🌍 Socket.io: ws://localhost:${currentPort}`);
            console.log(
              `🌍 Environment: ${process.env.NODE_ENV || "development"}`,
            );
            resolve();
          };
          const onError = (error) => {
            reject(error);
          };
          httpServer.listen(currentPort, onListen);
          httpServer.once("error", onError);
        });
        serverStarted = true;
      } catch (error) {
        if (error.code === "EADDRINUSE") {
          console.log(`Port ${currentPort} is busy, trying next port...`);
          currentPort++;
        } else {
          throw error;
        }
      }
    }

    if (!serverStarted) {
      throw new Error(
        `Could not find an available port between ${PORT} and ${maxPort}`,
      );
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("❌ Error details:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

startServer();

export default app;
