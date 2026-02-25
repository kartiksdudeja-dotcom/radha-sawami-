/**
 * NOTIFICATION INTEGRATION EXAMPLES
 * 
 * This file shows how to integrate the notification system
 * with your existing backend endpoints
 */

import { sendBatchPushNotifications } from './push_notifications.js';

// ============================================
// EXAMPLE 1: Send Notification When Attendance is Marked
// ============================================

export const notifyAttendanceMarked = async (userId, sevaType, userSubscriptions) => {
  try {
    const subscriptions = userSubscriptions[userId];
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ No subscriptions for user:', userId);
      return;
    }

    const result = await sendBatchPushNotifications(subscriptions, {
      title: '✅ Attendance Marked',
      message: `Your attendance for ${sevaType} has been marked`,
      type: 'attendance',
      icon: '📋',
      data: {
        sevaType: sevaType,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('📬 Attendance notification sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending attendance notification:', error);
  }
};

// ============================================
// EXAMPLE 2: Send Notification When Seva Entry is Created
// ============================================

export const notifySevaEntryCreated = async (
  userId,
  sevaCategory,
  hours,
  userSubscriptions
) => {
  try {
    const subscriptions = userSubscriptions[userId];
    
    if (!subscriptions) return;

    await sendBatchPushNotifications(subscriptions, {
      title: '🙏 Seva Entry Created',
      message: `${sevaCategory} - ${hours} hours logged`,
      type: 'seva',
      icon: '🙏',
      data: {
        category: sevaCategory,
        hours: hours,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending seva notification:', error);
  }
};

// ============================================
// EXAMPLE 3: Send Notification For Order Status
// ============================================

export const notifyOrderStatusChanged = async (
  userId,
  orderId,
  status,
  userSubscriptions
) => {
  const messages = {
    pending: '⏳ Order placed. Processing...',
    confirmed: '✅ Order confirmed!',
    shipped: '📦 Order shipped!',
    delivered: '🎉 Order delivered!',
    cancelled: '❌ Order cancelled',
  };

  try {
    const subscriptions = userSubscriptions[userId];
    
    if (!subscriptions) return;

    await sendBatchPushNotifications(subscriptions, {
      title: '🛒 Order Update',
      message: messages[status] || 'Your order status has changed',
      type: 'store',
      icon: '🛒',
      data: {
        orderId: orderId,
        status: status,
        url: '/store',
      },
    });
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

// ============================================
// EXAMPLE 4: Send Notification For New Event
// ============================================

export const notifyNewEvent = async (
  eventName,
  eventDate,
  userSubscriptions
) => {
  try {
    // Send to all subscribed users
    const allSubscriptions = Object.values(userSubscriptions).flat();
    
    if (allSubscriptions.length === 0) {
      console.log('No subscribed users');
      return;
    }

    const result = await sendBatchPushNotifications(allSubscriptions, {
      title: '📅 New Event Created',
      message: `${eventName} on ${new Date(eventDate).toLocaleDateString()}`,
      type: 'event',
      icon: '📅',
      data: {
        eventName: eventName,
        eventDate: eventDate,
        url: '/events',
      },
    });

    console.log('📬 Event notification sent to', result.sent, 'users');
    return result;
  } catch (error) {
    console.error('Error sending event notification:', error);
  }
};

// ============================================
// EXAMPLE 5: Send Reminder Notification
// ============================================

export const notifySevaBranchReminder = async (
  userId,
  branchName,
  userSubscriptions
) => {
  try {
    const subscriptions = userSubscriptions[userId];
    
    if (!subscriptions) return;

    await sendBatchPushNotifications(subscriptions, {
      title: '⏰ Branch Meeting Reminder',
      message: `Meeting at ${branchName} starting soon!`,
      type: 'event',
      icon: '⏰',
      data: {
        branchName: branchName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
};

// ============================================
// EXAMPLE 6: INTEGRATION IN YOUR ENDPOINTS
// ============================================

/**
 * Integration pattern for your existing endpoints:
 * 
 * In your attendance.js or similar:
 * 
 * import { notifyAttendanceMarked } from './notification_examples.js';
 * import notificationRoutes from './notification_routes.js';
 * 
 * router.post('/mark-attendance', async (req, res) => {
 *   try {
 *     const { userId, sevaType } = req.body;
 *     
 *     // Your existing logic
 *     // ... mark attendance ...
 *     
 *     // Send notification
 *     await notifyAttendanceMarked(userId, sevaType, userSubscriptions);
 *     
 *     res.json({ success: true, message: 'Attendance marked' });
 *   } catch (error) {
 *     res.status(500).json({ success: false, error: error.message });
 *   }
 * });
 */

// ============================================
// EXAMPLE 7: Batch Operations
// ============================================

export const notifyAttendanceStats = async (stats, userSubscriptions) => {
  /**
   * Send daily/weekly attendance summary notifications
   * 
   * stats format:
   * {
   *   date: '2026-01-05',
   *   totalMarked: 150,
   *   byCategory: {
   *     'Mahila': 50,
   *     'Youth': 60,
   *     'Bag': 40
   *   }
   * }
   */
  try {
    const allSubscriptions = Object.values(userSubscriptions).flat();
    
    const summary = Object.entries(stats.byCategory)
      .map(([name, count]) => `${name}: ${count}`)
      .join(', ');

    await sendBatchPushNotifications(allSubscriptions, {
      title: '📊 Daily Attendance Summary',
      message: `Total: ${stats.totalMarked} | ${summary}`,
      type: 'attendance',
      icon: '📊',
      data: stats,
    });
  } catch (error) {
    console.error('Error sending stats notification:', error);
  }
};

// ============================================
// EXAMPLE 8: Error Handling Pattern
// ============================================

export const notifyWithErrorHandling = async (
  userId,
  title,
  message,
  userSubscriptions
) => {
  try {
    const subscriptions = userSubscriptions[userId];
    
    if (!subscriptions || subscriptions.length === 0) {
      console.warn('⚠️ User has no push subscriptions');
      // Could also store notification in DB for later
      return { success: false, reason: 'NO_SUBSCRIPTIONS' };
    }

    const result = await sendBatchPushNotifications(subscriptions, {
      title: title,
      message: message,
    });

    if (result.failed > 0) {
      console.warn(`⚠️ Failed to send to ${result.failed} devices`);
      // Invalid subscriptions are automatically removed
    }

    return { success: true, sent: result.sent, failed: result.failed };
  } catch (error) {
    console.error('❌ Error in notification:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// EXPORT INTEGRATION GUIDE
// ============================================

/**
 * HOW TO USE IN YOUR ENDPOINTS:
 * 
 * 1. Import the notification function:
 *    import { notifyAttendanceMarked } from './notification_examples.js';
 * 
 * 2. Import userSubscriptions from notification_routes:
 *    import { userSubscriptions } from './notification_routes.js';
 *    // OR pass it from your main app file
 * 
 * 3. Call after your main operation:
 *    await notifyAttendanceMarked(userId, sevaType, userSubscriptions);
 * 
 * 4. Handle errors gracefully:
 *    try {
 *      await notifyAttendanceMarked(...);
 *    } catch (error) {
 *      console.error('Notification failed but attendance marked:', error);
 *      // Don't fail the main operation
 *    }
 * 
 * IMPORTANT:
 * - Notifications should NOT block main operations
 * - Always wrap in try-catch
 * - If notification fails, main operation should still succeed
 * - User will see result in notification center even if push fails
 */

export default {
  notifyAttendanceMarked,
  notifySevaEntryCreated,
  notifyOrderStatusChanged,
  notifyNewEvent,
  notifySevaBranchReminder,
  notifyAttendanceStats,
  notifyWithErrorHandling,
};
