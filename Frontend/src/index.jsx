import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for Push Notifications (after app renders)
// Supports: Chrome, Firefox, Safari, Edge, Opera
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully:', registration);
        console.log('🔔 Push notifications enabled for all browsers');
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
        console.warn('⚠️ Falling back to Notification API only (no push, but notifications will work)');
      });
  });
} else {
  console.warn('⚠️ Service Worker not supported - Notification API only');
}

// Check Notification API support
if ('Notification' in window) {
  console.log('✅ Notification API supported');
} else {
  console.error('❌ Notifications not supported in this browser');
}
