ALTER TABLE public.phone_verification_codes
  ADD COLUMN IF NOT EXISTS user_id uuid;

DELETE FROM public.phone_verification_codes
WHERE user_id IS NULL;

ALTER TABLE public.phone_verification_codes
  ALTER COLUMN user_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'phone_verification_codes_user_id_fkey'
      AND conrelid = 'public.phone_verification_codes'::regclass
  ) THEN
    ALTER TABLE public.phone_verification_codes
      ADD CONSTRAINT phone_verification_codes_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS phone_verification_codes_user_idx
  ON public.phone_verification_codes (user_id, created_at DESC);
