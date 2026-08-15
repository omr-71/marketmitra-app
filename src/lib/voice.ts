import { useCallback, useEffect, useRef, useState } from "react";

import type { Lang } from "./crops";

export type VoiceGender = "female" | "male";
export type VoicePrefs = { gender: VoiceGender; rate: number; autoSpeak: boolean };

const PREFS_KEY = "mm-voice-prefs";

const BCP47: Record<Lang, string> = { en: "en-IN", mr: "mr-IN", hi: "hi-IN" };

const DEFAULT_PREFS: VoicePrefs = { gender: "female", rate: 1, autoSpeak: false };

function readPrefs(): VoicePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<VoicePrefs>;
    return {
      gender: parsed.gender === "male" ? "male" : "female",
      rate: typeof parsed.rate === "number" ? Math.min(1.4, Math.max(0.7, parsed.rate)) : 1,
      autoSpeak: parsed.autoSpeak === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Voice preferences (gender, speed, auto-speak) persisted on this device. */
export function useVoicePrefs() {
  const [prefs, setPrefs] = useState<VoicePrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  const update = useCallback((patch: Partial<VoicePrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* preferences stay in memory for this session */
      }
      return next;
    });
  }, []);

  return { prefs, update };
}

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

/** Speech synthesis with device-voice selection. No-ops safely when unsupported. */
export function useSpeech(lang: Lang, prefs: VoicePrefs) {
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
      const utter = new SpeechSynthesisUtterance(clean.slice(0, 1200));
      const voice = pickVoice(window.speechSynthesis.getVoices(), lang, prefs.gender);
      if (voice) utter.voice = voice;
      utter.lang = voice?.lang ?? BCP47[lang];
      utter.rate = prefs.rate;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    },
    [lang, prefs.gender, prefs.rate],
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
