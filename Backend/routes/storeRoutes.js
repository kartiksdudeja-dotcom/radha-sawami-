import express from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getAllSales,
  createSale,
  deleteSale,
  getInventory,
  updateInventory,
  getInventorySummary,
  addItemToCategory,
  removeItemFromCategory,
  getItemsByCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../controllers/storeController.js";

const router = express.Router();

// ==================== STORE ITEMS ====================
router.get("/items", getAllItems);
router.get("/items/:id", getItemById);
router.post("/items", createItem);
router.put("/items/:id", updateItem);
router.delete("/items/:id", deleteItem);

// ==================== STORE ORDERS ====================
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders", createOrder);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

// ==================== STORE SALES ====================
router.get("/sales", getAllSales);
router.post("/sales", createSale);
router.delete("/sales/:id", deleteSale);

// ==================== INVENTORY ====================
router.get("/inventory/:itemId", getInventory);
router.put("/inventory", updateInventory);
router.get("/inventory-summary", getInventorySummary);

// ==================== AI-POWERED CATEGORIES ====================
// AI routes FIRST (before :categoryId parameter routes)

// Then category CRUD routes
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.delete("/categories/:categoryId", deleteCategory);

// Then category-specific routes (with :categoryId parameter)
router.get("/categories/:categoryId/items", getItemsByCategory);

// Item-category association routes
router.post("/categories/items/add", addItemToCategory);
router.post("/categories/items/remove", removeItemFromCategory);

export default router;
