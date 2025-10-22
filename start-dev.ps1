# Development Server Startup Script for Paradigm Studios
# This script starts both the backend and frontend servers in development mode

Write-Host "🚀 Starting Paradigm Studios Development Environment..." -ForegroundColor Green
Write-Host ""

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
            Write-Host "Killed process on port $Port (PID: $pid)" -ForegroundColor Yellow
        }
    }
}

# Check and kill processes on ports 3000 and 3001
Write-Host "🔍 Checking for existing processes on ports 3000 and 3001..." -ForegroundColor Cyan

if (Test-Port 3000) {
    Write-Host "Port 3000 is in use. Killing existing process..." -ForegroundColor Yellow
    Kill-Port 3000
}

if (Test-Port 3001) {
    Write-Host "Port 3001 is in use. Killing existing process..." -ForegroundColor Yellow
    Kill-Port 3001
}

Write-Host ""

# Install dependencies if needed
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor White
Set-Location "backend"
if (!(Test-Path "node_modules")) {
    npm install
}
Set-Location ".."

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor White
Set-Location "pstudios-landingpage"
if (!(Test-Path "node_modules")) {
    npm install
}
Set-Location ".."

Write-Host ""

# Start backend server
Write-Host "🔧 Starting backend server on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev:mock" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep 3

# Start frontend server
Write-Host "🎨 Starting frontend server on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd pstudios-landingpage; npm run start:dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Server Information:" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:3001/api" -ForegroundColor Gray
Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "  • Admin Login: admin@pstudios.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Quick Links:" -ForegroundColor White
Write-Host "  • Portfolio: http://localhost:3000/portfolio" -ForegroundColor Gray
Write-Host "  • Admin Panel: http://localhost:3000/login" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
