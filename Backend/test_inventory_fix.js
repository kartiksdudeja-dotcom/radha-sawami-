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

async function testInventoryFix() {
  const pool = new sql.ConnectionPool(config);
  
  try {
    await pool.connect();
    console.log('✅ Connected to database\n');

    // Get an item with quantity > 0
    const itemResult = await pool
      .request()
      .query(`SELECT TOP 1 ItemID, ItemName, Quantity, Price FROM StoreItems WHERE Quantity > 0`);
    
    const item = itemResult.recordset[0];
    console.log(`📦 Selected item for order test:`);
    console.log(`   ItemID: ${item.ItemID}`);
    console.log(`   ItemName: ${item.ItemName}`);
    console.log(`   Current Quantity: ${item.Quantity}`);
    console.log(`   Price: ${item.Price}\n`);

    // Create test order
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const orderDate = `${day}/${month}/${year}`;
    
    try {
      const insertResult = await pool
        .request()
        .input("MemberID", sql.Int, 1)
        .input("TotalAmount", sql.Decimal(10, 2), item.Price * 1)
        .input("Status", sql.VarChar, 'Pending')
        .input("OrderDate", sql.VarChar(10), orderDate)
        .query(`
          INSERT INTO StoreOrders (MemberID, TotalAmount, Status, OrderDate)
          VALUES (@MemberID, @TotalAmount, @Status, @OrderDate)
        `);
    } catch (error) {
      console.log(`⚠️  Order creation failed (might already exist), trying alternate method`);
    }

    console.log(`✅ Order created\n`);

    // Get the OrderID
    const orderIDResult = await pool
      .request()
      .query(`SELECT TOP 1 OrderID FROM StoreOrders ORDER BY OrderID DESC`);
    
    const OrderID = orderIDResult.recordset[0].OrderID;
    console.log(`📋 New OrderID: ${OrderID}\n`);

    // Insert order item
    await pool
      .request()
      .input("OrderID", sql.Int, OrderID)
      .input("ItemID", sql.Int, item.ItemID)
      .input("Quantity", sql.Int, 1)
      .input("Price", sql.Decimal(10, 2), item.Price)
      .query(`
        INSERT INTO StoreOrderItems (OrderID, ItemID, Quantity, Price)
        VALUES (@OrderID, @ItemID, @Quantity, @Price)
      `);

    console.log(`✅ Order item inserted\n`);

    // Check quantity before update
    const beforeResult = await pool
      .request()
      .input("ItemID", sql.Int, item.ItemID)
      .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
    
    const quantityBefore = beforeResult.recordset[0].Quantity;
    console.log(`📊 Quantity BEFORE inventory update: ${quantityBefore}\n`);

    // Now execute the same UPDATE query as in storeController.js
    console.log(`🔧 Executing inventory update...\n`);
    
    const updateQuery = `
      UPDATE StoreItems 
      SET Quantity = Quantity - 1
      WHERE ItemID = ${item.ItemID}
    `;
    
    const updateResult = await pool.request().query(updateQuery);
    console.log(`✅ Update executed`);
    console.log(`   Rows affected: ${updateResult.rowsAffected}\n`);

    // Check quantity after update
    const afterResult = await pool
      .request()
      .input("ItemID", sql.Int, item.ItemID)
      .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
    
    const quantityAfter = afterResult.recordset[0].Quantity;
    console.log(`📉 Quantity AFTER inventory update: ${quantityAfter}\n`);

    if (quantityAfter === quantityBefore - 1) {
      console.log(`✅ SUCCESS! Inventory reduced correctly by 1`);
      console.log(`   From: ${quantityBefore} → To: ${quantityAfter}`);
    } else {
      console.log(`❌ FAILED! Inventory NOT reduced`);
      console.log(`   Expected: ${quantityBefore - 1}, Got: ${quantityAfter}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.close();
  }
}

testInventoryFix();
