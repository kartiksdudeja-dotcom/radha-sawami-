import sql from "mssql";

const config = {
  user: "sa",
  password: "Radha@123",
  server: "192.168.1.107",
  database: "RSPortal",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableKeepAlive: true,
  },
};

async function checkDatabase() {
  const pool = new sql.ConnectionPool(config);

  try {
    await pool.connect();
    console.log("✅ Connected to database");

    // Check members count
    const countResult = await pool
      .request()
      .query("SELECT COUNT(*) as cnt FROM MemberDetails");
    console.log(`📊 Total members in DB: ${countResult.recordset[0].cnt}`);

    // Get first member
    const memberResult = await pool
      .request()
      .query("SELECT TOP 1 * FROM MemberDetails ORDER BY UserID DESC");
    if (memberResult.recordset.length > 0) {
      const member = memberResult.recordset[0];
      console.log("\n✅ Sample member from database:");
      console.log(JSON.stringify(member, null, 2).substring(0, 500));
    }

    pool.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkDatabase();
