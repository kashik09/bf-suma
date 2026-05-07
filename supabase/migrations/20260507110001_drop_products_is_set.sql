-- Drop unused is_set column from products table
-- Sets feature was reverted

alter table public.products
  drop column if exists is_set;
