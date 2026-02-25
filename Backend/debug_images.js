import { getPool } from "./config/db.js";

async function debugImages() {
  try {
    const pool = await getPool();

    // Check which items have images
    const result = await pool.request().query(`
      SELECT TOP 10
        ItemID,
        ItemName,
        CASE WHEN ImageData IS NULL THEN 'NULL' ELSE 'HAS DATA' END as ImageStatus,
        DATALENGTH(ImageData) as ImageSize
      FROM StoreItems
      ORDER BY ItemID
    `);

    console.log("Items in Database:");
    console.log("===================");
    result.recordset.forEach((item) => {
      console.log(
        `${item.ItemID}. ${item.ItemName}: ${item.ImageStatus} (${
          item.ImageSize || 0
        } bytes)`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

debugImages();
