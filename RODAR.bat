@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   CRM Siarom - Iniciando servidor...
echo ========================================
echo.
echo Aguarde o servidor subir. O navegador abrira em http://localhost:3001
echo.

:: Abre o navegador apos 15 segundos
start "" cmd /c "timeout /t 15 /nobreak >nul & start http://localhost:3001"

:: Roda o Next.js via cmd (evita bloqueio de politica do PowerShell)
cmd /c npm run dev

pause
