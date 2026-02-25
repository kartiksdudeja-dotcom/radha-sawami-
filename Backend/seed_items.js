import { getPool } from "./config/db.js";
import sql from "mssql";

async function seedItems() {
  try {
    const pool = await getPool();

    console.log("🌱 Seeding test items...");

    const items = [
      { name: "Item A", price: 100, qty: 50 },
      { name: "Item B", price: 200, qty: 40 },
      { name: "Item C", price: 300, qty: 30 },
      { name: "Item D", price: 400, qty: 20 },
      { name: "Item E", price: 500, qty: 10 }
    ];

    for (const item of items) {
      await pool
        .request()
        .input("ItemName", sql.NVarChar(255), item.name)
        .input("Price", sql.Decimal(10, 2), item.price)
        .input("Quantity", sql.Int, item.qty)
        .query(
          "INSERT INTO StoreItems (ItemName, Category, Price, Quantity) VALUES (@ItemName, 'test', @Price, @Quantity)"
        );
    }

    const result = await pool.request().query("SELECT ItemID, ItemName FROM StoreItems ORDER BY ItemID");
    console.log("\n✅ Items created:");
    result.recordset.forEach(r => console.log(`   #${r.ItemID}: ${r.ItemName}`));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedItems();
