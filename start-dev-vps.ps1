# Start Development Environment Connected to VPS Database
# This script assumes SSH tunnel is already running (connect-vps-db.ps1)

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host " Paradigm Studios - VPS Database Mode" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

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

# Check if SSH tunnel is running
Write-Host "[1/3] Checking SSH tunnel to VPS..." -ForegroundColor Cyan
if (-not (Test-Port 27018)) {
    Write-Host "`n[ERROR] SSH tunnel is not running!" -ForegroundColor Red
    Write-Host "`nYou need to start the SSH tunnel first:" -ForegroundColor Yellow
    Write-Host "  1. Open a NEW PowerShell window" -ForegroundColor Gray
    Write-Host "  2. Run: .\connect-vps-db.ps1" -ForegroundColor Gray
    Write-Host "  3. Enter your SSH password" -ForegroundColor Gray
    Write-Host "  4. Keep that window open" -ForegroundColor Gray
    Write-Host "  5. Then run this script again`n" -ForegroundColor Gray
    pause
    exit 1
}
Write-Host "  [OK] SSH tunnel is active on port 27018" -ForegroundColor Green

# Clean up ports
Write-Host "`n[2/3] Checking ports 3000 and 3001..." -ForegroundColor Cyan

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

# Start servers
Write-Host "`n[3/3] Starting servers..." -ForegroundColor Cyan

# Start backend connected to VPS database
Write-Host "  Starting backend server (VPS DB mode)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm run dev:vps" -WindowStyle Normal
Start-Sleep -Seconds 2

# Start frontend
Write-Host "  Starting frontend server..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "pstudios-landingpage"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run start:dev:backend" -WindowStyle Normal

# Final summary
Write-Host "`n================================================" -ForegroundColor Green
Write-Host " Development Environment Ready (VPS Database)" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "Server Information:" -ForegroundColor White
Write-Host "  Backend API:       http://localhost:3001/api" -ForegroundColor Gray
Write-Host "  Frontend:          http://localhost:3000" -ForegroundColor Gray
Write-Host "  Database:          VPS via SSH tunnel (port 27018)" -ForegroundColor Gray

Write-Host "`nQuick Links:" -ForegroundColor White
Write-Host "  Home:              http://localhost:3000" -ForegroundColor Gray
Write-Host "  Portfolio:         http://localhost:3000/portfolio" -ForegroundColor Gray
Write-Host "  Admin Panel:       http://localhost:3000/cp-admin" -ForegroundColor Gray
Write-Host "  Health Check:      http://localhost:3001/api/health" -ForegroundColor Gray

Write-Host "`nIMPORTANT:" -ForegroundColor Yellow
Write-Host "  - You are connected to PRODUCTION database" -ForegroundColor Red
Write-Host "  - Any changes will affect live data" -ForegroundColor Red
Write-Host "  - Keep the SSH tunnel window open" -ForegroundColor Yellow

Write-Host "`nUseful Commands:" -ForegroundColor White
Write-Host "  View SSH tunnel:   Check the connect-vps-db.ps1 window" -ForegroundColor Gray
Write-Host "  Test connection:   mongo mongodb://localhost:27018/pstudios" -ForegroundColor Gray

Write-Host "`nPress any key to close this window (servers will continue running)...`n" -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
