-- NutriFlow MVP: private profiles, meal ideas, and meal records.
-- Run this migration in the Supabase SQL Editor for your project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('plan', 'log')),
  meal_kind text not null check (char_length(meal_kind) between 1 and 40),
  name text not null check (char_length(name) between 1 and 120),
  entry_date date not null,
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meal_entries_user_date_idx
  on public.meal_entries (user_id, entry_date desc);

alter table public.profiles enable row level security;
alter table public.meal_entries enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.meal_entries from anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.meal_entries to authenticated;

drop policy if exists "profile_owner_select" on public.profiles;
create policy "profile_owner_select" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profile_owner_insert" on public.profiles;
create policy "profile_owner_insert" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profile_owner_update" on public.profiles;
create policy "profile_owner_update" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
drop policy if exists "profile_owner_delete" on public.profiles;
create policy "profile_owner_delete" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists "meal_entry_owner_select" on public.meal_entries;
create policy "meal_entry_owner_select" on public.meal_entries
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "meal_entry_owner_insert" on public.meal_entries;
create policy "meal_entry_owner_insert" on public.meal_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "meal_entry_owner_update" on public.meal_entries;
create policy "meal_entry_owner_update" on public.meal_entries
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "meal_entry_owner_delete" on public.meal_entries;
create policy "meal_entry_owner_delete" on public.meal_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Create a profile from Auth metadata. Profile contents stay editable by the owner.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
