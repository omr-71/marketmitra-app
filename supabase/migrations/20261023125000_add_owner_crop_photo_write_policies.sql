DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Farmers upload their own crop photos'
  ) THEN
    CREATE POLICY "Farmers upload their own crop photos"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'crop-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Farmers delete their own crop photos'
  ) THEN
    CREATE POLICY "Farmers delete their own crop photos"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'crop-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END
$$;
