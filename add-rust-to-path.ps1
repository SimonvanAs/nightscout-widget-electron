# PowerShell script to add Rust to PATH
# Run this in PowerShell (you may need to run as Administrator)

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$cargoBin = "$env:USERPROFILE\.cargo\bin"

if ($userPath -notlike "*$cargoBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$cargoBin", "User")
    Write-Host "Rust has been added to PATH!" -ForegroundColor Green
    Write-Host "Please close and reopen your terminal for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "Rust is already in PATH!" -ForegroundColor Green
}

Write-Host ""
Write-Host "After restarting your terminal, verify with:" -ForegroundColor Cyan
Write-Host "  cargo --version" -ForegroundColor White

