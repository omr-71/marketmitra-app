ALTER TABLE public.user_feedback
  ADD COLUMN IF NOT EXISTS feedback_type text,
  ADD COLUMN IF NOT EXISTS custom_category text,
  ADD COLUMN IF NOT EXISTS page_context text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.user_feedback
  DROP CONSTRAINT IF EXISTS user_feedback_category_check,
  DROP CONSTRAINT IF EXISTS user_feedback_status_check;

UPDATE public.user_feedback
SET
  feedback_type = CASE
    WHEN category = 'bug_report' THEN 'report_problem'
    ELSE 'share_feedback'
  END,
  category = CASE
    WHEN category = 'bug_report' THEN 'Bug Report'
    ELSE 'General Suggestion'
  END;

ALTER TABLE public.user_feedback
  ALTER COLUMN feedback_type SET DEFAULT 'share_feedback',
  ALTER COLUMN feedback_type SET NOT NULL,
  ADD CONSTRAINT user_feedback_feedback_type_check
    CHECK (feedback_type IN ('share_feedback', 'report_problem')),
  ADD CONSTRAINT user_feedback_category_check
    CHECK (category IN (
      'Bug Report',
      'Feature Request',
      'General Suggestion',
      'Incorrect Market Prices',
      'Weather Information Issue',
      'Crop Diagnosis Issue',
      'Location or Data Issue',
      'Account or Login Issue',
      'Other',
      'Custom Category'
    )),
  ADD CONSTRAINT user_feedback_custom_category_check
    CHECK (
      (
        category = 'Custom Category'
        AND custom_category IS NOT NULL
        AND char_length(btrim(custom_category)) BETWEEN 1 AND 80
      )
      OR (category <> 'Custom Category' AND custom_category IS NULL)
    ),
  ADD CONSTRAINT user_feedback_page_context_check
    CHECK (page_context IS NULL OR char_length(page_context) <= 160),
  ADD CONSTRAINT user_feedback_admin_notes_check
    CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 4000),
  ADD CONSTRAINT user_feedback_status_check
    CHECK (status IN ('new', 'in_review', 'resolved', 'rejected'));

REVOKE INSERT ON public.user_feedback FROM authenticated;
GRANT INSERT (
  user_id,
  feedback_type,
  category,
  custom_category,
  subject,
  message,
  page_context
) ON public.user_feedback TO authenticated;

DROP POLICY IF EXISTS "Users submit their own feedback"
  ON public.user_feedback;
CREATE POLICY "Users submit their own feedback"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'new'
    AND admin_notes IS NULL
  );

CREATE OR REPLACE FUNCTION public.admin_list_user_feedback(
  _search text DEFAULT '',
  _feedback_type text DEFAULT NULL,
  _category text DEFAULT NULL,
  _status text DEFAULT NULL,
  _page integer DEFAULT 1,
  _page_size integer DEFAULT 25
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  user_full_name text,
  user_location text,
  feedback_type text,
  category text,
  custom_category text,
  subject text,
  message text,
  page_context text,
  status text,
  admin_notes text,
  created_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _page < 1 OR _page_size < 1 OR _page_size > 50 THEN
    RAISE EXCEPTION 'Invalid pagination';
  END IF;

  RETURN QUERY
  SELECT
    f.id,
    f.user_id,
    u.email::text,
    COALESCE(p.full_name, ''),
    NULLIF(concat_ws(', ', p.village, p.district, p.state), ''),
    f.feedback_type,
    f.category,
    f.custom_category,
    f.subject,
    f.message,
    f.page_context,
    f.status,
    f.admin_notes,
    f.created_at,
    count(*) OVER ()
  FROM public.user_feedback AS f
  LEFT JOIN auth.users AS u ON u.id = f.user_id
  LEFT JOIN public.profiles AS p ON p.id = f.user_id
  WHERE
    (COALESCE(_feedback_type, '') = '' OR f.feedback_type = _feedback_type)
    AND (COALESCE(_category, '') = '' OR f.category = _category)
    AND (COALESCE(_status, '') = '' OR f.status = _status)
    AND (
      COALESCE(_search, '') = ''
      OR f.subject ILIKE '%' || _search || '%'
      OR f.id::text ILIKE '%' || _search || '%'
      OR COALESCE(p.full_name, '') ILIKE '%' || _search || '%'
      OR COALESCE(u.email, '') ILIKE '%' || _search || '%'
    )
  ORDER BY f.created_at DESC
  LIMIT _page_size
  OFFSET ((_page - 1) * _page_size);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_user_feedback(text, text, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_user_feedback(text, text, text, text, integer, integer)
  TO service_role;
