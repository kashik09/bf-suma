-- Seed all BF Suma products from catalog manifest
-- This ensures all 50 products are in the database for proper CRUD operations

-- First, ensure categories exist
INSERT INTO categories (id, name, slug, description, is_active)
VALUES
  (gen_random_uuid(), 'Skincare', 'skincare', 'Premium skincare products for radiant, youthful skin.', true),
  (gen_random_uuid(), 'Anti-Aging', 'anti-aging', 'Advanced formulas to combat aging and restore vitality.', true),
  (gen_random_uuid(), 'Beverages', 'beverages', 'Functional coffees and teas for health and energy.', true),
  (gen_random_uuid(), 'Supplements', 'supplements', 'Nutritional supplements for overall wellness.', true),
  (gen_random_uuid(), 'Joint Health', 'joint-health', 'Support for healthy joints and mobility.', true),
  (gen_random_uuid(), 'Bone Health', 'bone-health', 'Calcium and mineral support for strong bones.', true),
  (gen_random_uuid(), 'Digestive Health', 'digestive-health', 'Products for digestive comfort and gut health.', true),
  (gen_random_uuid(), 'Personal Care', 'personal-care', 'Daily essentials for personal hygiene and care.', true),
  (gen_random_uuid(), 'Weight Management', 'weight-management', 'Natural solutions for healthy weight control.', true),
  (gen_random_uuid(), 'Women''s Health', 'womens-health', 'Specialized formulas for women''s wellness needs.', true),
  (gen_random_uuid(), 'Men''s Health', 'mens-health', 'Targeted solutions for men''s vitality and wellness.', true),
  (gen_random_uuid(), 'Brain Health', 'brain-health', 'Cognitive support for memory and mental clarity.', true),
  (gen_random_uuid(), 'Detox', 'detox', 'Natural cleansing and detoxification support.', true)
ON CONFLICT (slug) DO NOTHING;

-- Now insert all products
-- Prices are in minor units (cents), so multiply by 100

-- SKINCARE
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Youth Essence Facial Cream',
  'youth-essence-facial-cream',
  'Packed with the latest cell technology and mitochondrial repair enzymes, this cream is the ultimate solution for restoring firmness.',
  537100, 596700, 'KES', 'BFS-YOU-001', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Youth Essence Lotion',
  'youth-essence-lotion',
  'Contains Niacinamide and Astaxanthin for nourishing and brightening skin without bleaching.',
  394900, 438700, 'KES', 'BFS-YOU-002', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Youth Essence Toner',
  'youth-essence-toner',
  'Designed to restore firmness, hydrate, and protect skin in seconds with advanced technology ingredients.',
  426500, 473800, 'KES', 'BFS-YOU-003', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Youth Refreshing Facial Cleanser',
  'youth-refreshing-facial-cleanser',
  'Formulated with niacinamide to improve skin barrier and restore firmness quickly.',
  347500, 386100, 'KES', 'BFS-YOU-004', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Youth Essence Facial Mask',
  'youth-essence-facial-mask',
  'Luxury skincare designed to restore firmness and reduce fine lines in minimal time.',
  284400, 315900, 'KES', 'BFS-YOU-005', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Anatic Herbal Essence Soap',
  'anatic-herbal-soap',
  'Combines grapefruit, green tea extract, wild honey for deep hydration and age-defying benefits.',
  34800, 38600, 'KES', 'BFS-ANA-006', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Derma Repair Body Lotion 150ml',
  'derma-repair-lotion',
  'Natural botanical ingredients for daily moisturizing and youthful skin health.',
  300000, NULL, 'KES', 'BFS-DER-007', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'skincare'
ON CONFLICT (slug) DO NOTHING;

-- ANTI-AGING
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'NMN DUO Release',
  'nmn-duo-release',
  '100% absorbable formula created to fight aging and maximize potential with energy-boosting NAD+ support.',
  2850000, 3200000, 'KES', 'BFS-NMN-008', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'anti-aging'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'NMN Sharp Mind',
  'nmn-sharp-mind',
  'Contains NMN, Resveratrol, Ginkgo Biloba for cognitive performance and brain health.',
  3150000, 3500000, 'KES', 'BFS-NMN-009', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'anti-aging'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Youth Ever',
  'youth-ever',
  'Age-defying potion with high absorption rate using cold-pressed technology and six fruits.',
  2200000, 2500000, 'KES', 'BFS-YOU-010', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'anti-aging'
ON CONFLICT (slug) DO NOTHING;

