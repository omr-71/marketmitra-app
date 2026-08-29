-- 1. Phone trust on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

CREATE OR REPLACE FUNCTION public.profiles_reset_phone_verification()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.phone IS DISTINCT FROM OLD.phone THEN
    IF NEW.phone_verified = OLD.phone_verified THEN
      NEW.phone_verified = false;
      NEW.phone_verified_at = NULL;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS profiles_reset_phone_verification ON public.profiles;
CREATE TRIGGER profiles_reset_phone_verification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_reset_phone_verification();

-- 2. Listings ("I HAVE")
CREATE TABLE public.link_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('machine','resource')),
  resource_type text NOT NULL,
  name text NOT NULL,
  description text,
  condition text,
  pricing_model text NOT NULL CHECK (pricing_model IN ('free','per_hour','per_day','per_acre','per_unit','fixed','negotiable')),
  price numeric(12,2) CHECK (price IS NULL OR price >= 0),
  negotiable boolean NOT NULL DEFAULT false,
  quantity integer CHECK (quantity IS NULL OR quantity > 0),
  unit text,
  service_area text,
  state text,
  district text,
  latitude double precision,
  longitude double precision,
  available_from timestamptz NOT NULL,
  available_to timestamptz NOT NULL,
  photos text[] NOT NULL DEFAULT '{}',
  terms text,
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','reserved','unavailable','needs_confirmation','expired','under_review')),
  last_confirmed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT link_listings_price_required
    CHECK (pricing_model IN ('free','negotiable') OR price IS NOT NULL),
  CONSTRAINT link_listings_window CHECK (available_to > available_from)
);

CREATE INDEX link_listings_match_idx
  ON public.link_listings (category, resource_type, status, available_from, available_to);
CREATE INDEX link_listings_area_idx ON public.link_listings (state, district);
CREATE INDEX link_listings_owner_idx ON public.link_listings (owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_listings TO authenticated;
GRANT ALL ON public.link_listings TO service_role;
ALTER TABLE public.link_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can browse active listings"
  ON public.link_listings FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR status IN ('available','reserved','needs_confirmation'));
CREATE POLICY "Owners can list their resource"
  ON public.link_listings FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their listing"
  ON public.link_listings FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can delete their listing"
  ON public.link_listings FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TRIGGER link_listings_set_updated_at
  BEFORE UPDATE ON public.link_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Requests ("I NEED")
CREATE TABLE public.link_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('machine','resource')),
  resource_type text NOT NULL,
  needed_date date NOT NULL,
  time_from text,
  time_to text,
  quantity integer CHECK (quantity IS NULL OR quantity > 0),
  note text,
  state text,
  district text,
  latitude double precision,
  longitude double precision,
  budget_mode text NOT NULL DEFAULT 'none'
    CHECK (budget_mode IN ('none','max','range','negotiable')),
  budget_min numeric(12,2) CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max numeric(12,2) CHECK (budget_max IS NULL OR budget_max >= 0),
  budget_unit text,
  status text NOT NULL DEFAULT 'searching'
    CHECK (status IN ('searching','match_found','provider_contacted','confirmed','in_progress','completed','cancelled','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX link_requests_match_idx
  ON public.link_requests (category, resource_type, needed_date, status);
CREATE INDEX link_requests_requester_idx ON public.link_requests (requester_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_requests TO authenticated;
GRANT ALL ON public.link_requests TO service_role;
ALTER TABLE public.link_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can read their own requests"
  ON public.link_requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid());
CREATE POLICY "Farmers can create their own requests"
  ON public.link_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Farmers can update their own requests"
  ON public.link_requests FOR UPDATE TO authenticated
  USING (requester_id = auth.uid()) WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Farmers can delete their own requests"
  ON public.link_requests FOR DELETE TO authenticated
  USING (requester_id = auth.uid());

CREATE TRIGGER link_requests_set_updated_at
  BEFORE UPDATE ON public.link_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Matches
CREATE TABLE public.link_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.link_requests(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.link_listings(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','accepted','rejected','scheduled','in_progress','completed','cancelled')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, listing_id)
);

CREATE INDEX link_matches_provider_idx ON public.link_matches (provider_id, status);
CREATE INDEX link_matches_requester_idx ON public.link_matches (requester_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_matches TO authenticated;
GRANT ALL ON public.link_matches TO service_role;
ALTER TABLE public.link_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read their matches"
  ON public.link_matches FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR provider_id = auth.uid());
CREATE POLICY "Requesters can create a match request"
  ON public.link_matches FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Participants can update their match"
  ON public.link_matches FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR provider_id = auth.uid())
  WITH CHECK (requester_id = auth.uid() OR provider_id = auth.uid());

CREATE TRIGGER link_matches_set_updated_at
  BEFORE UPDATE ON public.link_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Providers must be able to read the request behind a match
CREATE POLICY "Providers can read matched requests"
  ON public.link_requests FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.link_matches m
    WHERE m.request_id = public.link_requests.id AND m.provider_id = auth.uid()
  ));

-- 5. Machine clusters
CREATE TABLE public.link_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  district text,
  state text,
  window_date date NOT NULL,
  listing_id uuid REFERENCES public.link_listings(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','match_found','provider_contacted','provider_accepted','scheduled','in_progress','completed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.link_cluster_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id uuid NOT NULL REFERENCES public.link_clusters(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.link_requests(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estimated_hours numeric(8,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cluster_id, request_id)
);

CREATE INDEX link_cluster_members_cluster_idx ON public.link_cluster_members (cluster_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_clusters TO authenticated;
GRANT ALL ON public.link_clusters TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_cluster_members TO authenticated;
GRANT ALL ON public.link_cluster_members TO service_role;
ALTER TABLE public.link_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_cluster_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read their cluster"
  ON public.link_clusters FOR SELECT TO authenticated
  USING (
    provider_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.link_cluster_members cm
      WHERE cm.cluster_id = public.link_clusters.id AND cm.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Members can read their own cluster membership"
  ON public.link_cluster_members FOR SELECT TO authenticated
  USING (
    farmer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.link_clusters c
      WHERE c.id = public.link_cluster_members.cluster_id AND c.provider_id = auth.uid()
    )
  );

CREATE TRIGGER link_clusters_set_updated_at
  BEFORE UPDATE ON public.link_clusters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Verified provider contact: only for an accepted match
CREATE OR REPLACE FUNCTION public.link_provider_contact(_match_id uuid)
RETURNS TABLE (full_name text, phone text, phone_verified boolean, phone_verified_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.full_name, CASE WHEN p.phone_verified THEN p.phone ELSE NULL END,
         p.phone_verified, p.phone_verified_at
  FROM public.link_matches m
  JOIN public.profiles p ON p.id = m.provider_id
  WHERE m.id = _match_id
    AND m.status IN ('accepted','scheduled','in_progress','completed')
    AND (m.requester_id = auth.uid() OR m.provider_id = auth.uid())
$$;