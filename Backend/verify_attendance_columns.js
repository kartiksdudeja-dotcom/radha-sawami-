import sql from "mssql";

// Database configuration
const config = {
  server: "KARTIKDUDEJA\\SQLEXPRESS",
  database: "RSPortal",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "12345",
    },
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function verifyAttendanceColumns() {
  const pool = new sql.ConnectionPool(config);

  try {
    await pool.connect();
    console.log("✅ Connected to database\n");

    // Query recent attendance records with all columns
    console.log("📋 RECENT ATTENDANCE RECORDS (Last 10):\n");
    const result = await pool.request().query(`
      SELECT TOP 10
        Attendance_Id,
        UserID,
        Attendance_date,
        Shift,
        Audio_Satsang,
        PresentTime,
        dt,
        day,
        month,
        year
      FROM Attendance
      ORDER BY Attendance_Id DESC
    `);

    if (result.recordset.length === 0) {
      console.log("❌ No attendance records found\n");
      await pool.close();
      return;
    }

    console.log(`Found ${result.recordset.length} records:\n`);

    // Display records
    result.recordset.forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${record.Attendance_Id}`);
      console.log(`  UserID: ${record.UserID}`);
      console.log(`  Attendance Date: ${record.Attendance_date}`);
      console.log(`  Shift: ${record.Shift}`);
      console.log(`  Audio Satsang: ${record.Audio_Satsang}`);
      console.log(`  Time: ${record.PresentTime}`);
      console.log(`  dt: ${record.dt || "❌ NULL"}`);
      console.log(`  day: ${record.day || "❌ NULL"}`);
      console.log(`  month: ${record.month || "❌ NULL"}`);
      console.log(`  year: ${record.year || "❌ NULL"}`);
      console.log();
    });

    // Check column data types
    console.log("\n📊 ATTENDANCE TABLE SCHEMA:\n");
    const schemaResult = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Attendance'
      ORDER BY ORDINAL_POSITION
    `);

    schemaResult.recordset.forEach((col) => {
      console.log(
        `${col.COLUMN_NAME.padEnd(20)} | ${col.DATA_TYPE.padEnd(15)} | ${
          col.IS_NULLABLE
        } | Default: ${col.COLUMN_DEFAULT || "None"}`
      );
    });

    // Count NULL values in key columns
    console.log("\n📈 NULL VALUE COUNT:\n");
    const nullCount = await pool.request().query(`
      SELECT
        SUM(CASE WHEN dt IS NULL THEN 1 ELSE 0 END) as null_dt,
        SUM(CASE WHEN day IS NULL THEN 1 ELSE 0 END) as null_day,
        SUM(CASE WHEN month IS NULL THEN 1 ELSE 0 END) as null_month,
        SUM(CASE WHEN year IS NULL THEN 1 ELSE 0 END) as null_year,
        COUNT(*) as total
      FROM Attendance
    `);

    const counts = nullCount.recordset[0];
    console.log(`  Total Records: ${counts.total}`);
    console.log(`  NULL dt values: ${counts.null_dt || 0}`);
    console.log(`  NULL day values: ${counts.null_day || 0}`);
    console.log(`  NULL month values: ${counts.null_month || 0}`);
    console.log(`  NULL year values: ${counts.null_year || 0}`);

    if (
      counts.null_dt === 0 &&
      counts.null_day === 0 &&
      counts.null_month === 0 &&
      counts.null_year === 0
    ) {
      console.log("\n✅ ALL COLUMNS HAVE VALUES! Issue is FIXED!\n");
    } else {
      console.log(
        "\n❌ Still have NULL values. Need to investigate further.\n"
      );
    }

    await pool.close();
  } catch (error) {
    console.error("❌ Database Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

verifyAttendanceColumns();
