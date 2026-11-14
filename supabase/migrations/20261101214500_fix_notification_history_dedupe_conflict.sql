DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.notification_history
    WHERE dedupe_key IS NOT NULL
    GROUP BY user_id, dedupe_key
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'notification_history dedupe index cannot be created: duplicate non-null user_id/dedupe_key rows exist';
  END IF;
END
$$;

DROP INDEX IF EXISTS public.notification_history_user_dedupe_unique;

CREATE UNIQUE INDEX notification_history_user_dedupe_unique
  ON public.notification_history (user_id, dedupe_key);
