create table if not exists public.operation_records (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  module text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists operation_records_module_created_at_idx
  on public.operation_records (module, created_at desc);

create index if not exists operation_records_area_module_idx
  on public.operation_records (area, module);

alter table public.operation_records enable row level security;

create policy "operation_records_select"
  on public.operation_records
  for select
  to anon, authenticated
  using (true);

create policy "operation_records_insert"
  on public.operation_records
  for insert
  to anon, authenticated
  with check (true);

create policy "operation_records_update"
  on public.operation_records
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "operation_records_delete"
  on public.operation_records
  for delete
  to anon, authenticated
  using (true);
