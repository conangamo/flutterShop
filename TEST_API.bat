@echo off
echo ============================================
echo Testing API Endpoints
echo ============================================
echo.

echo Test 1: Products endpoint (correct)
curl -H "X-Store-Id: 2" "http://192.168.104.173:8000/api/v1/products?limit=3"
echo.
echo.

echo Test 2: Categories endpoint
curl -H "X-Store-Id: 2" "http://192.168.104.173:8000/api/v1/categories"
echo.
echo.

echo Test 3: Single product
curl -H "X-Store-Id: 2" "http://192.168.104.173:8000/api/v1/products/nike-air-max-270"
echo.
echo.

echo ============================================
echo If you see Nike, Adidas, Puma - SUCCESS!
echo If you see "Not Found" - check the endpoint
echo ============================================
pause
