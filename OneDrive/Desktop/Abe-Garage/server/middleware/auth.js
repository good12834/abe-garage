import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// JWT Secret (fallback for development)
const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-key-change-in-production";

// Authentication middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
      code: "TOKEN_MISSING",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Invalid or expired token",
        code: "TOKEN_INVALID",
      });
    }

    req.user = user;
    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Admin role check middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required",
      code: "ADMIN_REQUIRED",
    });
  }

  next();
};

// Customer or Admin role check middleware
export const requireCustomerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!["customer", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      error: "Valid user role required",
      code: "ROLE_INVALID",
    });
  }

  next();
};

// Admin or Mechanic role check middleware
export const requireAdminOrMechanic = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!["admin", "mechanic"].includes(req.user.role)) {
    return res.status(403).json({
      error: "Admin or mechanic access required",
      code: "ROLE_INVALID",
    });
  }

  next();
};

// Customer, Admin or Mechanic role check middleware
export const requireCustomerAdminOrMechanic = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!["customer", "admin", "mechanic"].includes(req.user.role)) {
    return res.status(403).json({
      error: "Valid user role required",
      code: "ROLE_INVALID",
    });
  }

  next();
};

// Mechanic role check middleware
export const requireMechanic = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (req.user.role !== "mechanic") {
    return res.status(403).json({
      error: "Mechanic access required",
      code: "MECHANIC_REQUIRED",
    });
  }

  next();
};

// Customer ownership check middleware (for accessing their own data)
export const requireCustomerOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  // Admin can access any customer data
  if (req.user.role === "admin") {
    return next();
  }

  // Customer can only access their own data
  if (String(req.user.id) !== String(req.params.userId || req.params.id)) {
    return res.status(403).json({
      error: "Access denied - can only access your own data",
      code: "OWNERSHIP_REQUIRED",
    });
  }

  next();
};

// Extract user info from token (without verification)
export const extractUserInfo = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    return null;
  }
};

// Refresh token validation
export const validateRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};
