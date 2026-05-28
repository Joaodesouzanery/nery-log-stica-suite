create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists financial_records_module_created_at_idx
  on public.financial_records (module, created_at desc);

alter table public.financial_records enable row level security;

create policy "financial_records_select"
  on public.financial_records
  for select
  to anon, authenticated
  using (true);

create policy "financial_records_insert"
  on public.financial_records
  for insert
  to anon, authenticated
  with check (true);

create policy "financial_records_update"
  on public.financial_records
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "financial_records_delete"
  on public.financial_records
  for delete
  to anon, authenticated
  using (true);
