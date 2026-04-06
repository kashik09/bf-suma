-- Sync product prices from Price List spreadsheet (Website Price UGX column)
-- Sync stock quantities from optimized_17products.xlsx
-- Prices are stored in minor units (UGX * 100)

-- First, update currency constraints to allow UGX
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_currency_valid;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_currency_check;
ALTER TABLE products ADD CONSTRAINT products_currency_valid CHECK (currency IN ('KES', 'UGX'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_valid;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_check;
ALTER TABLE orders ADD CONSTRAINT orders_currency_valid CHECK (currency IN ('KES', 'UGX'));

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_currency_valid;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_currency_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_currency_valid CHECK (currency IN ('KES', 'UGX'));

-- Update currency to UGX for all products
UPDATE products SET currency = 'UGX' WHERE currency != 'UGX';

-- PRICE UPDATES from Price List (Website Price UGX column → minor units)

-- Bone & Joint Care
UPDATE products SET price = 17856000, sku = 'AP022E' WHERE slug ILIKE '%arthroxtra%' OR name ILIKE '%arthroxtra%';
UPDATE products SET price = 10267200, sku = 'AP107E' WHERE slug ILIKE '%zaminocal%' OR name ILIKE '%zaminocal%';

-- Immune Boosters - Coffees
UPDATE products SET price = 5803200, sku = 'AP011F' WHERE slug = 'reishi-coffee' OR name ILIKE '%reishi coffee%';
UPDATE products SET price = 5803200, sku = 'AP028F' WHERE slug = 'ginseng-coffee' OR name ILIKE '%ginseng coffee%';
UPDATE products SET price = 5803200, sku = 'AP039F' WHERE slug = 'cordyceps-coffee' OR name ILIKE '%cordyceps coffee%';

-- Immune Boosters - Ganoderma/Reishi
UPDATE products SET price = 25891200, sku = 'AP013E' WHERE slug = 'pure-ganoderma-spores-30' OR name ILIKE '%ganoderma spores%30%';
UPDATE products SET price = 49104000, sku = 'AP013G' WHERE slug = 'pure-ganoderma-spores-60' OR name ILIKE '%ganoderma spores%60%' AND name NOT ILIKE '%oil%';
UPDATE products SET price = 57139200, sku = 'AP147B' WHERE slug = 'ganoderma-spores-oil-60' OR name ILIKE '%ganoderma%oil%';
UPDATE products SET price = 12945600, sku = 'AP014F' WHERE slug ILIKE '%yunzhi%' OR name ILIKE '%yunzhi%';
UPDATE products SET price = 15624000, sku = 'AP153A' WHERE slug = 'quad-reishi-capsules' OR name ILIKE '%quad reishi%';

-- Premium Selected (Anti-Aging)
UPDATE products SET price = 66513600, sku = 'AP146A' WHERE slug = 'nmn-duo-release' OR name ILIKE '%nmn duo%';
UPDATE products SET price = 11160000, sku = 'AP144B' WHERE name ILIKE '%nmn coffee%';
UPDATE products SET price = 77184000, sku = 'AP146B' WHERE slug = 'nmn-sharp-mind' OR name ILIKE '%nmn%sharp mind%';
UPDATE products SET price = 47757600, sku = 'AP145A' WHERE slug = 'youth-ever' OR name ILIKE '%youth ever%';

-- Cardiovascular Health
UPDATE products SET price = 9820800, sku = 'AP004E' WHERE name ILIKE '%micro2%' OR name ILIKE '%micro2 cycle%';
UPDATE products SET price = 11160000, sku = 'AP077E' WHERE slug ILIKE '%cerebrain%' OR name ILIKE '%cerebrain%';
UPDATE products SET price = 8928000, sku = 'AP152A' WHERE slug ILIKE '%gymeffect%' OR name ILIKE '%gymeffect%' OR name ILIKE '%gym effect%';
UPDATE products SET price = 6696000, sku = 'AP097E' WHERE slug ILIKE '%detoxilive%' AND slug NOT ILIKE '%pro%' OR name = 'Detoxilive Capsules';
UPDATE products SET price = 8928000, sku = 'AP166B' WHERE slug ILIKE '%detoxilive-pro%' OR name ILIKE '%detoxilive pro%';
UPDATE products SET price = 8683200, sku = 'AP150A' WHERE slug = 'relivin-tea' OR name ILIKE '%relivin tea%';

-- Digestive Health
UPDATE products SET price = 12945600, sku = 'AP006E' WHERE slug ILIKE '%constirelax%' OR name ILIKE '%constirelax%';
UPDATE products SET price = 1339200, sku = 'AP132A' WHERE slug ILIKE '%ntdiarr%' OR name ILIKE '%ntdiarr%';
UPDATE products SET price = 9820800, sku = 'AP041E' WHERE slug ILIKE '%depile%' OR name ILIKE '%novel depile%';
UPDATE products SET price = 13392000, sku = 'AP155C' WHERE slug ILIKE '%probio%' OR name ILIKE '%probio%';
UPDATE products SET price = 13392000, sku = 'AP100A' WHERE slug ILIKE '%veggie%' OR name ILIKE '%veggie veggie%';

-- Men's Health
UPDATE products SET price = 10713600, sku = 'AP009F' WHERE slug ILIKE '%prostatrelax%' OR name ILIKE '%prostatrelax%';
UPDATE products SET price = 18748800, sku = 'AP029E' WHERE slug ILIKE '%x-power-man%' OR slug ILIKE '%xpower-man%' OR name ILIKE '%x power man%';
UPDATE products SET price = 6696000, sku = 'AP113A' WHERE slug = 'xpower-coffee' OR name ILIKE '%xpower coffee%men%';

-- Women's Beauty
UPDATE products SET price = 13392000, sku = 'AP074E' WHERE slug ILIKE '%feminergy%' OR name ILIKE '%feminergy%';
UPDATE products SET price = 14284800, sku = 'AP192C' WHERE slug ILIKE '%femicalcium%' OR name ILIKE '%femicalcium%';
UPDATE products SET price = 17856000, sku = 'AP179D' WHERE slug ILIKE '%femibiotics%' OR name ILIKE '%femibiotics%';
UPDATE products SET price = 9820800, sku = 'CP0201' WHERE slug = 'youth-refreshing-facial-cleanser' OR name ILIKE '%youth refreshing%cleanser%';
UPDATE products SET price = 11160000, sku = 'CP0202' WHERE slug = 'youth-essence-lotion' OR name = 'Youth Essence Lotion';
UPDATE products SET price = 12052800, sku = 'CP0203' WHERE slug = 'youth-essence-toner' OR name = 'Youth Essence Toner';
UPDATE products SET price = 8035200, sku = 'CP0204' WHERE slug = 'youth-essence-facial-mask' OR name ILIKE '%youth essence%mask%';
UPDATE products SET price = 15177600, sku = 'CP0205' WHERE slug = 'youth-essence-facial-cream' OR name = 'Youth Essence Facial Cream';
UPDATE products SET price = 4910400, sku = 'AP052F' WHERE slug ILIKE '%femicare%' OR name ILIKE '%femicare%feminine cleanser%';

-- Smart Kids
UPDATE products SET price = 10713600, sku = 'AP182B' WHERE name ILIKE '%calcium%vitamin d3%milk%' OR name ILIKE '%calcium & vitamin d3%';
UPDATE products SET price = 10713600, sku = 'AP188A' WHERE name ILIKE '%sharp vision%' OR name ILIKE '%blueberry chewable%';
UPDATE products SET price = 8928000, sku = 'AP158B' WHERE name ILIKE '%vitamin c chewable%';

-- Suma Living
UPDATE products SET price = 982100, sku = 'AP024E' WHERE slug = 'anatic-herbal-soap' OR name ILIKE '%anatic%soap%';
UPDATE products SET price = 2455200, sku = 'AP101E' WHERE name ILIKE '%dr%ts%toothpaste%' OR name ILIKE '%dr. ts%';
UPDATE products SET price = 446400, sku = 'AP131A' WHERE name ILIKE '%cool roll%';


-- STOCK QUANTITY UPDATES from optimized_17products.xlsx

UPDATE products SET stock_qty = 5 WHERE sku = 'AP022E';   -- ArthroXtra
UPDATE products SET stock_qty = 21 WHERE sku = 'AP107E';  -- ZaminoCal
UPDATE products SET stock_qty = 11 WHERE sku = 'AP013G';  -- Pure Ganoderma Spores 60s
UPDATE products SET stock_qty = 12 WHERE sku = 'AP147B';  -- Ganoderma Spores Oil
UPDATE products SET stock_qty = 13 WHERE sku = 'AP014F';  -- Yunzhi
UPDATE products SET stock_qty = 11 WHERE sku = 'AP153A';  -- Quad Reishi
UPDATE products SET stock_qty = 5 WHERE sku = 'AP146A';   -- NMN Duo Release
UPDATE products SET stock_qty = 11 WHERE sku = 'AP077E';  -- CereBrain
UPDATE products SET stock_qty = 5 WHERE sku = 'AP152A';   -- GymEffect
UPDATE products SET stock_qty = 10 WHERE sku = 'AP166B';  -- Detoxilive Pro
UPDATE products SET stock_qty = 6 WHERE sku = 'AP041E';   -- Novel Depile
UPDATE products SET stock_qty = 6 WHERE sku = 'AP155C';   -- Probio3+
UPDATE products SET stock_qty = 5 WHERE sku = 'AP100A';   -- Veggie Veggie
UPDATE products SET stock_qty = 25 WHERE sku = 'AP009F';  -- ProstatRelax
UPDATE products SET stock_qty = 10 WHERE sku = 'AP029E';  -- X Power Man
UPDATE products SET stock_qty = 10 WHERE sku = 'AP074E';  -- Feminergy
UPDATE products SET stock_qty = 4 WHERE sku = 'AP192C';   -- FemiCalcium D3

-- Set products with 0 stock to OUT_OF_STOCK status
UPDATE products SET status = 'OUT_OF_STOCK' WHERE stock_qty = 0;

-- Set products with low stock (1-5) to ACTIVE but add low stock flag consideration
UPDATE products SET status = 'ACTIVE' WHERE stock_qty > 0 AND status = 'OUT_OF_STOCK';
