# Using ngrok to Expose Frontend

## What is ngrok?
ngrok creates a public URL that tunnels to your local application, allowing external access.

## Installation Methods

### Method 1: Via npm (Recommended)
```bash
npm install -g ngrok
```

### Method 2: Download from Website
1. Visit https://ngrok.com/download
2. Download for Windows
3. Extract the `ngrok.exe` file
4. Add to PATH or use full path

### Method 3: Via Chocolatey
```bash
choco install ngrok
```

## Usage

### Basic Usage
```bash
ngrok http 3000
```

### With Custom Region
```bash
ngrok http 3000 --region us
```

### Save Configuration (Optional)
Create `~/.ngrok2/ngrok.yml`:
```yaml
authtoken: your_auth_token
tunnels:
  radha-swami:
    proto: http
    addr: 3000
    region: in
```

Then run:
```bash
ngrok start radha-swami
```

## After Installation

### Step 1: Make sure frontend is running
```bash
cd Frontend
npm run dev
```
(Should show: ➜ Network: http://10.45.236.80:3000)

### Step 2: Open new terminal and run ngrok
```bash
ngrok http 3000
```

### Step 3: You'll see
```
ngrok by @inconshreveable (Invite to private beta)

Session Status                online
Account                       (Plan: Free)
Version                        2.3.40
Region                         United States (us)
Web Interface                  http://127.0.0.1:4040
Forwarding                     http://xxxxxxxx.ngrok.io -> http://localhost:3000
Forwarding                     https://xxxxxxxx.ngrok.io -> http://localhost:3000
```

### Step 4: Share the public URL
Use `https://xxxxxxxx.ngrok.io` to access your app from anywhere!

## Update Backend URL

If using ngrok public URL, update Frontend `.env.local`:
```
VITE_API_BASE_URL=http://10.45.236.80:5000
```
(Keep using local network IP for backend since both are on same network)

## Troubleshooting

### ngrok not found after install
```bash
# Restart terminal or:
npm list -g ngrok
```

### Need to Install nodejs first?
```bash
node --version
npm --version
```

### Want to skip ngrok?
Just use the local network IP:
- Frontend: `http://10.45.236.80:3000`
- Backend: `http://10.45.236.80:5000`

This works if you're on the same network!

## ngrok Web Dashboard
While ngrok is running, visit `http://127.0.0.1:4040` to see all requests being tunneled.

## Free Plan Limits
- URL changes every restart
- 40 requests/minute
- No authentication
- 2 hour session limit

For permanent URLs, upgrade to paid plan.
