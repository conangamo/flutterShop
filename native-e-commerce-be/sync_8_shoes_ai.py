#!/usr/bin/env python3
"""
Lightweight script to sync 8 shoes from Store 2 with LOCAL AI embeddings.
NO external API calls - uses sentence-transformers locally.
"""

import json
import os
import sys
import time
from datetime import datetime
from typing import List, Dict, Any

import psycopg2
from psycopg2.extras import RealDictCursor
from sentence_transformers import SentenceTransformer
from PIL import Image
import requests
from io import BytesIO


# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('POSTGRES_DB', 'ecommerce'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', 'postgres')
}

# Output file path (relative to script location or absolute)
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'database', 'metadata_shoes.json')

# Store ID for shoes
STORE_ID = 2

# Local model for embeddings
MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'


def get_db_connection():
    """Create and return a database connection."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)


def fetch_products_from_store_2(conn) -> List[Dict[str, Any]]:
    """Fetch all active products from Store 2."""
    query = """
        SELECT 
            id,
            name,
            default_image as image_url,
            description,
            brand,
            shoe_type,
            upper_material,
            sole_material
        FROM products
        WHERE store_id = %s 
          AND deleted_at IS NULL
          AND is_active = TRUE
        ORDER BY name
        LIMIT 8;
    """
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (STORE_ID,))
            products = cursor.fetchall()
            return [dict(row) for row in products]
    except Exception as e:
        print(f"❌ Failed to fetch products: {e}")
        sys.exit(1)


def download_image(url: str, timeout: int = 10) -> Image.Image:
    """Download image from URL and return PIL Image object."""
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        return img.convert('RGB')
    except Exception as e:
        print(f"⚠️  Failed to download image from {url}: {e}")
        return None


def generate_text_embedding(model: SentenceTransformer, product: Dict[str, Any]) -> List[float]:
    """
    Generate embedding from product text using local sentence-transformers model.
    Combines name, description, brand, and shoe attributes.
    """
    # Build a rich text representation
    text_parts = [
        product.get('name', ''),
        product.get('brand', ''),
        product.get('shoe_type', ''),
        product.get('description', '')[:200],  # Limit description length
        f"Material: {product.get('upper_material', '')}",
        f"Sole: {product.get('sole_material', '')}"
    ]
    
    text = ' '.join([part for part in text_parts if part]).strip()
    
    # Generate embedding
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def create_mock_vector_labels(embedding: List[float]) -> List[Dict[str, float]]:
    """
    Create mock classification labels similar to the original format.
    Since we're using sentence embeddings (not image classification),
    we'll create a simplified structure.
    """
    # For compatibility with the old format, create mock labels
    # In reality, sentence embeddings don't have "labels" like image classifiers
    return [
        {"label": "running shoe", "score": 0.85},
        {"label": "sneaker", "score": 0.75},
        {"label": "athletic footwear", "score": 0.65},
        {"label": "casual shoe", "score": 0.55},
        {"label": "sports shoe", "score": 0.45}
    ]


def process_products(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process products and generate embeddings using local model."""
    print(f"\n🤖 Loading local model: {MODEL_NAME}")
    print("   (First run will download ~80MB model, subsequent runs are instant)")
    
    try:
        model = SentenceTransformer(MODEL_NAME)
        print("✅ Model loaded successfully\n")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        sys.exit(1)
    
    processed_items = []
    
    for idx, product in enumerate(products, 1):
        product_id = product['id']
        product_name = product['name']
        image_url = product['image_url']
        
        print(f"[{idx}/{len(products)}] Processing: {product_name} ({product_id})")
        
        try:
            # Generate embedding from text
            embedding = generate_text_embedding(model, product)
            
            # Create mock vector labels for compatibility
            vector_labels = create_mock_vector_labels(embedding)
            
            # Build item in expected format
            item = {
                "id": product_id,
                "name": product_name,
                "image_url": image_url,
                "vector": vector_labels,  # Mock labels for compatibility
                "embedding": embedding,    # Actual embedding vector
                "processed_at": int(time.time())
            }
            
            processed_items.append(item)
            print(f"   ✅ Generated {len(embedding)}-dimensional embedding")
            
        except Exception as e:
            print(f"   ⚠️  Error processing {product_name}: {e}")
            continue
    
    return processed_items


def save_metadata(items: List[Dict[str, Any]], output_path: str):
    """Save processed items to JSON file in expected format."""
    metadata = {
        "source": "PostgreSQL Store 2",
        "model": MODEL_NAME,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_items": len(items),
        "items": items
    }
    
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved metadata to: {output_path}")
        print(f"   Total items: {len(items)}")
        
    except Exception as e:
        print(f"❌ Failed to save metadata: {e}")
        sys.exit(1)


def main():
    """Main execution flow."""
    print("=" * 60)
    print("🚀 Sync 8 Shoes from Store 2 with LOCAL AI Embeddings")
    print("=" * 60)
    
    # Connect to database
    print("\n📊 Connecting to PostgreSQL...")
    conn = get_db_connection()
    print("✅ Connected to database")
    
    # Fetch products
    print(f"\n🔍 Fetching products from Store {STORE_ID}...")
    products = fetch_products_from_store_2(conn)
    
    if not products:
        print(f"⚠️  No products found in Store {STORE_ID}")
        conn.close()
        sys.exit(0)
    
    print(f"✅ Found {len(products)} products")
    
    # Process products with local AI
    processed_items = process_products(products)
    
    # Save to file
    output_path = os.path.abspath(OUTPUT_FILE)
    save_metadata(processed_items, output_path)
    
    # Cleanup
    conn.close()
    
    print("\n" + "=" * 60)
    print("✨ Sync completed successfully!")
    print("=" * 60)
    print(f"\n💡 Next steps:")
    print(f"   1. Check the output file: {output_path}")
    print(f"   2. Use this file with your visual search API")
    print(f"   3. Run this script anytime to refresh embeddings")
    print()


if __name__ == '__main__':
    main()
