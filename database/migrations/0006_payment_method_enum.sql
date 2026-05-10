-- Migration: Add payment_method_type enum
-- Purpose: Categorize payment methods into CREDIT_CARD, COD, and E_WALLET
-- Date: 2026-05-10

-- Create the payment_method_type enum
CREATE TYPE payment_method_type AS ENUM (
  'CREDIT_CARD', 'COD', 'E_WALLET'
);

-- Add payment_method_type column to orders table
ALTER TABLE orders 
ADD COLUMN payment_method_type payment_method_type;

-- Update existing orders based on payment_method_code
-- Map 'card' -> CREDIT_CARD, 'cod' -> COD, 'ewallet'/'momo'/'zalopay' -> E_WALLET
UPDATE orders 
SET payment_method_type = CASE 
  WHEN payment_method_code ILIKE '%card%' THEN 'CREDIT_CARD'::payment_method_type
  WHEN payment_method_code ILIKE '%cod%' THEN 'COD'::payment_method_type
  WHEN payment_method_code ILIKE '%wallet%' OR 
       payment_method_code ILIKE '%momo%' OR 
       payment_method_code ILIKE '%zalopay%' THEN 'E_WALLET'::payment_method_type
  ELSE 'COD'::payment_method_type  -- Default fallback
END;

-- Make the column NOT NULL after populating existing data
ALTER TABLE orders 
ALTER COLUMN payment_method_type SET NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_orders_payment_method_type ON orders (payment_method_type);
