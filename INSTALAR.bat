@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Instalando dependencias do CRM Siarom...
call npm install
if %errorlevel% neq 0 (
  echo.
  echo Tentando com --legacy-peer-deps...
  call npm install --legacy-peer-deps
)
echo.
echo Concluido. Execute: npm run dev
pause
