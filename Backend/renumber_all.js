import { getPool } from "./config/db.js";
import sql from "mssql";

async function renumberAll() {
  try {
    const pool = await getPool();

    console.log("\n" + "=".repeat(60));
    console.log("🔄 RENUMBERING ALL IDS TO START FROM 1");
    console.log("=".repeat(60));

    // 1. RENUMBER ITEMS
    console.log("\n📦 ITEMS:");
    let items = await pool.request().query(`SELECT * FROM StoreItems ORDER BY ItemID`);
    console.log(`   Found ${items.recordset.length} items`);
    
    if (items.recordset.length > 0) {
      const itemsList = items.recordset;
      
      // Clear and reseed
      await pool.request().query(`ALTER TABLE StoreOrderItems NOCHECK CONSTRAINT ALL`);
      
      // Get order items for later
      const orderItems = await pool.request().query(`SELECT * FROM StoreOrderItems`);
      
      await pool.request().query(`DELETE FROM StoreOrderItems`);
      await pool.request().query(`DELETE FROM StoreItems`);
      await pool.request().query(`DBCC CHECKIDENT ('StoreItems', RESEED, 0)`);
      
      // Reinsert with new IDs
      let script = `SET IDENTITY_INSERT StoreItems ON\n`;
      for (let i = 0; i < itemsList.length; i++) {
        const item = itemsList[i];
        const newId = i + 1;
        const itemName = (item.ItemName || '').replace(/'/g, "''");
        const category = (item.Category || '').replace(/'/g, "''");
        const description = (item.Description || '').replace(/'/g, "''");
        const unit = (item.Unit || '').replace(/'/g, "''");
        const isActive = item.IsActive ? 1 : 0;
        
        console.log(`   Item ${item.ItemID} → Item ${newId}: ${itemName}`);
        script += `INSERT INTO StoreItems (ItemID, ItemName, Category, Description, Price, Quantity, Unit, SupplierID, IsActive, CreatedDate, UpdatedDate) VALUES (${newId}, '${itemName}', '${category}', '${description}', ${item.Price}, ${item.Quantity}, '${unit}', ${item.SupplierID || 'NULL'}, ${isActive}, '${new Date(item.CreatedDate).toISOString().replace('T', ' ').slice(0, 19)}', '${new Date(item.UpdatedDate).toISOString().replace('T', ' ').slice(0, 19)}');\n`;
      }
      script += `SET IDENTITY_INSERT StoreItems OFF\n`;
      await pool.request().query(script);
      await pool.request().query(`DBCC CHECKIDENT ('StoreItems', RESEED, ${itemsList.length})`);
      
      // Reinsert order items with updated ItemIDs
      for (const oi of orderItems.recordset) {
        const oldIndex = itemsList.findIndex(it => it.ItemID === oi.ItemID);
        if (oldIndex !== -1) {
          const newItemId = oldIndex + 1;
          await pool.request()
            .input('OrderID', sql.Int, oi.OrderID)
            .input('ItemID', sql.Int, newItemId)
            .input('Quantity', sql.Int, oi.Quantity)
            .input('UnitPrice', sql.Decimal(10, 2), oi.UnitPrice)
            .input('TotalPrice', sql.Decimal(10, 2), oi.TotalPrice)
            .query(`INSERT INTO StoreOrderItems (OrderID, ItemID, Quantity, UnitPrice, TotalPrice) VALUES (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)`);
        }
      }
      
      await pool.request().query(`ALTER TABLE StoreOrderItems WITH CHECK CHECK CONSTRAINT ALL`);
    }
    
    // Verify items
    items = await pool.request().query(`SELECT ItemID, ItemName FROM StoreItems ORDER BY ItemID`);
    console.log(`   ✅ Items after: ${items.recordset.map(i => `#${i.ItemID}:${i.ItemName}`).join(', ') || 'none'}`);

    // 2. RENUMBER ORDERS
    console.log("\n📋 ORDERS:");
    let orders = await pool.request().query(`SELECT * FROM StoreOrders ORDER BY OrderDate`);
    console.log(`   Found ${orders.recordset.length} orders`);
    
    if (orders.recordset.length > 0) {
      const ordersList = orders.recordset;
      
      // Get order items
      const allOrderItems = await pool.request().query(`SELECT * FROM StoreOrderItems`);
      
      await pool.request().query(`ALTER TABLE StoreOrderItems NOCHECK CONSTRAINT ALL`);
      await pool.request().query(`DELETE FROM StoreOrderItems`);
      await pool.request().query(`DELETE FROM StoreOrders`);
      await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, 0)`);
      
      // Reinsert orders
      let script = `SET IDENTITY_INSERT StoreOrders ON\n`;
      for (let i = 0; i < ordersList.length; i++) {
        const order = ordersList[i];
        const newId = i + 1;
        const orderNumber = (order.OrderNumber || '').replace(/'/g, "''");
        const notes = (order.Notes || '').replace(/'/g, "''");
        const orderDate = new Date(order.OrderDate).toISOString().replace('T', ' ').slice(0, 19);
        const createdDate = new Date(order.CreatedDate).toISOString().replace('T', ' ').slice(0, 19);
        const updatedDate = new Date(order.UpdatedDate).toISOString().replace('T', ' ').slice(0, 19);
        
        console.log(`   Order ${order.OrderID} → Order ${newId}: ${orderNumber}`);
        script += `INSERT INTO StoreOrders (OrderID, OrderNumber, MemberID, TotalAmount, Status, OrderDate, Notes, CreatedDate, UpdatedDate) VALUES (${newId}, '${orderNumber}', ${order.MemberID}, ${order.TotalAmount}, '${order.Status}', '${orderDate}', '${notes}', '${createdDate}', '${updatedDate}');\n`;
      }
      script += `SET IDENTITY_INSERT StoreOrders OFF\n`;
      await pool.request().query(script);
      await pool.request().query(`DBCC CHECKIDENT ('StoreOrders', RESEED, ${ordersList.length})`);
      
      // Reinsert order items with updated OrderIDs
      for (const oi of allOrderItems.recordset) {
        const oldIndex = ordersList.findIndex(o => o.OrderID === oi.OrderID);
        if (oldIndex !== -1) {
          const newOrderId = oldIndex + 1;
          await pool.request()
            .input('OrderID', sql.Int, newOrderId)
            .input('ItemID', sql.Int, oi.ItemID)
            .input('Quantity', sql.Int, oi.Quantity)
            .input('UnitPrice', sql.Decimal(10, 2), oi.UnitPrice)
            .input('TotalPrice', sql.Decimal(10, 2), oi.TotalPrice)
            .query(`INSERT INTO StoreOrderItems (OrderID, ItemID, Quantity, UnitPrice, TotalPrice) VALUES (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)`);
        }
      }
      
      await pool.request().query(`ALTER TABLE StoreOrderItems WITH CHECK CHECK CONSTRAINT ALL`);
    }
    
    // Verify orders
    orders = await pool.request().query(`SELECT OrderID, OrderNumber FROM StoreOrders ORDER BY OrderID`);
    console.log(`   ✅ Orders after: ${orders.recordset.map(o => `#${o.OrderID}:${o.OrderNumber}`).join(', ') || 'none'}`);

    // 3. RENUMBER SALES
    console.log("\n💰 SALES:");
    let sales = await pool.request().query(`SELECT * FROM StoreSales ORDER BY SaleDate`);
    console.log(`   Found ${sales.recordset.length} sales`);
    
    if (sales.recordset.length > 0) {
      const salesList = sales.recordset;
      
      await pool.request().query(`DELETE FROM StoreSales`);
      await pool.request().query(`DBCC CHECKIDENT ('StoreSales', RESEED, 0)`);
      
      // Reinsert sales
      let script = `SET IDENTITY_INSERT StoreSales ON\n`;
      for (let i = 0; i < salesList.length; i++) {
        const sale = salesList[i];
        const newId = i + 1;
        const saleDate = new Date(sale.SaleDate).toISOString().replace('T', ' ').slice(0, 19);
        const notes = (sale.Notes || '').replace(/'/g, "''");
        
        console.log(`   Sale ${sale.SaleID} → Sale ${newId}`);
        script += `INSERT INTO StoreSales (SaleID, OrderID, MemberID, TotalAmount, SaleDate, Notes) VALUES (${newId}, ${sale.OrderID}, ${sale.MemberID}, ${sale.TotalAmount}, '${saleDate}', '${notes}');\n`;
      }
      script += `SET IDENTITY_INSERT StoreSales OFF\n`;
      await pool.request().query(script);
      await pool.request().query(`DBCC CHECKIDENT ('StoreSales', RESEED, ${salesList.length})`);
    }
    
    // Verify sales
    sales = await pool.request().query(`SELECT SaleID, OrderID FROM StoreSales ORDER BY SaleID`);
    console.log(`   ✅ Sales after: ${sales.recordset.map(s => `#${s.SaleID}`).join(', ') || 'none'}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL IDs RENUMBERED TO START FROM 1!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

renumberAll();
