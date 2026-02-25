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

async function testOrderWithInventoryReduction() {
  const pool = new sql.ConnectionPool(config);
  
  try {
    await pool.connect();
    console.log('✅ Connected to database\n');

    // Get an item to order
    const itemResult = await pool
      .request()
      .query(`SELECT TOP 1 ItemID, ItemName, Quantity, Price FROM StoreItems WHERE Quantity > 0 ORDER BY ItemID DESC`);
    
    if (itemResult.recordset.length === 0) {
      console.log('❌ No items available');
      return;
    }

    const item = itemResult.recordset[0];
    console.log(`📦 Item Selected:`);
    console.log(`   ItemID: ${item.ItemID}, Name: ${item.ItemName}`);
    console.log(`   Price: ₹${item.Price}, Available Qty: ${item.Quantity}\n`);

    const quantityBefore = item.Quantity;

    // Create order
    console.log(`🛒 Creating Order...`);
    const orderResult = await pool
      .request()
      .input("OrderNumber", sql.NVarChar(50), `TEST-${Date.now()}`)
      .input("MemberID", sql.Int, 1)
      .input("TotalAmount", sql.Decimal(12, 2), item.Price)
      .input("Status", sql.NVarChar(50), "Pending")
      .query(`
        INSERT INTO StoreOrders (OrderNumber, MemberID, TotalAmount, Status)
        VALUES (@OrderNumber, @MemberID, @TotalAmount, @Status);
        SELECT @@IDENTITY as OrderID;
      `);

    const OrderID = orderResult.recordset[0].OrderID;
    console.log(`✅ Order created with ID: ${OrderID}\n`);

    // Insert order item
    console.log(`📝 Inserting Order Item...`);
    await pool
      .request()
      .input("OrderID", sql.Int, OrderID)
      .input("ItemID", sql.Int, item.ItemID)
      .input("Quantity", sql.Int, 1)
      .input("UnitPrice", sql.Decimal(10, 2), item.Price)
      .input("TotalPrice", sql.Decimal(12, 2), item.Price)
      .query(`
        INSERT INTO StoreOrderItems (OrderID, ItemID, Quantity, UnitPrice, TotalPrice)
        VALUES (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)
      `);
    console.log(`✅ Order item inserted\n`);

    // Manually execute the same update that the API would run
    console.log(`🔧 Reducing Inventory...`);
    const updateQuery = `
      UPDATE StoreItems 
      SET Quantity = Quantity - 1
      WHERE ItemID = ${item.ItemID}
    `;
    console.log(`   Query: ${updateQuery}`);
    
    const updateResult = await pool.request().query(updateQuery);
    console.log(`   Rows affected: ${updateResult.rowsAffected[0]}\n`);

    // Check new quantity
    console.log(`✅ Checking New Inventory...`);
    const newItemResult = await pool
      .request()
      .input("ItemID", sql.Int, item.ItemID)
      .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
    
    const quantityAfter = newItemResult.recordset[0].Quantity;
    
    console.log(`   ItemID: ${item.ItemID}`);
    console.log(`   Before: ${quantityBefore} units`);
    console.log(`   After:  ${quantityAfter} units`);
    console.log(`   Reduced by: ${quantityBefore - quantityAfter} units\n`);

    if (quantityAfter === quantityBefore - 1) {
      console.log(`✅✅✅ SUCCESS! Inventory reduced correctly!`);
    } else {
      console.log(`❌ FAILED! Expected ${quantityBefore - 1}, got ${quantityAfter}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.close();
  }
}

testOrderWithInventoryReduction();
