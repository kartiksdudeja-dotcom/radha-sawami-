import { getPool } from "./config/db.js";

async function testDateFormats() {
  try {
    const pool = await getPool();
    
    // Check raw dates from database
    const result = await pool.request().query(`
      SELECT TOP 20 
        Sr_No,
        UserID,
        Date,
        CONVERT(VARCHAR(10), Date, 103) as DateFormatted_103,
        CONVERT(VARCHAR(10), Date, 120) as DateFormatted_120,
        Cumm_Hrs,
        Cumm_Amt
      FROM SevaMemberInfo
      ORDER BY Date DESC
    `);

    console.log("\n📊 Raw database dates:");
    result.recordset.forEach((row, index) => {
      console.log(`${index + 1}. Raw: "${row.Date}" | Format 103 (DD/MM/YYYY): "${row.DateFormatted_103}" | Format 120 (YYYY-MM-DD): "${row.DateFormatted_120}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testDateFormats();
