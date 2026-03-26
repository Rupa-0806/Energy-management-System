# ===========================================
# Energy Management System - Startup Script
# ===========================================
# Run this script to start both backend and frontend
# Usage: .\start-app.ps1
#        .\start-app.ps1 -BackendOnly
#        .\start-app.ps1 -FrontendOnly

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Production
)

$ErrorActionPreference = "Continue"
$RootDir = $PSScriptRoot

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Energy Management System Startup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Tomcat 9 is using port 8080 (warn user)
$tomcatService = Get-Service -Name "Tomcat9" -ErrorAction SilentlyContinue
if ($tomcatService -and $tomcatService.Status -eq "Running") {
    Write-Host "[INFO] Tomcat 9 is running on port 8080" -ForegroundColor Yellow
    Write-Host "[INFO] Backend will use port 8081 instead" -ForegroundColor Yellow
    Write-Host ""
}

# Function to start backend
function Start-Backend {
    Write-Host "[BACKEND] Starting Spring Boot application..." -ForegroundColor Green
    
    $backendPath = Join-Path $RootDir "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "[ERROR] Backend directory not found: $backendPath" -ForegroundColor Red
        return $false
    }
    
    $profile = if ($Production) { "prod" } else { "prod" }
    
    Push-Location $backendPath
    try {
        # Start backend in a new terminal window
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$backendPath'; Write-Host 'Starting Backend on port 8081...' -ForegroundColor Green; .\mvnw spring-boot:run '-Dspring-boot.run.profiles=$profile'"
        )
        Write-Host "[BACKEND] Started in new terminal window" -ForegroundColor Green
        Write-Host "[BACKEND] URL: http://localhost:8081/api" -ForegroundColor Cyan
    }
    finally {
        Pop-Location
    }
    return $true
}

# Function to start frontend
function Start-Frontend {
    Write-Host "[FRONTEND] Starting Vite development server..." -ForegroundColor Green
    
    $frontendPath = Join-Path $RootDir "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "[ERROR] Frontend directory not found: $frontendPath" -ForegroundColor Red
        return $false
    }
    
    Push-Location $frontendPath
    try {
        # Check if node_modules exists
        if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
            Write-Host "[FRONTEND] Installing dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Start frontend in a new terminal window
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$frontendPath'; Write-Host 'Starting Frontend...' -ForegroundColor Green; npm run dev"
        )
        Write-Host "[FRONTEND] Started in new terminal window" -ForegroundColor Green
        Write-Host "[FRONTEND] URL: http://localhost:5173" -ForegroundColor Cyan
    }
    finally {
        Pop-Location
    }
    return $true
}

# Main execution
if ($FrontendOnly) {
    Start-Frontend
}
elseif ($BackendOnly) {
    Start-Backend
}
else {
    # Start both
    Start-Backend
    Write-Host ""
    Start-Sleep -Seconds 3
    Start-Frontend
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Startup Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8081/api" -ForegroundColor Gray
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "  Swagger:  http://localhost:8081/api/swagger-ui.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Wait ~30 seconds for backend to fully start before using." -ForegroundColor Yellow
Write-Host ""
