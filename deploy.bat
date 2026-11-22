@echo off
chcp 65001 >nul
title Deploying FIB Annual Evaluation to Firebase
color 0A
cls
echo ======================================================================
echo           FIB Annual Evaluation - Firebase Auto Deploy
echo ======================================================================
echo.
echo [1/2] Authenticating with your Google Account...
echo       A browser tab will open now. Please select your account.
echo.
call npx firebase login --reauth
echo.
echo [2/2] Deploying website to bo-dashboard-e4603...
call npx firebase deploy --only hosting --project bo-dashboard-e4603
echo.
echo ======================================================================
echo   🎉 DEPLOYMENT FINISHED!
echo   Your website is LIVE at:
echo   https://bo-dashboard-e4603.web.app
echo ======================================================================
echo.
echo Press any key to close this window.
pause >nul
