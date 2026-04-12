set search_path = public;

-- suma-grand-1-set (CP0206): old price 1168900 -> new price 35697600
update public.products
set price = 35697600
where slug = 'suma-grand-1-set'
  and price <> 35697600;

-- suma-grand-2-full-set (CP0207): old price 1990400 -> new price 60782400
update public.products
set price = 60782400
where slug = 'suma-grand-2-full-set'
  and price <> 60782400;
