DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.notification_delivery_attempts
    WHERE status = 'pending'
    GROUP BY notification_id, provider, device_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'notification delivery retry claim index cannot be created: duplicate pending attempts exist';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS notification_delivery_attempts_one_pending_per_device_idx
  ON public.notification_delivery_attempts (notification_id, provider, device_id)
  WHERE status = 'pending';
