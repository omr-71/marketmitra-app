ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS daily_summary_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crop_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS weather_intelligence_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS summary_time TEXT NOT NULL DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS price_threshold_percent INTEGER NOT NULL DEFAULT 10
    CHECK (price_threshold_percent BETWEEN 1 AND 100),
  ADD COLUMN IF NOT EXISTS selected_crops TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_state TEXT,
  ADD COLUMN IF NOT EXISTS preferred_district TEXT,
  ADD COLUMN IF NOT EXISTS preferred_market TEXT,
  ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS quiet_from TEXT NOT NULL DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS quiet_to TEXT NOT NULL DEFAULT '06:00';

CREATE TABLE IF NOT EXISTS public.notification_intelligence_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  users_evaluated INTEGER NOT NULL DEFAULT 0,
  alerts_generated INTEGER NOT NULL DEFAULT 0,
  notifications_accepted INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  provider_freshness JSONB NOT NULL DEFAULT '{}'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT
);

CREATE TABLE IF NOT EXISTS public.notification_intelligence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_key TEXT NOT NULL,
  observation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_type, event_key)
);

ALTER TABLE public.notification_intelligence_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_intelligence_events ENABLE ROW LEVEL SECURITY;
