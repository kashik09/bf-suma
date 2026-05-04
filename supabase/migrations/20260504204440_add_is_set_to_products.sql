-- Add is_set flag to products table for curated set/bundle products
-- Sets are single SKU products that contain multiple physical items

ALTER TABLE products ADD COLUMN is_set boolean NOT NULL DEFAULT false;

-- Partial index for efficient set product queries
CREATE INDEX idx_products_is_set ON products(is_set) WHERE is_set = true;

-- Mark known set products
UPDATE products SET is_set = true
WHERE sku IN ('CP0206', 'CP0207');
-- CP0206 = SUMA GRAND 1 Set
-- CP0207 = SUMA GRAND 2 Full Set

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
