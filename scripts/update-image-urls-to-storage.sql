-- Updates legacy bfsumaproducts.co.ke product image URLs to Supabase Storage public URLs.
-- Uses hardcoded Supabase project URL:
-- https://uhhjnszgxfwmddvxdafj.supabase.co

set search_path = public;

with template_ext(template_id, ext) as (
  values
    (2, 'jpg'),
    (3, 'jpg'),
    (5, 'jpg'),
    (7, 'jpg'),
    (8, 'jpg'),
    (10, 'jpg'),
    (11, 'jpg'),
    (12, 'jpg'),
    (13, 'jpg'),
    (14, 'jpg'),
    (15, 'jpg'),
    (16, 'jpg'),
    (17, 'jpg'),
    (18, 'jpg'),
    (19, 'jpg'),
    (20, 'jpg'),
    (21, 'jpg'),
    (22, 'jpg'),
    (23, 'webp'),
    (24, 'jpg'),
    (25, 'jpg'),
    (27, 'jpg'),
    (30, 'jpg'),
    (31, 'jpg'),
    (32, 'jpg'),
    (33, 'jpg'),
    (34, 'jpg'),
    (35, 'jpg'),
    (36, 'jpg'),
    (37, 'jpg'),
    (38, 'jpg'),
    (39, 'jpg'),
    (40, 'jpg'),
    (41, 'jpg'),
    (42, 'png'),
    (43, 'jpg'),
    (44, 'jpg'),
    (45, 'jpg'),
    (57, 'webp'),
    (59, 'webp'),
    (60, 'webp'),
    (61, 'webp'),
    (62, 'webp')
), legacy_rows as (
  select
    pi.id as product_image_id,
    p.slug,
    coalesce(te.ext, 'jpg') as ext
  from product_images pi
  join products p on p.id = pi.product_id
  left join template_ext te
    on te.template_id = substring(pi.url from 'product\.template/([0-9]+)/image_512')::int
  where pi.url ilike '%bfsumaproducts.co.ke%'
)
update product_images pi
set url = 'https://uhhjnszgxfwmddvxdafj.supabase.co/storage/v1/object/public/product-images/'
  || legacy_rows.slug
  || '.'
  || legacy_rows.ext
from legacy_rows
where legacy_rows.product_image_id = pi.id;
