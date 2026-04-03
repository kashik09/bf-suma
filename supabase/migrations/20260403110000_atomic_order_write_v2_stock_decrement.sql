set search_path = public;

drop function if exists public.process_order_intake_atomic_v2(
  text,
  text,
  uuid,
  text,
  text,
  integer,
  integer,
  integer,
  text,
  jsonb
);

create or replace function public.process_order_intake_atomic_v2(
  p_idempotency_key text,
  p_request_hash text,
  p_customer_id uuid,
  p_delivery_address text,
  p_notes text,
  p_subtotal integer,
  p_delivery_fee integer,
  p_total integer,
  p_currency text,
  p_items jsonb
)
returns table (
  result_code text,
  message text,
  response_payload jsonb,
  field_errors jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_expires_at timestamptz := now() + interval '24 hours';
  v_constraint text;
  v_idem record;
  v_replay record;
  v_order_id uuid;
  v_order_number text;
  v_order_created_at timestamptz;
  v_order_subtotal integer;
  v_order_delivery_fee integer;
  v_order_total integer;
  v_order_currency text;
  v_response jsonb;
  v_requested_item_count integer;
  v_locked_item_count integer;
  v_inactive_product_id text;
  v_insufficient_product_id text;
  v_available_stock integer;
  v_requested_stock integer;
begin
  if p_idempotency_key is null or char_length(trim(p_idempotency_key)) = 0 then
    return query select
      'REJECTED'::text,
      'Missing idempotency key.'::text,
      null::jsonb,
      jsonb_build_object('idempotencyKey', jsonb_build_array('Missing idempotency key.'));
    return;
  end if;

  if p_request_hash is null or char_length(trim(p_request_hash)) = 0 then
    return query select
      'REJECTED'::text,
      'Missing request hash.'::text,
      null::jsonb,
      jsonb_build_object('requestHash', jsonb_build_array('Missing request hash.'));
    return;
  end if;

  if p_customer_id is null then
    return query select
      'REJECTED'::text,
      'Customer is required.'::text,
      null::jsonb,
      jsonb_build_object('customer', jsonb_build_array('Missing customer id.'));
    return;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return query select
      'REJECTED'::text,
      'Order items are required.'::text,
      null::jsonb,
      jsonb_build_object('items', jsonb_build_array('At least one order item is required.'));
    return;
  end if;

  if p_total <> (p_subtotal + p_delivery_fee) then
    return query select
      'REJECTED'::text,
      'Order totals do not match current pricing. Please refresh your cart and try again.'::text,
      null::jsonb,
      jsonb_build_object('total', jsonb_build_array('Submitted totals do not match current server pricing.'));
    return;
  end if;

  if p_currency <> 'KES' then
    return query select
      'REJECTED'::text,
      'Unsupported order currency.'::text,
      null::jsonb,
      jsonb_build_object('currency', jsonb_build_array('Only KES is supported.'));
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_request_hash));
  perform pg_advisory_xact_lock(hashtext(p_idempotency_key));

  select * into v_idem
  from public.order_idempotency_keys
  where idempotency_key = p_idempotency_key
  for update;

  if found then
    if v_idem.status = 'SUCCEEDED' then
      if v_idem.request_hash <> p_request_hash then
        return query select
          'CONFLICT'::text,
          'This idempotency key was already used with a different checkout payload.'::text,
          null::jsonb,
          null::jsonb;
        return;
      end if;

      if v_idem.response_payload is not null then
        return query select
          'REPLAYED'::text,
          'Replayed prior successful order response.'::text,
          v_idem.response_payload,
          null::jsonb;
        return;
      end if;
    end if;

    if v_idem.request_hash <> p_request_hash and v_idem.expires_at > v_now then
      return query select
        'CONFLICT'::text,
        'This idempotency key was already used with a different checkout payload.'::text,
        null::jsonb,
        null::jsonb;
      return;
    end if;

    if v_idem.status = 'IN_PROGRESS' and v_idem.request_hash = p_request_hash and v_idem.expires_at > v_now then
      return query select
        'IN_PROGRESS'::text,
        'This checkout request is already being processed. Please retry in a moment.'::text,
        null::jsonb,
        null::jsonb;
      return;
    end if;

    update public.order_idempotency_keys
    set
      request_hash = p_request_hash,
      status = 'IN_PROGRESS',
      order_id = null,
      response_payload = null,
      last_error = null,
      expires_at = v_expires_at,
      updated_at = now()
    where idempotency_key = p_idempotency_key;
  else
    insert into public.order_idempotency_keys (
      idempotency_key,
      request_hash,
      status,
      expires_at,
      created_at,
      updated_at
    )
    values (
      p_idempotency_key,
      p_request_hash,
      'IN_PROGRESS',
      v_expires_at,
      now(),
      now()
    );
  end if;

  select * into v_replay
  from public.order_request_replays
  where request_hash = p_request_hash
  for update;

  if found then
    if v_replay.status = 'SUCCEEDED' and v_replay.response_payload is not null then
      update public.order_idempotency_keys
      set
        status = 'SUCCEEDED',
        order_id = v_replay.order_id,
        response_payload = v_replay.response_payload,
        last_error = null,
        expires_at = v_expires_at,
        updated_at = now()
      where idempotency_key = p_idempotency_key;

      return query select
        'REPLAYED'::text,
        'Replayed prior successful order response.'::text,
        v_replay.response_payload,
        null::jsonb;
      return;
    end if;

    if v_replay.status = 'IN_PROGRESS' and v_replay.expires_at > v_now and v_replay.idempotency_key <> p_idempotency_key then
      return query select
        'IN_PROGRESS'::text,
        'A matching checkout payload is already being processed. Please retry in a moment.'::text,
        null::jsonb,
        null::jsonb;
      return;
    end if;
  end if;

  insert into public.order_request_replays (
    request_hash,
    idempotency_key,
    status,
    order_id,
    response_payload,
    last_error,
    expires_at,
    created_at,
    updated_at
  )
  values (
    p_request_hash,
    p_idempotency_key,
    'IN_PROGRESS',
    null,
    null,
    null,
    v_expires_at,
    now(),
    now()
  )
  on conflict (request_hash) do update
    set
      idempotency_key = excluded.idempotency_key,
      status = 'IN_PROGRESS',
      order_id = null,
      response_payload = null,
      last_error = null,
      expires_at = excluded.expires_at,
      updated_at = now();

  begin
    if exists (
      select 1
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        product_name_snapshot text,
        unit_price integer,
        quantity integer,
        line_total integer,
        currency text
      )
      where coalesce(trim(item.product_id), '') = ''
        or item.quantity is null
        or item.quantity <= 0
    ) then
      update public.order_idempotency_keys
      set
        status = 'FAILED',
        last_error = 'Invalid product_id or quantity in order items.',
        updated_at = now()
      where idempotency_key = p_idempotency_key
        and request_hash = p_request_hash;

      update public.order_request_replays
      set
        status = 'FAILED',
        last_error = 'Invalid product_id or quantity in order items.',
        updated_at = now()
      where request_hash = p_request_hash;

      return query select
        'REJECTED'::text,
        'Invalid order item payload.'::text,
        null::jsonb,
        jsonb_build_object('items', jsonb_build_array('Each item must include a valid product_id and quantity > 0.'));
      return;
    end if;

    with requested as (
      select
        item.product_id as product_id,
        sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        product_name_snapshot text,
        unit_price integer,
        quantity integer,
        line_total integer,
        currency text
      )
      group by item.product_id
    )
    select count(*)
    into v_requested_item_count
    from requested;

    for v_inactive_product_id in
      with requested as (
        select
          item.product_id as product_id,
          sum(item.quantity)::integer as quantity
        from jsonb_to_recordset(p_items) as item(
          product_id text,
          product_name_snapshot text,
          unit_price integer,
          quantity integer,
          line_total integer,
          currency text
        )
        group by item.product_id
      )
      select p.id::text
      from public.products p
      join requested r on r.product_id = p.id::text
      for update
    loop
      null;
    end loop;

    with requested as (
      select
        item.product_id as product_id,
        sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        product_name_snapshot text,
        unit_price integer,
        quantity integer,
        line_total integer,
        currency text
      )
      group by item.product_id
    )
    select count(*)
    into v_locked_item_count
    from public.products p
    join requested r on r.product_id = p.id::text;

    if v_locked_item_count <> v_requested_item_count then
      update public.order_idempotency_keys
      set
        status = 'FAILED',
        last_error = 'One or more products could not be found.',
        updated_at = now()
      where idempotency_key = p_idempotency_key
        and request_hash = p_request_hash;

      update public.order_request_replays
      set
        status = 'FAILED',
        last_error = 'One or more products could not be found.',
        updated_at = now()
      where request_hash = p_request_hash;

      return query select
        'REJECTED'::text,
        'Some products in your cart are no longer available.'::text,
        null::jsonb,
        jsonb_build_object('items', jsonb_build_array('One or more products could not be found.'));
      return;
    end if;

    with requested as (
      select
        item.product_id as product_id,
        sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        product_name_snapshot text,
        unit_price integer,
        quantity integer,
        line_total integer,
        currency text
      )
      group by item.product_id
    )
    select p.id::text
    into v_inactive_product_id
    from public.products p
    join requested r on r.product_id = p.id::text
    where p.status <> 'ACTIVE'
    order by p.id::text
    limit 1;

    if v_inactive_product_id is not null then
      update public.order_idempotency_keys
      set
        status = 'FAILED',
        last_error = 'One or more products are inactive.',
        updated_at = now()
      where idempotency_key = p_idempotency_key
        and request_hash = p_request_hash;

      update public.order_request_replays
      set
        status = 'FAILED',
        last_error = 'One or more products are inactive.',
        updated_at = now()
      where request_hash = p_request_hash;

      return query select
        'REJECTED'::text,
        'Some products in your cart are not currently available for checkout.'::text,
        null::jsonb,
        jsonb_build_object('items', jsonb_build_array('One or more products are inactive.'));
      return;
    end if;

    with requested as (
      select
        item.product_id as product_id,
        sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        product_name_snapshot text,
        unit_price integer,
        quantity integer,
        line_total integer,
        currency text
      )
      group by item.product_id
    )
    select
      p.id::text,
      p.stock_qty,
      r.quantity
    into
      v_insufficient_product_id,
      v_available_stock,
      v_requested_stock
    from public.products p
    join requested r on r.product_id = p.id::text
    where p.stock_qty < r.quantity
    order by p.id::text
    limit 1;

    if v_insufficient_product_id is not null then
      update public.order_idempotency_keys
      set
        status = 'FAILED',
        last_error = left(format(
          'Insufficient stock for product %s (available %s, requested %s).',
          v_insufficient_product_id,
          v_available_stock,
          v_requested_stock
        ), 500),
        updated_at = now()
      where idempotency_key = p_idempotency_key
        and request_hash = p_request_hash;

      update public.order_request_replays
      set
        status = 'FAILED',
        last_error = left(format(
          'Insufficient stock for product %s (available %s, requested %s).',
          v_insufficient_product_id,
          v_available_stock,
          v_requested_stock
        ), 500),
        updated_at = now()
      where request_hash = p_request_hash;

      return query select
        'REJECTED'::text,
        'Some products in your cart do not have enough stock.'::text,
        null::jsonb,
        jsonb_build_object('items', jsonb_build_array('Requested quantity exceeds available stock.'));
      return;
    end if;

    with requested as (
      select
        item.product_id as product_id,
        sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(p_items) as item(
        product_id text,
        product_name_snapshot text,
        unit_price integer,
        quantity integer,
        line_total integer,
        currency text
      )
      group by item.product_id
    )
    update public.products p
    set
      stock_qty = p.stock_qty - r.quantity,
      updated_at = now()
    from requested r
    where r.product_id = p.id::text;

    insert into public.orders (
      order_number,
      idempotency_key,
      customer_id,
      status,
      payment_status,
      subtotal,
      delivery_fee,
      total,
      currency,
      delivery_address,
      notes
    )
    values (
      format('BFS-%s-%s', to_char(now(), 'YYYYMMDDHH24MISS'), lpad((floor(random() * 10000))::text, 4, '0')),
      p_idempotency_key,
      p_customer_id,
      'PENDING',
      'UNPAID',
      p_subtotal,
      p_delivery_fee,
      p_total,
      p_currency,
      p_delivery_address,
      p_notes
    )
    returning
      id,
      order_number,
      created_at,
      subtotal,
      delivery_fee,
      total,
      currency
    into
      v_order_id,
      v_order_number,
      v_order_created_at,
      v_order_subtotal,
      v_order_delivery_fee,
      v_order_total,
      v_order_currency;

    insert into public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      unit_price,
      quantity,
      line_total,
      currency
    )
    select
      v_order_id,
      item.product_id,
      item.product_name_snapshot,
      item.unit_price,
      item.quantity,
      item.line_total,
      item.currency
    from jsonb_to_recordset(p_items) as item(
      product_id text,
      product_name_snapshot text,
      unit_price integer,
      quantity integer,
      line_total integer,
      currency text
    );

    v_response := jsonb_build_object(
      'orderId', v_order_id,
      'orderNumber', v_order_number,
      'receivedAt', v_order_created_at,
      'subtotal', v_order_subtotal,
      'deliveryFee', v_order_delivery_fee,
      'total', v_order_total,
      'currency', coalesce(v_order_currency, 'KES')
    );

    update public.order_idempotency_keys
    set
      status = 'SUCCEEDED',
      order_id = v_order_id,
      response_payload = v_response,
      last_error = null,
      expires_at = v_expires_at,
      updated_at = now()
    where idempotency_key = p_idempotency_key;

    update public.order_request_replays
    set
      status = 'SUCCEEDED',
      order_id = v_order_id,
      response_payload = v_response,
      last_error = null,
      expires_at = v_expires_at,
      updated_at = now()
    where request_hash = p_request_hash;

    return query select
      'CREATED'::text,
      'Order created successfully.'::text,
      v_response,
      null::jsonb;
    return;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint = CONSTRAINT_NAME;

      if v_constraint = 'orders_idempotency_key_key' or v_constraint = 'uq_orders_idempotency_key' then
        select
          id,
          order_number,
          created_at,
          subtotal,
          delivery_fee,
          total,
          currency
        into
          v_order_id,
          v_order_number,
          v_order_created_at,
          v_order_subtotal,
          v_order_delivery_fee,
          v_order_total,
          v_order_currency
        from public.orders
        where idempotency_key = p_idempotency_key
        limit 1;

        if v_order_id is not null then
          v_response := jsonb_build_object(
            'orderId', v_order_id,
            'orderNumber', v_order_number,
            'receivedAt', v_order_created_at,
            'subtotal', v_order_subtotal,
            'deliveryFee', v_order_delivery_fee,
            'total', v_order_total,
            'currency', coalesce(v_order_currency, 'KES')
          );

          update public.order_idempotency_keys
          set
            status = 'SUCCEEDED',
            order_id = v_order_id,
            response_payload = v_response,
            last_error = null,
            expires_at = v_expires_at,
            updated_at = now()
          where idempotency_key = p_idempotency_key;

          update public.order_request_replays
          set
            status = 'SUCCEEDED',
            order_id = v_order_id,
            response_payload = v_response,
            last_error = null,
            expires_at = v_expires_at,
            updated_at = now()
          where request_hash = p_request_hash;

          return query select
            'REPLAYED'::text,
            'Replayed prior successful order response.'::text,
            v_response,
            null::jsonb;
          return;
        end if;
      end if;

      update public.order_idempotency_keys
      set
        status = 'FAILED',
        last_error = left(coalesce(SQLERRM, 'Atomic order write failed.'), 500),
        updated_at = now()
      where idempotency_key = p_idempotency_key
        and request_hash = p_request_hash;

      update public.order_request_replays
      set
        status = 'FAILED',
        last_error = left(coalesce(SQLERRM, 'Atomic order write failed.'), 500),
        updated_at = now()
      where request_hash = p_request_hash;

      return query select
        'TEMPORARY_FAILURE'::text,
        'Order processing failed. Please retry with the same idempotency key.'::text,
        null::jsonb,
        null::jsonb;
      return;
  end;
exception
  when others then
    update public.order_idempotency_keys
    set
      status = 'FAILED',
      last_error = left(coalesce(SQLERRM, 'Atomic order write failed.'), 500),
      updated_at = now()
    where idempotency_key = p_idempotency_key
      and request_hash = p_request_hash;

    update public.order_request_replays
    set
      status = 'FAILED',
      last_error = left(coalesce(SQLERRM, 'Atomic order write failed.'), 500),
      updated_at = now()
    where request_hash = p_request_hash;

    return query select
      'TEMPORARY_FAILURE'::text,
      'Order processing failed. Please retry with the same idempotency key.'::text,
      null::jsonb,
      null::jsonb;
    return;
end;
$$;
