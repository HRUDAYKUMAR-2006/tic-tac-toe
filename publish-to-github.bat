@echo off
title Publish Nexus Tic-Tac-Toe to GitHub
cd /d "%~dp0"
echo ==============================================
echo Publishing Tic-Tac-Toe to GitHub
echo Account: HRUDAYKUMAR-2006
echo Repo:    tic-tac-toe
echo ==============================================
echo.
echo Syncing and pushing files to GitHub...
git push -u origin main --force
echo.
if %errorlevel% equ 0 (
    echo ==============================================
    echo SUCCESS! Repository published to GitHub!
    echo ==============================================
    echo.
    echo Next step to make it live:
    echo 1. In your repo on GitHub: https://github.com/HRUDAYKUMAR-2006/tic-tac-toe/settings/pages
    echo 2. Under Source, choose 'GitHub Actions'
    echo.
    echo Your game will be live at:
    echo https://hrudaykumar-2006.github.io/tic-tac-toe/
) else (
    echo.
    echo An error occurred during push.
    echo If GitHub asks you to sign in, please authorize the window.
)
echo.
pause
