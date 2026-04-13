-- Generated from docs/pricing/product-pricing.md
-- Applies April 2026 pricing exactly by SKU (products.sku).
-- Website Price UGX -> products.price
-- Dist. Price (USD) -> products.compare_at_price via USD * 4464 (rounded), NULL when unavailable.

BEGIN;

WITH pricing_source(sku, product_name, website_price_ugx, dist_price_usd) AS (
  VALUES
    ('AP004E', 'MicrO2 Cycle Tablets', 98208, 22),
    ('AP006E', 'ConstiRelax Solution', 129456, 29),
    ('AP009F', 'ProstatRelax Capsules', 107136, 24),
    ('AP011F', '4 in 1 Reishi Coffee', 58032, 13),
    ('AP013E', 'Pure & Broken Ganoderma Spores (30''s)', 258912, 58),
    ('AP013G', 'Pure & Broken Ganoderma Spores (60''s)', 491040, 110),
    ('AP014C', 'GluzoJoint-F Capsules', 135072, NULL),
    ('AP014F', 'Refined Yunzhi Capsules', 129456, 29),
    ('AP022E', 'ArthroXtra Tablets', 178560, 40),
    ('AP024E', 'Anatic Herbal Essence Soap', 9821, 2.2),
    ('AP028F', '4 in 1 Ginseng Coffee', 58032, 13),
    ('AP029E', 'X Power Man Capsules', 187488, 42),
    ('AP039F', '4 in 1 Cordyceps Coffee', 58032, 13),
    ('AP041E', 'Novel Depile Capsules', 98208, 22),
    ('AP052F', 'FemiCare Feminine Cleanser', 49104, 11),
    ('AP074E', 'Feminergy Capsules', 133920, 30),
    ('AP077E', 'CereBrain Tablets', 111600, 25),
    ('AP097E', 'Detoxilive Capsules', 66960, 15),
    ('AP100A', 'Veggie Veggie', 133920, 30),
    ('AP101E', 'Dr.Ts Toothpaste', 24552, 5.5),
    ('AP107E', 'Zaminocal Plus Capsules', 102672, 23),
    ('AP113A', 'Xpower Coffee for Men', 66960, 15),
    ('AP131A', 'Cool Roll (1 Dozen)', 4464, 1),
    ('AP132A', 'Ntdiarr Pills (1 Dozen)', 13392, 3),
    ('AP144B', 'NMN Coffee', 111600, 25),
    ('AP145A', 'YOUTH EVER', 477576, NULL),
    ('AP146A', 'NMN DUO Release', 665136, 149),
    ('AP146B', 'NMN-Sharp Mind', 771840, NULL),
    ('AP147B', 'Pure & Broken Ganoderma Oil (60''s)', 571392, 128),
    ('AP150A', 'Relivin Tea', 86832, NULL),
    ('AP152A', 'GymEffect Capsule', 89280, 20),
    ('AP153A', 'Quad Reishi Capsules', 156240, 35),
    ('AP155C', 'Probio 3', 133920, 30),
    ('AP158B', 'Vitamin C Chewable Tablets', 89280, 20),
    ('AP166B', 'Detoxilive Pro Oil Capsules', 89280, 20),
    ('AP169A', 'Elements', 133920, 30),
    ('AP170A', 'Ez-Xlim Capsule', 250848, NULL),
    ('AP179D', 'Femibiotics', 178560, 40),
    ('AP182B', 'Calcium & Vitamin D3 Milk Tablets', 107136, 24),
    ('AP188A', 'Sharp Vision (Blueberry Chewable)', 107136, 24),
    ('AP190A', 'GluzoJoint-Ultra Pro Tablets', 249984, 56),
    ('AP192C', 'FemiCalcium D3', 142848, 32),
    ('CP0201', 'Youth Refreshing Facial Cleanser', 98208, 22),
    ('CP0202', 'Youth Essence Lotion', 111600, 25),
    ('CP0203', 'Youth Essence Toner', 120528, 27),
    ('CP0204', 'Youth Essence Facial Mask', 80352, 18),
    ('CP0205', 'Youth Essence Cream', 151776, 34),
    ('CP0206', 'SUMA GRAND 1 (Cleanser+Lotion+Toner)', 356976, NULL),
    ('CP0207', 'SUMA GRAND 2 (Full Set)', 607824, NULL)
),
pricing_mapped AS (
  SELECT
    sku,
    product_name,
    website_price_ugx::integer AS target_price,
    CASE
      WHEN dist_price_usd IS NULL THEN NULL
      ELSE ROUND(dist_price_usd * 4464)::integer
    END AS target_compare_at_price
  FROM pricing_source
),
updated AS (
  UPDATE products p
  SET
    price = pm.target_price,
    compare_at_price = pm.target_compare_at_price,
    updated_at = NOW()
  FROM pricing_mapped pm
  WHERE p.sku = pm.sku
    AND (
      p.price IS DISTINCT FROM pm.target_price
      OR p.compare_at_price IS DISTINCT FROM pm.target_compare_at_price
    )
  RETURNING p.id, p.sku, p.name, p.price, p.compare_at_price
)
SELECT
  sku,
  name,
  price,
  compare_at_price
FROM updated
ORDER BY sku;

COMMIT;

-- Verification snapshots
SELECT slug, sku, price, compare_at_price
FROM products
WHERE slug IN ('cordyceps-coffee', 'arthro-xtra-tablets', 'quad-reishi-capsules')
ORDER BY slug;
