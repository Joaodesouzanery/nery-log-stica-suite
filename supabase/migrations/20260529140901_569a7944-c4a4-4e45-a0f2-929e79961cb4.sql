
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.operation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area TEXT NOT NULL,
  module TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_financial_records_module ON public.financial_records(module);
CREATE INDEX idx_operation_records_module ON public.operation_records(area, module);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_records TO anon, authenticated;
GRANT ALL ON public.financial_records TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operation_records TO anon, authenticated;
GRANT ALL ON public.operation_records TO service_role;

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_select_fin" ON public.financial_records FOR SELECT USING (true);
CREATE POLICY "open_insert_fin" ON public.financial_records FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_fin" ON public.financial_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete_fin" ON public.financial_records FOR DELETE USING (true);

CREATE POLICY "open_select_op" ON public.operation_records FOR SELECT USING (true);
CREATE POLICY "open_insert_op" ON public.operation_records FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_op" ON public.operation_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete_op" ON public.operation_records FOR DELETE USING (true);
