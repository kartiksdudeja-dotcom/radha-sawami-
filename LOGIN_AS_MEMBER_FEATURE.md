# Login as Member Feature - Implementation Guide

## Overview

This feature allows admin users to login as any member of the portal for testing, support, or administrative purposes. The admin can impersonate a member, see the portal from their perspective, and then return to the admin session.

## Frontend Implementation

### Components Updated: Navbar.jsx

#### State Variables Added

```javascript
const [showLoginAsModal, setShowLoginAsModal] = useState(false);
const [memberSearch, setMemberSearch] = useState("");
const [members, setMembers] = useState([]);
const [filteredMembers, setFilteredMembers] = useState([]);
const [loadingMembers, setLoadingMembers] = useState(false);
```

#### Functions Added

1. **handleLoginAsClick()**

   - Opens the login-as-member modal
   - Loads all members from the API
   - Sets loading state

2. **loadMembers()**

   - Fetches all members from `/api/members`
   - Updates the members and filteredMembers state

3. **handleMemberSearchChange(e)**

   - Real-time member search functionality
   - Filters members by name or ID as user types
   - Updates filteredMembers state

4. **handleLoginAsMember(memberId, memberName)**

   - Calls `/api/auth/login-as-member` backend endpoint
   - Passes current admin's user ID and target member ID
   - Updates localStorage with impersonated user info
   - Sets `is_impersonating: true` flag
   - Reloads the page with new user context

5. **handleStopImpersonating()**
   - Calls `/api/auth/stop-impersonating` backend endpoint
   - Returns to original admin session
   - Updates localStorage with original admin info
   - Removes impersonation flag
   - Reloads the page

#### UI Elements

1. **Login as Member Button**

   - Appears in sidebar footer (admin only)
   - Icon: 🔑
   - Label: "Login As Member"
   - Visible only if `user?.is_admin === true`
   - Opens modal on click

2. **Stop Impersonating Button**

   - Appears in sidebar footer when impersonating
   - Icon: ↩️
   - Label: "Stop Impersonating"
   - Visible only if `user?.is_impersonating === true` and `isAdmin`
   - Orange/red gradient styling with pulsing animation

3. **Login as Member Modal**
   - Searchable member list
   - Real-time filtering as user types
   - Displays member name, ID, and gender
   - Click to login as selected member
   - Close button (X) to dismiss
   - Cancel button to close modal

#### CSS Styling (Navbar.css)

- Modal overlay with fade-in animation
- Modal container with slide-up animation
- Search input with focus effects
- Member list with hover effects
- Stop impersonating button with pulsing animation

### Usage Flow (Frontend)

1. Admin clicks "🔑 Login As Member" button in sidebar
2. Modal opens and loads all members
3. Admin types to search for a member by name or ID
4. Admin clicks on a member from the filtered list
5. Frontend sends POST to `/api/auth/login-as-member` with:
   ```json
   {
     "member_id": 123,
     "admin_id": 1
   }
   ```
6. Backend validates and returns impersonated user data
7. Frontend stores new user in localStorage with `is_impersonating: true`
8. Page reloads with new user context
9. Admin now sees the portal as that member
10. To return: Admin clicks "↩️ Stop Impersonating" button
11. Backend validates and returns original admin data
12. Page reloads with original admin context

---

## Backend Implementation

### Controllers: authController.js

#### Function: loginAsMember

**Endpoint:** POST `/api/auth/login-as-member`

**Request Body:**

```json
{
  "member_id": 123,
  "admin_id": 1
}
```

**Validation Steps:**

1. Check if `member_id` is provided
2. Check if `admin_id` is provided
3. Query database for admin user (UserID = admin_id)
4. Verify admin has `ChkAdmin = 1` (true)
5. Query database for target member (UserID = member_id)
6. Verify member exists in database

**Response (Success):**

