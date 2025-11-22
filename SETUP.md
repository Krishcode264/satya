# CHAMELEON Setup Guide

## Quick Setup (All Platforms)

### Step 1: Install Dependencies

From the root directory:

```bash
npm install
cd server && npm install && cd ..
cd frontend-trap && npm install && cd ..
cd dashboard && npm install && cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### Step 2: Start All Services

**Option A: Run everything at once (recommended)**
```bash
npm run dev
```

This will start:
- Backend server on port 3001
- Frontend trap on port 3000
- Dashboard on port 3002

**Option B: Run services separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend Trap):
```bash
cd frontend-trap
npm start
```

Terminal 3 (Dashboard):
```bash
cd dashboard
npm start
```

## Access Points

Once running, access:

- **Frontend Trap (Fake Website)**: http://localhost:3000
- **Forensic Dashboard**: http://localhost:3002
- **Backend API**: http://localhost:3001

## Testing the System

1. Open the **Frontend Trap** (http://localhost:3000)
2. Try entering malicious inputs like:
   - `admin' OR '1'='1` (SQL Injection)
   - `<script>alert('XSS')</script>` (XSS)
   - `; cat /etc/passwd` (Command Injection)
3. Open the **Dashboard** (http://localhost:3002) to see attacks logged in real-time

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

- **Backend (3001)**: Change `PORT` in `server/index.js` or set `PORT=3001` environment variable
- **Frontend (3000)**: React will prompt to use a different port
- **Dashboard (3002)**: Change `PORT=3002` in `dashboard/package.json` or use `.env` file

### WebSocket Connection Issues

If the dashboard shows "Disconnected":
- Ensure the backend is running on port 3001
- Check browser console for WebSocket errors
- The dashboard will fall back to polling every 2 seconds if WebSocket fails

### Windows-Specific Issues

- Use Git Bash or WSL for better compatibility
- Or use PowerShell with proper escaping
- The `cross-env` package handles environment variables cross-platform

## Development Notes

- Backend uses `nodemon` for auto-reload
- Frontend and Dashboard use React's hot-reload
- All services support hot-reloading during development

## Production Build

To build for production:

```bash
cd frontend-trap && npm run build
cd ../dashboard && npm run build
```

Production builds will be in `frontend-trap/build` and `dashboard/build`.

