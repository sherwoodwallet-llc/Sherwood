create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('Donor', 'Nonprofit', 'Merchant', 'Builder', 'Investor')),
  message text,
  created_at timestamptz not null default now()
);

alter table public.waitlist_entries enable row level security;

create policy "Service role can manage waitlist entries"
  on public.waitlist_entries
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
