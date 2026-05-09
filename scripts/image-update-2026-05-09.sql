-- =============================================================
-- Image Updates — 2026-05-09
-- =============================================================
-- DO NOT RUN AUTOMATICALLY. Run manually in Supabase SQL Editor.
-- =============================================================

BEGIN;

-- =============================================================
-- PART 1: Product Images (11 products)
-- =============================================================
-- Strategy: Delete existing primary image (sort_order=0), insert new one
-- This ensures we don't violate the unique constraint on (product_id, sort_order)

-- 1. Detoxilive Pro Oil → AP166B
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP166B')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/detoxilive-pro-oil.jpg', 'Detoxilive Pro Oil', 0
FROM public.products WHERE sku = 'AP166B';

-- 2. Sharp Vision → AP188A
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP188A')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/sharp-vision.jpg', 'Sharp Vision Chewable Tablets', 0
FROM public.products WHERE sku = 'AP188A';

-- 3. Anatic Herbal Soap → AP024E
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP024E')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/anatic-herbal-soap.jpg', 'Anatic Herbal Essence Soap', 0
FROM public.products WHERE sku = 'AP024E';

-- 4. NT Diarr Pills → AP132B (renamed from AP132A)
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP132B')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/ntdiarr-pills.jpg', 'NT Diarr Pills', 0
FROM public.products WHERE sku = 'AP132B';

-- 5. Dr Toothpaste → AP10/E (renamed from AP101E)
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP10/E')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/dr-toothpaste.jpg', 'Dr. Ts Toothpaste', 0
FROM public.products WHERE sku = 'AP10/E';

-- 6. Prostatrelax → AP009F
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP009F')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/prostatrelax.jpg', 'Prostatrelax', 0
FROM public.products WHERE sku = 'AP009F';

-- 7. X Power Coffee → AP113A (verify SKU — could be AP133A)
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP113A')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/xpower-coffee.jpg', 'X Power Coffee', 0
FROM public.products WHERE sku = 'AP113A';

-- 8. X Power Man Plus → AP029E
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP029E')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/xpower-man-plus.jpg', 'X Power Man Plus', 0
FROM public.products WHERE sku = 'AP029E';

-- 9. Gluzojoint Ultra Pro → AP190A
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP190A')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/gluzojoint-ultra-pro.jpg', 'Gluzojoint Ultra Pro', 0
FROM public.products WHERE sku = 'AP190A';

-- 10. Cerebrain → AP077E
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP077E')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/cerebrain.jpg', 'Cerebrain', 0
FROM public.products WHERE sku = 'AP077E';

-- 11. Micro2 Cycle → AP004E
DELETE FROM public.product_images
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AP004E')
  AND sort_order = 0;

INSERT INTO public.product_images (product_id, url, alt_text, sort_order)
SELECT id, '/products/micro2-cycle.jpg', 'Micro2 Cycle Tablets', 0
FROM public.products WHERE sku = 'AP004E';


COMMIT;

-- =============================================================
-- PART 2: Package Images (CORRECTED SLUGS)
-- =============================================================
-- Run this AFTER Part 1 completes successfully.
-- NOTE: prostate-zaminocal-1.webp is an orphan file (no matching package) — ignored.

BEGIN;

-- Cardiovascular Health
UPDATE public.packages SET hero_image_url = '/package-images/final/cardiovascular-health.webp' WHERE slug = 'cardiovascular-health';

-- Digestive Health & Ulcers
UPDATE public.packages SET hero_image_url = '/package-images/final/digestive-health-ulcers (1).webp' WHERE slug = 'digestive-health-ulcers';

-- Fibroids Package
UPDATE public.packages SET hero_image_url = '/package-images/final/fibroids-support-1.webp' WHERE slug = 'fibroids-package';

-- Immunity Package
UPDATE public.packages SET hero_image_url = '/package-images/final/immunity-1.webp' WHERE slug = 'immunity-package';

-- Kidney Health
UPDATE public.packages SET hero_image_url = '/package-images/final/kidney-health-1.webp' WHERE slug = 'kidney-health';

-- Liver Health
UPDATE public.packages SET hero_image_url = '/package-images/final/liver-health-1.webp' WHERE slug = 'liver-health';

-- X Power Men's Health (mens-health-1.webp)
UPDATE public.packages SET hero_image_url = '/package-images/final/mens-health-1.webp' WHERE slug = 'xpower-mens-health';

-- Weight Loss Reset System
UPDATE public.packages SET hero_image_url = '/package-images/final/weight-loss.webp' WHERE slug = 'weight-loss-reset-system';

-- Weight Management & Loss
UPDATE public.packages SET hero_image_url = '/package-images/final/weight-management-1.webp' WHERE slug = 'weight-management-loss';

-- Women's Health & Beauty
UPDATE public.packages SET hero_image_url = '/package-images/final/womens-health-1.webp' WHERE slug = 'womens-health-beauty';

-- Blood Sugar / Diabetic Pack (using existing image from root)
UPDATE public.packages SET hero_image_url = '/package-images/blood-sugar-pack.webp' WHERE slug = 'blood-sugar-diabetic-pack';

-- Bone & Joint Care (using existing image from root)
UPDATE public.packages SET hero_image_url = '/package-images/bone-joint-care.webp' WHERE slug = 'bone-joint-care';

COMMIT;

-- =============================================================
-- VERIFICATION QUERIES
-- =============================================================

-- Run after Part 1:
-- SELECT p.sku, p.name, pi.url
-- FROM public.products p
-- JOIN public.product_images pi ON pi.product_id = p.id
-- WHERE p.sku IN ('AP166B','AP188A','AP024E','AP132B','AP10/E','AP009F','AP113A','AP029E','AP190A','AP077E','AP004E')
--   AND pi.sort_order = 0
-- ORDER BY p.sku;

-- Run after Part 2:
-- SELECT slug, hero_image_url
-- FROM public.packages
-- WHERE slug IN (
--   'cardiovascular-health',
--   'digestive-health-ulcers',
--   'fibroids-package',
--   'immunity-package',
--   'kidney-health',
--   'liver-health',
--   'xpower-mens-health',
--   'weight-loss-reset-system',
--   'weight-management-loss',
--   'womens-health-beauty',
--   'blood-sugar-diabetic-pack',
--   'bone-joint-care'
-- )
-- ORDER BY slug;
