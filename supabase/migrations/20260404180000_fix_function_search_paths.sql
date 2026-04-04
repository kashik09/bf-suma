-- Fix function search_path security warnings

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.test_decrement_product_stock(
  p_product_id uuid,
  p_quantity integer
)
returns table (
  product_id uuid,
  previous_stock_qty integer,
  decremented_by integer,
  new_stock_qty integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous_stock integer;
  v_new_stock integer;
begin
  select stock_qty into v_previous_stock
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'Product not found: %', p_product_id;
  end if;

  if v_previous_stock < p_quantity then
    raise exception 'Insufficient stock: available %, requested %', v_previous_stock, p_quantity;
  end if;

  update public.products
  set
    stock_qty = stock_qty - p_quantity,
    updated_at = now()
  where id = p_product_id
  returning stock_qty into v_new_stock;

  return query select
    p_product_id,
    v_previous_stock,
    p_quantity,
    v_new_stock;
end;
$$;
