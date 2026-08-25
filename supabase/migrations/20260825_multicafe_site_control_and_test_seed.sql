-- Allow one site-control row per cafe instead of one global row.
drop index if exists public.site_control_single_row_idx;
create unique index if not exists site_control_cafe_id_key on public.site_control(cafe_id);

-- Backfill the existing test cafe from the production cafe without sharing rows.
do $$
declare
  src uuid;
  dst uuid;
  src_settings uuid;
  dst_settings uuid;
  r record;
  new_cat bigint;
begin
  select id into src from public.cafes where slug = 'hamset-mazaj' limit 1;
  select id into dst from public.cafes where slug = 'test-cafe' limit 1;

  if src is null or dst is null or src = dst then
    return;
  end if;

  if not exists (select 1 from public.site_control where cafe_id = dst) then
    insert into public.site_control
    select x.*
    from public.site_control sc
    cross join lateral jsonb_populate_record(
      null::public.site_control,
      to_jsonb(sc) || jsonb_build_object('id', gen_random_uuid(), 'cafe_id', dst, 'created_at', now(), 'updated_at', now())
    ) x
    where sc.cafe_id = src
    limit 1;
  end if;

  update public.site_control sc
  set site_name = dst_cafe.name,
      featured_product_ids = coalesce((
        select jsonb_agg(m.id order by m.sort_order, m.id)
        from public.menu m
        where m.cafe_id = dst
          and exists (
            select 1 from public.menu source_menu
            where source_menu.cafe_id = src
              and source_menu.id::text in (
                select jsonb_array_elements_text(coalesce(source_sc.featured_product_ids, '[]'::jsonb))
              )
              and source_menu.name_ar = m.name_ar
          )
      ), '[]'::jsonb),
      updated_at = now()
  from public.cafes dst_cafe
  join public.site_control source_sc on source_sc.cafe_id = src
  where sc.cafe_id = dst and dst_cafe.id = dst;

  select id into src_settings from public.cafe_settings where cafe_id = src limit 1;
  select id into dst_settings from public.cafe_settings where cafe_id = dst limit 1;

  if src_settings is not null and dst_settings is not null then
    insert into public.social_links (id, cafe_settings_id, name, url, icon, is_active, sort_order, created_at, updated_at)
    select gen_random_uuid(), dst_settings, name, url, icon, is_active, sort_order, now(), now()
    from public.social_links sl
    where sl.cafe_settings_id = src_settings
      and not exists (select 1 from public.social_links existing where existing.cafe_settings_id = dst_settings);
  end if;

  if not exists (select 1 from public.categories where cafe_id = dst) then
    for r in select * from public.categories where cafe_id = src order by sort_order, id loop
      insert into public.categories (name_ar, name_en, image_url, sort_order, is_active, created_at, cafe_id)
      values (r.name_ar, r.name_en, r.image_url, r.sort_order, r.is_active, now(), dst)
      returning id into new_cat;

      insert into public.menu (category_id, name_ar, name_en, description_ar, description_en, price, calories, image_url, is_available, is_featured, sort_order, created_at, updated_at, cafe_id)
      select new_cat, m.name_ar, m.name_en, m.description_ar, m.description_en, m.price, m.calories, m.image_url, m.is_available, m.is_featured, m.sort_order, now(), now(), dst
      from public.menu m
      where m.category_id = r.id and m.cafe_id = src;
    end loop;
  end if;
end $$;
