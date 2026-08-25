-- SportsVN Production Schema
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('super_admin','organizer','editor','referee','viewer');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.tournament_status as enum ('draft','registration','running','finished','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.news_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.match_status as enum ('scheduled','live','finished','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 phone text,
 role public.user_role not null default 'organizer',
 organization_id uuid,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.organizations(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 short_name text,
 contact_name text,
 phone text,
 email text,
 address text,
 logo_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.venues(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 address text,
 court_count integer not null default 1 check(court_count>0),
 notes text,
 created_at timestamptz not null default now()
);

create table if not exists public.tournaments(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 organization_id uuid references public.organizations(id) on delete set null,
 name text not null,
 slug text unique not null,
 sport text not null,
 discipline text,
 description text,
 cover_url text,
 start_date date,
 end_date date,
 venue_id uuid references public.venues(id) on delete set null,
 venue_name text,
 status public.tournament_status not null default 'draft',
 public_visible boolean not null default false,
 registration_open boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.teams(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 organization_id uuid references public.organizations(id) on delete set null,
 name text not null,
 short_name text,
 created_at timestamptz not null default now()
);

create table if not exists public.athletes(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 organization_id uuid references public.organizations(id) on delete set null,
 team_id uuid references public.teams(id) on delete set null,
 full_name text not null,
 athlete_code text,
 birth_date date,
 gender text,
 phone text,
 email text,
 avatar_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.tournament_entries(
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 athlete_id uuid references public.athletes(id) on delete cascade,
 team_id uuid references public.teams(id) on delete cascade,
 organization_id uuid references public.organizations(id) on delete set null,
 content text,
 seed integer,
 approved boolean not null default false,
 created_at timestamptz not null default now(),
 unique(tournament_id,athlete_id,content),
 unique(tournament_id,team_id,content)
);

create table if not exists public.matches(
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 round_name text not null,
 round_no integer not null default 1,
 match_no integer not null,
 scheduled_at timestamptz,
 venue_id uuid references public.venues(id) on delete set null,
 court_name text,
 entry_a_id uuid references public.tournament_entries(id) on delete set null,
 entry_b_id uuid references public.tournament_entries(id) on delete set null,
 score_a integer,
 score_b integer,
 winner_entry_id uuid references public.tournament_entries(id) on delete set null,
 status public.match_status not null default 'scheduled',
 next_match_id uuid references public.matches(id) on delete set null,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(tournament_id,round_no,match_no)
);

create table if not exists public.news(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 title text not null,
 slug text unique not null,
 category text,
 excerpt text,
 body text,
 cover_url text,
 source_name text,
 source_url text,
 status public.news_status not null default 'draft',
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.payments(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 order_code text unique not null,
 plan_code text not null,
 amount numeric(14,2) not null check(amount>=0),
 currency text not null default 'VND',
 provider text not null default 'bank_transfer',
 status text not null default 'pending',
 provider_reference text,
 transfer_note text,
 proof_url text,
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.settings(
 key text primary key,
 value jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);

create index if not exists idx_tournaments_owner on public.tournaments(owner_id);
create index if not exists idx_tournaments_public on public.tournaments(public_visible,status);
create index if not exists idx_entries_tournament on public.tournament_entries(tournament_id);
create index if not exists idx_matches_tournament on public.matches(tournament_id,round_no,match_no);
create index if not exists idx_news_public on public.news(status,published_at desc);

do $$ begin
  alter table public.profiles add constraint profiles_org_fk foreign key(organization_id) references public.organizations(id) on delete set null;
exception when duplicate_object then null; end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,phone)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone')
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_super_admin() returns boolean
language sql security definer stable set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='super_admin');
$$;

grant execute on function public.is_super_admin() to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;

do $$ declare t text; begin
 foreach t in array array['profiles','organizations','tournaments','athletes','matches','news','payments'] loop
   execute format('drop trigger if exists %I on public.%I', 'touch_'||t, t);
   execute format('create trigger %I before update on public.%I for each row execute procedure public.touch_updated_at()', 'touch_'||t, t);
 end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.venues enable row level security;
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.athletes enable row level security;
alter table public.tournament_entries enable row level security;
alter table public.matches enable row level security;
alter table public.news enable row level security;
alter table public.payments enable row level security;
alter table public.settings enable row level security;

-- Profiles
create policy profiles_select on public.profiles for select to authenticated using(id=auth.uid() or public.is_super_admin());
create policy profiles_update on public.profiles for update to authenticated using(id=auth.uid() or public.is_super_admin()) with check(id=auth.uid() or public.is_super_admin());
create policy profiles_admin on public.profiles for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());

-- Owner-scoped tables
DO $$ DECLARE t text; BEGIN
 foreach t in array array['organizations','venues','tournaments','teams','athletes','payments'] loop
   execute format('drop policy if exists %I on public.%I', t||'_owner',t);
   execute format('create policy %I on public.%I for all to authenticated using(owner_id=auth.uid() or public.is_super_admin()) with check(owner_id=auth.uid() or public.is_super_admin())',t||'_owner',t);
 end loop;
END $$;

create policy entries_owner on public.tournament_entries for all to authenticated
using(public.is_super_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid()))
with check(public.is_super_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid()));

create policy matches_owner on public.matches for all to authenticated
using(public.is_super_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid()))
with check(public.is_super_admin() or exists(select 1 from public.tournaments t where t.id=tournament_id and t.owner_id=auth.uid()));

