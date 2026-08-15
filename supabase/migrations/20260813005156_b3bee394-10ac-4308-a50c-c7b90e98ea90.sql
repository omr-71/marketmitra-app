-- ============================================================
-- MARKET MITRA — ADMIN / ANALYTICS / FEATURE CONTROL DATABASE
-- ============================================================

-- ============================================================
-- 1. APP ROLES
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'app_role'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END
$$;


-- ============================================================
-- 2. USER ROLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid
    REFERENCES auth.users(id)
    ON DELETE CASCADE
    NOT NULL,

  role public.app_role NOT NULL,

  created_at timestamptz
    NOT NULL DEFAULT now(),

  UNIQUE (user_id, role)
);


GRANT SELECT
ON public.user_roles
TO authenticated;

GRANT ALL
ON public.user_roles
TO service_role;


ALTER TABLE public.user_roles
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. ADMIN ROLE CHECK FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;


-- ============================================================
-- 4. USER ROLE POLICY
-- ============================================================

DROP POLICY IF EXISTS
  "Users can view their own roles"
ON public.user_roles;


CREATE POLICY
  "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);


-- ============================================================
-- 5. ANALYTICS EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  event text NOT NULL,

  page text,

  label text,

  session_id text,

  device text,

  lang text,

  props jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz
    NOT NULL DEFAULT now()
);


-- Indexes

CREATE INDEX IF NOT EXISTS
  analytics_events_created_at_idx
ON public.analytics_events (created_at DESC);


CREATE INDEX IF NOT EXISTS
  analytics_events_event_idx
ON public.analytics_events (event);


-- Permissions

GRANT INSERT
ON public.analytics_events
TO anon, authenticated;


GRANT SELECT
ON public.analytics_events
TO authenticated;


GRANT ALL
ON public.analytics_events
TO service_role;


ALTER TABLE public.analytics_events
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 6. ANALYTICS POLICIES
-- ============================================================

DROP POLICY IF EXISTS
  "Anyone can record usage events"
ON public.analytics_events;


CREATE POLICY
  "Anyone can record usage events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);


DROP POLICY IF EXISTS
  "Only admins can read usage events"
ON public.analytics_events;


CREATE POLICY
  "Only admins can read usage events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);


-- ============================================================
-- 7. FEATURE FLAGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,

  label text NOT NULL,

  enabled boolean
    NOT NULL DEFAULT true,

  maintenance_message text,

  updated_at timestamptz
    NOT NULL DEFAULT now(),

  updated_by uuid
);


GRANT SELECT
ON public.feature_flags
TO anon, authenticated;


GRANT UPDATE
ON public.feature_flags
TO authenticated;


GRANT ALL
ON public.feature_flags
TO service_role;


ALTER TABLE public.feature_flags
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 8. FEATURE FLAG POLICIES
-- ============================================================

DROP POLICY IF EXISTS
  "Feature switches are publicly readable"
ON public.feature_flags;


CREATE POLICY
  "Feature switches are publicly readable"
ON public.feature_flags
FOR SELECT
TO anon, authenticated
USING (true);


DROP POLICY IF EXISTS
  "Only admins can change feature switches"
ON public.feature_flags;


CREATE POLICY
  "Only admins can change feature switches"
ON public.feature_flags
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);


-- ============================================================
-- 9. UPDATED_AT TRIGGER
-- ============================================================

-- This assumes public.set_updated_at() already exists
-- in your database.

DROP TRIGGER IF EXISTS
  feature_flags_set_updated_at
ON public.feature_flags;


CREATE TRIGGER
  feature_flags_set_updated_at
BEFORE UPDATE
ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 10. DEFAULT FEATURE FLAGS
-- ============================================================

INSERT INTO public.feature_flags
  (key, label)
VALUES
  ('market_prices', 'Market Prices'),
  ('weather', 'Weather'),
  ('diagnose', 'Crop Disease Identifier'),
  ('mitra_ai', 'Mitra AI'),
  ('schemes', 'Government Schemes'),
  ('profile', 'Farmer Profile'),
  ('predict', 'Price Prediction')
ON CONFLICT (key)
DO NOTHING;


-- ============================================================
-- 11. ADMIN AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id uuid NOT NULL,

  action text NOT NULL,

  detail jsonb
    NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz
    NOT NULL DEFAULT now()
);


GRANT SELECT
ON public.admin_audit_log
TO authenticated;


GRANT ALL
ON public.admin_audit_log
TO service_role;


ALTER TABLE public.admin_audit_log
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 12. ADMIN AUDIT LOG POLICY
-- ============================================================

DROP POLICY IF EXISTS
  "Only admins can read the audit log"
ON public.admin_audit_log;


CREATE POLICY
  "Only admins can read the audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
);


-- ============================================================
-- 13. ADMIN AUDIT INSERT POLICY
-- ============================================================
-- Allows authenticated users to create an audit entry only
-- for themselves. The application should only expose this
-- functionality to admins.

DROP POLICY IF EXISTS
  "Admins can create their own audit entries"
ON public.admin_audit_log;


CREATE POLICY
  "Admins can create their own audit entries"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  admin_id = auth.uid()
  AND public.has_role(auth.uid(), 'admin')
);


-- ============================================================
-- 14. ADMIN ROLE INSERT
-- ============================================================
-- DO NOT put the admin password here.
--
-- First create your admin account through:
--
-- Supabase
-- → Authentication
-- → Users
-- → Add user
--
-- Then copy that user's UUID and run:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR-SUPABASE-USER-UUID', 'admin');
--
-- ============================================================


-- ============================================================
-- 15. SECURITY CHECK
-- ============================================================

-- Admin permissions are determined by user_roles.
-- The password itself is handled by Supabase Auth.
--
-- NEVER store a plaintext password in this database script.
--
-- ============================================================
-- END OF MARKET MITRA ADMIN DATABASE SETUP
-- ============================================================