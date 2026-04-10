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

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/37/image_512', 0
from products p
where p.slug = 'xpower-man-plus'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/10/image_512', 0
from products p
where p.slug = 'blueberry-chewable'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/11/image_512', 0
from products p
where p.slug = 'calcium-vitamin-d3-milk'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/12/image_512', 0
from products p
where p.slug = 'vitamin-c-chewable'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/14/image_512', 0
from products p
where p.slug = 'youth-essence-facial-cream'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/15/image_512', 0
from products p
where p.slug = 'youth-essence-facial-mask'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/16/image_512', 0
from products p
where p.slug = 'youth-essence-toner'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/17/image_512', 0
from products p
where p.slug = 'youth-essence-lotion'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/18/image_512', 0
from products p
where p.slug = 'youth-refreshing-facial-cleanser'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/19/image_512', 0
from products p
where p.slug = 'refined-yunzhi-essence'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/30/image_512', 0
from products p
where p.slug = 'feminergy-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/33/image_512', 0
from products p
where p.slug = 'novel-depile-capsules'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/35/image_512', 0
from products p
where p.slug = 'femicare-cleanser'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/60/image_512', 0
from products p
where p.slug = 'femicalcium-d3'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/61/image_512', 0
from products p
where p.slug = 'femibiotics'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/27/image_512', 0
from products p
where p.slug = 'cool-roll'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/39/image_512', 0
from products p
where p.slug = 'anatic-herbal-soap'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );

insert into product_images (product_id, url, sort_order)
select p.id, 'https://www.bfsumaproducts.co.ke/web/image/product.template/41/image_512', 0
from products p
where p.slug = 'dr-ts-toothpaste'
  and not exists (
    select 1 from product_images pi
    where pi.product_id = p.id and pi.sort_order = 0
  );
