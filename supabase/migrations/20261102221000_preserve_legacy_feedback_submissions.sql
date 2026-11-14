ALTER TABLE public.user_feedback
  DROP CONSTRAINT user_feedback_category_check,
  ADD CONSTRAINT user_feedback_category_check
    CHECK (category IN (
      'feedback',
      'bug_report',
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
    ));

GRANT INSERT (status) ON public.user_feedback TO authenticated;

CREATE OR REPLACE FUNCTION public.set_user_feedback_type_from_legacy_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.category = 'bug_report' THEN
    NEW.feedback_type := 'report_problem';
  ELSIF NEW.category = 'feedback' THEN
    NEW.feedback_type := 'share_feedback';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_feedback_type_from_legacy_category()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_feedback_type_from_legacy_category()
  TO authenticated, service_role;

DROP TRIGGER IF EXISTS user_feedback_legacy_type
  ON public.user_feedback;
CREATE TRIGGER user_feedback_legacy_type
  BEFORE INSERT ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_feedback_type_from_legacy_category();
