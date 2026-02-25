import { getPool } from "./config/db.js";

async function testSeva() {
  try {
    const pool = await getPool();

    console.log("🧪 Testing Seva Functionality...\n");

    // 1. Check if Seva table exists and has data
    console.log("1️⃣ Checking Seva table...");
    const sevaCheck = await pool.request().query(`
      SELECT COUNT(*) as count FROM Seva
    `);
    console.log(`   ✅ Seva records: ${sevaCheck.recordset[0].count}`);

    // 2. Fetch all seva entries
    console.log("\n2️⃣ Fetching all seva entries...");
    const allSeva = await pool.request().query(`
      SELECT 
        s.SevaId, s.UserID, m.Name, s.SevaCategory, s.SevaName, s.Hours, s.Cost, s.SevaDate
      FROM Seva s
      LEFT JOIN MemberDetails m ON s.UserID = m.UserID
      ORDER BY s.CreatedAt DESC
    `);
    console.log(`   ✅ Found ${allSeva.recordset.length} seva entries:`);
    allSeva.recordset.forEach((row, idx) => {
      console.log(
        `      ${idx + 1}. ${row.Name} - ${row.SevaName} (${row.Hours}hrs, ₹${
          row.Cost
        })`
      );
    });

    // 3. Check Attendance table structure
    console.log("\n3️⃣ Checking Attendance table...");
    const attSchema = await pool.request().query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='Attendance' 
      ORDER BY ORDINAL_POSITION
    `);
    console.log(
      `   ✅ Attendance columns: ${attSchema.recordset
        .map((r) => r.COLUMN_NAME)
        .join(", ")}`
    );

    // 4. Check attendance records
    console.log("\n4️⃣ Checking attendance records...");
    const attCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM Attendance
    `);
    console.log(`   ✅ Attendance records: ${attCount.recordset[0].count}`);

    console.log("\n✅ All tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testSeva();
