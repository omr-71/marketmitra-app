import type { UIMessage } from "ai";

import { supabase } from "@/integrations/supabase/client";

export type StoredRole = "user" | "assistant";

export type ChatThread = {
  id: string;
  messages: UIMessage[];
};

function textOf(message: UIMessage): string {
  return message.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();
}

/** Loads the farmer's most recent conversation with its messages in order. */
export async function loadLatestThread(userId: string): Promise<ChatThread | null> {
  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!conversation) return null;

  const { data: rows, error: messageError } = await supabase
    .from("chat_messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(200);
  if (messageError) throw new Error(messageError.message);

  return {
    id: conversation.id,
    messages: (rows ?? [])
      .filter((r) => r.role === "user" || r.role === "assistant")
      .map((r) => ({
        id: r.id,
        role: r.role as StoredRole,
        parts: [{ type: "text" as const, text: r.content }],
      })),
  };
}

/** Creates a new conversation for the farmer and returns its id. */
export async function createThread(userId: string, lang: string, title?: string) {
  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({ user_id: userId, lang, title: title?.slice(0, 80) ?? null } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Saves one message. The database is the source of truth for chat history. */
export async function saveMessage(input: {
  conversationId: string;
  userId: string;
  role: StoredRole;
  message: UIMessage;
  diagnosisId?: string | null;
}) {
  const content = textOf(input.message);
  if (!content) return;
  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: input.conversationId,
    user_id: input.userId,
    role: input.role,
    content,
    diagnosis_id: input.diagnosisId ?? null,
    metadata: { client_message_id: input.message.id },
  } as never);
  if (error) throw new Error(error.message);

  await supabase
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() } as never)
    .eq("id", input.conversationId);
}

/** Names a fresh conversation after the farmer's first question. */
export async function titleThread(conversationId: string, firstMessage: UIMessage) {
  const title = textOf(firstMessage).slice(0, 80);
  if (!title) return;
  await supabase
    .from("chat_conversations")
    .update({ title } as never)
    .eq("id", conversationId)
    .is("title", null);
}
