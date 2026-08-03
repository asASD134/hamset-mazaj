alter table public.orders
add column if not exists client_request_id uuid;

create unique index if not exists orders_client_request_id_key
on public.orders (client_request_id);

drop function if exists public.create_order_with_items(integer, uuid, jsonb);

create or replace function public.create_order_with_items(
  p_table_number integer,
  p_client_request_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_table_id bigint;
  v_table_status text;
  v_order_id bigint;
  v_total_price numeric := 0;
  v_order_status text;
  v_created_at timestamptz;
  v_item jsonb;
  v_menu_id bigint;
  v_menu_price numeric;
  v_quantity integer;
begin
  if p_client_request_id is null then
    raise exception 'Client request ID is required';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  select
    t.id,
    t.status
  into
    v_table_id,
    v_table_status
  from public.tables t
  where t.table_number = p_table_number;

  if v_table_id is null then
    raise exception 'Table not found';
  end if;

  if v_table_status <> 'available' then
    raise exception 'Table is not available';
  end if;

  select
    o.id,
    o.total_price,
    o.status,
    o.created_at
  into
    v_order_id,
    v_total_price,
    v_order_status,
    v_created_at
  from public.orders o
  where o.client_request_id = p_client_request_id;

  if v_order_id is not null then
    return jsonb_build_object(
      'order_id', v_order_id,
      'total_price', v_total_price,
      'status', v_order_status,
      'created_at', v_created_at,
      'duplicate', true
    );
  end if;

  insert into public.orders (
    table_id,
    total_price,
    status,
    client_request_id
  )
  values (
    v_table_id,
    0,
    'pending',
    p_client_request_id
  )
  on conflict (client_request_id) do nothing
  returning
    id,
    status,
    created_at
  into
    v_order_id,
    v_order_status,
    v_created_at;
      if v_order_id is null then
    select
      o.id,
      o.total_price,
      o.status,
      o.created_at
    into
      v_order_id,
      v_total_price,
      v_order_status,
      v_created_at
    from public.orders o
    where o.client_request_id = p_client_request_id;

    return jsonb_build_object(
      'order_id', v_order_id,
      'total_price', v_total_price,
      'status', v_order_status,
      'created_at', v_created_at,
      'duplicate', true
    );
  end if;

  for v_item in
    select item.value
    from jsonb_array_elements(p_items) as item(value)
  loop
    if jsonb_typeof(v_item) <> 'object'
       or not (v_item ? 'menu_id')
       or not (v_item ? 'quantity') then
      raise exception 'Each cart item must include menu_id and quantity';
    end if;

    v_menu_id := (v_item ->> 'menu_id')::bigint;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity <= 0 then
      raise exception 'Quantity must be greater than zero';
    end if;

    select
      m.price
    into
      v_menu_price
    from public.menu m
    where m.id = v_menu_id
      and m.is_available = true;

    if not found then
      raise exception 'Menu item not found or unavailable';
    end if;

    insert into public.order_items (
      order_id,
      menu_id,
      quantity,
      price,
      total_price
    )
    values (
      v_order_id,
      v_menu_id,
      v_quantity,
      v_menu_price,
      v_menu_price * v_quantity
    );

    v_total_price := v_total_price + (v_menu_price * v_quantity);
  end loop;

  update public.orders
  set total_price = v_total_price
  where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'total_price', v_total_price,
    'status', v_order_status,
    'created_at', v_created_at,
    'duplicate', false
  );
end;
$$;

revoke all
on function public.create_order_with_items(integer, uuid, jsonb)
from public;

grant execute
on function public.create_order_with_items(integer, uuid, jsonb)
to anon, authenticated;