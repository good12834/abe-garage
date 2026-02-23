// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, "VALIDATION_ERROR");
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // MySQL Errors
  if (err.code === "ER_DUP_ENTRY") {
    const message = "Duplicate entry - resource already exists";
    error = new ConflictError(message);
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    const message = "Foreign key constraint violation";
    error = new ValidationError(message);
  }

  if (err.code === "ER_BAD_FIELD_ERROR") {
    const message = "Invalid field in database query";
    error = new ValidationError(message);
  }

  if (err.code === "ER_DATA_TOO_LONG") {
    const message = "Data too long for database field";
    error = new ValidationError(message);
  }

  if (err.code === "ER_NO_SUCH_TABLE") {
    const message = "Database table does not exist";
    error = new NotFoundError(message);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new AuthenticationError(message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token has expired";
    error = new AuthenticationError(message);
  }

  // Validation Errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ValidationError(message);
  }

  // Cast Error (invalid ObjectId or similar)
  if (err.name === "CastError") {
    const message = "Invalid ID format";
    error = new ValidationError(message);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code || "INTERNAL_ERROR";

  // Response structure
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  };

  // Add field-specific errors for validation
  if (error.field) {
    errorResponse.error.field = error.field;
  }

  // Add additional error details in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.details = err.details || null;
    errorResponse.error.hint = err.hint || null;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
export const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation helper
export const validateRequired = (data, requiredFields) => {
  const missing = [];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(", ")}`);
  }

  return true;
};

// Custom validation rules
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format", "email");
  }
  return true;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, "");
  if (!phoneRegex.test(cleanPhone)) {
    throw new ValidationError("Invalid phone number format", "phone");
  }
  return true;
};

export const validatePassword = (password) => {
  if (password.length < 6) {
    throw new ValidationError(
      "Password must be at least 6 characters long",
      "password"
    );
  }
  return true;
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError("Invalid date format", "date");
  }

  // Check if date is not in the past (for appointments)
  const now = new Date();
  if (date < now) {
    throw new ValidationError("Date cannot be in the past", "date");
  }

  return true;
};

export const validatePositiveNumber = (number, fieldName = "number") => {
  const num = parseFloat(number);
  if (isNaN(num) || num < 0) {
    throw new ValidationError(
      `${fieldName} must be a positive number`,
      fieldName
    );
  }
  return true;
};

// Rate limiting error handler
export const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  });
};
