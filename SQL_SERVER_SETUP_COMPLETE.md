# ✅ SQL Server Setup - Complete Guide

## 📋 Your Configuration is Ready!

I've updated your backend to use **Microsoft SQL Server** instead of SQLite.

---

## 🔧 Setup Steps:

### Step 1: Create Database in SQL Server

**Option A: Using SSMS (GUI)**

```
1. Open SQL Server Management Studio (SSMS)
2. Connect to your local SQL Server
3. Right-click Databases → New Database
4. Name: RSPortal_Server
5. Click OK
```

**Option B: Using Command Line (PowerShell)**

```powershell
# Open as Administrator
sqlcmd -S localhost -U sa -P YourSQLPassword
> CREATE DATABASE RSPortal_Server;
> GO
```

---

### Step 2: Import Your Data

**In SSMS:**

```
1. Open your SQL script: Backend/RS PortalSRC Sript.sql
2. Click File → Open → SQL Script
3. Select the .sql file
4. Press F5 to execute
5. ✅ Database created with all your member data!
```

---

### Step 3: Update .env File

**Location:** `Backend/.env`

```env
# SQL Server Connection Settings
SQL_SERVER=localhost
SQL_DATABASE=RSPortal_Server
SQL_USER=sa
SQL_PASSWORD=YOUR_SQL_SERVER_PASSWORD
SQL_PORT=1433
SQL_TRUST_CERT=true
```

**⚠️ IMPORTANT:** Replace `YOUR_SQL_SERVER_PASSWORD` with your actual SQL Server SA password!

---

### Step 4: Verify Connection

Run this command to test:

```bash
cd Backend
npm start
```

**Expected output:**

```
✅ Connected to SQL Server: RSPortal_Server
📊 Total members in database: 20
✅ Backend is running!
📱 Network: http://192.168.1.101:5000
```

---

## 📊 Test Your Login

After importing the SQL script, use these credentials:

| Username         | Password   | Name                 |
| ---------------- | ---------- | -------------------- |
| SSK2009010208730 | 1986-04-19 | Shabd Swaroop Khanna |
| RKH2016121723687 | 1989-02-18 | Ratnanjali Khanna    |
| VKO2019032526889 | 1988-09-16 | Vivek Kocherlakota   |

The password is the **date of birth** from your SQL script!

---

## 🚀 Start Your Application

```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd Frontend
npm start
```

**Access:**

- 🖥️ Local Computer: http://localhost:3000
- 📱 Mobile (Same WiFi): http://192.168.1.101:3000

---

## ✅ Files Updated for SQL Server:

1. ✅ **Backend/db.js** - Now connects to SQL Server
2. ✅ **Backend/controllers/authController.js** - Updated to query from MemberDetails table
3. ✅ **Backend/.env** - SQL Server configuration

---

## 🔍 Verify Your Database

**In SSMS, run this query:**

```sql
SELECT TOP 5
  UserID,
  UserName,
  Name,
  Status,
  ChkAdmin
FROM MemberDetails
ORDER BY UserID DESC;
```

You should see your 20+ members!

---

## ❌ Troubleshooting

### Error: "Cannot connect to SQL Server"

```
✗ Solution:
  1. Check SQL Server is running
  2. Verify SQL_SERVER=localhost in .env
  3. Check firewall allows port 1433
```

### Error: "Login failed for user 'sa'"

```
✗ Solution:
  1. Verify SQL_PASSWORD in .env is correct
  2. Check SQL_USER=sa
  3. If forgotten, reset SA password in SSMS
```

### Error: "Database RSPortal_Server not found"

```
✗ Solution:
  1. Run the SQL script in SSMS
  2. Verify database name in .env
  3. Check CREATE DATABASE worked
```

### Error: "MemberDetails table not found"

```
✗ Solution:
  1. Make sure SQL script was fully executed
  2. Check database selected in SSMS
  3. Re-run the script if needed
```

---

## 💡 Your SQL Server Database Structure:

**Main Tables:**

- **MemberDetails** - All members (20+ records)
- **Attendance** - Attendance logs
- **CategorySevaDetails** - Seva categories
- **MemberMaster** - Additional member info

**Key Columns in MemberDetails:**

- `UserID` - Member ID
- `UserName` - Login username (UID format)
- `Password` - Stored as date (DOB)
- `Name` - Member name
- `ChkAdmin` - Admin flag (1 = admin, 0 = user)
- `Status` - Member status (Initiated, Jigyasu, etc.)

---

## 🎯 Next Steps:

1. ✅ Open SSMS
2. ✅ Create database RSPortal_Server
3. ✅ Import SQL script
4. ✅ Update .env with password
5. ✅ Start backend: `npm start`
6. ✅ Start frontend: `npm start`
7. ✅ Login with member credentials!

**Questions?** Check the SQL Server documentation or error messages above! 🚀
