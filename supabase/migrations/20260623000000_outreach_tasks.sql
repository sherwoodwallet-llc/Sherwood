create extension if not exists pgcrypto;

create sequence if not exists public.outreach_manager_number_seq;
grant usage, select on sequence public.outreach_manager_number_seq to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'outreach_manager' check (role in ('master', 'outreach_manager')),
  manager_number integer unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid,
  organization_name text not null,
  organization_type text,
  organization_website text,
  fit_reason text,
  contact_name text,
  contact_email text not null,
  draft_email text not null,
  draft_subject text,
  assigned_to uuid references public.profiles(id),
  assigned_manager_number integer,
  status text not null default 'pending_review' check (
    status in ('pending_review', 'needs_edit', 'approved', 'sent', 'rejected', 'failed')
  ),
  manager_notes text,
  sent_at timestamptz,
  sent_by uuid references public.profiles(id),
  created_by_agent text,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists outreach_tasks_contact_website_unique
  on public.outreach_tasks (lower(contact_email), lower(coalesce(organization_website, organization_name)));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists outreach_tasks_set_updated_at on public.outreach_tasks;
create trigger outreach_tasks_set_updated_at
before update on public.outreach_tasks
for each row execute function public.set_updated_at();

create or replace function public.assign_manager_number()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'outreach_manager' and new.manager_number is null then
    new.manager_number = nextval('public.outreach_manager_number_seq');
  end if;

  if new.role = 'master' then
    new.manager_number = null;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_assign_manager_number on public.profiles;
create trigger profiles_assign_manager_number
before insert or update of role, manager_number on public.profiles
for each row execute function public.assign_manager_number();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    case
      when lower(new.email) = 'hadiabdul8128@gmail.com' then 'master'
      else 'outreach_manager'
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case
      when lower(excluded.email) = 'hadiabdul8128@gmail.com' then 'master'
      else public.profiles.role
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.is_master()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'master'
      and active = true
  );
$$;

alter table public.profiles enable row level security;
alter table public.outreach_tasks enable row level security;

drop policy if exists "Profiles can read own profile" on public.profiles;
create policy "Profiles can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Masters can read all profiles" on public.profiles;
create policy "Masters can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_master());

drop policy if exists "Masters can update profiles" on public.profiles;
create policy "Masters can update profiles"
on public.profiles
for update
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Managers can read assigned outreach tasks" on public.outreach_tasks;
create policy "Managers can read assigned outreach tasks"
on public.outreach_tasks
for select
to authenticated
using (assigned_to = auth.uid() or public.is_master());

drop policy if exists "Managers can update assigned outreach tasks" on public.outreach_tasks;
create policy "Managers can update assigned outreach tasks"
on public.outreach_tasks
for update
to authenticated
using (assigned_to = auth.uid() or public.is_master())
with check (assigned_to = auth.uid() or public.is_master());

drop policy if exists "Masters can delete outreach tasks" on public.outreach_tasks;
create policy "Masters can delete outreach tasks"
on public.outreach_tasks
for delete
to authenticated
using (public.is_master());
