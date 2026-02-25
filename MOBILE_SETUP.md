# Mobile Access Setup Guide

Your application is now configured to run on your local network!

## How to Run on Mobile

### 1. **Start the Backend**

```bash
cd Backend
npm start
```

You'll see output like:

```
✅ Radha Swami Backend is running!
🖥️  Local: http://localhost:5000
📱 Network: http://192.168.x.x:5000
📝 API Health Check: http://localhost:5000/api/health
```

**Note the Network IP address** (e.g., `192.168.x.x`)

### 2. **Start the Frontend** (in a new terminal)

```bash
cd Frontend
npm start
```

Your frontend will open in browser at `http://localhost:5173` (or similar)

### 3. **Access on Mobile**

**Same WiFi Network Only:**

1. Open browser on your phone
2. Enter: `http://192.168.x.x:5173` (use the IP from backend startup)
3. Your app will load on mobile

**Example:**

- Backend Network IP: `192.168.1.100`
- Frontend Port: `5173`
- **Mobile URL**: `http://192.168.1.100:5173`

## How It Works

- **Backend**: Now listens on all network interfaces (`0.0.0.0`) instead of just localhost
- **Frontend**: Automatically detects your current IP and routes API calls accordingly
- **API Calls**: Frontend communicates with backend using your local network IP

## Troubleshooting

✅ **Can't connect from mobile?**

- Ensure both devices are on the **same WiFi network**
- Check firewall isn't blocking port 5173 and 5000
- Try using the backend's Network IP (not localhost)

✅ **API calls failing on mobile?**

- Backend must be running (`npm start` in Backend folder)
- Verify API is accessible: visit `http://192.168.x.x:5000/api/health` on mobile

✅ **Wrong IP showing?**

- Restart the backend - it auto-detects your network IP on startup
- Check your WiFi connection settings

## Notes

- Your phone must be on the same local network as your computer
- Ports 5173 (Frontend) and 5000 (Backend) must be accessible
- The app works in any modern mobile browser (Chrome, Safari, Firefox)
