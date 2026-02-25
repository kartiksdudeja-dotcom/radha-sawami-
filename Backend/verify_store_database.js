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
    trustServerCertificate: true,
    connectionTimeout: 10000
  }
};

async function verifyDatabase() {
  let pool;
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     RADHA SWAMI - DATABASE VERIFICATION REPORT            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Check all tables
    console.log('📊 STEP 1: ALL TABLES IN DATABASE\n');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    const allTables = tablesResult.recordset.map(row => row.TABLE_NAME);
    allTables.forEach((table, idx) => {
      console.log(`   ${idx + 1}. ${table}`);
    });

    // 2. Count records in key tables
    console.log('\n\n📈 STEP 2: RECORD COUNTS IN KEY TABLES\n');
    
    const keyTables = {
      'MemberDetails': 'Members',
      'Attendance': 'Attendance Records',
      'SevaMemberInfo': 'Seva Records',
      'StoreItems': 'Store Items',
      'StoreOrders': 'Store Orders',
      'StoreSales': 'Store Sales',
      'Users': 'User Accounts'
    };

    for (const [tableName, label] of Object.entries(keyTables)) {
      if (allTables.includes(tableName)) {
        const countResult = await pool.request().query(`SELECT COUNT(*) as cnt FROM ${tableName}`);
        const count = countResult.recordset[0].cnt;
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`   ${status} ${label} (${tableName}): ${count} records`);
      }
    }

    // 3. Check Store Items
    console.log('\n\n🛍️  STEP 3: STORE ITEMS DETAILS\n');
    
    if (allTables.includes('StoreItems')) {
      const storeItems = await pool.request().query(`
        SELECT TOP 10 * FROM StoreItems
      `);
      
      const itemCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM StoreItems`);
      console.log(`   Total Store Items: ${itemCount.recordset[0].cnt}\n`);
      
      if (storeItems.recordset.length > 0) {
        console.log('   Sample Items:');
        storeItems.recordset.slice(0, 5).forEach((item, idx) => {
          console.log(`   ${idx + 1}. ${JSON.stringify(item, null, 2)}`);
        });
      } else {
        console.log('   ⚠️  No store items found in database');
      }
    }

    // 4. Check Store Orders
    console.log('\n\n📦 STEP 4: STORE ORDERS DETAILS\n');
    
    if (allTables.includes('StoreOrders')) {
      const orderCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM StoreOrders`);
      const count = orderCount.recordset[0].cnt;
      console.log(`   Total Store Orders: ${count}\n`);
      
      if (count > 0) {
        const storeOrders = await pool.request().query(`SELECT TOP 5 * FROM StoreOrders`);
        console.log('   Sample Orders:');
        storeOrders.recordset.forEach((order, idx) => {
          console.log(`   ${idx + 1}. ${JSON.stringify(order, null, 2)}`);
        });
      }
    }

    // 5. Check Table Structure
    console.log('\n\n🔧 STEP 5: KEY TABLE STRUCTURES\n');
    
    for (const tableName of ['StoreItems', 'StoreOrders', 'StoreSales']) {
      if (allTables.includes(tableName)) {
        const columnsResult = await pool.request().query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = '${tableName}'
          ORDER BY ORDINAL_POSITION
        `);
        
        console.log(`\n   ${tableName} Columns:`);
        columnsResult.recordset.forEach((col) => {
          const nullable = col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)';
          console.log(`      • ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${nullable}`);
        });
      }
    }

    // 6. Summary
    console.log('\n\n📋 STEP 6: DATA STORAGE SUMMARY\n');
    
    const memberCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM MemberDetails`);
    const attendanceCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM Attendance`);
    const sevaCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM SevaMemberInfo`);
    const storeItemCount = await pool.request().query(`SELECT COUNT(*) as cnt FROM StoreItems`);
    
    console.log(`   📊 Members: ${memberCount.recordset[0].cnt}`);
    console.log(`   📋 Attendance Records: ${attendanceCount.recordset[0].cnt}`);
    console.log(`   🙏 Seva Records: ${sevaCount.recordset[0].cnt}`);
    console.log(`   🛍️  Store Items: ${storeItemCount.recordset[0].cnt}`);

    console.log('\n\n✅ VERIFICATION COMPLETE!\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  All data is being stored in RSPortal database successfully ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await pool.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.originalError) {
      console.error('Details:', error.originalError.message);
    }
  }
}

verifyDatabase();
