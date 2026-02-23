import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { executeQuery, getSingleRecord } from "../config/database.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";
import {
  asyncHandler,
  ValidationError,
  validateEmail,
  validatePassword,
} from "../middleware/errorHandler.js";

const router = express.Router();

// Register new user
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("firstName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("phone")
      .optional()
      .matches(/^[\+]?[\d\s\-\(\)]+$/)
      .withMessage("Please provide a valid phone number"),
  ],
  asyncHandler(async (req, res) => {
    console.log("Registration request body:", JSON.stringify(req.body));

    // Check for validation errors
    const errors = validationResult(req);
    console.log("Validation errors:", errors.array());

    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await getSingleRecord(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser) {
      throw new ValidationError("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const userId = await executeQuery(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role) 
     VALUES (?, ?, ?, ?, ?, 'customer')`,
      [email, passwordHash, firstName, lastName, phone || null]
    );

    // Get created user (without password)
    const user = await getSingleRecord(
      "SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  })
);

// Login user
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    console.log("Login request body:", JSON.stringify(req.body));
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Login validation errors:", errors.array());
    }
    if (!errors.isEmpty()) {
      throw new ValidationError(
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    const { email, password } = req.body;

    // Get user with password hash
    const user = await getSingleRecord(
      "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
      [email]
    );

    if (!user) {
      throw new ValidationError("Invalid email or password");
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new ValidationError("Invalid email or password");
    }

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = generateToken(userWithoutPassword);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  })
);

// Get current user profile
router.get(
  "/profile",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await getSingleRecord(
      "SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!user) {
      throw new ValidationError("User not found");
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long"),
    body("phone")
      .optional()
      .matches(/^[\+]?[\d\s\-\(\)]+$/)
      .withMessage("Please provide a valid phone number"),
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

    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (firstName !== undefined) {
      updateFields.push("first_name = ?");
      updateValues.push(firstName);
    }

    if (lastName !== undefined) {
      updateFields.push("last_name = ?");
      updateValues.push(lastName);
    }

    if (phone !== undefined) {
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateValues.push(userId);

    // Update user
    await executeQuery(
      `UPDATE users SET ${updateFields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const updatedUser = await getSingleRecord(
      "SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  })
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password hash
    const user = await getSingleRecord("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new ValidationError("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await executeQuery(
      "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  })
);

// Logout (client-side token removal, but we can log it)
router.post(
  "/logout",
  authenticateToken,
  asyncHandler(async (req, res) => {
    // In a real app, you might want to blacklist the token
    // For now, just return success (client will remove token)

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  })
);

// Verify token validity
router.get(
  "/verify",
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "Token is valid",
      data: {
        user: req.user,
      },
    });
  })
);

// Working registration endpoint with detailed logging
router.post(
  "/register-debug",
  asyncHandler(async (req, res) => {
    console.log("=== REGISTRATION DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body));
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("========================");

    // If body is empty, manually try to parse from raw data
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("Body is empty, attempting manual parsing...");
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Request body is empty. Please send valid JSON data.",
        },
      });
      return;
    }

    res.json({
      success: true,
      received: req.body,
      message: "Debug registration endpoint working",
    });
  })
);
export default router;
