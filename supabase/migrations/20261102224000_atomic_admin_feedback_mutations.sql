CREATE OR REPLACE FUNCTION public.admin_update_user_feedback(
  _feedback_id uuid,
  _admin_id uuid,
  _operation text,
  _status text DEFAULT NULL,
  _admin_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected_rows integer;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF NOT public.has_role(_admin_id, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _operation = 'status' THEN
    IF _status IS NULL
      OR _status NOT IN ('new', 'in_review', 'resolved', 'rejected')
      OR _admin_notes IS NOT NULL
    THEN
      RAISE EXCEPTION 'Invalid feedback status update';
    END IF;

    UPDATE public.user_feedback
    SET status = _status, updated_at = now()
    WHERE id = _feedback_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
      RAISE EXCEPTION 'Feedback not found';
    END IF;

    INSERT INTO public.admin_audit_log (admin_id, action, detail)
    VALUES (
      _admin_id,
      'feedback_status_updated',
      jsonb_build_object('feedbackId', _feedback_id, 'status', _status)
    );
  ELSIF _operation = 'notes' THEN
    IF _status IS NOT NULL
      OR char_length(btrim(COALESCE(_admin_notes, ''))) > 4000
    THEN
      RAISE EXCEPTION 'Invalid feedback notes update';
    END IF;

    UPDATE public.user_feedback
    SET admin_notes = NULLIF(btrim(_admin_notes), ''), updated_at = now()
    WHERE id = _feedback_id;

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows = 0 THEN
      RAISE EXCEPTION 'Feedback not found';
    END IF;

    INSERT INTO public.admin_audit_log (admin_id, action, detail)
    VALUES (
      _admin_id,
      'feedback_notes_updated',
      jsonb_build_object('feedbackId', _feedback_id)
    );
  ELSE
    RAISE EXCEPTION 'Invalid feedback mutation';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_user_feedback(uuid, uuid, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_feedback(uuid, uuid, text, text, text)
  TO service_role;
