# 🏪 STORE SYSTEM - COMPLETE DESIGN DOCUMENT

**Blinkit-Style Quick Commerce for Radha Swami Portal**

---

## 📋 TABLE OF CONTENTS

1. System Overview
2. Architecture Diagram
3. Database Design
4. User Journey Pipeline
5. Admin Dashboard Pipeline
6. Order Processing Pipeline
7. UI/UX Design System
8. Implementation Roadmap

---

## 🎯 1. SYSTEM OVERVIEW

### What is This System?

A **quick commerce platform** where users can:

- Browse organized categories (like Blinkit)
- Add products to cart
- Checkout with COD (Cash on Delivery)
- Place orders in 2 minutes

Admin can:

- Manage all inventory
- Control all products
- Track all orders
- Update order status

---

## 📐 2. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        WEBSITE NAVBAR                            │
│  Home | Dashboard | Members | Attendance | Seva | STORE ✨      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                ┌─────────────────────────────┐
                │      STORE MAIN PAGE        │
                │   (Categories & Products)   │
                └─────────────────────────────┘
                              ↓
        ┌─────────────────────┬─────────────────────┐
        ↓                     ↓                     ↓
   ┌─────────┐          ┌─────────┐          ┌──────────┐
   │Category │          │ Sub-Cat │          │ Product  │
   │ Browse  │ -------→ │ Browse  │ -------→ │  Details │
   └─────────┘          └─────────┘          └──────────┘
        ↓                                          ↓
        └──────────────────┬───────────────────────┘
                          ↓
                    ┌───────────┐
                    │   CART    │
                    │ Review &  │
                    │ Checkout  │
                    └───────────┘
                          ↓
                    ┌───────────┐
                    │ PAYMENT   │
                    │ (COD only)│
                    └───────────┘
                          ↓
                    ┌───────────┐
                    │ORDER DONE │
                    │Order# + SMS│
                    └───────────┘
```

---

## 🗄️ 3. DATABASE DESIGN

### TABLE 1: CATEGORIES

```
Categories Collection
├── categoryId (unique)
├── categoryName (string)
├── categoryImage (URL)
├── categoryDescription (string)
├── isActive (boolean - true/false)
├── createdAt (timestamp)
└── updatedAt (timestamp)

Example:
{
  categoryId: "CAT001",
  categoryName: "Personal Care",
  categoryImage: "url/personal-care.jpg",
  categoryDescription: "Soaps, shampoos, body care",
  isActive: true,
  createdAt: "2025-12-25",
  updatedAt: "2025-12-25"
}
```

### TABLE 2: SUB-CATEGORIES

```
SubCategories Collection
├── subCategoryId (unique)
├── categoryId (link to Categories)
├── subCategoryName (string)
├── subCategoryImage (URL)
├── isActive (boolean)
├── createdAt (timestamp)
└── updatedAt (timestamp)

Example:
{
  subCategoryId: "SUBCAT001",
  categoryId: "CAT001",
  subCategoryName: "Soaps",
  subCategoryImage: "url/soaps.jpg",
  isActive: true,
  createdAt: "2025-12-25",
  updatedAt: "2025-12-25"
}
```

### TABLE 3: PRODUCTS

```
Products Collection
├── productId (unique)
├── subCategoryId (link to SubCategories)
├── categoryId (link to Categories)
├── productName (string)
├── productDescription (string)
├── productImage (URL)
├── price (number - ₹)
├── originalPrice (number - for discount)
├── discount (number - %)
├── stock (number - quantity available)
├── sku (unique code)
├── isActive (boolean)
├── rating (number - 1-5)
├── reviews (array)
├── createdAt (timestamp)
└── updatedAt (timestamp)

Example:
{
  productId: "PROD001",
  subCategoryId: "SUBCAT001",
  categoryId: "CAT001",
  productName: "Dove Soap",
  productDescription: "Moisturizing Bath Soap - 75g",
  productImage: "url/dove-soap.jpg",
  price: 45,
  originalPrice: 50,
  discount: 10,
  stock: 150,
  sku: "DOVE-SOAP-75G",
  isActive: true,
  rating: 4.5,
  reviews: [...],
  createdAt: "2025-12-25",
  updatedAt: "2025-12-25"
}
```

### TABLE 4: ORDERS

```
Orders Collection
├── orderId (unique - AUTO GENERATED)
├── userId (link to Users)
├── orderNumber (readable - ORD12345)
├── items (array of products ordered)
│   ├── productId
│   ├── productName
│   ├── quantity
│   ├── price
│   └── subtotal
├── totalAmount (number)
├── deliveryAddress (string)
├── deliveryPhone (string)
├── orderStatus (string - Placed/Confirmed/Packed/Out for Delivery/Delivered)
├── paymentMethod (string - "COD")
├── paymentStatus (string - Pending/Paid)
├── estimatedDelivery (date)
├── actualDelivery (date)
├── specialInstructions (string)
├── createdAt (timestamp)
└── updatedAt (timestamp)

