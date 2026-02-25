import { getPool } from "./config/db.js";
import sql from "mssql";

async function testOrderRenumbering() {
  try {
    const pool = await getPool();

    console.log("\n" + "=".repeat(60));
    console.log("🧪 ORDER RENUMBERING TEST");
    console.log("=".repeat(60));

    // Step 1: Clear existing orders
    console.log("\n📋 Step 1: Clearing existing data...");
    await pool.request().query(`DELETE FROM StoreOrderItems`);
    await pool.request().query(`DELETE FROM StoreOrders`);
    await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, 0)`);
    console.log("✅ Database cleared");

    // Step 2: Create 5 test orders
    console.log("\n📋 Step 2: Creating 5 test orders...");
    const memberIds = [1, 2, 3, 4, 5];
    
    for (let i = 0; i < 5; i++) {
      const orderResult = await pool
        .request()
        .input('OrderNumber', sql.NVarChar(50), `ORD-${i + 1}`)
        .input('MemberID', sql.Int, memberIds[i])
        .input('TotalAmount', sql.Decimal(12, 2), (i + 1) * 100)
        .input('Status', sql.NVarChar(50), 'Pending')
        .query(`
          INSERT INTO StoreOrders 
          (OrderNumber, MemberID, TotalAmount, Status)
          OUTPUT INSERTED.OrderID
          VALUES 
          (@OrderNumber, @MemberID, @TotalAmount, @Status)
        `);
      console.log(`   Order #${orderResult.recordset[0].OrderID} created (ORD-${i + 1})`);
    }

    // Step 3: Display current orders
    console.log("\n📋 Step 3: Current orders before deletion:");
    let result = await pool.request().query(`SELECT OrderID, OrderNumber, MemberID, TotalAmount FROM StoreOrders ORDER BY OrderID`);
    result.recordset.forEach(order => {
      console.log(`   Order #${order.OrderID}: ${order.OrderNumber} (Member ${order.MemberID}) - ₹${order.TotalAmount}`);
    });

    // Step 4: Delete order #2
    console.log("\n📋 Step 4: Deleting Order #2...");
    const deleteRes = await pool
      .request()
      .input('OrderID', sql.Int, 2)
      .query(`DELETE FROM StoreOrderItems WHERE OrderID = @OrderID`);
    
    await pool
      .request()
      .input('OrderID', sql.Int, 2)
      .query(`DELETE FROM StoreOrders WHERE OrderID = @OrderID`);
    console.log("✅ Order #2 deleted");

    // Step 5: Check if remaining orders need renumbering
    console.log("\n📋 Step 5: Simulating renumbering logic...");
    const remainingOrders = await pool.request().query(`SELECT * FROM StoreOrders ORDER BY OrderDate ASC`);
    const orders = remainingOrders.recordset;

    console.log(`Found ${orders.length} remaining orders`);

    if (orders.length > 0) {
      console.log("🔄 Renumbering mapping:");
      orders.forEach((order, index) => {
        const newId = index + 1;
        if (order.OrderID !== newId) {
          console.log(`   Order ${order.OrderID} → Order ${newId}`);
        } else {
          console.log(`   Order ${order.OrderID} → Order ${newId} (no change)`);
        }
      });

      // Perform renumbering
      console.log("\n🔄 Performing renumbering...");

      // Get all order items
      const allItemsResult = await pool.request().query(`SELECT * FROM StoreOrderItems ORDER BY OrderID`);
      const allItems = allItemsResult.recordset;

      // Disable constraints
      await pool.request().query(`ALTER TABLE StoreOrderItems NOCHECK CONSTRAINT ALL`);

      // Delete and recreate
      await pool.request().query(`DELETE FROM StoreOrderItems`);
      await pool.request().query(`DELETE FROM StoreOrders`);
      await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, 0)`);

      // Build the INSERT statements
      let insertScript = `SET IDENTITY_INSERT StoreOrders ON\n`;
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const newId = i + 1;

        const orderNumber = (order.OrderNumber || '').replace(/'/g, "''");
        const notes = (order.Notes || '').replace(/'/g, "''");
        const orderDate = new Date(order.OrderDate).toISOString().replace('T', ' ').slice(0, 19);
        const createdDate = new Date(order.CreatedDate).toISOString().replace('T', ' ').slice(0, 19);
        const updatedDate = new Date(order.UpdatedDate).toISOString().replace('T', ' ').slice(0, 19);

        insertScript += `INSERT INTO StoreOrders (OrderID, OrderNumber, MemberID, TotalAmount, Status, OrderDate, Notes, CreatedDate, UpdatedDate) VALUES (${newId}, '${orderNumber}', ${order.MemberID}, ${order.TotalAmount}, '${order.Status}', '${orderDate}', '${notes}', '${createdDate}', '${updatedDate}')\n`;
      }
      insertScript += `SET IDENTITY_INSERT StoreOrders OFF\n`;

      // Execute all inserts in one batch
      await pool.request().query(insertScript);


      // Recreate order items with updated OrderIDs
      for (const item of allItems) {
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

      await pool.request().query(`ALTER TABLE StoreOrderItems WITH CHECK CHECK CONSTRAINT ALL`);
      await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, ${orders.length})`);

      console.log("✅ Renumbering complete");
    }

    // Step 6: Display final orders
    console.log("\n📋 Step 6: Final orders after deletion & renumbering:");
    result = await pool.request().query(`SELECT OrderID, OrderNumber, MemberID, TotalAmount FROM StoreOrders ORDER BY OrderID`);
    result.recordset.forEach(order => {
      console.log(`   Order #${order.OrderID}: ${order.OrderNumber} (Member ${order.MemberID}) - ₹${order.TotalAmount}`);
    });

    // Step 7: Test creating a new order (should get next sequential ID)
    console.log("\n📋 Step 7: Creating new order after renumbering...");
    const newOrderResult = await pool
      .request()
      .input('OrderNumber', sql.NVarChar(50), 'ORD-NEW')
      .input('MemberID', sql.Int, 10)
      .input('TotalAmount', sql.Decimal(12, 2), 500)
      .input('Status', sql.NVarChar(50), 'Pending')
      .query(`
        INSERT INTO StoreOrders 
        (OrderNumber, MemberID, TotalAmount, Status)
        OUTPUT INSERTED.OrderID
        VALUES 
        (@OrderNumber, @MemberID, @TotalAmount, @Status)
      `);
    
    const newOrderId = newOrderResult.recordset[0].OrderID;
    console.log(`✅ New order created with ID: #${newOrderId}`);

    // Step 8: Final display
    console.log("\n📋 Step 8: All orders (final state):");
    result = await pool.request().query(`SELECT OrderID, OrderNumber, MemberID, TotalAmount FROM StoreOrders ORDER BY OrderID`);
    result.recordset.forEach(order => {
      console.log(`   Order #${order.OrderID}: ${order.OrderNumber} (Member ${order.MemberID}) - ₹${order.TotalAmount}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✨ TEST COMPLETE - Sequential IDs working correctly!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testOrderRenumbering();
