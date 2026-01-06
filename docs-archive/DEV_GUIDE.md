# Development Environment Guide

Complete guide for setting up and running the Paradigm Studios development environment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Modes](#development-modes)
3. [First Time Setup](#first-time-setup)
4. [Daily Development Workflow](#daily-development-workflow)
5. [Troubleshooting](#troubleshooting)
6. [Understanding CORS](#understanding-cors)

---

## Prerequisites

### Required Software
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version    # Should show v16.x or higher
npm --version     # Should show 8.x or higher
docker --version  # Should show Docker version info
```

---

## Development Modes

### Mode 1: Local Database (Recommended) ⭐

**Use when:** Full-stack development, testing database operations, preparing for deployment

**Advantages:**
- ✅ Real MongoDB database operations
- ✅ No CORS issues (everything on localhost)
- ✅ Data persists between restarts
- ✅ Closest to production environment
- ✅ Test authentication, file uploads, etc.

**Requirements:**
- Docker Desktop running
- ~500MB disk space for MongoDB image

**Start Command:**
```powershell
.\start-dev-local.ps1
```

**Ports Used:**
- 3000 - Frontend (React dev server)
- 3001 - Backend (Express API)
- 27017 - MongoDB
- 8081 - Mongo Express (Optional web UI)

**Database Connection:**
```
mongodb://localhost:27017/pstudios-dev
```

---

### Mode 2: Mock Mode (Quick UI Development)

**Use when:** UI-only changes, quick frontend iterations, no database needed

**Advantages:**
- ✅ Fastest startup (no Docker needed)
- ✅ Pre-populated mock data
- ✅ No dependencies on external services
- ✅ Works offline

**Limitations:**
- ❌ No real database persistence
- ❌ Mock authentication only
- ❌ Limited to predefined data

**Start Command:**
```batch
start-dev.bat
```
OR
```powershell
.\start-dev.ps1
```

**Mock Admin Credentials:**
- Email: admin@pstudios.com
- Password: admin123

---

## First Time Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd pstudios

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../pstudios-landingpage
npm install

# Return to project root
cd ..
```

### 2. Start Docker Desktop

1. Open Docker Desktop from Start Menu
2. Wait for the whale icon in system tray to stop animating
3. Verify: `docker info` should work without errors

### 3. Start Development Environment

```powershell
.\start-dev-local.ps1
```

The script will:
1. ✓ Check if Docker is running
2. ✓ Create/start MongoDB container
3. ✓ Clean up any processes on ports 3000/3001
4. ✓ Install missing dependencies
5. ✓ Start backend server (auto-restart on changes)
6. ✓ Start frontend server (hot-reload enabled)

### 4. Create Admin User

In a new terminal:
```bash
cd backend
node scripts/create-admin.js
```

Follow the prompts to create your admin account.

### 5. Access the Application

Open your browser:
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/cp-admin
- **API Health:** http://localhost:3001/api/health
- **Mongo Express:** http://localhost:8081 (login: admin/admin)

---

## Daily Development Workflow

### Starting Your Day

1. **Start Docker Desktop** (if using local database mode)
   - Wait for it to fully initialize

2. **Start Development Environment**
   ```powershell
   .\start-dev-local.ps1
   ```

3. **Open Your Editor**
   ```bash
   code .  # VS Code
   ```

### Development Process

**Frontend Changes:**
- Edit files in `pstudios-landingpage/src/`
- Browser auto-reloads on save
- Check browser console for errors

**Backend Changes:**
- Edit files in `backend/src/`
- Server auto-restarts via nodemon
- Check backend terminal for errors

**Database Changes:**
- View data via Mongo Express: http://localhost:8081
- Or use MongoDB Compass: `mongodb://localhost:27017/pstudios-dev`

### Stopping Servers

**Option 1:** Close the terminal windows

**Option 2:** Press `Ctrl+C` in each terminal

**Stop MongoDB Container:**
```bash
docker stop pstudios_mongo_dev
```

**Stop Everything (including Docker):**
```bash
docker-compose -f backend/docker-compose.dev.yml down
```

---

## Troubleshooting

### Problem: "Docker Desktop is not running"

**Solution:**
1. Open Docker Desktop from Start Menu
2. Wait 30-60 seconds for full initialization
3. Look for whale icon in system tray (should stop animating)
4. Run script again

### Problem: Port 3000 or 3001 Already in Use

**Solution:** The script automatically kills processes on these ports. If it fails:

```powershell
# Manual cleanup
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Problem: Frontend Shows CORS Errors

**Symptoms:**
```
Access to fetch at 'https://api.paradigmstudios.art/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Cause:** Frontend is connecting to production API instead of local backend

**Solution:**
1. Stop frontend server (Ctrl+C)
2. Check that backend is running on port 3001
3. Restart frontend with correct command:
   ```bash
   cd pstudios-landingpage
   npm run start:dev:backend
   ```

**Verify Fix:** Check browser console for:
```
🔧 API Configuration: {
  API_BASE_URL: "http://localhost:3001"
}
```

### Problem: MongoDB Connection Failed

**Check MongoDB Status:**
```bash
docker ps | grep mongo
```

**Restart MongoDB:**
```bash
docker restart pstudios_mongo_dev
```

**View MongoDB Logs:**
```bash
docker logs pstudios_mongo_dev
```

### Problem: Backend Won't Start

**Check for errors:**
1. Look at backend terminal for error messages
2. Common issues:
   - Missing `.env.development` file
   - MongoDB not running
   - Port 3001 in use

**Verify environment file exists:**
```bash
ls backend/.env.development
```

**Check backend logs:**
- Look for "Connected to MongoDB" message
- Look for "Server running on port 3001" message

### Problem: Changes Not Reflecting

**Frontend not updating:**
- Hard refresh: `Ctrl+Shift+R`
- Clear cache and reload
- Check terminal for build errors

**Backend not restarting:**
- Check nodemon is running (should show in terminal)
- Manually restart: `Ctrl+C` then `npm run dev:local`

---

## Understanding CORS

### What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature that blocks web requests between different domains.

### Why CORS Matters in Development

**No CORS Issues (Good):**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- ✅ Same domain (localhost), different ports = ALLOWED

**CORS Issues (Bad):**
- Frontend: `http://localhost:3000`
- Backend: `https://api.paradigmstudios.art`
- ❌ Different domains = BLOCKED (unless explicitly allowed)

### How We Handle CORS

**In Development ([backend/src/index.js](backend/src/index.js#L43-L82)):**
```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      // ... production domains
    ];
    // Allow if origin is in the list
  },
  credentials: true
}));
```

**The Duplicate Header Issue:**

When you connect local frontend to VPS backend through a reverse proxy (Caddy/nginx):

1. Express adds CORS headers
2. Reverse proxy ALSO adds CORS headers
3. Browser sees duplicate headers → BLOCKS request

**Solution:** Don't connect local frontend to production backend during development. Always use:
- Local frontend → Local backend (recommended)
- OR use mock mode

### CORS Best Practices

1. **Local Development:** Always use `http://localhost:3001` backend
2. **Testing Production API:** Use production frontend, not local
3. **Debugging:** Check Network tab for `Access-Control-Allow-Origin` header
4. **Never:** Disable CORS in production (security risk)

---

## Quick Reference

### Useful Commands

**Backend:**
```bash
cd backend
npm run dev:local          # Start with local DB
npm run dev:mock          # Start with mock data
npm run seed              # Seed database
node scripts/create-admin.js  # Create admin user
```

**Frontend:**
```bash
cd pstudios-landingpage
npm run start:dev:backend  # Local backend mode
npm run start:dev         # Basic dev mode
npm run build             # Production build
```

**Docker:**
```bash
docker ps                              # List running containers
docker stop pstudios_mongo_dev        # Stop MongoDB
docker start pstudios_mongo_dev       # Start MongoDB
docker logs pstudios_mongo_dev        # View logs
docker-compose -f backend/docker-compose.dev.yml down  # Stop all
```

### Environment Variables

**Backend ([backend/.env.development](backend/.env.development)):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/pstudios-dev
JWT_SECRET=dev_jwt_secret_key...
CLIENT_ORIGIN=http://localhost:3000
```

**Frontend (set via npm scripts):**
- `REACT_APP_BACKEND_MODE` - Controls API URL (local/production/mock)
- `REACT_APP_API_URL` - Override API URL directly

### File Locations

- **Backend Entry:** `backend/src/index.js`
- **Frontend Entry:** `pstudios-landingpage/src/index.js`
- **Backend Routes:** `backend/src/routes/`
- **Frontend Pages:** `pstudios-landingpage/src/pages/`
- **API Config:** `pstudios-landingpage/src/config/api.js`
- **Database Models:** `backend/src/models/`

---

## Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Check [DEVELOPMENT_HISTORY.md](DEVELOPMENT_HISTORY.md) for past issues
3. Review backend terminal output for errors
4. Review browser console for frontend errors
5. Check Docker Desktop for container status

---

**Last Updated:** 2025-12-29
