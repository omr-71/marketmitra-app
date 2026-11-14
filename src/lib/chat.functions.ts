import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const titleInputSchema = z.object({
  conversationId: z.string().uuid(),
  messageText: z.string().min(1).max(2000),
});

/**
 * Generates a concise 3-4 word title for a new chat session using Groq,
 * and saves it into the chat_conversations table for the authenticated user.
 */
export const generateThreadTitle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => titleInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ title: string }> => {
    let generatedTitle = "";
    const apiKey = process.env["GROQ_API_KEY"];

    if (apiKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [
              {
                role: "system",
                content:
                  "You generate short titles for conversations. Output ONLY a concise 3 to 4 word title for this farming conversation. No punctuation, no quotes, no markdown, no emojis.",
              },
              {
                role: "user",
                content: data.messageText,
              },
            ],
            temperature: 0.3,
            max_tokens: 30,
          }),
        });

        if (response.ok) {
          const json = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const raw = json.choices?.[0]?.message?.content?.trim() || "";
          const cleaned = raw.replace(/["'*_#`]/g, "").trim();
          if (cleaned) {
            const words = cleaned.split(/\s+/).slice(0, 4).join(" ");
            if (words.length >= 2) {
              generatedTitle = words;
            }
          }
        }
      } catch (err) {
        console.warn("Groq title generation failed, falling back to word extraction:", err);
      }
    }

    // Fallback: extract 3-4 words from the user message
    if (!generatedTitle) {
      const words = data.messageText
        .trim()
        .replace(/[?!.,;:'"()]/g, "")
        .split(/\s+/)
        .slice(0, 4)
        .join(" ");
      generatedTitle = words || "New Chat";
    }

    // Persist to database
    try {
      await context.supabase
        .from("chat_conversations")
        .update({ title: generatedTitle } as never)
        .eq("id", data.conversationId)
        .eq("user_id", context.userId);
    } catch (saveErr) {
      console.error("Failed to update thread title in database", saveErr);
    }

    return { title: generatedTitle };
  });
