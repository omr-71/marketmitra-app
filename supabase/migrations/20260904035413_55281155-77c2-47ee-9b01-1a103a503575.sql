-- 1. Feature switches: richer admin metadata
ALTER TABLE public.feature_flags
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'operational',
  ADD COLUMN IF NOT EXISTS reason text;

UPDATE public.feature_flags SET enabled = true, status = 'operational', reason = NULL, maintenance_message = NULL WHERE key = 'diagnose';

INSERT INTO public.feature_flags (key, label, enabled) VALUES
  ('diagnose', 'Disease Detection', true),
  ('mitra_ai', 'Mitra AI', true),
  ('market_prices', 'Market Prices', true),
  ('weather', 'Weather', true),
  ('schemes', 'Government Schemes', true),
  ('predict', 'Price Prediction', true),
  ('profile', 'Profile', true),
  ('notifications', 'Notifications', true),
  ('voice', 'Voice Features', true),
  ('link', 'Mitra Link', true)
ON CONFLICT (key) DO NOTHING;

-- 2. Diagnosis history
CREATE TABLE IF NOT EXISTS public.crop_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  image_path text,
  lang text NOT NULL DEFAULT 'en',
  crop_hint text,
  usable boolean NOT NULL DEFAULT true,
  crop text,
  condition text,
  confidence integer,
  severity text,
  symptoms text[] NOT NULL DEFAULT '{}',
  causes text[] NOT NULL DEFAULT '{}',
  what_it_is text,
  why_it_happens text,
  what_to_do_now text[] NOT NULL DEFAULT '{}',
  prevention text[] NOT NULL DEFAULT '{}',
  monitoring text[] NOT NULL DEFAULT '{}',
  uncertainty_note text,
  image_issues text[] NOT NULL DEFAULT '{}',
  advice text,
  provider text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_diagnoses TO authenticated;
GRANT ALL ON public.crop_diagnoses TO service_role;

ALTER TABLE public.crop_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can read their own diagnoses" ON public.crop_diagnoses
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Farmers can save their own diagnoses" ON public.crop_diagnoses
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Farmers can delete their own diagnoses" ON public.crop_diagnoses
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all diagnoses" ON public.crop_diagnoses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS crop_diagnoses_user_created_idx ON public.crop_diagnoses (user_id, created_at DESC);

CREATE TRIGGER crop_diagnoses_set_updated_at BEFORE UPDATE ON public.crop_diagnoses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Private crop photo access (bucket created separately)
CREATE POLICY "Farmers read their own crop photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'crop-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
