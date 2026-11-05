-- Billing state and server-enforced AI limits for the NutriFlow offer.
-- Apply in Supabase SQL Editor after the existing MVP migration.

create table if not exists public.nf_billing_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (product_id = 'base_access'),
  amount numeric(8,2) not null check (amount = 29.90),
  currency text not null default 'BRL' check (currency = 'BRL'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  provider_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nf_ai_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_subscription_id text unique,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'paused', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nf_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  base_access boolean not null default false,
  base_ai_used integer not null default 0 check (base_ai_used >= 0),
  ai_subscription_active boolean not null default false,
  ai_month_used integer not null default 0 check (ai_month_used >= 0),
  ai_month_start date not null default date_trunc('month', now())::date,
  updated_at timestamptz not null default now()
);

create index if not exists nf_billing_orders_user_created_idx
  on public.nf_billing_orders (user_id, created_at desc);
create index if not exists nf_ai_subscriptions_user_created_idx
  on public.nf_ai_subscriptions (user_id, created_at desc);
create unique index if not exists nf_one_open_ai_subscription_per_user_idx
  on public.nf_ai_subscriptions (user_id) where status in ('pending', 'authorized');

alter table public.nf_billing_orders enable row level security;
alter table public.nf_ai_subscriptions enable row level security;
alter table public.nf_entitlements enable row level security;

revoke all on public.nf_billing_orders, public.nf_ai_subscriptions, public.nf_entitlements from anon, authenticated;
grant select on public.nf_billing_orders, public.nf_ai_subscriptions, public.nf_entitlements to authenticated;

drop policy if exists "billing_order_owner_select" on public.nf_billing_orders;
create policy "billing_order_owner_select" on public.nf_billing_orders
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "ai_subscription_owner_select" on public.nf_ai_subscriptions;
create policy "ai_subscription_owner_select" on public.nf_ai_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "entitlement_owner_select" on public.nf_entitlements;
create policy "entitlement_owner_select" on public.nf_entitlements
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.nf_consume_ai_quota(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  entitlement public.nf_entitlements%rowtype;
  month_start date := date_trunc('month', now())::date;
begin
  select * into entitlement from public.nf_entitlements where user_id = p_user_id for update;
  if not found or not entitlement.base_access then
    return jsonb_build_object('allowed', false, 'reason', 'base_access_required');
  end if;

  if entitlement.ai_subscription_active then
    if entitlement.ai_month_start <> month_start then
      entitlement.ai_month_used := 0;
      entitlement.ai_month_start := month_start;
    end if;
    if entitlement.ai_month_used >= 100 then
      return jsonb_build_object('allowed', false, 'reason', 'monthly_limit', 'remaining', 0);
    end if;
    update public.nf_entitlements set ai_month_used = entitlement.ai_month_used + 1,
      ai_month_start = month_start, updated_at = now() where user_id = p_user_id;
    return jsonb_build_object('allowed', true, 'plan', 'ai_monthly', 'remaining', 99 - entitlement.ai_month_used);
  end if;

  if entitlement.base_ai_used >= 5 then
    return jsonb_build_object('allowed', false, 'reason', 'base_limit', 'remaining', 0);
  end if;
  update public.nf_entitlements set base_ai_used = base_ai_used + 1, updated_at = now()
    where user_id = p_user_id;
  return jsonb_build_object('allowed', true, 'plan', 'base', 'remaining', 4 - entitlement.base_ai_used);
end;
$$;

create or replace function public.nf_release_ai_quota(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  entitlement public.nf_entitlements%rowtype;
  month_start date := date_trunc('month', now())::date;
begin
  select * into entitlement from public.nf_entitlements where user_id = p_user_id for update;
  if not found then return; end if;
  if entitlement.ai_subscription_active and entitlement.ai_month_start = month_start then
    update public.nf_entitlements set ai_month_used = greatest(ai_month_used - 1, 0), updated_at = now()
      where user_id = p_user_id;
  elsif not entitlement.ai_subscription_active then
    update public.nf_entitlements set base_ai_used = greatest(base_ai_used - 1, 0), updated_at = now()
      where user_id = p_user_id;
  end if;
end;
$$;

create or replace function public.nf_apply_base_payment(p_order_id uuid, p_payment_id text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  billing_order public.nf_billing_orders%rowtype;
begin
  select * into billing_order from public.nf_billing_orders where id = p_order_id for update;
  if not found then return false; end if;
  if billing_order.status = 'approved' then
    return billing_order.provider_payment_id = p_payment_id;
  end if;
  if billing_order.provider_payment_id is not null and billing_order.provider_payment_id <> p_payment_id then
    return false;
  end if;
  if billing_order.status <> 'pending' or billing_order.amount <> 29.90 or billing_order.currency <> 'BRL' then
    return false;
  end if;
  update public.nf_billing_orders set status = 'approved', provider_payment_id = p_payment_id,
    updated_at = now() where id = p_order_id;
  insert into public.nf_entitlements (user_id, base_access)
    values (billing_order.user_id, true)
    on conflict (user_id) do update set base_access = true, updated_at = now();
  return true;
end;
$$;

create or replace function public.nf_update_ai_subscription(p_subscription_id uuid, p_provider_id text, p_status text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  subscription_row public.nf_ai_subscriptions%rowtype;
  active boolean;
begin
  if p_status not in ('authorized', 'paused', 'cancelled', 'pending') then return false; end if;
  select * into subscription_row from public.nf_ai_subscriptions where id = p_subscription_id for update;
  if not found then return false; end if;
  if subscription_row.provider_subscription_id is not null
     and subscription_row.provider_subscription_id <> p_provider_id then return false; end if;
  update public.nf_ai_subscriptions set provider_subscription_id = p_provider_id,
    status = p_status, updated_at = now() where id = p_subscription_id;
  active := p_status = 'authorized';
  insert into public.nf_entitlements (user_id, ai_subscription_active)
    values (subscription_row.user_id, active)
    on conflict (user_id) do update set ai_subscription_active = active, updated_at = now();
  return true;
end;
$$;

create or replace function public.nf_set_ai_subscription_active(p_subscription_id uuid, p_active boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  subscription_row public.nf_ai_subscriptions%rowtype;
  active boolean;
begin
  select * into subscription_row from public.nf_ai_subscriptions where id = p_subscription_id for update;
  if not found then return false; end if;
  active := p_active and subscription_row.status = 'authorized';
  update public.nf_entitlements set ai_subscription_active = active, updated_at = now()
    where user_id = subscription_row.user_id;
  return true;
end;
$$;

revoke all on function public.nf_consume_ai_quota(uuid) from public, anon, authenticated;
revoke all on function public.nf_release_ai_quota(uuid) from public, anon, authenticated;
revoke all on function public.nf_apply_base_payment(uuid, text) from public, anon, authenticated;
revoke all on function public.nf_update_ai_subscription(uuid, text, text) from public, anon, authenticated;
revoke all on function public.nf_set_ai_subscription_active(uuid, boolean) from public, anon, authenticated;
grant execute on function public.nf_consume_ai_quota(uuid) to service_role;
grant execute on function public.nf_release_ai_quota(uuid) to service_role;
grant execute on function public.nf_apply_base_payment(uuid, text) to service_role;
grant execute on function public.nf_update_ai_subscription(uuid, text, text) to service_role;
grant execute on function public.nf_set_ai_subscription_active(uuid, boolean) to service_role;
