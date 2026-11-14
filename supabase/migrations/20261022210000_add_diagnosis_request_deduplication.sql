ALTER TABLE public.crop_diagnoses
  ADD COLUMN IF NOT EXISTS request_id uuid,
  ADD COLUMN IF NOT EXISTS conditions_favouring text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS spray_recommendations jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS crop_diagnoses_user_request_idx
  ON public.crop_diagnoses (user_id, request_id)
  WHERE request_id IS NOT NULL;

INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-photos', 'crop-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;
