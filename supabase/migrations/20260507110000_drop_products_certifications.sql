-- Drop unused certifications column from products table
-- Trust badges feature was dropped

alter table public.products
  drop column if exists certifications;
