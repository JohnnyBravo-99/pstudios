# Deployment Updates Log

## December 30, 2025 - Media Preservation Update

### Changes Made

#### 1. Updated Deployment Script (`deploy-to-vps.ps1`)

**Problem Addressed**: User-uploaded media files (in `backend/uploads/`) were being deleted during deployment when `git pull` or `git reset --hard` was executed, since this directory is in `.gitignore`.

**Solution**: Enhanced deployment script to backup and restore uploads directory.

**Key Updates**:
- Added Step 1/7: Backup uploads directory before git pull
- Added Step 3/7: Restore uploads directory after git pull
- Added media file verification check at end
- Changed from 6 steps to 7 steps

**New Features**:
```powershell
# Backup before git operations
ssh ${username}@${vpsIP} "cd $vpsProjectPath/backend && if [ -d uploads ]; then tar -czf ~/uploads-backup-temp.tar.gz uploads && echo 'Backup created'; else echo 'No uploads directory to backup'; fi"

# Restore after git operations
ssh ${username}@${vpsIP} "cd $vpsProjectPath/backend && if [ -f ~/uploads-backup-temp.tar.gz ]; then tar -xzf ~/uploads-backup-temp.tar.gz && rm ~/uploads-backup-temp.tar.gz && echo 'Uploads restored'; else echo 'No backup to restore'; fi"

# Verify media accessibility
$mediaCheck = ssh ${username}@${vpsIP} "curl -s -o /dev/null -w '%{http_code}' https://api.paradigmstudios.art/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png"
```

#### 2. Created Documentation

**New Files**:
- `MEDIA_RESTORATION_LOG.md` - Detailed incident report and resolution
- `DEPLOYMENT_UPDATES_LOG.md` - This file, tracking deployment process changes

### Testing Performed

✅ **API Health Check**:
```bash
curl https://api.paradigmstudios.art/api/portfolio
# Returns: 4 portfolio items with full media data
```

✅ **Direct Media Access**:
```bash
curl -I https://api.paradigmstudios.art/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png
# Returns: HTTP/1.1 200 OK
# Content-Type: image/png
# Content-Length: 50919
```

✅ **Portfolio Items Verified**:
- Branding Style Guide: 8 images ✓
- Antique Roll Top Desk: 5 images ✓
- Ember & Ash: 5 images ✓
- MRDR1 Gaming Community Logo: 1 image ✓
- **Total**: 40 media files

✅ **Blog Posts Verified**:
- 1 blog post with media ✓
- 4 blog media files ✓

### Deployment Process Changes

#### Old Process (6 steps):
1. Pull code from GitHub
2. Install backend dependencies
3. Install frontend dependencies
4. Build frontend
5. Restart backend
6. Verify deployment

#### New Process (7 steps):
1. **NEW: Backup uploads directory**
2. Pull code from GitHub
3. **NEW: Restore uploads directory**
4. Install backend dependencies
5. Install frontend dependencies
6. Build frontend
7. Restart backend
   - **ENHANCED: Added media file verification**

### Impact

**Before Fix**:
- Portfolio images: ❌ Broken (404 errors)
- Only 1 image loading (ARTD logo)
- Blog images: ❌ Potentially broken

**After Fix**:
- Portfolio images: ✅ All 40+ images loading
- Blog images: ✅ All 4 images accessible
- Live site: ✅ Fully functional at https://www.paradigmstudios.art

### Future Recommendations

1. **Automated Backup Strategy**:
   ```bash
   # Daily cron job on VPS
   0 2 * * * tar -czf ~/backups/uploads-$(date +\%Y\%m\%d).tar.gz ~/mernvps/backend/uploads/
   0 2 * * * find ~/backups/uploads-*.tar.gz -mtime +7 -delete
   ```

2. **Monitoring**:
   - Add health check for media file availability
   - Alert if uploads directory size drops unexpectedly

3. **Documentation**:
   - Add media upload procedures to admin guide
   - Document media migration process for new deployments

### Related Files

- `deploy-to-vps.ps1` - Updated deployment script
- `MEDIA_RESTORATION_LOG.md` - Incident report
- `TROUBLESHOOTING.md` - Common issues guide (to be updated)
- `.gitignore` - Contains `backend/uploads/` exclusion

### Commands for Manual Recovery

If media files are lost in future deployments:

```powershell
# From local machine (Windows)
scp -r backend/uploads/portfolio jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/
scp -r backend/uploads/blog jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/

# Verify on VPS
ssh jay_gatsby@212.38.95.123 "find ~/mernvps/backend/uploads -type f | wc -l"

# Test media accessibility
curl -I https://api.paradigmstudios.art/media/portfolio/[item-id]/[filename]
```

---

**Last Updated**: December 30, 2025
**Updated By**: Claude Sonnet 4.5
**Status**: ✅ Resolved and Deployed
