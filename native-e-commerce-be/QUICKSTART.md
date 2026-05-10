# Quick Start Guide - Sync 8 Shoes AI

## 🚀 Fastest Way to Get Started

### Windows (PowerShell)
```powershell
cd native-e-commerce-be
.\INSTALL_AND_RUN.ps1
```

### Linux/Mac (Bash)
```bash
cd native-e-commerce-be
chmod +x install_and_run.sh
./install_and_run.sh
```

### Manual (Any OS)
```bash
cd native-e-commerce-be
pip install -r requirements_sync_shoes.txt
python sync_8_shoes_ai.py
```

---

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **PostgreSQL** running with Store 2 data
3. **Internet connection** (first run only, to download model)

---

## ✅ What Happens

1. ✅ Installs dependencies (~100MB)
2. ✅ Downloads AI model (~80MB, first run only)
3. ✅ Connects to PostgreSQL
4. ✅ Fetches 8 products from Store 2
5. ✅ Generates embeddings locally
6. ✅ Saves to `database/metadata_shoes.json`

**Total time**: ~2-3 minutes first run, ~5 seconds after that

---

## 📄 Output

Check `database/metadata_shoes.json` - it will contain:
- 8 products from Store 2
- 384-dimensional embeddings for each
- Ready for visual search API

---

## 🔧 Troubleshooting

### "Database connection failed"
→ Check PostgreSQL is running and `.env` has correct credentials

### "No products found"
→ Run seed script first: `psql -U postgres -d ecommerce -f database/seed_shoes_only.sql`

### "Module not found"
→ Run: `pip install -r requirements_sync_shoes.txt`

---

## 📖 More Info

See **SYNC_SHOES_README.md** for detailed documentation.

---

**That's it! 🎉**
