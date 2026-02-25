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

async function testInventoryUpdate() {
  const pool = new sql.ConnectionPool(config);
  
  try {
    await pool.connect();
    console.log('✅ Connected to database\n');

    // Get an item with quantity > 0
    const itemResult = await pool
      .request()
      .query(`SELECT TOP 1 ItemID, ItemName, Quantity FROM StoreItems WHERE Quantity > 1`);
    
    const item = itemResult.recordset[0];
    console.log(`📦 Selected item for test:`);
    console.log(`   ItemID: ${item.ItemID}`);
    console.log(`   ItemName: ${item.ItemName}`);
    console.log(`   Current Quantity: ${item.Quantity}\n`);

    // Check quantity before
    const beforeResult = await pool
      .request()
      .input("ItemID", sql.Int, item.ItemID)
      .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
    
    const quantityBefore = beforeResult.recordset[0].Quantity;
    console.log(`📊 Quantity BEFORE update: ${quantityBefore}`);

    // Execute the UPDATE query (same as in storeController.js)
    console.log(`\n🔧 Executing UPDATE query...`);
    const updateQuery = `UPDATE StoreItems SET Quantity = Quantity - 1 WHERE ItemID = ${item.ItemID}`;
    console.log(`Query: ${updateQuery}\n`);
    
    const updateResult = await pool.request().query(updateQuery);
    console.log(`Update result:`, updateResult);
    console.log(`Rows affected: ${updateResult.rowsAffected}\n`);

    // Check quantity after
    const afterResult = await pool
      .request()
      .input("ItemID", sql.Int, item.ItemID)
      .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
    
    const quantityAfter = afterResult.recordset[0].Quantity;
    console.log(`📉 Quantity AFTER update: ${quantityAfter}`);

    if (quantityAfter === quantityBefore - 1) {
      console.log(`\n✅ SUCCESS! Inventory reduced correctly`);
      console.log(`   Before: ${quantityBefore} → After: ${quantityAfter}`);
    } else {
      console.log(`\n❌ FAILED! Inventory NOT reduced`);
      console.log(`   Expected: ${quantityBefore - 1}, Got: ${quantityAfter}`);
    }

    // UNDO the change (revert quantity)
    await pool.request().query(`UPDATE StoreItems SET Quantity = Quantity + 1 WHERE ItemID = ${item.ItemID}`);
    console.log(`\n🔄 Reverted quantity back to original`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.close();
  }
}

testInventoryUpdate();
