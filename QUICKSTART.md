# Email Lookup - Quick Start

## Problem
You got the error: `Failed to execute 'json' on 'Response': Unexpected end of JSON input`

This happened because the API endpoint wasn't running.

## Solution

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - API server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `concurrently` - Run multiple commands

### Step 2: Add Your Privy App Secret

Edit your `.env` file and add:

```bash
PRIVY_APP_SECRET=your-app-secret-here
```

Get this from: https://dashboard.privy.io → Settings → API Keys

### Step 3: Run Both Servers

**Option A: Run everything at once (Recommended)**
```bash
npm run dev:all
```

This runs:
- Vite dev server on `http://localhost:5173` (your React app)
- Express API server on `http://localhost:3001` (the `/api/lookup-user` endpoint)

**Option B: Run separately in two terminals**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run dev:api
```

### Step 4: Test It

1. Open http://localhost:5173
2. Login with your account
3. Go to "Email to Address Lookup" section
4. Enter an email address
5. Click "Lookup user"

You should now see the wallet addresses!

## How It Works

```
Browser (React on :5173)
    ↓ /api/lookup-user
Vite Proxy
    ↓ proxies to :3001
Express Server (:3001)
    ↓ calls Privy API
Returns wallet addresses
```

## Troubleshooting

### Error: "Cannot find module 'express'"
**Solution:** Run `npm install`

### Error: "Missing Privy credentials"
**Solution:** Add `PRIVY_APP_SECRET` to your `.env` file

### Error: "EADDRINUSE: address already in use :::3001"
**Solution:** Kill the process using port 3001:
```bash
lsof -ti:3001 | xargs kill -9
```

### API server not starting
**Solution:** Make sure you're running Node.js 18 or higher:
```bash
node --version
```

## Production Deployment

For production, deploy to Vercel or Netlify where the `/api` folder works automatically.

The `server.js` file is for local development only.
