@echo off
title Weighted Kanban & Timeline Fullstack App
echo ====================================================
echo Starting Weighted Kanban & Timeline Fullstack App...
echo ====================================================
echo.

cd /d "%~dp0"

REM Check if node_modules exist
if not exist "backend\node_modules\" (
    echo [1/3] Installing backend dependencies...
    call npm --prefix backend install
)

if not exist "frontend\node_modules\" (
    echo [2/3] Installing frontend dependencies...
    call npm --prefix frontend install
)

if not exist "frontend\dist\" (
    echo [3/3] Building frontend for production...
    call npm --prefix frontend run build
)

echo.
echo Launching Production Server on port 5000...
echo Opening browser at http://localhost:5000 ...
start http://localhost:5000

call npm --prefix backend start
pause

