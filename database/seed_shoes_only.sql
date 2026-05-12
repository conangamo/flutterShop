-- Shoe Store Seed Data - Replaces jewelry with real shoe brands
-- Run this after init_database.sql
-- This file contains ONLY shoe store data (Store ID: 2)

-- Ensure stores exist
INSERT INTO stores (id, name, slug)
VALUES
  (2, 'ShoeStore', 'shoes')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

SELECT setval(pg_get_serial_sequence('stores', 'id'), (SELECT COALESCE(MAX(id), 1) FROM stores));

-- Payment methods for shoe store
INSERT INTO payment_methods (store_id, code, title, subtitle, icon, enabled, position) VALUES
  (2, 'card', 'Credit / Debit Card', 'Visa, Mastercard, JCB', 'card-outline', TRUE, 0),
  (2, 'cod', 'Cash on Delivery', 'Pay when your parcel arrives', 'cash-outline', TRUE, 1),
  (2, 'wallet', 'E-wallet', 'Momo, ZaloPay, VNPay', 'wallet-outline', TRUE, 2)
ON CONFLICT (store_id, code) DO NOTHING;

-- Shoe categories
INSERT INTO categories (store_id, id, label, slug) VALUES
  (2, 'sneakers', 'Sneakers', 'sneakers'),
  (2, 'running', 'Running', 'running'),
  (2, 'basketball', 'Basketball', 'basketball'),
  (2, 'lifestyle', 'Lifestyle', 'lifestyle'),
  (2, 'boots', 'Boots', 'boots')
ON CONFLICT (store_id, id) DO NOTHING;

-- Demo user for shoe store
INSERT INTO users (id, store_id, email, password_hash, name, phone, role, is_active)
VALUES (
  'user-demo-shoes',
  2,
  'demo.shoes@gmail.com',
  '$2b$12$Iq0Bu1ky22u.WOHdNViKoegqg8IFGvw9HMlKjzn.rO6W2Newjxarq',
  'Shoe Store Admin',
  '0901234567',
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

-- PURGE OLD DATA: Remove all existing products for store 2
DELETE FROM product_images WHERE store_id = 2;
DELETE FROM product_variants WHERE store_id = 2;
DELETE FROM products WHERE store_id = 2;

-- ============================================
-- REAL SHOE PRODUCTS - Nike, Adidas, Puma
-- ============================================

-- Nike Air Max 270
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, compare_at_price, discount_label, discount_percent, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'nike-air-max-270',
  'sneakers',
  'Nike Air Max 270',
  'nike-air-max-270',
  'The Nike Air Max 270 delivers visible cushioning under every step. The design draws inspiration from Air Max icons, showcasing Nike''s greatest innovation with its large window and fresh array of colors.',
  'Iconic Air Max cushioning with modern style',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  3200000,
  3800000,
  '15% OFF',
  15,
  4.7,
  342,
  'sneaker',
  'rubber',
  'mesh_synthetic',
  'laces',
  'all_season',
  'casual',
  'adult',
  'Vietnam',
  'Nike',
  'unisex',
  TRUE
);

-- Adidas Ultraboost 22
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, compare_at_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'adidas-ultraboost-22',
  'running',
  'Adidas Ultraboost 22',
  'adidas-ultraboost-22',
  'Made with a series of recycled materials, this upper features at least 50% recycled content. The Ultraboost 22 is designed to provide energy return with every stride, featuring responsive Boost cushioning.',
  'Premium running shoe with Boost technology',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
  4200000,
  4800000,
  4.8,
  567,
  'sneaker',
  'continental_rubber',
  'primeknit',
  'laces',
  'all_season',
  'running',
  'adult',
  'Vietnam',
  'Adidas',
  'unisex',
  TRUE
);

-- Nike Air Jordan 1 Mid
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, discount_label, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'nike-air-jordan-1-mid',
  'basketball',
  'Nike Air Jordan 1 Mid',
  'nike-air-jordan-1-mid',
  'Inspired by the original AJ1, the Air Jordan 1 Mid offers fans a chance to follow in MJ''s footsteps. Fresh color trims the clean, classic materials, imbuing modernity into a classic design.',
  'Classic basketball heritage meets modern style',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80',
  3800000,
  'Best Seller',
  4.9,
  891,
  'sneaker',
  'rubber',
  'leather',
  'laces',
  'all_season',
  'sport',
  'adult',
  'China',
  'Nike',
  'unisex',
  TRUE
);

