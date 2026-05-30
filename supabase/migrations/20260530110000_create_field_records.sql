create table if not exists public.field_records (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists field_records_module_created_at_idx
  on public.field_records (module, created_at desc);

alter table public.field_records enable row level security;

create policy "field_records_select"
  on public.field_records
  for select
  to anon, authenticated
  using (true);

create policy "field_records_insert"
  on public.field_records
  for insert
  to anon, authenticated
  with check (true);

create policy "field_records_update"
  on public.field_records
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "field_records_delete"
  on public.field_records
  for delete
  to anon, authenticated
  using (true);
