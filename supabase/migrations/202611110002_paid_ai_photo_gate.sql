-- Photo analysis requires an AI subscription with at least one verified Pix payment.
-- Apply after 202611040002_billing.sql and 202611110001_photo_analysis_monthly_budget.sql.

alter table public.nf_entitlements
  add column if not exists ai_subscription_paid_at timestamptz;

-- Do not activate a new subscription from the preapproval authorization alone.
-- A verified approved invoice sets the paid timestamp through nf_set_ai_subscription_active.
create or replace function public.nf_update_ai_subscription(p_subscription_id uuid, p_provider_id text, p_status text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  subscription_row public.nf_ai_subscriptions%rowtype;
begin
  if p_status not in ('authorized', 'paused', 'cancelled', 'pending') then return false; end if;
  select * into subscription_row from public.nf_ai_subscriptions where id = p_subscription_id for update;
  if not found then return false; end if;
  if subscription_row.provider_subscription_id is not null
     and subscription_row.provider_subscription_id <> p_provider_id then return false; end if;
  update public.nf_ai_subscriptions set provider_subscription_id = p_provider_id,
    status = p_status, updated_at = now() where id = p_subscription_id;

  if p_status = 'authorized' then
    insert into public.nf_entitlements (user_id, ai_subscription_active)
      values (subscription_row.user_id, false)
      on conflict (user_id) do nothing;
  else
    insert into public.nf_entitlements (user_id, ai_subscription_active)
      values (subscription_row.user_id, false)
      on conflict (user_id) do update set ai_subscription_active = false, updated_at = now();
  end if;
  return true;
end;
$$;

-- Only the server calls this after verifying the related Pix payment with Mercado Pago.
create or replace function public.nf_set_ai_subscription_active(p_subscription_id uuid, p_active boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  subscription_row public.nf_ai_subscriptions%rowtype;
  active boolean;
begin
  select * into subscription_row from public.nf_ai_subscriptions where id = p_subscription_id for update;
  if not found then return false; end if;
  active := p_active and subscription_row.status = 'authorized';
  insert into public.nf_entitlements as existing (user_id, ai_subscription_active, ai_subscription_paid_at)
    values (subscription_row.user_id, active, case when active then now() else null end)
    on conflict (user_id) do update set
      ai_subscription_active = active,
      ai_subscription_paid_at = case when active then now() else existing.ai_subscription_paid_at end,
      updated_at = now();
  return true;
end;
$$;

-- The monthly text-AI tier also requires a verified payment, not just preapproval.
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

  if entitlement.ai_subscription_active and entitlement.ai_subscription_paid_at is not null then
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

-- Photo calls have their own atomic entitlement check so base-plan AI allowances
-- can never unlock the paid image-analysis provider call.
create or replace function public.nf_consume_paid_photo_ai_quota(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  entitlement public.nf_entitlements%rowtype;
  month_start date := date_trunc('month', now())::date;
begin
  select * into entitlement from public.nf_entitlements where user_id = p_user_id for update;
  if not found or not entitlement.base_access then
    return jsonb_build_object('allowed', false, 'reason', 'base_access_required');
  end if;
  if not entitlement.ai_subscription_active or entitlement.ai_subscription_paid_at is null then
    return jsonb_build_object('allowed', false, 'reason', 'subscription_required');
  end if;

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
end;
$$;

create or replace function public.nf_release_paid_photo_ai_quota(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  month_start date := date_trunc('month', now())::date;
begin
  update public.nf_entitlements set ai_month_used = greatest(ai_month_used - 1, 0), updated_at = now()
    where user_id = p_user_id and ai_month_start = month_start;
end;
$$;

revoke all on function public.nf_update_ai_subscription(uuid, text, text) from public, anon, authenticated;
revoke all on function public.nf_set_ai_subscription_active(uuid, boolean) from public, anon, authenticated;
revoke all on function public.nf_consume_paid_photo_ai_quota(uuid) from public, anon, authenticated;
revoke all on function public.nf_release_paid_photo_ai_quota(uuid) from public, anon, authenticated;
grant execute on function public.nf_update_ai_subscription(uuid, text, text) to service_role;
grant execute on function public.nf_set_ai_subscription_active(uuid, boolean) to service_role;
grant execute on function public.nf_consume_paid_photo_ai_quota(uuid) to service_role;
grant execute on function public.nf_release_paid_photo_ai_quota(uuid) to service_role;
