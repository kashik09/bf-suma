drop function if exists public.test_decrement_product_stock(uuid, integer);

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
as $$
declare
  v_current_stock integer;
  v_new_stock integer;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero.'
      using errcode = '22023';
  end if;

  select stock_qty
  into v_current_stock
  from public.products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'Product not found: %', p_product_id
      using errcode = 'P0002';
  end if;

  if v_current_stock < p_quantity then
    raise exception 'Insufficient stock for product % (available %, requested %).', p_product_id, v_current_stock, p_quantity
      using errcode = 'P0001';
  end if;

  update public.products
  set stock_qty = stock_qty - p_quantity
  where id = p_product_id
  returning stock_qty into v_new_stock;

  return query
  select
    p_product_id,
    v_current_stock,
    p_quantity,
    v_new_stock;
end;
$$;
