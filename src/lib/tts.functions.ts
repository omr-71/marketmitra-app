import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MITRA_VOICES, MOOD_SETTINGS, type VoiceMood } from "./voices";

const schema = z.object({
  text: z.string().trim().min(1).max(1200),
  /** Mitra voice identity chosen in Settings. */
  voiceId: z.string().trim().min(1),
  mood: z
    .enum(["friendly", "informative", "concerned", "reassuring", "happy"])
    .default("informative"),
  /** Farmer speed preference (0.7–1.4). */
  speed: z.number().min(0.7).max(1.4).default(1),
});

export type MitraSpeech = { audio: string; mime: string; voiceId: string };

/**
 * Speaks a Mitra answer with the farmer's chosen voice through the configured
 * speech provider. Never silently substitutes another voice: if the selected
 * voice cannot be used, the caller gets an error and can say so honestly.
 */
export const synthesizeMitraSpeech = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<MitraSpeech> => {
    const voice = MITRA_VOICES.find((v) => v.id === data.voiceId);
    if (!voice) throw new Error("That voice is not available. Please pick another voice.");

    const key = process.env["ELEVENLABS_API_KEY"];
    if (!key) throw new Error("Spoken answers are not configured right now.");

    const mood = MOOD_SETTINGS[data.mood as VoiceMood];
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.providerId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({
          text: data.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: mood.stability,
            similarity_boost: mood.similarity_boost,
            style: mood.style,
            speed: Math.max(0.7, Math.min(1.2, mood.speed * data.speed)),
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Mitra speech provider failed", response.status, detail.slice(0, 300));
      if (response.status === 401 || response.status === 403) {
        throw new Error("Spoken answers are not available right now.");
      }
      if (response.status === 429) {
        throw new Error("Too many voice requests just now. Please try again in a moment.");
      }
      throw new Error("Mitra could not speak that answer. Please try again.");
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
    return { audio: btoa(binary), mime: "audio/mpeg", voiceId: voice.id };
  });
