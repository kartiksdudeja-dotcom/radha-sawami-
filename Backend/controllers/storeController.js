import { getPool } from "../config/db.js";
import sql from "mssql";

// ==================== STORE ITEMS ====================

// Get all store items
export async function getAllItems(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM StoreItems 
      WHERE IsActive = 1 
      ORDER BY ItemName
    `);
    res.json({ success: true, data: result.recordset, count: result.recordset.length });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get item by ID
export async function getItemById(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM StoreItems WHERE ItemID = @id AND IsActive = 1");

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create store item
export async function createItem(req, res) {
  try {
    const { ItemName, Description, Category, Price, Quantity, Unit, SupplierID } = req.body;

    if (!ItemName || !Price) {
      return res.status(400).json({ success: false, error: "ItemName and Price are required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("ItemName", sql.NVarChar(255), ItemName)
      .input("Description", sql.NVarChar(sql.MAX), Description || null)
      .input("Category", sql.NVarChar(100), Category || null)
      .input("Price", sql.Decimal(10, 2), Price)
      .input("Quantity", sql.Int, Quantity || 0)
      .input("Unit", sql.NVarChar(50), Unit || null)
      .input("SupplierID", sql.Int, SupplierID || null)
      .query(`
        INSERT INTO StoreItems (ItemName, Description, Category, Price, Quantity, Unit, SupplierID)
        VALUES (@ItemName, @Description, @Category, @Price, @Quantity, @Unit, @SupplierID);
        SELECT @@IDENTITY as ItemID;
      `);

    res.json({
      success: true,
      message: "Item created successfully",
      ItemID: result.recordset[0].ItemID
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update store item
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { ItemName, Description, Category, Price, Quantity, Unit, SupplierID } = req.body;

    const pool = await getPool();
    await pool
      .request()
      .input("ItemID", sql.Int, id)
      .input("ItemName", sql.NVarChar(255), ItemName)
      .input("Description", sql.NVarChar(sql.MAX), Description)
      .input("Category", sql.NVarChar(100), Category)
      .input("Price", sql.Decimal(10, 2), Price)
      .input("Quantity", sql.Int, Quantity)
      .input("Unit", sql.NVarChar(50), Unit)
      .input("SupplierID", sql.Int, SupplierID)
      .query(`
        UPDATE StoreItems 
        SET ItemName = @ItemName, Description = @Description, Category = @Category,
            Price = @Price, Quantity = @Quantity, Unit = @Unit, SupplierID = @SupplierID,
            UpdatedDate = GETDATE()
        WHERE ItemID = @ItemID
      `);

    res.json({ success: true, message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete store item
export async function deleteItem(req, res) {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("ItemID", sql.Int, req.params.id)
      .query("UPDATE StoreItems SET IsActive = 0, UpdatedDate = GETDATE() WHERE ItemID = @ItemID");

    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== STORE ORDERS ====================

// Get all orders
export async function getAllOrders(req, res) {
  try {
    const pool = await getPool();
    
    console.log("🔍 Fetching all orders with items...");
    
    // Get all orders with member details
    const orderResult = await pool.request().query(`
      SELECT 
        o.OrderID,
        o.OrderNumber,
        o.MemberID,
        o.TotalAmount,
        o.Status,
        o.OrderDate,
        m.Name as MemberName,
        m.Branch
      FROM StoreOrders o
      LEFT JOIN MemberDetails m ON o.MemberID = m.MemberID
      ORDER BY o.OrderDate DESC
    `);
    
    console.log(`📦 Found ${orderResult.recordset.length} orders`);
    
    // Get all order items with product details
    const itemsResult = await pool.request().query(`
      SELECT 
        oi.OrderID,
        oi.ItemID,
        oi.Quantity,
        oi.UnitPrice,
        oi.TotalPrice,
        si.ItemName,
        si.ItemID
      FROM StoreOrderItems oi
      LEFT JOIN StoreItems si ON oi.ItemID = si.ItemID
      ORDER BY oi.OrderID
    `);
    
    console.log(`📋 Found ${itemsResult.recordset.length} order items`);
    
    // Group items by OrderID
    const itemsByOrder = {};
    itemsResult.recordset.forEach(item => {
      if (!itemsByOrder[item.OrderID]) {
        itemsByOrder[item.OrderID] = [];
      }
      itemsByOrder[item.OrderID].push({
        ItemID: item.ItemID,
        ItemName: item.ItemName || 'Unknown Product',
        Quantity: item.Quantity,
        UnitPrice: item.UnitPrice,
        TotalPrice: item.TotalPrice
      });
      console.log(`✅ Item: ${item.ItemName} (Qty: ${item.Quantity}) for Order ${item.OrderID}`);
    });
    
    // Attach items to each order
    const ordersWithItems = orderResult.recordset.map(order => ({
      ...order,
      Items: itemsByOrder[order.OrderID] || []
    }));
    
    console.log(`✅ Fetched ${ordersWithItems.length} orders with items`);
    res.json({ success: true, data: ordersWithItems, count: ordersWithItems.length });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get order by ID with items
export async function getOrderById(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT o.*, m.Name as MemberName
        FROM StoreOrders o
        LEFT JOIN MemberDetails m ON o.MemberID = m.MemberID
        WHERE o.OrderID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const order = result.recordset[0];
    const itemsResult = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT oi.*, si.ItemName, si.Category
        FROM StoreOrderItems oi
        LEFT JOIN StoreItems si ON oi.ItemID = si.ItemID
        WHERE oi.OrderID = @id
      `);

    order.items = itemsResult.recordset;
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create order
export async function createOrder(req, res) {
  try {
    const { MemberID, TotalAmount, Status, Items } = req.body;

    if (!MemberID || !Array.isArray(Items) || Items.length === 0) {
      return res.status(400).json({ success: false, error: "MemberID and Items array are required" });
    }

    const pool = await getPool();
    const orderNumber = `ORD-${Date.now()}`;

    console.log(`\n📝 Creating order for MemberID: ${MemberID}, Total: ₹${TotalAmount}`);

    const result = await pool
      .request()
      .input("OrderNumber", sql.NVarChar(50), orderNumber)
      .input("MemberID", sql.Int, MemberID)
      .input("TotalAmount", sql.Decimal(12, 2), TotalAmount || 0)
      .input("Status", sql.NVarChar(50), Status || "Pending")
      .query(`
        INSERT INTO StoreOrders (OrderNumber, MemberID, TotalAmount, Status)
        VALUES (@OrderNumber, @MemberID, @TotalAmount, @Status);
        SELECT @@IDENTITY as OrderID;
      `);

    const OrderID = result.recordset[0].OrderID;
    console.log(`✅ Order created with ID: ${OrderID}`);

    // Insert order items and reduce inventory
    for (const item of Items) {
      console.log(`\n📦 Processing item - ItemID: ${item.ItemID}, Qty: ${item.Quantity}`);
      
      // Insert into StoreOrderItems
      await pool
        .request()
        .input("OrderID", sql.Int, OrderID)
        .input("ItemID", sql.Int, item.ItemID)
        .input("Quantity", sql.Int, item.Quantity)
        .input("UnitPrice", sql.Decimal(10, 2), item.UnitPrice)
        .input("TotalPrice", sql.Decimal(12, 2), item.TotalPrice)
        .query(`
          INSERT INTO StoreOrderItems (OrderID, ItemID, Quantity, UnitPrice, TotalPrice)
          VALUES (@OrderID, @ItemID, @Quantity, @UnitPrice, @TotalPrice)
        `);
      
      console.log(`✅ Order item inserted`);

      // Check current quantity before reduction
      const checkResult = await pool
        .request()
        .input("ItemID", sql.Int, item.ItemID)
        .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
      
      const currentQty = checkResult.recordset[0]?.Quantity || 0;
      console.log(`📊 Current inventory: ${currentQty} units`);

      // Reduce inventory quantity - IMPORTANT: Use explicit WHERE clause
      const updateQuery = `
        UPDATE StoreItems 
        SET Quantity = Quantity - ${item.Quantity}
        WHERE ItemID = ${item.ItemID}
      `;
      
      console.log(`📝 Executing update query: ${updateQuery}`);
      
      const updateResult = await pool.request().query(updateQuery);

      console.log(`✅ Inventory update executed`);
      console.log(`   Rows affected: ${updateResult.rowsAffected[0]}`);

      // Verify new quantity
      const verifyResult = await pool
        .request()
        .input("ItemID", sql.Int, item.ItemID)
        .query(`SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID`);
      
      const newQty = verifyResult.recordset[0]?.Quantity || 0;
      console.log(`📉 New inventory: ${newQty} units (Reduced by ${item.Quantity})`);
      
      if (newQty === currentQty) {
        console.error(`❌ ERROR: Quantity was NOT reduced! Still ${newQty} units`);
        throw new Error(`Inventory update failed for ItemID ${item.ItemID}`);
      } else {
        console.log(`✅ Inventory reduced successfully`);
      }
    }

    res.json({
      success: true,
      message: "Order created successfully and inventory updated",
      OrderID: OrderID,
      OrderNumber: orderNumber
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update order status
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    const pool = await getPool();
    await pool
      .request()
      .input("OrderID", sql.Int, id)
      .input("Status", sql.NVarChar(50), Status)
      .query(`
        UPDATE StoreOrders 
        SET Status = @Status, UpdatedDate = GETDATE()
        WHERE OrderID = @OrderID
      `);

    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== STORE SALES ====================

// Get all sales
export async function getAllSales(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT s.*, m.Name as MemberName, si.ItemName
      FROM StoreSales s
      LEFT JOIN MemberDetails m ON s.MemberID = m.MemberID
      LEFT JOIN StoreItems si ON s.ItemID = si.ItemID
      ORDER BY s.SaleDate DESC
    `);
    res.json({ success: true, data: result.recordset, count: result.recordset.length });
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create sale
export async function createSale(req, res) {
  try {
    const { OrderID, ItemID, MemberID, Quantity, UnitPrice, TotalAmount, PaymentStatus } = req.body;

    const pool = await getPool();
    const result = await pool
      .request()
      .input("OrderID", sql.Int, OrderID || null)
      .input("ItemID", sql.Int, ItemID)
      .input("MemberID", sql.Int, MemberID)
      .input("Quantity", sql.Int, Quantity)
      .input("UnitPrice", sql.Decimal(10, 2), UnitPrice)
      .input("TotalAmount", sql.Decimal(12, 2), TotalAmount)
      .input("PaymentStatus", sql.NVarChar(50), PaymentStatus || "Completed")
      .query(`
        INSERT INTO StoreSales (OrderID, ItemID, MemberID, Quantity, UnitPrice, TotalAmount, PaymentStatus)
        VALUES (@OrderID, @ItemID, @MemberID, @Quantity, @UnitPrice, @TotalAmount, @PaymentStatus);
        SELECT @@IDENTITY as SaleID;
      `);

    res.json({
      success: true,
      message: "Sale recorded successfully",
      SaleID: result.recordset[0].SaleID
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ==================== STORE INVENTORY ====================

// Get inventory for item
export async function getInventory(req, res) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("ItemID", sql.Int, req.params.itemId)
      .query(`
        SELECT si.*, st.ItemName
        FROM StoreInventory si
        LEFT JOIN StoreItems st ON si.ItemID = st.ItemID
        WHERE si.ItemID = @ItemID
        ORDER BY si.TransactionDate DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update inventory
export async function updateInventory(req, res) {
  try {
    const { ItemID, QuantityIn, QuantityOut, TransactionType } = req.body;

    const pool = await getPool();
    const currentStock = await pool
      .request()
      .input("ItemID", sql.Int, ItemID)
      .query("SELECT Quantity FROM StoreItems WHERE ItemID = @ItemID");

    if (currentStock.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Item not found" });
    }

    const currentQty = currentStock.recordset[0].Quantity || 0;
    const newQty = currentQty + (QuantityIn || 0) - (QuantityOut || 0);

    // Update item quantity
    await pool
      .request()
      .input("ItemID", sql.Int, ItemID)
      .input("Quantity", sql.Int, newQty)
      .query("UPDATE StoreItems SET Quantity = @Quantity WHERE ItemID = @ItemID");

    // Log transaction
    await pool
      .request()
      .input("ItemID", sql.Int, ItemID)
      .input("QuantityIn", sql.Int, QuantityIn || 0)
      .input("QuantityOut", sql.Int, QuantityOut || 0)
      .input("CurrentStock", sql.Int, newQty)
      .input("TransactionType", sql.NVarChar(50), TransactionType || "Manual")
      .query(`
        INSERT INTO StoreInventory (ItemID, QuantityIn, QuantityOut, CurrentStock, TransactionType)
        VALUES (@ItemID, @QuantityIn, @QuantityOut, @CurrentStock, @TransactionType)
      `);

    res.json({ success: true, message: "Inventory updated successfully", newStock: newQty });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get inventory summary
export async function getInventorySummary(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        si.ItemID,
        si.ItemName,
        si.Category,
        si.Quantity,
        si.Price,
        (si.Quantity * si.Price) as TotalValue,
        CASE WHEN si.Quantity <= 10 THEN 'Low' ELSE 'Adequate' END as StockStatus
      FROM StoreItems si
      WHERE si.IsActive = 1
      ORDER BY si.Quantity ASC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
