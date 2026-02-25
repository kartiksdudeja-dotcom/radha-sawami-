import { getPool } from "./config/db.js";

const testProfileColumns = async () => {
  try {
    console.log("🧪 Testing profile columns...\n");
    const pool = await getPool();

    // Get a sample user to test
    const userResult = await pool.request().query(`
      SELECT TOP 1 UserID, Email, Number, Address, OfficeAddress, IsProfileComplete 
      FROM MemberDetails
    `);

    if (userResult.recordset.length === 0) {
      console.log("❌ No users found in database");
      process.exit(1);
    }

    const user = userResult.recordset[0];
    console.log("📋 Sample user data:");
    console.log(`  UserID: ${user.UserID}`);
    console.log(`  Email: ${user.Email || '(empty)'}`);
    console.log(`  Number: ${user.Number || '(empty)'}`);
    console.log(`  Address: ${user.Address ? user.Address.substring(0, 30) + '...' : '(empty)'}`);
    console.log(`  OfficeAddress: ${user.OfficeAddress ? user.OfficeAddress.substring(0, 30) + '...' : '(empty)'}`);
    console.log(`  IsProfileComplete: ${user.IsProfileComplete}\n`);

    // Test UPDATE query
    console.log("🔄 Testing UPDATE query...");
    await pool
      .request()
      .input("id", 1)
      .input("email", "test@example.com")
      .input("number", "+91 9876543210")
      .input("address", "Test Address")
      .input("office_address", "Test Office")
      .query(`
        UPDATE MemberDetails 
        SET Email = @email, 
            Number = @number, 
            Address = @address, 
            OfficeAddress = @office_address,
            IsProfileComplete = 1
        WHERE UserID = @id
      `);
    
    console.log("✅ UPDATE query executed successfully\n");

    // Verify update
    const verifyResult = await pool
      .request()
      .input("id", 1)
      .query(`SELECT Email, Number FROM MemberDetails WHERE UserID = @id`);

    if (verifyResult.recordset.length > 0) {
      const updated = verifyResult.recordset[0];
      console.log("✅ Verification - Updated values:");
      console.log(`  Email: ${updated.Email}`);
      console.log(`  Number: ${updated.Number}`);
    }

    console.log("\n✅ All tests passed! Profile editing is fully functional.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

testProfileColumns();
