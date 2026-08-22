create extension if not exists pgcrypto;

do $$ begin create type public.app_role as enum ('admin','manager','editor','viewer'); exception when duplicate_object then null; end $$;
do $$ begin create type public.tournament_status as enum ('draft','registration','running','finished','archived'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text default '', phone text, role public.app_role not null default 'manager',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.organizations (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null, short_name text, contact_name text, phone text, email text, address text, created_at timestamptz not null default now()
);
create table if not exists public.venues (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null, address text, court_count integer not null default 1 check(court_count>0), notes text, created_at timestamptz not null default now()
);
create table if not exists public.tournaments (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null, sport text not null, description text, start_date date, end_date date,
 venue_id uuid references public.venues(id) on delete set null, venue_name text,
 status public.tournament_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.athletes (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 organization_id uuid references public.organizations(id) on delete set null,
 full_name text not null, birth_date date, gender text, phone text, email text, athlete_code text, created_at timestamptz not null default now()
);
create table if not exists public.tournament_entries (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 athlete_id uuid references public.athletes(id) on delete cascade, organization_id uuid references public.organizations(id) on delete set null,
 content text, seed integer, approved boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.matches (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 round_name text not null, match_no integer not null, scheduled_at timestamptz, venue_id uuid references public.venues(id) on delete set null,
 court_name text, athlete_a uuid references public.athletes(id) on delete set null, athlete_b uuid references public.athletes(id) on delete set null,
 score_a integer, score_b integer, status text not null default 'scheduled', created_at timestamptz not null default now()
);
create table if not exists public.news (
 id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id) on delete set null,
 title text not null, slug text unique not null, excerpt text, body text, cover_url text, source_name text, source_url text,
 published_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.payments (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 plan_code text not null, amount numeric(14,2) not null check(amount>=0), currency text not null default 'VND', status text not null default 'pending', provider text,
 provider_reference text, transfer_note text, created_at timestamptz not null default now()
);
create table if not exists public.venue_bookings (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 venue_id uuid not null references public.venues(id) on delete cascade, tournament_id uuid references public.tournaments(id) on delete set null,
 court_name text, starts_at timestamptz not null, ends_at timestamptz not null, status text not null default 'reserved', notes text,
 created_at timestamptz not null default now(), check(ends_at>starts_at)
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name,phone) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone') on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.venues enable row level security;
alter table public.tournaments enable row level security;
alter table public.athletes enable row level security;
alter table public.tournament_entries enable row level security;
alter table public.matches enable row level security;
alter table public.news enable row level security;
alter table public.payments enable row level security;
alter table public.venue_bookings enable row level security;

drop policy if exists profiles_own on public.profiles;
drop policy if exists profiles_admin on public.profiles;
create policy profiles_own on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy profiles_own_update on public.profiles for update using(id=auth.uid() or public.is_admin()) with check(id=auth.uid() or public.is_admin());
create policy profiles_admin on public.profiles for all using(public.is_admin()) with check(public.is_admin());

-- Owner policies; admins can manage platform-wide records.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['organizations','venues','tournaments','athletes','payments','venue_bookings'] LOOP
    EXECUTE format('drop policy if exists %I on public.%I', t||'_access', t);
    EXECUTE format('create policy %I on public.%I for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin())', t||'_access', t);
  END LOOP;
END $$;
drop policy if exists entries_access on public.tournament_entries;
create policy entries_access on public.tournament_entries for all using(public.is_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid())) with check(public.is_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid()));
drop policy if exists matches_access on public.matches;
create policy matches_access on public.matches for all using(public.is_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid())) with check(public.is_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid()));
drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news for select using(published_at is not null or owner_id=auth.uid() or public.is_admin());
drop policy if exists news_write on public.news;
create policy news_write on public.news for all using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());

create index if not exists tournaments_owner_idx on public.tournaments(owner_id);
create index if not exists athletes_owner_idx on public.athletes(owner_id);
create index if not exists venues_owner_idx on public.venues(owner_id);
create index if not exists bookings_venue_time_idx on public.venue_bookings(venue_id,starts_at,ends_at);
create index if not exists matches_tournament_idx on public.matches(tournament_id);
