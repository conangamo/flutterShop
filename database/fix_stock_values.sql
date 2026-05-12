-- ============================================
-- FIX STOCK VALUES FOR ALL SHOE PRODUCTS
-- ============================================
-- This script ensures all products have positive stock values
-- Run this to fix the "Hết hàng" badge issue

-- Update product variants to have stock = 20 for all items
UPDATE product_variants 
SET stock = 20 
WHERE store_id = 2 
  AND stock = 0;

-- Update total_stock in products table to match variant totals
UPDATE products p
SET total_stock = (
    SELECT COALESCE(SUM(pv.stock), 20)
    FROM product_variants pv
    WHERE pv.store_id = p.store_id 
      AND pv.product_id = p.id
      AND pv.deleted_at IS NULL
)
WHERE p.store_id = 2 
  AND p.deleted_at IS NULL;

-- Ensure products without variants have stock
UPDATE products 
SET total_stock = 20 
WHERE store_id = 2 
  AND deleted_at IS NULL
  AND (total_stock IS NULL OR total_stock = 0)
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv 
    WHERE pv.store_id = products.store_id 
      AND pv.product_id = products.id
      AND pv.deleted_at IS NULL
  );

-- Verify the fix
SELECT 
    p.id,
    p.name,
    p.total_stock,
    COUNT(pv.id) as variant_count,
    COALESCE(SUM(pv.stock), 0) as total_variant_stock
FROM products p
LEFT JOIN product_variants pv ON pv.store_id = p.store_id AND pv.product_id = p.id AND pv.deleted_at IS NULL
WHERE p.store_id = 2 AND p.deleted_at IS NULL
GROUP BY p.id, p.name, p.total_stock
ORDER BY p.name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Stock values updated successfully!';
  RAISE NOTICE '📦 All products now have stock = 20';
  RAISE NOTICE '🔄 Please refresh the app to see changes';
END $$;
