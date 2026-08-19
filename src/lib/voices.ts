import type { Lang } from "./crops";

/** Emotional colour Mitra can speak with. Kept subtle — never theatrical. */
export type VoiceMood = "friendly" | "informative" | "concerned" | "reassuring" | "happy";

export type MitraVoice = {
  id: string;
  /** ElevenLabs voice id (licensed catalogue voices only — no cloning). */
  providerId: string;
  name: string;
  style: Record<Lang, string>;
  gender: "female" | "male";
};

/** Licensed ElevenLabs catalogue voices, presented as Mitra voice identities. */
export const MITRA_VOICES: MitraVoice[] = [
  {
    id: "aarohi",
    providerId: "EXAVITQu4vr4xnSDxMaL",
    name: "Aarohi",
    gender: "female",
    style: {
      en: "Warm and conversational",
      mr: "उबदार आणि सहज संवादी",
      hi: "गर्मजोशी भरी और सहज",
    },
  },
  {
    id: "meera",
    providerId: "Xb7hH8MSUJpSbSDYk0k2",
    name: "Meera",
    gender: "female",
    style: {
      en: "Clear and precise",
      mr: "स्पष्ट आणि नेमकी",
      hi: "स्पष्ट और सटीक",
    },
  },
  {
    id: "kavita",
    providerId: "XrExE9yKIg1WjnnlVkGX",
    name: "Kavita",
    gender: "female",
    style: {
      en: "Gentle and patient",
      mr: "सौम्य आणि संयमी",
      hi: "कोमल और धैर्यवान",
    },
  },
  {
    id: "arjun",
    providerId: "JBFqnCBsd6RMkjVDRZzb",
    name: "Arjun",
    gender: "male",
    style: {
      en: "Calm and steady",
      mr: "शांत आणि स्थिर",
      hi: "शांत और स्थिर",
    },
  },
  {
    id: "rohan",
    providerId: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Rohan",
    gender: "male",
    style: {
      en: "Bright and energetic",
      mr: "उत्साही आणि ताजा",
      hi: "उत्साही और ऊर्जावान",
    },
  },
  {
    id: "vikram",
    providerId: "nPczCjzI2devNBz1zQrb",
    name: "Vikram",
    gender: "male",
    style: {
      en: "Deep and assured",
      mr: "खर्जातला आणि विश्वासदायी",
      hi: "गहरा और भरोसेमंद",
    },
  },
];

export function findVoice(id: string): MitraVoice {
  return MITRA_VOICES.find((v) => v.id === id) ?? MITRA_VOICES[0]!;
}

/**
 * Subtle delivery changes per mood. Stability high = even keel, lower =
 * more natural variation. Style stays low so nothing sounds acted out.
 */
export const MOOD_SETTINGS: Record<
  VoiceMood,
  { stability: number; similarity_boost: number; style: number; speed: number }
> = {
  friendly: { stability: 0.45, similarity_boost: 0.8, style: 0.25, speed: 1 },
  informative: { stability: 0.62, similarity_boost: 0.8, style: 0.1, speed: 1 },
  concerned: { stability: 0.7, similarity_boost: 0.82, style: 0.15, speed: 0.94 },
  reassuring: { stability: 0.6, similarity_boost: 0.85, style: 0.2, speed: 0.93 },
  happy: { stability: 0.4, similarity_boost: 0.78, style: 0.35, speed: 1.04 },
};

const CONCERN_WORDS = [
  "warning",
  "alert",
  "avoid",
  "risk",
  "damage",
  "heavy rain",
  "loss",
  "do not",
  "unsafe",
  "danger",
  "इशारा",
  "धोका",
  "नुकसान",
  "टाळा",
  "चेतावनी",
  "खतरा",
  "बचें",
];
const REASSURE_WORDS = [
  "don't worry",
  "no need to worry",
  "understandable",
  "i understand",
  "we can",
  "काळजी करू नका",
  "समजतं",
  "चिंता न करें",
  "समझ सकता",
];
const HAPPY_WORDS = [
  "good news",
  "increased",
  "higher price",
  "best price",
  "congratulations",
  "excellent",
  "चांगली बातमी",
  "वाढ",
  "सर्वोत्तम",
  "अभिनंदन",
  "अच्छी खबर",
  "बढ़",
];
const DATA_WORDS = ["₹", "quintal", "agmarknet", "क्विंटल", "mandi", "forecast", "अंदाज"];

/** Infers a natural mood from the answer text — no model call needed. */
export function detectMood(text: string): VoiceMood {
  const t = text.toLowerCase();
  const has = (list: string[]) => list.some((w) => t.includes(w.toLowerCase()));
  if (has(CONCERN_WORDS)) return "concerned";
  if (has(REASSURE_WORDS)) return "reassuring";
  if (has(HAPPY_WORDS)) return "happy";
  if (has(DATA_WORDS)) return "informative";
  return "friendly";
}

export const VOICE_PREVIEW: Record<Lang, string> = {
  en: "Namaste, I am Mitra. Today's onion rate in your nearest mandi looks steady, so you have time to plan.",
  mr: "नमस्कार, मी मित्र. तुमच्या जवळच्या बाजारात आज कांद्याचा दर स्थिर दिसतो, त्यामुळे नियोजनासाठी वेळ आहे.",
  hi: "नमस्ते, मैं मित्र हूँ. आपकी नज़दीकी मंडी में आज प्याज़ का भाव स्थिर दिख रहा है, इसलिए योजना बनाने का समय है.",
};