Example:
{
  orderId: "ORD65432",
  orderId: "ORD65432",
  userId: "USER123",
  orderNumber: "ORD-001-25DEC2025",
  items: [
    {
      productId: "PROD001",
      productName: "Dove Soap",
      quantity: 2,
      price: 45,
      subtotal: 90
    }
  ],
  totalAmount: 90,
  deliveryAddress: "123 Main Street, City",
  deliveryPhone: "+91-9999999999",
  orderStatus: "Placed",
  paymentMethod: "COD",
  paymentStatus: "Pending",
  estimatedDelivery: "2025-12-26",
  actualDelivery: null,
  specialInstructions: "Leave at door",
  createdAt: "2025-12-25 14:30",
  updatedAt: "2025-12-25 14:30"
}
```

### TABLE 5: CART (Session-based)

```
Cart Collection (Temporary)
├── cartId (unique)
├── userId (link to Users)
├── items (array)
│   ├── productId
│   ├── productName
│   ├── quantity
│   ├── price
│   └── image
├── totalItems (number)
├── totalPrice (number)
└── expiresAt (auto-delete after 24hrs)

Example:
{
  cartId: "CART123",
  userId: "USER123",
  items: [
    {
      productId: "PROD001",
      productName: "Dove Soap",
      quantity: 2,
      price: 45,
      image: "url/dove.jpg"
    }
  ],
  totalItems: 2,
  totalPrice: 90,
  expiresAt: "2025-12-26 14:30"
}
```

---

## 👥 4. USER JOURNEY PIPELINE (START → END)

### STEP 1: USER ENTERS STORE

```
User clicks "STORE" in Navbar
            ↓
Check if user is logged in
            ↓
    ┌─── YES ──→ Show Store Page
    │
    └─── NO ──→ Redirect to Login
```

### STEP 2: BROWSE CATEGORIES

```
User sees all active Categories
    (With Images & Names)
            ↓
User clicks a Category
            ↓
Show all Sub-categories of that Category
            ↓
User clicks a Sub-category
            ↓
Show all Products of that Sub-category
            ↓
Display:
  • Product Image
  • Product Name
  • Price & Discount
  • Stock Status (In Stock / Out of Stock)
  • Add to Cart Button
```

### STEP 3: ADD TO CART

```
User clicks "Add to Cart"
            ↓
Select Quantity (1, 2, 3, ...)
            ↓
Click "Add"
            ↓
AUTOMATIC ACTION:
  • Save to Cart database
  • Show "✓ Added to Cart" notification
  • Update Cart count in navbar
  • User can continue shopping
```

### STEP 4: VIEW CART

```
User clicks Cart Icon
            ↓
Show all items in cart with:
  • Product name
  • Quantity & Price
  • Remove button
  • Update quantity button
            ↓
Show Total Amount
            ↓
Show "Checkout" Button
```

### STEP 5: CHECKOUT

```
User clicks "Checkout"
            ↓
Fill Delivery Address:
  • Full Name
  • Phone Number
  • Address
  • Landmark
            ↓
Add Special Instructions (Optional)
            ↓
Review Order Summary:
  • All items
  • Total amount
  • Delivery fee (if any)
  • Final price
```

### STEP 6: PAYMENT (COD ONLY)

```
User sees Payment Method: "Cash on Delivery"
            ↓
No payment gateway needed
            ↓
User clicks "Place Order"
            ↓
AUTOMATIC ACTIONS:
  ✓ Order saved to database
  ✓ Order ID generated (ORD-001-25DEC2025)
  ✓ Product stock reduced automatically
  ✓ Cart cleared
  ✓ SMS sent to user with Order Number
  ✓ Order status set to "Placed"
  ✓ Payment status = "Pending"
            ↓
