set search_path = public;

insert into public.categories (id, name, slug, description, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Skincare', 'skincare', 'Daily skincare essentials.', true),
  ('22222222-2222-2222-2222-222222222222', 'Supplements', 'supplements', 'Health and wellness supplements.', true),
  ('33333333-3333-3333-3333-333333333333', 'Beverages', 'beverages', 'Functional drinks and coffee.', true)
on conflict (slug) do nothing;

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
on conflict (slug) do nothing;

insert into public.product_images (id, product_id, url, alt_text, sort_order)
select
  seeded.id::uuid,
  products.id as product_id,
  seeded.url,
  seeded.alt_text,
  seeded.sort_order
from (
  values
    (
      'dddddddd-dddd-dddd-dddd-ddddddddddd1',
      'youth-essence-facial-cream',
      '/catalog-images/womens-beauty/14_youth-essence-facial-cream.jpg',
      'Youth Essence Facial Cream',
      0
    ),
    (
      'dddddddd-dddd-dddd-dddd-ddddddddddd2',
      'youth-essence-toner',
      '/catalog-images/womens-beauty/16_youth-essence-toner.jpg',
      'Youth Essence Toner',
      0
    ),
    (
      'dddddddd-dddd-dddd-dddd-ddddddddddd3',
      'quad-reishi-capsules',
      '/catalog-images/immune-booster/24_quad-reishi-capsules.jpg',
      'Quad Reishi Capsules',
      0
    ),
    (
      'dddddddd-dddd-dddd-dddd-ddddddddddd4',
      'zaminocal-plus-capsules',
      '/catalog-images/suma-fit/38_zaminocal-plus-capsules.jpg',
      'ZaminoCal Plus Capsules',
      0
    ),
    (
      'dddddddd-dddd-dddd-dddd-ddddddddddd5',
      'xpower-coffee',
      '/catalog-images/mens-power/7_x-power-coffee.jpg',
      'Xpower Coffee',
      0
    ),
    (
      'dddddddd-dddd-dddd-dddd-ddddddddddd6',
      'ginseng-coffee',
      '/catalog-images/heart-and-blood-fit/21_4-in-1-ginseng-coffee.jpg',
      'Ginseng Coffee',
      0
    )
) as seeded(id, product_slug, url, alt_text, sort_order)
join public.products on products.slug = seeded.product_slug
on conflict (product_id, sort_order) do nothing;