-- Adidas Stan Smith
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'adidas-stan-smith',
  'lifestyle',
  'Adidas Stan Smith',
  'adidas-stan-smith',
  'Clean and simple. The Stan Smith shoes stay true to their legacy with a smooth leather upper and perforated 3-Stripes. Lightweight and versatile, they work with everything from jeans to joggers.',
  'Timeless tennis-inspired sneaker',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80',
  2400000,
  4.6,
  1203,
  'sneaker',
  'rubber',
  'leather',
  'laces',
  'all_season',
  'casual',
  'adult',
  'Vietnam',
  'Adidas',
  'unisex',
  TRUE
);

-- Puma RS-X
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, compare_at_price, discount_label, discount_percent, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'puma-rs-x',
  'sneakers',
  'Puma RS-X Reinvention',
  'puma-rs-x',
  'The RS-X Reinvention brings back the chunky sneaker trend with bold colors and exaggerated tooling. Featuring RS cushioning technology for comfort and a mesh and synthetic leather upper.',
  'Bold chunky sneaker with RS cushioning',
  'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
  2800000,
  3200000,
  '12% OFF',
  12,
  4.5,
  234,
  'sneaker',
  'rubber',
  'mesh_synthetic',
  'laces',
  'all_season',
  'casual',
  'adult',
  'Vietnam',
  'Puma',
  'unisex',
  TRUE
);

-- Nike React Infinity Run
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'nike-react-infinity-run',
  'running',
  'Nike React Infinity Run Flyknit 3',
  'nike-react-infinity-run',
  'Designed to help reduce injury and keep you on the run. More foam means better cushioning, and a wider forefoot provides a more stable ride. Secure support comes from Flywire technology.',
  'Injury-reducing running shoe with React foam',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80',
  3600000,
  4.7,
  445,
  'sneaker',
  'rubber',
  'flyknit',
  'laces',
  'all_season',
  'running',
  'adult',
  'Vietnam',
  'Nike',
  'unisex',
  TRUE
);

-- Adidas NMD R1
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, discount_label, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'adidas-nmd-r1',
  'lifestyle',
  'Adidas NMD_R1',
  'adidas-nmd-r1',
  'A modern icon. These NMD_R1 shoes honor the adidas heritage with distinctive midsole plugs and a sock-like Primeknit upper. Boost cushioning delivers comfort for all-day wear.',
  'Modern street style with Boost comfort',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
  3400000,
  'New Arrival',
  4.6,
  678,
  'sneaker',
  'rubber',
  'primeknit',
  'laces',
  'all_season',
  'casual',
  'adult',
  'Vietnam',
  'Adidas',
  'unisex',
  TRUE
);

-- Puma Suede Classic
INSERT INTO products (
  store_id, id, category_id, name, slug, description, short_description, default_image,
  base_price, rating_avg, review_count,
  shoe_type, sole_material, upper_material, closure_type, season, usage_type,
  recommended_age_group, country_of_origin, brand, gender_target, is_active
) VALUES (
  2,
  'puma-suede-classic',
  'lifestyle',
  'Puma Suede Classic XXI',
  'puma-suede-classic',
  'Since its debut in 1968, the Suede has been a cultural icon. This version stays true to the original with its low-profile silhouette and soft suede upper, updated with modern comfort.',
  'Iconic suede sneaker since 1968',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
  2200000,
  4.7,
  892,
  'sneaker',
  'rubber',
  'suede',
  'laces',
  'all_season',
  'casual',
  'adult',
  'Vietnam',
  'Puma',
  'unisex',
  TRUE
);

