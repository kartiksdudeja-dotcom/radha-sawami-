import { getPool } from "./config/db.js";
import sql from "mssql";

async function testDeleteItem() {
  try {
    const pool = await getPool();

    console.log("\n" + "=".repeat(60));
    console.log("🧪 TEST: DELETE ITEM WITH RENUMBERING");
    console.log("=".repeat(60));

    // Step 1: Get current items
    console.log("\n📋 Step 1: Current items in database");
    let result = await pool.request().query(`
      SELECT TOP 10 ItemID, ItemName, Price, Quantity 
      FROM StoreItems 
      ORDER BY ItemID
    `);
    console.log(`✅ Found ${result.recordset.length} items (showing first 10):`);
    result.recordset.forEach(item => {
      console.log(`   Item #${item.ItemID}: ${item.ItemName} (Price: ₹${item.Price}, Qty: ${item.Quantity})`);
    });

    // Step 2: Delete first item
    if (result.recordset.length > 0) {
      const firstItemId = result.recordset[0].ItemID;
      console.log(`\n📋 Step 2: Deleting Item #${firstItemId}...`);
      
      // Call the delete logic directly
      const itemCheck = await pool
        .request()
        .input("ItemID", sql.Int, firstItemId)
        .query(`SELECT ItemID FROM StoreItems WHERE ItemID = @ItemID`);

      if (itemCheck.recordset.length === 0) {
        console.log("Item not found");
        process.exit(1);
      }

      // Get order items
      const orderItemsResult = await pool.request().query(`
        SELECT * FROM StoreOrderItems
      `);
      const allOrderItems = orderItemsResult.recordset;
      console.log(`   Found ${allOrderItems.length} order items to update`);

      // Get items before deletion
      const itemsBeforeDeletion = await pool.request().query(`
        SELECT * FROM StoreItems ORDER BY ItemName ASC
      `);
      const items = itemsBeforeDeletion.recordset;
      console.log(`   Found ${items.length} items to renumber`);

      // Disable constraints
      await pool.request().query(`ALTER TABLE StoreOrderItems NOCHECK CONSTRAINT ALL`);

      // Delete old items and order items
      await pool.request().query(`DELETE FROM StoreOrderItems`);
      await pool.request().query(`DELETE FROM StoreItems`);

      // Reseed IDENTITY to start from 1
      await pool.request().query(`DBCC CHECKIDENT ('StoreItems', RESEED, 0)`);

      // Build INSERT script with IDENTITY_INSERT for entire batch
      let insertScript = `SET IDENTITY_INSERT StoreItems ON\n`;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const newId = i + 1;

        const itemName = (item.ItemName || '').replace(/'/g, "''");
        const category = (item.Category || '').replace(/'/g, "''");
        const description = (item.Description || '').replace(/'/g, "''");
        const unit = (item.Unit || '').replace(/'/g, "''");
        const isActive = item.IsActive ? 1 : 0;

        console.log(`   Item ${item.ItemID} → Item ${newId}`);
        insertScript += `INSERT INTO StoreItems (ItemID, ItemName, Category, Description, Price, Quantity, Unit, SupplierID, IsActive, CreatedDate, UpdatedDate) VALUES (${newId}, '${itemName}', '${category}', '${description}', ${item.Price}, ${item.Quantity}, '${unit}', ${item.SupplierID || 'NULL'}, ${isActive}, '${new Date(item.CreatedDate).toISOString().replace('T', ' ').slice(0, 19)}', '${new Date(item.UpdatedDate).toISOString().replace('T', ' ').slice(0, 19)}');\n`;
      }
      insertScript += `SET IDENTITY_INSERT StoreItems OFF\n`;

      console.log("\n   Executing INSERT script...");
      await pool.request().query(insertScript);

      // Recreate order items with updated ItemIDs
      for (const orderItem of allOrderItems) {
        const oldItemIndex = items.findIndex(o => o.ItemID === orderItem.ItemID);
        if (oldItemIndex !== -1) {
          const newItemId = oldItemIndex + 1;

          await pool
            .request()
            .input('OrderID', sql.Int, orderItem.OrderID)
            .input('ItemID', sql.Int, newItemId)
            .input('Quantity', sql.Int, orderItem.Quantity)
            .input('UnitPrice', sql.Decimal(10, 2), orderItem.UnitPrice)
            .input('TotalPrice', sql.Decimal(10, 2), orderItem.TotalPrice)
            .query(`
              INSERT INTO StoreOrderItems 
              (OrderID, ItemID, Quantity, UnitPrice, TotalPrice)
              VALUES 
              (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)
            `);
        }
      }

      // Re-enable constraints
      await pool.request().query(`ALTER TABLE StoreOrderItems WITH CHECK CHECK CONSTRAINT ALL`);

      // Reset IDENTITY seed to next number
      await pool.request().query(`DBCC CHECKIDENT ('StoreItems', RESEED, ${items.length})`);

      console.log(`\n✅ Renumbering complete`);
    }

    // Step 3: Show items after deletion
    console.log("\n📋 Step 3: Items after deletion (first 10):");
    result = await pool.request().query(`
      SELECT TOP 10 ItemID, ItemName, Price, Quantity 
      FROM StoreItems 
      ORDER BY ItemID
    `);
    console.log(`✅ Found ${result.recordset.length} items:`);
    result.recordset.forEach(item => {
      console.log(`   Item #${item.ItemID}: ${item.ItemName} (Price: ₹${item.Price}, Qty: ${item.Quantity})`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✨ TEST COMPLETE");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testDeleteItem();
