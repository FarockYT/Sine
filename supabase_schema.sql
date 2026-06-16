-- NeuroQuest Focus Arcade + Multiplayer schema
-- Run this inside Supabase SQL Editor.

create table if not exists public.profiles (
  client_id text primary key,
  display_name text not null default 'Player',
  avatar text not null default '★',
  bio text default '',
  target text default '',
  github_url text default '',
  vercel_url text default '',
  color text default '#60a5fa',
  updated_at timestamptz not null default now()
);

create table if not exists public.game_rooms (
  room_code text primary key,
  room_name text not null default 'Study Room',
  is_public boolean not null default false,
  max_players integer not null default 12,
  state jsonb not null default '{}',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.game_rooms enable row level security;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;

create policy "profiles_select"
on public.profiles
for select
using (true);

create policy "profiles_insert"
on public.profiles
for insert
with check (true);

create policy "profiles_update"
on public.profiles
for update
using (true)
with check (true);

drop policy if exists "game_rooms_select" on public.game_rooms;
drop policy if exists "game_rooms_insert" on public.game_rooms;
drop policy if exists "game_rooms_update" on public.game_rooms;

create policy "game_rooms_select"
on public.game_rooms
for select
using (true);

create policy "game_rooms_insert"
on public.game_rooms
for insert
with check (true);

create policy "game_rooms_update"
on public.game_rooms
for update
using (true)
with check (true);

-- Realtime
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.game_rooms;

-- Optional starter public server room.
insert into public.game_rooms (
  room_code,
  room_name,
  is_public,
  max_players,
  state,
  created_by,
  updated_by
)
values (
  'PUBLIC-SERVER',
  'Public Study Server',
  true,
  100,
  '{"quests":[],"players":{},"roomCode":"PUBLIC-SERVER"}'::jsonb,
  'system',
  'system'
)
on conflict (room_code) do nothing;
