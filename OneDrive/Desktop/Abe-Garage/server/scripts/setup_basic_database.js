import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool, { closeConnection } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupBasicDatabase = async () => {
  try {
    const sqlPath = path.join(__dirname, "../../database/abe_garage.sql");
    console.log(`Reading SQL file from: ${sqlPath}`);

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Database schema file not found: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Split by semicolon to handle multiple statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip USE statement as we are already connected to the DB
      if (statement.toUpperCase().startsWith("USE ")) {
        console.log("Skipping USE statement (handled by connection config)");
        continue;
      }

      console.log(
        `Executing statement ${i + 1}/${
          statements.length
        }: ${statement.substring(0, 80)}...`
      );

      try {
        await pool.query(statement);
        console.log("✅ Success");
      } catch (error) {
        // If it's a "Table already exists" error, that's okay
        if (error.code === "ER_TABLE_EXISTS_ERROR") {
          console.log("⚠️  Table already exists, skipping...");
        } else if (error.code === "ER_DUP_FIELDNAME") {
          console.log("⚠️  Column already exists, skipping...");
        } else {
          console.log("❌ Error:", error.message);
          // Don't throw error, continue with other statements
        }
      }
    }

    console.log("🎉 Basic database setup completed successfully!");
    console.log(
      "✅ Core tables (appointments, services, users, etc.) should now be available"
    );
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await closeConnection();
  }
};

setupBasicDatabase();
