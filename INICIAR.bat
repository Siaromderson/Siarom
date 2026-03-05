@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ===============================================
echo   CRM SIAROM - Iniciando servidor...
echo ===============================================
echo.
echo Acesse: http://localhost:3001
echo Setup:  http://localhost:3001/setup
echo Login:  http://localhost:3001/login
echo.
echo Admin: morais2730@gmail.com / Siarom2730
echo.
echo Para parar: pressione Ctrl+C
echo.
call npm run dev
pause
