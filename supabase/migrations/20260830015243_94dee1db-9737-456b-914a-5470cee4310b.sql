CREATE OR REPLACE FUNCTION public.link_cluster_opportunities(_state text DEFAULT NULL, _district text DEFAULT NULL)
RETURNS TABLE(resource_type text, district text, state text, window_date date, farmer_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.resource_type,
         r.district,
         r.state,
         r.needed_date AS window_date,
         COUNT(DISTINCT r.requester_id)::int AS farmer_count
  FROM public.link_requests r
  WHERE r.category = 'machine'
    AND r.status IN ('searching','match_found','provider_contacted')
    AND r.needed_date >= (now() AT TIME ZONE 'Asia/Kolkata')::date
    AND (_state IS NULL OR r.state = _state)
    AND (_district IS NULL OR r.district = _district)
  GROUP BY r.resource_type, r.district, r.state, r.needed_date
  HAVING COUNT(DISTINCT r.requester_id) >= 2
  ORDER BY COUNT(DISTINCT r.requester_id) DESC, r.needed_date ASC
  LIMIT 20
$$;

REVOKE ALL ON FUNCTION public.link_cluster_opportunities(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_cluster_opportunities(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_cluster_opportunities(text, text) TO service_role;