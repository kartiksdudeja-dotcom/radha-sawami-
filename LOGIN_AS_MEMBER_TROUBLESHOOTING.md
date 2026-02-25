# Login as Member - Troubleshooting Guide

## Problem: "No members found" or Search Not Working

### Quick Diagnosis

1. **Open Browser Console** (F12 → Console tab)
2. **Look for these messages:**
   - ✅ "📥 Loading members from: http://localhost:5000/api/members"
   - ✅ "✅ Members response:"
   - ✅ "📊 Loaded XXX members"

### If you see "Loaded 0 members" or ERROR messages

---

## Solution Steps

### Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Expected: {"status":"✅ Server is running",...}
```

### Step 2: Check Members Endpoint Directly

```bash
# Test the /api/members endpoint
curl http://localhost:5000/api/members | jq . | head -100

# Should see: {"success":true,"data":[...members...]}
```

### Step 3: Check Database Connection

```bash
# In Backend directory, check database
node -e "import { getPool } from './config/db.js'; getPool().then(p => p.request().query('SELECT COUNT(*) as count FROM MemberDetails').then(r => console.log('Members in DB:', r.recordset[0].count)))"
```

### Step 4: Run Debug Script

```bash
cd Backend
node test_members_debug.js

# Output should show:
# - Response Status: 200 OK
# - Total Members: 709
# - Sample member structure
# - Search test results
```

---

## If Search Still Not Working

### Check Member Data Structure

The search looks for these fields:

```javascript
[
  m.name,
  m.Name, // Member name
  m.username,
  m.UserName, // Username
  m.number,
  m.Number, // Member number
  m.uid,
  m.UID, // Unique ID
  m.email,
  m.Email, // Email
  m.memberid,
  m.MemberID, // Member ID
  m.gender,
  m.Gender, // Gender
  m.status,
  m.Status, // Status
];
```

### Example: Search "Khanna"

Should find members where any field contains "khanna" (case-insensitive):

- Name: "Khanna Singh" ✓
- Username: "khanna.user" ✓
- Email: "info@khanna.com" ✓

---

## Common Issues & Fixes

### Issue 1: "No members available"

**Cause:** Members not loaded from database
**Fix:**

1. Check browser console for errors
2. Verify `/api/members` endpoint responds
3. Check database connection in Backend/config/db.js
4. Restart backend: `npm start`

### Issue 2: "No members found" when searching

**Cause:** Search filter not matching member names
**Fixes:**

1. Try searching by different field (ID, username, email)
2. Check exact spelling
3. Try partial match (e.g., "khan" instead of "khanna")
4. Check browser console for search results: "🔍 Search... found X results"

### Issue 3: Modal doesn't open or closes immediately

**Cause:**

- User is not admin (is_admin = false)
- JavaScript error
  **Fix:**

1. Check console for errors (F12)
2. Verify user.is_admin = true in console:
   ```javascript
   // In browser console:
   JSON.parse(localStorage.getItem("user"));
   // Should show: {id: 1, name: "...", is_admin: true}
   ```

### Issue 4: "Failed to load members: ..."

**Cause:** Network or API error
**Fix:**

1. Check backend is running: `npm start` in Backend/
2. Verify port 5000 is not blocked
3. Check CORS settings in server.js
4. Try in Incognito mode to avoid caching

---

## Test the Full Flow

### Step-by-Step Test

1. **Start Backend**

   ```bash
   cd Backend
   npm start
   ```

2. **Open Frontend in Browser**

   ```
   http://localhost:3000
   ```

3. **Login as Admin**

   - Ensure you have admin account (is_admin = true)
   - Check localStorage shows `is_admin: true`

4. **Click "🔑 Login As Member" Button**

   - Should appear below "Reports" in sidebar
   - Should not be grayed out (if admin)

5. **Check Browser Console**

   - Should show: "📥 Loading members..."
   - Then: "✅ Members response..."
   - Then: "📊 Loaded XXX members"

6. **Type in Search Box**

   - Try typing a known member name
   - Should see: "🔍 Search... found X results"
   - Members should appear in list

7. **Click a Member**
   - Should show alert: "✅ Logged in as [Name]"
   - Should reload page
   - Should now be logged as that member

---

## Advanced Debugging

### Enable Detailed Logging

**Frontend Console (Browser)**

```javascript
// Paste in browser console to see raw data
fetch("http://localhost:5000/api/members")
  .then((r) => r.json())
  .then((data) => {
    console.log("Total Members:", data.data.length);
    console.log("First 5 Members:", data.data.slice(0, 5));
    console.log(
      'Search Test - "khanna":',
      data.data.filter((m) =>
        String(m.name || m.Name)
          .toLowerCase()
          .includes("khanna")
      )
    );
  });
```

**Backend Logs**
Check Backend console for errors:

```
✅ Server is running
📊 Fetched XXX members, returned YYY (removed ZZZ duplicates)
```

---

## Database Verification

### Check Members Table

```sql
-- In SQL Server Management Studio
SELECT COUNT(*) as total_members FROM MemberDetails;

-- See member names
SELECT TOP 10 UserID, Name, UserName, Number FROM MemberDetails ORDER BY UserID;

-- Search for a specific member
SELECT * FROM MemberDetails WHERE Name LIKE '%Khanna%';
```

---

## If Nothing Works

1. **Clear Cache & Cookies**

   - DevTools → Application → Clear Storage
   - Or use Incognito mode

2. **Restart Everything**

   ```bash
   # Kill backend
   taskkill /F /IM node.exe

   # Restart backend
   cd Backend && npm start

   # Refresh frontend page
   F5 or Ctrl+R
   ```

3. **Check Network Tab**

   - DevTools → Network tab
   - Click "Login as Member" button
   - Look for `/api/members` request
   - Check Response tab for data

4. **Enable Network Debugging**
   ```javascript
   // In browser console before opening modal:
   window.fetch = new Proxy(window.fetch, {
     apply(target, thisArg, args) {
       console.log("FETCH:", args[0]);
       return target
         .apply(thisArg, args)
         .then((r) => (console.log("RESPONSE:", r.status), r));
     },
   });
   ```

---

## Performance Notes

- 709 members in database
- Search happens client-side (instant)
- Modal caches members after first load
- Search includes all 22+ fields

---

## Contact / Report Issue

If you're still having issues:

1. **Take a screenshot** of the browser console showing the error
2. **Run the debug script**: `node test_members_debug.js`
3. **Check Backend logs** for error messages
4. **Verify Database** connection with SQL query above

---

**Last Updated**: December 29, 2025
**Feature Version**: 2.0 (Improved Search & Design)
