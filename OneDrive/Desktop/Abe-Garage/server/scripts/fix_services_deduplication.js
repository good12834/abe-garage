import { executeQuery, getSingleRecord } from "../config/database.js";

async function fixServicesDeduplication() {
  try {
    console.log("🔧 Starting services deduplication process...");

    // Get all active services
    const services = await executeQuery(
      "SELECT * FROM services WHERE is_active = 1 ORDER BY id"
    );

    console.log(`📊 Found ${services.length} total active services`);

    // Group services by name to find duplicates
    const serviceGroups = {};
    services.forEach((service) => {
      if (!serviceGroups[service.name]) {
        serviceGroups[service.name] = [];
      }
      serviceGroups[service.name].push(service);
    });

    // Find duplicates
    const duplicates = Object.entries(serviceGroups).filter(
      ([name, group]) => group.length > 1
    );

    if (duplicates.length === 0) {
      console.log("✅ No duplicate services found!");
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate service groups:`);

    let totalFixed = 0;

    for (const [serviceName, group] of duplicates) {
      console.log(
        `\n📋 Processing "${serviceName}" (${group.length} instances)`
      );

      // Sort by ID and keep the first one (lowest ID)
      const sortedGroup = group.sort((a, b) => a.id - b.id);
      const keepService = sortedGroup[0];
      const deactivateServices = sortedGroup.slice(1);

      console.log(
        `   ✅ Keeping service ID ${keepService.id} (created: ${keepService.created_at})`
      );

      if (deactivateServices.length > 0) {
        const deactivateIds = deactivateServices.map((s) => s.id);

        // Deactivate duplicates (handle array parameter properly)
        const placeholders = deactivateIds.map(() => "?").join(",");
        await executeQuery(
          `UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
          deactivateIds
        );

        console.log(
          `   ❌ Deactivated duplicate IDs: ${deactivateIds.join(", ")}`
        );
        totalFixed += deactivateServices.length;
      }
    }

    console.log(
      `\n🎉 Deduplication complete! Fixed ${totalFixed} duplicate services.`
    );

    // Verify the fix
    const remainingServices = await executeQuery(
      "SELECT * FROM services WHERE is_active = 1 ORDER BY id"
    );
    const remainingGroups = {};
    remainingServices.forEach((service) => {
      if (!remainingGroups[service.name]) {
        remainingGroups[service.name] = 0;
      }
      remainingGroups[service.name]++;
    });

    const remainingDuplicates = Object.entries(remainingGroups).filter(
      ([name, count]) => count > 1
    );

    if (remainingDuplicates.length === 0) {
      console.log("✅ Verification passed: No duplicates remain!");
    } else {
      console.log(
        "❌ Verification failed: Some duplicates still exist:",
        remainingDuplicates
      );
    }
  } catch (error) {
    console.error("❌ Error during deduplication:", error.message);
    console.error("Full error:", error);
  }
}

// Run the function
fixServicesDeduplication();
