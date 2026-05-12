-- Sample Vouchers for Testing
-- Run this script to populate the database with test vouchers

-- Clear existing test vouchers (optional - comment out if you want to keep existing ones)
-- DELETE FROM promo_redemptions WHERE promo_id IN (SELECT id FROM promo_codes WHERE code IN ('SUMMER2024', 'FREESHIP', 'VIP50', 'WELCOME10', 'FLASH20'));
-- DELETE FROM promo_codes WHERE code IN ('SUMMER2024', 'FREESHIP', 'VIP50', 'WELCOME10', 'FLASH20');

-- 1. SUMMER2024 - 10% off, max 100,000₫, min order 200,000₫
INSERT INTO promo_codes (
    id, 
    store_id, 
    code, 
    discount_type, 
    discount_value,
    max_discount, 
    min_order_total, 
    usage_limit, 
    used_count,
    is_active, 
    starts_at, 
    ends_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    1, 
    'SUMMER2024', 
    'percent', 
    10,
    100000, 
    200000, 
    100, 
    0,
    true, 
    NOW(), 
    NOW() + INTERVAL '90 days', 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- 2. FREESHIP - Free shipping (30,000₫ fixed discount), no minimum
INSERT INTO promo_codes (
    id, 
    store_id, 
    code, 
    discount_type, 
    discount_value,
    max_discount, 
    min_order_total, 
    usage_limit, 
    used_count,
    is_active, 
    starts_at, 
    ends_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    1, 
    'FREESHIP', 
    'fixed', 
    30000,
    NULL, 
    0, 
    NULL, 
    0,
    true, 
    NULL, 
    NULL, 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- 3. VIP50 - 50,000₫ off, min order 1,000,000₫
INSERT INTO promo_codes (
    id, 
    store_id, 
    code, 
    discount_type, 
    discount_value,
    max_discount, 
    min_order_total, 
    usage_limit, 
    used_count,
    is_active, 
    starts_at, 
    ends_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    1, 
    'VIP50', 
    'fixed', 
    50000,
    NULL, 
    1000000, 
    50, 
    0,
    true, 
    NOW(), 
    NOW() + INTERVAL '30 days', 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- 4. WELCOME10 - 10,000₫ off for new users, no minimum
INSERT INTO promo_codes (
    id, 
    store_id, 
    code, 
    discount_type, 
    discount_value,
    max_discount, 
    min_order_total, 
    usage_limit, 
    used_count,
    is_active, 
    starts_at, 
    ends_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    1, 
    'WELCOME10', 
    'fixed', 
    10000,
    NULL, 
    0, 
    1000, 
    0,
    true, 
    NOW(), 
    NOW() + INTERVAL '365 days', 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- 5. FLASH20 - 20% off, max 200,000₫, min order 500,000₫
INSERT INTO promo_codes (
    id, 
    store_id, 
    code, 
    discount_type, 
    discount_value,
    max_discount, 
    min_order_total, 
    usage_limit, 
    used_count,
    is_active, 
    starts_at, 
    ends_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    1, 
    'FLASH20', 
    'percent', 
    20,
    200000, 
    500000, 
    200, 
    0,
    true, 
    NOW(), 
    NOW() + INTERVAL '7 days', 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- 6. MEGA30 - 30% off, max 300,000₫, min order 800,000₫
INSERT INTO promo_codes (
    id, 
    store_id, 
    code, 
    discount_type, 
    discount_value,
    max_discount, 
    min_order_total, 
    usage_limit, 
    used_count,
    is_active, 
    starts_at, 
    ends_at, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    1, 
    'MEGA30', 
    'percent', 
    30,
    300000, 
    800000, 
    50, 
    0,
    true, 
    NOW(), 
    NOW() + INTERVAL '14 days', 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;

-- Verify inserted vouchers
SELECT 
    code,
    discount_type,
    discount_value,
    max_discount,
    min_order_total,
    usage_limit,
    used_count,
    is_active,
    ends_at
FROM promo_codes
WHERE store_id = 1
ORDER BY created_at DESC;