Show Order Confirmation Page:
  • Order Number
  • Estimated Delivery (Next day)
  • "Track Order" button
  • Back to Store button
```

### STEP 7: TRACK ORDER

```
User clicks "Track Order" (In Account > My Orders)
            ↓
Show Order Timeline:
  📍 Placed - ✓ (Dec 25, 2:30 PM)
  📍 Confirmed - ○ (Waiting)
  📍 Packed - ○ (Waiting)
  📍 Out for Delivery - ○ (Waiting)
  📍 Delivered - ○ (Waiting)
            ↓
Update in Real-time as admin changes status
```

---

## 🛠️ 5. ADMIN DASHBOARD PIPELINE

### ADMIN PANEL MENU

```
Store Management
├── Dashboard (Statistics & Overview)
├── Categories
│   ├── View All
│   ├── Add New
│   ├── Edit
│   └── Delete
├── Sub-Categories
│   ├── View All
│   ├── Add New
│   ├── Edit
│   └── Delete
├── Products
│   ├── View All (With Stock Status)
│   ├── Add New
│   ├── Edit (Price, Stock, Image, Discount)
│   ├── Delete
│   └── Enable/Disable
├── Orders
│   ├── View All Orders
│   ├── Filter (By Status, Date, User)
│   ├── View Order Details
│   ├── Update Order Status
│   └── Download Invoice
└── Reports
    ├── Sales Report
    ├── Stock Report
    └── Popular Products
```

### ADMIN ADDING A NEW CATEGORY

```
Admin clicks "Add Category"
            ↓
Fill Form:
  • Category Name (e.g., "Personal Care")
  • Category Image (Upload JPG/PNG)
  • Description
  • Active/Inactive toggle
            ↓
Click "Save"
            ↓
AUTOMATIC ACTIONS:
  ✓ Category saved to database
  ✓ Category ID auto-generated
  ✓ Timestamp recorded
  ✓ Show success notification
  ✓ Redirect to Categories list
            ↓
Category now visible on User Store
```

### ADMIN ADDING A NEW PRODUCT

```
Admin clicks "Add Product"
            ↓
Fill Form:
  • Select Category
  • Select Sub-Category
  • Product Name
  • Description
  • Upload Product Image
  • Price (₹)
  • Original Price (for discount calc)
  • Stock Quantity
  • SKU (unique code)
  • Active/Inactive toggle
            ↓
Click "Save"
            ↓
AUTOMATIC ACTIONS:
  ✓ Product saved
  ✓ Product ID auto-generated
  ✓ Discount calculated automatically
  ✓ Product visible to users immediately
            ↓
Product now searchable & browseable
```

### ADMIN MANAGING ORDERS

```
Admin goes to "Orders" section
            ↓
See all orders in a table:
  • Order Number
  • Customer Name
  • Amount
  • Status (Placed / Confirmed / etc)
  • Date
            ↓
Admin clicks on an order
            ↓
See Full Details:
  • All items ordered
  • Delivery address
  • Phone number
  • Payment method (COD)
  • Payment status (Pending/Paid)
  • Special instructions
            ↓
Admin updates Status:

  Current: "Placed"
  ↓ Click "Confirm Order"
  New: "Confirmed"
  ↓ (Next steps in sequence)
  "Packed" → "Out for Delivery" → "Delivered"
            ↓
AUTOMATIC ACTIONS:
  ✓ Each status change logged
  ✓ SMS sent to user
  ✓ Order page updated for user
            ↓
After "Delivered":
  Admin clicks "Mark as Paid"
  ↓ Payment status = "Paid"
  ✓ Order marked complete
```

### ADMIN DASHBOARD STATISTICS

```
Dashboard Home shows:
  • Total Orders (This Month)
  • Total Revenue (This Month)
  • Orders Pending Delivery
  • Products Running Out of Stock
  • Popular Categories
  • Recent Orders List
```

---

## 🔄 6. ORDER PROCESSING PIPELINE (DATABASE AUTO-UPDATE)

### PIPELINE 1: WHEN USER PLACES ORDER

```
TRIGGER: User clicks "Place Order"
                     ↓
Step 1: VALIDATE
  ✓ Check all items in stock
  ✓ Check user is logged in
  ✓ Check address is filled
                     ↓
Step 2: CREATE ORDER
  • Generate Order ID: ORD-001-25DEC2025
  • Generate Order Number (readable)
  • Copy all cart items
  • Set orderStatus = "Placed"
  • Set paymentStatus = "Pending"
  • paymentMethod = "COD"
  • Save to Orders table
                     ↓
