-- Monthly global quota for OpenAI meal-photo analyses.
-- Stores only a month and a request count: no user IDs, images, notes, or results.
-- 800 reservations × US$0.001 conservative reserve per request = US$0.80/month.

create table if not exists public.nf_photo_analysis_monthly_usage (
  month_start date primary key,
  request_count integer not null default 0 check (request_count between 0 and 800),
  updated_at timestamptz not null default now()
);

alter table public.nf_photo_analysis_monthly_usage enable row level security;
revoke all on table public.nf_photo_analysis_monthly_usage from public, anon, authenticated;

create or replace function public.nf_reserve_photo_analysis_monthly_quota(p_limit integer default 800)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_month date := date_trunc('month', now() at time zone 'utc')::date;
  reserved_count integer;
begin
  if p_limit is null or p_limit < 1 or p_limit > 800 then
    return false;
  end if;

  insert into public.nf_photo_analysis_monthly_usage as monthly_usage (month_start, request_count)
  values (current_month, 1)
  on conflict (month_start) do update
    set request_count = monthly_usage.request_count + 1,
        updated_at = now()
    where monthly_usage.request_count < p_limit
  returning request_count into reserved_count;

  return found;
end;
$$;

create or replace function public.nf_photo_analysis_monthly_quota_available(p_limit integer default 800)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select case
    when p_limit is null or p_limit < 1 or p_limit > 800 then false
    else coalesce((
      select request_count < p_limit
      from public.nf_photo_analysis_monthly_usage
      where month_start = date_trunc('month', now() at time zone 'utc')::date
    ), true)
  end;
$$;

revoke all on function public.nf_reserve_photo_analysis_monthly_quota(integer) from public, anon, authenticated;
revoke all on function public.nf_photo_analysis_monthly_quota_available(integer) from public, anon, authenticated;
grant execute on function public.nf_reserve_photo_analysis_monthly_quota(integer) to service_role;
grant execute on function public.nf_photo_analysis_monthly_quota_available(integer) to service_role;
