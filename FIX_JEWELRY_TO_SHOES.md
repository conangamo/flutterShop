# Complete Fix: Jewelry → Shoes Transformation

This guide will completely eliminate jewelry data and replace it with real shoe products (Nike, Adidas, Puma).

## 🎯 Problem Summary

Your app is showing jewelry products instead of shoes because:
1. ✅ **FIXED**: `.env` already has `EXPO_PUBLIC_STORE_ID=2` 
2. ✅ **FIXED**: API client correctly sends `X-Store-Id` header
3. ❌ **NEEDS FIX**: Database still contains jewelry data for Store 2
4. ✅ **VERIFIED**: No mock data files exist in the frontend

## 📋 Step-by-Step Fix

### STEP 1: Start the Database

```bash
# Navigate to backend directory
cd native-e-commerce-be

# Start Docker containers
docker compose up -d

# Wait 10-15 seconds for database to be ready
```

### STEP 2: Apply Shoe Seed Data

**Option A: Automated Script (Recommended)**
```powershell
# From project root
cd database
powershell -ExecutionPolicy Bypass -File apply_shoe_seed.ps1
```

**Option B: Manual SQL Execution**
```bash
# From project root
docker compose -f native-e-commerce-be/docker-compose.yml exec -T db psql -U postgres -d ecommerce < database/seed_shoes_only.sql
```

**Option C: Interactive psql**
```bash
# Connect to database
docker compose -f native-e-commerce-be/docker-compose.yml exec db psql -U postgres -d ecommerce

# Then run:
\i /docker-entrypoint-initdb.d/seed_shoes_only.sql
```

### STEP 3: Validate Database Changes

```bash
# Run validation script
docker compose -f native-e-commerce-be/docker-compose.yml exec -T db psql -U postgres -d ecommerce < database/validate_shoe_data.sql
```

**Expected Output:**
- Store 2 = "ShoeStore"
- 8 products (Nike Air Max 270, Adidas Ultraboost 22, Nike Air Jordan 1 Mid, etc.)
- Brands: Adidas, Nike, Puma
- Each product has 5 size variants (39-43)

### STEP 4: Verify API Response

```powershell
# Test the API
cd database
powershell -ExecutionPolicy Bypass -File test_api.ps1
```

**Expected Output:**
```
✅ Products endpoint working
✅ Total products: 8
✅ First 5 products:
  - Nike Air Max 270 [Nike] - 3200000 VND
  - Adidas Ultraboost 22 [Adidas] - 4200000 VND
  - Nike Air Jordan 1 Mid [Nike] - 3800000 VND
  ...
✅ VALIDATION PASSED: No jewelry products found!
```

### STEP 5: Restart Expo App

```bash
cd native-e-commerce

# Clear cache and restart
npx expo start --clear
```

## 🔍 Manual Verification (curl)

```bash
# Test products endpoint
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=5

# Should return JSON with Nike, Adidas, Puma products
```

## ✅ What's Already Fixed

1. **Environment Variables** ✅
   - `EXPO_PUBLIC_STORE_ID=2` is correctly set
   - API URL is configured

2. **API Client** ✅
   - `lib/api/client.ts` correctly sends `X-Store-Id` header
   - Uses `STORE_ID` from environment config

3. **Frontend Code** ✅
   - No mock data files exist
   - Products are fetched from API via `fetchProducts()`
   - Error handling is proper (no silent failures)

4. **Seed Data** ✅
   - `database/seed_shoes_only.sql` contains 8 real shoe products
   - Nike: Air Max 270, Air Jordan 1 Mid, React Infinity Run
   - Adidas: Ultraboost 22, Stan Smith, NMD R1
   - Puma: RS-X, Suede Classic

## 🚨 Common Issues

### Issue 1: Docker not running
```
ERROR: Docker is not running
```
**Solution:** Start Docker Desktop

### Issue 2: Database container not running
```
ERROR: Database container is not running
```
**Solution:**
```bash
cd native-e-commerce-be
docker compose up -d
```

### Issue 3: Still seeing jewelry after seed
**Solution:** The seed script deletes old data first. Check:
```sql
SELECT COUNT(*) FROM products WHERE store_id = 2;
-- Should be 8, not 3
```

### Issue 4: API returns empty products
**Solution:** Check backend logs:
```bash
cd native-e-commerce-be
docker compose logs -f api
```

## 📊 Database Schema Reference

### Products Table (Store 2 - Shoes)
```sql
-- Shoe-specific columns used:
- shoe_type: 'sneaker', 'boot', etc.
- sole_material: 'rubber', 'EVA', etc.
- upper_material: 'mesh', 'leather', etc.
- closure_type: 'laces', 'slip_on', etc.
- brand: 'Nike', 'Adidas', 'Puma'
- gender_target: 'unisex', 'men', 'women'

-- Jewelry columns (NULL for shoes):
- jewelry_type: NULL
- material: NULL
- karat: NULL
- gemstone: NULL
```

## 🎨 Theme Verification

The app already uses a **Refined Dark Commerce** theme:
- Background: `#0A0A0F` (deep black)
- Surface: `#13131A` (elevated dark)
- Accent: `#6C63FF` (purple)
- Text: `#F0F0F5` (light gray)

This theme works perfectly for a shoe store.

## 📝 Next Steps After Fix

1. **Test the app** - Open Expo and verify shoes appear
2. **Check brand filtering** - Tap Nike/Adidas/Puma logos
3. **Test product details** - Tap a shoe to see details
4. **Verify cart** - Add shoes to cart
5. **Test checkout** - Complete a test order

## 🆘 Still Having Issues?

Run the diagnostic script:
```powershell
# Check everything
cd database
powershell -ExecutionPolicy Bypass -File test_api.ps1
```

If products still show jewelry:
1. Verify `EXPO_PUBLIC_STORE_ID=2` in `.env`
2. Restart Expo with `--clear` flag
3. Check backend logs for errors
4. Re-run the seed script

## 📞 Support

If you're still stuck:
1. Check the backend API logs
2. Verify database connection
3. Test the API with curl
4. Check network connectivity (IP address)