-- BEVERAGES
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Xpower Coffee',
  'xpower-coffee',
  'Combines organic ginseng and Tongkat Ali for vigor, energy, and enhanced sexual confidence.',
  237000, 263300, 'KES', 'BFS-XPO-011', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  '4 in 1 Ginseng Coffee',
  'ginseng-coffee',
  'Premium all-natural coffee with ginseng extract for enhanced stamina and energy.',
  205400, 228200, 'KES', 'BFS-GIN-012', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  '4 in 1 Reishi Coffee',
  'reishi-coffee',
  'Colombian coffee beans with Reishi extract for immune support and rejuvenation.',
  205400, 228200, 'KES', 'BFS-REI-013', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  '4 in 1 Cordyceps Coffee',
  'cordyceps-coffee',
  'Premium coffee with Cordyceps mushroom extract for energy and vitality.',
  205400, 228200, 'KES', 'BFS-COR-014', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Relivin Tea',
  'relivin-tea',
  'Caffeine-free herbal tea with green tea and luobuma for stress relief and blood pressure support.',
  284400, 315900, 'KES', 'BFS-REL-015', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Gym Ease Tea',
  'gym-ease-tea',
  'Contains Gymnema (sugar destroyer) for blood sugar control and weight management.',
  284400, 315900, 'KES', 'BFS-GYM-016', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'beverages'
ON CONFLICT (slug) DO NOTHING;

-- SUPPLEMENTS
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  '4 IN 1 Quad Reishi Capsules',
  'quad-reishi-capsules',
  'Contains Yunzhi, Ganoderma, Chaga extracts for immune support and healthy blood sugar.',
  552900, 614300, 'KES', 'BFS-QUA-017', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Pure & Broken Ganoderma Spores (30s)',
  'pure-ganoderma-spores-30',
  'Premium Ganoderma spores for immune support and overall wellness.',
  916200, 1017900, 'KES', 'BFS-PUR-018', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Pure & Broken Ganoderma Spores (60s)',
  'pure-ganoderma-spores-60',
  'Premium Ganoderma spores for immune support and overall wellness - larger pack.',
  1737500, 1930500, 'KES', 'BFS-PUR-019', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Pure Broken Ganoderma Spores Oil Capsules (60s)',
  'ganoderma-spores-oil-60',
  'Premium Ganoderma spores oil for enhanced bioavailability.',
  2021800, 2246400, 'KES', 'BFS-GAN-020', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Refined Yunzhi Essence',
  'refined-yunzhi-essence',
  'Refined Yunzhi mushroom essence for immune modulation.',
  458100, 509000, 'KES', 'BFS-REF-021', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Veggie Veggie',
  'veggie-veggie',
  'Concentrated vegetable nutrients for daily nutritional support.',
  473900, 526500, 'KES', 'BFS-VEG-022', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Blueberry Chewable Tablets',
  'blueberry-chewable',
  'Blueberry-flavored chewable tablets for eye health and antioxidant support.',
  379100, 421200, 'KES', 'BFS-BLU-023', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Vitamin C Chewable Tablets',
  'vitamin-c-chewable',
  'Chewable Vitamin C tablets for immune support.',
  315900, 351000, 'KES', 'BFS-VIT-024', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Elements',
  'elements',
  'Essential mineral elements for overall health and wellbeing.',
  473900, 526500, 'KES', 'BFS-ELE-025', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'MicrO2 Cycle Tablets',
  'micro2-cycle',
  'Supports healthy blood circulation and oxygen delivery.',
  347500, 386100, 'KES', 'BFS-MIC-026', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Dr Cow Smart Gummies',
  'dr-cow-smart-gummies',
  'Omega-3 gummy supplement for children''s growth, eyesight, appetite, and brain development support.',
  388800, NULL, 'KES', 'BFS-DRC-027', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

-- JOINT HEALTH
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Gluzo-Joint Capsules',
  'gluzo-joint-capsules',
  'Super-strength glucosamine supports healthy cartilage and joint mobility.',
  442300, 491400, 'KES', 'BFS-GLU-028', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'joint-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Arthro Xtra Tablets',
  'arthro-xtra-tablets',
  'Combines glucosamine and chondroitin for cartilage support and joint health.',
  631800, 702000, 'KES', 'BFS-ART-029', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'joint-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'GluzoJoint-Ultra Pro',
  'gluzo-joint-ultra-pro',
  'Advanced formula for joint health and mobility - premium strength.',
  884600, 982800, 'KES', 'BFS-GLU-030', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'joint-health'
ON CONFLICT (slug) DO NOTHING;

-- BONE HEALTH
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'ZaminoCal Plus Capsules',
  'zaminocal-plus-capsules',
  'Calcium, zinc, magnesium, selenium formula for bone health and muscle cramp relief.',
  363300, 403600, 'KES', 'BFS-ZAM-031', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'bone-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Dr Cow Calcium Milk Candy',
  'dr-cow-calcium-candy',
  'Cartoon-shaped candies with New Zealand milk providing calcium equivalent of one cup.',
  379100, 421200, 'KES', 'BFS-DRC-032', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'bone-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Calcium & Vitamin D3 Milk Tablets',
  'calcium-vitamin-d3-milk',
  'Calcium and Vitamin D3 combination for bone strength.',
  379100, 421200, 'KES', 'BFS-CAL-033', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'bone-health'
