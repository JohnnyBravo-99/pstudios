@echo off
echo 🚀 Starting Paradigm Studios Development Environment...
echo.

echo 🔍 Killing any existing processes on ports 3000 and 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001 "') do taskkill /F /PID %%a >nul 2>&1

echo 📦 Installing dependencies...
cd backend
if not exist node_modules npm install
cd ..

cd pstudios-landingpage
if not exist node_modules npm install
cd ..

echo.
echo 🔧 Starting backend server on port 3001...
start "Backend Server" cmd /k "cd backend && npm run dev:mock"

timeout /t 3 /nobreak >nul

echo 🎨 Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd pstudios-landingpage && npm run start:dev"

echo.
echo ✅ Development environment started!
echo.
echo 📋 Server Information:
echo   • Backend API: http://localhost:3001/api
echo   • Frontend: http://localhost:3000
echo   • Admin Login: admin@pstudios.com / admin123
echo.
echo 🔗 Quick Links:
echo   • Portfolio: http://localhost:3000/portfolio
echo   • Admin Panel: http://localhost:3000/login
echo.
pause
