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
    
    console.log('\n📋 AVAILABLE TABLES IN DATABASE:\n');
    const tables = await pool.request().query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME`
    );
    
    tables.recordset.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.TABLE_NAME}`);
    });
    
    await pool.close();
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
