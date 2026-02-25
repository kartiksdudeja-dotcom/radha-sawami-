# API Testing Guide

## System Status
- **Frontend**: http://localhost:3000 (Vite React)
- **Backend**: http://localhost:5000 (Express.js)
- **Database**: SQL Server - RSPortal_Server
- **Total Members**: 1504

---

## Test Credentials
```
Username: SSK2009010208730
Password: 1986-04-19
is_admin: true
```

---

## API Endpoints

### 1. Authentication
**Endpoint**: `POST /api/auth/login`
```
Request:
{
  "username": "SSK2009010208730",
  "password": "1986-04-19"
}

Expected Response:
{
  "success": true,
  "user": {
    "id": 1,
    "name": "User Name",
    "username": "SSK2009010208730",
    "is_admin": true
  }
}
```

### 2. Members List
**Endpoint**: `GET /api/members`
```
Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Member Name",
      "username": "username",
      "email": "email@example.com",
      "gender": "Male/Female",
      "dob": "1990-01-15",
      "branch": "Branch Name",
      "region": "Region Name",
      ...
    },
    ...
  ]
}

Expected: 1504 members from database
```

### 3. Attendance Records
**Endpoint**: `GET /api/attendance`
```
Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "DD/MM/YYYY",
      "time": "09:00",
      "shift": "Morning/Evening",
      "category": "Category Name",
      "members": [
        {
          "id": 1,
          "name": "Member Name",
          "category": "Video Satsang (DB/MPG)",
          "stat_category": "Initiated",
          "gender": "Male/Female"
        }
      ]
    }
  ]
}

Expected: 1000+ attendance records
```

### 4. Seva Records
**Endpoint**: `GET /api/seva` or `GET /api/seva/report`
```
Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberName": "Member Name",
      "category": "seva-mahila/seva-youth/seva-bag/seva-copy",
      "sevaType": "Seva Type",
      "hours": 5.5,
      "cost": 100,
      "date": "DD/MM/YYYY"
    }
  ]
}
```

### 5. Health Check
**Endpoint**: `GET /api/health`
```
Expected Response:
{
  "success": true,
  "message": "API is healthy"
}
```

---

## Frontend Pages to Test

### 1. Login Page
- ✅ Enter credentials: `SSK2009010208730 / 1986-04-19`
- ✅ Should redirect to Dashboard
- ✅ Check console for login API response

### 2. Members Page
- ✅ Should load 1504 members from database
- ✅ Display member cards with avatar
- ✅ Search functionality works
- ✅ Check console: "📊 Members loaded: 1504"

### 3. Attendance Page
- ✅ Should load attendance records
- ✅ Display submitted records grouped by date
- ✅ Show member details in each record
- ✅ Check console: "📡 Response status: 200"

### 4. Branch Page
- ✅ Should load attendance records
- ✅ Display statistics by category and gender
- ✅ Show records grouped by date
- ✅ Filter by date and category

### 5. Member Master Page (Admin Only)
- ✅ Should load members list
- ✅ Display all 1504 members
- ✅ Show edit/delete buttons
- ✅ Add/Edit member functionality
- ✅ Check console: "✅ Fetch result: {success: true, data: [...]}"

### 6. Reports Page
- ✅ Attendance Report: Should show attendance data
- ✅ Seva Entry Report: Should show seva data
- ✅ Export to CSV functionality
- ✅ Date range filtering
- ✅ Check console logs for API calls

---

## Console Logging to Check

### Members.jsx
```
🔄 Fetching members from: http://localhost:5000/api/members
📡 Response status: 200
✅ API Response: {success: true, data: [...]}
📊 Members loaded: 1504
```

### MemberMaster.jsx
```
Fetching members from: http://localhost:5000/api/members
Response status: 200
Fetch result: {success: true, data: [...]}
Members loaded: 1504
```

### Attendance.jsx
```
Fetching members from: http://localhost:5000/api/members
Members response: 200
Members loaded: 1504
Attendance records loaded: XXXX
```

### Reports.jsx
```
🔄 Fetching attendance from: http://localhost:5000/api/attendance
📡 Response status: 200
📊 Total attendance records from DB: XXXX
📅 Filtered records in date range: XXXX
📝 Expanded rows (one per member): XXXX
```

---

## How to Debug

1. **Open Browser DevTools**: Press `F12` or `Ctrl+Shift+I`
2. **Go to Console Tab**: Check for error messages
3. **Check Network Tab**: 
   - Click on API calls (e.g., `/api/members`)
   - Check Response to see actual data structure
4. **Monitor Console Logs**:
   - Login → Check user object
   - Navigate to Members → Check console logs
   - Navigate to Reports → Check API response

---

## Expected Data Counts
- **Members**: 1504
- **Attendance Records**: 1000+ (December 2023)
- **Seva Records**: Variable (depends on entries)

---

## Troubleshooting

### No data showing?
1. Check backend is running: `http://localhost:5000/api/health`
2. Check API response in Network tab
3. Check console for error messages
4. Verify SQL Server connection: `netstat -ano | findstr "1433"`

### Login fails?
1. Check credentials in console
2. Verify backend /api/auth/login returns 200
3. Check SQL Server is accessible

### Pages blank?
1. Check console for JavaScript errors
2. Check API response structure matches expectations
3. Verify null safety fixes are applied

