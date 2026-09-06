import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Lang } from "./crops";
import { synthesizeMitraSpeech } from "./tts.functions";
import { detectMood, findVoice } from "./voices";

export type MitraSpeechPrefs = {
  /** Mitra voice identity saved on the farmer's profile. */
  voiceId: string;
  /** Farmer speed preference. */
  speed: number;
  volume: number;
  /** Allow mood-matched delivery. */
  expressive: boolean;
};

/**
 * Speaks Mitra answers with the exact voice the farmer selected, using the
 * configured speech provider. Failures surface as a message — the app never
 * pretends the chosen voice was used when it was not.
 */
export function useMitraSpeech(prefs: MitraSpeechPrefs, lang: Lang) {
  const synth = useServerFn(synthesizeMitraSpeech);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef(0);

  const stop = useCallback(() => {
    requestRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    }
    setSpeaking(false);
    setLoading(false);
  }, []);

  useEffect(() => stop, [stop]);

  const speak = useCallback(
    async (text: string) => {
      const clean = text.replace(/[*_#`>]/g, "").trim();
      if (!clean) return;
      stop();
      const token = requestRef.current;
      setError(null);
      setLoading(true);
      try {
        const voice = findVoice(prefs.voiceId);
        const result = await synth({
          data: {
            text: clean.slice(0, 1200),
            voiceId: voice.id,
            mood: prefs.expressive ? detectMood(clean) : "informative",
            speed: prefs.speed,
            lang,
          },
        });
        if (token !== requestRef.current) return;
        const audio = new Audio(`data:${result.mime};base64,${result.audio}`);
        audio.volume = Math.min(1, Math.max(0, prefs.volume));
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => {
          setSpeaking(false);
          setError("This device could not play the spoken answer.");
        };
        audioRef.current = audio;
        setSpeaking(true);
        await audio.play();
      } catch (cause) {
        if (token !== requestRef.current) return;
        setSpeaking(false);
        setError(cause instanceof Error ? cause.message : "Mitra could not speak that answer.");
      } finally {
        if (token === requestRef.current) setLoading(false);
      }
    },
    [prefs.expressive, prefs.speed, prefs.voiceId, prefs.volume, lang, stop, synth],
  );

  return { speak, stop, speaking, loading, error, clearError: () => setError(null) };
}
