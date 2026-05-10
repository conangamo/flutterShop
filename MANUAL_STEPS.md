# Manual Steps to Fix Jewelry → Shoes

## The Problem
Your API returned `{"detail":"Not Found"}` which means the **backend API is not running**.

## Solution (3 Simple Steps)

### Step 1: Start the Backend

```bash
cd native-e-commerce-be
docker compose up -d
```

Wait 20 seconds for everything to start.

### Step 2: Apply Shoe Seed Data

```bash
cd database
powershell -ExecutionPolicy Bypass -File SIMPLE_FIX.ps1
```

**OR** manually:

```bash
# From database folder
Get-Content seed_shoes_only.sql | docker compose -f ..\native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce
```

### Step 3: Verify It Works

```bash
# Test the API
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=3
```

**Expected:** JSON with Nike, Adidas, Puma products  
**Not:** `{"detail":"Not Found"}`

### Step 4: Restart Expo

```bash
cd native-e-commerce
npx expo start --clear
```

---

## Troubleshooting

### Still getting "Not Found"?

**Check if backend is running:**
```bash
docker compose -f native-e-commerce-be/docker-compose.yml ps
```

Should show:
- `db` - running
- `api` - running (or whatever the backend service is called)

**Check backend logs:**
```bash
docker compose -f native-e-commerce-be/docker-compose.yml logs -f
```

Look for errors or startup messages.

### Backend won't start?

**Check docker-compose.yml:**
```bash
cd native-e-commerce-be
cat docker-compose.yml
```

Look for the service names (db, api, backend, etc.)

**Try starting with logs:**
```bash
docker compose up
# (without -d to see logs)
```

### Database connection failed?

**Connect directly to test:**
```bash
docker compose -f native-e-commerce-be/docker-compose.yml exec db psql -U postgres -d ecommerce
```

Then run:
```sql
SELECT id, name FROM stores;
-- Should show Store 2

SELECT COUNT(*) FROM products WHERE store_id = 2;
-- Should show 8 after applying seed
```

---

## Quick Diagnostic

Run this to check everything:
```bash
powershell -ExecutionPolicy Bypass -File CHECK_BACKEND.ps1
```

This will tell you:
- ✅ Docker status
- ✅ Container status
- ✅ API status
- ✅ Database status

---

## What the Seed Script Does

1. **Deletes** all products for Store 2 (jewelry)
2. **Inserts** 8 shoe products:
   - Nike Air Max 270
   - Adidas Ultraboost 22
   - Nike Air Jordan 1 Mid
   - Adidas Stan Smith
   - Puma RS-X
   - Nike React Infinity Run
   - Adidas NMD R1
   - Puma Suede Classic
3. **Creates** 5 size variants per product (39-43)

---

## Expected Results

### Database Query
```sql
SELECT name, brand FROM products WHERE store_id = 2;
```
```
Nike Air Max 270              | Nike
Adidas Ultraboost 22          | Adidas
Nike Air Jordan 1 Mid         | Nike
Adidas Stan Smith             | Adidas
Puma RS-X Reinvention         | Puma
Nike React Infinity Run       | Nike
Adidas NMD_R1                 | Adidas
Puma Suede Classic XXI        | Puma
```

### API Response
```bash
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=3
```
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
- Home screen shows sneakers
- Brand logos: Nike, Adidas, Puma
- No jewelry products

---

## Still Stuck?

1. **Check backend is running:** `docker compose ps`
2. **Check backend logs:** `docker compose logs -f`
3. **Test database directly:** Connect with psql
4. **Verify .env:** `EXPO_PUBLIC_STORE_ID=2`
5. **Check IP address:** Run `ipconfig` and update .env if needed

---

## Summary

The main issue is: **Backend API is not running**

Fix:
1. Start backend: `cd native-e-commerce-be && docker compose up -d`
2. Apply seed: `cd database && powershell SIMPLE_FIX.ps1`
3. Test API: `curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products`
4. Restart Expo: `cd native-e-commerce && npx expo start --clear`

Done! 🎉
