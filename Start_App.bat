@echo off
title SMS Marketing Engine
echo ==========================================
echo Starting SMS Marketing Engine...
echo ==========================================

:: Check if node_modules exists, if not run npm install
IF NOT EXIST "node_modules\" (
    echo First time setup: Installing required files... this might take a minute.
    call npm install
    call npx prisma db push
)

:: Start the Next.js server in the background
echo Starting local server...
start /b cmd /c "npm run dev"

:: Wait 5 seconds for the server to boot up
timeout /t 5 /nobreak > NUL

:: Open the default web browser to localhost
echo Opening in browser...
start http://localhost:3000

echo ==========================================
echo The app is running. Keep this window open!
echo Close this window to stop the application.
echo ==========================================
pause