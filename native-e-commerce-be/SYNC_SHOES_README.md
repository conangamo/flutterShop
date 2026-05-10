# Sync 8 Shoes AI - Local Embedding Generator

## Overview

`sync_8_shoes_ai.py` is a **lightweight, local-first** script that:
- ✅ Fetches the 8 products from Store 2 in PostgreSQL
- ✅ Generates embeddings using **LOCAL** sentence-transformers model
- ✅ **NO external API calls** to Hugging Face or other services
- ✅ Saves to `metadata_shoes.json` format for visual search API

## Why This Script?

The old `build_shoes_ai.py` had issues:
- ❌ Tried to process 3300+ rows from CSV
- ❌ Made external API calls that could fail
- ❌ Slow and unreliable

This new script:
- ✅ Only processes 8 products (what's actually in Store 2)
- ✅ Uses local AI model (runs on your machine)
- ✅ Fast and reliable (~5 seconds after first run)

---

## Installation

### 1. Install Python Dependencies

```bash
cd native-e-commerce-be
pip install -r requirements_sync_shoes.txt
```

**First-time setup**: The script will download the `all-MiniLM-L6-v2` model (~80MB) on first run. After that, it uses the cached model.

### 2. Set Environment Variables (Optional)

The script uses these defaults from `.env`:
```bash
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=ecommerce
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

If your database is different, set environment variables:
```bash
export POSTGRES_USER=myuser
export POSTGRES_PASSWORD=mypass
export POSTGRES_DB=mydb
```

---

## Usage

### Run the Script

```bash
python sync_8_shoes_ai.py
```

### Expected Output

```
============================================================
🚀 Sync 8 Shoes from Store 2 with LOCAL AI Embeddings
============================================================

📊 Connecting to PostgreSQL...
✅ Connected to database

🔍 Fetching products from Store 2...
✅ Found 8 products

🤖 Loading local model: sentence-transformers/all-MiniLM-L6-v2
   (First run will download ~80MB model, subsequent runs are instant)
✅ Model loaded successfully

[1/8] Processing: Adidas NMD_R1 (adidas-nmd-r1)
   ✅ Generated 384-dimensional embedding
[2/8] Processing: Adidas Stan Smith (adidas-stan-smith)
   ✅ Generated 384-dimensional embedding
[3/8] Processing: Adidas Ultraboost 22 (adidas-ultraboost-22)
   ✅ Generated 384-dimensional embedding
...

✅ Saved metadata to: D:\path\to\database\metadata_shoes.json
   Total items: 8

============================================================
✨ Sync completed successfully!
============================================================
```

---

## Output Format

The script generates `database/metadata_shoes.json` with this structure:

```json
{
  "source": "PostgreSQL Store 2",
  "model": "sentence-transformers/all-MiniLM-L6-v2",
  "generated_at": "2025-01-15T10:30:00Z",
  "total_items": 8,
  "items": [
    {
      "id": "nike-air-max-270",
      "name": "Nike Air Max 270",
      "image_url": "https://...",
      "vector": [
        {"label": "running shoe", "score": 0.85},
        {"label": "sneaker", "score": 0.75},
        ...
      ],
      "embedding": [0.123, -0.456, 0.789, ...],  // 384 dimensions
      "processed_at": 1736938200
    },
    ...
  ]
}
```

### Key Fields:
- **`vector`**: Mock classification labels (for compatibility with old format)
- **`embedding`**: Actual 384-dimensional embedding vector from sentence-transformers
- **`processed_at`**: Unix timestamp

---

## How It Works

### 1. Database Query
Fetches products from Store 2:
```sql
SELECT id, name, default_image, description, brand, shoe_type, upper_material, sole_material
FROM products
WHERE store_id = 2 AND deleted_at IS NULL AND is_active = TRUE
LIMIT 8;
```

### 2. Text Embedding Generation
For each product, combines:
- Product name
- Brand
- Shoe type
- Description (first 200 chars)
- Material info

Then generates a 384-dimensional embedding using `all-MiniLM-L6-v2`.

### 3. Save to JSON
Outputs to `database/metadata_shoes.json` in the expected format.

---

## Model Information

**Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Size**: ~80MB
- **Dimensions**: 384
- **Speed**: ~50ms per product (after model load)
- **Quality**: Good for semantic similarity search
- **License**: Apache 2.0

**Why this model?**
- ✅ Small and fast
- ✅ Good quality embeddings
- ✅ Runs on CPU (no GPU needed)
- ✅ Well-maintained and popular

---

## Troubleshooting

### Database Connection Error
```
❌ Database connection failed: could not connect to server
```
**Solution**: Check that PostgreSQL is running and credentials are correct.

### Model Download Fails
```
❌ Failed to load model: Connection timeout
```
**Solution**: Check internet connection. First run needs to download the model.

### No Products Found
```
⚠️  No products found in Store 2
```
**Solution**: Run the seed script first:
```bash
psql -U postgres -d ecommerce -f database/seed_shoes_only.sql
```

---

## Integration with Visual Search API

After running this script, your visual search API should:
1. Load `database/metadata_shoes.json`
2. Use the `embedding` field for similarity search
3. Return matching products based on cosine similarity

Example (pseudo-code):
```python
# Load metadata
with open('database/metadata_shoes.json') as f:
    data = json.load(f)

# Extract embeddings
product_embeddings = [item['embedding'] for item in data['items']]
product_ids = [item['id'] for item in data['items']]

# Search
query_embedding = model.encode(query_text)
similarities = cosine_similarity([query_embedding], product_embeddings)
top_matches = sorted(zip(product_ids, similarities[0]), key=lambda x: x[1], reverse=True)
```

---

## Maintenance

### When to Re-run
Run this script whenever:
- Products in Store 2 are added/updated
- Product descriptions change
- You want to refresh embeddings

### Automation (Optional)
Add to cron or task scheduler:
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/native-e-commerce-be && python sync_8_shoes_ai.py
```

---

## Comparison: Old vs New

| Feature | Old (build_shoes_ai.py) | New (sync_8_shoes_ai.py) |
|---------|-------------------------|--------------------------|
| Data Source | CSV (3300 rows) | PostgreSQL Store 2 (8 products) |
| AI Model | External API | Local sentence-transformers |
| Internet Required | Yes (every run) | No (after first run) |
| Speed | Slow (~5 min) | Fast (~5 sec) |
| Reliability | API can fail | Always works |
| Dependencies | Many | Minimal |

---

## License

MIT License - Use freely in your project.

## Support

For issues or questions, check:
1. Database connection settings in `.env`
2. PostgreSQL is running
3. Products exist in Store 2
4. Python dependencies are installed

---

**Happy embedding! 🚀**
