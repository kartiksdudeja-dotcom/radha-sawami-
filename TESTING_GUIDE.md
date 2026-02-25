# 🧪 Quick Start Guide - AI Category Management

## Setup & Testing Guide

### Step 1: Create Database Tables
Run this command to create the category tables in SQL Server:

```bash
cd "c:\Users\karti\OneDrive\Desktop\RADHA SWAMI\Backend"
node setup_category_tables.js
```

Expected output:
```
📋 Creating StoreCategories table...
✅ StoreCategories table ready
📋 Creating StoreCategoryItems table...
✅ StoreCategoryItems table ready
📋 Creating StoreCategoryMappings table...
✅ StoreCategoryMappings table ready
✨ All category tables created successfully!
```

---

### Step 2: Start Backend Server
```bash
cd Backend
npm start
```

Server should run on `http://localhost:5000`

Expected endpoints:
```
GET  /api/store/categories
POST /api/store/categories
GET  /api/store/categories/ai/suggest
POST /api/store/categories/ai/auto-generate
GET  /api/store/categories/:categoryId/items
POST /api/store/categories/items/add
POST /api/store/categories/items/remove
```

---

### Step 3: Start Frontend Dev Server
```bash
cd Frontend
npm start
```

Frontend should run on `http://localhost:3000`

---

### Step 4: Access Store Admin
Navigate to: `http://localhost:3000`

Login and go to Store Admin → Categories Tab

---

## 🧪 Testing Workflow

### Test 1: Auto-Generate Categories
1. Go to Categories tab
2. Click "✨ Auto-Generate from Items"
3. System analyzes all items
4. New categories appear based on item keywords

**Expected Result:** Categories like "Medicine", "Grocery", "Personal Care" are created

---

### Test 2: View Category Details
1. Click "📋 View" on any category card
2. See category details panel
3. View available items to add

**Expected Result:** Category detail view loads with empty or populated item list

---

### Test 3: Add Item to Category
1. In category detail view
2. Scroll to "➕ Add Items from Store"
3. Find an item
4. Click "➕ Add to Category"

**Expected Result:** Item appears in the category and is removed from available items

---

### Test 4: Get AI Suggestions
1. Go back to Categories main view
2. Click "🤖 AI Suggestions"
3. Get suggestions for all items

**Expected Result:** Suggestions loaded and ready to use

---

### Test 5: Manual Category Creation
1. Click "➕ Add Category"
2. Select icon (📚, 💊, 🏪, etc.)
3. Enter category name
4. Add description
5. Click "Create Category"

**Expected Result:** New category appears in grid

---

### Test 6: Remove Item from Category
1. In category detail view
2. Find item in "📦 Items in Category" section
3. Click "Remove"

**Expected Result:** Item removed from category and available to add again

---

## 📊 Sample Test Data

### Items that will be auto-categorized:

**Medicine & Healthcare:**
- Aspirin Tablets
- Cough Syrup
- Vitamin C Supplements
- First Aid Kit

**Groceries:**
- Basmati Rice
- Wheat Flour
- Black Dal
- Cooking Oil

**Dairy & Eggs:**
- Fresh Milk
- Yogurt
- Paneer
- Butter

**Personal Care:**
- Shampoo
- Face Wash
- Toothpaste
- Deodorant

---

## 🔍 Troubleshooting

### Issue: Categories tab shows error
**Solution:** Check if backend is running and database tables are created
```bash
# Verify tables exist
SELECT * FROM StoreCategories
SELECT * FROM StoreCategoryItems
```

### Issue: Auto-Generate doesn't create categories
**Solution:** Ensure items exist in StoreItems table
```bash
SELECT COUNT(*) as ItemCount FROM StoreItems WHERE IsActive = 1
```

### Issue: Add to category fails
**Solution:** Check browser console for error message
```javascript
// Open DevTools (F12) → Console tab
// Look for error messages from API calls
```

### Issue: Suggestions don't show
**Solution:** Make sure items have proper names/descriptions for keyword matching

---

## 📈 API Testing with curl

### Get All Categories
```bash
curl http://localhost:5000/api/store/categories
```

### Create Category
```bash
curl -X POST http://localhost:5000/api/store/categories \
  -H "Content-Type: application/json" \
  -d '{
    "CategoryName": "Electronics",
    "Description": "Electronic devices and gadgets",
    "CategoryIcon": "⚡"
  }'
```

### Get AI Suggestions
```bash
curl http://localhost:5000/api/store/categories/ai/suggest
```

### Auto-Generate Categories
```bash
curl -X POST http://localhost:5000/api/store/categories/ai/auto-generate
```

### Add Item to Category
```bash
curl -X POST http://localhost:5000/api/store/categories/items/add \
  -H "Content-Type: application/json" \
  -d '{
    "ItemID": 1,
    "CategoryID": 1
  }'
```

---

## ✅ Verification Checklist

- [ ] Database tables created successfully
- [ ] Backend server starts without errors
- [ ] Frontend loads Categories tab
- [ ] Can create new category manually
- [ ] Auto-Generate creates categories from items
- [ ] Can view category details
- [ ] Can add items to categories
- [ ] Can remove items from categories
- [ ] AI suggestions display correctly
- [ ] All buttons responsive and functional

---

## 🎯 Expected Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Blinkit-style category grid | ✅ Ready | Categories tab |
| AI categorization algorithm | ✅ Ready | Backend |
| Category detail management | ✅ Ready | View button on cards |
| Auto-generate categories | ✅ Ready | Header button |
| Item-to-category assignment | ✅ Ready | Detail view |
| AI suggestions display | ✅ Ready | Detail view |
| Database persistence | ✅ Ready | SQL Server |
| Responsive design | ✅ Ready | All screen sizes |

---

## 📞 Next Steps

1. ✅ Setup database tables (run setup script)
2. ✅ Start both frontend and backend servers
3. ✅ Navigate to Categories tab
4. ✅ Try Auto-Generate to create categories from items
5. ✅ Click View on any category to manage items
6. ✅ Test adding/removing items
7. ✅ Review AI suggestions

All systems are ready to use! 🚀
