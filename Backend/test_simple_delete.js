import { getPool } from "./config/db.js";
import sql from "mssql";

async function testSimpleDelete() {
  try {
    const pool = await getPool();

    console.log("\n" + "=".repeat(60));
    console.log("🧪 SIMPLE DELETE & RENUMBER TEST");
    console.log("=".repeat(60));

    // Show before
    console.log("\n📋 BEFORE: All items");
    let result = await pool
      .request()
      .query(`SELECT ItemID, ItemName FROM StoreItems ORDER BY ItemID`);
    result.recordset.forEach((item) => {
      console.log(`   Item #${item.ItemID}: ${item.ItemName}`);
    });
    const countBefore = result.recordset.length;

    // Delete Item #2
    console.log(`\n🗑️  DELETING Item #2...`);
    await pool
      .request()
      .input("ItemID", sql.Int, 2)
      .query(`DELETE FROM StoreItems WHERE ItemID = @ItemID`);

    // Show after (before renumbering)
    console.log("\n📋 AFTER DELETE (before renumbering):");
    result = await pool
      .request()
      .query(`SELECT ItemID, ItemName FROM StoreItems ORDER BY ItemID`);
    result.recordset.forEach((item) => {
      console.log(`   Item #${item.ItemID}: ${item.ItemName}`);
    });
    const countAfterDelete = result.recordset.length;

    // Now renumber
    console.log(`\n🔄 RENUMBERING ${countAfterDelete} items...`);
    const remainingItems = result.recordset;

    if (countAfterDelete > 0) {
      // Delete all and rebuild
      await pool.request().query(`DELETE FROM StoreItems`);
      await pool.request().query(`DBCC CHECKIDENT ('StoreItems', RESEED, 0)`);

      // Build INSERT script
      let insertScript = `SET IDENTITY_INSERT StoreItems ON\n`;
      for (let i = 0; i < remainingItems.length; i++) {
        const item = remainingItems[i];
        const newId = i + 1;
        const itemName = (item.ItemName || "").replace(/'/g, "''");

        console.log(`  Item ${item.ItemID} → Item ${newId}`);
        insertScript += `INSERT INTO StoreItems (ItemID, ItemName, Category, Price, Quantity, IsActive, CreatedDate, UpdatedDate) VALUES (${newId}, '${itemName}', 'test', 0, 0, 1, GETDATE(), GETDATE());\n`;
      }
      insertScript += `SET IDENTITY_INSERT StoreItems OFF\n`;

      await pool.request().query(insertScript);
      await pool
        .request()
        .query(`DBCC CHECKIDENT ('StoreItems', RESEED, ${countAfterDelete})`);
    }

    // Show final
    console.log("\n📋 FINAL: After renumbering");
    result = await pool
      .request()
      .query(`SELECT ItemID, ItemName FROM StoreItems ORDER BY ItemID`);
    result.recordset.forEach((item) => {
      console.log(`   Item #${item.ItemID}: ${item.ItemName}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log(
      `Summary: Had ${countBefore} items → Deleted 1 → Had ${countAfterDelete} → Renumbered → Now ${result.recordset.length}`
    );
    if (
      result.recordset.length === countAfterDelete &&
      result.recordset[0].ItemID === 1
    ) {
      console.log("✅ SUCCESS: Renumbering worked correctly!");
    } else {
      console.log("❌ FAILURE: Renumbering didn't work as expected");
    }
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testSimpleDelete();
