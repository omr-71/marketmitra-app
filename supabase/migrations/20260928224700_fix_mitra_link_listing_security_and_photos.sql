ALTER TABLE public.link_listings
  DROP CONSTRAINT IF EXISTS link_listings_status_check;

UPDATE public.link_listings
SET status = CASE status
  WHEN 'active' THEN 'available'
  WHEN 'paused' THEN 'unavailable'
  ELSE status
END
WHERE status IN ('active', 'paused');

ALTER TABLE public.link_listings
  ADD CONSTRAINT link_listings_status_check
  CHECK (status IN (
    'available',
    'reserved',
    'unavailable',
    'needs_confirmation',
    'expired',
    'under_review',
    'removed'
  ));

REVOKE SELECT ON public.link_listings FROM PUBLIC, anon, authenticated;
REVOKE SELECT (
  owner_id,
  latitude,
  longitude,
  photos,
  terms,
  last_confirmed_at,
  updated_at
) ON public.link_listings FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id,
  category,
  resource_type,
  name,
  description,
  condition,
  pricing_model,
  price,
  negotiable,
  quantity,
  unit,
  service_area,
  state,
  district,
  available_from,
  available_to,
  status,
  created_at
) ON public.link_listings TO authenticated;

CREATE OR REPLACE FUNCTION public.link_is_verified_provider(_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id::text = _user_id
      AND p.phone_verified IS TRUE
      AND (
        auth.role() = 'service_role'
        OR auth.uid() = p.id
        OR EXISTS (
          SELECT 1
          FROM public.link_listings AS l
          WHERE l.owner_id = p.id
            AND l.status IN ('available', 'reserved', 'needs_confirmation')
        )
      )
  )
$$;

