import { getPool } from "./config/db.js";

async function checkItem1() {
  try {
    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT TOP 5 ItemID, ItemName, IsActive 
      FROM StoreItems 
      ORDER BY ItemID
    `);

    console.log("First 5 Items:");
    result.recordset.forEach((item) => {
      console.log(
        `Item ${item.ItemID}: ${item.ItemName} (Active: ${item.IsActive})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkItem1();
