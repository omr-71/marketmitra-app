CREATE TABLE public.market_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity text NOT NULL,
  variety text,
  state text NOT NULL,
  district text NOT NULL,
  market text NOT NULL,
  min_price numeric NOT NULL,
  max_price numeric NOT NULL,
  modal_price numeric NOT NULL,
  arrival_date date NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (commodity, state, district, market, variety, arrival_date)
);

CREATE INDEX market_prices_lookup_idx ON public.market_prices (commodity, state, district, arrival_date DESC);

GRANT SELECT ON public.market_prices TO anon;
GRANT SELECT ON public.market_prices TO authenticated;
GRANT ALL ON public.market_prices TO service_role;

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market prices are publicly readable"
  ON public.market_prices FOR SELECT TO anon, authenticated USING (true);