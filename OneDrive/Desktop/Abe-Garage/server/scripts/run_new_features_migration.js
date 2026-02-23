import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool, { closeConnection } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runNewFeaturesMigration = async () => {
  try {
    const sqlPath = path.join(
      __dirname,
      "../../database/new_features_migration.sql"
    );
    console.log(`Reading SQL file from: ${sqlPath}`);

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found: ${sqlPath}`);
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

      // Skip DELIMITER statements
      if (statement.toUpperCase().startsWith("DELIMITER ")) {
        console.log(`Skipping DELIMITER statement`);
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
        } else {
          throw error;
        }
      }
    }

    console.log("🎉 New features migration completed successfully!");
    console.log("✅ Service bays and related tables should now be available");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await closeConnection();
  }
};

runNewFeaturesMigration();
