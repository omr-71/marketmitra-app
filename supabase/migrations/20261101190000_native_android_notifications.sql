CREATE TABLE IF NOT EXISTS public.notification_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  lang TEXT NOT NULL DEFAULT 'en',
  state TEXT,
  district TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  crops TEXT[] NOT NULL DEFAULT '{}',
  prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  app_version TEXT,
  disabled BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_devices
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'web_push',
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS notification_devices_fcm_token_unique
  ON public.notification_devices (fcm_token)
  WHERE fcm_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  market_updates BOOLEAN NOT NULL DEFAULT true,
  weather_alerts BOOLEAN NOT NULL DEFAULT true,
  government_schemes BOOLEAN NOT NULL DEFAULT true,
  app_updates BOOLEAN NOT NULL DEFAULT true,
  sound TEXT NOT NULL DEFAULT 'signature' CHECK (sound IN ('signature', 'soft', 'silent')),
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_from TIME NOT NULL DEFAULT '22:00',
  quiet_to TIME NOT NULL DEFAULT '06:00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('market', 'weather', 'scheme', 'updates', 'general')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '/notifications',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notification_history_user_dedupe_unique
  ON public.notification_history (user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS notification_history_user_created_idx
  ON public.notification_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notification_history_user_unread_idx
  ON public.notification_history (user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notification_history(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.notification_devices(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'fcm',
  status TEXT NOT NULL,
  provider_message_id TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their notification devices" ON public.notification_devices;
CREATE POLICY "Users manage their notification devices"
  ON public.notification_devices FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage their notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their notification history" ON public.notification_history;
CREATE POLICY "Users manage their notification history"
  ON public.notification_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their delivery attempts" ON public.notification_delivery_attempts;
CREATE POLICY "Users can read their delivery attempts"
  ON public.notification_delivery_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notification_history
      WHERE notification_history.id = notification_delivery_attempts.notification_id
        AND notification_history.user_id = auth.uid()
    )
  );
