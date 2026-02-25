# Notification System - Quick Start

## What Was Created

### ✅ Frontend Files
1. **src/pages/Notification.jsx** - Full notification management page
   - Display all notifications with filtering
   - Enable/disable push notifications
   - Mark as read, delete notifications
   - Beautiful UI with icons and animations

2. **src/styles/Notification.css** - Complete styling
   - Responsive design for mobile & desktop
   - Dark theme with gradient background
   - Smooth animations and transitions

3. **public/service-worker.js** - Service worker for push handling
   - Handles background push notifications
   - Shows notifications to users
   - Handles notification clicks

### ✅ Backend Files
1. **push_notifications.js** - Push utility service
   - Initialize VAPID keys
   - Send single/batch notifications
   - Validate subscriptions
   - Error handling

2. **notification_routes.js** - API endpoints
   - `/api/notifications` - Get notifications
   - `/api/notifications/subscribe` - Subscribe to push
   - `/api/notifications/:id/read` - Mark as read
   - `/api/notifications/:id` - Delete
   - `/api/notifications/send` - Send to user
   - `/api/notifications/send-all` - Send to all
   - `/api/notifications/stats` - Get stats

### ✅ Installed Packages
- **web-push** (v3.6.7) - Backend push notification library

### ✅ Updated Files
- **Dashboard.jsx** - Added Notification import and routing
- **Navbar.jsx** - Added notification menu item with icon
- **Navbar.css** - Added notification icon styling

## Features Included

✅ Real-time push notifications  
✅ Notification center/inbox  
✅ Enable/disable notifications  
✅ Mark as read/unread  
✅ Delete notifications  
✅ Batch notifications to multiple users  
✅ Notification types (attendance, seva, store, events)  
✅ Service worker for background notifications  
✅ Responsive design  
✅ Error handling & validation  

## Quick Setup

### Step 1: Generate VAPID Keys
```bash
cd Backend
npx web-push generate-vapid-keys
```

### Step 2: Add Environment Variables

**Backend/.env**
```env
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_EMAIL=your@email.com
```

**Frontend/.env or .env.local**
```env
VITE_VAPID_PUBLIC_KEY=your_public_key
```

### Step 3: Initialize in server.js

```javascript
import { initializePushNotifications } from './push_notifications.js';
import notificationRoutes from './notification_routes.js';

// Initialize
initializePushNotifications(
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
  process.env.VAPID_EMAIL
);

// Register routes
app.use('/api', notificationRoutes);
```

### Step 4: Register Service Worker

In **Frontend/src/index.jsx** or **App.jsx**:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('✅ SW registered'))
    .catch(err => console.error('SW failed:', err));
}
```

## File Locations

```
📁 Frontend/
  ├─ src/
  │  ├─ pages/
  │  │  └─ Notification.jsx ✨ (NEW)
  │  ├─ styles/
  │  │  └─ Notification.css ✨ (NEW)
  │  └─ components/
  │     └─ Navbar.jsx (UPDATED)
  └─ public/
     └─ service-worker.js ✨ (NEW)

📁 Backend/
  ├─ push_notifications.js ✨ (NEW)
  ├─ notification_routes.js ✨ (NEW)
  └─ server.js (NEEDS UPDATE)
```

## API Examples

### Send Notification to User
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "123",
    "title": "Attendance Marked",
    "message": "Your attendance was marked successfully",
    "type": "attendance",
    "sendPush": true
  }'
```

### Get User Notifications
```bash
curl http://localhost:5000/api/notifications?user_id=123
```

### Send to All Users
```bash
curl -X POST http://localhost:5000/api/notifications/send-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Announcement",
    "message": "Important update",
    "type": "general",
    "sendPush": true
  }'
```

## Usage in Your App

### From Backend - Send Notification
```javascript
// When attendance is marked, send notification
import { sendBatchPushNotifications } from './push_notifications.js';

const userSubs = userSubscriptions[userId];
if (userSubs?.length) {
  await sendBatchPushNotifications(userSubs, {
    title: '✅ Attendance Marked',
    message: `Marked for ${sevaType}`,
    type: 'attendance',
    url: '/attendance'
  });
}
```

### From Frontend - User Navigation
Users click on Notifications in the navbar to see:
- All their notifications
- Enable/disable push
- Manage notification preferences
- Delete notifications

## Notification Types

- `attendance` - 📋 Attendance updates
- `seva` - 🙏 Seva activity
- `store` - 🛒 Store orders
- `event` - 📅 Events
- `general` - 📢 General updates

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅      | ✅     |
| Firefox | ✅      | ✅     |
| Safari  | ⚠️      | ❌     |
| Edge    | ✅      | ✅     |

## Testing Checklist

- [ ] Generate VAPID keys
- [ ] Set environment variables
- [ ] Update server.js with initialization
- [ ] Register service worker
- [ ] Test notification page loads
- [ ] Test "Enable Notifications" button
- [ ] Send test notification via API
- [ ] Verify push appears on device
- [ ] Test mark as read
- [ ] Test delete notification

## Troubleshooting

### "VAPID public key not configured"
→ Set environment variables and restart server

### Service worker not working
→ Check public/service-worker.js exists  
→ Clear browser cache  
→ Check DevTools > Application > Service Workers

### Notifications not showing
→ Check browser notification permissions  
→ Verify subscription saved in backend  
→ Check browser console for errors

## Next Steps

1. ✅ Generate VAPID keys
2. ✅ Set environment variables
3. ✅ Update server.js
4. ✅ Register service worker
5. ✅ Test the system
6. 🔄 Integrate with attendance/seva systems
7. 🔄 Add notification preferences per user
8. 🔄 Add notification history/archiving

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| Notification.jsx | UI for notifications | ✅ Created |
| Notification.css | Styling | ✅ Created |
| service-worker.js | Push handling | ✅ Created |
| push_notifications.js | Push utility | ✅ Created |
| notification_routes.js | API endpoints | ✅ Created |
| Dashboard.jsx | Routing | ✅ Updated |
| Navbar.jsx | Menu item | ✅ Updated |
| web-push package | Backend lib | ✅ Installed |

## Need Help?

See `WEB_PUSH_SETUP_GUIDE.md` for complete documentation with:
- Detailed setup instructions
- API endpoint documentation
- Code examples
- Security considerations
- Performance tips
