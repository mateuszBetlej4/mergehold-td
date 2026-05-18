create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_version integer not null default 1,
  best_wave integer not null default 0,
  soft_currency integer not null default 0,
  hard_currency integer not null default 0,
  unlocked_content jsonb not null default '{}'::jsonb,
  permanent_upgrades jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wave integer not null,
  score integer not null,
  duration_seconds integer not null,
  build_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.player_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null,
  content_type text not null,
  level integer not null default 1,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create table if not exists public.remote_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.player_saves enable row level security;
alter table public.leaderboard_runs enable row level security;
alter table public.player_inventory enable row level security;
alter table public.remote_config enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can view own save" on public.player_saves;
create policy "Users can view own save"
  on public.player_saves for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own save" on public.player_saves;
create policy "Users can insert own save"
  on public.player_saves for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own save" on public.player_saves;
create policy "Users can update own save"
  on public.player_saves for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Leaderboard is public readable" on public.leaderboard_runs;
create policy "Leaderboard is public readable"
  on public.leaderboard_runs for select
  using (true);

drop policy if exists "Users can submit own leaderboard runs" on public.leaderboard_runs;
create policy "Users can submit own leaderboard runs"
  on public.leaderboard_runs for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can view own inventory" on public.player_inventory;
create policy "Users can view own inventory"
  on public.player_inventory for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own inventory" on public.player_inventory;
create policy "Users can insert own inventory"
  on public.player_inventory for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own inventory" on public.player_inventory;
create policy "Users can update own inventory"
  on public.player_inventory for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Remote config is public readable" on public.remote_config;
create policy "Remote config is public readable"
  on public.remote_config for select
  using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.player_saves to authenticated;
grant select on public.leaderboard_runs to anon, authenticated;
grant insert on public.leaderboard_runs to authenticated;
grant select, insert, update on public.player_inventory to authenticated;
grant select on public.remote_config to anon, authenticated;

insert into public.remote_config (key, value)
values (
  'starter_balance',
  '{
    "startingCoins": 100,
    "startingFortHp": 100,
    "bossEveryNWaves": 5,
    "cloudSaves": true
  }'::jsonb
)
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();
