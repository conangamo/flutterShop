-- 0004 Phase 1 — Data integrity hardening + shoe-store foundation
-- Idempotent: dùng IF NOT EXISTS / DO blocks. An toàn để chạy nhiều lần.
-- Áp dụng:
--   docker compose exec -T db psql -U postgres -d ${POSTGRES_DB} -f /docker-entrypoint-initdb.d/migrations/0004_phase1_integrity_and_shoes.sql
-- Hoặc copy file vào container rồi `psql ... -f ...`.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) CHECK constraints để chặn dữ liệu xấu (oversell, giá âm, qty <= 0)
-- ---------------------------------------------------------------------------

-- products
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_total_stock_nonneg'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_total_stock_nonneg CHECK (total_stock >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_base_price_nonneg'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_base_price_nonneg CHECK (base_price >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_sale_price_nonneg'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_sale_price_nonneg CHECK (sale_price IS NULL OR sale_price >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_compare_at_price_nonneg'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_compare_at_price_nonneg
      CHECK (compare_at_price IS NULL OR compare_at_price >= 0);
  END IF;
END $$;

-- product_variants
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pv_stock_nonneg'
  ) THEN
    ALTER TABLE product_variants
      ADD CONSTRAINT pv_stock_nonneg CHECK (stock >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pv_price_nonneg'
  ) THEN
    ALTER TABLE product_variants
      ADD CONSTRAINT pv_price_nonneg CHECK (price IS NULL OR price >= 0);
  END IF;
END $$;

-- order_items
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'oi_quantity_positive'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT oi_quantity_positive CHECK (quantity > 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'oi_unit_price_nonneg'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT oi_unit_price_nonneg CHECK (unit_price >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'oi_line_total_nonneg'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT oi_line_total_nonneg CHECK (line_total >= 0);
  END IF;
END $$;

-- orders
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_subtotal_nonneg'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_subtotal_nonneg CHECK (subtotal >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_shipping_fee_nonneg'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_shipping_fee_nonneg CHECK (shipping_fee >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_discount_total_nonneg'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_discount_total_nonneg CHECK (discount_total >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_nonneg'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_total_nonneg CHECK (total >= 0);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Indexes tối ưu cho lifecycle đơn hàng (admin/orders list)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_store_status_placed
  ON orders (store_id, status, placed_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_timelines_store_order_pos2
  ON order_timelines (store_id, order_id, position);

-- ---------------------------------------------------------------------------
-- 3) Bổ sung shoe categories + products mẫu để store 2 đủ demo
-- ---------------------------------------------------------------------------
INSERT INTO categories (store_id, id, label, slug) VALUES
  (2, 'sandals', 'Sandals', 'sandals'),
  (2, 'loafers', 'Loafers', 'loafers')
ON CONFLICT (store_id, id) DO NOTHING;

-- Boots
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, compare_at_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active, is_featured
) VALUES (
  2,
  'shoe-boot-01',
  'boots',
  'Highland Trail Boot',
  'highland-trail-boot',
  'Đế cao su chống trượt, da bò bảo vệ tốt cho mùa lạnh và đường khô.',
  'Boot da bò thật, chống trượt.',
  'https://images.unsplash.com/photo-1520975918318-3f0e3d3a07c0?auto=format&fit=crop&w=900&q=60',
  2490000,
  2890000,
  4.6,
  64,
  'boot', 'rubber', 'leather', 'laces', 'winter', 'outdoor',
  'adult', 'VN', 'HighlandCo', 'men', TRUE, TRUE
)
ON CONFLICT (store_id, id) DO NOTHING;

-- Sandals
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'shoe-sandal-01',
  'sandals',
  'Coastal Comfort Sandal',
  'coastal-comfort-sandal',
  'Sandal nhẹ, đế EVA mềm, khoá Velcro chỉnh ôm chân.',
  'Sandal đế mềm, dễ điều chỉnh.',
  'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=60',
  690000,
  4.3,
  41,
  'sandal', 'EVA', 'synthetic', 'velcro', 'summer', 'casual',
  'adult', 'VN', 'CoastWalk', 'unisex', TRUE
)
ON CONFLICT (store_id, id) DO NOTHING;

-- Loafer
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, sale_price, discount_label, discount_percent, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'shoe-loafer-01',
  'loafers',
  'Office Daily Loafer',
  'office-daily-loafer',
  'Loafer thanh lịch cho công sở, đế cao su êm bước cả ngày.',
  'Loafer da êm chân.',
  'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=900&q=60',
  1590000,
  1390000,
  'Sale 13%',
  13,
  4.4,
  78,
  'loafer', 'rubber', 'leather', 'slip_on', 'all_season', 'formal',
  'adult', 'VN', 'OfficeWalk', 'women', TRUE
)
ON CONFLICT (store_id, id) DO NOTHING;