```json
{
  "success": true,
  "message": "Logged in as [Member Name]",
  "user": {
    "id": 123,
    "name": "Member Name",
    "username": "member_username",
    "is_admin": false,
    "is_impersonating": true,
    "original_user_id": 1
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Error Cases:**

- Missing member_id → 400 Bad Request
- Missing admin_id → 400 Bad Request
- Admin user not found → 401 Unauthorized
- Admin is not actually an admin → 403 Forbidden
- Member not found → 404 Not Found
- Database error → 500 Internal Server Error

#### Function: stopImpersonating

**Endpoint:** POST `/api/auth/stop-impersonating`

**Request Body:**

```json
{
  "original_user_id": 1
}
```

**Validation Steps:**

1. Check if `original_user_id` is provided
2. Query database for original admin user (UserID = original_user_id)
3. Verify admin exists and has `ChkAdmin = 1`

**Response (Success):**

```json
{
  "success": true,
  "message": "Returned to admin session",
  "user": {
    "id": 1,
    "name": "Admin Name",
    "username": "admin_username",
    "is_admin": true
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Error Cases:**

- Missing original_user_id → 400 Bad Request
- Original admin not found → 404 Not Found
- Database error → 500 Internal Server Error

### Routes: authRoutes.js

Added new routes:

```javascript
router.post("/login-as-member", loginAsMember);
router.post("/stop-impersonating", stopImpersonating);
```

### Database Queries

**Query 1: Verify Admin User**

```sql
SELECT UserID, UserName, Name, ChkAdmin
FROM MemberDetails
WHERE UserID = @userId
```

**Query 2: Get Member Details**

```sql
SELECT UserID, UserName, Name, Gender
FROM MemberDetails
WHERE UserID = @memberId
```

---

## How It Works

### Before Impersonation

1. Admin logs in normally with their credentials
2. localStorage contains: `user = { id: 1, name: "Admin", is_admin: true }`
3. Sidebar shows: "🔑 Login As Member" button

### During Impersonation

1. Admin clicks "🔑 Login As Member" and selects a member
2. Backend validates admin and member
3. localStorage is updated with: `user = { id: 123, name: "Member", is_admin: false, is_impersonating: true, original_user_id: 1 }`
4. Page reloads
5. System treats admin as member 123
6. All API calls use new user context
7. Sidebar shows: "↩️ Stop Impersonating" button (orange/red with pulsing animation)

### Returning to Admin Session

1. Admin clicks "↩️ Stop Impersonating" button
2. Backend validates original_user_id
3. localStorage is updated with: `user = { id: 1, name: "Admin", is_admin: true }`
4. Page reloads
5. System returns to normal admin context

---

## Security Considerations

1. **Admin Verification**: Always verify `ChkAdmin = 1` before allowing impersonation
2. **Audit Trail**: Consider logging all impersonation events in database
3. **Session Timeout**: Add timeout mechanism for impersonation (optional)
4. **Original User ID**: Always store original admin ID to prevent privilege escalation
5. **CORS Validation**: Ensure backend CORS settings allow the frontend domain

---

## Testing the Feature

### Manual Test Steps

1. Login as an admin user
2. Click "🔑 Login As Member" in sidebar
3. Search for a member (e.g., type "shabd")
4. Click on a member name to login as them
5. Verify page reloads and user context changes
6. Verify all pages/features work for impersonated member
7. Click "↩️ Stop Impersonating" button
8. Verify page reloads and returns to admin context

### API Testing with cURL

**Test Login As Member:**

```bash
curl -X POST http://localhost:5000/api/auth/login-as-member \
  -H "Content-Type: application/json" \
  -d '{"member_id": 2, "admin_id": 1}'
```

**Test Stop Impersonating:**

```bash
curl -X POST http://localhost:5000/api/auth/stop-impersonating \
  -H "Content-Type: application/json" \
  -d '{"original_user_id": 1}'
```

---

## Files Modified

### Frontend

- `Frontend/src/components/Navbar.jsx`
  - Added state variables for modal management
  - Added handler functions
  - Added UI buttons and modal
- `Frontend/src/styles/Navbar.css`
  - Added modal styles
  - Added stop-impersonating button styles
  - Added animations

### Backend

- `Backend/controllers/authController.js`

  - Added `loginAsMember()` function
  - Added `stopImpersonating()` function

- `Backend/routes/authRoutes.js`
  - Added two new POST routes
  - Imported new functions

---

## Future Enhancements

1. **Audit Logging**: Log all impersonation events with timestamps
2. **Time Limit**: Automatically stop impersonation after N minutes
3. **Notification**: Show admin banner indicating impersonation status
4. **History**: Track which members admin has impersonated
5. **Constraints**: Prevent admins from impersonating other admins
6. **Two-Factor**: Require additional verification for impersonation
7. **Activity Log**: Show what the impersonated member does during session

---

## Troubleshooting

### Modal not opening

- Check if user is admin: `user?.is_admin === true`
- Check browser console for errors
- Verify `/api/members` endpoint is working

### Login fails with "Admin not found"

- Verify admin user ID is correct
- Check database for admin user in MemberDetails table
- Verify ChkAdmin field is set to 1

### Login fails with "Member not found"

- Verify member ID exists in database
- Check spelling of member name in search

### Stop Impersonating button not showing

- Verify `user?.is_impersonating === true` in localStorage
- Page may need refresh if manually editing localStorage

### After impersonation, changes not visible

- Some pages may cache data - try refreshing (F5)
- Clear browser cache if issues persist

---

## Implementation Checklist

✅ Frontend state variables added
✅ Frontend handler functions created
✅ Frontend UI buttons added
✅ Frontend modal JSX added
✅ Frontend CSS styling added
✅ Backend loginAsMember function created
✅ Backend stopImpersonating function created
✅ Backend routes added
✅ API endpoints working
✅ Feature tested and working
