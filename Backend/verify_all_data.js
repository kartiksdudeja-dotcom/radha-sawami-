import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'RSPortal',
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'SaStrong@123',
    },
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000,
  },
};

async function testAllData() {
  let pool;
  try {
    console.log('\n========================================');
    console.log('🔍 DATABASE DATA VERIFICATION TEST');
    console.log('========================================\n');

    console.log('📋 Configuration:');
    console.log(`  Server: ${config.server}`);
    console.log(`  Database: ${config.database}`);
    console.log(`  User: ${config.authentication.options.userName}\n`);

    // Connect
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to Database\n');

    // Test Members
    console.log('👥 MEMBERS DATA:');
    const members = await pool.request().query(`
      SELECT COUNT(*) as total FROM MemberDetails
    `);
    console.log(`   Total Members: ${members.recordset[0].total}`);
    
    const memberSample = await pool.request().query(`
      SELECT TOP 3 UserID, Name, Gender, Status FROM MemberDetails
    `);
    console.log(`   Sample Members: ${memberSample.recordset.length}`);
    memberSample.recordset.forEach((m, i) => {
      console.log(`     ${i+1}. ${m.Name} (${m.Gender}) - ${m.Status}`);
    });

    // Test Attendance
    console.log('\n📅 ATTENDANCE DATA:');
    const attendance = await pool.request().query(`
      SELECT COUNT(*) as total FROM Attendance
    `);
    console.log(`   Total Records: ${attendance.recordset[0].total}`);
    
    const attByYear = await pool.request().query(`
      SELECT year, COUNT(*) as count FROM Attendance GROUP BY year ORDER BY year DESC
    `);
    console.log(`   By Year:`);
    attByYear.recordset.forEach(a => {
      console.log(`     ${a.year}: ${a.count} records`);
    });
    
    const attSample = await pool.request().query(`
      SELECT TOP 3 Attendance_date, UserID, Shift, Audio_Satsang FROM Attendance ORDER BY Attendance_date DESC
    `);
    console.log(`   Latest Records:`);
    attSample.recordset.forEach((a, i) => {
      console.log(`     ${i+1}. ${a.Attendance_date} - ${a.Shift} (${a.Audio_Satsang})`);
    });

    // Test Seva
    console.log('\n🙏 SEVA DATA:');
    const seva = await pool.request().query(`
      SELECT COUNT(*) as total FROM SevaMemberInfo
    `);
    console.log(`   Total Seva Records: ${seva.recordset[0].total}`);
    
    const sevaSample = await pool.request().query(`
      SELECT TOP 3 UserID, Date, Cumm_Hrs, Cumm_Amt FROM SevaMemberInfo ORDER BY Date DESC
    `);
    console.log(`   Sample Records:`);
    sevaSample.recordset.forEach((s, i) => {
      console.log(`     ${i+1}. User${s.UserID} - ${s.Date} - ${s.Cumm_Hrs}hrs (Rs${s.Cumm_Amt})`);
    });

    // Test Users/Authentication
    console.log('\n🔐 USERS DATA (from MemberDetails):');
    const users = await pool.request().query(`
      SELECT COUNT(*) as total FROM MemberDetails WHERE UserName IS NOT NULL AND UserName != ''
    `);
    console.log(`   Total Users with Credentials: ${users.recordset[0].total}`);
    
    const userSample = await pool.request().query(`
      SELECT TOP 3 UserID, Name, UserName FROM MemberDetails WHERE UserName IS NOT NULL ORDER BY UserID
    `);
    console.log(`   Sample Users:`);
    userSample.recordset.forEach((u, i) => {
      console.log(`     ${i+1}. ${u.Name} (Username: ${u.UserName})`);
    });

    // Test Store Data
    console.log('\n🛍️ STORE DATA:');
    const products = await pool.request().query(`
      SELECT COUNT(*) as total FROM StoreProducts
    `);
    console.log(`   Total Products: ${products.recordset[0].total}`);
    
    const prodSample = await pool.request().query(`
      SELECT TOP 3 Product_Name, Price FROM StoreProducts
    `);
    console.log(`   Sample Products:`);
    prodSample.recordset.forEach((p, i) => {
      console.log(`     ${i+1}. ${p.Product_Name} - Rs${p.Price}`);
    });

    // Summary
    console.log('\n========================================');
    console.log('✅ DATA VERIFICATION COMPLETE');
    console.log('========================================');
    console.log('\n✨ All data sources are accessible from the database!\n');

    await pool.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n⚠️  Troubleshooting:');
    console.error('  1. Check if SQL Server is running');
    console.error('  2. Verify DB_SERVER is correct: KARTIKDUDEJA\\SQLEXPRESS');
    console.error('  3. Verify DB_USER credentials (sa / SaStrong@123)');
    console.error('  4. Ensure RSPortal database exists');
    console.error('  5. Check TCP/IP protocol is enabled\n');
    process.exit(1);
  }
}

testAllData();
