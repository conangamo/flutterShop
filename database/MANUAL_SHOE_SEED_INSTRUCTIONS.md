# Manual Shoe Seed Data Application

## Prerequisites
1. Docker Desktop must be running
2. Database container must be running

## Step 1: Start the Database (if not running)

```bash
cd native-e-commerce-be
docker compose up -d
```

Wait for the database to be ready (about 10-15 seconds).

## Step 2: Apply the Shoe Seed Data

### Option A: Using PowerShell Script (Recommended)
```powershell
cd database
powershell -ExecutionPolicy Bypass -File apply_shoe_seed.ps1
```

### Option B: Manual SQL Execution
If the script fails, run this command directly:

```bash
# From the project root directory
docker compose -f native-e-commerce-be/docker-compose.yml exec -T db psql -U postgres -d ecommerce < database/seed_shoes_only.sql
```

### Option C: Using psql directly
```bash
# Connect to the database
docker compose -f native-e-commerce-be/docker-compose.yml exec db psql -U postgres -d ecommerce

# Then paste the contents of database/seed_shoes_only.sql
```

## Step 3: Verify the Data

Run this query to confirm:

```sql
SELECT id, name FROM stores;
-- Should show: 2 | ShoeStore

SELECT COUNT(*) FROM products WHERE store_id = 2;
-- Should show: 8 (Nike, Adidas, Puma products)

SELECT id, name, brand FROM products WHERE store_id = 2 LIMIT 5;
-- Should show Nike, Adidas, Puma brands
```

## Step 4: Update Environment Variables

The `.env` file should already have:
```
EXPO_PUBLIC_STORE_ID=2
```

## Step 5: Restart the Expo App

```bash
cd native-e-commerce
# Kill the current Expo process (Ctrl+C)
# Then restart:
npx expo start --clear
```

## Validation

Test the API directly:

```bash
curl -H "X-Store-Id: 2" http://192.168.104.173:8000/api/v1/catalog/products?limit=5
```

You should see Nike, Adidas, or Puma products in the response.

## Troubleshooting

### Database container not running
```bash
cd native-e-commerce-be
docker compose ps
# If db is not running:
docker compose up -d
```

### Connection refused
- Check if the backend API is running
- Verify the IP address in `.env` matches your computer's IP
- Run `ipconfig` to get your current IP

### Still seeing jewelry products
- Clear the Expo cache: `npx expo start --clear`
- Check that EXPO_PUBLIC_STORE_ID=2 in the .env file
- Verify the seed data was applied by running the SQL queries above