REVOKE ALL ON FUNCTION public.link_is_verified_provider(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_is_verified_provider(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.link_verified_provider_profiles(_user_ids uuid[])
RETURNS TABLE (id uuid, full_name text, phone_verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, p.full_name, p.phone_verified
  FROM public.profiles AS p
  WHERE p.id = ANY(_user_ids)
    AND p.phone_verified IS TRUE
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.link_listings AS l
      WHERE l.owner_id = p.id
        AND l.status IN ('available', 'reserved', 'needs_confirmation')
    )
$$;

REVOKE ALL ON FUNCTION public.link_verified_provider_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_verified_provider_profiles(uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.link_require_verified_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _photo_path text;
BEGIN
  IF NEW.status IN ('available', 'reserved', 'needs_confirmation')
    AND NOT public.link_is_verified_provider(NEW.owner_id::text)
  THEN
    RAISE EXCEPTION 'Verify your mobile number before sharing a machine or resource.'
      USING ERRCODE = '42501';
  END IF;

  FOREACH _photo_path IN ARRAY COALESCE(NEW.photos, ARRAY[]::text[])
  LOOP
    IF split_part(_photo_path, '/', 1) <> NEW.owner_id::text
      OR split_part(_photo_path, '/', 2) = ''
      OR position('/' IN substring(_photo_path FROM length(NEW.owner_id::text) + 2)) > 0
      OR NOT EXISTS (
        SELECT 1
        FROM storage.objects AS object
        WHERE object.bucket_id = 'link-photos'
          AND object.name = _photo_path
      )
    THEN
      RAISE EXCEPTION 'Each listing photo must be an uploaded photo owned by the listing owner.'
        USING ERRCODE = '42501';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_listings_require_verified_provider ON public.link_listings;
CREATE TRIGGER link_listings_require_verified_provider
  BEFORE INSERT OR UPDATE OF owner_id, status, photos ON public.link_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.link_require_verified_listing();

DROP POLICY IF EXISTS "Farmers can browse active listings" ON public.link_listings;
DROP POLICY IF EXISTS "Farmers can browse verified provider listings" ON public.link_listings;
CREATE POLICY "Farmers can browse verified provider listings"
  ON public.link_listings FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR (
      status IN ('available', 'reserved', 'needs_confirmation')
      AND public.link_is_verified_provider(owner_id::text)
    )
  );

DROP POLICY IF EXISTS "Owners can list their resource" ON public.link_listings;
DROP POLICY IF EXISTS "Verified farmers can list their resource" ON public.link_listings;
CREATE POLICY "Verified farmers can list their resource"
  ON public.link_listings FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND public.link_is_verified_provider(owner_id::text)
  );

DROP POLICY IF EXISTS "Owners can update their listing" ON public.link_listings;
CREATE POLICY "Owners can update their listing"
  ON public.link_listings FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (
    owner_id = auth.uid()
    AND (
      status NOT IN ('available', 'reserved', 'needs_confirmation')
      OR public.link_is_verified_provider(owner_id::text)
    )
  );

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'link-photos',
  'link-photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Signed-in farmers can view link photos" ON storage.objects;
DROP POLICY IF EXISTS "Verified farmers can view link photos" ON storage.objects;
DROP POLICY IF EXISTS "Owners can view their link photos" ON storage.objects;
CREATE POLICY "Owners can view their link photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'link-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners can upload their link photos" ON storage.objects;
CREATE POLICY "Owners can upload their link photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'link-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners can update their link photos" ON storage.objects;
CREATE POLICY "Owners can update their link photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'link-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'link-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Owners can delete their link photos" ON storage.objects;
CREATE POLICY "Owners can delete their link photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'link-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Requesters can create a match request" ON public.link_matches;
CREATE OR REPLACE FUNCTION public.link_can_create_match(
  _request_id uuid,
  _listing_id uuid,
  _provider_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.link_requests AS r
      WHERE r.id = _request_id
        AND r.requester_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.link_listings AS l
      WHERE l.id = _listing_id
        AND l.owner_id = _provider_id
        AND l.status IN ('available', 'reserved', 'needs_confirmation')
        AND public.link_is_verified_provider(l.owner_id::text)
    )
$$;

REVOKE ALL ON FUNCTION public.link_can_create_match(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_can_create_match(uuid, uuid, uuid) TO authenticated;

CREATE POLICY "Requesters can create a match request"
  ON public.link_matches FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND requester_id <> provider_id
    AND public.link_can_create_match(request_id, listing_id, provider_id)
  );

CREATE OR REPLACE FUNCTION public.link_cluster_opportunities(
  _state text DEFAULT NULL,
  _district text DEFAULT NULL
)
RETURNS TABLE (
  resource_type text,
  district text,
  state text,
  window_date date,
  farmer_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.resource_type,
         r.district,
         r.state,
         r.needed_date AS window_date,
         COUNT(DISTINCT r.requester_id)::int AS farmer_count
  FROM public.link_requests AS r
  WHERE r.category = 'machine'
    AND r.status IN ('searching', 'match_found', 'provider_contacted')
    AND r.needed_date >= (now() AT TIME ZONE 'Asia/Kolkata')::date
    AND (_state IS NULL OR r.state = _state)
    AND (_district IS NULL OR r.district = _district)
    AND EXISTS (
      SELECT 1
      FROM public.link_listings AS l
      WHERE l.category = 'machine'
        AND l.resource_type = r.resource_type
        AND l.status IN ('available', 'reserved', 'needs_confirmation')
        AND (l.available_from AT TIME ZONE 'Asia/Kolkata')::date <= r.needed_date
        AND (l.available_to AT TIME ZONE 'Asia/Kolkata')::date >= r.needed_date
        AND public.link_is_verified_provider(l.owner_id::text)
    )
  GROUP BY r.resource_type, r.district, r.state, r.needed_date
  HAVING COUNT(DISTINCT r.requester_id) >= 2
  ORDER BY COUNT(DISTINCT r.requester_id) DESC, r.needed_date ASC
  LIMIT 20
$$;

REVOKE ALL ON FUNCTION public.link_cluster_opportunities(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_cluster_opportunities(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_cluster_opportunities(text, text) TO service_role;

NOTIFY pgrst, 'reload schema';
