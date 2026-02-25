import { getPool } from "../config/db.js";

import sql from "mssql";

// ==================== CATEGORIES ====================

// Get all categories
export async function getAllCategories(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM StoreCategories 
      WHERE isActive = 1 
      ORDER BY categoryName
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get category by ID
export async function getCategoryById(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM StoreCategories WHERE id = @id");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create category
export async function createCategory(req, res) {
  try {
    const {
      categoryName,
      categoryImage,
      categoryDescription,
      isActive = true,
    } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("categoryName", sql.NVarChar(100), categoryName)
      .input("categoryImage", sql.NVarChar(500), categoryImage || "")
      .input(
        "categoryDescription",
        sql.NVarChar(500),
        categoryDescription || ""
      )
      .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
        INSERT INTO StoreCategories (categoryName, categoryImage, categoryDescription, isActive, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@categoryName, @categoryImage, @categoryDescription, @isActive, GETDATE(), GETDATE())
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update category
export async function updateCategory(req, res) {
  try {
    const { categoryName, categoryImage, categoryDescription, isActive } =
      req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("categoryName", sql.NVarChar(100), categoryName)
      .input("categoryImage", sql.NVarChar(500), categoryImage || "")
      .input(
        "categoryDescription",
        sql.NVarChar(500),
        categoryDescription || ""
      )
      .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
        UPDATE StoreCategories 
        SET categoryName = @categoryName, 
            categoryImage = @categoryImage, 
            categoryDescription = @categoryDescription, 
            isActive = @isActive,
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete category
export async function deleteCategory(req, res) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM StoreCategories WHERE id = @id");

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== SUB-CATEGORIES ====================

// Get all subcategories
export async function getAllSubCategories(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT sc.*, c.categoryName 
      FROM StoreSubCategories sc
      LEFT JOIN StoreCategories c ON sc.categoryId = c.id
      WHERE sc.isActive = 1
      ORDER BY sc.subCategoryName
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get subcategories by category
export async function getSubCategoriesByCategory(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("categoryId", sql.Int, req.params.categoryId).query(`
        SELECT * FROM StoreSubCategories 
        WHERE categoryId = @categoryId AND isActive = 1
        ORDER BY subCategoryName
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create subcategory
export async function createSubCategory(req, res) {
  try {
    const {
      categoryId,
      subCategoryName,
      subCategoryImage,
      isActive = true,
    } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("categoryId", sql.Int, categoryId)
      .input("subCategoryName", sql.NVarChar(100), subCategoryName)
      .input("subCategoryImage", sql.NVarChar(500), subCategoryImage || "")
      .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
        INSERT INTO StoreSubCategories (categoryId, subCategoryName, subCategoryImage, isActive, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@categoryId, @subCategoryName, @subCategoryImage, @isActive, GETDATE(), GETDATE())
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update subcategory
export async function updateSubCategory(req, res) {
  try {
    const { categoryId, subCategoryName, subCategoryImage, isActive } =
      req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("categoryId", sql.Int, categoryId)
      .input("subCategoryName", sql.NVarChar(100), subCategoryName)
      .input("subCategoryImage", sql.NVarChar(500), subCategoryImage || "")
      .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
        UPDATE StoreSubCategories 
        SET categoryId = @categoryId,
            subCategoryName = @subCategoryName, 
            subCategoryImage = @subCategoryImage, 
            isActive = @isActive,
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "SubCategory not found" });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete subcategory
export async function deleteSubCategory(req, res) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM StoreSubCategories WHERE id = @id");

    res.json({ success: true, message: "SubCategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== PRODUCTS ====================

// Get all products
export async function getAllProducts(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT p.*, sc.subCategoryName, c.categoryName 
      FROM StoreProducts p
      LEFT JOIN StoreSubCategories sc ON p.subCategoryId = sc.id
      LEFT JOIN StoreCategories c ON p.categoryId = c.id
      WHERE p.isActive = 1
      ORDER BY p.productName
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get product by ID
export async function getProductById(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().input("id", sql.Int, req.params.id)
      .query(`
        SELECT p.*, sc.subCategoryName, c.categoryName 
        FROM StoreProducts p
        LEFT JOIN StoreSubCategories sc ON p.subCategoryId = sc.id
        LEFT JOIN StoreCategories c ON p.categoryId = c.id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get products by subcategory
export async function getProductsBySubCategory(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("subCategoryId", sql.Int, req.params.subCategoryId).query(`
        SELECT * FROM StoreProducts 
        WHERE subCategoryId = @subCategoryId AND isActive = 1
        ORDER BY productName
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get products by category
export async function getProductsByCategory(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("categoryId", sql.Int, req.params.categoryId).query(`
        SELECT * FROM StoreProducts 
        WHERE categoryId = @categoryId AND isActive = 1
        ORDER BY productName
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Search products
export async function searchProducts(req, res) {
  try {
    const { q } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("search", sql.NVarChar(100), `%${q}%`).query(`
        SELECT p.*, sc.subCategoryName, c.categoryName 
        FROM StoreProducts p
        LEFT JOIN StoreSubCategories sc ON p.subCategoryId = sc.id
        LEFT JOIN StoreCategories c ON p.categoryId = c.id
        WHERE p.isActive = 1 AND (p.productName LIKE @search OR p.productDescription LIKE @search)
        ORDER BY p.productName
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create product
export async function createProduct(req, res) {
  try {
    const {
      categoryId,
      subCategoryId,
      productName,
      productDescription,
      productImage,
      price,
      originalPrice,
      stock,
      sku,
      isActive = true,
    } = req.body;
    const pool = await getPool();

    const discount =
      originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const result = await pool
      .request()
      .input("categoryId", sql.Int, categoryId)
      .input("subCategoryId", sql.Int, subCategoryId)
      .input("productName", sql.NVarChar(200), productName)
      .input("productDescription", sql.NVarChar(1000), productDescription || "")
      .input("productImage", sql.NVarChar(500), productImage || "")
      .input("price", sql.Decimal(10, 2), price)
      .input("originalPrice", sql.Decimal(10, 2), originalPrice || price)
      .input("discount", sql.Int, discount)
      .input("stock", sql.Int, stock || 0)
      .input("sku", sql.NVarChar(50), sku || "")
      .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
        INSERT INTO StoreProducts (categoryId, subCategoryId, productName, productDescription, productImage, price, originalPrice, discount, stock, sku, isActive, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@categoryId, @subCategoryId, @productName, @productDescription, @productImage, @price, @originalPrice, @discount, @stock, @sku, @isActive, GETDATE(), GETDATE())
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update product
export async function updateProduct(req, res) {
  try {
    const {
      categoryId,
      subCategoryId,
      productName,
      productDescription,
      productImage,
      price,
      originalPrice,
      stock,
      sku,
      isActive,
    } = req.body;
    const pool = await getPool();

    const discount =
      originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("categoryId", sql.Int, categoryId)
      .input("subCategoryId", sql.Int, subCategoryId)
      .input("productName", sql.NVarChar(200), productName)
      .input("productDescription", sql.NVarChar(1000), productDescription || "")
      .input("productImage", sql.NVarChar(500), productImage || "")
      .input("price", sql.Decimal(10, 2), price)
      .input("originalPrice", sql.Decimal(10, 2), originalPrice || price)
      .input("discount", sql.Int, discount)
      .input("stock", sql.Int, stock || 0)
      .input("sku", sql.NVarChar(50), sku || "")
      .input("isActive", sql.Bit, isActive ? 1 : 0).query(`
        UPDATE StoreProducts 
        SET categoryId = @categoryId,
            subCategoryId = @subCategoryId,
            productName = @productName, 
            productDescription = @productDescription,
            productImage = @productImage,
            price = @price,
            originalPrice = @originalPrice,
            discount = @discount,
            stock = @stock,
            sku = @sku,
            isActive = @isActive,
            updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete product
export async function deleteProduct(req, res) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM StoreProducts WHERE id = @id");

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update product stock
export async function updateProductStock(req, res) {
  try {
    const { stock } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("stock", sql.Int, stock).query(`
        UPDATE StoreProducts SET stock = @stock, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Toggle product status
export async function toggleProductStatus(req, res) {
  try {
    const pool = await getPool();

    const result = await pool.request().input("id", sql.Int, req.params.id)
      .query(`
        UPDATE StoreProducts 
        SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error toggling product status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== CART ====================

// Get cart for user
export async function getCart(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId).query(`
        SELECT c.*, p.productName, p.productImage, p.price, p.stock
        FROM StoreCart c
        LEFT JOIN StoreProducts p ON c.productId = p.id
        WHERE c.userId = @userId
        ORDER BY c.createdAt DESC
      `);

    const items = result.recordset;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({ success: true, data: { items, totalItems, totalPrice } });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Add to cart
export async function addToCart(req, res) {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    const pool = await getPool();

    // Check if product exists and has stock
    const productCheck = await pool
      .request()
      .input("productId", sql.Int, productId)
      .query(
        "SELECT stock FROM StoreProducts WHERE id = @productId AND isActive = 1"
      );

    if (productCheck.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    if (productCheck.recordset[0].stock < quantity) {
      return res
        .status(400)
        .json({ success: false, error: "Not enough stock" });
    }

    // Check if item already in cart
    const existing = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("productId", sql.Int, productId)
      .query(
        "SELECT * FROM StoreCart WHERE userId = @userId AND productId = @productId"
      );

    let result;
    if (existing.recordset.length > 0) {
      // Update quantity
      result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, existing.recordset[0].quantity + quantity)
        .query(`
          UPDATE StoreCart SET quantity = @quantity, updatedAt = GETDATE()
          OUTPUT INSERTED.*
          WHERE userId = @userId AND productId = @productId
        `);
    } else {
      // Insert new item
      result = await pool
        .request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity).query(`
          INSERT INTO StoreCart (userId, productId, quantity, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@userId, @productId, @quantity, GETDATE(), GETDATE())
        `);
    }

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update cart item
export async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.cartItemId)
      .input("quantity", sql.Int, quantity).query(`
        UPDATE StoreCart SET quantity = @quantity, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Remove from cart
export async function removeFromCart(req, res) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("id", sql.Int, req.params.cartItemId)
      .query("DELETE FROM StoreCart WHERE id = @id");

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Clear cart
export async function clearCart(req, res) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("userId", sql.Int, req.params.userId)
      .query("DELETE FROM StoreCart WHERE userId = @userId");

    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== ORDERS ====================

// Generate order number
function generateOrderNumber() {
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, "0")}${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${date.getFullYear()}`;
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${random}-${dateStr}`;
}

// Create order
export async function createOrder(req, res) {
  try {
    const { userId, deliveryAddress, deliveryPhone, specialInstructions } =
      req.body;
    const pool = await getPool();

    // Get cart items
    const cartResult = await pool.request().input("userId", sql.Int, userId)
      .query(`
        SELECT c.*, p.productName, p.price, p.stock
        FROM StoreCart c
        LEFT JOIN StoreProducts p ON c.productId = p.id
        WHERE c.userId = @userId
      `);

    const cartItems = cartResult.recordset;

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Not enough stock for ${item.productName}`,
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderNumber = generateOrderNumber();

    // Create order
    const orderResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("orderNumber", sql.NVarChar(50), orderNumber)
      .input("totalAmount", sql.Decimal(10, 2), totalAmount)
      .input("deliveryAddress", sql.NVarChar(500), deliveryAddress)
      .input("deliveryPhone", sql.NVarChar(20), deliveryPhone)
      .input(
        "specialInstructions",
        sql.NVarChar(500),
        specialInstructions || ""
      ).query(`
        INSERT INTO StoreOrders (userId, orderNumber, totalAmount, deliveryAddress, deliveryPhone, specialInstructions, orderStatus, paymentMethod, paymentStatus, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@userId, @orderNumber, @totalAmount, @deliveryAddress, @deliveryPhone, @specialInstructions, 'Placed', 'COD', 'Pending', GETDATE(), GETDATE())
      `);

    const orderId = orderResult.recordset[0].id;

    // Create order items and reduce stock
    for (const item of cartItems) {
      await pool
        .request()
        .input("orderId", sql.Int, orderId)
        .input("productId", sql.Int, item.productId)
        .input("productName", sql.NVarChar(200), item.productName)
        .input("quantity", sql.Int, item.quantity)
        .input("price", sql.Decimal(10, 2), item.price)
        .input("subtotal", sql.Decimal(10, 2), item.price * item.quantity)
        .query(`
          INSERT INTO StoreOrderItems (orderId, productId, productName, quantity, price, subtotal)
          VALUES (@orderId, @productId, @productName, @quantity, @price, @subtotal)
        `);

      // Reduce stock automatically
      await pool
        .request()
        .input("productId", sql.Int, item.productId)
        .input("quantity", sql.Int, item.quantity).query(`
          UPDATE StoreProducts SET stock = stock - @quantity, updatedAt = GETDATE()
          WHERE id = @productId
        `);
    }

    // Clear cart
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM StoreCart WHERE userId = @userId");

    res.status(201).json({
      success: true,
      data: orderResult.recordset[0],
      message: `Order ${orderNumber} placed successfully!`,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get order by ID
export async function getOrderById(req, res) {
  try {
    const pool = await getPool();

    // Get order
    const orderResult = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM StoreOrders WHERE id = @id");

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Get order items
    const itemsResult = await pool
      .request()
      .input("orderId", sql.Int, req.params.id)
      .query("SELECT * FROM StoreOrderItems WHERE orderId = @orderId");

    res.json({
      success: true,
      data: {
        ...orderResult.recordset[0],
        items: itemsResult.recordset,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get user orders
export async function getUserOrders(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId).query(`
        SELECT * FROM StoreOrders 
        WHERE userId = @userId 
        ORDER BY createdAt DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get all orders (Admin)
export async function getAllOrders(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT o.*, m.name as customerName 
      FROM StoreOrders o
      LEFT JOIN Members m ON o.userId = m.id
      ORDER BY o.createdAt DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update order status
export async function updateOrderStatus(req, res) {
  try {
    const { orderStatus } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("orderStatus", sql.NVarChar(50), orderStatus).query(`
        UPDATE StoreOrders SET orderStatus = @orderStatus, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update payment status
export async function updatePaymentStatus(req, res) {
  try {
    const { paymentStatus } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("paymentStatus", sql.NVarChar(50), paymentStatus).query(`
        UPDATE StoreOrders SET paymentStatus = @paymentStatus, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== DASHBOARD STATS ====================

export async function getStoreStats(req, res) {
  try {
    const pool = await getPool();

    // Total orders
    const ordersResult = await pool
      .request()
      .query("SELECT COUNT(*) as total FROM StoreOrders");

    // Total revenue
    const revenueResult = await pool
      .request()
      .query(
        "SELECT ISNULL(SUM(totalAmount), 0) as total FROM StoreOrders WHERE paymentStatus = 'Paid'"
      );

    // Pending orders
    const pendingResult = await pool
      .request()
      .query(
        "SELECT COUNT(*) as total FROM StoreOrders WHERE orderStatus NOT IN ('Delivered', 'Cancelled')"
      );

    // Low stock products
    const lowStockResult = await pool
      .request()
      .query(
        "SELECT COUNT(*) as total FROM StoreProducts WHERE stock <= 10 AND isActive = 1"
      );

    // Total products
    const productsResult = await pool
      .request()
      .query("SELECT COUNT(*) as total FROM StoreProducts WHERE isActive = 1");

    // Total categories
    const categoriesResult = await pool
      .request()
      .query(
        "SELECT COUNT(*) as total FROM StoreCategories WHERE isActive = 1"
      );

    res.json({
      success: true,
      data: {
        totalOrders: ordersResult.recordset[0].total,
        totalRevenue: revenueResult.recordset[0].total,
        pendingOrders: pendingResult.recordset[0].total,
        lowStockProducts: lowStockResult.recordset[0].total,
        totalProducts: productsResult.recordset[0].total,
        totalCategories: categoriesResult.recordset[0].total,
      },
    });
  } catch (error) {
    console.error("Error fetching store stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
