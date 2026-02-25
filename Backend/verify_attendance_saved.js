import { getPool } from "./config/db.js";

async function verifyAttendance() {
  try {
    const pool = await getPool();

    console.log("✅ Verifying Attendance Data Saved...\n");

    // Check the latest attendance record
    const result = await pool.request().query(`
      SELECT TOP 5
        a.Attendance_Id as id,
        a.UserID,
        m.Name as member_name,
        a.Attendance_date as date,
        a.Shift,
        a.Audio_Satsang as category,
        a.PresentTime as time
      FROM Attendance a
      LEFT JOIN MemberDetails m ON a.UserID = m.UserID
      ORDER BY a.Attendance_Id DESC
    `);

    console.log("📊 Latest 5 Attendance Records:");
    result.recordset.forEach((row, idx) => {
      console.log(
        `${idx + 1}. ID: ${row.id} | Member: ${row.member_name} | Date: ${
          row.date
        } | Shift: ${row.Shift} | Time: ${row.time}`
      );
    });

    // Count total records
    const countResult = await pool
      .request()
      .query(`SELECT COUNT(*) as count FROM Attendance`);
    console.log(
      `\n📊 Total Attendance Records: ${countResult.recordset[0].count}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

verifyAttendance();
