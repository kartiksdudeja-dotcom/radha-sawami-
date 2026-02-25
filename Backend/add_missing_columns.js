import { getPool } from "./config/db.js";

const addMissingColumns = async () => {
  try {
    console.log("🔄 Adding missing Email and Number columns...\n");
    const pool = await getPool();

    // Add Email column
    try {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('MemberDetails') 
          AND name = 'Email'
        )
        BEGIN
          ALTER TABLE MemberDetails ADD Email NVARCHAR(100) NULL
          PRINT 'Added Email column'
        END
      `);
      console.log("✅ Email column added/verified");
    } catch (err) {
      console.log("❌ Email column error:", err.message);
    }

    // Add Number (phone) column
    try {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('MemberDetails') 
          AND name = 'Number'
        )
        BEGIN
          ALTER TABLE MemberDetails ADD Number NVARCHAR(20) NULL
          PRINT 'Added Number column'
        END
      `);
      console.log("✅ Number (phone) column added/verified");
    } catch (err) {
      console.log("❌ Number column error:", err.message);
    }

    // Verify columns exist
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'MemberDetails' 
      AND COLUMN_NAME IN ('Email', 'Number')
      ORDER BY COLUMN_NAME
    `);

    console.log("\n📊 Verified columns in MemberDetails:");
    result.recordset.forEach(col => {
      console.log(`  ✅ ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });

    if (result.recordset.length === 2) {
      console.log("\n✅ All required columns exist! Profile editing is now ready.");
    } else {
      console.log("\n⚠️  Warning: Not all columns were found. Check database.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

addMissingColumns();
