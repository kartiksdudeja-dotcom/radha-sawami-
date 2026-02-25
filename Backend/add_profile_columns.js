// Script to add new profile columns for profile completion feature
import { getPool } from "./config/db.js";

const addProfileColumns = async () => {
  try {
    console.log("🔄 Adding new profile columns...");
    const pool = await getPool();

    // Add Address column
    try {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('MemberDetails') 
          AND name = 'Address'
        )
        BEGIN
          ALTER TABLE MemberDetails ADD Address NVARCHAR(500) NULL
          PRINT 'Added Address column'
        END
      `);
      console.log("✅ Address column checked/added");
    } catch (err) {
      console.log("Address column:", err.message);
    }

    // Add OfficeAddress column
    try {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('MemberDetails') 
          AND name = 'OfficeAddress'
        )
        BEGIN
          ALTER TABLE MemberDetails ADD OfficeAddress NVARCHAR(500) NULL
          PRINT 'Added OfficeAddress column'
        END
      `);
      console.log("✅ OfficeAddress column checked/added");
    } catch (err) {
      console.log("OfficeAddress column:", err.message);
    }

    // Add IsProfileComplete column (default 0 = not complete)
    try {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('MemberDetails') 
          AND name = 'IsProfileComplete'
        )
        BEGIN
          ALTER TABLE MemberDetails ADD IsProfileComplete BIT DEFAULT 0
          PRINT 'Added IsProfileComplete column'
        END
      `);
      console.log("✅ IsProfileComplete column checked/added");
    } catch (err) {
      console.log("IsProfileComplete column:", err.message);
    }

    // Verify columns exist
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'MemberDetails' 
      AND COLUMN_NAME IN ('Address', 'OfficeAddress', 'IsProfileComplete', 'Email', 'Number', 'ProfilePhoto')
    `);

    console.log("\n📊 Profile columns in MemberDetails:");
    result.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });

    console.log("\n✅ Profile columns setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding profile columns:", error);
    process.exit(1);
  }
};

addProfileColumns();
