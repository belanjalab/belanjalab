-- Bulk CSV product import for Cloudflare Workers.
-- Reduces up to 200 per-product HTTP/RPC calls into one database RPC call.
-- Also makes retries idempotent by skipping products that already exist.
-- Safe to run more than once in Supabase SQL Editor.

alter table public.product_csv_import_runs
  add column if not exists skipped_count integer not null default 0;

create or replace function public.import_products_from_csv_bulk_atomic(
  p_rows jsonb,
  p_file_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_row jsonb;
  v_ordinality bigint;
  v_name text;
  v_slug text;
  v_status text;
  v_affiliate_url text;
  v_total_rows integer;
  v_success_count integer := 0;
  v_skipped_count integer := 0;
  v_error_count integer := 0;
  v_results jsonb := '[]'::jsonb;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  ) then
    raise exception 'Akses admin diperlukan.' using errcode = '42501';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Data import harus berupa array JSON.';
  end if;

  v_total_rows := jsonb_array_length(p_rows);

  if v_total_rows = 0 then
    raise exception 'Tidak ada produk untuk diimport.';
  end if;

  if v_total_rows > 200 then
    raise exception 'Maksimal 200 produk per proses import.';
  end if;

  insert into public.product_csv_import_runs (
    user_id,
    file_name,
    total_rows,
    status
  ) values (
    auth.uid(),
    nullif(trim(coalesce(p_file_name, '')), ''),
    v_total_rows,
    'running'
  )
  returning id into v_run_id;

  for v_row, v_ordinality in
    select item.value, item.ordinality
    from jsonb_array_elements(p_rows) with ordinality as item(value, ordinality)
  loop
    v_name := coalesce(nullif(trim(v_row->>'name'), ''), 'Tanpa nama');
    v_slug := trim(coalesce(v_row->>'slug', ''));
    v_affiliate_url := nullif(trim(coalesce(v_row->>'affiliate_url', '')), '');
    v_status := case
      when lower(trim(coalesce(v_row->>'status', ''))) = 'published'
        then 'published'
      else 'draft'
    end;

    -- A retry after an interrupted Worker request must not create duplicates.
    if v_slug <> '' and exists (
      select 1 from public.products where slug = v_slug
    ) then
      v_skipped_count := v_skipped_count + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', (v_ordinality + 1)::integer,
          'name', v_name,
          'status', 'skipped',
          'message', 'Dilewati karena slug produk sudah ada di database.'
        )
      );
      continue;
    end if;

    if v_affiliate_url is not null and exists (
      select 1
      from public.product_prices
      where affiliate_url = v_affiliate_url
    ) then
      v_skipped_count := v_skipped_count + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', (v_ordinality + 1)::integer,
          'name', v_name,
          'status', 'skipped',
          'message', 'Dilewati karena affiliate URL sudah ada di database.'
        )
      );
      continue;
    end if;

    begin
      -- The existing per-product function is atomic. Any failure in this
      -- block rolls back only the current row and the loop continues.
      perform public.import_product_from_csv_atomic(v_row);

      v_success_count := v_success_count + 1;
      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'rowNumber', (v_ordinality + 1)::integer,
          'name', v_name,
          'status', 'success',
          'message', format('Produk berhasil diimport sebagai %s.', v_status)
        )
      );
    exception
      when others then
        v_error_count := v_error_count + 1;
        v_results := v_results || jsonb_build_array(
          jsonb_build_object(
            'rowNumber', (v_ordinality + 1)::integer,
            'name', v_name,
            'status', 'error',
            'message', sqlerrm
          )
        );
    end;
  end loop;

  update public.product_csv_import_runs
  set
    success_count = v_success_count,
    skipped_count = v_skipped_count,
    error_count = v_error_count,
    status = case
      when v_error_count > 0 and (v_success_count > 0 or v_skipped_count > 0)
        then 'completed_with_errors'
      when v_error_count > 0 then 'failed'
      else 'completed'
    end,
    results = v_results,
    finished_at = now()
  where id = v_run_id
    and user_id = auth.uid();

  return jsonb_build_object(
    'ok', v_error_count = 0,
    'runId', v_run_id,
    'results', v_results,
    'successCount', v_success_count,
    'skippedCount', v_skipped_count,
    'errorCount', v_error_count
  );
end;
$$;

revoke all on function public.import_products_from_csv_bulk_atomic(jsonb, text)
  from public;

grant execute on function public.import_products_from_csv_bulk_atomic(jsonb, text)
  to authenticated;
