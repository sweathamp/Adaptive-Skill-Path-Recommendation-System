@echo off
echo =====================================
echo   SkillForge Frontend Starting...
echo =====================================
cd /d "%~dp0frontend"
echo Installing dependencies (this may take a minute)...
call npm install
echo.
echo Starting frontend on http://localhost:3000
echo.
npm start
pause
