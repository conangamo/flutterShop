# PowerShell script to apply shoe-only seed data
# This script will:
# 1. Truncate existing products for store 2
# 2. Load real shoe data (Nike, Adidas, Puma)

Write-Host "Applying Shoe Store Seed Data..." -ForegroundColor Cyan

# Check if Docker is running
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if the database container is running
$dbContainer = docker compose -f native-e-commerce-be/docker-compose.yml ps db --format json 2>$null | ConvertFrom-Json
if (-not $dbContainer -or $dbContainer.State -ne "running") {
    Write-Host "ERROR: Database container is not running." -ForegroundColor Red
    Write-Host "Run: cd native-e-commerce-be && docker compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "SUCCESS: Docker and database container are running" -ForegroundColor Green

# Apply the shoe seed data
Write-Host "Loading shoe products (Nike, Adidas, Puma)..." -ForegroundColor Cyan

Get-Content database\seed_shoes_only.sql -Raw | docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Shoe seed data applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Update native-e-commerce/.env: EXPO_PUBLIC_STORE_ID=2" -ForegroundColor Yellow
    Write-Host "2. Restart your Expo app" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Demo account: demo.shoes@gmail.com / demo123456" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply seed data" -ForegroundColor Red
    exit 1
}
