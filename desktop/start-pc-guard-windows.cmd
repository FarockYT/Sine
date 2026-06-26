@echo off
setlocal
cd /d "%~dp0"
node sine-inverse-pc-guard.mjs --enforce %*
pause
