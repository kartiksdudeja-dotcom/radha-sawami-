import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    database: process.env.DB_NAME,
    trustServerCertificate: true,
    encrypt: false
  }
};

async function debugInventory() {
  const pool = new sql.ConnectionPool(config);
  
  try {
    await pool.connect();
    console.log('✅ Connected to database\n');

    // Get latest order
    const latestOrder = await pool.request()
      .query(`SELECT TOP 1 OrderID, MemberID, TotalAmount, Status, OrderDate FROM StoreOrders ORDER BY OrderID DESC`);
    
    if (latestOrder.recordset.length === 0) {
      console.log('❌ No orders found');
      return;
    }

    const order = latestOrder.recordset[0];
    console.log(`📋 Latest Order:`);
    console.log(`   OrderID: ${order.OrderID}`);
    console.log(`   MemberID: ${order.MemberID}`);
    console.log(`   TotalAmount: ${order.TotalAmount}`);
    console.log(`   Status: ${order.Status}`);
    console.log(`   OrderDate: ${order.OrderDate}\n`);

    // Get order items
    const orderItems = await pool.request()
      .input('OrderID', sql.Int, order.OrderID)
      .query(`SELECT OrderItemID, ItemID, Quantity, UnitPrice, TotalPrice FROM StoreOrderItems WHERE OrderID = @OrderID`);
    
    console.log(`📦 Order Items for Order #${order.OrderID}:`);
    if (orderItems.recordset.length === 0) {
      console.log('   ❌ No items found for this order!');
    } else {
      orderItems.recordset.forEach(item => {
        console.log(`   - ItemID: ${item.ItemID}, Qty: ${item.Quantity}, UnitPrice: ${item.UnitPrice}, TotalPrice: ${item.TotalPrice}`);
      });
    }
    
    console.log('\n');

    // Get current inventory for items in this order
    if (orderItems.recordset.length > 0) {
      const itemIds = orderItems.recordset.map(i => i.ItemID);
      const itemIdList = itemIds.join(',');
      
      const itemInventory = await pool.request()
        .query(`SELECT ItemID, ItemName, Quantity, Price FROM StoreItems WHERE ItemID IN (${itemIdList})`);
      
      console.log(`📊 Current Inventory for Ordered Items:`);
      itemInventory.recordset.forEach(item => {
        console.log(`   - ItemID: ${item.ItemID}, Name: ${item.ItemName}, Qty: ${item.Quantity}, Price: ${item.Price}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.close();
  }
}

debugInventory();
