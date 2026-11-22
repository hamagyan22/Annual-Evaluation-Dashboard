@echo off
title FIB Annual Evaluation Deployer
cls
echo ======================================================================
echo           FIB Annual Evaluation - Live Deployment
echo ======================================================================
echo.
echo Step 1 of 2: Logging in to Firebase...
echo A browser window will open now. Please select your Google account.
echo.
cd /d "C:\Users\fib\.gemini\antigravity\scratch\annual-evaluation-dashboard"
call npx --yes firebase-tools login
echo.
echo Step 2 of 2: Deploying to live server...
echo.
call npx --yes firebase-tools deploy --only hosting --project bo-dashboard-e4603
call npx --yes firebase-tools deploy --only hosting --project fib-annual-evaluation
echo.
echo ======================================================================
echo   DEPLOYMENT COMPLETE!
echo   Open your browser and refresh (Ctrl + F5):
echo   https://bo-dashboard-e4603.web.app
echo   https://fib-annual-evaluation.web.app
echo ======================================================================
echo.
pause
