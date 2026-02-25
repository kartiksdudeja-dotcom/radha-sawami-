#!/bin/bash
# NOTIFICATION SYSTEM SETUP SCRIPT
# Run this script to help set up the notification system

set -e

echo "🔔 Radha Swami - Notification System Setup"
echo "=========================================="
echo ""

# Check if we're in the project root
if [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure found"
echo ""

# Step 1: Generate VAPID Keys
echo "📝 Step 1: Generating VAPID Keys..."
echo "======================================"
echo ""
echo "Moving to Backend directory..."
cd Backend

if ! command -v npx &> /dev/null; then
    echo "❌ Error: npm/npx is not installed"
    exit 1
fi

echo "📦 Generating VAPID keys..."
echo ""
echo "Please run this command:"
echo "  npx web-push generate-vapid-keys"
echo ""
echo "Save the output in Backend/.env:"
echo "  VAPID_PUBLIC_KEY=<your-public-key>"
echo "  VAPID_PRIVATE_KEY=<your-private-key>"
echo "  VAPID_EMAIL=<your-email>"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Web Push Configuration
# Generate keys with: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=your@email.com

# Other configuration
DATABASE_PATH=./radha_swami.db
PORT=5000
EOF
    echo "✅ .env file created. Please fill in the VAPID keys"
else
    echo "✅ .env file exists"
fi

cd ..
echo ""

# Step 2: Check Frontend setup
echo "Step 2: Frontend Configuration"
echo "======================================"
echo ""

if [ ! -f "Frontend/.env.local" ] && [ ! -f "Frontend/.env" ]; then
    echo "Creating Frontend/.env.local..."
    cat > Frontend/.env.local << 'EOF'
# Web Push Configuration
VITE_VAPID_PUBLIC_KEY=

# API Configuration
VITE_API_BASE_URL=http://localhost:5000
EOF
    echo "✅ .env.local file created"
fi

echo ""

# Step 3: Verify files
echo "Step 3: Verifying Required Files"
echo "======================================"
echo ""

files_ok=true

# Frontend files
echo "Checking Frontend files..."
for file in "Frontend/src/pages/Notification.jsx" "Frontend/src/styles/Notification.css" "Frontend/public/service-worker.js"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
        files_ok=false
    fi
done

echo ""
echo "Checking Backend files..."
for file in "Backend/push_notifications.js" "Backend/notification_routes.js" "Backend/notification_examples.js"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
        files_ok=false
    fi
done

echo ""

if [ "$files_ok" = false ]; then
    echo "❌ Some files are missing. Please recreate them."
    exit 1
fi

echo "✅ All required files are present"
echo ""

# Step 4: Verify packages
echo "Step 4: Verifying Packages"
echo "======================================"
echo ""

cd Backend
if npm list web-push > /dev/null 2>&1; then
    echo "✅ web-push package installed"
else
    echo "❌ web-push not installed. Run: npm install web-push"
fi
cd ..

echo ""

# Step 5: Setup Instructions
echo "Step 5: Next Steps"
echo "======================================"
echo ""

cat << 'EOF'
To complete the setup:

1. Generate VAPID Keys:
   cd Backend
   npx web-push generate-vapid-keys
   
2. Update Backend/.env with the keys:
   VAPID_PUBLIC_KEY=<your-public-key>
   VAPID_PRIVATE_KEY=<your-private-key>
   VAPID_EMAIL=<your-email>

3. Update Frontend/.env.local:
   VITE_VAPID_PUBLIC_KEY=<your-public-key>

4. Update Backend/server.js to initialize push notifications:
   
   import { initializePushNotifications } from './push_notifications.js';
   import notificationRoutes from './notification_routes.js';
   
   // After creating app
   initializePushNotifications(
     process.env.VAPID_PUBLIC_KEY,
     process.env.VAPID_PRIVATE_KEY,
     process.env.VAPID_EMAIL
   );
   
   // Register routes
   app.use('/api', notificationRoutes);

5. Register Service Worker in Frontend/src/index.jsx:
   
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
       navigator.serviceWorker.register('/service-worker.js')
         .then(reg => console.log('✅ SW registered:', reg))
         .catch(err => console.error('❌ SW failed:', err));
     });
   }

6. Test the system:
   - Start Backend: npm run dev (or npm start)
   - Start Frontend: npm run dev
   - Navigate to Notifications page
   - Click "Enable Notifications"
   - Check that notifications work

📚 Documentation:
   - WEB_PUSH_SETUP_GUIDE.md - Complete guide
   - NOTIFICATION_QUICK_START.md - Quick reference
   - NOTIFICATION_IMPLEMENTATION_SUMMARY.md - Summary

🎉 You're ready to go!
EOF

echo ""
echo "✅ Setup verification complete!"