Step 3: REDUCE STOCK (AUTOMATIC)
  For each product in order:
    productStock = productStock - quantity
  Update Products table
                     ↓
Step 4: CLEAR CART (AUTOMATIC)
  Delete user's cart items
  User's cart count = 0
                     ↓
Step 5: SEND NOTIFICATION
  • SMS: "Order placed! Order #ORD-001. Deliver by Dec 26"
  • Email: Order confirmation with invoice
  • Push notification on app
                     ↓
Step 6: SHOW CONFIRMATION
  Display to user:
    • Order Number
    • Expected delivery
    • Amount
    • "Track" button
                     ↓
ORDER PLACED SUCCESSFULLY ✓
```

### PIPELINE 2: WHEN ADMIN UPDATES STATUS

```
TRIGGER: Admin changes status "Placed" → "Confirmed"
                     ↓
Step 1: UPDATE DATABASE
  orders.orderStatus = "Confirmed"
  orders.updatedAt = current timestamp
                     ↓
Step 2: SEND USER NOTIFICATION
  SMS: "Your order ORD-001 is confirmed. Preparing for dispatch"
  Email: Status update
                     ↓
Step 3: UPDATE USER INTERFACE
  User's "Track Order" page updates
  Timeline shows "Confirmed" ✓
                     ↓
STATUS UPDATED ✓
```

### PIPELINE 3: LOW STOCK ALERT

```
TRIGGER: Every product < 10 items
                     ↓
Step 1: CHECK STOCK
  If product.stock <= 10:
                     ↓
Step 2: ALERT ADMIN
  Show red flag in Products list
  Send admin notification
  Mark as "Low Stock"
                     ↓
Step 3: PREVENT OVER-SELLING
  If stock = 0, show "Out of Stock"
  Disable "Add to Cart" button
  User cannot checkout
                     ↓
LOW STOCK MANAGED ✓
```

---

## 🎨 7. UI/UX DESIGN SYSTEM

### COLOR SCHEME (Blue & White)

```
Primary Colors:
  • Deep Blue: #0052A3 (Headers, CTAs)
  • Light Blue: #1E88E5 (Buttons, hover)
  • Sky Blue: #E3F2FD (Backgrounds)
  • White: #FFFFFF (Main background)

Secondary Colors:
  • Neutral Gray: #F5F5F5 (Cards background)
  • Dark Gray: #424242 (Text)
  • Light Gray: #BDBDBD (Borders)
  • Success Green: #4CAF50 (Order placed)
  • Warning Red: #F44336 (Low stock)
```

### STORE PAGE LAYOUT (DESKTOP)

```
┌────────────────────────────────────────────────────────┐
│ RADHA SWAMI STORE                          🛒 Cart (2) │
└────────────────────────────────────────────────────────┘

┌─────────────┬──────────────────────────────────────┐
│             │                                      │
│ CATEGORIES  │        PRODUCTS GRID                 │
│             │  ┌────────┐ ┌────────┐ ┌────────┐   │
│ Personal    │  │ Dove   │ │ Soap   │ │ Lotion │   │
│ Care        │  │ 45 ₹   │ │ 120 ₹  │ │ 200 ₹  │   │
│             │  │ Add    │ │ Add    │ │ Add    │   │
│ □ Soaps     │  │ Cart   │ │ Cart   │ │ Cart   │   │
│ □ Shampoo   │  └────────┘ └────────┘ └────────┘   │
│ □ Lotion    │                                      │
│             │  ┌────────┐ ┌────────┐ ┌────────┐   │
│ Electronics │  │ Charger│ │ Cable  │ │ Cover  │   │
│             │  │ 500 ₹  │ │ 150 ₹  │ │ 300 ₹  │   │
│ □ Chargers  │  │ Add    │ │ Add    │ │ Add    │   │
│ □ Cables    │  │ Cart   │ │ Cart   │ │ Cart   │   │
│ □ Covers    │  └────────┘ └────────┘ └────────┘   │
│             │                                      │
└─────────────┴──────────────────────────────────────┘
```

### PRODUCT CARD DESIGN

```
┌──────────────────────┐
│   [Product Image]    │  (Square, 200x200px)
│                      │
├──────────────────────┤
│ Dove Soap           │  (Product Name - Bold)
│                      │
│ Moisturizing Bath   │  (Description - Gray)
│ Soap - 75g          │
│                      │
│ ₹45    ₹50   -10%    │  (Price | Original | Discount)
│ (Blue) (Gray) (Red) │
│                      │
│ Stock: 150 ✓        │  (Stock Status - Green)
│                      │
│ Rating: ⭐⭐⭐⭐⭐  │  (Stars)
│ (4.5)               │
│                      │
│ [Add to Cart Button] │  (Blue, Hover: Darker Blue)
│                      │
│ [❤️ Save for Later]  │  (Optional)
│                      │
└──────────────────────┘
```

### CART PAGE

```
┌──────────────────────────────────────────────────┐
│ YOUR CART (2 items)                              │
└──────────────────────────────────────────────────┘