-- Sneaker thứ 2 (women)
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active, is_featured
) VALUES (
  2,
  'shoe-runner-02',
  'sneakers',
  'Cloudstep Lite W',
  'cloudstep-lite-w',
  'Sneaker mềm nhẹ cho nữ, đế phylon đàn hồi tốt.',
  'Sneaker nữ, đế đàn hồi.',
  'https://images.unsplash.com/photo-1528701800489-20be3c2ea5c0?auto=format&fit=crop&w=900&q=60',
  1490000,
  4.2,
  56,
  'sneaker', 'EVA', 'mesh', 'laces', 'spring_fall', 'sport',
  'adult', 'VN', 'CloudStep', 'women', TRUE, TRUE
)
ON CONFLICT (store_id, id) DO NOTHING;

-- Set total_stock dựa trên tổng variant stock dưới đây
UPDATE products SET total_stock = 24 WHERE store_id = 2 AND id = 'shoe-boot-01';
UPDATE products SET total_stock = 30 WHERE store_id = 2 AND id = 'shoe-sandal-01';
UPDATE products SET total_stock = 18 WHERE store_id = 2 AND id = 'shoe-loafer-01';
UPDATE products SET total_stock = 25 WHERE store_id = 2 AND id = 'shoe-runner-02';

-- Variants size cho từng product (chuẩn EU shoe size)
INSERT INTO product_variants (store_id, id, product_id, sku, color, size, price, stock, position) VALUES
  (2, 'shoe-boot-01-39-brown', 'shoe-boot-01', 'SHO-BOOT-01-39-BR', 'Brown', '39', 2490000, 4, 0),
  (2, 'shoe-boot-01-40-brown', 'shoe-boot-01', 'SHO-BOOT-01-40-BR', 'Brown', '40', 2490000, 6, 1),
  (2, 'shoe-boot-01-41-brown', 'shoe-boot-01', 'SHO-BOOT-01-41-BR', 'Brown', '41', 2490000, 6, 2),
  (2, 'shoe-boot-01-42-black', 'shoe-boot-01', 'SHO-BOOT-01-42-BK', 'Black', '42', 2490000, 4, 3),
  (2, 'shoe-boot-01-43-black', 'shoe-boot-01', 'SHO-BOOT-01-43-BK', 'Black', '43', 2490000, 4, 4),

  (2, 'shoe-sandal-01-38', 'shoe-sandal-01', 'SHO-SDL-01-38', NULL, '38', 690000, 6, 0),
  (2, 'shoe-sandal-01-39', 'shoe-sandal-01', 'SHO-SDL-01-39', NULL, '39', 690000, 6, 1),
  (2, 'shoe-sandal-01-40', 'shoe-sandal-01', 'SHO-SDL-01-40', NULL, '40', 690000, 6, 2),
  (2, 'shoe-sandal-01-41', 'shoe-sandal-01', 'SHO-SDL-01-41', NULL, '41', 690000, 6, 3),
  (2, 'shoe-sandal-01-42', 'shoe-sandal-01', 'SHO-SDL-01-42', NULL, '42', 690000, 6, 4),

  (2, 'shoe-loafer-01-36', 'shoe-loafer-01', 'SHO-LFR-01-36', 'Black', '36', 1390000, 3, 0),
  (2, 'shoe-loafer-01-37', 'shoe-loafer-01', 'SHO-LFR-01-37', 'Black', '37', 1390000, 5, 1),
  (2, 'shoe-loafer-01-38', 'shoe-loafer-01', 'SHO-LFR-01-38', 'Black', '38', 1390000, 5, 2),
  (2, 'shoe-loafer-01-39', 'shoe-loafer-01', 'SHO-LFR-01-39', 'Black', '39', 1390000, 5, 3),

  (2, 'shoe-runner-02-36', 'shoe-runner-02', 'SHO-RUN-02-36', 'Pink', '36', 1490000, 5, 0),
  (2, 'shoe-runner-02-37', 'shoe-runner-02', 'SHO-RUN-02-37', 'Pink', '37', 1490000, 5, 1),
  (2, 'shoe-runner-02-38', 'shoe-runner-02', 'SHO-RUN-02-38', 'Pink', '38', 1490000, 5, 2),
  (2, 'shoe-runner-02-39', 'shoe-runner-02', 'SHO-RUN-02-39', 'Pink', '39', 1490000, 5, 3),
  (2, 'shoe-runner-02-40', 'shoe-runner-02', 'SHO-RUN-02-40', 'Pink', '40', 1490000, 5, 4)