ON CONFLICT (slug) DO NOTHING;

-- DIGESTIVE HEALTH
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'NT Diarr Pills',
  'nt-diarr-pills',
  'Natural red bamboo pills for instant relief from diarrhea, toothaches, and menstrual discomfort.',
  189500, 210600, 'KES', 'BFS-NTD-034', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'digestive-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Novel Depile Capsules',
  'novel-depile-capsules',
  '100% natural treatment for hemorrhoid relief without surgery.',
  347500, 386100, 'KES', 'BFS-NOV-035', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'digestive-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Consti Relax Solution',
  'consti-relax-solution',
  'Contains Radix Astragali and FOS prebiotic for digestive health and toxin removal.',
  458100, 509000, 'KES', 'BFS-CON-036', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'digestive-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Probio 3 Plus',
  'probio-3-plus',
  'Seven patented bacterial strains for digestive balance and immunity enhancement.',
  481500, 535000, 'KES', 'BFS-PRO-037', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'digestive-health'
ON CONFLICT (slug) DO NOTHING;

-- PERSONAL CARE
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Cool Roll',
  'cool-roll',
  'Portable roll-on with plant oils for headaches, muscle aches, mosquito bites.',
  189600, 210600, 'KES', 'BFS-COO-038', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'personal-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Dr. Ts Toothpaste',
  'dr-ts-toothpaste',
  '4D tooth protection fighting bacteria, repairing gums, strengthening teeth.',
  86900, 96500, 'KES', 'BFS-DRT-039', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'personal-care'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Purewell Water Purifier',
  'purewell-water-purifier',
  'Seven-layer faucet-mounted household water purifier designed to reduce impurities.',
  648000, NULL, 'KES', 'BFS-PUR-040', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'personal-care'
ON CONFLICT (slug) DO NOTHING;

-- WEIGHT MANAGEMENT
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Gym Effect Capsules',
  'gym-effect-capsules',
  'Gymnema Sylvestris formulation reducing sugar cravings and supporting healthy blood levels.',
  315900, 351000, 'KES', 'BFS-GYM-041', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'weight-management'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Ez-Xlim',
  'ez-xlim',
  'Advanced weight management formula for healthy body composition.',
  821400, 912600, 'KES', 'BFS-EZX-042', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'weight-management'
ON CONFLICT (slug) DO NOTHING;

-- WOMEN'S HEALTH
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'FemiCare Feminine Cleanser',
  'femicare-cleanser',
  'Natural ingredients for cleaning, irritation relief, and feminine health maintenance.',
  173800, 193100, 'KES', 'BFS-FEM-043', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'womens-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Feminergy Capsules',
  'feminergy-capsules',
  'Specially formulated for female energy, hormonal balance and vitality.',
  473900, 526500, 'KES', 'BFS-FEM-044', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'womens-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Femicalcium D3',
  'femicalcium-d3',
  'Calcium and Vitamin D3 specifically formulated for women.',
  505500, 561600, 'KES', 'BFS-FEM-045', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'womens-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'FemiBiotics',
  'femibiotics',
  'Probiotic formula designed for women''s digestive and intimate health.',
  631800, 702000, 'KES', 'BFS-FEM-046', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'womens-health'
ON CONFLICT (slug) DO NOTHING;

-- MEN'S HEALTH
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'X Power Man Plus Capsules',
  'xpower-man-plus',
  'Premium supplement for male vitality and performance enhancement.',
  663400, 737100, 'KES', 'BFS-XPO-047', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'mens-health'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'ProstatRelax Capsules',
  'prostat-relax',
  'Natural formula for prostate health and urinary function support.',
  379100, 421200, 'KES', 'BFS-PRO-048', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'mens-health'
ON CONFLICT (slug) DO NOTHING;

-- BRAIN HEALTH
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'CereBrain Tablets',
  'cerebrain-tablets',
  'Ginkgo Biloba formula enhancing blood flow, supporting memory and concentration.',
  394900, 438800, 'KES', 'BFS-CER-049', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'brain-health'
ON CONFLICT (slug) DO NOTHING;

-- DETOX
INSERT INTO products (name, slug, description, price, compare_at_price, currency, sku, stock_qty, status, category_id)
SELECT
  'Detoxilive Capsules',
  'detoxilive-capsules',
  '100% natural, absorbable ingredients promoting liver detoxification and cleansing.',
  315900, 351000, 'KES', 'BFS-DET-050', 50, 'ACTIVE', c.id
FROM categories c WHERE c.slug = 'detox'
ON CONFLICT (slug) DO NOTHING;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
