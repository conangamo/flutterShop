-- Validation Script for Shoe Store Data
-- Run this to verify the shoe seed data was applied correctly

\echo '=== STEP 1: Check Stores ==='
SELECT id, name, slug FROM stores ORDER BY id;

\echo ''
\echo '=== STEP 2: Check Product Count by Store ==='
SELECT 
  store_id,
  COUNT(*) as product_count,
  STRING_AGG(DISTINCT brand, ', ' ORDER BY brand) as brands
FROM products 
WHERE deleted_at IS NULL
GROUP BY store_id
ORDER BY store_id;

\echo ''
\echo '=== STEP 3: List Shoe Products (Store 2) ==='
SELECT 
  id,
  name,
  brand,
  base_price,
  total_stock,
  category_id
FROM products 
WHERE store_id = 2 AND deleted_at IS NULL
ORDER BY brand, name;

\echo ''
\echo '=== STEP 4: Check Product Variants for Shoes ==='
SELECT 
  p.brand,
  p.name,
  COUNT(pv.id) as variant_count,
  SUM(pv.stock) as total_stock
FROM products p
LEFT JOIN product_variants pv ON p.store_id = pv.store_id AND p.id = pv.product_id
WHERE p.store_id = 2 AND p.deleted_at IS NULL
GROUP BY p.brand, p.name
ORDER BY p.brand, p.name;

\echo ''
\echo '=== STEP 5: Check Categories for Store 2 ==='
SELECT id, label, slug FROM categories WHERE store_id = 2 ORDER BY id;

\echo ''
\echo '=== VALIDATION SUMMARY ==='
\echo 'Expected Results:'
\echo '- Store 2 should be named "ShoeStore"'
\echo '- Should have 8 shoe products (Nike, Adidas, Puma)'
\echo '- Each product should have 5 variants (sizes 39-43)'
\echo '- Brands should be: Adidas, Nike, Puma'
\echo '- No jewelry products should exist for store_id = 2'
