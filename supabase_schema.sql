-- ============================================================
-- HOCKEY FIXTURES MANAGER — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- VENUES
create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grounds int not null default 1,
  created_at timestamptz default now()
);

-- Seed the 5 default clusters
insert into venues (name, grounds) values
  ('Cluster 1', 2),
  ('Cluster 2', 2),
  ('Cluster 3', 3),
  ('Cluster 4', 2),
  ('Cluster 5', 1);

-- TEAMS
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class text not null check (class in ('first','second')),
  created_at timestamptz default now(),
  unique(name, class)
);

-- PLAYERS
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- FIXTURES
create table if not exists fixtures (
  id uuid primary key default gen_random_uuid(),
  class text not null check (class in ('first','second')),
  round int not null,
  home_team text not null,
  away_team text not null,
  venue_id uuid references venues(id) on delete set null,
  match_date date,
  match_time time,
  home_goals int,
  away_goals int,
  created_at timestamptz default now()
);

-- GOAL SCORERS
create table if not exists goal_scorers (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid references fixtures(id) on delete cascade,
  player_name text not null,
  team_name text not null,
  goals int not null default 1,
  own_goal boolean not null default false,
  created_at timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

alter table venues enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table fixtures enable row level security;
alter table goal_scorers enable row level security;

-- PUBLIC: anyone can READ all tables
create policy "Public read venues"       on venues       for select using (true);
create policy "Public read teams"        on teams        for select using (true);
create policy "Public read players"      on players      for select using (true);
create policy "Public read fixtures"     on fixtures     for select using (true);
create policy "Public read goal_scorers" on goal_scorers for select using (true);

-- AUTHENTICATED: logged-in admins can INSERT / UPDATE / DELETE
create policy "Auth write venues"       on venues       for all using (auth.role() = 'authenticated');
create policy "Auth write teams"        on teams        for all using (auth.role() = 'authenticated');
create policy "Auth write players"      on players      for all using (auth.role() = 'authenticated');
create policy "Auth write fixtures"     on fixtures     for all using (auth.role() = 'authenticated');
create policy "Auth write goal_scorers" on goal_scorers for all using (auth.role() = 'authenticated');
