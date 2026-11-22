@echo off
chcp 65001 >nul
title Deploying FIB Annual Evaluation to Firebase
color 0A
cls
echo ======================================================================
echo           FIB Annual Evaluation - Firebase Auto Deploy
echo ======================================================================
echo.
echo [1/3] Authenticating with your Google Account (mohammed.dlshad0@gmail.com)...
echo       A browser tab will open now if not already logged in.
echo.
call npx --yes firebase-tools login --reauth
echo.
echo [2/3] Deploying website to fib-annual-evaluation...
call npx --yes firebase-tools deploy --only hosting --project fib-annual-evaluation
echo.
echo [3/3] Deploying website backup to bo-dashboard-e4603...
call npx --yes firebase-tools deploy --only hosting --project bo-dashboard-e4603
echo.
echo ======================================================================
echo   🎉 DEPLOYMENT FINISHED!
echo   Your website is LIVE at:
echo   👉 https://fib-annual-evaluation.web.app
echo   👉 https://bo-dashboard-e4603.web.app
echo ======================================================================
echo.
echo Press any key to close this window.
pause >nul
