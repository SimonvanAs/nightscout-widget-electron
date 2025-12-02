# PowerShell script to install Rust on Windows
# Run this script in PowerShell as Administrator, or use the web installer

Write-Host "Installing Rust on Windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Option 1: Using winget (recommended)" -ForegroundColor Yellow
Write-Host "Run: winget install Rustlang.Rustup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 2: Using the web installer" -ForegroundColor Yellow
Write-Host "1. Visit: https://rustup.rs/" -ForegroundColor Cyan
Write-Host "2. Download and run rustup-init.exe" -ForegroundColor Cyan
Write-Host "3. Follow the installation prompts (default options are fine)" -ForegroundColor Cyan
Write-Host "4. Restart your terminal after installation" -ForegroundColor Cyan
Write-Host ""
Write-Host "After installation, verify with: cargo --version" -ForegroundColor Green

