# Paradigm Studios - Local Development with MongoDB
# This script starts the complete development environment with local Docker MongoDB

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Paradigm Studios - Local Development" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Function to check if Docker is running
function Test-Docker {
    try {
        $null = docker info 2>&1
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to kill processes on a specific port
function Kill-Port {
    param([int]$Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        if ($pid) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  [OK] Killed process on port $Port (PID: $pid)" -ForegroundColor Yellow
        }
    }
}

# Step 1: Check Docker
Write-Host "[1/5] Checking Docker..." -ForegroundColor Cyan
if (-not (Test-Docker)) {
    Write-Host "`n[ERROR] Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "`nPlease start Docker Desktop and wait for it to fully initialize." -ForegroundColor Yellow
    Write-Host "`nSteps:" -ForegroundColor White
    Write-Host "  1. Open Docker Desktop from Start Menu" -ForegroundColor Gray
    Write-Host "  2. Wait for the whale icon in system tray to stop animating" -ForegroundColor Gray
    Write-Host "  3. Run this script again`n" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host "  [OK] Docker is running" -ForegroundColor Green

# Step 2: Start MongoDB container
Write-Host "`n[2/5] Starting MongoDB container..." -ForegroundColor Cyan

# Check if container already exists
$containerExists = docker ps -a --filter "name=pstudios_mongo_dev" --format "{{.Names}}" 2>$null

if ($containerExists -eq "pstudios_mongo_dev") {
    # Container exists, check if it's running
    $containerRunning = docker ps --filter "name=pstudios_mongo_dev" --format "{{.Names}}" 2>$null

    if ($containerRunning -eq "pstudios_mongo_dev") {
        Write-Host "  [OK] MongoDB container is already running" -ForegroundColor Green
    }
    else {
        Write-Host "  Starting existing MongoDB container..." -ForegroundColor Yellow
        docker start pstudios_mongo_dev > $null
        Write-Host "  [OK] MongoDB container started" -ForegroundColor Green
    }
}
else {
    # Container doesn't exist, create it using docker-compose
    Write-Host "  Creating new MongoDB container..." -ForegroundColor Yellow
    Push-Location "backend"
    docker-compose -f docker-compose.dev.yml up -d mongo-dev
    Pop-Location
    Write-Host "  [OK] MongoDB container created and started" -ForegroundColor Green
}

# Wait for MongoDB to be ready
Write-Host "  Waiting for MongoDB to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "  [OK] MongoDB is ready" -ForegroundColor Green

# Step 3: Clean up ports
Write-Host "`n[3/5] Checking ports 3000 and 3001..." -ForegroundColor Cyan

if (Test-Port 3000) {
    Write-Host "  Port 3000 is in use, cleaning up..." -ForegroundColor Yellow
    Kill-Port 3000
}
else {
    Write-Host "  [OK] Port 3000 is available" -ForegroundColor Green
}

if (Test-Port 3001) {
    Write-Host "  Port 3001 is in use, cleaning up..." -ForegroundColor Yellow
    Kill-Port 3001
}
else {
    Write-Host "  [OK] Port 3001 is available" -ForegroundColor Green
}

# Step 4: Install dependencies
Write-Host "`n[4/5] Checking dependencies..." -ForegroundColor Cyan

# Backend dependencies
if (!(Test-Path "backend\node_modules")) {
    Write-Host "  Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location "backend"
    npm install --silent
    Pop-Location
    Write-Host "  [OK] Backend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "  [OK] Backend dependencies already installed" -ForegroundColor Green
}

# Frontend dependencies
if (!(Test-Path "pstudios-landingpage\node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location "pstudios-landingpage"
    npm install --silent
    Pop-Location
    Write-Host "  [OK] Frontend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "  [OK] Frontend dependencies already installed" -ForegroundColor Green
}

# Step 5: Start servers
Write-Host "`n[5/5] Starting servers..." -ForegroundColor Cyan

# Start backend with local database
Write-Host "  Starting backend server (port 3001)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm run dev:local" -WindowStyle Normal
Start-Sleep -Seconds 2

# Start frontend
Write-Host "  Starting frontend server (port 3000)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "pstudios-landingpage"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run start:dev:backend" -WindowStyle Normal

# Final summary
Write-Host "`n================================================" -ForegroundColor Green
Write-Host " Development Environment Ready!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "Server Information:" -ForegroundColor White
Write-Host "  Backend API:       http://localhost:3001/api" -ForegroundColor Gray
Write-Host "  Frontend:          http://localhost:3000" -ForegroundColor Gray
Write-Host "  MongoDB:           mongodb://localhost:27017/pstudios-dev" -ForegroundColor Gray
Write-Host "  Mongo Express:     http://localhost:8081 (admin/admin)" -ForegroundColor Gray

Write-Host "`nQuick Links:" -ForegroundColor White
Write-Host "  Home:              http://localhost:3000" -ForegroundColor Gray
Write-Host "  Portfolio:         http://localhost:3000/portfolio" -ForegroundColor Gray
Write-Host "  Admin Panel:       http://localhost:3000/cp-admin" -ForegroundColor Gray
Write-Host "  Health Check:      http://localhost:3001/api/health" -ForegroundColor Gray

Write-Host "`nAdmin Setup:" -ForegroundColor White
Write-Host "  First time? Run:   cd backend; node scripts/create-admin.js" -ForegroundColor Gray

Write-Host "`nUseful Commands:" -ForegroundColor White
Write-Host "  Stop MongoDB:      docker stop pstudios_mongo_dev" -ForegroundColor Gray
Write-Host "  View DB logs:      docker logs pstudios_mongo_dev" -ForegroundColor Gray
Write-Host "  Restart MongoDB:   docker restart pstudios_mongo_dev" -ForegroundColor Gray

Write-Host "`nDevelopment Tips:" -ForegroundColor White
Write-Host "  - Backend auto-restarts on file changes (nodemon)" -ForegroundColor Gray
Write-Host "  - Frontend hot-reloads on file changes" -ForegroundColor Gray
Write-Host "  - MongoDB data persists across restarts" -ForegroundColor Gray

Write-Host "`nPress any key to close this window (servers will continue running)...`n" -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
