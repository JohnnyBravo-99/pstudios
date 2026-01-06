# Deploy to VPS - Paradigm Studios
# This script deploys the latest code from GitHub to the production VPS
# IMPORTANT: Preserves user-uploaded media files during deployment

$vpsIP = "212.38.95.123"
$username = "jay_gatsby"
$vpsProjectPath = "~/mernvps"

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Deploy to VPS - Paradigm Studios" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "[1/7] Backing up uploads directory..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath/backend && if [ -d uploads ]; then tar -czf ~/uploads-backup-temp.tar.gz uploads && echo 'Backup created'; else echo 'No uploads directory to backup'; fi"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Uploads directory backed up" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Uploads backup failed, continuing anyway" -ForegroundColor Yellow
}

Write-Host "`n[2/7] Connecting to VPS and pulling latest code..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath && git pull origin main"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to pull from GitHub" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Code updated from GitHub" -ForegroundColor Green

Write-Host "`n[3/7] Restoring uploads directory..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath/backend && if [ -f ~/uploads-backup-temp.tar.gz ]; then tar -xzf ~/uploads-backup-temp.tar.gz && rm ~/uploads-backup-temp.tar.gz && echo 'Uploads restored'; else echo 'No backup to restore'; fi"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Uploads directory restored" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Uploads restoration issue, media may need manual sync" -ForegroundColor Yellow
}

Write-Host "`n[4/7] Installing backend dependencies..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath/backend && npm install"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Backend dependencies installed" -ForegroundColor Green

Write-Host "`n[5/7] Installing frontend dependencies..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath/pstudios-landingpage && npm install"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Frontend dependencies installed" -ForegroundColor Green

Write-Host "`n[6/7] Building frontend for production..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath/pstudios-landingpage && npm run build"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to build frontend" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Frontend built successfully" -ForegroundColor Green

Write-Host "`n[7/7] Restarting backend service..." -ForegroundColor Cyan
ssh ${username}@${vpsIP} "cd $vpsProjectPath/backend && docker compose restart api"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARNING] Failed to restart backend via docker compose" -ForegroundColor Yellow
    Write-Host "  Trying alternative restart method..." -ForegroundColor Yellow
    ssh ${username}@${vpsIP} "pm2 restart mern-backend || (cd $vpsProjectPath/backend && pm2 restart all)"
}
Write-Host "  [OK] Backend service restarted" -ForegroundColor Green

Write-Host "`n[Verification] Testing deployment..." -ForegroundColor Cyan
Write-Host "  Checking API health..." -ForegroundColor Yellow

$apiCheck = ssh ${username}@${vpsIP} "curl -s -o /dev/null -w '%{http_code}' https://api.paradigmstudios.art/api/portfolio"

if ($apiCheck -eq "200") {
    Write-Host "  [OK] API is responding (HTTP 200)" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] API returned HTTP $apiCheck" -ForegroundColor Yellow
}

Write-Host "  Checking media files..." -ForegroundColor Yellow
$mediaCheck = ssh ${username}@${vpsIP} "curl -s -o /dev/null -w '%{http_code}' https://api.paradigmstudios.art/media/portfolio/6937a362fe982ca4ed6b0ac4/media-1765253999381-893598626.png"

if ($mediaCheck -eq "200") {
    Write-Host "  [OK] Media files accessible" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Media files not accessible (HTTP $mediaCheck)" -ForegroundColor Red
    Write-Host "  You may need to run: scp -r backend/uploads/* jay_gatsby@212.38.95.123:~/mernvps/backend/uploads/" -ForegroundColor Yellow
}

Write-Host "`n================================================" -ForegroundColor Green
Write-Host " Deployment Complete!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "Deployment Summary:" -ForegroundColor White
Write-Host "  VPS IP:           $vpsIP" -ForegroundColor Gray
Write-Host "  Website:          https://www.paradigmstudios.art" -ForegroundColor Gray
Write-Host "  API:              https://api.paradigmstudios.art" -ForegroundColor Gray
Write-Host "  Admin Panel:      https://www.paradigmstudios.art/admin" -ForegroundColor Gray

Write-Host "`nNext Steps:" -ForegroundColor White
Write-Host "  1. Test portfolio images on the website" -ForegroundColor Gray
Write-Host "  2. Test blog system at the home page" -ForegroundColor Gray
Write-Host "  3. Verify admin panel functionality" -ForegroundColor Gray
Write-Host "  4. Check that all styling updates are visible" -ForegroundColor Gray

Write-Host "`nNote: If you see any errors, check VPS logs with:" -ForegroundColor Yellow
Write-Host "  ssh ${username}@${vpsIP} 'docker logs mern_api --tail 50'" -ForegroundColor Gray

pause
