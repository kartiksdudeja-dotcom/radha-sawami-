import { getPool } from "./config/db.js";
import sql from "mssql";

async function setupCategoryTables() {
  try {
    const pool = await getPool();

    // Create StoreCategories table
    console.log("📋 Creating StoreCategories table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreCategories' AND xtype='U')
      CREATE TABLE StoreCategories (
        CategoryID INT PRIMARY KEY IDENTITY(1,1),
        CategoryName NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(MAX),
        CategoryIcon NVARCHAR(10),
        IsActive BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT GETDATE(),
        UpdatedDate DATETIME DEFAULT GETDATE()
      )
    `);
    console.log("✅ StoreCategories table ready");

    // Create StoreCategoryItems table (junction table)
    console.log("📋 Creating StoreCategoryItems table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreCategoryItems' AND xtype='U')
      CREATE TABLE StoreCategoryItems (
        CategoryItemID INT PRIMARY KEY IDENTITY(1,1),
        CategoryID INT NOT NULL FOREIGN KEY REFERENCES StoreCategories(CategoryID) ON DELETE CASCADE,
        ItemID INT NOT NULL,
        SortOrder INT DEFAULT 0,
        CreatedDate DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_CategoryItem UNIQUE (CategoryID, ItemID)
      )
    `);
    console.log("✅ StoreCategoryItems table ready");

    // Create StoreCategoryMappings table (for AI suggestions)
    console.log("📋 Creating StoreCategoryMappings table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreCategoryMappings' AND xtype='U')
      CREATE TABLE StoreCategoryMappings (
        MappingID INT PRIMARY KEY IDENTITY(1,1),
        ItemID INT NOT NULL,
        SuggestedCategories NVARCHAR(MAX),
        ConfidenceScore FLOAT,
        IsAutoDetected BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT GETDATE()
      )
    `);
    console.log("✅ StoreCategoryMappings table ready");

    console.log("✨ All category tables created successfully!");

  } catch (error) {
    console.error("❌ Error setting up category tables:", error.message);
    throw error;
  }
}

// Run setup
setupCategoryTables().then(() => {
  console.log("✅ Database setup complete");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Setup failed:", error);
  process.exit(1);
});
