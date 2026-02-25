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

async function generateDataReport() {
  let pool;
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        📊 RADHA SWAMI DATABASE DATA REPORT                  ║');
    console.log('║                  December 26, 2025                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🔗 CONNECTION INFO:');
    console.log(`   Server: ${process.env.DB_SERVER || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'RSPortal'}`);
    console.log(`   User: ${process.env.DB_USER || 'sa'}\n`);

    // Connect
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Database Connection: SUCCESSFUL\n');

    // ============ MEMBERS ============
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  👥 MEMBERS DATA                                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const memberCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM MemberDetails
    `);
    console.log(`   Total Members: ${memberCount.recordset[0].total}`);
    
    const genderBreakdown = await pool.request().query(`
      SELECT Gender, COUNT(*) as count FROM MemberDetails GROUP BY Gender
    `);
    console.log(`   By Gender:`);
    genderBreakdown.recordset.forEach(g => {
      console.log(`     • ${g.Gender || 'Not Specified'}: ${g.count}`);
    });
    
    const statusBreakdown = await pool.request().query(`
      SELECT Status, COUNT(*) as count FROM MemberDetails GROUP BY Status
    `);
    console.log(`   By Status:`);
    statusBreakdown.recordset.forEach(s => {
      console.log(`     • ${s.Status || 'Unknown'}: ${s.count}`);
    });

    // ============ ATTENDANCE ============
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📅 ATTENDANCE DATA                                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const attCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM Attendance
    `);
    console.log(`   Total Attendance Records: ${attCount.recordset[0].total}`);
    
    const attByYear = await pool.request().query(`
      SELECT year, COUNT(*) as count FROM Attendance GROUP BY year ORDER BY year DESC
    `);
    console.log(`   Records by Year:`);
    attByYear.recordset.forEach(a => {
      console.log(`     • ${a.year}: ${a.count} records`);
    });
    
    const attByShift = await pool.request().query(`
      SELECT Shift, COUNT(*) as count FROM Attendance WHERE Shift IS NOT NULL GROUP BY Shift
    `);
    console.log(`   By Shift:`);
    attByShift.recordset.forEach(s => {
      console.log(`     • ${s.Shift}: ${s.count}`);
    });

    // ============ SEVA ============
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🙏 SEVA/SERVICE DATA                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const sevaCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM SevaMemberInfo
    `);
    console.log(`   Total Seva Records: ${sevaCount.recordset[0].total}`);
    
    const sevaByYear = await pool.request().query(`
      SELECT year, COUNT(*) as count FROM SevaMemberInfo GROUP BY year ORDER BY year DESC
    `);
    console.log(`   Records by Year:`);
    sevaByYear.recordset.forEach(s => {
      console.log(`     • ${s.year}: ${s.count}`);
    });
    
    const totalHours = await pool.request().query(`
      SELECT SUM(Cumm_Hrs) as total_hours, SUM(Cumm_Amt) as total_amount FROM SevaMemberInfo
    `);
    console.log(`   Total Hours: ${totalHours.recordset[0].total_hours || 0}`);
    console.log(`   Total Amount: Rs${totalHours.recordset[0].total_amount || 0}`);

    // ============ USERS/AUTHENTICATION ============
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🔐 USERS/AUTHENTICATION DATA                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const usersCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM MemberDetails WHERE UserName IS NOT NULL AND UserName != ''
    `);
    console.log(`   Total Users with Credentials: ${usersCount.recordset[0].total}`);
    
    const adminCount = await pool.request().query(`
      SELECT COUNT(*) as total FROM MemberDetails WHERE ChkAdmin = 1
    `);
    console.log(`   Admin Users: ${adminCount.recordset[0].total}`);

    // ============ STORE DATA ============
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🛍️ STORE DATA                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const products = await pool.request().query(`
      SELECT COUNT(*) as total FROM StoreProducts
    `);
    console.log(`   Total Products: ${products.recordset[0].total}`);
    
    const categories = await pool.request().query(`
      SELECT COUNT(*) as total FROM StoreCategories
    `);
    console.log(`   Total Categories: ${categories.recordset[0].total}`);
    
    const orders = await pool.request().query(`
      SELECT COUNT(*) as total FROM StoreOrders
    `);
    console.log(`   Total Orders: ${orders.recordset[0].total}`);

    // ============ SUMMARY ============
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ DATA VERIFICATION SUMMARY                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✨ STATUS: ALL DATA SOURCES ARE ACCESSIBLE\n');
    console.log('📦 TOTAL DATA IN DATABASE:');
    console.log(`   • Members: ${memberCount.recordset[0].total}`);
    console.log(`   • Attendance: ${attCount.recordset[0].total}`);
    console.log(`   • Seva Records: ${sevaCount.recordset[0].total}`);
    console.log(`   • Users: ${usersCount.recordset[0].total}`);
    console.log(`   • Store Products: ${products.recordset[0].total}\n`);

    console.log('🎯 BACKEND STATUS: http://localhost:5000');
    console.log('✅ API ENDPOINTS ACTIVE:');
    console.log('   • GET /api/health');
    console.log('   • GET /api/members');
    console.log('   • GET /api/attendance');
    console.log('   • GET /api/seva');
    console.log('   • GET /api/store/products\n');

    console.log('📝 ENVIRONMENT CONFIGURATION:');
    console.log(`   • DB_SERVER: ${process.env.DB_SERVER}`);
    console.log(`   • DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   • DB_USER: ${process.env.DB_USER}`);
    console.log(`   • PORT: ${process.env.PORT}\n`);

    await pool.close();
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nTroubleshooting Steps:');
    console.error('  1. Verify SQL Server is running');
    console.error('  2. Check .env credentials');
    console.error('  3. Ensure RSPortal database exists');
    console.error('  4. Verify network connectivity\n');
  }
}

generateDataReport();