-- Public content
create policy tournaments_public on public.tournaments for select to anon,authenticated using(public_visible=true);
create policy news_public on public.news for select to anon,authenticated using(status='published');

create policy news_owner on public.news for all to authenticated using(owner_id=auth.uid() or public.is_super_admin()) with check(owner_id=auth.uid() or public.is_super_admin());

create policy settings_admin on public.settings for all to authenticated using(public.is_super_admin()) with check(public.is_super_admin());

-- Safe public views
create or replace view public.public_tournaments as
select id,name,slug,sport,discipline,description,cover_url,start_date,end_date,venue_name,status,registration_open
from public.tournaments where public_visible=true;

create or replace view public.public_news as
select id,title,slug,category,excerpt,body,cover_url,source_name,source_url,published_at
from public.news where status='published';

grant select on public.public_tournaments to anon,authenticated;
grant select on public.public_news to anon,authenticated;
create or replace function public.prevent_role_escalation() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'Bạn không có quyền thay đổi vai trò tài khoản';
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles for each row execute procedure public.prevent_role_escalation();

create or replace view public.public_matches as
select m.id,m.tournament_id,t.name as tournament_name,m.round_name,m.round_no,m.match_no,m.scheduled_at,m.score_a,m.score_b,m.status,
coalesce(a.full_name,ta.name,'BYE') as participant_a,
coalesce(b.full_name,tb.name,'BYE') as participant_b
from public.matches m
join public.tournaments t on t.id=m.tournament_id
left join public.tournament_entries ea on ea.id=m.entry_a_id
left join public.tournament_entries eb on eb.id=m.entry_b_id
left join public.athletes a on a.id=ea.athlete_id
left join public.athletes b on b.id=eb.athlete_id
left join public.teams ta on ta.id=ea.team_id
left join public.teams tb on tb.id=eb.team_id
where t.public_visible=true;
grant select on public.public_matches to anon,authenticated;


-- Seed public settings. Replace payment details before launch.
insert into public.settings(key,value) values
('site',jsonb_build_object('name','SportsVN','domain','https://sportsvn.com','email','nguyenquanghao2505@gmail.com','phone','0905771177')),
('payment',jsonb_build_object('provider','bank_transfer','enabled',false,'bank_name','','account_number','','account_name','','qr_url',''))
on conflict(key) do nothing;
