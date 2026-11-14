BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS voice_id text,
  ADD COLUMN IF NOT EXISTS voice_lang text,
  ADD COLUMN IF NOT EXISTS voice_provider text;

CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  lang text NOT NULL DEFAULT 'en',
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnosis_id uuid REFERENCES public.crop_diagnoses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.chat_conversations, public.chat_messages TO authenticated;
GRANT ALL
  ON public.chat_conversations, public.chat_messages TO service_role;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers manage their own conversations"
  ON public.chat_conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers manage their own chat messages"
  ON public.chat_messages FOR ALL TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE TRIGGER chat_conversations_set_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX chat_messages_conversation_created_idx
  ON public.chat_messages (conversation_id, created_at);
CREATE INDEX chat_conversations_user_updated_idx
  ON public.chat_conversations (user_id, updated_at DESC);

COMMIT;