CREATE TABLE IF NOT EXISTS public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('feedback', 'bug_report')),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 160),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_feedback_created_idx
  ON public.user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS user_feedback_status_idx
  ON public.user_feedback(status, created_at DESC);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_feedback FROM anon;
REVOKE ALL ON public.user_feedback FROM authenticated;
GRANT INSERT ON public.user_feedback TO authenticated;
GRANT SELECT ON public.user_feedback TO service_role;
GRANT UPDATE ON public.user_feedback TO service_role;

CREATE POLICY "Users submit their own feedback"
  ON public.user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
