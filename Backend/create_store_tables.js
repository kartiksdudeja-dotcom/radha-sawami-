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
    trustServerCertificate: true,
    connectionTimeout: 10000
  }
};

async function createStoreTables() {
  let pool;
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        CREATING STORE TABLES IN DATABASE                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Create StoreItems table
    console.log('📦 Creating StoreItems table...\n');
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StoreItems')
      BEGIN
        CREATE TABLE StoreItems (
          ItemID INT PRIMARY KEY IDENTITY(1,1),
          ItemName NVARCHAR(255) NOT NULL,
          Description NVARCHAR(MAX),
          Category NVARCHAR(100),
          Price DECIMAL(10, 2) NOT NULL,
          Quantity INT DEFAULT 0,
          Unit NVARCHAR(50),
          SupplierID INT,
          CreatedDate DATETIME DEFAULT GETDATE(),
          UpdatedDate DATETIME DEFAULT GETDATE(),
          IsActive BIT DEFAULT 1
        );
      END
    `);
    console.log('   ✅ StoreItems table created\n');

    // Create StoreOrders table
    console.log('📦 Creating StoreOrders table...\n');
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StoreOrders')
      BEGIN
        CREATE TABLE StoreOrders (
          OrderID INT PRIMARY KEY IDENTITY(1,1),
          OrderNumber NVARCHAR(50) UNIQUE,
          MemberID INT,
          OrderDate DATETIME DEFAULT GETDATE(),
          TotalAmount DECIMAL(12, 2),
          Status NVARCHAR(50) DEFAULT 'Pending',
          Notes NVARCHAR(MAX),
          CreatedDate DATETIME DEFAULT GETDATE(),
          UpdatedDate DATETIME DEFAULT GETDATE()
        );
      END
    `);
    console.log('   ✅ StoreOrders table created\n');

    // Create StoreOrderItems table
    console.log('📦 Creating StoreOrderItems table...\n');
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StoreOrderItems')
      BEGIN
        CREATE TABLE StoreOrderItems (
          OrderItemID INT PRIMARY KEY IDENTITY(1,1),
          OrderID INT NOT NULL,
          ItemID INT NOT NULL,
          Quantity INT NOT NULL,
          UnitPrice DECIMAL(10, 2),
          TotalPrice DECIMAL(12, 2)
        );
      END
    `);
    console.log('   ✅ StoreOrderItems table created\n');

    // Create StoreSales table
    console.log('📦 Creating StoreSales table...\n');
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StoreSales')
      BEGIN
        CREATE TABLE StoreSales (
          SaleID INT PRIMARY KEY IDENTITY(1,1),
          OrderID INT,
          ItemID INT,
          MemberID INT,
          SaleDate DATETIME DEFAULT GETDATE(),
          Quantity INT,
          UnitPrice DECIMAL(10, 2),
          TotalAmount DECIMAL(12, 2),
          PaymentStatus NVARCHAR(50),
          Notes NVARCHAR(MAX),
          CreatedDate DATETIME DEFAULT GETDATE(),
          UpdatedDate DATETIME DEFAULT GETDATE()
        );
      END
    `);
    console.log('   ✅ StoreSales table created\n');

    // Create StoreSuppliers table
    console.log('📦 Creating StoreSuppliers table...\n');
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StoreSuppliers')
      BEGIN
        CREATE TABLE StoreSuppliers (
          SupplierID INT PRIMARY KEY IDENTITY(1,1),
          SupplierName NVARCHAR(255) NOT NULL,
          ContactPerson NVARCHAR(255),
          Phone NVARCHAR(20),
          Email NVARCHAR(100),
          Address NVARCHAR(MAX),
          City NVARCHAR(100),
          State NVARCHAR(100),
          PinCode NVARCHAR(10),
          CreatedDate DATETIME DEFAULT GETDATE(),
          UpdatedDate DATETIME DEFAULT GETDATE(),
          IsActive BIT DEFAULT 1
        );
      END
    `);
    console.log('   ✅ StoreSuppliers table created\n');

    // Create StoreInventory table
    console.log('📦 Creating StoreInventory table...\n');
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StoreInventory')
      BEGIN
        CREATE TABLE StoreInventory (
          InventoryID INT PRIMARY KEY IDENTITY(1,1),
          ItemID INT NOT NULL,
          QuantityIn INT DEFAULT 0,
          QuantityOut INT DEFAULT 0,
          CurrentStock INT DEFAULT 0,
          ReorderLevel INT DEFAULT 10,
          TransactionDate DATETIME DEFAULT GETDATE(),
          TransactionType NVARCHAR(50),
          Notes NVARCHAR(MAX)
        );
      END
    `);
    console.log('   ✅ StoreInventory table created\n');

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        ✅ ALL STORE TABLES CREATED SUCCESSFULLY!          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Verify tables
    console.log('📊 VERIFYING CREATED TABLES:\n');
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE 'Store%'
      ORDER BY TABLE_NAME
    `);
    
    tablesResult.recordset.forEach((row) => {
      console.log(`   ✅ ${row.TABLE_NAME}`);
    });

    await pool.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.originalError) {
      console.error('Details:', error.originalError.message);
    }
  }
}

createStoreTables();
