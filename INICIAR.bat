@echo off
title Figurinhas Copa 2026 Web
cd /d "%~dp0"
echo.
echo  ⚽  Iniciando Figurinhas Copa 2026 Web...
echo.
start http://localhost:3000
npm run dev
pause
