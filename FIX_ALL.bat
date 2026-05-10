@echo off
echo ============================================
echo SHOE STORE FIX - Automated
echo ============================================
echo.

echo Step 1: Starting backend...
cd native-e-commerce-be
docker compose up -d
cd ..
echo Waiting 20 seconds for backend to start...
timeout /t 20 /nobreak
echo.

echo Step 2: Applying shoe seed data...
cd database
docker compose -f ..\native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce < seed_shoes_only.sql
cd ..
echo.

echo Step 3: Validating...
docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce -c "SELECT COUNT(*) as shoe_count FROM products WHERE store_id = 2;"
echo.

echo ============================================
echo FIX COMPLETE
echo ============================================
echo.
echo NEXT STEPS:
echo 1. Test API:
echo    curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products
echo.
echo 2. Restart Expo:
echo    cd native-e-commerce
echo    npx expo start --clear
echo.
pause
