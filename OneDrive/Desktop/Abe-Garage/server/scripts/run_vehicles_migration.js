import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log("🔄 Running vehicles migration...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "abe_garage",
    password: process.env.DB_PASSWORD || "abe_garage",
    database: process.env.DB_NAME || "abe_garage",
    port: process.env.DB_PORT || 3306,
  });

  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(__dirname, "../../database/vehicles_migration.sql"),
      "utf8",
    );

    // Split by DELIMITER statements and execute
    const statements = migrationSQL.split(/DELIMITER\s+|\s+DELIMITER\s+/);

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed && !trimmed.startsWith("--")) {
        try {
          await connection.query(trimmed);
          console.log("✅ Statement executed successfully");
        } catch (err) {
          if (
            !err.message.includes("already exists") &&
            !err.message.includes("Duplicate")
          ) {
            console.error("❌ Error executing statement:", err.message);
          }
        }
      }
    }

    console.log("✅ Vehicles migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
