const sql = require("mssql");

const config = {
  server: "KARTIKDUDEJA\\SQLEXPRESS",
  database: "RSPortal",
  authentication: {
    type: "default",
    options: {
      userName: "",
      password: "",
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function checkSevaData() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✅ Connected to database\n");

    // Get min and max dates
    const rangeResult = await pool.request().query(`
      SELECT 
        MIN([Date]) as MinDate, 
        MAX([Date]) as MaxDate, 
        COUNT(*) as TotalRecords 
      FROM [SevaMemberInfo]
    `);

    console.log("📊 Seva Data Summary:");
    console.log("Min Date:", rangeResult.recordset[0].MinDate);
    console.log("Max Date:", rangeResult.recordset[0].MaxDate);
    console.log("Total Records:", rangeResult.recordset[0].TotalRecords, "\n");

    // Get distinct dates with counts
    console.log("📅 Dates with records (Top 10):");
    const datesResult = await pool.request().query(`
      SELECT TOP 10 [Date], COUNT(*) as cnt 
      FROM [SevaMemberInfo] 
      GROUP BY [Date] 
      ORDER BY [Date] DESC
    `);

    datesResult.recordset.forEach((row) => {
      console.log(`  ${row.Date}: ${row.cnt} records`);
    });

    // Test with the most recent date
    if (datesResult.recordset.length > 0) {
      const testDate = datesResult.recordset[0].Date;
      console.log(`\n🔍 Testing data display for: ${testDate}`);
      
      const sampleResult = await pool.request().query(`
        SELECT TOP 5
          s.[Sr_No] as 'Sr.No',
          m.[Name] as 'Member Name',
          m.[Status] as 'Status',
          m.[DOB] as 'DOB',
          m.[Gender] as 'Gender',
          m.[Association_member] as 'Association',
          s.[Date] as 'Seva Date',
          s.[Cumm_Hrs] as 'Hours',
          s.[Cumm_Amt] as 'Amount'
        FROM [SevaMemberInfo] s
        LEFT JOIN [MemberDetails] m ON s.[UserID] = m.[UserID]
        WHERE s.[Date] = '${testDate}'
        ORDER BY s.[Date] DESC, s.[Sr_No] DESC
      `);

      console.log(`\n✅ Sample ${sampleResult.recordset.length} records:\n`);
      console.log("Sr.No | Member Name | Status | DOB | Gender | Association | Seva Date | Hours | Amount");
      console.log("------|-------------|--------|-----|--------|-------------|-----------|-------|--------");
      
      sampleResult.recordset.forEach((record) => {
        console.log(
          `${String(record['Sr.No']).padEnd(5)}| ` +
          `${String(record['Member Name'] || '-').substring(0, 11).padEnd(11)} | ` +
          `${String(record['Status'] || '-').substring(0, 6).padEnd(6)} | ` +
          `${String(record['DOB'] || '-').substring(0, 4).padEnd(4)} | ` +
          `${String(record['Gender'] || '-').substring(0, 6).padEnd(6)} | ` +
          `${String(record['Association'] || '-').substring(0, 11).padEnd(11)} | ` +
          `${String(record['Seva Date'] || '-').substring(0, 9).padEnd(9)} | ` +
          `${String(record['Hours'] || 0).padEnd(5)} | ` +
          `${String(record['Amount'] || 0)}`
        );
      });
    }

    await pool.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkSevaData();
