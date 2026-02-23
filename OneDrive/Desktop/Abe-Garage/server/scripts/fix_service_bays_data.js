import pool, { closeConnection } from "../config/database.js";

const fixServiceBaysData = async () => {
  try {
    console.log("Checking service_bays table...");

    // Check if table exists and get sample data
    const [tables] = await pool.query('SHOW TABLES LIKE "service_bays"');

    if (tables.length === 0) {
      console.log("❌ service_bays table does not exist");
      return;
    }

    console.log("✅ service_bays table exists");

    // Get sample data
    const [rows] = await pool.query("SELECT * FROM service_bays LIMIT 1");

    if (rows.length === 0) {
      console.log("No data in service_bays table");
      return;
    }

    console.log("Sample data:");
    console.log(JSON.stringify(rows[0], null, 2));

    // Fix the equipment data if it's not valid JSON
    const [updateResult] = await pool.query(`
            UPDATE service_bays 
            SET equipment = JSON_ARRAY(
                'oil_change_equipment',
                'fluid_check_station', 
                'battery_tester',
                'hydraulic_lift',
                'basic_tools'
            )
            WHERE JSON_VALID(equipment) = 0 OR equipment IS NULL
        `);

    console.log(`Updated ${updateResult.affectedRows} rows`);

    // Test the fixed data
    const [fixedRows] = await pool.query("SELECT * FROM service_bays LIMIT 1");
    console.log("Fixed sample data:");
    console.log(JSON.stringify(fixedRows[0], null, 2));

    console.log("🎉 Data fix completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await closeConnection();
  }
};

fixServiceBaysData();
