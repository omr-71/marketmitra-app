CREATE TABLE IF NOT EXISTS public.notice_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.system_notices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notice_reads_notice_user_unique UNIQUE (notice_id, user_id)
);

CREATE INDEX IF NOT EXISTS notice_reads_user_notice_idx
  ON public.notice_reads(user_id, notice_id);

ALTER TABLE public.notice_reads ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.notice_reads FROM PUBLIC;
REVOKE ALL ON TABLE public.notice_reads FROM anon;
REVOKE ALL ON TABLE public.notice_reads FROM authenticated;
GRANT SELECT, INSERT ON TABLE public.notice_reads TO authenticated;
GRANT ALL ON TABLE public.notice_reads TO service_role;

DROP POLICY IF EXISTS "Users can read their own notice reads"
  ON public.notice_reads;
CREATE POLICY "Users can read their own notice reads"
  ON public.notice_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can acknowledge their own notices"
  ON public.notice_reads;
CREATE POLICY "Users can acknowledge their own notices"
  ON public.notice_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.acknowledge_system_notice(_notice_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.system_notices
    WHERE id = _notice_id
      AND enabled
      AND archived_at IS NULL
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at > now())
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.notice_reads(notice_id, user_id)
  VALUES (_notice_id, _user_id)
  ON CONFLICT (notice_id, user_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.acknowledge_system_notice(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acknowledge_system_notice(uuid) TO authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.system_notices;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;
