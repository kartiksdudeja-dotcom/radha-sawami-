import { getPool } from "./config/db.js";
import sql from "mssql";

async function renumberOrders() {
  try {
    const pool = await getPool();

    console.log("📋 Fetching all orders...");
    
    // Get all orders with all their data
    const ordersResult = await pool.request().query(`
      SELECT * FROM StoreOrders ORDER BY OrderDate ASC
    `);

    const orders = ordersResult.recordset;
    console.log(`✅ Found ${orders.length} orders`);

    if (orders.length === 0) {
      console.log("No orders to renumber");
      process.exit(0);
    }

    // Get all order items
    const itemsResult = await pool.request().query(`
      SELECT * FROM StoreOrderItems ORDER BY OrderID
    `);

    const allItems = itemsResult.recordset;

    console.log("\n🔄 Renumbering strategy: Delete and recreate with sequential IDs");

    // Disable constraints
    console.log("🔐 Disabling constraints...");
    await pool.request().query(`ALTER TABLE StoreOrderItems NOCHECK CONSTRAINT ALL`);

    // Delete old order items
    console.log("🗑️  Deleting old order items...");
    await pool.request().query(`DELETE FROM StoreOrderItems`);

    // Delete old orders
    console.log("🗑️  Deleting old orders...");
    await pool.request().query(`DELETE FROM StoreOrders`);

    // Reseed to start from 1
    console.log("🔄 Resetting IDENTITY seed to 1...");
    await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, 0)`);

    // Re-enable identity insert
    console.log("📝 Inserting orders with sequential IDs...");
    
    // Build the INSERT statements with IDENTITY_INSERT enabled for entire batch
    let insertScript = `SET IDENTITY_INSERT StoreOrders ON\n`;
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const newId = i + 1;

      const orderNumber = (order.OrderNumber || '').replace(/'/g, "''");
      const notes = (order.Notes || '').replace(/'/g, "''");
      const orderDate = new Date(order.OrderDate).toISOString().replace('T', ' ').slice(0, 19);
      const createdDate = new Date(order.CreatedDate).toISOString().replace('T', ' ').slice(0, 19);
      const updatedDate = new Date(order.UpdatedDate).toISOString().replace('T', ' ').slice(0, 19);

      console.log(`  Order #${newId} (was #${order.OrderID})`);
      insertScript += `INSERT INTO StoreOrders (OrderID, OrderNumber, MemberID, TotalAmount, Status, OrderDate, Notes, CreatedDate, UpdatedDate) VALUES (${newId}, '${orderNumber}', ${order.MemberID}, ${order.TotalAmount}, '${order.Status}', '${orderDate}', '${notes}', '${createdDate}', '${updatedDate}')\n`;
    }
    insertScript += `SET IDENTITY_INSERT StoreOrders OFF\n`;

    // Execute all inserts in one batch
    await pool.request().query(insertScript);

    console.log("✅ Orders recreated");

    // Recreate order items with updated OrderIDs
    console.log("📝 Inserting order items...");
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      
      // Find the new ID for this order
      const oldOrderIndex = orders.findIndex(o => o.OrderID === item.OrderID);
      const newOrderId = oldOrderIndex + 1;

      await pool
        .request()
        .input('OrderID', sql.Int, newOrderId)
        .input('ItemID', sql.Int, item.ItemID)
        .input('Quantity', sql.Int, item.Quantity)
        .input('UnitPrice', sql.Decimal(10, 2), item.UnitPrice)
        .input('TotalPrice', sql.Decimal(10, 2), item.TotalPrice)
        .query(`
          INSERT INTO StoreOrderItems 
          (OrderID, ItemID, Quantity, UnitPrice, TotalPrice)
          VALUES 
          (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)
        `);
    }

    console.log("✅ Order items recreated");

    // Re-enable constraints
    console.log("🔓 Re-enabling constraints...");
    await pool.request().query(`ALTER TABLE StoreOrderItems WITH CHECK CHECK CONSTRAINT ALL`);

    // Reseed to next number
    console.log("🔄 Setting next IDENTITY to", orders.length + 1);
    await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, ${orders.length})`);

    console.log("\n✨ Order renumbering complete!");
    console.log(`📊 Total orders: ${orders.length}`);
    console.log(`✅ Next order will be: #${orders.length + 1}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

renumberOrders();
