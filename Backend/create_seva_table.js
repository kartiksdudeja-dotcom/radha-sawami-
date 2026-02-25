import { getPool } from "./config/db.js";

async function createSevaTable() {
  try {
    const pool = await getPool();

    // Create Seva table if it doesn't exist (without foreign key for now)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Seva')
      BEGIN
        CREATE TABLE Seva (
          SevaId INT IDENTITY(1,1) PRIMARY KEY,
          UserID INT NOT NULL,
          SevaCategory NVARCHAR(100),
          SevaName NVARCHAR(100),
          Hours FLOAT DEFAULT 0,
          Cost FLOAT DEFAULT 0,
          SevaDate NVARCHAR(50),
          CreatedAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'Seva table created successfully!';
      END
      ELSE
      BEGIN
        PRINT 'Seva table already exists.';
      END
    `);

    console.log("✅ Seva table setup complete!");

    // Verify table was created
    const verify = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='Seva' 
      ORDER BY ORDINAL_POSITION
    `);

    console.log("Seva Table Schema:");
    console.log(JSON.stringify(verify.recordset, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createSevaTable();
