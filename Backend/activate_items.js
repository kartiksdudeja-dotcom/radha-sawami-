import { getPool } from "./config/db.js";

async function activateItems() {
  try {
    const pool = await getPool();

    console.log("Activating first 10 items...");

    const result = await pool.request().query(`
      UPDATE TOP (10) StoreItems 
      SET IsActive = 1
      WHERE IsActive = 0
    `);

    console.log(`✅ Updated ${result.rowsAffected[0]} items`);

    // Verify
    const checkResult = await pool.request().query(`
      SELECT COUNT(*) as ActiveCount 
      FROM StoreItems 
      WHERE IsActive = 1
    `);

    console.log(
      `✓ Total active items: ${checkResult.recordset[0].ActiveCount}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

activateItems();
