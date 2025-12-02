@echo off
REM Batch script to add Rust to PATH
REM Run this in Command Prompt (you may need to run as Administrator)

setx PATH "%PATH%;%USERPROFILE%\.cargo\bin"

echo.
echo Rust has been added to PATH!
echo Please close and reopen your terminal for changes to take effect.
echo.
echo After restarting, verify with: cargo --version
echo.

pause

