import sql from "mssql";

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

async function analyzeAttendanceIssue() {
  const pool = new sql.ConnectionPool(config);

  try {
    await pool.connect();
    console.log("✅ Connected to database\n");

    // Step 1: Check table structure
    console.log("📋 STEP 1: Checking Attendance table structure...\n");
    const schema = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Attendance'
      ORDER BY ORDINAL_POSITION
    `);

    console.log("Table Columns:");
    schema.recordset.forEach((col) => {
      const nullable = col.IS_NULLABLE === "YES" ? "✓ NULL" : "✗ NOT NULL";
      const defaultVal = col.COLUMN_DEFAULT ? `(${col.COLUMN_DEFAULT})` : "";
      console.log(
        `  ${col.COLUMN_NAME.padEnd(20)} | ${col.DATA_TYPE.padEnd(
          12
        )} | ${nullable} ${defaultVal}`
      );
    });

    // Step 2: Check if columns exist
    console.log("\n📋 STEP 2: Verifying required columns exist...\n");
    const requiredColumns = ["dt", "day", "month", "year"];
    const existingColumns = schema.recordset.map((c) => c.COLUMN_NAME);
    requiredColumns.forEach((col) => {
      if (existingColumns.includes(col)) {
        console.log(`  ✅ ${col} - EXISTS`);
      } else {
        console.log(`  ❌ ${col} - MISSING (Need to add this column!)`);
      }
    });

    // Step 3: Check recent data
    console.log("\n📋 STEP 3: Checking recent 5 records...\n");
    const recent = await pool.request().query(`
      SELECT TOP 5
        Attendance_Id,
        UserID,
        Attendance_date,
        dt,
        day,
        month,
        year
      FROM Attendance
      ORDER BY Attendance_Id DESC
    `);

    recent.recordset.forEach((record) => {
      console.log(`Record ${record.Attendance_Id}:`);
      console.log(`  Date: ${record.Attendance_date}`);
      console.log(`  dt: ${record.dt || "❌ NULL"}`);
      console.log(`  day: ${record.day || "❌ NULL"}`);
      console.log(`  month: ${record.month || "❌ NULL"}`);
      console.log(`  year: ${record.year || "❌ NULL"}`);
    });

    // Step 4: Test INSERT statement directly
    console.log("\n📋 STEP 4: Testing direct INSERT statement...\n");
    try {
      const testResult = await pool
        .request()
        .input("member_id", sql.Int, 1)
        .input("date", sql.NVarChar, "2025-12-26")
        .input("shift", sql.NVarChar, "Test")
        .input("audio_satsang", sql.NVarChar, "Test Satsang")
        .input("time", sql.VarChar(20), "09:00:00")
        .input("day", sql.Int, 26)
        .input("month", sql.Int, 12)
        .input("year", sql.Int, 2025).query(`
          INSERT INTO Attendance 
          (UserID, Attendance_date, Shift, Audio_Satsang, PresentTime, dt, day, month, year)
          VALUES 
          (@member_id, @date, @shift, @audio_satsang, CAST(@time AS TIME), GETDATE(), @day, @month, @year);
          SELECT SCOPE_IDENTITY() as id;
        `);

      console.log(
        `✅ Test INSERT successful. New ID: ${testResult.recordset[0].id}`
      );

      // Verify the insert
      const verify = await pool
        .request()
        .input("id", sql.Int, testResult.recordset[0].id).query(`
          SELECT Attendance_Id, day, month, year, dt
          FROM Attendance
          WHERE Attendance_Id = @id
        `);

      const inserted = verify.recordset[0];
      console.log(`\nVerification of inserted record:`);
      console.log(`  day: ${inserted.day || "❌ NULL"}`);
      console.log(`  month: ${inserted.month || "❌ NULL"}`);
      console.log(`  year: ${inserted.year || "❌ NULL"}`);
      console.log(`  dt: ${inserted.dt || "❌ NULL"}`);

      if (inserted.day && inserted.month && inserted.year && inserted.dt) {
        console.log("\n✅ TEST PASSED! INSERT is working correctly.");
      } else {
        console.log(
          "\n❌ TEST FAILED! INSERT is not populating these columns."
        );
      }
    } catch (err) {
      console.log(`❌ Test INSERT failed: ${err.message}`);
    }

    // Step 5: Summary
    console.log("\n📊 SUMMARY:\n");
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
    console.log(`Total records: ${counts.total}`);
    console.log(`  NULL dt: ${counts.null_dt || 0}`);
    console.log(`  NULL day: ${counts.null_day || 0}`);
    console.log(`  NULL month: ${counts.null_month || 0}`);
    console.log(`  NULL year: ${counts.null_year || 0}`);

    if (counts.null_dt === 0 && counts.null_day === 0) {
      console.log("\n✅ All values are populated!");
    } else {
      console.log(
        "\n❌ Still have NULL values. Columns may need to be added or INSERT logic needs fixing."
      );
    }

    await pool.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

analyzeAttendanceIssue();
