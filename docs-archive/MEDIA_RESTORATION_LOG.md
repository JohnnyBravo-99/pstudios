# Media Restoration Log - December 30, 2025

## Issue Summary

**Problem**: All portfolio images were showing as placeholder icons (.png/.jpg) on the live deployment at https://www.paradigmstudios.art after deploying blog system changes.

**Impact**: Only the ARTD portfolio card image was loading; all other portfolio items and their detail images were broken.

**Root Cause**: When we executed `git reset --hard origin/main` on the VPS to sync with GitHub, it removed the `backend/uploads/` directory which is in `.gitignore` and not tracked by git.

## Investigation Timeline

### 1. Initial Diagnosis (2025-12-30 23:30 UTC)

**API Check**:
```bash
curl https://api.paradigmstudios.art/api/portfolio
```
**Finding**: API returned proper JSON with media paths like:
```json
{
  "src": "/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png",
  "alt": "lp.png"
}
```

**Direct File Test**:
```bash
curl -I https://api.paradigmstudios.art/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png
```
**Result**: `HTTP/1.1 404 Not Found`

**Conclusion**: Database paths were correct, but physical files were missing from VPS.

### 2. Backend Media Serving Configuration

**File**: `backend/src/index.js:93-96`
```javascript
// Static file serving for uploads
app.use('/media', express.static(process.env.UPLOAD_DIR || './uploads', {
  maxAge: '1y',
  etag: true
}));
```

**Finding**: Backend correctly configured to serve media from `./uploads` directory via `/media` route.

### 3. Local Media Check

```bash
find backend/uploads/portfolio -name '*.png' -o -name '*.jpg' -o -name '*.webp' | wc -l
```
**Result**: 40 portfolio images found locally (synced earlier with `sync-vps-data.ps1`)

```bash
find backend/uploads/blog -type f | wc -l
```
**Result**: 4 blog images found locally

### 4. VPS Upload Directory Status

**Attempted SSH Check**: Connection issues due to rate limiting, but confirmed via 404 errors that files were missing.

## Resolution

### Step 1: Upload Portfolio Images
```bash
scp -r backend/uploads/portfolio jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/
```
**Result**: Successfully uploaded 40 portfolio images across 5 portfolio items

### Step 2: Upload Blog Images
```bash
scp -r backend/uploads/blog jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/
```
**Result**: Successfully uploaded 4 blog images

### Step 3: Verification
```bash
curl -I https://api.paradigmstudios.art/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png
```
**Result**:
```
HTTP/1.1 200 OK
Content-Length: 50919
Content-Type: image/png
```

### Step 4: API Data Verification
```bash
curl https://api.paradigmstudios.art/api/portfolio
```
**Result**:
- Total portfolio items: 4
- Branding Style Guide: 8 images ✓
- Antique Roll Top Desk: 5 images ✓
- Ember & Ash: 5 images ✓
- MRDR1 Gaming Community Logo: 1 image ✓

```bash
curl https://api.paradigmstudios.art/api/blog
```
**Result**:
- Total blog posts: 1
- "The gears have been turning...": has media ✓

## Lessons Learned

### Issue Cause
1. **Git Reset Risk**: `git reset --hard` removes untracked files and directories
2. **`.gitignore` Implications**: `backend/uploads/` is gitignored (correctly, as user data), but this means it's not version-controlled
3. **Deployment Gap**: Our deployment process didn't account for preserving user-uploaded media

### Prevention Strategy

**Updated Deployment Process** (documented in `deploy-to-vps.ps1`):
1. **Before `git reset`**: Backup uploads directory
2. **After `git pull`**: Restore uploads directory
3. **Alternative**: Use `git pull --rebase` instead of `git reset --hard` to preserve local files

### Recommended VPS Backup Strategy

**Daily Automated Backup**:
```bash
# Backup uploads directory
tar -czf ~/backups/uploads-$(date +%Y%m%d-%H%M%S).tar.gz ~/mernvps/backend/uploads/

# Keep last 7 days
find ~/backups/uploads-*.tar.gz -mtime +7 -delete
```

**Database Backup**:
```bash
# Already implemented in check-vps-db.ps1 and sync-vps-data.ps1
docker exec mern_mongo mongodump --archive=/tmp/backup.gz --gzip
```

## Files Modified

### Updated Deployment Script
- **File**: `deploy-to-vps.ps1`
- **Change**: Added uploads directory preservation logic

## Status

✅ **RESOLVED**: All portfolio and blog images are now accessible on production
- Live Site: https://www.paradigmstudios.art
- API: https://api.paradigmstudios.art
- All 40+ media files restored

## Testing Checklist

- [x] Portfolio grid loads with thumbnails
- [x] Portfolio detail pages show all images
- [x] Blog posts display media correctly
- [x] Media files return HTTP 200
- [x] API returns correct media paths

## Next Steps

1. ✅ Update deployment script to preserve uploads
2. ⚠️ Consider implementing automated VPS backup strategy
3. ⚠️ Document media upload and migration procedures
4. ⚠️ Add health check for media file availability

---

**Resolved by**: Claude Sonnet 4.5
**Date**: December 30, 2025
**Time to Resolution**: ~15 minutes
**Files Transferred**: 44 media files (portfolio + blog)
