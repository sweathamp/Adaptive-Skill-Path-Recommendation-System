@echo off
echo ============================================
echo   SkillForge Backend  (MongoDB Edition)
echo ============================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not installed!
    echo Download from: https://nodejs.org
    pause & exit /b 1
)
for /f %%i in ('node --version') do echo       Found: %%i

echo [2/3] Installing packages (first run takes ~1 min)...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed. Check internet connection.
    pause & exit /b 1
)

echo [3/3] Starting server...
echo.
echo  MongoDB must be running!
echo  If you see a connection error, open services.msc,
echo  find "MongoDB" and click Start.
echo.
node server.js
pause
