import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "abe_garage",
};

async function fixDuplicateServices() {
  let connection;

  try {
    console.log("🔧 Fixing duplicate services...");

    connection = await mysql.createConnection(dbConfig);

    // Find duplicate services by name
    const [duplicates] = await connection.execute(`
      SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM services 
      WHERE is_active = 1
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length === 0) {
      console.log("✅ No duplicate services found.");
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate service groups:`);

    for (const duplicate of duplicates) {
      const ids = duplicate.ids.split(",").map((id) => parseInt(id));
      console.log(
        `\n📋 Processing "${duplicate.name}" (IDs: ${ids.join(", ")})`
      );

      // Keep the service with the lowest ID and deactivate others
      const keepId = Math.min(...ids);
      const deactivateIds = ids.filter((id) => id !== keepId);

      if (deactivateIds.length > 0) {
        await connection.execute(
          "UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id IN (?)",
          [deactivateIds]
        );

        console.log(
          `   ✅ Kept service ID ${keepId}, deactivated IDs: ${deactivateIds.join(
            ", "
          )}`
        );
      }
    }

    // Verify the fix
    const [remaining] = await connection.execute(`
      SELECT name, COUNT(*) as count
      FROM services 
      WHERE is_active = 1
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);

    if (remaining.length === 0) {
      console.log("\n🎉 All duplicate services have been resolved!");
    } else {
      console.log("\n❌ Some duplicates remain:", remaining);
    }
  } catch (error) {
    console.error("❌ Error fixing duplicate services:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDuplicateServices();
