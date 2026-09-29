CREATE TABLE IF NOT EXISTS public.system_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'maintenance')),
  enabled boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT system_notices_valid_window
    CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);

DROP TRIGGER IF EXISTS system_notices_set_updated_at
  ON public.system_notices;
CREATE TRIGGER system_notices_set_updated_at
  BEFORE UPDATE ON public.system_notices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS system_notices_active_window_idx
  ON public.system_notices (enabled, starts_at, ends_at)
  WHERE archived_at IS NULL;

ALTER TABLE public.system_notices ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.system_notices TO anon, authenticated;
GRANT ALL ON public.system_notices TO service_role;

DROP POLICY IF EXISTS "Anyone can read active system notices"
  ON public.system_notices;
CREATE POLICY "Anyone can read active system notices"
  ON public.system_notices
  FOR SELECT TO anon, authenticated
  USING (
    enabled
    AND archived_at IS NULL
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

DROP POLICY IF EXISTS "Admins can manage system notices"
  ON public.system_notices;
CREATE POLICY "Admins can manage system notices"
  ON public.system_notices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.admin_list_users(
  _search text DEFAULT '',
  _sort text DEFAULT 'created_at',
  _ascending boolean DEFAULT false,
  _page integer DEFAULT 1,
  _page_size integer DEFAULT 25,
  _role text DEFAULT 'all'
)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  district text,
  state text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  role text,
  profile_complete boolean,
  conversation_count bigint,
  diagnosis_count bigint,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(p.full_name, ''),
    p.district,
    p.state,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(
      (SELECT string_agg(ur.role::text, ', ' ORDER BY ur.role::text)
       FROM public.user_roles AS ur
       WHERE ur.user_id = u.id),
      'user'
    ),
    COALESCE(NULLIF(btrim(p.full_name), '') IS NOT NULL AND NULLIF(btrim(p.phone), '') IS NOT NULL, false),
    (SELECT count(*) FROM public.chat_conversations AS cc WHERE cc.user_id = u.id),
    (SELECT count(*) FROM public.crop_diagnoses AS cd WHERE cd.user_id = u.id),
    count(*) OVER ()
  FROM auth.users AS u
  LEFT JOIN public.profiles AS p ON p.id = u.id
  WHERE (
    COALESCE(_search, '') = ''
    OR u.email ILIKE '%' || _search || '%'
    OR COALESCE(p.full_name, '') ILIKE '%' || _search || '%'
    OR COALESCE(p.district, '') ILIKE '%' || _search || '%'
    OR COALESCE(p.state, '') ILIKE '%' || _search || '%'
  )
    AND (
      COALESCE(_role, 'all') = 'all'
      OR (
        _role = 'admin'
        AND EXISTS (
          SELECT 1 FROM public.user_roles AS admin_role
          WHERE admin_role.user_id = u.id
            AND admin_role.role = 'admin'::public.app_role
        )
      )
      OR (
        _role = 'user'
        AND NOT EXISTS (
          SELECT 1 FROM public.user_roles AS admin_role
          WHERE admin_role.user_id = u.id
            AND admin_role.role = 'admin'::public.app_role
        )
      )
    )
  ORDER BY
    CASE WHEN _sort = 'name' AND _ascending THEN lower(COALESCE(p.full_name, '')) END ASC,
    CASE WHEN _sort = 'name' AND NOT _ascending THEN lower(COALESCE(p.full_name, '')) END DESC,
    CASE WHEN _sort = 'email' AND _ascending THEN lower(COALESCE(u.email, '')) END ASC,
    CASE WHEN _sort = 'email' AND NOT _ascending THEN lower(COALESCE(u.email, '')) END DESC,
    CASE WHEN _sort = 'created_at' AND _ascending THEN u.created_at END ASC,
    CASE WHEN _sort = 'created_at' AND NOT _ascending THEN u.created_at END DESC,
    u.id
  OFFSET (LEAST(GREATEST(COALESCE(_page, 1), 1), 1000000) - 1)
    * LEAST(GREATEST(COALESCE(_page_size, 25), 1), 100)
  LIMIT LEAST(GREATEST(COALESCE(_page_size, 25), 1), 100);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_user_metrics()
RETURNS TABLE (
  registered bigint,
  active_today bigint,
  active_week bigint,
  new_today bigint,
  new_week bigint,
  conversations_total bigint,
  conversations_today bigint,
  messages_total bigint,
  messages_today bigint,
  diagnoses_total bigint,
  diagnoses_today bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  local_day_start timestamptz :=
    date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata')
      AT TIME ZONE 'Asia/Kolkata';
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    count(*),
    count(*) FILTER (WHERE last_sign_in_at >= now() - interval '24 hours'),
    count(*) FILTER (WHERE last_sign_in_at >= now() - interval '7 days'),
    count(*) FILTER (WHERE created_at >= local_day_start),
    count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
    (SELECT count(*) FROM public.chat_conversations),
    (SELECT count(*) FROM public.chat_conversations WHERE created_at >= local_day_start),
    (SELECT count(*) FROM public.chat_messages),
    (SELECT count(*) FROM public.chat_messages WHERE created_at >= local_day_start),
    (SELECT count(*) FROM public.crop_diagnoses),
    (SELECT count(*) FROM public.crop_diagnoses WHERE created_at >= local_day_start)
  FROM auth.users;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users(text, text, boolean, integer, integer, text)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_user_metrics()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, boolean, integer, integer, text)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_user_metrics()
  TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.application_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL CHECK (service IN ('mitra_ai', 'diagnosis', 'weather', 'authentication', 'database')),
  severity text NOT NULL CHECK (severity IN ('warning', 'error', 'critical')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id text,
  provider text,
  error_type text NOT NULL,
  message text NOT NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS application_error_logs_created_idx
  ON public.application_error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS application_error_logs_service_created_idx
  ON public.application_error_logs (service, created_at DESC);
CREATE INDEX IF NOT EXISTS application_error_logs_user_created_idx
  ON public.application_error_logs (user_id, created_at DESC);

ALTER TABLE public.application_error_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.application_error_logs TO authenticated;
GRANT INSERT, UPDATE ON public.application_error_logs TO service_role;

DROP POLICY IF EXISTS "Admins can read application error logs"
  ON public.application_error_logs;
CREATE POLICY "Admins can read application error logs"
  ON public.application_error_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