-- Update total stock for all products
UPDATE products SET total_stock = 50 WHERE store_id = 2 AND id = 'nike-air-max-270';
UPDATE products SET total_stock = 45 WHERE store_id = 2 AND id = 'adidas-ultraboost-22';
UPDATE products SET total_stock = 60 WHERE store_id = 2 AND id = 'nike-air-jordan-1-mid';
UPDATE products SET total_stock = 80 WHERE store_id = 2 AND id = 'adidas-stan-smith';
UPDATE products SET total_stock = 40 WHERE store_id = 2 AND id = 'puma-rs-x';
UPDATE products SET total_stock = 55 WHERE store_id = 2 AND id = 'nike-react-infinity-run';
UPDATE products SET total_stock = 70 WHERE store_id = 2 AND id = 'adidas-nmd-r1';
UPDATE products SET total_stock = 65 WHERE store_id = 2 AND id = 'puma-suede-classic';

-- ============================================
-- PRODUCT VARIANTS (Sizes)
-- ============================================

-- Nike Air Max 270 variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'nike-air-max-270-39', 'nike-air-max-270', 'NIKE-AM270-39', '39', 'Black/White', 3200000, 10, 0),
  (2, 'nike-air-max-270-40', 'nike-air-max-270', 'NIKE-AM270-40', '40', 'Black/White', 3200000, 10, 1),
  (2, 'nike-air-max-270-41', 'nike-air-max-270', 'NIKE-AM270-41', '41', 'Black/White', 3200000, 10, 2),
  (2, 'nike-air-max-270-42', 'nike-air-max-270', 'NIKE-AM270-42', '42', 'Black/White', 3200000, 10, 3),
  (2, 'nike-air-max-270-43', 'nike-air-max-270', 'NIKE-AM270-43', '43', 'Black/White', 3200000, 10, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Adidas Ultraboost 22 variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'adidas-ub22-39', 'adidas-ultraboost-22', 'ADIDAS-UB22-39', '39', 'Core Black', 4200000, 9, 0),
  (2, 'adidas-ub22-40', 'adidas-ultraboost-22', 'ADIDAS-UB22-40', '40', 'Core Black', 4200000, 9, 1),
  (2, 'adidas-ub22-41', 'adidas-ultraboost-22', 'ADIDAS-UB22-41', '41', 'Core Black', 4200000, 9, 2),
  (2, 'adidas-ub22-42', 'adidas-ultraboost-22', 'ADIDAS-UB22-42', '42', 'Core Black', 4200000, 9, 3),
  (2, 'adidas-ub22-43', 'adidas-ultraboost-22', 'ADIDAS-UB22-43', '43', 'Core Black', 4200000, 9, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Nike Air Jordan 1 Mid variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'nike-aj1-39', 'nike-air-jordan-1-mid', 'NIKE-AJ1-39', '39', 'Chicago', 3800000, 12, 0),
  (2, 'nike-aj1-40', 'nike-air-jordan-1-mid', 'NIKE-AJ1-40', '40', 'Chicago', 3800000, 12, 1),
  (2, 'nike-aj1-41', 'nike-air-jordan-1-mid', 'NIKE-AJ1-41', '41', 'Chicago', 3800000, 12, 2),
  (2, 'nike-aj1-42', 'nike-air-jordan-1-mid', 'NIKE-AJ1-42', '42', 'Chicago', 3800000, 12, 3),
  (2, 'nike-aj1-43', 'nike-air-jordan-1-mid', 'NIKE-AJ1-43', '43', 'Chicago', 3800000, 12, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Adidas Stan Smith variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'adidas-ss-39', 'adidas-stan-smith', 'ADIDAS-SS-39', '39', 'White/Green', 2400000, 16, 0),
  (2, 'adidas-ss-40', 'adidas-stan-smith', 'ADIDAS-SS-40', '40', 'White/Green', 2400000, 16, 1),
  (2, 'adidas-ss-41', 'adidas-stan-smith', 'ADIDAS-SS-41', '41', 'White/Green', 2400000, 16, 2),
  (2, 'adidas-ss-42', 'adidas-stan-smith', 'ADIDAS-SS-42', '42', 'White/Green', 2400000, 16, 3),
  (2, 'adidas-ss-43', 'adidas-stan-smith', 'ADIDAS-SS-43', '43', 'White/Green', 2400000, 16, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Puma RS-X variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'puma-rsx-39', 'puma-rs-x', 'PUMA-RSX-39', '39', 'Multi', 2800000, 8, 0),
  (2, 'puma-rsx-40', 'puma-rs-x', 'PUMA-RSX-40', '40', 'Multi', 2800000, 8, 1),
  (2, 'puma-rsx-41', 'puma-rs-x', 'PUMA-RSX-41', '41', 'Multi', 2800000, 8, 2),
  (2, 'puma-rsx-42', 'puma-rs-x', 'PUMA-RSX-42', '42', 'Multi', 2800000, 8, 3),
  (2, 'puma-rsx-43', 'puma-rs-x', 'PUMA-RSX-43', '43', 'Multi', 2800000, 8, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Nike React Infinity Run variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'nike-react-39', 'nike-react-infinity-run', 'NIKE-REACT-39', '39', 'Blue', 3600000, 11, 0),
  (2, 'nike-react-40', 'nike-react-infinity-run', 'NIKE-REACT-40', '40', 'Blue', 3600000, 11, 1),
  (2, 'nike-react-41', 'nike-react-infinity-run', 'NIKE-REACT-41', '41', 'Blue', 3600000, 11, 2),
  (2, 'nike-react-42', 'nike-react-infinity-run', 'NIKE-REACT-42', '42', 'Blue', 3600000, 11, 3),
  (2, 'nike-react-43', 'nike-react-infinity-run', 'NIKE-REACT-43', '43', 'Blue', 3600000, 11, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Adidas NMD R1 variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'adidas-nmd-39', 'adidas-nmd-r1', 'ADIDAS-NMD-39', '39', 'Black/Red', 3400000, 14, 0),
  (2, 'adidas-nmd-40', 'adidas-nmd-r1', 'ADIDAS-NMD-40', '40', 'Black/Red', 3400000, 14, 1),
  (2, 'adidas-nmd-41', 'adidas-nmd-r1', 'ADIDAS-NMD-41', '41', 'Black/Red', 3400000, 14, 2),
  (2, 'adidas-nmd-42', 'adidas-nmd-r1', 'ADIDAS-NMD-42', '42', 'Black/Red', 3400000, 14, 3),
  (2, 'adidas-nmd-43', 'adidas-nmd-r1', 'ADIDAS-NMD-43', '43', 'Black/Red', 3400000, 14, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- Puma Suede Classic variants
INSERT INTO product_variants (store_id, id, product_id, sku, size, color, price, stock, position) VALUES
  (2, 'puma-suede-39', 'puma-suede-classic', 'PUMA-SUEDE-39', '39', 'Navy', 2200000, 13, 0),
  (2, 'puma-suede-40', 'puma-suede-classic', 'PUMA-SUEDE-40', '40', 'Navy', 2200000, 13, 1),
  (2, 'puma-suede-41', 'puma-suede-classic', 'PUMA-SUEDE-41', '41', 'Navy', 2200000, 13, 2),
  (2, 'puma-suede-42', 'puma-suede-classic', 'PUMA-SUEDE-42', '42', 'Navy', 2200000, 13, 3),
  (2, 'puma-suede-43', 'puma-suede-classic', 'PUMA-SUEDE-43', '43', 'Navy', 2200000, 13, 4)
ON CONFLICT (store_id, id) DO UPDATE SET stock = EXCLUDED.stock;

-- ============================================
-- PRODUCT IMAGES (Additional gallery images)
-- ============================================

INSERT INTO product_images (id, store_id, product_id, url, position) VALUES
  ('img-nike-am270-1', 2, 'nike-air-max-270', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 0),
  ('img-nike-am270-2', 2, 'nike-air-max-270', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80', 1),
  
  ('img-adidas-ub22-1', 2, 'adidas-ultraboost-22', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80', 0),
  ('img-adidas-ub22-2', 2, 'adidas-ultraboost-22', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80', 1),
  
  ('img-nike-aj1-1', 2, 'nike-air-jordan-1-mid', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80', 0),
  ('img-nike-aj1-2', 2, 'nike-air-jordan-1-mid', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80', 1)
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Shoe store seed data loaded successfully!';
  RAISE NOTICE '📊 Store ID: 2 (ShoeStore)';
  RAISE NOTICE '👟 Products: Nike, Adidas, Puma';
  RAISE NOTICE '🔑 Demo account: demo.shoes@gmail.com / demo123456';
END $$;
