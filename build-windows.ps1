# PowerShell script to build Windows Tauri app
# Run this in PowerShell from the project directory

Write-Host "Building Windows Tauri Application..." -ForegroundColor Green
Write-Host ""

# Check if Rust is installed
Write-Host "Checking for Rust/Cargo..." -ForegroundColor Cyan
$cargoCheck = Get-Command cargo -ErrorAction SilentlyContinue
if ($cargoCheck) {
    $cargoVersion = cargo --version 2>&1
    Write-Host "✓ Rust found: $cargoVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Rust/Cargo not found in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add Rust to your PATH:" -ForegroundColor Yellow
    Write-Host "  [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';$env:USERPROFILE\.cargo\bin', 'User')" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then restart PowerShell and try again." -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking for Node.js..." -ForegroundColor Cyan
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking for npm..." -ForegroundColor Cyan
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck) {
    $npmVersion = npm --version 2>&1
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building Windows application..." -ForegroundColor Cyan
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Windows installer should be in:" -ForegroundColor Cyan
    Write-Host "  src-tauri\target\release\bundle\msi\" -ForegroundColor White
    Write-Host "  or" -ForegroundColor White
    Write-Host "  src-tauri\target\release\bundle\nsis\" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}

