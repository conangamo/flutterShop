# PowerShell script to install dependencies and run sync_8_shoes_ai.py
# Usage: .\INSTALL_AND_RUN.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Sync 8 Shoes AI - Installation & Execution" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Check if pip is available
Write-Host "Checking pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ Found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip not found! Please install pip first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes on first run)" -ForegroundColor Gray
Write-Host ""

pip install -r requirements_sync_shoes.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Run the script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Running sync_8_shoes_ai.py" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

python sync_8_shoes_ai.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Script execution failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ✨ All done!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Output file: database\metadata_shoes.json" -ForegroundColor Yellow
Write-Host "📖 For more info, see: SYNC_SHOES_README.md" -ForegroundColor Yellow
Write-Host ""
