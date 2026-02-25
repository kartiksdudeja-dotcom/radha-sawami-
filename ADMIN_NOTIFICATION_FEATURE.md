# Admin Notification Sending Feature

## Overview
Added admin-only capability to send notifications to specific users via the Notification page. Only administrators can access and use this feature.

## Features Implemented

### 1. Admin Detection
- Automatically detects if logged-in user is admin from localStorage (`user.is_admin`)
- Supports both boolean `true` and string `'true'` formats
- Detection happens on component mount in useEffect

### 2. Admin Form (Conditional Display)
The form is **only visible to admin users** and includes:

#### Input Fields:
- **User ID Input** 👤 - Recipient's user ID (required)
- **Message Type Selector** 📌 - Choose from:
  - 📢 General
  - 📋 Attendance
  - 🙏 Seva
  - 🛒 Store
  - 📅 Event
- **Message Title Input** ✏️ - Title for the notification (max 100 chars)
- **Message Body Textarea** 💬 - Notification content (max 500 chars)
- **Send Push Toggle** 🔔 - Enable/disable push notification
- **Send Button** 📤 - Submits the notification
- **Status Messages** - Shows success/error feedback

### 3. Send Notification Function
```javascript
const sendNotificationMessage = async (e) => {
  // Validates all required fields
  // Makes POST request to /api/notifications/send
  // Includes is_admin: true in request body
  // Shows loading state during sending
  // Displays success/error message
  // Resets form on success
  // Reloads notifications list
}
```

### 4. API Integration
- **Endpoint**: `POST /api/notifications/send`
- **Authentication**: Backend verifies `is_admin` flag
- **Payload**:
  ```json
  {
    "user_id": "user123",
    "title": "Message Title",
    "message": "Message content here",
    "type": "general",
    "sendPush": true,
    "is_admin": true
  }
  ```

## Styling & UX

### Visual Design:
- **Container**: White card with gradient border (purple/blue)
- **Header**: Purple heading with send icon
- **Form Layout**: Responsive grid (2 columns on desktop, 1 on mobile)
- **Inputs**: Modern styled with focus states and disabled states
- **Button**: Gradient background matching app theme with hover effects
- **Status Messages**: 
  - Success: Green background (#d4edda)
  - Error: Red background (#f8d7da)

### Animations:
- Form slides down on load
- Status messages slide up when appearing
- Button pulses while sending
- Smooth transitions on all interactions

### Responsive Design:
- Desktop: 2-column form layout
- Tablet: 1-column layout
- Mobile: Full-width inputs and buttons

## Component State Variables

```javascript
// Admin message form state
const [isAdmin, setIsAdmin] = useState(false);
const [sendToUserId, setSendToUserId] = useState('');
const [messageTitle, setMessageTitle] = useState('');
const [messageBody, setMessageBody] = useState('');
const [messageType, setMessageType] = useState('general');
const [sendPush, setSendPush] = useState(true);
const [sendingMessage, setSendingMessage] = useState(false);
const [sendStatus, setSendStatus] = useState({ type: '', message: '' });
```

## Files Modified

### Frontend/src/pages/Notification.jsx
- Added 9 state variables for admin messaging
- Added `sendNotificationMessage()` async function
- Added admin form JSX section (conditional rendering)
- Component now 525 lines total

### Frontend/src/styles/Notification.css
- Added 200+ lines of admin section styling
- `.admin-section` - Main container
- `.admin-title` - Heading styling
- `.admin-form` - Form layout
- `.form-grid`, `.form-group` - Layout components
- `.form-input`, `.form-select`, `.form-textarea` - Input styling
- `.submit-btn` - Button styling with hover/active states
- `.status-message` - Success/error feedback styling
- `.status-success`, `.status-error` - Message type colors
- Responsive design for mobile devices
- Animations: `slideDown`, `slideUp`, `pulse`

## How to Use

1. **Login as Admin**: Ensure your user account has `is_admin: true` flag
2. **Navigate to Notifications**: Click notifications in navbar or access `/notifications`
3. **Fill Admin Form** (visible only if admin):
   - Enter recipient user ID
   - Select message type
   - Enter title and message body
   - Optionally disable push notification
4. **Send**: Click "Send Notification" button
5. **Feedback**: Success/error message displays immediately
6. **Form Resets**: On success, form clears automatically

## Backend Protection

The `/api/notifications/send` endpoint includes:
- Admin check middleware verifying `is_admin: true` in request
- Returns 403 Forbidden if sender is not admin
- Admin status verified on backend (not trusted from frontend)

## Testing

### Test Case 1: As Admin User
1. Login with admin account
2. Go to Notifications page
3. Verify admin form is visible
4. Fill form and send test notification
5. Verify success message displays
6. Confirm notification appears in recipient's list

### Test Case 2: As Non-Admin User
1. Login with regular user account
2. Go to Notifications page
3. Verify admin form is NOT visible
4. Only see regular notifications

### Test Case 3: API Protection
1. Try to send via API without admin flag
2. Should receive 403 Forbidden error
3. Verify backend protects endpoint

## Success Indicators

✅ Admin form visible only to administrators
✅ Form validation prevents empty submissions
✅ Loading state shows during send
✅ Success message confirms delivery
✅ Error messages show API failures
✅ Form resets after successful send
✅ Responsive design works on mobile
✅ Animations enhance UX
✅ Backend validates admin status

## Future Enhancements

- Send to multiple users at once
- Schedule notifications for later
- Attachment support
- Rich text editor for message body
- Template selection for common messages
- Analytics on message delivery rates
- Bulk notification import from CSV
