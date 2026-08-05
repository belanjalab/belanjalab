-- Atomic CSV product import and import audit log.
-- Safe to run more than once in Supabase SQL Editor.

-- Clean up the legacy fake affiliate-link placeholder.
update public.product_prices
set affiliate_url = null
where trim(coalesce(affiliate_url, '')) = '#';

create table if not exists public.product_csv_import_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text,
  total_rows integer not null default 0,
  success_count integer not null default 0,
  error_count integer not null default 0,
  status text not null default 'running'
    check (status in ('running', 'completed', 'completed_with_errors', 'failed')),
  results jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists product_csv_import_runs_user_started_idx
  on public.product_csv_import_runs (user_id, started_at desc);

alter table public.product_csv_import_runs enable row level security;

drop policy if exists "Admins can read their CSV import runs"
  on public.product_csv_import_runs;

create policy "Admins can read their CSV import runs"
on public.product_csv_import_runs
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

revoke all on table public.product_csv_import_runs from anon;
grant select on table public.product_csv_import_runs to authenticated;

create or replace function public.start_product_csv_import(
  p_total_rows integer,
  p_file_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'Akses admin diperlukan.' using errcode = '42501';
  end if;

  insert into public.product_csv_import_runs (user_id, file_name, total_rows)
  values (auth.uid(), nullif(trim(p_file_name), ''), greatest(p_total_rows, 0))
  returning id into v_run_id;

  return v_run_id;
end;
$$;

create or replace function public.finish_product_csv_import(
  p_run_id uuid,
  p_success_count integer,
  p_error_count integer,
  p_results jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'Akses admin diperlukan.' using errcode = '42501';
  end if;

  update public.product_csv_import_runs
  set
    success_count = greatest(p_success_count, 0),
    error_count = greatest(p_error_count, 0),
    status = case
      when p_error_count > 0 and p_success_count > 0 then 'completed_with_errors'
      when p_error_count > 0 then 'failed'
      else 'completed'
    end,
    results = coalesce(p_results, '[]'::jsonb),
    finished_at = now()
  where id = p_run_id and user_id = auth.uid();
end;
$$;

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

  select id into v_category_id
  from public.categories
  where lower(trim(name)) = lower(trim(coalesce(p_data->>'category', '')))
  limit 1;

  if v_category_id is null then
    raise exception 'Kategori tidak ditemukan.';
  end if;

  select id into v_brand_id
  from public.brands
  where lower(trim(name)) = lower(trim(coalesce(p_data->>'brand', '')))
  limit 1;

  if v_brand_id is null then
    raise exception 'Brand tidak ditemukan.';
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

revoke all on function public.start_product_csv_import(integer, text) from public;
revoke all on function public.finish_product_csv_import(uuid, integer, integer, jsonb) from public;
revoke all on function public.import_product_from_csv_atomic(jsonb) from public;

grant execute on function public.start_product_csv_import(integer, text) to authenticated;
grant execute on function public.finish_product_csv_import(uuid, integer, integer, jsonb) to authenticated;
grant execute on function public.import_product_from_csv_atomic(jsonb) to authenticated;


-- Atomic bulk marketplace price upsert used by the admin dashboard.
create or replace function public.upsert_marketplace_prices_bulk_atomic(
  p_product_ids uuid[],
  p_marketplace_name text,
  p_price numeric,
  p_affiliate_url text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_marketplace_id public.marketplaces.id%type;
  v_product_id public.products.id%type;
  v_price_row public.product_prices%rowtype;
  v_affiliate_url text := nullif(trim(coalesce(p_affiliate_url, '')), '');
  v_now timestamptz := now();
  v_processed_count integer := 0;
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'Akses admin diperlukan.' using errcode = '42501';
  end if;

  if coalesce(array_length(p_product_ids, 1), 0) = 0 then
    raise exception 'Pilih minimal satu produk.';
  end if;

  if array_length(p_product_ids, 1) > 200 then
    raise exception 'Maksimal 200 produk dalam satu perubahan massal.';
  end if;

  if p_price is null or p_price <= 0 then
    raise exception 'Harga wajib lebih dari 0.';
  end if;

  if v_affiliate_url is not null
     and v_affiliate_url !~* '^https?://[^[:space:]]+$' then
    raise exception 'URL affiliate harus menggunakan http atau https.';
  end if;

  select id into v_marketplace_id
  from public.marketplaces
  where lower(trim(name)) = lower(trim(coalesce(p_marketplace_name, '')))
  limit 1;

  if v_marketplace_id is null then
    raise exception 'Marketplace tidak ditemukan.';
  end if;

  for v_product_id in
    select distinct selected.product_id
    from unnest(p_product_ids) as selected(product_id)
  loop
    if not exists (
      select 1 from public.products where id = v_product_id
    ) then
      raise exception 'Produk % tidak ditemukan.', v_product_id;
    end if;

    select * into v_price_row
    from public.product_prices
    where product_id = v_product_id
      and marketplace_id = v_marketplace_id
    order by updated_at desc nulls last, id
    limit 1
    for update;

    if found then
      if v_price_row.price is distinct from p_price then
        if v_price_row.price is not null
           and v_price_row.price > 0
           and not exists (
             select 1
             from public.product_price_history
             where product_price_id = v_price_row.id
           ) then
          insert into public.product_price_history (
            product_price_id,
            price,
            captured_at
          ) values (
            v_price_row.id,
            v_price_row.price,
            v_now - interval '1 second'
          );
        end if;

        insert into public.product_price_history (
          product_price_id,
          price,
          captured_at
        ) values (
          v_price_row.id,
          p_price,
          v_now
        );
      end if;

      update public.product_prices
      set
        price = p_price,
        original_price = p_price,
        shipping_cost = 0,
        affiliate_url = v_affiliate_url,
        is_available = true,
        stock_status = 'in_stock',
        last_checked_at = v_now,
        updated_at = v_now
      where id = v_price_row.id;
    else
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
        p_price,
        p_price,
        0,
        v_affiliate_url,
        true,
        'in_stock',
        v_now,
        v_now
      )
      returning * into v_price_row;

      insert into public.product_price_history (
        product_price_id,
        price,
        captured_at
      ) values (
        v_price_row.id,
        p_price,
        v_now
      );
    end if;

    v_processed_count := v_processed_count + 1;
  end loop;

  return v_processed_count;
end;
$$;

revoke all on function public.upsert_marketplace_prices_bulk_atomic(
  uuid[], text, numeric, text
) from public;

grant execute on function public.upsert_marketplace_prices_bulk_atomic(
  uuid[], text, numeric, text
) to authenticated;
