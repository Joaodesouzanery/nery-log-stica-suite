CREATE TABLE public.field_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_records TO anon, authenticated;
GRANT ALL ON public.field_records TO service_role;

ALTER TABLE public.field_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_select_field" ON public.field_records FOR SELECT USING (true);
CREATE POLICY "open_insert_field" ON public.field_records FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_field" ON public.field_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete_field" ON public.field_records FOR DELETE USING (true);

CREATE INDEX idx_field_records_module ON public.field_records(module);