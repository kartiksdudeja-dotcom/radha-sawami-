import React, { useState, useEffect } from "react";
import "../styles/Store.css";
import { API_BASE_URL } from "../config/apiConfig";

const Store = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [notification, setNotification] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const memberId = user.id || 1;

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    deliveryAddress: "",
    deliveryPhone: user.phone || "",
    specialInstructions: "",
  });

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/store/categories`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/store/items`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        console.error("Invalid items response:", data);
        showNotification("Failed to load items", "error");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      showNotification(
        "Failed to load items. Make sure backend is running.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    let filtered = items;
    
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.Category === selectedCategory
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.ItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.Category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  // Get unique categories from items
  const getUniqueCategories = () => {
    const uniqueCats = [...new Set(items.map(item => item.Category).filter(Boolean))];
    return uniqueCats;
  };

  const searchProducts = () => {
    // Trigger filter with current search query
    // This is called when user presses Enter or clicks search button
  };

  const addToCart = (itemId, itemName, price) => {
    // Check if item is in stock
    const product = items.find(item => item.ItemID === itemId);
    if (!product || product.Quantity <= 0) {
      showNotification("This item is out of stock!", "error");
      return;
    }

    // Add item to local cart state
    const existingItem = cart.find((item) => item.ItemID === itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ItemID: itemId,
        ItemName: itemName,
        Price: price,
        quantity: 1,
      });
    }
    setCart([...cart]);
    showNotification(`✓ Added ${itemName} to cart!`);
  };

  const updateCartItem = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    // ✅ NEW: Check if requested quantity exceeds available stock
    const product = items.find(item => item.ItemID === itemId);
    if (product && quantity > product.Quantity) {
      showNotification(
        `Only ${product.Quantity} units available. Cannot add more than that!`,
        "error"
      );
      return;
    }

    const item = cart.find((item) => item.ItemID === itemId);
    if (item) {
      item.quantity = quantity;
      setCart([...cart]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.ItemID !== itemId));
    showNotification("Removed from cart");
  };

  const calculateCartTotals = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.Price * item.quantity,
      0
    );
    return { totalItems, totalPrice };
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!checkoutForm.deliveryAddress.trim()) {
      showNotification("Please enter delivery address", "error");
      return;
    }
    if (!checkoutForm.deliveryPhone.trim()) {
      showNotification("Please enter phone number", "error");
      return;
    }
    if (cart.length === 0) {
      showNotification("Cart is empty", "error");
      return;
    }

    // ✅ NEW: Verify stock availability for all items in cart
    for (const cartItem of cart) {
      const product = items.find(item => item.ItemID === cartItem.ItemID);
      if (!product || product.Quantity < cartItem.quantity) {
        const availableQty = product?.Quantity || 0;
        showNotification(
          `❌ "${cartItem.ItemName}" has only ${availableQty} units in stock, but you ordered ${cartItem.quantity}. Please reduce quantity.`,
          "error"
        );
        return;
      }
    }

    try {
      const { totalPrice } = calculateCartTotals();

      // Format items for API - convert from cart format to order items format
      const orderItems = cart.map((item) => ({
        ItemID: item.ItemID,
        Quantity: item.quantity,
        UnitPrice: item.Price,
        TotalPrice: item.Price * item.quantity,
      }));

      console.log("Placing order with payload:", {
        MemberID: memberId,
        TotalAmount: totalPrice,
        Status: "Pending",
        Items: orderItems,
        DeliveryAddress: checkoutForm.deliveryAddress,
        DeliveryPhone: checkoutForm.deliveryPhone,
        Notes: checkoutForm.specialInstructions,
      });

      const res = await fetch(`${API_BASE_URL}/api/store/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MemberID: memberId,
          TotalAmount: totalPrice,
          Status: "Pending",
          Items: orderItems,
          DeliveryAddress: checkoutForm.deliveryAddress,
          DeliveryPhone: checkoutForm.deliveryPhone,
          Notes: checkoutForm.specialInstructions,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Order response:", data);

      if (data.success) {
        showNotification(
          `✓ Order placed successfully! Order #${
            data.OrderNumber || data.OrderID
          }`
        );
        setShowCheckout(false);
        setShowCart(false);
        setCart([]);
        setCheckoutForm({
          deliveryAddress: "",
          deliveryPhone: user.phone || "",
          specialInstructions: "",
        });
        
        // Refetch items to update inventory display
        fetchItems();
        
        // Refresh items to show updated quantities
        setTimeout(() => {
          fetchItems();
        }, 500);
      } else {
        showNotification(data.error || "Failed to place order", "error");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showNotification("Failed to place order: " + error.message, "error");
    }
  };

  return (
    <div className="store-container">
      {/* Notification */}
      {notification && (
        <div className={`store-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="store-header">
        <div className="store-header-left">
          <h1>🏪 RS Store</h1>
          <p>Quality products for your spiritual needs</p>
        </div>
        <div className="store-header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchProducts()}
            />
            <button onClick={searchProducts}>🔍</button>
          </div>
          <button className="cart-btn" onClick={() => setShowCart(true)}>
            🛒 Cart
            {calculateCartTotals().totalItems > 0 && (
              <span className="cart-badge">
                {calculateCartTotals().totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === null ? "active" : ""}`}
          onClick={() => setSelectedCategory(null)}
        >
          🏠 All Items
        </button>
        {getUniqueCategories().map((cat) => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            📦 {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="products-section">
        {selectedCategory && (
          <h2 className="category-title">📦 {selectedCategory}</h2>
        )}
        {loading ? (
          <div className="loading-spinner">Loading items...</div>
        ) : getFilteredItems().length === 0 ? (
          <div className="no-products">
            {selectedCategory 
              ? `No items in "${selectedCategory}" category` 
              : "No items found"}
          </div>
        ) : (
          <div className="products-grid">
            {getFilteredItems().map((item) => (
              <div key={item.ItemID} className="product-card">
                <div className="product-image">
                  {item.ImageData ? (
                    <img
                      src={`data:image/jpeg;base64,${item.ImageData}`}
                      alt={item.ItemName}
                      className="product-img"
                    />
                  ) : (
                    <div className="product-placeholder">📦</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{item.ItemName}</h3>
                  <p className="product-desc">
                    {item.Description || "Spiritual item"}
                  </p>
                  <div className="product-price">
                    <span className="current-price">₹{item.Price}</span>
                  </div>
                  <div className="product-stock">
                    {item.Quantity > 0 ? (
                      <span className="in-stock">
                        ✓ In Stock ({item.Quantity})
                      </span>
                    ) : (
                      <span className="out-stock">Out of Stock</span>
                    )}
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() =>
                      addToCart(item.ItemID, item.ItemName, item.Price)
                    }
                    disabled={item.Quantity === 0}
                  >
                    {item.Quantity > 0 ? "+ Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>🛒 Your Cart</h2>
              <button className="close-btn" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>🛒</span>
                <p>Your cart is empty</p>
                <button onClick={() => setShowCart(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.ItemID} className="cart-item">
                      <div className="cart-item-image">📦</div>
                      <div className="cart-item-info">
                        <h4>{item.ItemName}</h4>
                        <p className="cart-item-price">
                          ₹{item.Price} × {item.quantity}
                        </p>
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              updateCartItem(item.ItemID, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateCartItem(item.ItemID, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-total">
                        <p>₹{item.Price * item.quantity}</p>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.ItemID)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>
                      Total ({calculateCartTotals().totalItems} items)
                    </span>
                    <span className="total-amount">
                      ₹{calculateCartTotals().totalPrice}
                    </span>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout →
                  </button>
                  <p className="cod-note">💰 Cash on Delivery Only</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="checkout-overlay"
          onClick={() => setShowCheckout(false)}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-header">
              <h2>📦 Checkout</h2>
              <button
                className="close-btn"
                onClick={() => setShowCheckout(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={placeOrder} className="checkout-form">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-items">
                  {cart.map((item) => (
                    <div key={item.ItemID} className="summary-item">
                      <span>
                        {item.ItemName} × {item.quantity}
                      </span>
                      <span>₹{item.Price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{calculateCartTotals().totalPrice}</span>
                </div>
              </div>

              <div className="delivery-details">
                <h3>Delivery Details</h3>
                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea
                    value={checkoutForm.deliveryAddress}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        deliveryAddress: e.target.value,
                      })
                    }
                    placeholder="Enter complete delivery address"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={checkoutForm.deliveryPhone}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        deliveryPhone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Special Instructions (Optional)</label>
                  <textarea
                    value={checkoutForm.specialInstructions}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        specialInstructions: e.target.value,
                      })
                    }
                    placeholder="Any special delivery instructions"
                    rows="2"
                  />
                </div>
              </div>

              <div className="payment-method">
                <h3>Payment Method</h3>
                <div className="cod-only">
                  <span>💰</span>
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your order arrives</p>
                  </div>
                </div>
              </div>

              <button type="submit" className="place-order-btn">
                Place Order - ₹{calculateCartTotals().totalPrice}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
