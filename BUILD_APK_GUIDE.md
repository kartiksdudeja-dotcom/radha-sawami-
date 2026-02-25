# Build Android App APK - Complete Guide

## Overview
Convert your React RS Portal app into a standalone Android app (.apk) that users can download and install on their phones.

## Prerequisites

### Install Required Tools:

1. **Node.js & npm** (Already installed)
   ```bash
   node --version
   npm --version
   ```

2. **Java Development Kit (JDK 11+)**
   - Download: https://www.oracle.com/java/technologies/downloads/
   - Or use OpenJDK: `choco install openjdk11` (Windows)

3. **Android SDK**
   - Download Android Studio: https://developer.android.com/studio
   - Or download Command-line tools: https://developer.android.com/studio#downloads

4. **Gradle** (Usually comes with Android Studio)

5. **Git** (Usually already installed)

## Step 1: Install Capacitor

Run these commands in the Frontend directory:

```bash
cd "Frontend"
npm install @capacitor/core @capacitor/cli --save-dev
npm install @capacitor/android @capacitor/app @capacitor/storage
```

## Step 2: Initialize Capacitor

```bash
npx cap init RSPortal com.radhswami.portal
```

When prompted:
- App name: `RSPortal`
- Package ID: `com.radhswami.portal`
- Web dir: `dist`

This creates `capacitor.config.ts` file.

## Step 3: Build Your React App

```bash
npm run build
```

This creates the optimized `dist` folder needed for the APK.

## Step 4: Add Android Platform

```bash
npx cap add android
```

This creates the `android` folder with native Android project.

## Step 5: Configure Android App

Edit `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.radhswami.portal"
        minSdkVersion 24
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

## Step 6: Build APK

```bash
cd android
./gradlew assembleRelease
```

**Windows users (with Gradle installed):**
```bash
cd android
gradlew assembleRelease
```

Or use Android Studio GUI:
```bash
./gradlew assembleRelease --build-cache
```

## Step 7: Locate Your APK

After successful build, your APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Step 8: Rename & Copy APK

```bash
# Rename for easier reference
copy android/app/build/outputs/apk/release/app-release.apk Frontend/public/RSPortal.apk
```

## Step 9: Test the APK

1. **On Physical Device:**
   - Enable USB Debugging in Developer Options
   - Connect via USB
   - Run: `adb install Frontend/public/RSPortal.apk`

2. **Or Use Android Emulator:**
   - Open Android Studio
   - Create/Run an emulator
   - Run: `adb install Frontend/public/RSPortal.apk`

## Step 10: Host APK for Download

The APK is now available at:
```
http://192.168.1.107:3000/download.html
```

Users can:
1. Scan the QR code in your app
2. Download the APK
3. Install on their Android phone

## Configuration Updates

### Update API Endpoint in APK

Edit `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.radhswami.portal',
  appName: 'RSPortal',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
  server: {
    url: 'http://192.168.1.107:3000',
    cleartext: true
  }
};
```

### Update API Calls

In your API files, use:
```javascript
const API_BASE_URL = 'http://192.168.1.107:5000/api';
```

## Troubleshooting

### Issue: "Cannot find gradle"
**Solution:** Set GRADLE_HOME or use Android Studio's bundled Gradle

### Issue: "Java not found"
**Solution:** Install JDK and set JAVA_HOME environment variable:
```bash
setx JAVA_HOME "C:\Program Files\Java\jdk-11.0.x"
```

### Issue: Build fails with SDK version
**Solution:** Update Android SDK through Android Studio SDK Manager

### Issue: APK too large
**Solution:** Enable ProGuard/R8 minification:
```gradle
buildTypes {
    release {
        minifyEnabled true
    }
}
```

## Build Commands Reference

```bash
# Build APK (release)
npx cap build android --release

# Build and install to device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Update Capacitor files after web build
npx cap copy

# Sync with native code
npx cap sync android

# Open Android Studio
npx cap open android
```

## Distribution Options

After creating APK:

1. **Direct Download Link** (Current setup)
   - Users download from download.html
   - Scan QR code to access

2. **Google Play Store**
   - Upload APK to Play Console
   - Publish app
   - Users download from Play Store

3. **Firebase App Distribution**
   - Test builds before Play Store
   - Share with beta testers

4. **Manual Installation**
   - Send APK file directly
   - Users: Settings → Security → Unknown Sources → Install

## Next Steps

1. Run: `npm install @capacitor/core @capacitor/cli --save-dev`
2. Initialize Capacitor: `npx cap init`
3. Build React: `npm run build`
4. Add Android: `npx cap add android`
5. Build APK: `cd android && gradlew assembleRelease`
6. Copy APK to `Frontend/public/RSPortal.apk`
7. Start server and test download.html

## Important Notes

⚠️ **API Endpoint**: Update your API calls to use the IP address, not localhost
⚠️ **HTTPS**: For production, enable HTTPS and update security policies
⚠️ **Permissions**: Add required permissions in `android/app/src/AndroidManifest.xml`
⚠️ **Signing Key**: Generate proper signing keys for Play Store release

## Version Updates

Each time you make changes:

1. Update version in `capacitor.config.ts`
2. Run `npm run build`
3. Run `npx cap copy`
4. Rebuild APK: `cd android && gradlew assembleRelease`
5. Copy new APK to `public` folder

---

**Last Updated**: December 27, 2025
**Status**: Ready to Build APK 🚀
