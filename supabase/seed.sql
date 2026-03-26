set search_path = public;

insert into public.categories (id, name, slug, description, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Skincare', 'skincare', 'Daily skincare essentials.', true),
  ('22222222-2222-2222-2222-222222222222', 'Supplements', 'supplements', 'Health and wellness supplements.', true),
  ('33333333-3333-3333-3333-333333333333', 'Beverages', 'beverages', 'Functional drinks and coffee.', true)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.products (
  id,
  name,
  slug,
  description,
  price,
  compare_at_price,
  currency,
  sku,
  stock_qty,
  status,
  category_id
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Youth Essence Facial Cream',
    'youth-essence-facial-cream',
    'Hydrating facial cream for daily use.',
    537100,
    596700,
    'KES',
    'BFS-SKN-001',
    50,
    'ACTIVE',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'Youth Essence Toner',
    'youth-essence-toner',
    'Refreshing toner for morning and evening routines.',
    426500,
    473800,
    'KES',
    'BFS-SKN-002',
    40,
    'ACTIVE',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'Quad Reishi Capsules',
    'quad-reishi-capsules',
    'Mushroom blend capsules for immune support.',
    552900,
    614300,
    'KES',
    'BFS-SUP-001',
    35,
    'ACTIVE',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'ZaminoCal Plus Capsules',
    'zaminocal-plus-capsules',
    'Mineral support formula for bones and joints.',
    363300,
    403600,
    'KES',
    'BFS-SUP-002',
    45,
    'ACTIVE',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'Xpower Coffee',
    'xpower-coffee',
    'Instant coffee blend with functional ingredients.',
    237000,
    263300,
    'KES',
    'BFS-BEV-001',
    60,
    'ACTIVE',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'Ginseng Coffee',
    'ginseng-coffee',
    '4-in-1 ginseng coffee blend.',
    205400,
    228200,
    'KES',
    'BFS-BEV-002',
    55,
    'ACTIVE',
    '33333333-3333-3333-3333-333333333333'
  )
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  currency = excluded.currency,
  sku = excluded.sku,
  stock_qty = excluded.stock_qty,
  status = excluded.status,
  category_id = excluded.category_id,
  updated_at = now();

insert into public.product_images (id, product_id, url, alt_text, sort_order)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '/catalog-images/joshoppers.com/youth-essence-facial-cream.webp',
    'Youth Essence Facial Cream',
    0
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '/catalog-images/joshoppers.com/youth-essence-toner.webp',
    'Youth Essence Toner',
    0
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '/catalog-images/joshoppers.com/quad-reishi-capsules.webp',
    'Quad Reishi Capsules',
    0
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd4',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '/catalog-images/joshoppers.com/zaminocal-plus-capsules.webp',
    'ZaminoCal Plus Capsules',
    0
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd5',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '/catalog-images/joshoppers.com/xpower-coffee.webp',
    'Xpower Coffee',
    0
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    '/catalog-images/joshoppers.com/ginseng-coffee.png',
    'Ginseng Coffee',
    0
  )
on conflict (id) do update
set
  product_id = excluded.product_id,
  url = excluded.url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  updated_at = now();
