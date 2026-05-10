# Payment Method Type Backend Implementation

## Summary

The backend has been updated to support explicit payment method categorization matching the frontend checkout screen requirements.

## Changes Made

### 1. Database Schema Updates

#### New Enum Type: `payment_method_type`
Created a new PostgreSQL enum with three values:
- `CREDIT_CARD` - For credit/debit card payments
- `COD` - For Cash on Delivery
- `E_WALLET` - For e-wallets (Momo, ZaloPay)

#### Updated Tables
- **orders** table: Added `payment_method_type` column (NOT NULL)
- Added index on `payment_method_type` for query performance

### 2. Backend Code Updates

#### `app/db/models.py`
- Added `payment_method_type_pg` enum definition
- Updated `Order` model to include `payment_method_type` column

#### `app/features/orders/schemas.py`
- Created `PaymentMethodType` Pydantic enum class
- Updated `OrderCreateIn` schema to require `payment_method_type` field
- Added field validator to ensure only valid payment method types are accepted
- Validation error message: "Invalid payment method type: {value}. Must be one of: CREDIT_CARD, COD, E_WALLET"

#### `app/features/orders/service.py`
- Updated `create_order()` to save `payment_method_type` to database
- Updated `get_order_detail()` to return `paymentMethodType` in response

### 3. Migration Files

#### `database/migrations/0006_payment_method_enum.sql`
- Creates the `payment_method_type` enum
- Adds column to orders table
- Migrates existing data based on `payment_method_code`:
  - 'card' → CREDIT_CARD
  - 'cod' → COD
  - 'wallet'/'momo'/'zalopay' → E_WALLET
- Sets column to NOT NULL
- Creates performance index

#### `database/init_database.sql`
- Added `payment_method_type` enum definition
- Updated orders table schema to include the new column
- Added index for the new column

### 4. Helper Scripts

#### `database/apply_payment_method_migration.ps1`
PowerShell script to easily apply the migration to existing databases.

## API Changes

### Create Order Endpoint: `POST /orders/`

**New Required Field:**
```json
{
  "items": [...],
  "shippingAddressId": "...",
  "paymentMethod": "card",
  "paymentMethodType": "CREDIT_CARD",  // NEW REQUIRED FIELD
  "promoCode": null,
  "shippingFee": 0,
  "discountTotal": 0,
  "note": null
}
```

**Valid `paymentMethodType` values:**
- `"CREDIT_CARD"` - For credit/debit card payments
- `"COD"` - For cash on delivery
- `"E_WALLET"` - For e-wallet payments (Momo, ZaloPay)

**Validation:**
- The field is case-insensitive (will be converted to uppercase)
- Invalid values will return a 422 validation error
- The field is required (cannot be null or omitted)

### Get Order Detail Response

**New Field in Response:**
```json
{
  "id": "...",
  "code": "...",
  "paymentMethod": "Credit / Debit Card",
  "paymentMethodCode": "card",
  "paymentMethodType": "CREDIT_CARD",  // NEW FIELD
  ...
}
```

## Migration Instructions

### For Existing Databases

Run the migration using one of these methods:

**Method 1: Using PowerShell Script (Recommended)**
```powershell
.\database\apply_payment_method_migration.ps1
```

**Method 2: Direct psql Command**
```powershell
Get-Content database\migrations\0006_payment_method_enum.sql -Raw | docker compose -f native-e-commerce-be\docker-compose.yml exec -T db psql -U postgres -d style_up
```

**Method 3: Using psql directly (if not using Docker)**
```bash
psql "$DATABASE_URL" -f database/migrations/0006_payment_method_enum.sql
```

### For Fresh Installations

No action needed. The `init_database.sql` file already includes the new enum and column definition.

## Frontend Integration

The frontend checkout screen should send the `paymentMethodType` field when creating orders:

```typescript
// Example frontend code
const createOrder = async (orderData) => {
  const payload = {
    items: orderData.items,
    shippingAddressId: orderData.addressId,
    paymentMethod: orderData.paymentMethodCode, // e.g., "card", "cod", "ewallet"
    paymentMethodType: orderData.paymentMethodType, // "CREDIT_CARD", "COD", or "E_WALLET"
    promoCode: orderData.promoCode,
    shippingFee: orderData.shippingFee,
    discountTotal: orderData.discountTotal,
    note: orderData.note
  };
  
  return await api.post('/orders/', payload);
};
```

## Testing

After applying the migration, verify:

1. **Check enum exists:**
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'payment_method_type'::regtype 
ORDER BY enumsortorder;
```

Expected output:
```
 enumlabel   
-------------
 CREDIT_CARD
 COD
 E_WALLET
```

2. **Check column exists:**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'payment_method_type';
```

Expected output:
```
    column_name      |   data_type   | is_nullable 
---------------------+---------------+-------------
 payment_method_type | USER-DEFINED  | NO
```

3. **Test creating an order:**
```bash
curl -X POST http://localhost:8000/orders/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "...", "quantity": 1}],
    "shippingAddressId": "...",
    "paymentMethod": "card",
    "paymentMethodType": "CREDIT_CARD"
  }'
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the column
ALTER TABLE orders DROP COLUMN payment_method_type;

-- Drop the enum type
DROP TYPE payment_method_type;
```

## Notes

- The `payment_method_code` field is still required for backward compatibility and to reference the `payment_methods` table
- The new `payment_method_type` field provides explicit categorization for frontend logic
- Existing orders will be automatically migrated based on their `payment_method_code`
- The validation is case-insensitive but values are stored in uppercase
- The enum approach ensures data integrity at the database level

## Status

✅ Database schema updated
✅ SQLAlchemy models updated
✅ Pydantic schemas updated with validation
✅ Order creation service updated
✅ Order detail response updated
✅ Migration file created
✅ Helper scripts created
✅ Documentation updated

**The backend is ready to accept and validate the three payment method types: CREDIT_CARD, COD, and E_WALLET.**
