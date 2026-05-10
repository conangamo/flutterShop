# 🚀 Quick Start: Fix Jewelry → Shoes

## One-Command Fix

```powershell
# Run this from the project root directory
powershell -ExecutionPolicy Bypass -File database\COMPLETE_FIX.ps1
```

This automated script will:
- ✅ Check Docker and database status
- ✅ Apply shoe seed data (Nike, Adidas, Puma)
- ✅ Validate database changes
- ✅ Test API endpoints
- ✅ Provide next steps

## After Running the Script

1. **Restart Expo App**
   ```bash
   cd native-e-commerce
   npx expo start --clear
   ```

2. **Open the app** and verify you see shoes (not jewelry)

## What Was Fixed

### ✅ Already Correct (No Changes Needed)
- `.env` file has `EXPO_PUBLIC_STORE_ID=2`
- API client sends correct `X-Store-Id` header
- No mock data files in frontend
- Error handling is proper

### 🔧 What the Script Fixes
- **Database**: Replaces jewelry with 8 real shoe products
- **Products**: Nike Air Max 270, Adidas Ultraboost 22, Air Jordan 1, etc.
- **Variants**: Each shoe has 5 sizes (39-43)
- **Brands**: Nike, Adidas, Puma

## Manual Steps (If Script Fails)

### 1. Start Database
```bash
cd native-e-commerce-be
docker compose up -d
```

### 2. Apply Seed Data
```bash
# From project root
docker compose -f native-e-commerce-be/docker-compose.yml exec -T db psql -U postgres -d ecommerce < database/seed_shoes_only.sql
```

### 3. Validate
```bash
docker compose -f native-e-commerce-be/docker-compose.yml exec -T db psql -U postgres -d ecommerce < database/validate_shoe_data.sql
```

### 4. Test API
```bash
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=5
```

Should return Nike, Adidas, Puma products.

## Troubleshooting

### Docker not running
**Error:** `Docker is not running`  
**Fix:** Start Docker Desktop

### Database not running
**Error:** `Database container is not running`  
**Fix:** `cd native-e-commerce-be && docker compose up -d`

### Still seeing jewelry
**Fix:** 
1. Clear Expo cache: `npx expo start --clear`
2. Verify `.env` has `EXPO_PUBLIC_STORE_ID=2`
3. Re-run the fix script

### API connection failed
**Fix:**
1. Check backend is running
2. Verify IP address in `.env` matches your computer
3. Run `ipconfig` to get current IP

## Expected Results

### Database
```
Store 2: ShoeStore
Products: 8 shoes
Brands: Adidas, Nike, Puma
Variants: 40 total (5 sizes per product)
```

### API Response
```json
{
  "items": [
    {
      "id": "nike-air-max-270",
      "name": "Nike Air Max 270",
      "brand": "Nike",
      "base_price": 3200000,
      ...
    },
    ...
  ],
  "total": 8
}
```

### App UI
- Home screen shows shoe products
- Brand logos: Nike, Adidas, Puma
- No jewelry products visible
- Product cards show sneakers

## Files Created

- `database/COMPLETE_FIX.ps1` - Automated fix script
- `database/test_api.ps1` - API validation script
- `database/validate_shoe_data.sql` - Database validation
- `FIX_JEWELRY_TO_SHOES.md` - Detailed documentation
- `QUICK_START_FIX.md` - This file

## Demo Account

```
Email: demo.shoes@gmail.com
Password: demo123456
```

## Need More Help?

See `FIX_JEWELRY_TO_SHOES.md` for comprehensive troubleshooting and detailed explanations.
