@echo off
title Publish Nexus Tic-Tac-Toe to GitHub
cd /d "%~dp0"
echo ==============================================
echo Publishing Nexus Tic-Tac-Toe to GitHub
echo Account: HRUDAYKUMAR-2006
echo Repo:    tic-tac-toe
echo ==============================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ==============================================
    echo SUCCESS! Repository published to GitHub!
    echo ==============================================
    echo.
    echo Next step to make it live:
    echo 1. In your repo on GitHub, go to Settings -^> Pages
    echo 2. Under Source, choose 'GitHub Actions'
    echo.
    echo Your game will be live at:
    echo https://hrudaykumar-2006.github.io/tic-tac-toe/
) else (
    echo.
    echo If you haven't created the repository on GitHub yet, please create it at:
    echo https://github.com/new?name=tic-tac-toe
    echo (Make sure it is Public, then re-run this file)
)
echo.
pause
