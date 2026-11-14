CREATE POLICY "Chat messages belong to the conversation owner"
  ON public.chat_messages
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.chat_conversations AS conversation
      WHERE conversation.id = conversation_id
        AND conversation.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.chat_conversations AS conversation
      WHERE conversation.id = conversation_id
        AND conversation.user_id = auth.uid()
    )
  );
