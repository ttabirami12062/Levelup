-- Levelup database schema, matching what the app reads and writes.
-- Safe to run on a fresh Supabase project (SQL editor). Skip any table you already created.

create table if not exists public.profiles (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references auth.users(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 16),
  avatar     int  not null default 1 check (avatar between 1 and 4),
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  profile_id  uuid primary key references public.profiles(id) on delete cascade,
  coins       int  not null default 0,
  gems        int  not null default 0,
  streak      int  not null default 0,
  last_played text not null default '',
  updated_at  timestamptz not null default now()
);

create table if not exists public.rooms (
  profile_id   uuid primary key references public.profiles(id) on delete cascade,
  owned_items  jsonb not null default '[]',
  room_items   jsonb not null default '{}',
  room_version text  not null default 'v2',
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.rooms    enable row level security;

-- A parent only ever sees and edits their own kids.
create policy "parents manage own profiles" on public.profiles
  for all using (parent_id = auth.uid()) with check (parent_id = auth.uid());

create policy "parents manage own kids progress" on public.progress
  for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.parent_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.parent_id = auth.uid()));

create policy "parents manage own kids rooms" on public.rooms
  for all using (exists (select 1 from public.profiles p where p.id = profile_id and p.parent_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.parent_id = auth.uid()));

-- Called once a day by Vercel Cron (/api/keep-alive) so the free plan never
-- pauses the project for inactivity. It only returns the time; it can't read any data.
create or replace function public.keep_alive() returns timestamptz
  language sql stable as $$ select now() $$;
grant execute on function public.keep_alive() to anon;
