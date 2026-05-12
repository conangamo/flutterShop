-- QUICK FIX: Create promo_codes tables and add sample vouchers
-- Run this with: docker compose -f native-e-commerce-be/docker-compose.yml exec db psql -U postgres -d ecommerce -f /workspace-database/QUICK_FIX_PROMO_TABLES.sql
-- Or: psql -h localhost -p 5432 -U postgres -d ecommerce -f database/QUICK_FIX_PROMO_TABLES.sql

BEGIN;

-- ============================================================================
-- STEP 1: Create Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id                TEXT PRIMARY KEY,
  store_id          INTEGER NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
  code              TEXT NOT NULL,
  discount_type     TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percent')),
  discount_value    NUMERIC(14, 2) NOT NULL CHECK (discount_value >= 0),
  max_discount      NUMERIC(14, 2),
  min_order_total   NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (min_order_total >= 0),
  usage_limit       INTEGER,
  used_count        INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_store_active
  ON promo_codes (store_id, is_active);

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id            TEXT PRIMARY KEY,
  store_id      INTEGER NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
  promo_id      TEXT NOT NULL REFERENCES promo_codes (id) ON DELETE CASCADE,
  order_id      TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  discount_applied NUMERIC(14, 2) NOT NULL CHECK (discount_applied >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_store_promo
  ON promo_redemptions (store_id, promo_id, created_at DESC);

-- ============================================================================
-- STEP 2: Add Sample Vouchers for Store 1 (Jewelry)
-- ============================================================================

INSERT INTO promo_codes (
    id, store_id, code, discount_type, discount_value,
    max_discount, min_order_total, usage_limit, used_count,
    is_active, starts_at, ends_at, created_at, updated_at
) VALUES 
(gen_random_uuid(), 1, 'SUMMER2024', 'percent', 10, 100000, 200000, 100, 0, true, NOW(), NOW() + INTERVAL '90 days', NOW(), NOW()),
(gen_random_uuid(), 1, 'FREESHIP', 'fixed', 30000, NULL, 0, NULL, 0, true, NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 1, 'VIP50', 'fixed', 50000, NULL, 1000000, 50, 0, true, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
(gen_random_uuid(), 1, 'WELCOME10', 'fixed', 10000, NULL, 0, 1000, 0, true, NOW(), NOW() + INTERVAL '365 days', NOW(), NOW()),
(gen_random_uuid(), 1, 'FLASH20', 'percent', 20, 200000, 500000, 200, 0, true, NOW(), NOW() + INTERVAL '7 days', NOW(), NOW()),
(gen_random_uuid(), 1, 'MEGA30', 'percent', 30, 300000, 800000, 50, 0, true, NOW(), NOW() + INTERVAL '14 days', NOW(), NOW())
ON CONFLICT (store_id, code) DO NOTHING;

-- ============================================================================
-- STEP 3: Add Sample Vouchers for Store 2 (Shoes)
-- ============================================================================

INSERT INTO promo_codes (
    id, store_id, code, discount_type, discount_value,
    max_discount, min_order_total, usage_limit, used_count,
    is_active, starts_at, ends_at, created_at, updated_at
) VALUES 
(gen_random_uuid(), 2, 'SUMMER2024', 'percent', 10, 100000, 200000, 100, 0, true, NOW(), NOW() + INTERVAL '90 days', NOW(), NOW()),
(gen_random_uuid(), 2, 'FREESHIP', 'fixed', 30000, NULL, 0, NULL, 0, true, NULL, NULL, NOW(), NOW()),
(gen_random_uuid(), 2, 'VIP50', 'fixed', 50000, NULL, 1000000, 50, 0, true, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
(gen_random_uuid(), 2, 'WELCOME10', 'fixed', 10000, NULL, 0, 1000, 0, true, NOW(), NOW() + INTERVAL '365 days', NOW(), NOW()),
(gen_random_uuid(), 2, 'FLASH20', 'percent', 20, 200000, 500000, 200, 0, true, NOW(), NOW() + INTERVAL '7 days', NOW(), NOW()),
(gen_random_uuid(), 2, 'MEGA30', 'percent', 30, 300000, 800000, 50, 0, true, NOW(), NOW() + INTERVAL '14 days', NOW(), NOW())
ON CONFLICT (store_id, code) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'Tables Created:'
\echo '========================================='

SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('promo_codes', 'promo_redemptions')
ORDER BY table_name;

\echo ''
\echo '========================================='
\echo 'Vouchers for Store 1 (Jewelry):'
\echo '========================================='

SELECT code, discount_type, discount_value, min_order_total, is_active
FROM promo_codes 
WHERE store_id = 1
ORDER BY code;

\echo ''
\echo '========================================='
\echo 'Vouchers for Store 2 (Shoes):'
\echo '========================================='

SELECT code, discount_type, discount_value, min_order_total, is_active
FROM promo_codes 
WHERE store_id = 2
ORDER BY code;

\echo ''
\echo '========================================='
\echo 'Setup Complete!'
\echo '========================================='
\echo 'Total vouchers created:'

SELECT store_id, COUNT(*) as voucher_count
FROM promo_codes
GROUP BY store_id
ORDER BY store_id;
