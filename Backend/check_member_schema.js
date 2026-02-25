import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER || 'KARTIKDUDEJA\\SQLEXPRESS',
  database: process.env.DB_NAME || 'RSPortal',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'SaStrong@123'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkSchema() {
  let pool;
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('\n📋 MemberDetails Table Structure:\n');
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'MemberDetails'
      ORDER BY ORDINAL_POSITION
    `);
    
    columnsResult.recordset.forEach((col) => {
      console.log(`   • ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
