import React, { useState, useEffect } from 'react';
import '../styles/Notification.css';

const Notification = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [secureContext, setSecureContext] = useState({ secure: true, reason: '' });
  
  // Admin send message state
  const [isAdmin, setIsAdmin] = useState(false);
  const [sendToUserId, setSendToUserId] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [sendPush, setSendPush] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendStatus, setSendStatus] = useState({ type: '', message: '' });
  const [eventDate, setEventDate] = useState('');

  // Check secure context on mount
  useEffect(() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setSecureContext({ secure: true, reason: 'localhost' });
    } else if (protocol === 'https:') {
      setSecureContext({ secure: true, reason: 'https' });
    } else {
      setSecureContext({ 
        secure: false, 
        reason: `http://${hostname}` 
      });
    }
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    checkPushSupport();
    setPermissionStatus(window.Notification.permission);
    
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.is_admin === true || user.is_admin === 'true');
  }, []);

  // Browser detection helper
  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg') > -1) return 'Edge';
    if (ua.indexOf('Opera') > -1) return 'Opera';
    return 'Unknown';
  };

  // Check if browser supports push notifications (with fallbacks for all browsers)
  const checkPushSupport = async () => {
    try {
      // Check Service Worker support (most modern browsers)
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
        setPushEnabled(!!sub);
        setPermissionStatus(window.Notification.permission);
        console.log(`✅ Push Manager supported on ${getBrowserName()}`);
      } 
      // Fallback: Check Notification API only (all modern browsers)
      else if ('Notification' in window) {
        setPermissionStatus(window.Notification.permission);
        console.log(`⚠️ Service Worker not available, using Notification API only on ${getBrowserName()}`);
      } 
      else {
        console.warn(`❌ Push notifications not supported on ${getBrowserName()}`);
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error checking push support:', error);
      setPermissionStatus('denied');
    }
  };

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(
        `${API_BASE_URL}/api/notifications?user_id=${user.id || ''}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const notificationsList = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        setNotifications(notificationsList);
        console.log('✅ Notifications loaded:', notificationsList.length);
      } else {
        console.error('Failed to load notifications:', response.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Request notification permission (works on all modern browsers)
  const requestNotificationPermission = async () => {
    try {
      // Check if Notification API is available (Chrome, Firefox, Safari, Edge, etc.)
      if (!('Notification' in window)) {
        alert('⚠️ Notifications are not supported in this browser');
        return;
      }

      const permission = await window.Notification.requestPermission();
      setPermissionStatus(permission);
      console.log(`📱 Permission requested on ${getBrowserName()}: ${permission}`);

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        
        // Try to subscribe to push if service worker is available
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          await subscribeUserToNotifications();
        } else {
          console.log('ℹ️ Service Worker not available, using Notification API');
        }
      } else if (permission === 'denied') {
        alert('⚠️ Notification permission denied. Please enable it in browser settings.');
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      alert('Failed to request notification permission');
    }
  };

  // Check if secure context (HTTPS or localhost)
  const isSecureContext = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // localhost is always allowed (even on HTTP)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { secure: true, reason: 'localhost' };
    }
    
    // HTTPS is required for all other origins
    if (protocol === 'https:') {
      return { secure: true, reason: 'https' };
    }
    
    // IP address without HTTPS - NOT ALLOWED
    return { 
      secure: false, 
      reason: `Push notifications require HTTPS or localhost. You are accessing via http://${hostname} which is not supported by browsers.`
    };
  };

  // Subscribe user to push notifications (Service Worker + Push API)
  const subscribeUserToNotifications = async () => {
    try {
      // ⚠️ CRITICAL: Check for secure context FIRST
      const securityCheck = isSecureContext();
      if (!securityCheck.secure) {
        console.error('❌ Insecure context detected:', securityCheck.reason);
        alert(`⚠️ ${securityCheck.reason}\n\n📌 Solution: Access the app via:\n• http://localhost:3000 (for development)\n• https://yourdomain.com (for production)`);
        return;
      }
      console.log('✅ Secure context:', securityCheck.reason);

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('⚠️ Service Worker or Push Manager not available');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('📋 Service Worker ready, scope:', registration.scope);

      // 🔧 IMPORTANT: First unsubscribe any existing subscription to clear corrupted data
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log('🗑️ Found existing subscription, unsubscribing first...');
        try {
          await existingSub.unsubscribe();
          console.log('✅ Unsubscribed from old subscription');
        } catch (unsubError) {
          console.warn('⚠️ Could not unsubscribe:', unsubError);
        }
      }

      // Generate VAPID public key (you should generate this)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

      if (!vapidPublicKey) {
        console.warn('⚠️ VAPID public key not configured');
        alert('Push notifications setup is incomplete. Contact administrator.');
        return;
      }

      console.log('🔑 VAPID Public Key:', vapidPublicKey);
      console.log('🔑 Key Length:', vapidPublicKey.length);
      console.log('🔑 Key starts with:', vapidPublicKey.substring(0, 10));

      // Convert VAPID key with error handling
      let applicationServerKey;
      try {
        applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        console.log('✅ VAPID key converted successfully');
        console.log('📊 Uint8Array length:', applicationServerKey.length);
        console.log('📊 First 10 bytes:', Array.from(applicationServerKey.slice(0, 10)));
        
        // Validate key format (should be 65 bytes starting with 0x04)
        if (applicationServerKey.length !== 65) {
          throw new Error(`Invalid key length: ${applicationServerKey.length}, expected 65`);
        }
        if (applicationServerKey[0] !== 4) {
          throw new Error(`Invalid key format: first byte is ${applicationServerKey[0]}, expected 4`);
        }
        console.log('✅ VAPID key format validated (65 bytes, starts with 0x04)');
      } catch (conversionError) {
        console.error('❌ Error converting VAPID key:', conversionError);
        alert('Failed to process VAPID key. Key may be invalid.');
        return;
      }

      console.log('🔄 Attempting to subscribe with applicationServerKey...');
      console.log('🌐 Push service endpoint will be provided by browser...');
      
      // Check push manager permission state
      const permissionState = await registration.pushManager.permissionState({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      console.log('📋 Push permission state:', permissionState);
      
      if (permissionState === 'denied') {
        alert('Push notifications are blocked. Please enable in browser settings.');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('📬 Subscription created:', subscription);
      console.log('📬 Endpoint:', subscription.endpoint);

      // Send subscription to server
      await sendSubscriptionToServer(subscription);
      setSubscription(subscription);
      setPushEnabled(true);
      console.log('✅ Successfully subscribed to notifications');
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      
      // Detailed error handling
      let userMessage = 'Failed to enable push notifications: ' + error.message;
      
      if (error.name === 'AbortError' && error.code === 20) {
        userMessage = `⚠️ Push Service Error (Code 20)

This error means the browser's push service rejected the subscription.

Common causes:
1. 🔄 Try: Refresh the page (Ctrl+Shift+R)
2. 🗑️ Clear site data: DevTools → Application → Clear Storage
3. 🌐 Check internet connection
4. 🔒 Firewall may be blocking push.services.mozilla.com or fcm.googleapis.com
5. 🔑 VAPID key mismatch - restart frontend server

Current VAPID Key: ${import.meta.env.VITE_VAPID_PUBLIC_KEY?.substring(0, 20)}...`;
      }
      
      alert(userMessage);
    }
  };

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    try {
      console.log('🔄 Converting VAPID key from Base64URL to Uint8Array');
      console.log('📝 Input string:', base64String.substring(0, 20) + '...');
      
      // Remove any whitespace
      const cleanedString = base64String.trim();
      
      // Handle Base64URL encoding (replace - and _ with + and /)
      const padding = '='.repeat((4 - (cleanedString.length % 4)) % 4);
      const base64 = (cleanedString + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      console.log('📊 After padding:', padding.length, 'characters added');
      console.log('📊 Final Base64 length:', base64.length);

      // Decode Base64
      let rawData;
      try {
        rawData = window.atob(base64);
      } catch (e) {
        console.error('❌ atob failed - invalid Base64:', e.message);
        throw new Error('Invalid Base64 encoding in VAPID key');
      }

      console.log('📊 Raw data length:', rawData.length, 'bytes');

      // Convert to Uint8Array
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      console.log('✅ VAPID key conversion successful');
      console.log('📊 Uint8Array length:', outputArray.length);
      
      // Validate VAPID key size (should be 65 bytes for P-256 curve)
      if (outputArray.length !== 65) {
        console.warn('⚠️ Warning: VAPID key length is', outputArray.length, 'bytes (expected 65 bytes)');
      }

      return outputArray;
    } catch (error) {
      console.error('❌ urlBase64ToUint8Array error:', error);
      throw error;
    }
  };

  // Send subscription to backend
  const sendSubscriptionToServer = async (subscription) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subscription: subscription,
        }),
      });

      if (response.ok) {
        console.log('✅ Subscription sent to server');
      } else {
        console.error('Failed to send subscription to server:', response.status);
      }
    } catch (error) {
      console.error('❌ Error sending subscription to server:', error);
    }
  };

  // Unsubscribe from notifications
  const unsubscribeFromNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setPushEnabled(false);
        console.log('✅ Successfully unsubscribed from notifications');
      }
    } catch (error) {
      console.error('❌ Error unsubscribing:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation(); // Prevent card click when clicking checkmark
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, e) => {
    if (e) e.stopPropagation(); // Prevent card click when clicking delete
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Send message (Admin only)
  const sendNotificationMessage = async (e) => {
    e.preventDefault();
    
    if (!messageTitle.trim() || !messageBody.trim()) {
      setSendStatus({ type: 'error', message: '⚠️ Please fill title and message' });
      return;
    }

    if (!sendToAll && !sendToUserId.trim()) {
      setSendStatus({ type: 'error', message: '⚠️ Enter user ID or select Send to All' });
      return;
    }

    try {
      setSendingMessage(true);
      setSendStatus({ type: '', message: '' });

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const endpoint = sendToAll ? '/api/notifications/send-all' : '/api/notifications/send';
      
      const payload = {
        title: messageTitle,
        message: messageBody,
        type: messageType,
        sendPush: sendPush,
        is_admin: true,
        event_date: (messageType === 'event' || messageType === 'upcoming_event') ? eventDate : null,
      };

      if (!sendToAll) {
        payload.uid = sendToUserId;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const target = sendToAll ? 'all users' : sendToUserId;
        setSendStatus({ 
          type: 'success', 
          message: `✅ Notification sent to ${target} & saved to database` 
        });
        // Reset form
        setSendToUserId('');
        setSendToAll(false);
        setMessageTitle('');
        setMessageBody('');
        setMessageType('general');
        setEventDate('');
        // Reload notifications
        loadNotifications();
      } else {
        setSendStatus({ 
          type: 'error', 
          message: `❌ Failed: ${result.error || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setSendStatus({ 
        type: 'error', 
        message: `❌ Error: ${error.message}` 
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!onNavigate) return;

    const type = notification.type || notification.message_type;
    
    // Auto mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (type === 'event' || type === 'upcoming_event') {
      onNavigate('home'); // Go to AaglaSatsang
    } else if (type === 'store') {
      onNavigate('store');
    } else if (type === 'attendance') {
      onNavigate('attendance');
    } else if (type === 'seva') {
      onNavigate('seva');
    } else if (type === 'profile') {
      onNavigate('profile');
    }
  };

  return (
    <div className="notification-container">
      {/* ⚠️ Insecure Context Warning */}
      {!secureContext.secure && (
        <div className="insecure-context-warning">
          <div className="warning-icon">🔒</div>
          <div className="warning-content">
            <h3>⚠️ Push Notifications Unavailable</h3>
            <p>
              You're accessing via <strong>{secureContext.reason}</strong> which doesn't support push notifications.
            </p>
            <p className="warning-solution">
              <strong>Solution:</strong> Access the app via:
              <br />• <a href="http://localhost:3000" className="localhost-link">http://localhost:3000</a> (for development)
              <br />• <strong>https://</strong>yourdomain.com (for production with SSL)
            </p>
          </div>
        </div>
      )}

      <div className="notification-header">
        <div className="header-content">
          <h1>🔔 Notifications</h1>
          <p className="header-subtitle">Stay updated with your activities</p>
        </div>

        <div className="notification-controls">
          <button
            className={`push-notify-btn ${pushEnabled ? 'enabled' : 'disabled'} ${!secureContext.secure ? 'unavailable' : ''}`}
            onClick={pushEnabled ? unsubscribeFromNotifications : requestNotificationPermission}
            disabled={loading || !secureContext.secure}
            title={!secureContext.secure ? 'Push notifications require HTTPS or localhost' : ''}
          >
            {!secureContext.secure ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                Push Unavailable (Use localhost)
              </>
            ) : pushEnabled ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Notifications Enabled
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
                Enable Notifications
              </>
            )}
          </button>

          <button className="refresh-btn" onClick={loadNotifications} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Permission Status - PROMINENT for Chrome */}
      {permissionStatus && permissionStatus !== 'granted' && (
        <div className={`permission-card ${permissionStatus === 'denied' ? 'denied' : 'pending'}`}>
          <div className="permission-icon-wrapper">
            {permissionStatus === 'denied' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            )}
          </div>
          <div className="permission-content">
            <h3 className="permission-title">
              {permissionStatus === 'denied' 
                ? 'Notifications Blocked' 
                : 'Enable Push Notifications'}
            </h3>
            <p className="permission-desc">
              {permissionStatus === 'denied'
                ? 'Notifications are blocked in your browser. To enable:\n1. Click the lock icon in the address bar\n2. Find "Notifications" setting\n3. Change to "Allow"'
                : 'Stay instantly updated with real-time push notifications. Click below to grant access.'}
            </p>
            {permissionStatus === 'denied' && (
              <div className="permission-hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>Chrome Settings → Privacy → Site Settings → Notifications</span>
              </div>
            )}
          </div>
          <button
            className={`permission-btn ${permissionStatus === 'denied' ? 'btn-blocked' : 'btn-enable'}`}
            onClick={requestNotificationPermission}
            disabled={permissionStatus === 'denied'}
            title={permissionStatus === 'denied' ? 'Change permissions in browser settings' : 'Click to enable notifications'}
          >
            {permissionStatus === 'denied' ? 'Blocked' : 'Enable Now'}
          </button>
        </div>
      )}

      {/* Success State - Show when notifications are enabled */}
      {permissionStatus === 'granted' && pushEnabled && (
        <div className="permission-card success">
          <div className="permission-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="permission-content">
            <h3 className="permission-title">Active & Listening</h3>
            <p className="permission-desc">
              Great! You're fully set to receive instant updates on attendance, Seva duties, store events, and more.
            </p>
          </div>
          <button
            className="permission-btn btn-disable"
            onClick={unsubscribeFromNotifications}
            title="Click to disable notifications"
          >
            Disable
          </button>
        </div>
      )}

      {/* Admin Send Message Form */}
      {isAdmin && (
        <div className="admin-card">
          <div className="admin-header">
            <div className="admin-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div>
              <h2 className="admin-title">Broadcast Center</h2>
              <p className="admin-subtitle">Send notifications to users instantly</p>
            </div>
          </div>

          <form onSubmit={sendNotificationMessage} className="admin-form">
            {/* Send To All Toggle */}
            <div className={`send-to-all-toggle ${sendToAll ? 'active' : ''}`}>
              <label htmlFor="sendToAll" className="toggle-label">
                <div className="toggle-info">
                  <span className="toggle-text">Broadcast to Everyone</span>
                  <span className="toggle-desc">Send this message to all registered users</span>
                </div>
                <div className="switch-wrapper">
                  <input
                    id="sendToAll"
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => {
                      setSendToAll(e.target.checked);
                      if (e.target.checked) setSendToUserId('');
                    }}
                    disabled={sendingMessage}
                    className="toggle-checkbox"
                  />
                  <span className="switch-slider"></span>
                </div>
              </label>
            </div>

            <div className="form-grid">
              {!sendToAll && (
                <div className="form-group">
                  <label htmlFor="userId">👤 User ID to Send To</label>
                  <input
                    id="userId"
                    type="text"
                    placeholder="Enter user ID"
                    value={sendToUserId}
                    onChange={(e) => setSendToUserId(e.target.value)}
                    disabled={sendingMessage}
                    className="form-input"
                  />
                </div>
              )}

              {sendToAll && (
                <div className="form-group send-all-info">
                  <p className="info-text">✅ This notification will be sent to all users</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="msgType">📌 Message Type</label>
                <select
                  id="msgType"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  disabled={sendingMessage}
                  className="form-select"
                >
                  <option value="general">📢 General</option>
                  <option value="attendance">📋 Attendance</option>
                  <option value="seva">🙏 Seva</option>
                  <option value="store">🛒 Store</option>
                  <option value="event">📅 Event</option>
                  <option value="upcoming_event">📌 Upcoming Event</option>
                </select>
              </div>

              {(messageType === 'event' || messageType === 'upcoming_event') && (
                <div className="form-group">
                  <label htmlFor="eventDate">📅 Event Date & Time</label>
                  <input
                    id="eventDate"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    disabled={sendingMessage}
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="msgTitle">✏️ Message Title</label>
                <input
                  id="msgTitle"
                  type="text"
                  placeholder="Enter message title"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  disabled={sendingMessage}
                  className="form-input"
                  maxLength="100"
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="sendPush" className="checkbox-label">
                  <input
                    id="sendPush"
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    disabled={sendingMessage}
                  />
                  <span>🔔 Send Push Notification</span>
                </label>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="msgBody">💬 Message Body</label>
              <textarea
                id="msgBody"
                placeholder="Enter message content"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                disabled={sendingMessage}
                className="form-textarea"
                rows="4"
                maxLength="500"
              ></textarea>
              <p className="char-count">{messageBody.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={sendingMessage}
              className={`submit-btn ${sendingMessage ? 'loading' : ''}`}
            >
              {sendingMessage ? '⏳ Sending...' : '📤 Send Notification'}
            </button>

            {sendStatus.message && (
              <div className={`status-message status-${sendStatus.type}`}>
                {sendStatus.message}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-list-container">
        <div className="list-header">
          <h2 className="list-title">Recent Activity</h2>
          <span className="badge">{notifications.length} Total</span>
        </div>

        {loading && (
          <div className="skeleton-container">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-icon-wrapper">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
            </div>
            <h3 className="empty-title">All Caught Up!</h3>
            <p className="empty-desc">You have no new notifications right now. Enjoy your day!</p>
          </div>
        )}

        <div className="notifications-grid">
          {!loading &&
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: onNavigate ? 'pointer' : 'default' }}
              >
                <div className={`notification-icon-badge type-${notification.type || 'general'}`}>
                  {notification.type === 'attendance' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                  {notification.type === 'seva' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>}
                  {notification.type === 'store' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>}
                  {(notification.type === 'event' || notification.type === 'upcoming_event') && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                  {(!notification.type || notification.type === 'general') && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>}
                </div>
                
                <div className="notification-details">
                  <div className="notification-card-header">
                    <h3 className="notif-title">{notification.title}</h3>
                    <span className="notif-time">
                      {new Date(notification.createdAt || notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="notif-message">{notification.message}</p>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="action-btn mark-read"
                    onClick={(e) => markAsRead(notification.id, e)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="action-btn delete"
                  onClick={(e) => deleteNotification(notification.id, e)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notification;
