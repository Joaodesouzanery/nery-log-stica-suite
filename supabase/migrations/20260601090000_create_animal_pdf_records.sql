create table if not exists public.animal_pdf_records (
  id uuid primary key default gen_random_uuid(),
  animal_record_id text not null,
  animal_identifier text not null,
  version integer not null default 1,
  file_path text not null,
  file_name text not null,
  payload_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists animal_pdf_records_animal_idx
  on public.animal_pdf_records (animal_record_id, created_at desc);

create index if not exists animal_pdf_records_identifier_idx
  on public.animal_pdf_records (animal_identifier);

alter table public.animal_pdf_records enable row level security;

create policy "animal_pdf_records_select"
  on public.animal_pdf_records
  for select
  to anon, authenticated
  using (true);

create policy "animal_pdf_records_insert"
  on public.animal_pdf_records
  for insert
  to anon, authenticated
  with check (true);

create policy "animal_pdf_records_update"
  on public.animal_pdf_records
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "animal_pdf_records_delete"
  on public.animal_pdf_records
  for delete
  to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('animal-pdfs', 'animal-pdfs', true)
on conflict (id) do update set public = true;

create policy "animal_pdfs_select"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'animal-pdfs');

create policy "animal_pdfs_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'animal-pdfs');

create policy "animal_pdfs_update"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'animal-pdfs')
  with check (bucket_id = 'animal-pdfs');

create policy "animal_pdfs_delete"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'animal-pdfs');
