import type { UIMessage } from "ai";

import { supabase } from "@/integrations/supabase/client";
import { generateThreadTitle } from "@/lib/chat.functions";

export type StoredRole = "user" | "assistant";

export type ChatThread = {
  id: string;
  messages: UIMessage[];
};

export type ChatSessionMeta = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

function textOf(message: UIMessage): string {
  return message.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();
}

/** Lists the farmer's chat sessions ordered by most recently updated. */
export async function listUserConversations(userId: string): Promise<ChatSessionMeta[]> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("id,title,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChatSessionMeta[];
}

/** Loads a specific conversation by ID with its messages in chronological order. */
export async function loadThread(conversationId: string, userId: string): Promise<ChatThread | null> {
  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
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

/** Deletes a chat conversation and its cascading messages. */
export async function deleteThread(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
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

/** Names a fresh conversation using Groq automatic 3-4 word title generation, with graceful fallback. */
export async function titleThread(conversationId: string, firstMessage: UIMessage): Promise<string> {
  const content = textOf(firstMessage);
  if (!content) return "New Chat";

  try {
    const result = await generateThreadTitle({
      data: {
        conversationId,
        messageText: content,
      },
    });
    if (result?.title) {
      return result.title;
    }
  } catch (err) {
    console.warn("Groq title generation failed, falling back to local word extraction:", err);
  }

  const fallback =
    content
      .replace(/[?!.,;:'"()]/g, "")
      .split(/\s+/)
      .slice(0, 4)
      .join(" ") || "New Chat";

  try {
    await supabase
      .from("chat_conversations")
      .update({ title: fallback } as never)
      .eq("id", conversationId)
      .is("title", null);
  } catch {
    // ignore
  }

  return fallback;
}
