-- Automatically create missing brands during CSV product import.
-- Keeps categories and marketplaces strict, while allowing a new brand name
-- from the CSV to be added safely without creating duplicate brand slugs.
-- Safe to run more than once in Supabase SQL Editor.

create or replace function public.import_product_from_csv_atomic(p_data jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id public.products.id%type;
  v_category_id public.categories.id%type;
  v_brand_id public.brands.id%type;
  v_marketplace_id public.marketplaces.id%type;
  v_product_price_id public.product_prices.id%type;
  v_name text := trim(coalesce(p_data->>'name', ''));
  v_slug text := trim(coalesce(p_data->>'slug', ''));
  v_brand_name text := trim(coalesce(p_data->>'brand', ''));
  v_brand_base_slug text;
  v_brand_slug text;
  v_marketplace text := trim(coalesce(p_data->>'marketplace', ''));
  v_affiliate_url text := nullif(trim(coalesce(p_data->>'affiliate_url', '')), '');
  v_price numeric := coalesce(nullif(p_data->>'price', '')::numeric, 0);
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'Akses admin diperlukan.' using errcode = '42501';
  end if;

  if v_name = '' or v_slug = '' then
    raise exception 'Nama dan slug produk wajib diisi.';
  end if;

  if v_brand_name = '' then
    raise exception 'Brand wajib diisi.';
  end if;

  select id into v_category_id
  from public.categories
  where lower(trim(name)) = lower(trim(coalesce(p_data->>'category', '')))
  limit 1;

  if v_category_id is null then
    raise exception 'Kategori tidak ditemukan.';
  end if;

  select id into v_brand_id
  from public.brands
  where lower(trim(name)) = lower(v_brand_name)
  limit 1;

  if v_brand_id is null then
    v_brand_base_slug := trim(
      both '-' from regexp_replace(lower(v_brand_name), '[^a-z0-9]+', '-', 'g')
    );

    if v_brand_base_slug = '' then
      v_brand_base_slug := 'brand-' || left(md5(lower(v_brand_name)), 8);
    end if;

    v_brand_slug := left(v_brand_base_slug, 120);

    insert into public.brands (name, slug)
    values (v_brand_name, v_brand_slug)
    on conflict do nothing;

    select id into v_brand_id
    from public.brands
    where lower(trim(name)) = lower(v_brand_name)
    limit 1;

    if v_brand_id is null then
      v_brand_slug := left(v_brand_base_slug, 105)
        || '-'
        || left(md5(lower(v_brand_name)), 8);

      insert into public.brands (name, slug)
      values (v_brand_name, v_brand_slug)
      on conflict do nothing;

      select id into v_brand_id
      from public.brands
      where lower(trim(name)) = lower(v_brand_name)
      limit 1;
    end if;
  end if;

  if v_brand_id is null then
    raise exception 'Brand gagal dibuat.';
  end if;

  if exists (select 1 from public.products where slug = v_slug) then
    raise exception 'Slug sudah digunakan.';
  end if;

  if v_affiliate_url is not null
     and exists (
       select 1 from public.product_prices
       where affiliate_url = v_affiliate_url
     ) then
    raise exception 'Affiliate URL sudah digunakan.';
  end if;

  if v_marketplace <> '' then
    select id into v_marketplace_id
    from public.marketplaces
    where lower(trim(name)) = lower(v_marketplace)
    limit 1;

    if v_marketplace_id is null then
      raise exception 'Marketplace tidak ditemukan.';
    end if;

    if v_price <= 0 then
      raise exception 'Harga wajib lebih dari 0 jika marketplace diisi.';
    end if;
  end if;

  insert into public.products (
    name,
    slug,
    category_id,
    brand_id,
    short_description,
    description,
    image_url,
    status
  ) values (
    v_name,
    v_slug,
    v_category_id,
    v_brand_id,
    nullif(trim(coalesce(p_data->>'short_description', '')), ''),
    nullif(trim(coalesce(p_data->>'description', '')), ''),
    nullif(trim(coalesce(p_data->>'image_url', '')), ''),
    case when lower(p_data->>'status') = 'published' then 'published' else 'draft' end
  )
  returning id into v_product_id;

  insert into public.product_scores (
    product_id,
    performance,
    design,
    features,
    value,
    ease_of_use
  ) values (
    v_product_id,
    coalesce((p_data->>'performance')::numeric, 0),
    coalesce((p_data->>'design')::numeric, 0),
    coalesce((p_data->>'features')::numeric, 0),
    coalesce((p_data->>'value')::numeric, 0),
    coalesce((p_data->>'ease_of_use')::numeric, 0)
  );

  if v_marketplace_id is not null then
    insert into public.product_prices (
      product_id,
      marketplace_id,
      price,
      original_price,
      shipping_cost,
      affiliate_url,
      is_available,
      stock_status,
      last_checked_at,
      updated_at
    ) values (
      v_product_id,
      v_marketplace_id,
      v_price,
      v_price,
      0,
      v_affiliate_url,
      true,
      'in_stock',
      now(),
      now()
    )
    returning id into v_product_price_id;

    insert into public.product_price_history (
      product_price_id,
      price,
      captured_at
    ) values (
      v_product_price_id,
      v_price,
      now()
    );
  end if;

  return v_product_id::text;
end;
$$;

revoke all on function public.import_product_from_csv_atomic(jsonb) from public;
grant execute on function public.import_product_from_csv_atomic(jsonb) to authenticated;
