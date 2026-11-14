CREATE OR REPLACE FUNCTION public.register_native_fcm_device(p_fcm_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_device_id TEXT;
  v_device_row UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required';
  END IF;

  IF p_fcm_token IS NULL OR length(p_fcm_token) < 20 OR length(p_fcm_token) > 4096 THEN
    RAISE EXCEPTION 'invalid_fcm_token';
  END IF;

  v_device_id := 'fcm:' || v_user_id::text || ':' || right(p_fcm_token, 12);

  INSERT INTO public.notification_devices (
    device_id,
    endpoint,
    fcm_token,
    provider,
    user_id,
    lang,
    disabled,
    last_seen_at
  ) VALUES (
    v_device_id,
    'fcm:' || p_fcm_token,
    p_fcm_token,
    'fcm',
    v_user_id,
    'en',
    false,
    now()
  )
  ON CONFLICT (fcm_token)
  WHERE fcm_token IS NOT NULL
  DO UPDATE SET
    device_id = EXCLUDED.device_id,
    endpoint = EXCLUDED.endpoint,
    provider = EXCLUDED.provider,
    user_id = EXCLUDED.user_id,
    disabled = false,
    last_seen_at = now()
  WHERE notification_devices.user_id = v_user_id
  RETURNING id INTO v_device_row;

  IF v_device_row IS NULL THEN
    SELECT id INTO v_device_row
    FROM public.notification_devices
    WHERE fcm_token = p_fcm_token AND user_id = v_user_id AND provider = 'fcm';
  END IF;

  IF v_device_row IS NULL THEN
    RAISE EXCEPTION 'device_token_owned_by_another_user';
  END IF;

  RETURN v_device_row;
END;
$$;

REVOKE ALL ON FUNCTION public.register_native_fcm_device(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_native_fcm_device(TEXT) TO authenticated;
