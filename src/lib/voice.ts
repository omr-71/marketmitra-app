import { useCallback, useEffect, useRef, useState } from "react";

import type { Lang } from "./crops";
import { detectMood, type VoiceMood } from "./voices";

export type VoiceGender = "female" | "male";

/**
 * Mitra voice personalities. These are real delivery profiles built on the
 * device speech engine actually available in the browser — gender preference
 * plus rate/pitch shaping. No voice is invented: if the device has no matching
 * voice for a language, playback falls back to the closest available one.
 */
export type VoicePersonality = {
  id: string;
  gender: VoiceGender;
  label: Record<Lang, string>;
  /** Base delivery shaping. */
  rate: number;
  pitch: number;
};

export const VOICE_PERSONALITIES: VoicePersonality[] = [
  {
    id: "warm-female",
    gender: "female",
    label: { en: "Warm Female", mr: "उबदार स्त्री आवाज", hi: "गर्मजोशी भरी महिला" },
    rate: 0.98,
    pitch: 1.06,
  },
  {
    id: "warm-male",
    gender: "male",
    label: { en: "Warm Male", mr: "उबदार पुरुष आवाज", hi: "गर्मजोशी भरा पुरुष" },
    rate: 0.98,
    pitch: 0.96,
  },
  {
    id: "friendly-female",
    gender: "female",
    label: { en: "Friendly Female", mr: "मैत्रीपूर्ण स्त्री आवाज", hi: "मित्रवत महिला" },
    rate: 1.05,
    pitch: 1.12,
  },
  {
    id: "friendly-male",
    gender: "male",
    label: { en: "Friendly Male", mr: "मैत्रीपूर्ण पुरुष आवाज", hi: "मित्रवत पुरुष" },
    rate: 1.05,
    pitch: 1.02,
  },
  {
    id: "calm-female",
    gender: "female",
    label: { en: "Calm Female", mr: "शांत स्त्री आवाज", hi: "शांत महिला" },
    rate: 0.92,
    pitch: 1,
  },
  {
    id: "calm-male",
    gender: "male",
    label: { en: "Calm Male", mr: "शांत पुरुष आवाज", hi: "शांत पुरुष" },
    rate: 0.92,
    pitch: 0.92,
  },
  {
    id: "professional-female",
    gender: "female",
    label: { en: "Professional Female", mr: "व्यावसायिक स्त्री आवाज", hi: "पेशेवर महिला" },
    rate: 1,
    pitch: 1,
  },
  {
    id: "professional-male",
    gender: "male",
    label: { en: "Professional Male", mr: "व्यावसायिक पुरुष आवाज", hi: "पेशेवर पुरुष" },
    rate: 1,
    pitch: 0.9,
  },
];

export function findPersonality(id: string): VoicePersonality {
  return VOICE_PERSONALITIES.find((v) => v.id === id) ?? VOICE_PERSONALITIES[0]!;
}

/** Subtle, non-theatrical delivery shifts per conversational mood. */
const MOOD_DELTA: Record<VoiceMood, { rate: number; pitch: number }> = {
  friendly: { rate: 0, pitch: 0 },
  informative: { rate: 0.02, pitch: -0.01 },
  concerned: { rate: -0.06, pitch: -0.02 },
  reassuring: { rate: -0.05, pitch: 0.02 },
  happy: { rate: 0.05, pitch: 0.05 },
};

export type SpeechPrefs = {
  /** Selected personality id. */
  voiceId: string;
  /** User speed multiplier (0.7–1.4). */
  rate: number;
  volume: number;
  /** Allow mood-matched delivery. */
  expressive: boolean;
};

const BCP47: Record<Lang, string> = { en: "en-IN", mr: "mr-IN", hi: "hi-IN" };

const MALE_HINTS = ["male", "man", "hemant", "ravi", "madhur", "prabhat", "google हिन्दी पुरुष"];
const FEMALE_HINTS = ["female", "woman", "swara", "kalpana", "aditi", "heera", "veena", "isha"];

/** Pick the closest device voice for a language + requested gender; graceful fallback. */
function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang, gender: VoiceGender) {
  const tag = BCP47[lang].toLowerCase();
  const base = tag.split("-")[0] ?? "en";
  const inLang = voices.filter((v) => v.lang.toLowerCase().replace("_", "-") === tag);
  const inBase = voices.filter((v) => v.lang.toLowerCase().startsWith(base));
  const pool = inLang.length > 0 ? inLang : inBase;
  if (pool.length === 0) return null;
  const hints = gender === "male" ? MALE_HINTS : FEMALE_HINTS;
  const hinted = pool.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  return hinted ?? pool[0] ?? null;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Speech synthesis with personality + mood-aware delivery. Safe no-op when unsupported. */
export function useSpeech(lang: Lang, prefs: SpeechPrefs) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const clean = text.replace(/[*_#`>]/g, "").trim();
      if (!clean) return;
      window.speechSynthesis.cancel();
      const persona = findPersonality(prefs.voiceId);
      const mood = prefs.expressive ? detectMood(clean) : "informative";
      const delta = MOOD_DELTA[mood];
      const utter = new SpeechSynthesisUtterance(clean.slice(0, 1200));
      const voice = pickVoice(window.speechSynthesis.getVoices(), lang, persona.gender);
      if (voice) utter.voice = voice;
      utter.lang = voice?.lang ?? BCP47[lang];
      utter.rate = clamp(persona.rate * prefs.rate + delta.rate, 0.6, 1.6);
      utter.pitch = clamp(persona.pitch + delta.pitch, 0.5, 1.6);
      utter.volume = clamp(prefs.volume, 0, 1);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    },
    [lang, prefs.voiceId, prefs.rate, prefs.volume, prefs.expressive],
  );

  const hasVoiceFor = voices.some((v) =>
    v.lang.toLowerCase().startsWith((BCP47[lang].split("-")[0] ?? "en").toLowerCase()),
  );

  return { supported, speaking, speak, stop, hasVoiceFor };
}

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => RecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognitionLike;
    webkitSpeechRecognition?: new () => RecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Microphone speech-to-text using the browser Speech Recognition API. */
export function useSpeechRecognition(lang: Lang) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [failed, setFailed] = useState(false);
  const ref = useRef<RecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => ref.current?.abort();
  }, []);

  const stop = useCallback(() => {
    ref.current?.stop();
    setListening(false);
  }, []);

  const cancel = useCallback(() => {
    ref.current?.abort();
    ref.current = null;
    setListening(false);
    setTranscript("");
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setTranscript("");
    const rec = new Ctor();
    ref.current = rec;
    rec.lang = BCP47[lang];
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (event) => {
      let out = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const alt = event.results[i]?.[0];
        if (alt) out += alt.transcript;
      }
      setTranscript(out);
    };
    rec.onerror = () => {
      setFailed(true);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
      setListening(true);
    } catch {
      setFailed(true);
    }
  }, [lang]);

  return { supported, listening, transcript, failed, start, stop, cancel, setTranscript };
}
