CREATE TABLE public.animal_pdf_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_record_id uuid NOT NULL,
  animal_identifier text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  file_path text NOT NULL,
  file_name text NOT NULL,
  payload_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_animal_pdf_records_animal_record_id ON public.animal_pdf_records(animal_record_id);
CREATE INDEX idx_animal_pdf_records_identifier ON public.animal_pdf_records(animal_identifier);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.animal_pdf_records TO anon, authenticated;
GRANT ALL ON public.animal_pdf_records TO service_role;

ALTER TABLE public.animal_pdf_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_select_animal_pdf" ON public.animal_pdf_records FOR SELECT USING (true);
CREATE POLICY "open_insert_animal_pdf" ON public.animal_pdf_records FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update_animal_pdf" ON public.animal_pdf_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete_animal_pdf" ON public.animal_pdf_records FOR DELETE USING (true);