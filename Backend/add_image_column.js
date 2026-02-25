import { getPool } from "./config/db.js";

async function addImageColumn() {
  try {
    const pool = await getPool();

    console.log("Adding ImageData column to StoreItems table...");

    await pool.request().query(`
      ALTER TABLE StoreItems
      ADD ImageData VARBINARY(MAX) NULL
    `);

    console.log("✅ ImageData column added successfully!");

    // Verify it was added
    const result = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='StoreItems' AND COLUMN_NAME='ImageData'
    `);

    if (result.recordset.length > 0) {
      console.log("✓ Verified: ImageData column is now in StoreItems table");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addImageColumn();
