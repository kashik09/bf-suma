-- Add 5 missing products from price list (idempotent)
-- Prices converted to KES minor units based on USD rates

-- 1. GluzoJoint-F Capsules (Joint Health)
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'GluzoJoint-F Capsules',
  'gluzojoint-f-capsules',
  'Glucosamine formula for joint flexibility and cartilage support.',
  478000, 531000, 'KES', 'AP014C', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'joint-health'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'AP014C')
ON CONFLICT (slug) DO NOTHING;

-- 2. NMN Coffee (Beverages/Anti-Aging)
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'NMN Coffee',
  'nmn-coffee',
  'Premium coffee infused with NMN for cellular energy and anti-aging benefits. Combines the enjoyment of coffee with NAD+ boosting technology.',
  477500, 530500, 'KES', 'AP144B', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'AP144B')
ON CONFLICT (slug) DO NOTHING;

-- 3. Detoxilive Pro Oil Capsules (Detox)
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Detoxilive Pro Oil Capsules',
  'detoxilive-pro-oil',
  'Advanced oil-based formula for enhanced liver detoxification and cleansing. Premium absorption for maximum effectiveness.',
  382000, 424400, 'KES', 'AP166B', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'detox'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'AP166B')
ON CONFLICT (slug) DO NOTHING;

-- 4. SUMA GRAND 1 - Skincare Bundle (Cleanser + Lotion + Toner)
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'SUMA GRAND 1 Set',
  'suma-grand-1-set',
  'Complete skincare starter bundle including Youth Refreshing Facial Cleanser, Youth Essence Lotion, and Youth Essence Toner. Save more with this curated set.',
  1168900, 1298700, 'KES', 'CP0206', 25, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'CP0206')
ON CONFLICT (slug) DO NOTHING;

-- 5. SUMA GRAND 2 - Full Skincare Set (All 5 Youth products)
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'SUMA GRAND 2 Full Set',
  'suma-grand-2-full-set',
  'Ultimate Youth Series collection featuring all 5 products: Facial Cleanser, Lotion, Toner, Facial Mask, and Facial Cream. The complete regimen for radiant, youthful skin.',
  1990400, 2211500, 'KES', 'CP0207', 20, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
  AND NOT EXISTS (SELECT 1 FROM products WHERE sku = 'CP0207')
ON CONFLICT (slug) DO NOTHING;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
