# Sync Production Data from VPS to Local MongoDB
# This exports data from VPS and imports it to your local MongoDB

$vpsIP = "212.38.95.123"
$username = "jay_gatsby"
$databaseName = "merndb"  # Production database name on VPS
$localDatabaseName = "pstudios-dev"
$mongoContainer = "mern_mongo"  # MongoDB container name on VPS
$mongoUser = "root"
$mongoPassword = "kReSn4e10b7q9vDvkLax2yQ8HELneOnB9OW1GMq7eUg="

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Sync VPS Database to Local MongoDB" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Check if local MongoDB is running
Write-Host "[1/4] Checking local MongoDB..." -ForegroundColor Cyan
try {
    $connection = New-Object System.Net.Sockets.TcpClient
    $connection.Connect("localhost", 27017)
    $connection.Close()
    Write-Host "  [OK] Local MongoDB is running" -ForegroundColor Green
}
catch {
    Write-Host "  [ERROR] Local MongoDB is not running!" -ForegroundColor Red
    Write-Host "`nPlease start local MongoDB first:" -ForegroundColor Yellow
    Write-Host "  Run: .\start-dev-local.ps1" -ForegroundColor Gray
    Write-Host "  Then run this script again`n" -ForegroundColor Gray
    pause
    exit 1
}

# Create temp directory for dump
$tempDir = Join-Path $PSScriptRoot "temp_db_dump"
if (Test-Path $tempDir) {
    Write-Host "`n[2/4] Cleaning old dump files..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Export from VPS
Write-Host "`n[3/4] Exporting database from VPS..." -ForegroundColor Cyan
Write-Host "  This will take a moment. Enter SSH password when prompted." -ForegroundColor Yellow

# Step 1: Create dump on VPS
Write-Host "  Creating database dump on VPS..." -ForegroundColor Yellow
$exportCommand = "docker exec $mongoContainer mongodump --username=$mongoUser --password=$mongoPassword --authenticationDatabase=admin --db=$databaseName --archive=/tmp/vps_db_dump.gz --gzip && echo 'DUMP_SUCCESS' || echo 'DUMP_FAILED'"
$result = ssh ${username}@${vpsIP} $exportCommand 2>&1

# Check if dump was successful
if ($result -like "*DUMP_FAILED*" -or $LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to create dump on VPS" -ForegroundColor Red
    Write-Host "  VPS output: $result" -ForegroundColor Gray
    exit 1
}

if ($result -notlike "*DUMP_SUCCESS*") {
    Write-Host "  [WARNING] Dump command completed but success confirmation not received" -ForegroundColor Yellow
    Write-Host "  VPS output: $result" -ForegroundColor Gray
}

# Verify dump file exists inside container
Write-Host "  Verifying dump file in container..." -ForegroundColor Yellow
$fileCheck = ssh ${username}@${vpsIP} "docker exec $mongoContainer ls -lh /tmp/vps_db_dump.gz 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Dump file not found in container!" -ForegroundColor Red
    Write-Host "  Output: $fileCheck" -ForegroundColor Gray
    exit 1
}
Write-Host "  File in container: $fileCheck" -ForegroundColor Gray

# Copy dump from container to VPS host
Write-Host "  Copying dump from container to VPS host..." -ForegroundColor Yellow
$copyCommand = "docker cp ${mongoContainer}:/tmp/vps_db_dump.gz /tmp/vps_db_dump.gz"
ssh ${username}@${vpsIP} $copyCommand
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to copy dump from container to host" -ForegroundColor Red
    exit 1
}

# Step 2: Download dump file from VPS to local
Write-Host "  Downloading dump file from VPS..." -ForegroundColor Yellow
scp ${username}@${vpsIP}:/tmp/vps_db_dump.gz "$tempDir/dump.gz"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to download dump file" -ForegroundColor Red
    Write-Host "  SCP exit code: $LASTEXITCODE" -ForegroundColor Gray
    exit 1
}

# Verify local file exists and has content
if (-not (Test-Path "$tempDir/dump.gz")) {
    Write-Host "  [ERROR] Downloaded file not found locally!" -ForegroundColor Red
    exit 1
}

$localFileSize = (Get-Item "$tempDir/dump.gz").Length
if ($localFileSize -eq 0) {
    Write-Host "  [ERROR] Downloaded file is empty!" -ForegroundColor Red
    exit 1
}

