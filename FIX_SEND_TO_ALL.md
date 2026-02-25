# Fix: Send to All Notifications - Database Schema Update

## Problem
The notifications table has `uid` column as NOT NULL, but "Send to All" feature needs to insert records with `uid = NULL`.

## Solution
Update the database schema to allow NULL values in the `uid` column.

## Steps to Fix

### Step 1: Stop the running backend server
If your backend is currently running, stop it first (Ctrl+C in the terminal).

### Step 2: Run the migration script
```bash
cd "C:\Users\karti\OneDrive\Desktop\RADHA SWAMI\Backend"
node migrate_notifications.js
```

### Step 3: Restart the backend
```bash
npm start
```

### Step 4: Test Send to All
1. Login as admin
2. Go to Notifications page
3. Check "Send to ALL Users"
4. Fill in the message
5. Click "Send Notification"
6. It should work without database errors!

## What Changed
- `uid` column: Changed from `NOT NULL` to `NULL`
- Now allows storing notifications meant for all users with `uid = NULL` and `send_to_all = 1`
- GET endpoint still works: retrieves notifications where `uid = current_user OR send_to_all = 1`

## Files Updated
- `Backend/migrate_notifications.js` - New migration script
- `Backend/create_notifications_table.js` - Updated to allow NULL uid

## Quick Fix (If script doesn't work)
Run this directly in SQL Server Management Studio:

```sql
ALTER TABLE notifications 
ALTER COLUMN uid NVARCHAR(50) NULL;
```

Or drop and recreate:

```sql
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
  id INT PRIMARY KEY IDENTITY(1,1),
  uid NVARCHAR(50) NULL,
  title NVARCHAR(200) NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  type NVARCHAR(50) DEFAULT 'general',
  [read] BIT DEFAULT 0,
  send_to_all BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  created_by NVARCHAR(50),
  INDEX idx_uid (uid),
  INDEX idx_send_to_all (send_to_all),
  INDEX idx_created_at (created_at)
);
```

## Verification
After running the migration, check:
```sql
SELECT COLUMN_NAME, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'uid';
```

Should show: `IS_NULLABLE = YES`
