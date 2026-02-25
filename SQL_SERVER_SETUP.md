# 🗄️ SQL Server Setup Guide (Instead of SQLite)

## Prerequisites

✅ Microsoft SQL Server installed
✅ SSMS (SQL Server Management Studio) installed
✅ Your SQL script: `RS PortalSRC Sript.sql`

---

## Step 1: Create Database & Import Data

### Option A: Using SSMS (GUI)

1. Open **SQL Server Management Studio (SSMS)**
2. Connect to your local SQL Server
3. Right-click on **Databases** → **New Database**
4. Name it: `RSPortal_Server`
5. Click **OK**
6. Open your SQL script: `RS PortalSRC Sript.sql`
7. Execute the script (F5)

### Option B: Using Command Line

```powershell
# Open PowerShell as Administrator
sqlcmd -S localhost -U sa -P YourPassword
> CREATE DATABASE RSPortal_Server
> GO
> USE RSPortal_Server
> GO
> :r "C:\path\to\RS PortalSRC Sript.sql"
> GO
```

---

## Step 2: Update Backend Configuration

### Create `.env` file in Backend folder:

```env
# SQL Server Configuration
SQL_SERVER=localhost
SQL_USER=sa
SQL_PASSWORD=your_password
SQL_DATABASE=RSPortal_Server
SQL_TRUST_CERT=false
SQL_PORT=1433
```

**Replace:**

- `your_password` - Your SQL Server SA password
- `localhost` - Your SQL Server address (use IP for remote servers)

---

## Step 3: Update Backend Code

### Switch from SQLite to SQL Server

**In [Backend/db.js](Backend/db.js):**

```javascript
// Replace SQLite initialization with SQL Server
import { getPool } from "./config/sqlserver.js";

export async function initializeDatabase() {
  try {
    const pool = await getPool();
    console.log("✅ Connected to SQL Server:", process.env.SQL_DATABASE);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}
```

### Update Controllers to use SQL Server

**In [Backend/controllers/authController.js](Backend/controllers/authController.js):**

```javascript
import { getPool } from "../config/sqlserver.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(
        "SELECT UserID, UserName, Password, ChkAdmin FROM MemberDetails WHERE UserName = @username"
      );

    // ... rest of login logic
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## Step 4: Verify SQL Server Connection

Run this test script:

```bash
cd Backend
node config/sqlserver.js
```

Expected output:

```
✅ Connected to SQL Server: RSPortal_Server
```

---

## Step 5: Access Your Data in SSMS

### View Users

```sql
SELECT TOP 10
  UserID,
  UserName,
  Password,
  Name,
  Gender,
  Status,
  ChkAdmin
FROM MemberDetails
ORDER BY UserID DESC
```

### View Attendance

```sql
SELECT TOP 20
  Attendance_Id,
  Attendance_date,
  UserID,
  Shift,
  PresentTime
FROM Attendance
ORDER BY Attendance_Id DESC
```

---

## ⚠️ Important Notes

1. **SQL Server vs SQLite:**

   - SQLite: Lightweight, file-based (current setup)
   - SQL Server: Professional, enterprise-grade, better for production ✅

2. **Data Types:**

   - SQL Server uses `NVARCHAR` instead of `TEXT`
   - Dates use `DATE` type instead of strings
   - Passwords should be hashed with bcrypt

3. **Connection Pooling:**

   - SQL Server automatically handles connection pooling
   - Much faster than SQLite for concurrent requests

4. **Your Login Credentials from SQL Server:**
   - Username = `UserName` column in MemberDetails
   - Password = `Password` column (store hashed, compare with bcrypt)

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with SQL Server details
# (see Step 2 above)

# 3. Update backend code
# (see Step 3 above - replace SQLite with SQL Server calls)

# 4. Test connection
node config/sqlserver.js

# 5. Start backend
npm start
```

---

## Troubleshooting

### "Cannot connect to SQL Server"

- Check SQL Server is running
- Verify credentials in `.env`
- Check firewall isn't blocking port 1433

### "Database RSPortal_Server not found"

- Run the SQL script in SSMS
- Verify database name matches `.env`

### "Login failed for user 'sa'"

- Check SQL Server SA password
- Verify you're using correct SQL_USER
- Reset SA password if needed

---

## Next Steps

1. ✅ Create SQL Server database
2. ✅ Run the SQL script to import your data
3. ✅ Create `.env` file
4. ✅ Update backend code to use SQL Server
5. ✅ Test connection
6. ✅ Start application

Let me know if you need help with any step! 🚀
