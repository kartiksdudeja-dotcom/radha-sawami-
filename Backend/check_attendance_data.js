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
    
    console.log('\n📅 ATTENDANCE DATA VERIFICATION:\n');
    
    // Check total records
    const total = await pool.request().query('SELECT COUNT(*) as count FROM Attendance');
    console.log(`✅ Total Attendance Records: ${total.recordset[0].count}`);
    
    // Check date format
    const samples = await pool.request().query(`
      SELECT TOP 5 Attendance_date, Attendance_Id, UserID, Shift FROM Attendance ORDER BY Attendance_date DESC
    `);
    
    console.log(`\n📋 Sample Records (Date Format Check):`);
    samples.recordset.forEach((s, i) => {
      console.log(`  ${i+1}. Date: ${s.Attendance_date} | ID: ${s.Attendance_Id} | UserID: ${s.UserID} | Shift: ${s.Shift}`);
    });
    
    // Check members join
    const withMembers = await pool.request().query(`
      SELECT TOP 3 
        a.Attendance_Id,
        a.Attendance_date,
        m.UserID,
        m.Name,
        m.Gender
      FROM Attendance a
      LEFT JOIN MemberDetails m ON a.UserID = m.UserID
      ORDER BY a.Attendance_date DESC
    `);
    
    console.log(`\n👥 Records with Member Details:`);
    withMembers.recordset.forEach((r, i) => {
      console.log(`  ${i+1}. ${r.Attendance_date} - ${r.Name} (${r.Gender})`);
    });
    
    // Check date range distribution
    const byYear = await pool.request().query(`
      SELECT YEAR(CONVERT(DATE, Attendance_date, 105)) as year, COUNT(*) as count
      FROM Attendance
      WHERE Attendance_date IS NOT NULL
      GROUP BY YEAR(CONVERT(DATE, Attendance_date, 105))
      ORDER BY year DESC
    `);
    
    console.log(`\n📊 Records by Year:`);
    byYear.recordset.forEach(r => {
      console.log(`  • ${r.year}: ${r.count} records`);
    });
    
    await pool.close();
    console.log('\n✨ Verification Complete!\n');
    
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
