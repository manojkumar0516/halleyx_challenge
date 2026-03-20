#!/usr/bin/env pwsh
<#
.SYNOPSIS
HalleyX Dashboard - Quick Start Script
.DESCRIPTION
Automatically installs dependencies and starts both backend and frontend servers
#>

Write-Host "=================================" -ForegroundColor Cyan
Write-Host " HalleyX Dashboard - Quick Start" -ForegroundColor Cyan  
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check and install frontend dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "[1/4] Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Check and install backend dependencies
if (-not (Test-Path "backend/node_modules")) {
    Write-Host ""
    Write-Host "[2/4] Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

# Start backend
Write-Host ""
Write-Host "[3/4] Starting backend server on http://localhost:4000..." -ForegroundColor Yellow
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)/backend'; npm start"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host ""
Write-Host "[4/4] Starting frontend on http://localhost:3000..." -ForegroundColor Yellow
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✨ Dashboard should open in your browser!" -ForegroundColor Green
Write-Host "If not, navigate to: http://localhost:3000" -ForegroundColor Cyan
