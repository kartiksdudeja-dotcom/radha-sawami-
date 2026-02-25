import { getPool } from './config/db.js';
import fs from 'fs';

async function check() {
  const logFile = 'results.txt';
  fs.writeFileSync(logFile, ''); // Clear file

  function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
  }

  try {
    const pool = await getPool();
    
    async function getColumns(tableName) {
      const res = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = '${tableName}'
      `);
      return res.recordset.map(c => `${c.COLUMN_NAME} (${c.DATA_TYPE})`).join(', ');
    }

    log("--- Schema Check ---");
    log(`'Seva' columns: ${await getColumns('Seva')}`);
    log(`'SevaMemberInfo' columns: ${await getColumns('SevaMemberInfo')}`);

    log("\n--- 'Seva' table check ---");
    const s1 = await pool.request().query("SELECT s.*, m.Name FROM Seva s JOIN MemberDetails m ON s.UserID = m.UserID WHERE m.Name LIKE '%Ratnanjali%'");
    log(`Ratnanjali records in 'Seva': ${s1.recordset.length}`);
    s1.recordset.forEach(r => log(JSON.stringify(r)));

    log("\n--- 'SevaMemberInfo' table check ---");
    const s2 = await pool.request().query("SELECT TOP 10 s.*, m.Name FROM SevaMemberInfo s JOIN MemberDetails m ON s.UserID = m.UserID WHERE m.Name LIKE '%Ratnanjali%'");
    log(`Ratnanjali records in 'SevaMemberInfo': ${s2.recordset.length} (sample)`);
    s2.recordset.forEach(r => log(JSON.stringify(r)));

    log("\n--- Checking Table Type ---");
    const tableType = await pool.request().query("SELECT TABLE_TYPE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Seva'");
    log(`'Seva' is a: ${tableType.recordset[0]?.TABLE_TYPE || 'Unknown'}`);

    if (tableType.recordset[0]?.TABLE_TYPE === 'VIEW') {
        const viewDef = await pool.request().query("SELECT VIEW_DEFINITION FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'Seva'");
        log(`View Definition: ${viewDef.recordset[0]?.VIEW_DEFINITION}`);
    }

    process.exit(0);
  } catch (error) {
    log("Error: " + error.message);
    process.exit(1);
  }
}

check();
