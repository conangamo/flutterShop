# 🚀 START HERE - Fix Your Shoe Store

## ⚠️ The Problem You're Facing

Your API returned: `{"detail":"Not Found"}`

**This means: The backend API is NOT running!**

---

## ✅ The Solution (2 Commands)

### 1️⃣ Start the Backend

```bash
cd native-e-commerce-be
docker compose up -d
```

Wait 20 seconds, then continue.

### 2️⃣ Apply Shoe Data

**Option A: Simple Batch File (Easiest)**
```bash
# From project root
FIX_ALL.bat
```

**Option B: PowerShell Script**
```bash
cd database
powershell -ExecutionPolicy Bypass -File SIMPLE_FIX.ps1
```

**Option C: Manual Command**
```bash
cd database
Get-Content seed_shoes_only.sql | docker compose -f ..\native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d ecommerce
```

### 3️⃣ Test It Works

```bash
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=3
```

**Expected:** JSON with Nike, Adidas, Puma products ✅  
**Not:** `{"detail":"Not Found"}` ❌

### 4️⃣ Restart Expo

```bash
cd native-e-commerce
npx expo start --clear
```

---

## 🔍 Quick Diagnostic

Not sure what's wrong? Run this:

```bash
powershell -ExecutionPolicy Bypass -File CHECK_BACKEND.ps1
```

This checks:
- Docker status
- Container status  
- API status
- Database status

---

## 📋 Files to Use

| File | Purpose | When to Use |
|------|---------|-------------|
| `FIX_ALL.bat` | **Easiest** - Does everything | Start here |
| `CHECK_BACKEND.ps1` | Diagnose issues | If something fails |
| `database/SIMPLE_FIX.ps1` | Apply seed data only | Backend already running |
| `MANUAL_STEPS.md` | Step-by-step guide | Need detailed instructions |

---

## 🎯 What Gets Fixed

| Before | After |
|--------|-------|
| Backend not running | Backend running ✅ |
| 3 jewelry products | 8 shoe products ✅ |
| API returns "Not Found" | API returns shoes ✅ |
| App shows jewelry | App shows Nike/Adidas/Puma ✅ |

---

## 🚨 Common Issues

### Issue: "Docker is not running"
**Fix:** Start Docker Desktop, wait for it to fully start

### Issue: "Database container not found"
**Fix:** The script will auto-start it. Wait 20 seconds.

### Issue: Still getting "Not Found"
**Fix:** 
1. Check backend logs: `docker compose -f native-e-commerce-be/docker-compose.yml logs`
2. Verify containers: `docker compose -f native-e-commerce-be/docker-compose.yml ps`
3. Check if API service exists in docker-compose.yml

### Issue: "Cannot connect to database"
**Fix:**
```bash
# Restart everything
cd native-e-commerce-be
docker compose down
docker compose up -d
```

---

## 📊 Expected Results

### After Fix - Database
```sql
SELECT name, brand FROM products WHERE store_id = 2 LIMIT 3;
```
```
Nike Air Max 270       | Nike
Adidas Ultraboost 22   | Adidas
Nike Air Jordan 1 Mid  | Nike
```

### After Fix - API
```bash
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=3
```
```json
{
  "items": [
    {"name": "Nike Air Max 270", "brand": "Nike", ...},
    {"name": "Adidas Ultraboost 22", "brand": "Adidas", ...},
    {"name": "Nike Air Jordan 1 Mid", "brand": "Nike", ...}
  ],
  "total": 8
}
```

### After Fix - App
- ✅ Home screen shows sneakers
- ✅ Brand logos: Nike, Adidas, Puma
- ✅ Product names: "Nike Air Max 270", etc.
- ❌ No jewelry products

---

## 🎬 Quick Start (Copy & Paste)

```bash
# 1. Start backend
cd native-e-commerce-be
docker compose up -d
cd ..

# 2. Wait 20 seconds
timeout /t 20

# 3. Run fix
FIX_ALL.bat

# 4. Test API
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=3

# 5. Restart Expo
cd native-e-commerce
npx expo start --clear
```

---

## 🆘 Still Need Help?

1. **Check backend status:** `CHECK_BACKEND.ps1`
2. **Read manual steps:** `MANUAL_STEPS.md`
3. **Check backend logs:** `docker compose logs -f`
4. **Verify .env file:** Should have `EXPO_PUBLIC_STORE_ID=2`

---

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] Backend containers are running (`docker compose ps`)
- [ ] Database has 8 products (`SELECT COUNT(*)...`)
- [ ] API returns shoe products (curl test)
- [ ] Expo app shows shoes (not jewelry)

---

**Ready?** Run `FIX_ALL.bat` and you're done in 30 seconds! 🚀
