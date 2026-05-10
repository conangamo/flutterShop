# Quick Start: Payment Method Type Feature

## 🚀 Deploy in 3 Steps

### 1️⃣ Apply Database Migration
```powershell
.\database\apply_payment_method_migration.ps1
```

### 2️⃣ Restart Backend
```powershell
docker compose -f native-e-commerce-be\docker-compose.yml restart
```

### 3️⃣ Test Checkout
- Open app → Add to cart → Checkout
- Test all three payment methods
- Verify orders are created

---

## ✅ What Was Done

### Backend
- Added `payment_method_type` enum (CREDIT_CARD, COD, E_WALLET)
- Updated Order model and API schemas
- Added validation for payment method types

### Frontend
- Updated checkout to send `paymentMethodType` field
- Mapped payment methods to types:
  - Card → CREDIT_CARD
  - COD → COD
  - Wallet → E_WALLET

---

## 📋 Payment Method Mapping

| User Sees | Sends to API |
|-----------|--------------|
| Thẻ tín dụng / Ghi nợ | `CREDIT_CARD` |
| Thanh toán khi nhận hàng | `COD` |
| Ví điện tử | `E_WALLET` |

---

## 🧪 Quick Test

```bash
# 1. Check migration worked
docker compose -f native-e-commerce-be/docker-compose.yml exec db psql -U postgres -d style_up -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'payment_method_type'::regtype;"

# Expected output:
#  enumlabel   
# -------------
#  CREDIT_CARD
#  COD
#  E_WALLET
```

---

## 📚 Full Documentation

- `PAYMENT_METHOD_INTEGRATION_COMPLETE.md` - Complete overview
- `PAYMENT_METHOD_BACKEND_UPDATE.md` - Backend details
- `FRONTEND_PAYMENT_METHOD_UPDATE.md` - Frontend details
- `APPLY_PAYMENT_MIGRATION.md` - Migration guide

---

## ⚠️ Troubleshooting

**Migration fails?**
- Check database is running
- Verify database name is correct

**Backend errors?**
- Restart backend after migration
- Check backend logs

**Frontend errors?**
- Clear app cache
- Rebuild app if needed

---

## 🎯 Success Criteria

✅ Migration applied without errors
✅ Backend restarts successfully
✅ Can create orders with all payment methods
✅ Orders saved with correct `payment_method_type`
