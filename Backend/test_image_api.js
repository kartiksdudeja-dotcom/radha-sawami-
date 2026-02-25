import { getPool } from "./config/db.js";

async function testImageAPI() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        ItemID,
        ItemName,
        ImageData
      FROM StoreItems 
      WHERE ItemID = 1 AND IsActive = 1
    `);

    if (result.recordset.length > 0) {
      const item = result.recordset[0];
      console.log("Item 1:", item.ItemName);

      if (item.ImageData) {
        console.log("ImageData type:", typeof item.ImageData);
        console.log("Is Buffer:", Buffer.isBuffer(item.ImageData));

        if (Buffer.isBuffer(item.ImageData)) {
          const base64 = item.ImageData.toString("base64");
          console.log("✅ Converted to base64, length:", base64.length);
          console.log("Preview:", base64.substring(0, 50) + "...");
        }
      } else {
        console.log("❌ No ImageData");
      }
    } else {
      console.log("Item 1 not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testImageAPI();
