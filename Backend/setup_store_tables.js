// Setup Store Tables for SQL Server
import { getPool } from "./db.js";

async function setupStoreTables() {
  console.log("🏪 Setting up Store tables...\n");

  try {
    const pool = await getPool();

    // 1. Create StoreCategories Table
    console.log("📦 Creating StoreCategories table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreCategories' AND xtype='U')
      CREATE TABLE StoreCategories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        categoryName NVARCHAR(100) NOT NULL,
        categoryImage NVARCHAR(500) DEFAULT '',
        categoryDescription NVARCHAR(500) DEFAULT '',
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);
    console.log("✅ StoreCategories table ready");

    // 2. Create StoreSubCategories Table
    console.log("📦 Creating StoreSubCategories table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreSubCategories' AND xtype='U')
      CREATE TABLE StoreSubCategories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        categoryId INT NOT NULL,
        subCategoryName NVARCHAR(100) NOT NULL,
        subCategoryImage NVARCHAR(500) DEFAULT '',
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (categoryId) REFERENCES StoreCategories(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ StoreSubCategories table ready");

    // 3. Create StoreProducts Table
    console.log("📦 Creating StoreProducts table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreProducts' AND xtype='U')
      CREATE TABLE StoreProducts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        categoryId INT NOT NULL,
        subCategoryId INT NULL,
        productName NVARCHAR(200) NOT NULL,
        productDescription NVARCHAR(1000) DEFAULT '',
        productImage NVARCHAR(500) DEFAULT '',
        price DECIMAL(10,2) NOT NULL,
        originalPrice DECIMAL(10,2) DEFAULT 0,
        discount INT DEFAULT 0,
        stock INT DEFAULT 0,
        sku NVARCHAR(50) DEFAULT '',
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (categoryId) REFERENCES StoreCategories(id),
        FOREIGN KEY (subCategoryId) REFERENCES StoreSubCategories(id)
      )
    `);
    console.log("✅ StoreProducts table ready");

    // 4. Create StoreCart Table
    console.log("📦 Creating StoreCart table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreCart' AND xtype='U')
      CREATE TABLE StoreCart (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        productId INT NOT NULL,
        quantity INT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (productId) REFERENCES StoreProducts(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ StoreCart table ready");

    // 5. Create StoreOrders Table
    console.log("📦 Creating StoreOrders table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreOrders' AND xtype='U')
      CREATE TABLE StoreOrders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        userId INT NOT NULL,
        orderNumber NVARCHAR(50) NOT NULL UNIQUE,
        totalAmount DECIMAL(10,2) NOT NULL,
        deliveryAddress NVARCHAR(500) NOT NULL,
        deliveryPhone NVARCHAR(20) NOT NULL,
        specialInstructions NVARCHAR(500) DEFAULT '',
        orderStatus NVARCHAR(50) DEFAULT 'Placed',
        paymentMethod NVARCHAR(50) DEFAULT 'COD',
        paymentStatus NVARCHAR(50) DEFAULT 'Pending',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);
    console.log("✅ StoreOrders table ready");

    // 6. Create StoreOrderItems Table
    console.log("📦 Creating StoreOrderItems table...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='StoreOrderItems' AND xtype='U')
      CREATE TABLE StoreOrderItems (
        id INT IDENTITY(1,1) PRIMARY KEY,
        orderId INT NOT NULL,
        productId INT NOT NULL,
        productName NVARCHAR(200) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (orderId) REFERENCES StoreOrders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES StoreProducts(id)
      )
    `);
    console.log("✅ StoreOrderItems table ready");

    // Add sample data
    console.log("\n🎨 Adding sample categories...");

    // Check if categories already exist
    const existingCategories = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM StoreCategories");

    if (existingCategories.recordset[0].count === 0) {
      // Insert sample categories
      await pool.request().query(`
        INSERT INTO StoreCategories (categoryName, categoryImage, categoryDescription, isActive)
        VALUES 
          ('Puja Items', '🕉️', 'Essential items for daily puja and worship', 1),
          ('Books & Literature', '📚', 'Spiritual books and religious literature', 1),
          ('Incense & Fragrances', '🪔', 'Agarbatti, dhoop, and other fragrances', 1),
          ('Clothing', '👕', 'Spiritual and traditional clothing items', 1),
          ('Prasad & Food Items', '🍎', 'Prasad materials and food offerings', 1),
          ('Decorations', '🪷', 'Decorative items for mandir and home', 1)
      `);
      console.log("✅ Sample categories added");

      // Get category IDs
      const categories = await pool
        .request()
        .query("SELECT id, categoryName FROM StoreCategories");
      const categoryMap = {};
      categories.recordset.forEach((cat) => {
        categoryMap[cat.categoryName] = cat.id;
      });

      // Insert sample subcategories
      console.log("🎨 Adding sample subcategories...");
      await pool.request().query(`
        INSERT INTO StoreSubCategories (categoryId, subCategoryName, isActive)
        VALUES 
          (${categoryMap["Puja Items"]}, 'Diyas & Lamps', 1),
          (${categoryMap["Puja Items"]}, 'Puja Thali Sets', 1),
          (${categoryMap["Puja Items"]}, 'Bell & Shankh', 1),
          (${categoryMap["Books & Literature"]}, 'Religious Books', 1),
          (${categoryMap["Books & Literature"]}, 'Prayer Books', 1),
          (${categoryMap["Incense & Fragrances"]}, 'Agarbatti', 1),
          (${categoryMap["Incense & Fragrances"]}, 'Dhoop', 1),
          (${categoryMap["Clothing"]}, 'Traditional Wear', 1),
          (${categoryMap["Prasad & Food Items"]}, 'Dry Fruits', 1),
          (${categoryMap["Prasad & Food Items"]}, 'Sweets', 1),
          (${categoryMap["Decorations"]}, 'Flowers & Garlands', 1),
          (${categoryMap["Decorations"]}, 'Rangoli', 1)
      `);
      console.log("✅ Sample subcategories added");

      // Get subcategory IDs
      const subcategories = await pool
        .request()
        .query(
          "SELECT id, categoryId, subCategoryName FROM StoreSubCategories"
        );
      const subCatMap = {};
      subcategories.recordset.forEach((sub) => {
        subCatMap[sub.subCategoryName] = {
          id: sub.id,
          categoryId: sub.categoryId,
        };
      });

      // Insert sample products
      console.log("🎨 Adding sample products...");
      await pool.request().query(`
        INSERT INTO StoreProducts (categoryId, subCategoryId, productName, productDescription, productImage, price, originalPrice, discount, stock, isActive)
        VALUES 
          (${subCatMap["Diyas & Lamps"].categoryId}, ${subCatMap["Diyas & Lamps"].id}, 'Brass Diya Set (5 pcs)', 'Beautiful brass diyas for daily puja', '🪔', 299, 399, 25, 50, 1),
          (${subCatMap["Diyas & Lamps"].categoryId}, ${subCatMap["Diyas & Lamps"].id}, 'Electric LED Diya', 'Modern LED diya with auto timer', '💡', 199, 249, 20, 100, 1),
          (${subCatMap["Puja Thali Sets"].categoryId}, ${subCatMap["Puja Thali Sets"].id}, 'Complete Puja Thali Set', 'Silver coated complete puja thali with all accessories', '🍽️', 899, 1199, 25, 30, 1),
          (${subCatMap["Bell & Shankh"].categoryId}, ${subCatMap["Bell & Shankh"].id}, 'Brass Puja Bell', 'Traditional brass bell with wooden handle', '🔔', 249, 349, 29, 75, 1),
          (${subCatMap["Agarbatti"].categoryId}, ${subCatMap["Agarbatti"].id}, 'Premium Agarbatti Pack (100 sticks)', 'Mixed fragrance premium incense sticks', '🌸', 149, 199, 25, 200, 1),
          (${subCatMap["Agarbatti"].categoryId}, ${subCatMap["Agarbatti"].id}, 'Sandalwood Agarbatti', 'Pure sandalwood fragrance', '🪻', 199, 249, 20, 150, 1),
          (${subCatMap["Dhoop"].categoryId}, ${subCatMap["Dhoop"].id}, 'Guggal Dhoop Cones', 'Natural guggal dhoop cones pack', '🔥', 99, 149, 34, 300, 1),
          (${subCatMap["Religious Books"].categoryId}, ${subCatMap["Religious Books"].id}, 'Bhagavad Gita (Hindi)', 'Complete Bhagavad Gita with Hindi translation', '📖', 299, 399, 25, 50, 1),
          (${subCatMap["Prayer Books"].categoryId}, ${subCatMap["Prayer Books"].id}, 'Daily Prayer Book', 'Collection of daily prayers and mantras', '📕', 149, 199, 25, 80, 1),
          (${subCatMap["Dry Fruits"].categoryId}, ${subCatMap["Dry Fruits"].id}, 'Premium Dry Fruits Mix (500g)', 'Assorted dry fruits for prasad', '🥜', 599, 749, 20, 40, 1),
          (${subCatMap["Flowers & Garlands"].categoryId}, ${subCatMap["Flowers & Garlands"].id}, 'Artificial Marigold Garland', 'Long lasting artificial garland', '🌼', 199, 249, 20, 100, 1),
          (${subCatMap["Rangoli"].categoryId}, ${subCatMap["Rangoli"].id}, 'Rangoli Color Powder Set', '10 vibrant colors for rangoli', '🎨', 149, 199, 25, 150, 1)
      `);
      console.log("✅ Sample products added");
    } else {
      console.log("ℹ️ Categories already exist, skipping sample data");
    }

    console.log("\n✅✅✅ All Store tables created successfully! ✅✅✅\n");

    // Show summary
    const catCount = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM StoreCategories");
    const subCatCount = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM StoreSubCategories");
    const prodCount = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM StoreProducts");

    console.log("📊 Database Summary:");
    console.log(`   Categories: ${catCount.recordset[0].count}`);
    console.log(`   Sub-Categories: ${subCatCount.recordset[0].count}`);
    console.log(`   Products: ${prodCount.recordset[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up Store tables:", error);
    process.exit(1);
  }
}

setupStoreTables();
