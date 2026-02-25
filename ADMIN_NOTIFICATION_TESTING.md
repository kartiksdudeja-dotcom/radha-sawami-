# Admin Notification Feature - Quick Testing Guide

## What Was Added

An admin-only form on the Notification page that allows administrators to send notifications to specific users.

## Key Features

### ✅ Admin Detection
- Reads `is_admin` flag from localStorage (user object)
- Form only shows if admin is logged in

### ✅ Send Notification Form
Only visible to admins. Includes:
- User ID field (who to send to)
- Message Type dropdown (general, attendance, seva, store, event)
- Title field (max 100 characters)
- Body textarea (max 500 characters)
- Push notification toggle
- Send button with loading state

### ✅ Status Feedback
- Success message: Green notification shows "Message sent to [userID]"
- Error message: Red notification shows error details
- Loading state: Button shows "⏳ Sending..." while sending

### ✅ Auto Reset
- Form clears after successful send
- Notifications list refreshes automatically

## How to Test

### 1. Setup Test Admin User
Before testing, ensure your test account has `is_admin: true` in the database:

```sql
UPDATE users SET is_admin = 1 WHERE id = 'your-admin-id';
```

Or in localStorage (for testing):
```javascript
// Open browser console
let user = JSON.parse(localStorage.getItem('user'));
user.is_admin = true;
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

### 2. Test as Admin
1. Login with admin account
2. Go to Notifications page (click 🔔 in navbar)
3. **Verify**: See purple "Send Notification (Admin)" form at the top
4. Fill out form:
   - User ID: any user ID in your system
   - Message Type: Select one (e.g., "General")
   - Title: "Test Admin Message"
   - Body: "This is a test notification from admin"
   - Push Notification: Leave checked
5. Click "Send Notification" button
6. **Verify**: See green success message "✅ Message sent to [userID]"
7. **Verify**: Form resets (all fields clear)

### 3. Test as Regular User
1. Login with regular (non-admin) user
2. Go to Notifications page
3. **Verify**: Admin form is NOT visible
4. Only see notifications list

### 4. Test Error Handling
1. As admin, try sending without filling fields
2. **Verify**: See error "⚠️ Please fill all fields"
3. Send to non-existent user ID
4. **Verify**: See error from API response

### 5. Test Recipient Receives
1. Send notification as admin from one account
2. Open another browser tab/window with recipient account
3. Go to Notifications page
4. **Verify**: See the notification that was just sent
5. Can mark as read and delete it

## Code Location

**Component File**: `Frontend/src/pages/Notification.jsx`
- Lines 245-295: `sendNotificationMessage()` function
- Lines 367-456: Admin form JSX

**Styling File**: `Frontend/src/styles/Notification.css`
- Lines 433-619: All admin section styles

**API Endpoint**: `Backend/notification_routes.js`
- Lines 145-206: POST /api/notifications/send endpoint
- Includes admin verification middleware

## Form Fields Breakdown

| Field | Type | Required | Max Length | Default |
|-------|------|----------|-----------|---------|
| User ID | Text input | ✅ Yes | - | Empty |
| Message Type | Dropdown | ✅ Yes | - | general |
| Title | Text input | ✅ Yes | 100 | Empty |
| Body | Textarea | ✅ Yes | 500 | Empty |
| Send Push | Checkbox | ❌ No | - | Checked |

## API Details

### Endpoint
```
POST /api/notifications/send
```

### Request Body
```json
{
  "user_id": "user123",
  "title": "Notification Title",
  "message": "Notification body content",
  "type": "general",
  "sendPush": true,
  "is_admin": true
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "notification": {
    "id": "notif_123",
    "user_id": "user123",
    "title": "Notification Title",
    "message": "Notification body content",
    "type": "general",
    "read": false,
    "created_at": "2024-01-15T10:30:45Z"
  }
}
```

### Error Responses
- **400**: Missing required fields
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (not admin)
- **500**: Server error

## Styling Overview

### Color Scheme
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Success**: Green (#d4edda background, #155724 text)
- **Error**: Red (#f8d7da background, #721c24 text)
- **Borders**: Light gray (#e0e0e0)

### Form Layout
- Desktop: 2 columns (responsive)
- Tablet: 1-2 columns
- Mobile: 1 column full-width

### Interactive Elements
- Hover effects on button
- Focus states on inputs (blue outline)
- Loading animation on button (pulsing)
- Smooth transitions (0.3s)

## Browser Console Testing

Monitor these in the browser console while testing:

```javascript
// Check if admin detected
console.log('Admin:', localStorage.getItem('user')); 
// Should show is_admin: true

// Check API call
// Open Network tab to see POST to /api/notifications/send
// Check response for success flag
```

## Common Issues & Solutions

### Issue: Admin form not showing
**Solution**: 
- Check localStorage has `is_admin: true`
- Refresh page after updating user
- Check browser console for errors

### Issue: "Please fill all fields" error
**Solution**:
- Ensure ALL fields have values
- Title and User ID can't be whitespace only
- Body needs content

### Issue: Error "Failed: Not authorized"
**Solution**:
- Verify backend has admin protection
- Check `is_admin` flag in request body
- Ensure token/session is valid

### Issue: Message not delivered to recipient
**Solution**:
- Verify user ID is correct
- Check recipient's notification page refreshes
- Monitor browser console for errors
- Check backend logs

## Performance Notes

- Form loads instantly (no API call)
- Admin detection happens once on mount
- Notifications reload after successful send (2 API calls total)
- No caching issues

## Next Steps After Testing

1. Test on actual mobile devices
2. Load test with multiple simultaneous sends
3. Test recipient notification permissions
4. Monitor push notification delivery
5. Gather user feedback on UX/styling