# Step 3: Clean up VPS temp files (both container and host)
ssh ${username}@${vpsIP} "docker exec $mongoContainer rm /tmp/vps_db_dump.gz; rm /tmp/vps_db_dump.gz"

Write-Host "  [OK] Database exported from VPS" -ForegroundColor Green
$fileSize = (Get-Item "$tempDir/dump.gz").Length / 1MB
Write-Host "  Export size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray

# Import to local MongoDB
Write-Host "`n[4/4] Importing to local MongoDB..." -ForegroundColor Cyan

# First, drop existing local database to avoid duplicates
Write-Host "  Dropping existing local database..." -ForegroundColor Yellow
docker exec pstudios_mongo_dev mongosh $localDatabaseName --eval "db.dropDatabase()" 2>&1 | Out-Null

# Import the dump - copy file into container first
Write-Host "  Copying dump to MongoDB container..." -ForegroundColor Yellow
docker cp "$tempDir/dump.gz" pstudios_mongo_dev:/tmp/dump.gz

Write-Host "  Importing data..." -ForegroundColor Yellow
docker exec pstudios_mongo_dev mongorestore --nsFrom="$databaseName.*" --nsTo="$localDatabaseName.*" --archive=/tmp/dump.gz --gzip

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Database imported successfully" -ForegroundColor Green

    # Clean up temp file in container
    docker exec pstudios_mongo_dev rm /tmp/dump.gz
}
else {
    Write-Host "  [ERROR] Failed to import database" -ForegroundColor Red
    docker exec pstudios_mongo_dev rm /tmp/dump.gz 2>&1 | Out-Null
    exit 1
}

# Cleanup
Write-Host "`nCleaning up temp files..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $tempDir
Write-Host "  [OK] Cleanup complete" -ForegroundColor Green

# Sync media files (uploads directory)
Write-Host "`n[BONUS] Syncing media files from VPS..." -ForegroundColor Cyan

# Create local uploads directory if it doesn't exist
$localUploadsDir = Join-Path $PSScriptRoot "backend\uploads"
if (!(Test-Path $localUploadsDir)) {
    Write-Host "  Creating local uploads directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $localUploadsDir | Out-Null
}

# Sync uploads from VPS to local
Write-Host "  Downloading media files from VPS..." -ForegroundColor Yellow
Write-Host "  This may take a while depending on file sizes..." -ForegroundColor Gray

# Use rsync if available, otherwise use scp -r
$rsyncTest = Get-Command rsync -ErrorAction SilentlyContinue
if ($rsyncTest) {
    # Rsync is more efficient for syncing directories
    rsync -avz --progress ${username}@${vpsIP}:~/mernvps/backend/uploads/ $localUploadsDir/
}
else {
    # Fallback to scp recursive copy
    scp -r ${username}@${vpsIP}:~/mernvps/backend/uploads/* $localUploadsDir/
}

if ($LASTEXITCODE -eq 0) {
    # Count synced files
    $fileCount = (Get-ChildItem -Path $localUploadsDir -Recurse -File).Count
    $totalSize = (Get-ChildItem -Path $localUploadsDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB

    Write-Host "  [OK] Media files synced successfully" -ForegroundColor Green
    Write-Host "  Files synced: $fileCount files ($([math]::Round($totalSize, 2)) MB)" -ForegroundColor Gray
}
else {
    Write-Host "  [WARNING] Failed to sync media files" -ForegroundColor Yellow
    Write-Host "  Database is synced, but images may not display correctly" -ForegroundColor Gray
}

# Final summary
Write-Host "`n================================================" -ForegroundColor Green
Write-Host " Sync Complete!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "Summary:" -ForegroundColor White
Write-Host "  VPS Database:      $databaseName" -ForegroundColor Gray
Write-Host "  Local Database:    $localDatabaseName" -ForegroundColor Gray
Write-Host "  Database Status:   Synced successfully" -ForegroundColor Green
Write-Host "  Media Files:       Synced to backend\uploads\" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor White
Write-Host "  1. Start development: .\start-dev-local.ps1" -ForegroundColor Gray
Write-Host "  2. Your local environment now has:" -ForegroundColor Gray
Write-Host "     - Production database (MongoDB)" -ForegroundColor Gray
Write-Host "     - All media files (images/uploads)" -ForegroundColor Gray
Write-Host "  3. Safe to modify - won't affect production" -ForegroundColor Green

Write-Host "`nNote: Run this script again to refresh data and media from VPS`n" -ForegroundColor Yellow

pause
