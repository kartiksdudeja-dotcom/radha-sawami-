import express from 'express';
import { getPool } from './config/db.js';
import sql from 'mssql';
import {
  sendPushNotification,
  sendBatchPushNotifications,
  isValidSubscription,
} from './push_notifications.js';

const router = express.Router();

// In-memory storage for subscriptions only (notifications saved to database)
let userSubscriptions = {};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  const user = req.body.user || req.query.user;
  const isAdminUser = req.body.is_admin || req.query.is_admin === 'true';

  if (!isAdminUser) {
    return res.status(403).json({
      success: false,
      error: '🔒 Admin only - Only administrators can send notifications',
    });
  }

  next();
};

/**
 * GET /api/notifications - Get user's notifications from database
 */
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'user_id required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('uid', sql.NVarChar(50), userId)
      .query(`
        SELECT * FROM notifications 
        WHERE uid = @uid OR send_to_all = 1
        ORDER BY created_at DESC
      `);

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/notifications/subscribe - Subscribe user to push notifications
 */
router.post('/notifications/subscribe', (req, res) => {
  try {
    const { user_id, subscription } = req.body;

    if (!user_id || !subscription) {
      return res
        .status(400)
        .json({ success: false, error: 'user_id and subscription required' });
    }

    if (!isValidSubscription(subscription)) {
      return res.status(400).json({ success: false, error: 'Invalid subscription object' });
    }

    // Store subscription
    if (!userSubscriptions[user_id]) {
      userSubscriptions[user_id] = [];
    }

    // Check if subscription already exists
    const exists = userSubscriptions[user_id].some(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!exists) {
      userSubscriptions[user_id].push({
        ...subscription,
        subscribedAt: new Date().toISOString(),
      });
      console.log(`✅ User ${user_id} subscribed to push notifications`);
    } else {
      console.log(`ℹ️ User ${user_id} already subscribed`);
    }

    res.json({ success: true, message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/notifications/:id/read - Mark notification as read
 */
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE notifications SET [read] = 1, updated_at = GETDATE() WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/notifications/:id - Delete notification
 */
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM notifications WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/notifications/send - Send notification to single user or all
 * Admin endpoint to send notifications to database
 */
router.post('/notifications/send', isAdmin, async (req, res) => {
  try {
    const { uid, title, message, type, sendPush, is_admin, send_to_all } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'title and message are required',
      });
    }

    // If not sending to all, uid is required
    if (!send_to_all && !uid) {
      return res.status(400).json({
        success: false,
        error: 'uid or send_to_all flag is required',
      });
    }

    console.log(`📬 Admin sending notification${send_to_all ? ' to ALL users' : ' to: ' + uid}`);

    const pool = await getPool();
    
    const result = await pool.request()
      .input('uid', sql.NVarChar(50), send_to_all ? null : uid)
      .input('title', sql.NVarChar(200), title)
      .input('message', sql.NVarChar(sql.MAX), message)
      .input('type', sql.NVarChar(50), type || 'general')
      .input('send_to_all', sql.Bit, send_to_all ? 1 : 0)
      .input('created_by', sql.NVarChar(50), 'admin')
      .query(`
        INSERT INTO notifications (uid, title, message, type, send_to_all, created_by)
        VALUES (@uid, @title, @message, @type, @send_to_all, @created_by);
        SELECT @@IDENTITY as id;
      `);

    const notificationId = result.recordset[0].id;
    console.log(`✅ Notification ${notificationId} saved to database`);

    // Send push notification if enabled
    const results = { success: true, notificationId, message: 'Notification saved to database' };

    if (sendPush) {
      try {
        if (send_to_all) {
          // Get all user IDs from database and send to all
          const usersResult = await pool.request().query('SELECT DISTINCT UserID FROM MemberDetails WHERE ChkAdmin = 0');
          const userUids = usersResult.recordset.map(u => u.UserID);
          
          let sent = 0;
          let failed = 0;

          for (const userUid of userUids) {
            if (userSubscriptions[userUid]) {
              try {
                const pushResults = await sendBatchPushNotifications(
                  userSubscriptions[userUid],
                  {
                    title: title,
                    message: message,
                    type: type || 'general',
                  }
                );
                sent += pushResults.sent;
                failed += pushResults.failed;

                // Clean invalid subscriptions
                if (pushResults.invalid.length > 0) {
                  userSubscriptions[userUid] = userSubscriptions[userUid].filter(
                    (sub) => !pushResults.invalid.some((invalid) => invalid.endpoint === sub.endpoint)
                  );
                }
              } catch (err) {
                console.error(`Error sending push to ${userUid}:`, err.message);
                failed++;
              }
            }
          }

          results.push = {
            sent,
            failed,
            totalUsers: userUids.length,
            message: `Push sent to ${sent} devices across ${userUids.length} users`,
          };
        } else {
          // Send to single user
          if (userSubscriptions[uid]) {
            const pushResults = await sendBatchPushNotifications(
              userSubscriptions[uid],
              {
                title: title,
                message: message,
                type: type || 'general',
              }
            );

            results.push = {
              sent: pushResults.sent,
              failed: pushResults.failed,
              message: `Push sent to ${pushResults.sent} devices`,
            };

            // Clean invalid subscriptions
            if (pushResults.invalid.length > 0) {
              userSubscriptions[uid] = userSubscriptions[uid].filter(
                (sub) => !pushResults.invalid.some((invalid) => invalid.endpoint === sub.endpoint)
              );
            }
          } else {
            results.push = { sent: 0, failed: 0, message: 'User has no active push subscriptions' };
          }
        }
      } catch (error) {
        console.error('❌ Error sending push notifications:', error);
        results.pushError = error.message;
      }
    }

    res.json(results);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/notifications/send-all - Send notification to all users
 * Admin endpoint
 */
router.post('/notifications/send-all', isAdmin, async (req, res) => {
  try {
    const { title, message, type, sendPush, is_admin } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'title and message are required',
      });
    }

    console.log('📬 Admin sending notification to ALL users');

    const pool = await getPool();
    
    // Insert notification with send_to_all flag
    const result = await pool.request()
      .input('title', sql.NVarChar(200), title)
      .input('message', sql.NVarChar(sql.MAX), message)
      .input('type', sql.NVarChar(50), type || 'general')
      .input('send_to_all', sql.Bit, 1)
      .input('created_by', sql.NVarChar(50), 'admin')
      .query(`
        INSERT INTO notifications (uid, title, message, type, send_to_all, created_by)
        VALUES (NULL, @title, @message, @type, @send_to_all, @created_by);
        SELECT @@IDENTITY as id;
      `);

    const notificationId = result.recordset[0].id;
    console.log(`✅ Notification ${notificationId} saved to database (send to all)`);

    // Send push notification if enabled
    const results = { 
      success: true, 
      notificationId, 
      message: 'Notification saved to database and queued for all users',
      sendToAll: true 
    };

    if (sendPush) {
      try {
        // Get all user IDs from database
        const usersResult = await pool.request().query('SELECT DISTINCT UserID FROM MemberDetails WHERE ChkAdmin = 0');
        const userUids = usersResult.recordset.map(u => u.UserID);
        
        let sent = 0;
        let failed = 0;

        // Send to each user's subscriptions
        for (const uid of userUids) {
          if (userSubscriptions[uid]) {
            try {
              const pushResults = await sendBatchPushNotifications(
                userSubscriptions[uid],
                {
                  title: title,
                  message: message,
                  type: type || 'general',
                }
              );
              sent += pushResults.sent;
              failed += pushResults.failed;

              // Clean invalid subscriptions
              if (pushResults.invalid.length > 0) {
                userSubscriptions[uid] = userSubscriptions[uid].filter(
                  (sub) => !pushResults.invalid.some((invalid) => invalid.endpoint === sub.endpoint)
                );
              }
            } catch (err) {
              console.error(`Error sending push to ${uid}:`, err.message);
              failed++;
            }
          }
        }

        results.push = {
          sent,
          failed,
          totalUsers: userUids.length,
          message: `Push sent to ${sent} devices across ${userUids.length} users`,
        };
      } catch (error) {
        console.error('❌ Error sending push notifications:', error);
        results.pushError = error.message;
      }
    }

    res.json(results);
  } catch (error) {
    console.error('❌ Error in send-all:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/stats - Get notification statistics
 */
router.get('/notifications/stats', (req, res) => {
  try {
    const userId = req.query.user_id;

    let userNotifs = notifications;
    if (userId) {
      userNotifs = notifications.filter((n) => n.user_id === userId || n.user_id === 'all');
    }

    const stats = {
      total: userNotifs.length,
      read: userNotifs.filter((n) => n.read).length,
      unread: userNotifs.filter((n) => !n.read).length,
      byType: {},
      subscribedUsers: userId ? (userSubscriptions[userId]?.length || 0) : Object.keys(userSubscriptions).length,
    };

    // Count by type
    userNotifs.forEach((notif) => {
      const type = notif.type || 'general';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
