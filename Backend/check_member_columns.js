import { getPool } from "./config/db.js";

const checkColumns = async () => {
  try {
    const pool = await getPool();
    
    console.log("📊 Checking MemberDetails table schema...\n");
    
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'MemberDetails'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log("✅ MemberDetails Columns:");
    result.recordset.forEach((col, idx) => {
      const nullable = col.IS_NULLABLE === 'YES' ? '(nullable)' : '(required)';
      console.log(`  ${idx + 1}. ${col.COLUMN_NAME} - ${col.DATA_TYPE} ${nullable}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkColumns();
