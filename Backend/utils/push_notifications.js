import webpush from "web-push";

// Initialize web-push with VAPID keys
// Generate keys using: npx web-push generate-vapid-keys
export const initializePushNotifications = (
  vapidPublicKey,
  vapidPrivateKey,
  vapidEmail
) => {
  if (vapidPublicKey && vapidPrivateKey && vapidEmail) {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    console.log("✅ Web Push notifications initialized with VAPID keys");
  } else {
    console.warn(
      "⚠️ VAPID keys not configured. Push notifications may not work."
    );
    console.log("Generate keys with: npx web-push generate-vapid-keys");
  }
};

/**
 * Send push notification to a specific subscription
 * @param {Object} subscription - Push subscription object from client
 * @param {Object} payload - Notification data
 * @returns {Promise}
 */
export const sendPushNotification = async (subscription, payload) => {
  try {
    const options = {
      TTL: 24 * 60 * 60, // 24 hours
      headers: {
        "Content-Type": "application/json",
      },
    };

    const notificationPayload = JSON.stringify({
      title: payload.title || "Radha Swami Notification",
      body: payload.message || payload.body || "New notification",
      icon: payload.icon || "/logo.png",
      badge: payload.badge || "/logo.png",
      tag: payload.tag || "notification",
      data: {
        url: payload.url || "/",
        type: payload.type || "general",
        ...payload.data,
      },
    });

    const result = await webpush.sendNotification(
      subscription,
      notificationPayload,
      options
    );
    console.log("✅ Push notification sent successfully");
    return { success: true, result };
  } catch (error) {
    console.error("❌ Error sending push notification:", error.message);

    // Handle different error types
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is no longer valid, remove it
      return {
        success: false,
        error: "INVALID_SUBSCRIPTION",
        statusCode: error.statusCode,
      };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send batch push notifications
 * @param {Array} subscriptions - Array of subscription objects
 * @param {Object} payload - Notification data
 * @returns {Promise}
 */
export const sendBatchPushNotifications = async (subscriptions, payload) => {
  const results = {
    sent: 0,
    failed: 0,
    invalid: [],
    errors: [],
  };

  for (const subscription of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, payload);
      if (result.success) {
        results.sent++;
      } else if (result.statusCode === 410 || result.statusCode === 404) {
        results.invalid.push(subscription);
        results.failed++;
      } else {
        results.failed++;
        results.errors.push({
          subscription: subscription.endpoint,
          error: result.error,
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        subscription: subscription.endpoint,
        error: error.message,
      });
    }
  }

  console.log(
    `📊 Batch notification results: ${results.sent} sent, ${results.failed} failed`
  );
  return results;
};

/**
 * Validate a push subscription
 * @param {Object} subscription - Push subscription object
 * @returns {boolean}
 */
export const isValidSubscription = (subscription) => {
  if (!subscription || typeof subscription !== "object") {
    return false;
  }

  const requiredFields = ["endpoint", "keys"];
  return requiredFields.every((field) => field in subscription);
};

export default {
  initializePushNotifications,
  sendPushNotification,
  sendBatchPushNotifications,
  isValidSubscription,
};
