@echo off
REM Quick startup script for HalleyX Dashboard

echo =================================
echo  HalleyX Dashboard - Quick Start
echo =================================
echo.

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js found: 
node --version

REM Check frontend dependencies
if not exist "node_modules" (
    echo.
    echo [1/4] Installing frontend dependencies...
    call npm install
)

REM Check backend dependencies  
if not exist "backend\node_modules" (
    echo.
    echo [2/4] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Start backend
echo.
echo [3/4] Starting backend server on http://localhost:4000...
echo.
start "" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 3 >nul

REM Start frontend
echo.
echo [4/4] Starting frontend on http://localhost:3000...
echo.
start "" cmd /k "npm run dev"

echo.
echo ✨ Dashboard should open in your browser!
echo If not, navigate to: http://localhost:3000