Item 1: Dove Soap
  Image | Name | Qty [1] ▲▼ | ₹45 | [Remove]

Item 2: Charger
  Image | Name | Qty [1] ▲▼ | ₹500 | [Remove]

────────────────────────────────────────────────────
BILL DETAILS:
  Subtotal:          ₹545
  Delivery Fee:      ₹0
  ──────────────────────
  Total:             ₹545

[Continue Shopping]  [Checkout]
```

### CHECKOUT PAGE

```
┌──────────────────────────────────────┐
│ DELIVERY ADDRESS                     │
├──────────────────────────────────────┤
│ Full Name: [__________________]      │
│ Phone: [__________________]          │
│ Address: [__________________]        │
│ Landmark: [__________________]       │
│ Special Instructions: [________]     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ORDER SUMMARY                        │
├──────────────────────────────────────┤
│ Dove Soap (x2)    ₹90               │
│ Charger (x1)      ₹500              │
│ Total:            ₹590              │
│ Payment: Cash on Delivery (COD)     │
└──────────────────────────────────────┘

[Back]  [Place Order]
```

### ORDER CONFIRMATION PAGE

```
┌──────────────────────────────────────┐
│ ✓ ORDER PLACED SUCCESSFULLY          │
├──────────────────────────────────────┤
│ Order Number: ORD-001-25DEC2025      │
│ Order Amount: ₹590                   │
│ Estimated Delivery: Dec 26, 2025     │
│ Status: Placed                       │
│                                      │
│ [Track Order] [Back to Store]        │
└──────────────────────────────────────┘
```

### ADMIN ORDERS TABLE

```
┌─────────┬──────────┬─────────┬──────────┬───────────────┐
│ Order # │Customer  │ Amount  │ Status   │ Payment       │
├─────────┼──────────┼─────────┼──────────┼───────────────┤
│ORD-001  │ Raj Singh│ ₹590    │ Placed   │ Pending (COD) │
│ORD-002  │ Priya    │ ₹1200   │Confirmed │ Pending (COD) │
│ORD-003  │ Anil     │ ₹450    │Delivered │ Paid          │
└─────────┴──────────┴─────────┴──────────┴───────────────┘

Click order → See full details + Update status
```

### MOBILE RESPONSIVE (320px - 768px)

```
MOBILE STORE VIEW:

┌───────────────────────┐
│ STORE      🛒 Cart(2) │
├───────────────────────┤
│ Categories ▼          │
│ • Personal Care       │
│ • Electronics         │
│ • Groceries           │
└───────────────────────┘

