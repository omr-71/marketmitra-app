REVOKE EXECUTE ON FUNCTION public.link_provider_contact(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.link_provider_contact(uuid) TO authenticated;