# Apply Payment Method Type Enum Migration
# This script applies migration 0006 which adds payment_method_type enum to orders

Write-Host "Applying Payment Method Type Enum Migration..." -ForegroundColor Cyan

# Check if running from correct directory
if (-not (Test-Path "database/migrations/0006_payment_method_enum.sql")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Read database name from .env file
$envFile = "database/.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^DATABASE_URL=.*\/([^\/\?]+)(\?.*)?$') {
            $dbName = $matches[1]
        }
    }
}

if (-not $dbName) {
    Write-Host "Warning: Could not detect database name from .env file" -ForegroundColor Yellow
    $dbName = Read-Host "Please enter your database name (default: style_up)"
    if ([string]::IsNullOrWhiteSpace($dbName)) {
        $dbName = "style_up"
    }
}

Write-Host "Using database: $dbName" -ForegroundColor Green

# Apply migration
Write-Host "Applying migration 0006_payment_method_enum.sql..." -ForegroundColor Cyan

try {
    Get-Content database\migrations\0006_payment_method_enum.sql -Raw | `
        docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d $dbName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Migration applied successfully!" -ForegroundColor Green
        Write-Host "`nThe orders table now has a payment_method_type column with values:" -ForegroundColor Cyan
        Write-Host "  - CREDIT_CARD" -ForegroundColor White
        Write-Host "  - COD" -ForegroundColor White
        Write-Host "  - E_WALLET" -ForegroundColor White
    } else {
        Write-Host "`n✗ Migration failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n✗ Error applying migration: $_" -ForegroundColor Red
    exit 1
}
