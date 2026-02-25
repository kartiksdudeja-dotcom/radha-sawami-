# Mobile App Setup Guide

## QR Code Configuration ✅
The app is now configured to use the local network IP address for the QR code:
- **QR URL**: `http://192.168.1.107:3000/`
- **Features**: When users scan the QR code, they can download/access the app directly

## Progressive Web App (PWA) Setup ✅

The project is now set up as a fully functional PWA (Progressive Web App) that can be installed on mobile devices.

### What's Installed:

1. **manifest.json** - PWA configuration with:
   - App name: "Radha Swami Portal"
   - App icons (SVG-based, scalable)
   - App shortcuts for quick access
   - Display mode: Standalone (looks like native app)
   - Theme colors and styling

2. **Service Worker (sw.js)** - Provides:
   - Offline support for cached pages
   - Network-first strategy for resources
   - Automatic cache management
   - API call handling

3. **Updated index.html** - Includes:
   - PWA meta tags for iOS/Android
   - Apple mobile web app support
   - Service Worker registration
   - Manifest linking

### How Users Install the App:

#### On Android:
1. Open `http://192.168.1.107:3000/` in Chrome/Edge
2. Wait for "Install" prompt to appear (or tap menu → "Install app")
3. Tap "Install"
4. App will appear on home screen and can be launched like a native app

#### On iOS:
1. Open `http://192.168.1.107:3000/` in Safari
2. Tap the Share button → "Add to Home Screen"
3. Give it a name and tap "Add"
4. App will appear on home screen

### Features Available:

✅ **Offline Support** - View cached pages when offline
✅ **Native-like Experience** - Full screen, no address bar
✅ **App Shortcuts** - Quick access to Attendance and Store
✅ **Push Notifications Ready** - Can be added later
✅ **Responsive Design** - Works on all screen sizes

## Accessing the App

### From Desktop:
```
http://192.168.1.107:3000/
```

### From Mobile (Network):
```
http://192.168.1.107:3000/
```

### QR Code:
Users can scan the QR code in "Download App" menu to access the app immediately

## Backend Requirements

Make sure the backend API is running on:
```
http://192.168.1.107:5000/
```

Update your API endpoints if using a different IP/port.

## Mobile-Optimized Features:

- ✅ Search bar in Members
- ✅ Responsive tables (desktop) and cards (mobile)
- ✅ Neumorphism design for touch-friendly interface
- ✅ Optimized buttons and inputs for mobile
- ✅ Smooth animations and transitions

## Network Configuration Tips:

1. **Ensure same WiFi**: Phone and computer must be on same network
2. **Check firewall**: Allow Node.js (port 3000) through firewall
3. **Test connection**: 
   ```
   ping 192.168.1.107
   ```
4. **Alternative IPs**: If 192.168.1.107 is not your IP, find it:
   ```
   Windows: ipconfig
   Mac/Linux: ifconfig
   ```

## Future Enhancements:

- Deploy to cloud (AWS, Heroku, etc.) for public access
- Add push notifications
- Add offline data sync
- Create native apps using React Native
- Add camera permissions for QR scanning

---

**Last Updated**: December 27, 2025
**Status**: Ready for Mobile Testing ✅
