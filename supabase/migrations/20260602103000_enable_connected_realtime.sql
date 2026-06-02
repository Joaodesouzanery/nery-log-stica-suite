do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.financial_records;
    exception
      when duplicate_object then null;
      when undefined_table then null;
    end;

    begin
      alter publication supabase_realtime add table public.operation_records;
    exception
      when duplicate_object then null;
      when undefined_table then null;
    end;

    begin
      alter publication supabase_realtime add table public.field_records;
    exception
      when duplicate_object then null;
      when undefined_table then null;
    end;
  end if;
end $$;
