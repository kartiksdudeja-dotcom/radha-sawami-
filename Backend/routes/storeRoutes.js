import express from "express";
import {
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // SubCategories
  getAllSubCategories,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  // Products
  getAllProducts,
  getProductById,
  getProductsBySubCategory,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  toggleProductStatus,
  // Cart
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  // Orders
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  // Dashboard Stats
  getStoreStats
} from "../controllers/storeController.js";

const router = express.Router();

// ==================== CATEGORIES ====================
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// ==================== SUB-CATEGORIES ====================
router.get("/subcategories", getAllSubCategories);
router.get("/subcategories/category/:categoryId", getSubCategoriesByCategory);
router.post("/subcategories", createSubCategory);
router.put("/subcategories/:id", updateSubCategory);
router.delete("/subcategories/:id", deleteSubCategory);

// ==================== PRODUCTS ====================
router.get("/products", getAllProducts);
router.get("/products/search", searchProducts);
router.get("/products/:id", getProductById);
router.get("/products/subcategory/:subCategoryId", getProductsBySubCategory);
router.get("/products/category/:categoryId", getProductsByCategory);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/stock", updateProductStock);
router.patch("/products/:id/toggle", toggleProductStatus);

// ==================== CART ====================
router.get("/cart/:userId", getCart);
router.post("/cart", addToCart);
router.put("/cart/:cartItemId", updateCartItem);
router.delete("/cart/:cartItemId", removeFromCart);
router.delete("/cart/clear/:userId", clearCart);

// ==================== ORDERS ====================
router.post("/orders", createOrder);
router.get("/orders/:id", getOrderById);
router.get("/orders/user/:userId", getUserOrders);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/payment", updatePaymentStatus);

// ==================== DASHBOARD STATS ====================
router.get("/stats", getStoreStats);

export default router;
