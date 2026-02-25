import sql from 'mssql';

const config = {
  server: 'KARTIKDUDEJA\\SQLEXPRESS',
  database: 'RSPortal',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'SaStrong@123'
    }
  },
  options: { trustServerCertificate: true }
};

async function checkDatabase() {
  try {
    const pool = await sql.connect(config);
    
    console.log('\n=== LATEST ORDERS ===');
    const orders = await pool.request().query(`
      SELECT TOP 3 OrderID, OrderNumber, MemberID, TotalAmount, Status, OrderDate 
      FROM StoreOrders 
      ORDER BY OrderID DESC
    `);
    console.log(orders.recordset);
    
    console.log('\n=== ORDER ITEMS FOR LATEST ORDER ===');
    if (orders.recordset.length > 0) {
      const latestOrderId = orders.recordset[0].OrderID;
      const items = await pool.request()
        .input('OrderID', sql.Int, latestOrderId)
        .query(`
          SELECT * FROM StoreOrderItems 
          WHERE OrderID = @OrderID
        `);
      console.log(`Items for Order ${latestOrderId}:`, items.recordset);
    }
    
    console.log('\n=== STORE ITEMS WITH QUANTITIES ===');
    const storeItems = await pool.request().query(`
      SELECT TOP 10 ItemID, ItemName, Quantity, Price FROM StoreItems
      ORDER BY ItemID DESC
    `);
    console.log(storeItems.recordset);
    
    await pool.close();
  } catch (error) {
    console.error('Database Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