Products displayed as:
• Full width cards
• Single column
• Larger touch targets
• Swipe between categories
```

---

## 🚀 8. IMPLEMENTATION ROADMAP

### PHASE 1: SETUP (Week 1)

```
Tasks:
✓ Create database collections (MongoDB/Firebase)
✓ Design admin panel routes
✓ Setup authentication for admin
✓ Create API endpoints for categories, products, orders
✓ Build database schemas
```

### PHASE 2: ADMIN PANEL (Week 2-3)

```
Tasks:
✓ Build Category management (CRUD)
✓ Build Sub-category management (CRUD)
✓ Build Product management (CRUD)
✓ Add image upload feature
✓ Create admin dashboard with stats
✓ Build order management interface
```

### PHASE 3: USER STORE (Week 4-5)

```
Tasks:
✓ Create Store page layout
✓ Build category browsing
✓ Build product grid display
✓ Implement "Add to Cart"
✓ Build Cart page
✓ Create Checkout flow
✓ Implement order placement
✓ Add order tracking
```

### PHASE 4: AUTOMATION (Week 6)

```
Tasks:
✓ Auto stock reduction on order
✓ Auto SMS notifications
✓ Auto order status updates
✓ Low stock alerts
✓ Order confirmation emails
```

### PHASE 5: TESTING & DEPLOYMENT (Week 7)

```
Tasks:
✓ Test all user flows
✓ Test admin functions
✓ Test order pipeline
✓ Security testing
✓ Performance optimization
✓ Deploy to production
✓ Go live!
```

---

## 📊 KEY FEATURES SUMMARY

### USER SIDE

| Feature            | Status |
| ------------------ | ------ |
| Browse Categories  | ✓      |
| View Products      | ✓      |
| Add to Cart        | ✓      |
| Checkout           | ✓      |
| Place Order (COD)  | ✓      |
| Track Order        | ✓      |
| View Order History | ✓      |
| Save Address       | ✓      |

### ADMIN SIDE

| Feature               | Status |
| --------------------- | ------ |
| Manage Categories     | ✓      |
| Manage Sub-Categories | ✓      |
| Manage Products       | ✓      |
| Update Stock          | ✓      |
| View All Orders       | ✓      |
| Update Order Status   | ✓      |
| View Statistics       | ✓      |
| Generate Reports      | ✓      |

### AUTOMATION

| Feature                  | Status |
| ------------------------ | ------ |
| Auto Stock Reduction     | ✓      |
| Auto SMS Notification    | ✓      |
| Auto Email Confirmation  | ✓      |
| Auto Cart Clearing       | ✓      |
| Low Stock Alerts         | ✓      |
| Auto Timestamp Recording | ✓      |

---

## 🔐 SECURITY CONSIDERATIONS

```
1. Authentication
   • Only logged-in users can browse store
   • Only logged-in users can place orders
   • Admin has separate login

2. Payment Safety
   • No payment gateway → No payment security issues
   • COD only → No card/UPI data storage
   • Verified address before delivery

3. Data Protection
   • Encrypt user phone numbers
   • Validate all inputs
   • Rate limit API calls
   • Log all admin actions

4. Stock Management
   • Prevent overselling
   • Real-time stock updates
   • Inventory audit trail
```

---

## 💡 COMPETITIVE ADVANTAGES

```
✓ Fast Checkout (2 minutes)
✓ No Payment Complexity (COD only)
✓ Auto Inventory Management
✓ Professional Blue & White Design
✓ Mobile Optimized
✓ Real-time Order Tracking
✓ Admin Full Control
✓ SMS Notifications
```

---

## 🎓 INTERVIEW EXPLANATION

When asked: "Explain your Store system"

**Answer:**
"I designed a Blinkit-style quick commerce platform for a religious organization. The system has three main pipelines:

1. **Admin Pipeline**: Admin adds Categories → Sub-categories → Products (with images, prices, stock)

2. **User Pipeline**: User browses Categories → Sub-categories → Products → Adds to Cart → Checkout → Places Order with COD

3. **Automation Pipeline**: Order automatically triggers stock reduction, clears cart, sends SMS, and updates database

The database has 5 main collections: Categories, Sub-categories, Products, Orders, and Cart. All operations are automated - when a user places an order, the system automatically:

- Creates order record
- Reduces product stock
- Clears the cart
- Sends SMS notification
- Sets payment status to Pending

Admin dashboard lets managers:

- Manage inventory
- View orders
- Update order status (Placed → Confirmed → Packed → Out for Delivery → Delivered)
- View statistics

The UI uses Blue & White theme (professional), and the whole system is mobile-responsive. No complex payment gateway - just simple COD. Clean, fast, and automated."

---

## 📝 QUICK REFERENCE

### Database Collections

1. Categories - Product categories
2. SubCategories - Nested under categories
3. Products - Actual items to sell
4. Orders - Customer orders
5. Cart - Temporary shopping cart

### Key Flows

1. Browse → Add to Cart → Checkout → Place Order
2. Order Placed → Auto stock reduction
3. Admin Updates Status → User notified via SMS

### Color Palette

- Blue: #0052A3, #1E88E5
- White: #FFFFFF
- Gray: #F5F5F5

### Status Pipeline

Placed → Confirmed → Packed → Out for Delivery → Delivered → Paid

---

**Document Version**: 1.0
**Last Updated**: December 25, 2025
**Status**: Ready for Development
