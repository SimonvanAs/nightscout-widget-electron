# Windows Build Instructions

## Quick Build (PowerShell)

1. Open PowerShell in the project directory
2. Run:
   ```powershell
   .\build-windows.ps1
   ```

## Manual Build Steps

### Prerequisites Check

1. **Verify Rust is installed and in PATH:**
   ```powershell
   cargo --version
   rustc --version
   ```

2. **If Rust is not in PATH, add it:**
   ```powershell
   [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';$env:USERPROFILE\.cargo\bin', 'User')
   ```
   Then **restart PowerShell**.

3. **Verify Node.js:**
   ```powershell
   node --version
   npm --version
   ```

### Build Steps

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Build the Windows app:**
   ```powershell
   npm run build
   ```

### Build Output

After a successful build, you'll find the Windows installer in:
- `src-tauri\target\release\bundle\msi\` (MSI installer)
- `src-tauri\target\release\bundle\nsis\` (NSIS installer)

## Troubleshooting

### "cargo not found"
- Rust is not in PATH
- Add Rust to PATH using the command above
- Restart your terminal

### "link.exe not found" or MSVC errors
- Install Visual Studio Build Tools:
  ```powershell
  winget install Microsoft.VisualStudio.2022.BuildTools
  ```
- Or install "Desktop development with C++" workload from Visual Studio Installer

### Build takes a long time
- First build compiles all Rust dependencies (can take 10-30 minutes)
- Subsequent builds are much faster

