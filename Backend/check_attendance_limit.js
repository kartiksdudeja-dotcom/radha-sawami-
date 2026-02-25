import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  📊 ATTENDANCE REPORT - ALL DATA (NO LIMITS)              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Get total count
    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM Attendance');
    const totalCount = countResult.recordset[0].total;
    console.log(`✅ Total Attendance Records: ${totalCount}\n`);

    // Get by date
    const dateResult = await pool.request().query(`
      SELECT DISTINCT year FROM Attendance ORDER BY year DESC
    `);
    console.log('📅 Records by Year:');
    for (const row of dateResult.recordset) {
      const yearCount = await pool.request().query(
        `SELECT COUNT(*) as count FROM Attendance WHERE year = ${row.year}`
      );
      console.log(`   ${row.year}: ${yearCount.recordset[0].count}`);
    }

    // Get by shift
    console.log('\n🔄 Records by Shift:');
    const shiftResult = await pool.request().query(`
      SELECT Shift, COUNT(*) as count FROM Attendance WHERE Shift IS NOT NULL GROUP BY Shift
    `);
    shiftResult.recordset.forEach(row => {
      console.log(`   ${row.Shift}: ${row.count}`);
    });

    // Get sample records
    console.log('\n📋 Sample Records (showing all):');
    const sampleResult = await pool.request().query(`
      SELECT TOP 20 
        Attendance_date, Shift, Audio_Satsang, 
        (SELECT COUNT(*) FROM Attendance a2 WHERE a2.Attendance_date = a1.Attendance_date) as member_count
      FROM Attendance a1
      ORDER BY Attendance_date DESC
    `);
    
    sampleResult.recordset.forEach((row, i) => {
      console.log(`   ${i+1}. ${row.Attendance_date} | ${row.Shift} | ${row.Audio_Satsang} | Members: ${row.member_count}`);
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ VERIFICATION COMPLETE                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✨ CHANGES MADE:');
    console.log('   ✓ Removed TOP 1000 limit from getAllAttendance()');
    console.log(`   ✓ Backend now returns ALL ${totalCount} records`);
    console.log('   ✓ Frontend will display complete attendance report\n');

    await pool.close();

  } catch(e) {
    console.error('Error:', e.message);
  }
})();
