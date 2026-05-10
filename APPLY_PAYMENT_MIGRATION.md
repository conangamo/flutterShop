# Quick Guide: Apply Payment Method Migration

## What This Does

Adds support for three payment method types to your database:
- **CREDIT_CARD** - Credit/Debit Card payments
- **COD** - Cash on Delivery
- **E_WALLET** - E-Wallet (Momo, ZaloPay)

## Prerequisites

- Backend Docker container must be running
- Database must be accessible

## Apply Migration (Choose One Method)

### Method 1: PowerShell Script (Easiest)

```powershell
.\database\apply_payment_method_migration.ps1
```

### Method 2: Manual Command

```powershell
Get-Content database\migrations\0006_payment_method_enum.sql -Raw | docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d style_up
```

Replace `style_up` with your actual database name if different.

## Verify Migration Success

Connect to your database and run:

```sql
-- Check if enum was created
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'payment_method_type'::regtype;

-- Should show:
-- CREDIT_CARD
-- COD
-- E_WALLET

-- Check if column was added
\d orders

-- Should show payment_method_type column
```

## What Happens to Existing Orders?

The migration automatically updates existing orders:
- Orders with `payment_method_code` containing 'card' → `CREDIT_CARD`
- Orders with `payment_method_code` containing 'cod' → `COD`
- Orders with `payment_method_code` containing 'wallet', 'momo', or 'zalopay' → `E_WALLET`
- All other orders → `COD` (default fallback)

## After Migration

1. **Restart your backend server** to load the new schema
2. **Update frontend** to send `paymentMethodType` field when creating orders
3. **Test order creation** with each payment method type

## Troubleshooting

### Error: "type payment_method_type already exists"
The migration was already applied. No action needed.

### Error: "column payment_method_type already exists"
The migration was already applied. No action needed.

### Error: "database style_up does not exist"
Check your database name in `database/.env` file and use the correct name in the command.

### Error: "Cannot connect to database"
Make sure your Docker containers are running:
```powershell
docker compose -f native-e-commerce-be\docker-compose.yml ps
```

## Need Help?

See full documentation in `PAYMENT_METHOD_BACKEND_UPDATE.md`
