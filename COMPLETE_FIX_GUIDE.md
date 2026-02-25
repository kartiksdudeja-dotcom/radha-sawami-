# 🔧 Complete Fix Guide - Categories 404 Error

## ⚠️ Current Issue
Backend is returning 404 (HTML error page) instead of API response (JSON)

**Symptoms:**
```
Failed to load resource: the server responded with a status of 404
SyntaxError: Unexpected token '<', "<!DOCTYPE "
```

This means the API endpoint is not found.

---

## ✅ Step-by-Step Fix (Do ALL Steps!)

### STEP 1️⃣: Stop Everything
Open PowerShell and run:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
```

**Expected:** All node processes killed

---

### STEP 2️⃣: Setup Database Tables
```powershell
cd "c:\Users\karti\OneDrive\Desktop\RADHA SWAMI\Backend"
node setup_category_tables.js
```

**Expected Output:**
```
✅ StoreCategories table ready
✅ StoreCategoryItems table ready
✅ StoreCategoryMappings table ready
✨ All category tables created successfully!
✅ Database setup complete
```

**If you see errors:**
- Check SQL Server is running
- Verify database name is "RSPortal"
- Check connection credentials in `.env` file

---

### STEP 3️⃣: Verify Backend Routes File
Check that routes are in correct order. Run this:

```powershell
cd "c:\Users\karti\OneDrive\Desktop\RADHA SWAMI\Backend"
# View the routes file
Get-Content routes/storeRoutes-new.js -TotalCount 70 | Select-Object -Last 20
```

**Expected to see (bottom of file):**
```
router.get("/categories/ai/suggest", ...);
router.post("/categories/ai/auto-generate", ...);
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.get("/categories/:categoryId/items", ...);
export default router;
```

---

### STEP 4️⃣: Start Backend with Logging
```powershell
cd "c:\Users\karti\OneDrive\Desktop\RADHA SWAMI\Backend"
npm start
```

**Wait for these messages:**
```
✅ Connected to SQL Server: RSPortal
✅ Radha Swami Backend is running!
🖥️  Local: http://localhost:5000
```

**Do NOT proceed if you see errors. Share the error here.**

---

### STEP 5️⃣: Test Backend API (in new PowerShell window)
```powershell
# Test health check
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content

# Test categories endpoint
Invoke-WebRequest -Uri "http://localhost:5000/api/store/categories" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Output:**
```json
{"status":"✅ Server is running","timestamp":"2025-12-27T..."}
{"success":true,"data":[],"count":0}
```

**If 404:** Backend routes not loaded. Check console for errors.

---

### STEP 6️⃣: Start Frontend
Open a new PowerShell window:
```powershell
cd "c:\Users\karti\OneDrive\Desktop\RADHA SWAMI\Frontend"
npm start
```

**Wait for:**
```
✅ Vite v... ready in ... ms
➜  Local:   http://localhost:3000/
```

---

### STEP 7️⃣: Test in Browser
1. Open `http://localhost:3000`
2. Go to Store Admin → Categories tab
3. Click "➕ Add Category"
4. Fill in:
   - Icon: 💊
   - Name: Medicine
   - Description: Medical products
5. Click "Create Category"

**Expected:** Success notification "Category saved!"

---

## 🚨 If Still Getting 404

### Check 1: Are database tables created?
```sql
-- Open SQL Server Management Studio
-- Connect to: localhost\RSPortal

SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE 'Store%';

-- Should show:
-- StoreCategories
-- StoreCategoryItems
-- StoreCategoryMappings
```

**If tables don't exist:** Run Step 2 again

---

### Check 2: Is Backend serving correct routes?
In backend console, you should see logged requests:
```
GET /api/store/categories
POST /api/store/categories
```

**If not showing:** Restart backend (Step 4)

---

### Check 3: Check Backend Logs for Errors
Look at terminal where you ran `npm start`

**Common errors:**
```
Error: Table 'StoreCategories' not found
→ Solution: Run setup_category_tables.js

Error: connect ECONNREFUSED
→ Solution: SQL Server not running, start it

Error: Cannot find module 'sql'
→ Solution: npm install in Backend folder
```

---

### Check 4: Verify Network in Browser
Open DevTools (F12) → Network tab
1. Click "Add Category"
2. Watch for `POST localhost:5000/api/store/categories`
3. Click it → See Request/Response

**Response should be JSON, not HTML**

---

## 🔍 Detailed Troubleshooting

### Scenario 1: Database tables don't exist
```powershell
cd Backend
node setup_category_tables.js
```

### Scenario 2: Backend not started
```powershell
npm start  # in Backend folder
# Wait for "✅ Backend is running!"
```

### Scenario 3: Routes file corrupted
Edit `Backend/routes/storeRoutes-new.js`, ensure it has:

```javascript
// ==================== AI-POWERED CATEGORIES ====================
// AI routes FIRST (before :categoryId parameter routes)
router.get("/categories/ai/suggest", suggestCategoriesForItems);
router.post("/categories/ai/auto-generate", autoGenerateCategories);

// Then category CRUD routes
router.get("/categories", getAllCategories);
router.post("/categories", createCategory);

// Then category-specific routes (with :categoryId parameter)
router.get("/categories/:categoryId/items", getItemsByCategory);

// Item-category association routes
router.post("/categories/items/add", addItemToCategory);
router.post("/categories/items/remove", removeItemFromCategory);

export default router;
```

### Scenario 4: Frontend API config wrong
Check `Frontend/src/config/apiConfig.js`:

```javascript
export const API_BASE_URL = "http://localhost:5000";
```

If it's different, update it!

---

## ✅ Complete Checklist

After all steps, verify:

- [ ] SQL Server running
- [ ] Database "RSPortal" exists
- [ ] Tables created (StoreCategories, StoreCategoryItems, StoreCategoryMappings)
- [ ] Backend running on port 5000
- [ ] Backend health check returns JSON
- [ ] Backend categories endpoint returns JSON
- [ ] Frontend running on port 3000
- [ ] Categories tab shows in UI
- [ ] Can create category without errors
- [ ] Category appears in database

---

## 🎯 Quick Command Reference

**Kill all node processes:**
```powershell
Get-Process -Name node | Stop-Process -Force
```

**Setup database:**
```powershell
cd Backend && node setup_category_tables.js
```

**Start backend:**
```powershell
cd Backend && npm start
```

**Start frontend:**
```powershell
cd Frontend && npm start
```

**Test API:**
```powershell
curl http://localhost:5000/api/store/categories
```

---

## 📝 Order of Execution

1. Stop all processes
2. Setup database tables
3. Verify tables exist
4. Start backend (wait for success)
5. Test backend API
6. Start frontend
7. Test in browser
8. Create category

**Do not skip steps!**

---

## 🆘 If Still Not Working

Share with me:
1. Output from `node setup_category_tables.js`
2. Output from backend `npm start`
3. Result of health check test
4. Screenshot of browser console errors

I'll diagnose from there!

---

## 🎉 Expected Result

After all steps:
- ✅ No 404 errors
- ✅ No JSON parse errors
- ✅ Categories save to database
- ✅ Can create, view, edit, delete categories
- ✅ Can add items to categories
- ✅ All data persists across page refresh

Good luck! Follow all steps in order! 🚀
