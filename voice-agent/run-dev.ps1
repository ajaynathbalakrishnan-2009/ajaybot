$ErrorActionPreference = "Stop"

$agentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $agentDir

$lkCommand = Get-Command lk -ErrorAction SilentlyContinue
if ($lkCommand) {
    $lkPath = $lkCommand.Source
} else {
    $lkPath = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\LiveKit.LiveKitCLI*\lk.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $lkPath) {
    Write-Error "LiveKit CLI was not found. Install it with: winget install --id LiveKit.LiveKitCLI"
}

if (-not (Test-Path "..\.env")) {
    Write-Error "Missing ..\.env. Add LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET and GOOGLE_API_KEY first."
}

Write-Host "Starting AjayBot Voice in local development mode..."
& $lkPath agent dev
