-- Migration: Structured Product & Package IDs
-- Format: CCCCCCCC-TTTT-NNNN-RRRR-RRRRRRRRRRRR
-- Run in Supabase SQL Editor

-- ============================================
-- STEP 1: Create mapping table for new IDs
-- ============================================

CREATE TEMP TABLE id_migration (
  old_id UUID PRIMARY KEY,
  new_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'product' or 'package'
  name TEXT
);

-- ============================================
-- STEP 2: Generate new product IDs
-- ============================================

WITH category_codes AS (
  SELECT id, name,
    CASE name
      WHEN 'Immune Boosters' THEN '1mmb0a5t'
      WHEN 'Men''s Health' THEN '0men5ea1'
      WHEN 'Women''s Health' THEN 'f3ma1e01'
      WHEN 'Skincare (Youth Series)' THEN 'face1ab4'
      WHEN 'Premium Selected' THEN 'a1e1ecte'
      WHEN 'Cardiovascular Health' THEN 'ca4d10b1'
      WHEN 'Digestive Health' THEN 'd1e5t10n'
      WHEN 'Bone & Joint Care' THEN 'b0ne101n'
      WHEN 'Smart Kids' THEN '5ma4tk1d'
      WHEN 'Suma Living' THEN '5uma11fe'
      WHEN 'Bone Health' THEN 'b0neca4e'
      WHEN 'Personal Care' THEN 'pe450na1'
      WHEN 'Beverages' THEN 'beve4a9e'
      WHEN 'Skincare' THEN '5k1nca4e'
      ELSE 'de1a01t0' -- default
    END as cat_code
  FROM categories
),
product_types AS (
  SELECT p.id, p.name, p.category_id,
    CASE
      WHEN LOWER(p.name) LIKE '%coffee%' OR LOWER(p.name) LIKE '%tea%' THEN 'c0fe'
      WHEN LOWER(p.name) LIKE '%cream%' OR LOWER(p.name) LIKE '%lotion%' THEN 'c4em'
      WHEN LOWER(p.name) LIKE '%oil%' THEN '01a1'
      WHEN LOWER(p.name) LIKE '%soap%' OR LOWER(p.name) LIKE '%cleanser%' OR LOWER(p.name) LIKE '%toothpaste%' THEN '50ab'
      WHEN LOWER(p.name) LIKE '%capsule%' OR LOWER(p.name) LIKE '%tablet%' OR LOWER(p.name) LIKE '%pill%' THEN 'cab5'
      WHEN LOWER(p.name) LIKE '%mask%' THEN 'fa5c'
      WHEN LOWER(p.name) LIKE '%toner%' THEN 't0ne'
      WHEN LOWER(p.name) LIKE '%set%' OR LOWER(p.name) LIKE '%bundle%' THEN '5e7b'
      WHEN LOWER(p.name) LIKE '%chewable%' OR LOWER(p.name) LIKE '%gummies%' OR LOWER(p.name) LIKE '%candy%' THEN 'c4ew'
      WHEN LOWER(p.name) LIKE '%purifier%' THEN 'pu41'
      WHEN LOWER(p.name) LIKE '%roll%' THEN '401b'
      WHEN LOWER(p.name) LIKE '%solution%' THEN '501n'
      ELSE 'a1b2' -- other
    END as type_code
  FROM products p
),
numbered_products AS (
  SELECT
    pt.id,
    pt.name,
    cc.cat_code,
    pt.type_code,
    ROW_NUMBER() OVER (
      PARTITION BY cc.cat_code, pt.type_code
      ORDER BY pt.name
    ) as seq_num
  FROM product_types pt
  JOIN category_codes cc ON pt.category_id = cc.id
)
INSERT INTO id_migration (old_id, new_id, entity_type, name)
SELECT
  np.id as old_id,
  (
    np.cat_code || '-' ||
    np.type_code || '-' ||
    'a1' || LPAD(np.seq_num::text, 2, '0') || '-' ||
    SUBSTRING(md5(random()::text), 1, 4) || '-' ||
    SUBSTRING(md5(random()::text), 1, 12)
  )::UUID as new_id,
  'product' as entity_type,
  np.name
FROM numbered_products np;

-- ============================================
-- STEP 3: Generate new package IDs
-- ============================================

WITH numbered_packages AS (
  SELECT
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY name) as seq_num
  FROM packages
)
INSERT INTO id_migration (old_id, new_id, entity_type, name)
SELECT
  np.id as old_id,
  (
    'bac0a9e1-' ||
    'a1' || LPAD(np.seq_num::text, 2, '0') || '-' ||
    SUBSTRING(md5(random()::text), 1, 4) || '-' ||
    SUBSTRING(md5(random()::text), 1, 4) || '-' ||
    SUBSTRING(md5(random()::text), 1, 12)
  )::UUID as new_id,
  'package' as entity_type,
  np.name
FROM numbered_packages np;

-- ============================================
-- STEP 4: Preview changes (RUN THIS FIRST!)
-- ============================================

SELECT
  entity_type,
  name,
  old_id,
  new_id
FROM id_migration
ORDER BY entity_type, name;

-- ============================================
-- STEP 5: Apply product ID changes
-- (Uncomment and run AFTER reviewing preview)
-- ============================================

/*
-- Disable triggers temporarily
SET session_replication_role = replica;

-- Update product_images FK
UPDATE product_images pi
SET product_id = im.new_id
FROM id_migration im
WHERE pi.product_id = im.old_id AND im.entity_type = 'product';

-- Update order_items FK
UPDATE order_items oi
SET product_id = im.new_id
FROM id_migration im
WHERE oi.product_id = im.old_id AND im.entity_type = 'product';

-- Update package_items FK
UPDATE package_items pai
SET product_id = im.new_id
FROM id_migration im
WHERE pai.product_id = im.old_id AND im.entity_type = 'product';

-- Update products PK
UPDATE products p
SET id = im.new_id
FROM id_migration im
WHERE p.id = im.old_id AND im.entity_type = 'product';

-- Re-enable triggers
SET session_replication_role = DEFAULT;
*/

-- ============================================
-- STEP 6: Apply package ID changes
-- (Uncomment and run AFTER reviewing preview)
-- ============================================

/*
-- Disable triggers temporarily
SET session_replication_role = replica;

-- Update package_items FK (package_id)
UPDATE package_items pai
SET package_id = im.new_id
FROM id_migration im
WHERE pai.package_id = im.old_id AND im.entity_type = 'package';

-- Update order_items FK (if packages can be in orders)
UPDATE order_items oi
SET package_id = im.new_id
FROM id_migration im
WHERE oi.package_id = im.old_id AND im.entity_type = 'package';

-- Update packages PK
UPDATE packages p
SET id = im.new_id
FROM id_migration im
WHERE p.id = im.old_id AND im.entity_type = 'package';

-- Re-enable triggers
SET session_replication_role = DEFAULT;
*/

-- ============================================
-- STEP 7: Verify (run after migration)
-- ============================================

/*
-- Check products have new format
SELECT id, name FROM products ORDER BY name LIMIT 20;

-- Check packages have new format
SELECT id, name FROM packages ORDER BY name;

-- Check no orphaned references
SELECT COUNT(*) as orphaned_images FROM product_images
WHERE product_id NOT IN (SELECT id FROM products);

SELECT COUNT(*) as orphaned_order_items FROM order_items
WHERE product_id NOT IN (SELECT id FROM products);

SELECT COUNT(*) as orphaned_package_items FROM package_items
WHERE product_id NOT IN (SELECT id FROM products);
*/
