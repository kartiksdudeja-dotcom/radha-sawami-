# Web Push Notifications Setup Guide

## Overview
This guide explains how to set up web push notifications for the Radha Swami app using VAPID keys and Service Workers.

## What's Included

### Frontend Components
- **Notification.jsx** - Notification management page with:
  - List of all notifications
  - Enable/disable push notifications
  - Mark notifications as read
  - Delete notifications
  - Real-time push notification handling

### Backend Services
- **push_notifications.js** - Push notification utility with:
  - VAPID key initialization
  - Send single/batch push notifications
  - Subscription validation
  - Error handling

- **notification_routes.js** - API endpoints for:
  - Get user notifications
  - Subscribe to push notifications
  - Mark as read
  - Delete notifications
  - Send notifications
  - Get statistics

### Service Worker
- **public/service-worker.js** - Handles:
  - Push events
  - Notification display
  - Notification clicks
  - Background sync

## Setup Steps

### 1. Generate VAPID Keys

Run this command in the backend directory:

```bash
cd Backend
npx web-push generate-vapid-keys
```

This will output something like:
```
Public Key: BCkz...
Private Key: abc...
```

### 2. Set Environment Variables

#### Backend (.env)
```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=your-email@example.com
```

#### Frontend (.env or .env.local)
```env
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

### 3. Initialize Push Notifications in Backend

In your **server.js** or main app file:

```javascript
import { initializePushNotifications } from './push_notifications.js';
import notificationRoutes from './notification_routes.js';

// Initialize push notifications
initializePushNotifications(
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
  process.env.VAPID_EMAIL
);

// Register notification routes
app.use('/api', notificationRoutes);
```

### 4. Register Service Worker in Frontend

In your **index.jsx** or **App.jsx**:

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

## API Endpoints

### GET /api/notifications
Get user's notifications

**Query Parameters:**
- `user_id` (required) - User ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_1234...",
      "user_id": "user_123",
      "title": "Attendance Marked",
      "message": "Your attendance was marked successfully",
      "type": "attendance",
      "read": false,
      "createdAt": "2026-01-05T10:30:00Z",
      "data": {}
    }
  ]
}
```

### POST /api/notifications/subscribe
Subscribe user to push notifications

**Body:**
```json
{
  "user_id": "user_123",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### PUT /api/notifications/:id/read
Mark notification as read

### DELETE /api/notifications/:id
Delete notification

### POST /api/notifications/send
Send notification to a user (Admin)

**Body:**
```json
{
  "user_id": "user_123",
  "title": "Attendance",
  "message": "Your attendance was marked",
  "type": "attendance",
  "sendPush": true,
  "data": {
    "category": "attendance"
  }
}
```

### POST /api/notifications/send-all
Send notification to all users (Admin)

### GET /api/notifications/stats
Get notification statistics

## Usage Examples

### From Backend - Send Notification

```javascript
import { sendPushNotification, sendBatchPushNotifications } from './push_notifications.js';

// Send to single user
const subscription = userSubscriptions[userId][0];
const result = await sendPushNotification(subscription, {
  title: 'Attendance Marked',
  message: 'Your attendance was successfully marked',
  type: 'attendance',
  url: '/attendance'
});

// Send to multiple users
const subscriptions = userSubscriptions[userId];
const batchResult = await sendBatchPushNotifications(subscriptions, {
  title: 'New Event',
  message: 'A new event has been created',
  type: 'event'
});
```

### From Frontend - Request Permission

The Notification.jsx component automatically handles:
1. Checking browser support
2. Requesting user permission
3. Creating subscription
4. Sending subscription to backend
5. Handling errors

Users can click the "Enable Notifications" button to start receiving push notifications.

## Notification Types

Predefined notification types (can be extended):
- `attendance` - 📋 Attendance related
- `seva` - 🙏 Seva activity related
- `store` - 🛒 Store/order related
- `event` - 📅 Event related
- `general` - 📢 General notifications

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Limited support (iOS)
- Opera: ✅ Full support

## Troubleshooting

### VAPID Keys Not Configured
Error: "VAPID public key not configured"

**Solution:** Set environment variables as described in Setup Steps 1-2

### Service Worker Not Registering
**Solution:** 
1. Check that public/service-worker.js exists
2. Ensure HTTPS is used (http://localhost is OK for development)
3. Clear browser cache and restart

### Notifications Not Showing
**Solution:**
1. Check browser notification permissions
2. Verify subscription is saved in backend
3. Check browser console for errors
4. Ensure Service Worker is active (DevTools > Application > Service Workers)

### Subscriptions Being Removed
**Solution:** This happens when a subscription becomes invalid (410/404 error). It's automatically cleaned up, but user should re-enable notifications.

## Security Considerations

1. **VAPID Keys**: Keep private key secret - never expose to frontend
2. **Subscriptions**: Validate subscription format before storing
3. **Payload**: Encrypt sensitive data in notification payload
4. **Rate Limiting**: Implement rate limiting for notification endpoints
5. **Validation**: Validate user authorization before sending notifications

## Performance Tips

1. **Batch Operations**: Use sendBatchPushNotifications for multiple users
2. **Cleanup Invalid**: Regularly remove invalid subscriptions (410 errors)
3. **Payload Size**: Keep payload under 4KB
4. **TTL**: Set appropriate TTL for notifications
5. **Caching**: Cache subscription list to reduce lookups

## Next Steps

1. Generate VAPID keys and set environment variables
2. Initialize push notifications in server.js
3. Register service worker in frontend
4. Test push notifications via API endpoints
5. Integrate with your existing notification system

## Testing

### Manual Test via API
```bash
# Send test notification
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "title": "Test",
    "message": "This is a test notification",
    "type": "general",
    "sendPush": true
  }'
```

### Frontend Testing
1. Open Notification page
2. Click "Enable Notifications"
3. Allow notifications in browser popup
4. Send test notification from API
5. Verify notification appears

## References
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push npm package](https://github.com/web-push-libs/web-push)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid)
