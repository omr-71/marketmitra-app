CREATE POLICY "Signed-in farmers can view link photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'link-photos');

CREATE POLICY "Owners can upload their link photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'link-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can update their link photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'link-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'link-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete their link photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'link-photos' AND (storage.foldername(name))[1] = auth.uid()::text);