ON CONFLICT (store_id, id) DO NOTHING;

-- Product images (gallery)
INSERT INTO product_images (id, store_id, product_id, url, position) VALUES
  ('img-shoe-runner-01-0', 2, 'shoe-runner-01', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=60', 0),
  ('img-shoe-runner-01-1', 2, 'shoe-runner-01', 'https://images.unsplash.com/photo-1528701800489-20be3c2ea5c0?auto=format&fit=crop&w=900&q=60', 1),
  ('img-shoe-runner-01-2', 2, 'shoe-runner-01', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=60', 2),

  ('img-shoe-boot-01-0', 2, 'shoe-boot-01', 'https://images.unsplash.com/photo-1520975918318-3f0e3d3a07c0?auto=format&fit=crop&w=900&q=60', 0),
  ('img-shoe-boot-01-1', 2, 'shoe-boot-01', 'https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?auto=format&fit=crop&w=900&q=60', 1),

  ('img-shoe-sandal-01-0', 2, 'shoe-sandal-01', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=60', 0),

  ('img-shoe-loafer-01-0', 2, 'shoe-loafer-01', 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=900&q=60', 0),
  ('img-shoe-loafer-01-1', 2, 'shoe-loafer-01', 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=900&q=60', 1),

  ('img-shoe-runner-02-0', 2, 'shoe-runner-02', 'https://images.unsplash.com/photo-1528701800489-20be3c2ea5c0?auto=format&fit=crop&w=900&q=60', 0),
  ('img-shoe-runner-02-1', 2, 'shoe-runner-02', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=60', 1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4) Tài khoản demo cho shoe store (admin để demo phần admin ops)
-- email: demo.shoes@gmail.com / password: demo123456
-- ---------------------------------------------------------------------------
INSERT INTO users (id, store_id, email, password_hash, name, phone, role, is_active)
VALUES (
  'user-demo-shoes',
  2,
  'demo.shoes@gmail.com',
  '$2b$12$Iq0Bu1ky22u.WOHdNViKoegqg8IFGvw9HMlKjzn.rO6W2Newjxarq',
  'Shoe Store Admin',
  '0901123789',
  'admin',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO addresses (id, store_id, user_id, name, phone, address, city, is_default)
VALUES (
  'addr-demo-shoes-1',
  2,
  'user-demo-shoes',
  'Shoe Store Admin',
  '0901123789',
  '12 Le Loi, Ben Thanh Ward',
  'Ho Chi Minh City',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
