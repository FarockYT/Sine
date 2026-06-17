-- NeuroQuest Journey public room schema
-- Run this inside Supabase SQL Editor.

create table if not exists public.game_rooms (
  room_code text primary key,
  room_name text not null default 'Public Journey Path',
  is_public boolean not null default true,
  max_players integer not null default 100,
  state jsonb not null default '{}',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_rooms enable row level security;

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

alter publication supabase_realtime add table public.game_rooms;

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
  'PUBLIC-JOURNEY-PATH',
  'Public Journey Path',
  true,
  100,
  '{"players":{},"activity":[]}'::jsonb,
  'system',
  'system'
)
on conflict (room_code) do nothing;
