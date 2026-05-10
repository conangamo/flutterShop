# Complete Automated Fix: Jewelry → Shoes
# This script will:
# 1. Check Docker and database status
# 2. Apply shoe seed data
# 3. Validate the changes
# 4. Test the API
# 5. Provide next steps

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   COMPLETE FIX: Jewelry to Shoes Transformation            " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://192.168.104.173:8000/api/v1"
$STORE_ID = "2"
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot

# Step 1: Check Docker
Write-Host "STEP 1: Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "   Action: Start Docker Desktop and run this script again" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Step 2: Check database container
Write-Host "STEP 2: Checking database container..." -ForegroundColor Yellow
$dbContainer = docker compose -f "$PROJECT_ROOT\native-e-commerce-be\docker-compose.yml" ps db --format json 2>$null | ConvertFrom-Json
if (-not $dbContainer -or $dbContainer.State -ne "running") {
    Write-Host "⚠️  Database container is not running" -ForegroundColor Yellow
    Write-Host "   Starting database container..." -ForegroundColor Cyan
    
    Push-Location "$PROJECT_ROOT\native-e-commerce-be"
    docker compose up -d
    Pop-Location
    
    Write-Host "   Waiting for database to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 15
    
    Write-Host "✅ Database container started" -ForegroundColor Green
} else {
    Write-Host "✅ Database container is running" -ForegroundColor Green
}
Write-Host ""

# Step 3: Apply shoe seed data
Write-Host "STEP 3: Applying shoe seed data..." -ForegroundColor Yellow
Write-Host "   This will:" -ForegroundColor Cyan
Write-Host "   - Delete all existing products for Store 2" -ForegroundColor Cyan
Write-Host "   - Insert 8 real shoe products (Nike, Adidas, Puma)" -ForegroundColor Cyan
Write-Host "   - Create size variants (39-43) for each product" -ForegroundColor Cyan
Write-Host ""

$seedFile = "$PROJECT_ROOT\database\seed_shoes_only.sql"
Get-Content $seedFile -Raw | docker compose -f "$PROJECT_ROOT\native-e-commerce-be\docker-compose.yml" exec -T db psql -U postgres -d ecommerce 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Shoe seed data applied successfully" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Failed to apply seed data" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Validate database
Write-Host "STEP 4: Validating database changes..." -ForegroundColor Yellow

$validateQuery = "SELECT COUNT(*) as product_count, STRING_AGG(DISTINCT brand, ', ' ORDER BY brand) as brands FROM products WHERE store_id = 2 AND deleted_at IS NULL;"

$result = docker compose -f "$PROJECT_ROOT\native-e-commerce-be\docker-compose.yml" exec -T db psql -U postgres -d ecommerce -t -A -c $validateQuery

if ($result -match "8\|Adidas, Nike, Puma") {
    Write-Host "✅ Database validation passed" -ForegroundColor Green
    Write-Host "   - 8 shoe products found" -ForegroundColor Cyan
    Write-Host "   - Brands: Adidas, Nike, Puma" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Database validation warning" -ForegroundColor Yellow
    Write-Host "   Result: $result" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Test API
Write-Host "STEP 5: Testing API endpoints..." -ForegroundColor Yellow

try {
    $products = Invoke-RestMethod -Uri "$API_URL/catalog/products?limit=5" -Method Get -Headers @{"X-Store-Id"=$STORE_ID} -TimeoutSec 10
    
    if ($products.total -gt 0) {
        Write-Host "✅ API is working correctly" -ForegroundColor Green
        Write-Host "   Total products: $($products.total)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Sample products:" -ForegroundColor Cyan
        
        $hasJewelry = $false
        foreach ($product in $products.items | Select-Object -First 3) {
            $brand = if ($product.brand) { $product.brand } else { "No Brand" }
            Write-Host "   - $($product.name) [$brand]" -ForegroundColor White
            
            # Check for jewelry terms
            if ($product.name -match "jewelry|ring|earring|necklace|bracelet|pearl") {
                $hasJewelry = $true
            }
        }
        
        Write-Host ""
        if ($hasJewelry) {
            Write-Host "❌ VALIDATION FAILED: Jewelry products still present!" -ForegroundColor Red
            Write-Host "   The API is still returning jewelry products." -ForegroundColor Yellow
            Write-Host "   This might be a caching issue or wrong store ID." -ForegroundColor Yellow
        } else {
            Write-Host "✅ VALIDATION PASSED: Only shoe products found!" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  API returned 0 products" -ForegroundColor Yellow
        Write-Host "   This might indicate a backend issue" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ ERROR: Failed to connect to API" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Possible causes:" -ForegroundColor Yellow
    Write-Host "   - Backend API is not running" -ForegroundColor Gray
    Write-Host "   - Wrong IP address in .env file" -ForegroundColor Gray
    Write-Host "   - Firewall blocking connection" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "                    FIX COMPLETE                            " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Verify .env file:" -ForegroundColor Yellow
Write-Host "   File: native-e-commerce\.env" -ForegroundColor Gray
Write-Host "   Should contain: EXPO_PUBLIC_STORE_ID=2" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Restart Expo app:" -ForegroundColor Yellow
Write-Host "   cd native-e-commerce" -ForegroundColor Gray
Write-Host "   npx expo start --clear" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test in the app:" -ForegroundColor Yellow
Write-Host "   - Open the home screen" -ForegroundColor Gray
Write-Host "   - You should see Nike, Adidas, Puma shoes" -ForegroundColor Gray
Write-Host "   - No jewelry products should appear" -ForegroundColor Gray
Write-Host ""

Write-Host "Demo Account:" -ForegroundColor Cyan
Write-Host "  Email: demo.shoes@gmail.com" -ForegroundColor White
Write-Host "  Password: demo123456" -ForegroundColor White
Write-Host ""

Write-Host "Need help? Check FIX_JEWELRY_TO_SHOES.md for detailed troubleshooting" -ForegroundColor Gray
