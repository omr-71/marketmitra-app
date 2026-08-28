import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Lang } from "./crops";

export type TextSize = "sm" | "md" | "lg";
export type Density = "comfortable" | "compact";
export type ResponseLength = "short" | "balanced" | "detailed";
export type LangPref = "auto" | Lang;
export type NotificationPriority = "normal" | "important" | "urgent";

export type ChatSettings = {
  lang: LangPref;
  responseLength: ResponseLength;
  enterToSend: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  keepHistory: boolean;
};

export type VoiceSettings = {
  voiceId: string;
  lang: LangPref;
  speed: number;
  volume: number;
  emotional: boolean;
  autoPlay: boolean;
};

export type NotificationSettings = {
  market: boolean;
  priceMovement: boolean;
  weather: boolean;
  mitra: boolean;
  features: boolean;
  updates: boolean;
  important: boolean;
  minPriority: NotificationPriority;
};

export type AppearanceSettings = {
  textSize: TextSize;
  density: Density;
  reduceMotion: boolean;
  highContrast: boolean;
};

export type Settings = {
  chat: ChatSettings;
  voice: VoiceSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
};

export const DEFAULT_SETTINGS: Settings = {
  chat: {
    lang: "auto",
    responseLength: "balanced",
    enterToSend: true,
    autoScroll: true,
    showTimestamps: false,
    keepHistory: true,
  },
  voice: {
    voiceId: "aarohi",
    lang: "auto",
    speed: 1,
    volume: 1,
    emotional: true,
    autoPlay: false,
  },
  notifications: {
    market: true,
    priceMovement: true,
    weather: true,
    mitra: true,
    features: true,
    updates: true,
    important: true,
    minPriority: "normal",
  },
  appearance: { textSize: "md", density: "comfortable" },
};

const STORAGE_KEY = "mm-settings-v1";
const DEVICE_KEY = "mm-device-id";

/** Stable per-browser id used for voice credits and notification routing. */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `mm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return "anonymous";
  }
}

function merge(raw: unknown): Settings {
  const parsed = (raw ?? {}) as Partial<Settings>;
  return {
    chat: { ...DEFAULT_SETTINGS.chat, ...(parsed.chat ?? {}) },
    voice: { ...DEFAULT_SETTINGS.voice, ...(parsed.voice ?? {}) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications ?? {}) },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance ?? {}) },
  };
}

type Ctx = {
  settings: Settings;
  ready: boolean;
  deviceId: string;
  setChat: (patch: Partial<ChatSettings>) => void;
  setVoice: (patch: Partial<VoiceSettings>) => void;
  setNotifications: (patch: Partial<NotificationSettings>) => void;
  setAppearance: (patch: Partial<AppearanceSettings>) => void;
  reset: () => void;
};

const SettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  ready: false,
  deviceId: "server",
  setChat: () => {},
  setVoice: () => {},
  setNotifications: () => {},
  setAppearance: () => {},
  reset: () => {},
});

/** Applies appearance choices as root attributes so CSS can react to them. */
function applyAppearance(appearance: AppearanceSettings) {
  const root = document.documentElement;
  root.setAttribute("data-text-size", appearance.textSize);
  root.setAttribute("data-density", appearance.density);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState("server");

  useEffect(() => {
    let next = DEFAULT_SETTINGS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      next = merge(raw ? JSON.parse(raw) : {});
    } catch {
      next = DEFAULT_SETTINGS;
    }
    setSettings(next);
    setDeviceId(getDeviceId());
    applyAppearance(next.appearance);
    setReady(true);
  }, []);

  const persist = useCallback((next: Settings) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* settings stay in memory for this session */
    }
  }, []);

  const patchGroup = useCallback(
    <K extends keyof Settings>(group: K, patch: Partial<Settings[K]>) => {
      setSettings((current) => {
        const next = { ...current, [group]: { ...current[group], ...patch } } as Settings;
        persist(next);
        if (group === "appearance") applyAppearance(next.appearance);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo<Ctx>(
    () => ({
      settings,
      ready,
      deviceId,
      setChat: (patch) => patchGroup("chat", patch),
      setVoice: (patch) => patchGroup("voice", patch),
      setNotifications: (patch) => patchGroup("notifications", patch),
      setAppearance: (patch) => patchGroup("appearance", patch),
      reset: () => {
        setSettings(DEFAULT_SETTINGS);
        persist(DEFAULT_SETTINGS);
        applyAppearance(DEFAULT_SETTINGS.appearance);
      },
    }),
    [settings, ready, deviceId, patchGroup, persist],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);

/** Resolves an "auto" language preference against the active app language. */
export function resolveLang(pref: LangPref, appLang: Lang): Lang {
  return pref === "auto" ? appLang : pref;
}
