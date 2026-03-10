-- ═══════════════════════════════════════════════════════════════
-- HOCKEY FIXTURES MANAGER — SUPABASE SCHEMA
-- Run this in your Supabase project: SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension (already enabled on Supabase by default)
create extension if not exists "uuid-ossp";

-- ── Venues ──────────────────────────────────────────────────────
create table venues (
  id uuid primary key default uuid_generate_v4(),
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

-- ── Teams ───────────────────────────────────────────────────────
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  class text not null check (class in ('first', 'second')),
  created_at timestamptz default now()
);

-- ── Players ─────────────────────────────────────────────────────
create table players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  team_id uuid references teams(id) on delete cascade,
  created_at timestamptz default now()
);

-- ── Fixtures ────────────────────────────────────────────────────
create table fixtures (
  id uuid primary key default uuid_generate_v4(),
  class text not null check (class in ('first', 'second')),
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

-- ── Goal Scorers ─────────────────────────────────────────────────
create table goal_scorers (
  id uuid primary key default uuid_generate_v4(),
  fixture_id uuid references fixtures(id) on delete cascade,
  player_name text not null,
  team_name text not null,
  goals int not null default 1,
  own_goal boolean not null default false,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Public can READ everything.
-- Only authenticated users (admins) can INSERT / UPDATE / DELETE.
-- ═══════════════════════════════════════════════════════════════

alter table venues enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table fixtures enable row level security;
alter table goal_scorers enable row level security;

-- Venues
create policy "Public read venues" on venues for select using (true);
create policy "Admin insert venues" on venues for insert with check (auth.role() = 'authenticated');
create policy "Admin update venues" on venues for update using (auth.role() = 'authenticated');
create policy "Admin delete venues" on venues for delete using (auth.role() = 'authenticated');

-- Teams
create policy "Public read teams" on teams for select using (true);
create policy "Admin insert teams" on teams for insert with check (auth.role() = 'authenticated');
create policy "Admin update teams" on teams for update using (auth.role() = 'authenticated');
create policy "Admin delete teams" on teams for delete using (auth.role() = 'authenticated');

-- Players
create policy "Public read players" on players for select using (true);
create policy "Admin insert players" on players for insert with check (auth.role() = 'authenticated');
create policy "Admin update players" on players for update using (auth.role() = 'authenticated');
create policy "Admin delete players" on players for delete using (auth.role() = 'authenticated');

-- Fixtures
create policy "Public read fixtures" on fixtures for select using (true);
create policy "Admin insert fixtures" on fixtures for insert with check (auth.role() = 'authenticated');
create policy "Admin update fixtures" on fixtures for update using (auth.role() = 'authenticated');
create policy "Admin delete fixtures" on fixtures for delete using (auth.role() = 'authenticated');

-- Goal Scorers
create policy "Public read scorers" on goal_scorers for select using (true);
create policy "Admin insert scorers" on goal_scorers for insert with check (auth.role() = 'authenticated');
create policy "Admin update scorers" on goal_scorers for update using (auth.role() = 'authenticated');
create policy "Admin delete scorers" on goal_scorers for delete using (auth.role() = 'authenticated');
