# Troubleshooting CORS and API Connection Issues

## Problem: Frontend connecting to production API instead of localhost

### Symptoms
- Error: `Access to fetch at 'https://api.paradigmstudios.art/api/portfolio' from origin 'http://localhost:3000' has been blocked by CORS policy`
- Frontend is trying to connect to production API instead of local backend

### Root Cause
The frontend was started with `npm start` instead of `npm run start:dev:local`, so the `REACT_APP_BACKEND_MODE` environment variable is not set.

### Solution

**Option 1: Use the correct npm script (Recommended)**

Stop the current frontend server (Ctrl+C) and restart with:

```bash
cd pstudios-landingpage
npm run start:dev:local
```

**Option 2: Use PowerShell script**

Stop all servers and run:

```powershell
.\dev-local.ps1
```

**Option 3: Set environment variable manually**

```bash
cd pstudios-landingpage
$env:REACT_APP_BACKEND_MODE="local"; npm start
```

### Verify It's Working

1. Check the browser console - you should see:
   ```
   🔧 API Configuration: {
     NODE_ENV: "development",
     REACT_APP_BACKEND_MODE: "local",
     REACT_APP_API_URL: undefined,
     API_BASE_URL: "http://localhost:3001"
   }
   ```

2. Check Network tab - API calls should go to `http://localhost:3001/api/...`

3. Make sure backend is running on port 3001:
   ```bash
   cd backend
   npm run dev:local
   ```

### Important Notes

- React environment variables are **baked in at startup time**
- You **must restart** the frontend server after changing environment variables
- Use `npm run start:dev:local` NOT `npm start` for local development
- The debug log in `src/config/api.js` will show you what API URL is being used


---

## Problem: Portfolio Images Showing as Placeholders on Live Site

### Symptoms
- Portfolio cards show generic .png/.jpg file icons instead of actual images
- Only one or two images load, rest show placeholders
- No console errors in browser
- Database returns correct media paths in API
- Direct media URLs return 404 errors

### Example
```bash
# API returns correct path
curl https://api.paradigmstudios.art/api/portfolio
# Shows: "src": "/media/portfolio/abc123/image.png"

# But file returns 404
curl -I https://api.paradigmstudios.art/media/portfolio/abc123/image.png
# Returns: HTTP/1.1 404 Not Found
```

### Root Cause
The `backend/uploads/` directory is in `.gitignore` (correctly, as it contains user data), but when deploying via `git pull` or `git reset --hard`, these files are not preserved on the VPS.

**This typically happens when:**
1. Running `git reset --hard` on VPS
2. Fresh deployment to new server
3. Manual git operations that discard untracked files

### Solution

#### Quick Fix: Manual Upload
```powershell
# From your local machine (Windows PowerShell)
# Upload portfolio images
scp -r backend/uploads/portfolio jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/

# Upload blog images
scp -r backend/uploads/blog jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/

# Verify upload count
ssh jay_gatsby@212.38.95.123 "find ~/mernvps/backend/uploads -type f | wc -l"
```

#### Permanent Fix: Use Updated Deployment Script
The updated `deploy-to-vps.ps1` now automatically preserves uploads:

```powershell
# Run the updated deployment script
.\deploy-to-vps.ps1
```

The script now:
1. Backs up uploads directory before git pull
2. Restores uploads directory after git pull
3. Verifies media files are accessible

### Verify It's Fixed

1. **Test a portfolio image**:
   ```bash
   curl -I https://api.paradigmstudios.art/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png
   ```
   Should return: `HTTP/1.1 200 OK` with `Content-Type: image/png`

2. **Check portfolio count**:
   ```bash
   curl -s https://api.paradigmstudios.art/api/portfolio | grep -o '"images"' | wc -l
   ```
   Should show multiple image arrays

3. **Visit the live site**:
   - https://www.paradigmstudios.art
   - All portfolio cards should show proper thumbnails
   - Portfolio detail pages should show all images

### Prevention

**Always use the deployment script** instead of manual git commands:
```powershell
# ✅ GOOD - Preserves uploads
.\deploy-to-vps.ps1

# ❌ AVOID - May delete uploads
ssh vps "cd ~/mernvps && git reset --hard origin/main"
```

**If you must use git commands manually**, backup first:
```bash
# Backup
tar -czf ~/uploads-backup.tar.gz ~/mernvps/backend/uploads/

# Do git operations
cd ~/mernvps && git pull

# Restore if needed
cd ~/mernvps/backend && tar -xzf ~/uploads-backup.tar.gz
```

### Related Documentation
- See `MEDIA_RESTORATION_LOG.md` for detailed incident report
- See `DEPLOYMENT_UPDATES_LOG.md` for deployment process changes
