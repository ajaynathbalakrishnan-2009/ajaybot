$ErrorActionPreference = "Stop"

$agentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $agentDir
Set-Location $agentDir

$envPath = Join-Path $repoDir ".env"
if (-not (Test-Path $envPath)) {
    Write-Error "Missing $envPath. Add GOOGLE_API_KEY before deploying the voice agent."
}

$googleLine = Get-Content $envPath |
    Where-Object { $_ -match '^GOOGLE_API_KEY=' } |
    Select-Object -First 1

if (-not $googleLine) {
    Write-Error "GOOGLE_API_KEY is missing from the project .env file."
}

$googleApiKey = $googleLine.Substring("GOOGLE_API_KEY=".Length).Trim().Trim('"')
if (-not $googleApiKey) {
    Write-Error "GOOGLE_API_KEY is empty."
}

$lkCommand = Get-Command lk -ErrorAction SilentlyContinue
if ($lkCommand) {
    $lkPath = $lkCommand.Source
} else {
    $lkPath = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\LiveKit.LiveKitCLI*\lk.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $lkPath) {
    Write-Error "LiveKit CLI was not found."
}

$configPath = Join-Path $agentDir "livekit.toml"

if (Test-Path $configPath) {
    Write-Host "Deploying the existing AjayBot Voice agent to production..."
    & $lkPath agent deploy --secrets "GOOGLE_API_KEY=$googleApiKey" $agentDir
} else {
    Write-Host "Creating the AjayBot Voice production deployment..."
    & $lkPath agent create --secrets "GOOGLE_API_KEY=$googleApiKey" $agentDir
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "AjayBot Voice production deployment completed."
