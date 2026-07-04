create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  onboarding_completed boolean not null default false,
  current_onboarding_step text not null default 'welcome',
  has_active_entitlement boolean not null default false,
  subscription_status text not null default 'free',
  revenuecat_app_user_id text,
  revenuecat_entitlement_ids text[],
  subscription_product_id text,
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id text not null,
  answer jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, step_id)
);

alter table public.profiles enable row level security;
alter table public.onboarding_responses enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Onboarding responses are readable by owner"
  on public.onboarding_responses
  for select
  using (auth.uid() = user_id);

create policy "Onboarding responses are insertable by owner"
  on public.onboarding_responses
  for insert
  with check (auth.uid() = user_id);

create policy "Onboarding responses are updatable by owner"
  on public.onboarding_responses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, revenuecat_app_user_id)
  values (new.id, new.email, new.id::text)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_onboarding_responses_updated_at on public.onboarding_responses;
create trigger touch_onboarding_responses_updated_at
  before update on public.onboarding_responses
  for each row execute function public.touch_updated_at();
