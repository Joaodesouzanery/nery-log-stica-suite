
-- Create storage bucket for animal PDFs (public so download links work without auth in this app stage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('animal-pdfs', 'animal-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Open policies (matches current open-RLS posture of the data tables in this prototype)
CREATE POLICY "animal_pdfs_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animal-pdfs');

CREATE POLICY "animal_pdfs_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'animal-pdfs');

CREATE POLICY "animal_pdfs_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'animal-pdfs');

CREATE POLICY "animal_pdfs_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'animal-pdfs');
