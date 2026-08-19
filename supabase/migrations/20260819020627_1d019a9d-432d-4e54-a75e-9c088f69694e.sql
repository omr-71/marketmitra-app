-- daily voice credit usage per device
CREATE TABLE public.voice_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Kolkata')::date,
  used INTEGER NOT NULL DEFAULT 0,
  characters INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (device_id, usage_date)
);
GRANT ALL ON public.voice_usage TO service_role;
ALTER TABLE public.voice_usage ENABLE ROW LEVEL SECURITY;

-- push registrations + per-category preferences
CREATE TABLE public.notification_devices (
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
CREATE INDEX notification_devices_endpoint_idx ON public.notification_devices (endpoint);
GRANT ALL ON public.notification_devices TO service_role;
ALTER TABLE public.notification_devices ENABLE ROW LEVEL SECURITY;

-- queued notifications the service worker picks up
CREATE TABLE public.notification_outbox (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '/home',
  tag TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notification_outbox_pending_idx ON public.notification_outbox (device_id, delivered_at);
GRANT ALL ON public.notification_outbox TO service_role;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

-- dedupe log
CREATE TABLE public.notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (device_id, dedupe_key)
);
GRANT ALL ON public.notification_log TO service_role;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- admin editable configuration
CREATE TABLE public.app_config (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_config (key, value) VALUES
  ('voice_credits', '{"daily_limit": 30, "max_chars": 900}'::jsonb),
  ('app_version', '{"version": "2.4.0", "title": "Market Mitra updated", "body": "Mitra now speaks with natural voices and can alert you about market and weather changes.", "url": "/settings"}'::jsonb);