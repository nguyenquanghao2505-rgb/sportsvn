-- SportsVN multi-tenant schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'owner' check (role in ('super_admin','owner','staff','referee','viewer')),
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  sport text not null,
  start_date date,
  end_date date,
  venue text,
  status text not null default 'draft',
  description text,
  fee numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  unit_name text,
  sport text,
  birth_date date,
  phone text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_name text,
  scheduled_at timestamptz,
  venue_id text,
  court_name text,
  athlete_a text,
  athlete_b text,
  score_a text,
  score_b text,
  status text not null default 'scheduled'
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  court_count integer not null default 1,
  active boolean not null default true
);

create table if not exists public.venue_bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete set null,
  court_name text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  note text,
  constraint booking_time_valid check (start_at < end_at)
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text unique not null,
  summary text,
  content text not null,
  category text,
  image_url text,
  source_name text,
  source_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete set null,
  package_name text not null,
  amount numeric(12,2) not null,
  provider text,
  provider_ref text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists tournaments_owner_idx on public.tournaments(owner_id);
create index if not exists athletes_owner_idx on public.athletes(owner_id);
create index if not exists matches_owner_idx on public.matches(owner_id);
create index if not exists bookings_owner_idx on public.venue_bookings(owner_id);
create index if not exists news_status_idx on public.news(status);

alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.athletes enable row level security;
alter table public.matches enable row level security;
alter table public.venues enable row level security;
alter table public.venue_bookings enable row level security;
alter table public.news enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_super_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

create policy "profiles own" on public.profiles for select using (id = auth.uid() or public.is_super_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_super_admin());

create policy "tournament owner read" on public.tournaments for select using (owner_id = auth.uid() or public.is_super_admin());
create policy "tournament owner insert" on public.tournaments for insert with check (owner_id = auth.uid());
create policy "tournament owner update" on public.tournaments for update using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
create policy "tournament owner delete" on public.tournaments for delete using (owner_id = auth.uid() or public.is_super_admin());

create policy "athletes owner" on public.athletes for all using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
create policy "matches owner" on public.matches for all using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
create policy "venues owner" on public.venues for all using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
create policy "bookings owner" on public.venue_bookings for all using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
create policy "news public read" on public.news for select using (status = 'published' or owner_id = auth.uid() or public.is_super_admin());
create policy "news owner write" on public.news for all using (owner_id = auth.uid() or public.is_super_admin()) with check (owner_id = auth.uid() or public.is_super_admin());
create policy "payments own" on public.payments for select using (user_id = auth.uid() or public.is_super_admin());
create policy "payments create" on public.payments for insert with check (user_id = auth.uid());
