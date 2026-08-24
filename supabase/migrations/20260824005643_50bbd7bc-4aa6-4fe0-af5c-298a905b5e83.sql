CREATE TABLE public.api_fetch_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  ok BOOLEAN NOT NULL,
  status_code INTEGER,
  record_count INTEGER NOT NULL DEFAULT 0,
  latest_data_date DATE,
  duration_ms INTEGER,
  commodity TEXT,
  state TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.api_fetch_logs TO authenticated;
GRANT ALL ON public.api_fetch_logs TO service_role;

ALTER TABLE public.api_fetch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read api fetch logs"
ON public.api_fetch_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX api_fetch_logs_provider_created_idx ON public.api_fetch_logs (provider, created_at DESC);