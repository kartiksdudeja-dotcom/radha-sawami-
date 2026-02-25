import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER || 'KARTIKDUDEJA\\SQLEXPRESS',
  database: process.env.DB_NAME || 'RSPortal',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'SaStrong@123'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function seedStoreData() {
  let pool;
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       SEEDING STORE ITEMS & DATA INTO DATABASE            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Sample store items
    const items = [
      { name: 'Spiritual Books', desc: 'Collection of spiritual books and teachings', category: 'Books', price: 250, qty: 50 },
      { name: 'Prayer Beads (Mala)', desc: 'Traditional prayer beads for meditation', category: 'Accessories', price: 150, qty: 100 },
      { name: 'Incense Sticks', desc: 'Aromatic incense sticks', category: 'Religious Items', price: 50, qty: 200 },
      { name: 'Oil Lamps', desc: 'Traditional clay oil lamps', category: 'Religious Items', price: 75, qty: 75 },
      { name: 'Meditation Cushion', desc: 'Comfortable meditation cushions', category: 'Accessories', price: 500, qty: 30 },
      { name: 'Holy Pictures', desc: 'Framed holy pictures and paintings', category: 'Religious Items', price: 300, qty: 40 },
      { name: 'Sarees', desc: 'Traditional spiritual sarees', category: 'Clothing', price: 800, qty: 25 },
      { name: 'Prasad Container', desc: 'Containers for religious offerings', category: 'Accessories', price: 200, qty: 60 },
      { name: 'Devotional CDs', desc: 'Devotional music and chanting CDs', category: 'Media', price: 100, qty: 80 },
      { name: 'Flowers & Garlands', desc: 'Fresh flowers for offerings', category: 'Religious Items', price: 200, qty: 120 }
    ];

    console.log('📦 Adding Store Items...\n');
    
    for (const item of items) {
      await pool
        .request()
        .input('ItemName', sql.NVarChar(255), item.name)
        .input('Description', sql.NVarChar(sql.MAX), item.desc)
        .input('Category', sql.NVarChar(100), item.category)
        .input('Price', sql.Decimal(10, 2), item.price)
        .input('Quantity', sql.Int, item.qty)
        .input('Unit', sql.NVarChar(50), 'Piece')
        .query(`
          INSERT INTO StoreItems (ItemName, Description, Category, Price, Quantity, Unit)
          VALUES (@ItemName, @Description, @Category, @Price, @Quantity, @Unit)
        `);
      console.log(`   ✅ Added: ${item.name} (${item.qty} units @ ₹${item.price})`);
    }

    console.log('\n📊 Creating Sample Orders...\n');

    // Get some random members
    const membersResult = await pool.request().query(`
      SELECT TOP 10 MemberID, Name FROM MemberDetails ORDER BY NEWID()
    `);
    
    const members = membersResult.recordset;
    const itemsResult = await pool.request().query('SELECT TOP 5 ItemID, Price FROM StoreItems');
    const storeItems = itemsResult.recordset;

    // Create sample orders
    for (let i = 0; i < 5; i++) {
      const member = members[i];
      const randomItem = storeItems[Math.floor(Math.random() * storeItems.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const totalAmount = randomItem.Price * quantity;
      const orderNumber = `ORD-${Date.now()}-${i}`;

      const orderResult = await pool
        .request()
        .input('OrderNumber', sql.NVarChar(50), orderNumber)
        .input('MemberID', sql.Int, member.MemberID)
        .input('TotalAmount', sql.Decimal(12, 2), totalAmount)
        .input('Status', sql.NVarChar(50), 'Completed')
        .query(`
          INSERT INTO StoreOrders (OrderNumber, MemberID, TotalAmount, Status)
          VALUES (@OrderNumber, @MemberID, @TotalAmount, @Status);
          SELECT @@IDENTITY as OrderID;
        `);

      const OrderID = orderResult.recordset[0].OrderID;

      // Add order item
      await pool
        .request()
        .input('OrderID', sql.Int, OrderID)
        .input('ItemID', sql.Int, randomItem.ItemID)
        .input('Quantity', sql.Int, quantity)
        .input('UnitPrice', sql.Decimal(10, 2), randomItem.Price)
        .input('TotalPrice', sql.Decimal(12, 2), totalAmount)
        .query(`
          INSERT INTO StoreOrderItems (OrderID, ItemID, Quantity, UnitPrice, TotalPrice)
          VALUES (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)
        `);

      // Record sale
      await pool
        .request()
        .input('OrderID', sql.Int, OrderID)
        .input('ItemID', sql.Int, randomItem.ItemID)
        .input('MemberID', sql.Int, member.MemberID)
        .input('Quantity', sql.Int, quantity)
        .input('UnitPrice', sql.Decimal(10, 2), randomItem.Price)
        .input('TotalAmount', sql.Decimal(12, 2), totalAmount)
        .input('PaymentStatus', sql.NVarChar(50), 'Completed')
        .query(`
          INSERT INTO StoreSales (OrderID, ItemID, MemberID, Quantity, UnitPrice, TotalAmount, PaymentStatus)
          VALUES (@OrderID, @ItemID, @MemberID, @Quantity, @UnitPrice, @TotalAmount, @PaymentStatus)
        `);

      console.log(`   ✅ Order ${OrderID}: ${member.Name} - ${quantity} item(s) - ₹${totalAmount}`);
    }

    // Verify data
    console.log('\n\n📊 VERIFICATION:\n');
    
    const itemCount = await pool.request().query('SELECT COUNT(*) as cnt FROM StoreItems WHERE IsActive = 1');
    const orderCount = await pool.request().query('SELECT COUNT(*) as cnt FROM StoreOrders');
    const saleCount = await pool.request().query('SELECT COUNT(*) as cnt FROM StoreSales');

    console.log(`   ✅ Store Items: ${itemCount.recordset[0].cnt}`);
    console.log(`   ✅ Store Orders: ${orderCount.recordset[0].cnt}`);
    console.log(`   ✅ Store Sales: ${saleCount.recordset[0].cnt}`);

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        ✅ STORE DATA SEEDING COMPLETE!                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await pool.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.originalError) {
      console.error('Details:', error.originalError.message);
    }
  }
}

seedStoreData();
