set search_path = public;

-- Backfill missing product_images rows (sort_order = 0) for products that have known image URLs.
-- This script intentionally skips products without known images.

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/2/image_512', 0
from products p
where p.slug = 'pure-ganoderma-spores-30'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/3/image_512', 0
from products p
where p.slug = 'pure-ganoderma-spores-60'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/13/image_512', 0
from products p
where p.slug = 'ganoderma-spores-oil-60'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/20/image_512', 0
from products p
where p.slug = 'cordyceps-coffee'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/22/image_512', 0
from products p
where p.slug = 'reishi-coffee'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/24/image_512', 0
from products p
where p.slug = 'quad-reishi-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/25/image_512', 0
from products p
where p.slug = 'gym-effect-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/21/image_512', 0
from products p
where p.slug = 'ginseng-coffee'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/31/image_512', 0
from products p
where p.slug = 'arthro-xtra-tablets'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/34/image_512', 0
from products p
where p.slug = 'gluzo-joint-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/36/image_512', 0
from products p
where p.slug = 'cerebrain-tablets'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/45/image_512', 0
from products p
where p.slug = 'micro2-cycle'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/59/image_512', 0
from products p
where p.slug = 'gluzo-joint-ultra-pro'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/5/image_512', 0
from products p
where p.slug = 'ez-xlim'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/8/image_512', 0
from products p
where p.slug = 'veggie-veggie'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/23/image_512', 0
from products p
where p.slug = 'probio-3-plus'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/38/image_512', 0
from products p
where p.slug = 'zaminocal-plus-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/40/image_512', 0
from products p
where p.slug = 'relivin-tea'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/42/image_512', 0
from products p
where p.slug = 'detoxilive-pro-oil-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/43/image_512', 0
from products p
where p.slug = 'nt-diarr-pills'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/44/image_512', 0
from products p
where p.slug = 'consti-relax-solution'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/62/image_512', 0
from products p
where p.slug = 'elements'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/7/image_512', 0
from products p
where p.slug = 'xpower-coffee'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/32/image_512', 0
from products p
where p.slug = 'prostat-relax'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );
