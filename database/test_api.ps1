# PowerShell script to test the API and verify shoe data
# This validates that the API is returning shoe products, not jewelry

$API_URL = "http://192.168.104.173:8000/api/v1"
$STORE_ID = "2"

Write-Host "=== Testing Shoe Store API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check stores endpoint
Write-Host "Test 1: Fetching stores..." -ForegroundColor Yellow
try {
    $stores = Invoke-RestMethod -Uri "$API_URL/stores" -Method Get -Headers @{"X-Store-Id"=$STORE_ID}
    Write-Host "SUCCESS: Stores endpoint working" -ForegroundColor Green
    $stores | ConvertTo-Json -Depth 3
} catch {
    Write-Host "ERROR: Failed to fetch stores" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Test 2: Fetching products for Store 2..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$API_URL/catalog/products?limit=5" -Method Get -Headers @{"X-Store-Id"=$STORE_ID}
    Write-Host "SUCCESS: Products endpoint working" -ForegroundColor Green
    Write-Host "Total products: $($products.total)" -ForegroundColor Cyan
    Write-Host ""
    
    if ($products.items.Count -gt 0) {
        Write-Host "First 5 products:" -ForegroundColor Cyan
        foreach ($product in $products.items) {
            $brand = if ($product.brand) { $product.brand } else { "No Brand" }
            Write-Host "  - $($product.name) [$brand] - $($product.base_price) VND" -ForegroundColor White
        }
        
        # Check if any product contains jewelry-related terms
        $jewelryTerms = @("jewelry", "ring", "earring", "necklace", "bracelet", "pearl", "gold set")
        $hasJewelry = $false
        foreach ($product in $products.items) {
            foreach ($term in $jewelryTerms) {
                if ($product.name -match $term) {
                    $hasJewelry = $true
                    Write-Host ""
                    Write-Host "WARNING: Found jewelry product: $($product.name)" -ForegroundColor Red
                    break
                }
            }
        }
        
        if (-not $hasJewelry) {
            Write-Host ""
            Write-Host "VALIDATION PASSED: No jewelry products found!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "VALIDATION FAILED: Jewelry products still present!" -ForegroundColor Red
            Write-Host "Action required: Run the shoe seed script again" -ForegroundColor Yellow
        }
    } else {
        Write-Host "WARNING: No products returned" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Failed to fetch products" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Test 3: Fetching categories for Store 2..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "$API_URL/catalog/categories" -Method Get -Headers @{"X-Store-Id"=$STORE_ID}
    Write-Host "SUCCESS: Categories endpoint working" -ForegroundColor Green
    Write-Host "Categories:" -ForegroundColor Cyan
    foreach ($cat in $categories) {
        Write-Host "  - $($cat.label) [$($cat.id)]" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: Failed to fetch categories" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
