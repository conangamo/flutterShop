# Simple Fix Script - Jewelry to Shoes
# This is a simplified version that avoids complex PowerShell syntax

Write-Host "=== SHOE STORE FIX SCRIPT ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "Step 1: Checking Docker..." -ForegroundColor Yellow
$dockerCheck = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "OK: Docker is running" -ForegroundColor Green
Write-Host ""

# Step 2: Check if database container exists
Write-Host "Step 2: Checking database container..." -ForegroundColor Yellow
$dbCheck = docker compose -f ..\native-e-commerce-be\docker-compose.yml ps db 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Database container not found. Starting it..." -ForegroundColor Yellow
    Set-Location ..\native-e-commerce-be
    docker compose up -d
    Set-Location ..\database
    Write-Host "Waiting 15 seconds for database to start..." -ForegroundColor Cyan
    Start-Sleep -Seconds 15
}
Write-Host "OK: Database container is ready" -ForegroundColor Green
Write-Host ""

# Step 3: Apply seed data
Write-Host "Step 3: Applying shoe seed data..." -ForegroundColor Yellow
Write-Host "This will replace jewelry with Nike, Adidas, Puma shoes" -ForegroundColor Cyan

$seedContent = Get-Content .\seed_shoes_only.sql -Raw
$seedContent | docker compose -f ..\native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Seed data applied successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to apply seed data" -ForegroundColor Red
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "docker compose -f ..\native-e-commerce-be\docker-compose.yml exec db psql -U postgres -d ecommerce" -ForegroundColor Gray
    exit 1
}
Write-Host ""

# Step 4: Validate
Write-Host "Step 4: Validating changes..." -ForegroundColor Yellow
$count = docker compose -f ..\native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce -t -A -c "SELECT COUNT(*) FROM products WHERE store_id = 2;"

Write-Host "Product count for Store 2: $count" -ForegroundColor Cyan
if ($count -match "8") {
    Write-Host "OK: Validation passed - 8 shoe products found" -ForegroundColor Green
} else {
    Write-Host "WARNING: Expected 8 products, found: $count" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Show sample products
Write-Host "Step 5: Sample products..." -ForegroundColor Yellow
docker compose -f ..\native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce -c "SELECT name, brand FROM products WHERE store_id = 2 LIMIT 5;"
Write-Host ""

Write-Host "=== FIX COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Make sure backend API is running:" -ForegroundColor Yellow
Write-Host "   cd ..\native-e-commerce-be" -ForegroundColor Gray
Write-Host "   docker compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart Expo app:" -ForegroundColor Yellow
Write-Host "   cd ..\native-e-commerce" -ForegroundColor Gray
Write-Host "   npx expo start --clear" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test API (in a new terminal):" -ForegroundColor Yellow
Write-Host "   curl -H `"X-Store-Id: 2`" http://192.168.104.173:8000/api/v1/catalog/products" -ForegroundColor Gray
Write-Host ""
