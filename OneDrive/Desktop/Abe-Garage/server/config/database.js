import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 8889,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "abe_garage",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    console.log("🔌 Attempting database connection...");
    console.log("Config:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
    });

    const connection = await pool.getConnection();
    console.log("✅ Connection obtained from pool");

    await connection.ping();
    console.log("✅ Database ping successful");

    connection.release();
    console.log("✅ Connection released back to pool");

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    // Provide troubleshooting hints
    if (error.code === "ECONNREFUSED") {
      console.error(
        "💡 ECONNREFUSED: Check if MySQL server is running on the specified host/port"
      );
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "💡 ER_ACCESS_DENIED_ERROR: Check username/password credentials"
      );
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("💡 ER_BAD_DB_ERROR: Database does not exist");
    }

    throw error;
  }
};

// Execute query with connection pool
export const executeQuery = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    const queryType = query.trim().toUpperCase();

    if (queryType.startsWith("INSERT")) {
      return result.insertId;
    } else if (
      queryType.startsWith("SELECT") ||
      queryType.startsWith("SHOW") ||
      queryType.startsWith("DESCRIBE")
    ) {
      return result;
    } else {
      // UPDATE, DELETE, etc.
      return result.affectedRows;
    }
  } catch (error) {
    console.error("Query execution failed:", error.message);
    throw error;
  }
};

// Get single record
export const getSingleRecord = async (query, params = []) => {
  try {
    const rows = await executeQuery(query, params);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Single record fetch failed:", error.message);
    throw error;
  }
};

// Insert record and return insert ID
export const insertRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return result.insertId;
  } catch (error) {
    console.error("Insert operation failed:", error.message);
    throw error;
  }
};

// Update/Delete record and return affected rows
export const modifyRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return result.affectedRows;
  } catch (error) {
    console.error("Modify operation failed:", error.message);
    throw error;
  }
};

// Begin transaction
export const beginTransaction = async () => {
  try {
    await pool.execute("START TRANSACTION");
    return true;
  } catch (error) {
    console.error("Transaction start failed:", error.message);
    throw error;
  }
};

// Commit transaction
export const commitTransaction = async () => {
  try {
    await pool.execute("COMMIT");
    return true;
  } catch (error) {
    console.error("Transaction commit failed:", error.message);
    throw error;
  }
};

// Rollback transaction
export const rollbackTransaction = async () => {
  try {
    await pool.execute("ROLLBACK");
    return true;
  } catch (error) {
    console.error("Transaction rollback failed:", error.message);
    throw error;
  }
};

// Close all connections
export const closeConnection = async () => {
  try {
    await pool.end();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error.message);
  }
};

// Helper function to build WHERE clauses
export const buildWhereClause = (conditions, params = []) => {
  if (!conditions || Object.keys(conditions).length === 0) {
    return { whereClause: "", params: [] };
  }

  const clauses = [];
  const values = [];

  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      clauses.push(`${key} = ?`);
      values.push(value);
    }
  });

  const whereClause =
    clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereClause, params: values };
};

// Helper function to build UPDATE clauses
export const buildUpdateClause = (data, params = []) => {
  if (!data || Object.keys(data).length === 0) {
    return { updateClause: "", params: [] };
  }

  const clauses = [];
  const values = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      clauses.push(`${key} = ?`);
      values.push(value);
    }
  });

  const updateClause = clauses.length > 0 ? `SET ${clauses.join(", ")}` : "";
  return { updateClause, params: values };
};

export default pool;
