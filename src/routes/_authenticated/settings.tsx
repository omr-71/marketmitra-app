import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Accessibility,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  CloudRain,
  Globe,
  Info,
  Leaf,
  Link2,
  LogOut,
  MapPin,
  Palette,
  RotateCcw,
  Shield,
  Sprout,
  TrendingUp,
  User,
  Volume2,
  Zap,
} from "lucide-react";

import { Screen, TopBar } from "@/components/app-shell";
import { PhoneVerifyCard } from "@/components/phone-verify-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/lib/auth";
import { useSession } from "@/lib/session";
import { useSettings } from "@/lib/settings";
import { MITRA_VOICES } from "@/lib/voices";
import { useMitraSpeech } from "@/lib/mitra-speech";
import { useTheme, themes } from "@/lib/theme";
import { langNames, useLang } from "@/lib/i18n";
import { crops, type Lang } from "@/lib/crops";
import { toast } from "sonner";

const previewLine: Record<Lang, string> = {
  en: "Namaste, I am Mitra. I can read your answers aloud like this.",
  mr: "नमस्ते, मी मित्र. मी तुमची उत्तरे अशी वाचून दाखवू शकतो.",
  hi: "नमस्ते, मैं मित्र हूँ। मैं आपके उत्तर इस तरह पढ़कर सुना सकता हूँ।",
};

const previewCopy = {
  play: {
    en: "Hear this voice",
    mr: "हा आवाज ऐका",
    hi: "यह आवाज़ सुनें",
  },
  loading: {
    en: "Preparing…",
    mr: "तयार करत आहे…",
    hi: "तैयार हो रहा है…",
  },
  playing: {
    en: "Speaking…",
    mr: "बोलत आहे…",
    hi: "बोल रहा है…",
  },
} as const;

type AlertPreferences = {
  priceRise: boolean;
  priceFall: boolean;
  dailyMarket: boolean;
  heavyRain: boolean;
  extremeTemperature: boolean;
  strongWind: boolean;
  mitraLink: boolean;
  quietHours: boolean;
  dailyBrief: boolean;
  quietFrom: string;
  quietTo: string;
  priceRiseThreshold: number;
  priceFallThreshold: number;
  rainThreshold: number;
  temperatureHigh: number;
  temperatureLow: number;
  briefTime: string;
};

const DEFAULT_ALERTS: AlertPreferences = {
  priceRise: true,
  priceFall: true,
  dailyMarket: false,
  heavyRain: true,
  extremeTemperature: true,
  strongWind: false,
  mitraLink: true,
  quietHours: true,
  dailyBrief: false,
  quietFrom: "22:00",
  quietTo: "06:00",
  priceRiseThreshold: 10,
  priceFallThreshold: 10,
  rainThreshold: 30,
  temperatureHigh: 38,
  temperatureLow: 10,
  briefTime: "07:00",
};

const ALERT_STORAGE_KEY = "marketmitra-alert-preferences";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bell;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 space-y-0.5">
        <Label className="text-sm font-bold">{label}</Label>

        {hint && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function NumberSetting({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3">
      <span className="text-sm font-semibold">
        {label}
      </span>

      <span className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) =>
            onChange(Number(e.currentTarget.value))
          }
          className="h-9 w-20 rounded-xl border border-border bg-background px-2 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
        />

        <span className="text-xs font-semibold text-muted-foreground">
          {suffix}
        </span>
      </span>
    </label>
  );
}

export const Route = createFileRoute(
  "/_authenticated/settings",
)({
  head: () => ({
    meta: [
      {
        title: "Settings — MarketMitra",
      },
      {
        name: "description",
        content:
          "Manage your MarketMitra profile, alerts, farming preferences, accessibility and account settings.",
      },
      {
        property: "og:title",
        content: "Settings — MarketMitra",
      },
      {
        property: "og:description",
        content:
          "Manage your MarketMitra profile, alerts, farming preferences, accessibility and account settings.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { signOut } = useAuth();

  const { t, lang, setLang } = useLang();

  const { theme, setTheme } = useTheme();

  const {
    settings,
    setNotifications,
    setAppearance,
    setVoice,
    reset,
  } = useSettings();

  const { profile, updateProfile } = useSession();

  const preview = useMitraSpeech(
    {
      voiceId: settings.voice.voiceId,
      speed: settings.voice.speed,
      volume: settings.voice.volume,
      expressive: settings.voice.emotional,
    },
    lang,
  );

  const [name, setName] = useState("");
  const [village, setVillage] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  const [permission, setPermission] =
    useState<
      NotificationPermission | "unsupported"
    >("default");

  const [alerts, setAlerts] =
    useState<AlertPreferences>(
      DEFAULT_ALERTS,
    );

  const [showAdvancedAlerts, setShowAdvancedAlerts] =
    useState(false);

  const saved = useMemo(() => profile.saved_crops ?? [], [profile.saved_crops]);

  useEffect(() => {
    setName(profile.full_name ?? "");
    setVillage(profile.village ?? "");
  }, [
    profile.full_name,
    profile.village,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored =
      window.localStorage.getItem(
        ALERT_STORAGE_KEY,
      );

    if (!stored) return;

    try {
      const parsed =
        JSON.parse(
          stored,
        ) as Partial<AlertPreferences>;

      setAlerts({
        ...DEFAULT_ALERTS,
        ...parsed,
      });
    } catch {
      window.localStorage.removeItem(
        ALERT_STORAGE_KEY,
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setPermission(
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission,
    );
  }, []);

  const saveAlerts = (
    next: AlertPreferences,
  ) => {
    setAlerts(next);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        ALERT_STORAGE_KEY,
        JSON.stringify(next),
      );
    }
  };

  const updateAlert = <
    K extends keyof AlertPreferences,
  >(
    key: K,
    value: AlertPreferences[K],
  ) => {
    saveAlerts({
      ...alerts,
      [key]: value,
    });
  };

  const msg = {
    nameRequired: {
      en: "Full name is required.",
      mr: "पूर्ण नाव आवश्यक आहे.",
      hi: "पूरा नाम आवश्यक है.",
    },
  } as const;

  const saveProfile = async () => {
    const next: {
      name?: string;
    } = {};

    if (!name.trim()) {
      next.name =
        msg.nameRequired[lang];
    }

    setErrors(next);

    if (next.name) return;

    try {
      await updateProfile({
        full_name: name.trim(),
        village: village.trim() || null,
      });

      toast.success(t("save"));
    } catch {
      toast.error(
        "Could not save your profile.",
      );
    }
  };

  const changeLanguage = async (
    next: Lang,
  ) => {
    setLang(next);

    try {
      await updateProfile({
        language: next,
      });

      toast.success(
        langNames[next],
      );
    } catch {
      toast.error(
        "Language preference could not be saved.",
      );
    }
  };

  const requestNotificationPermission =
    async () => {
      if (
        typeof Notification ===
        "undefined"
      ) {
        setPermission(
          "unsupported",
        );

        toast.info(
          "Your browser does not support notifications.",
        );

        return;
      }

      if (
        Notification.permission ===
        "denied"
      ) {
        toast.info(
          "Notifications are blocked in your browser settings.",
        );

        return;
      }

      if (
        Notification.permission ===
        "granted"
      ) {
        setPermission(
          "granted",
        );

        toast.success(
          "Notifications are already enabled.",
        );

        return;
      }

      const result =
        await Notification.requestPermission();

      setPermission(result);

      if (result === "granted") {
        toast.success(
          "Notifications enabled on this device.",
        );
      }
    };

  const enableAlerts = async (
    key:
      | "market"
      | "weather"
      | "updates",
    value: boolean,
  ) => {
    setNotifications({
      [key]: value,
    } as never);

    if (!value) return;

    if (
      permission ===
      "unsupported"
    ) {
      toast.info(
        "This browser does not support browser notifications.",
      );

      return;
    }

    if (
      permission ===
      "granted"
    ) {
      return;
    }

    if (
      permission ===
      "denied"
    ) {
      toast.info(
        "Notifications are blocked in your browser settings.",
      );

      return;
    }

    const result =
      await Notification.requestPermission();

    setPermission(result);

    if (result === "granted") {
      toast.success(
        "Notifications enabled on this device.",
      );
    } else {
      toast.info(
        "Notifications were not enabled.",
      );
    }
  };

  const previewNotification =
    async () => {
      if (
        permission !==
        "granted"
      ) {
        await requestNotificationPermission();

        if (
          typeof Notification ===
            "undefined" ||
          Notification.permission !==
            "granted"
        ) {
          return;
        }
      }

      new Notification(
        "MarketMitra",
        {
          body:
            "Your MarketMitra alerts will appear here when enabled.",
          icon: "/icon-192.png",
          tag: "marketmitra-preview",
        },
      );
    };

  const savedCropNames =
    useMemo(() => {
      return crops
        .filter((crop) =>
          saved.includes(
            crop.id,
          ),
        )
        .map(
          (crop) =>
            crop.name[lang],
        );
    }, [saved, lang]);

  const toggleCrop = (
    id: string,
  ) => {
    const next = saved.includes(
      id,
    )
      ? saved.filter(
          (c) => c !== id,
        )
      : [
          ...saved,
          id,
        ];

    void updateProfile({
      saved_crops: next,
    });
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Reset MarketMitra settings to their defaults? Your profile data will be kept.",
      )
    ) {
      return;
    }

    reset();

    setTheme(
      "emerald",
    );

    saveAlerts(
      DEFAULT_ALERTS,
    );

    toast.success(
      "Settings reset.",
    );
  };

  const handleSignOut =
    async () => {
      await signOut();

      toast.success(
        "Signed out successfully",
      );
    };

  const notificationStatus =
    permission === "granted"
      ? "Enabled on this device"
      : permission === "denied"
        ? "Blocked by browser"
        : permission ===
            "unsupported"
          ? "Not supported"
          : "Not enabled";

  const notificationStatusClass =
    permission === "granted"
      ? "text-primary"
      : permission === "denied"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Screen>
      <TopBar
        title={t("settings")}
        back="/profile"
        settings={false}
      />

      <div className="mx-auto w-full max-w-3xl space-y-7 px-5 pb-12 pt-5">

        {/* HEADER */}

        <div className="relative overflow-hidden rounded-[2rem] bg-[#101820] p-6 text-white shadow-[var(--shadow-float)]">
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/20 blur-[80px]" />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-glow">
              MarketMitra control center
            </p>

            <h1 className="mt-2 font-display text-3xl font-extrabold text-white">
              Settings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
              Control how MarketMitra tracks your crops,
              alerts you, speaks to you and adapts to
              your farming needs.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white">
                {saved.length} saved crop
                {saved.length === 1
                  ? ""
                  : "s"}
              </span>

              <span
                className={`rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold ${
                  permission ===
                  "granted"
                    ? "text-primary-glow"
                    : "text-white/60"
                }`}
              >
                {notificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}

        <Section
          icon={User}
          title="Personal information"
        >
          <div className="card-surface hover-lift space-y-3 p-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("fullName")} *
              </span>

              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                <User className="size-4 text-muted-foreground" />

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value,
                    )
                  }
                  aria-invalid={
                    !!errors.name
                  }
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>

              {errors.name && (
                <p className="mt-1 text-[11px] font-semibold text-destructive">
                  {errors.name}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("village")}
              </span>

              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                <MapPin className="size-4 text-muted-foreground" />

                <input
                  value={village}
                  onChange={(e) =>
                    setVillage(
                      e.target.value,
                    )
                  }
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <button
              onClick={() =>
                void saveProfile()
              }
              className="press grad-primary flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground"
            >
              {t("save")}
            </button>
          </div>

          <PhoneVerifyCard />
        </Section>

        {/* APPEARANCE */}

        <Section
          icon={Palette}
          title="Appearance"
        >
          <div className="card-surface hover-lift space-y-4 p-4">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Theme
            </Label>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {themes.map((th) => (
                <button
                  key={th.id}
                  onClick={() =>
                    setTheme(th.id)
                  }
                  className={`press flex items-center gap-2 rounded-xl border p-3 text-left transition-all duration-300 ${
                    theme === th.id
                      ? "border-primary bg-primary/10 shadow-[var(--shadow-card)]"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="flex shrink-0 gap-0.5">
                    {th.swatch
                      .slice(
                        0,
                        2,
                      )
                      .map(
                        (c) => (
                          <span
                            key={c}
                            className="size-3 rounded-full ring-1 ring-border"
                            style={{
                              backgroundColor:
                                c,
                            }}
                          />
                        ),
                      )}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs font-bold">
                    {th.label}
                  </span>

                  {theme ===
                    th.id && (
                    <Check
                      className="size-3.5 shrink-0 text-primary"
                      strokeWidth={
                        3
                      }
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ACCESSIBILITY */}

        <Section
          icon={Accessibility}
          title="Accessibility"
        >
          <div className="card-surface hover-lift space-y-5 p-4">
            <Toggle
              label="Compact Mode"
              hint="Tighter spacing so more information fits on screen."
              checked={
                settings
                  .appearance
                  .density ===
                "compact"
              }
              onChange={(v) =>
                setAppearance({
                  density:
                    v
                      ? "compact"
                      : "comfortable",
                })
              }
            />

            <Toggle
              label="Larger Text"
              hint="Increase text size across the app."
              checked={
                settings
                  .appearance
                  .textSize ===
                "lg"
              }
              onChange={(v) =>
                setAppearance({
                  textSize:
                    v
                      ? "lg"
                      : "md",
                })
              }
            />

            <Toggle
              label="Reduce Motion"
              hint="Minimise animations and transitions."
              checked={
                settings
                  .appearance
                  .reduceMotion
              }
              onChange={(v) =>
                setAppearance({
                  reduceMotion:
                    v,
                })
              }
            />

            <Toggle
              label="High Contrast"
              hint="Use stronger borders and text contrast."
              checked={
                settings
                  .appearance
                  .highContrast
              }
              onChange={(v) =>
                setAppearance({
                  highContrast:
                    v,
                })
              }
            />
          </div>
        </Section>

        {/* LANGUAGE */}

        <Section
          icon={Globe}
          title={t("language")}
        >
          <div className="card-surface p-2">
            {(
              Object.keys(
                langNames,
              ) as Lang[]
            ).map((l) => (
              <button
                key={l}
                onClick={() =>
                  void changeLanguage(
                    l,
                  )
                }
                className={`press flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition-colors duration-300 ${
                  lang === l
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                }`}
              >
                {langNames[l]}

                {lang === l && (
                  <Check
                    className="size-4"
                    strokeWidth={
                      3
                    }
                  />
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* MITRA VOICE */}

        <Section
          icon={Volume2}
          title="Mitra voice"
        >
          <div className="card-surface hover-lift space-y-5 p-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Voice personality
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {MITRA_VOICES.map(
                  (v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        setVoice({
                          voiceId:
                            v.id,
                        })
                      }
                      className={`press rounded-xl border px-3 py-3 text-left transition-colors ${
                        settings
                          .voice
                          .voiceId ===
                        v.id
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/70 text-foreground"
                      }`}
                    >
                      <span className="block text-[13px] font-bold">
                        {v.name}
                      </span>

                      <span className="mt-0.5 block text-[11px] font-semibold text-muted-foreground">
                        {v.style[
                          lang
                        ]}
                      </span>
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  preview.speak(
                    previewLine[
                      lang
                    ],
                  )
                }
                disabled={
                  preview.loading ||
                  preview.speaking
                }
                className="press rounded-xl border border-border/70 px-3 py-2.5 text-[13px] font-bold disabled:opacity-60"
              >
                {preview.loading
                  ? previewCopy
                      .loading[
                      lang
                    ]
                  : preview.speaking
                    ? previewCopy
                        .playing[
                        lang
                      ]
                    : previewCopy
                        .play[
                        lang
                      ]}
              </button>

              {preview.error && (
                <p className="text-[12px] font-semibold text-destructive">
                  {preview.error}
                </p>
              )}
            </div>

            <label className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>
                Speaking speed
              </span>

              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.1}
                value={
                  settings
                    .voice
                    .speed
                }
                onChange={(e) =>
                  setVoice({
                    speed:
                      Number(
                        e
                          .currentTarget
                          .value,
                      ),
                  })
                }
                className="w-36 accent-[var(--color-primary)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>
                Volume
              </span>

              <input
                type="range"
                min={0.2}
                max={1}
                step={0.1}
                value={
                  settings
                    .voice
                    .volume
                }
                onChange={(e) =>
                  setVoice({
                    volume:
                      Number(
                        e
                          .currentTarget
                          .value,
                      ),
                  })
                }
                className="w-36 accent-[var(--color-primary)]"
              />
            </label>

            <Toggle
              label="Expressive delivery"
              hint="Mitra matches the tone of the answer."
              checked={
                settings
                  .voice
                  .emotional
              }
              onChange={(v) =>
                setVoice({
                  emotional:
                    v,
                })
              }
            />

            <Toggle
              label="Speak answers aloud"
              hint="Mitra reads every reply automatically."
              checked={
                settings
                  .voice
                  .autoPlay
              }
              onChange={(v) =>
                setVoice({
                  autoPlay:
                    v,
                })
              }
            />
          </div>
        </Section>

        {/* NOTIFICATIONS */}

        <Section
          icon={Bell}
          title="Notifications"
        >
          <div className="card-surface hover-lift space-y-5 p-4">

            {/* DEVICE STATUS */}

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <Bell className="size-5 text-primary" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">
                    Device notifications
                  </p>

                  <p
                    className={`mt-1 text-[11px] font-semibold ${notificationStatusClass}`}
                  >
                    {notificationStatus}
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Allow MarketMitra to notify you about enabled farming alerts.
                  </p>
                </div>

                {permission !==
                  "granted" && (
                  <button
                    onClick={() =>
                      void requestNotificationPermission()
                    }
                    className="press shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            {/* BASIC ALERTS */}

            <div className="space-y-5">
              <Toggle
                label="Market Updates"
                hint="New official mandi prices for your saved crops."
                checked={
                  settings
                    .notifications
                    .market
                }
                onChange={(v) =>
                  void enableAlerts(
                    "market",
                    v,
                  )
                }
              />

              <Toggle
                label="Price Rise Alerts"
                hint={`Notify when a saved crop rises by ${alerts.priceRiseThreshold}% or more.`}
                checked={
                  alerts.priceRise
                }
                onChange={(v) =>
                  updateAlert(
                    "priceRise",
                    v,
                  )
                }
              />

              <Toggle
                label="Price Drop Alerts"
                hint={`Notify when a saved crop falls by ${alerts.priceFallThreshold}% or more.`}
                checked={
                  alerts.priceFall
                }
                onChange={(v) =>
                  updateAlert(
                    "priceFall",
                    v,
                  )
                }
              />

              <Toggle
                label="Daily Market Update"
                hint="A daily summary for your saved crops."
                checked={
                  alerts.dailyMarket
                }
                onChange={(v) =>
                  updateAlert(
                    "dailyMarket",
                    v,
                  )
                }
              />
            </div>

            {/* WEATHER */}

            <div className="border-t border-border pt-5">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Weather
              </p>

              <div className="space-y-5">
                <Toggle
                  label="Weather Alerts"
                  hint="Important weather warnings for your farm location."
                  checked={
                    settings
                      .notifications
                      .weather
                  }
                  onChange={(v) =>
                    void enableAlerts(
                      "weather",
                      v,
                    )
                  }
                />

                <Toggle
                  label="Heavy Rain"
                  hint={`Alert when rainfall reaches ${alerts.rainThreshold} mm or more.`}
                  checked={
                    alerts.heavyRain
                  }
                  onChange={(v) =>
                    updateAlert(
                      "heavyRain",
                      v,
                    )
                  }
                />

                <Toggle
                  label="Extreme Temperature"
                  hint={`Alert below ${alerts.temperatureLow}°C or above ${alerts.temperatureHigh}°C.`}
                  checked={
                    alerts.extremeTemperature
                  }
                  onChange={(v) =>
                    updateAlert(
                      "extremeTemperature",
                      v,
                    )
                  }
                />

                <Toggle
                  label="Strong Wind"
                  hint="Notify about significant wind conditions."
                  checked={
                    alerts.strongWind
                  }
                  onChange={(v) =>
                    updateAlert(
                      "strongWind",
                      v,
                    )
                  }
                />
              </div>
            </div>

            {/* MITRA LINK */}

            <div className="border-t border-border pt-5">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Mitra Link
              </p>

              <Toggle
                label="Mitra Link Activity"
                hint="Requests, accepted matches and important listing activity."
                checked={
                  alerts.mitraLink
                }
                onChange={(v) =>
                  updateAlert(
                    "mitraLink",
                    v,
                  )
                }
              />
            </div>

            {/* SYSTEM */}

            <div className="border-t border-border pt-5">
              <Toggle
                label="System Notifications"
                hint="Important MarketMitra announcements and service updates."
                checked={
                  settings
                    .notifications
                    .updates
                }
                onChange={(v) =>
                  void enableAlerts(
                    "updates",
                    v,
                  )
                }
              />
            </div>

            {/* ADVANCED */}

            <button
              type="button"
              onClick={() =>
                setShowAdvancedAlerts(
                  !showAdvancedAlerts,
                )
              }
              className="press flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold"
            >
              <span className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                Advanced alert controls
              </span>

              <ChevronRight
                className={`size-4 text-muted-foreground transition-transform ${
                  showAdvancedAlerts
                    ? "rotate-90"
                    : ""
                }`}
              />
            </button>

            {showAdvancedAlerts && (
              <div className="space-y-5 rounded-2xl border border-border bg-muted/20 p-4">

                {/* MARKET */}

                <div>
                  <p className="text-sm font-extrabold">
                    Market thresholds
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Choose how large a price movement should be before a market alert is generated.
                  </p>

                  <div className="mt-4 space-y-2">
                    <NumberSetting
                      label="Price rise"
                      value={
                        alerts.priceRiseThreshold
                      }
                      min={1}
                      max={100}
                      suffix="%"
                      onChange={(value) =>
                        updateAlert(
                          "priceRiseThreshold",
                          value,
                        )
                      }
                    />

                    <NumberSetting
                      label="Price fall"
                      value={
                        alerts.priceFallThreshold
                      }
                      min={1}
                      max={100}
                      suffix="%"
                      onChange={(value) =>
                        updateAlert(
                          "priceFallThreshold",
                          value,
                        )
                      }
                    />
                  </div>
                </div>

                {/* WEATHER */}

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-extrabold">
                    Weather thresholds
                  </p>

                  <div className="mt-3 space-y-2">
                    <NumberSetting
                      label="Rainfall"
                      value={
                        alerts.rainThreshold
                      }
                      min={1}
                      max={300}
                      suffix="mm"
                      onChange={(value) =>
                        updateAlert(
                          "rainThreshold",
                          value,
                        )
                      }
                    />

                    <NumberSetting
                      label="High temperature"
                      value={
                        alerts.temperatureHigh
                      }
                      min={20}
                      max={60}
                      suffix="°C"
                      onChange={(value) =>
                        updateAlert(
                          "temperatureHigh",
                          value,
                        )
                      }
                    />

                    <NumberSetting
                      label="Low temperature"
                      value={
                        alerts.temperatureLow
                      }
                      min={-10}
                      max={30}
                      suffix="°C"
                      onChange={(value) =>
                        updateAlert(
                          "temperatureLow",
                          value,
                        )
                      }
                    />
                  </div>
                </div>

                {/* QUIET HOURS */}

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-primary" />

                    <p className="text-sm font-extrabold">
                      Quiet hours
                    </p>
                  </div>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Non-critical alerts can be held during this period.
                  </p>

                  <div className="mt-4">
                    <Toggle
                      label="Enable quiet hours"
                      checked={
                        alerts.quietHours
                      }
                      onChange={(v) =>
                        updateAlert(
                          "quietHours",
                          v,
                        )
                      }
                    />
                  </div>

                  {alerts.quietHours && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          From
                        </span>

                        <input
                          type="time"
                          value={
                            alerts.quietFrom
                          }
                          onChange={(e) =>
                            updateAlert(
                              "quietFrom",
                              e.currentTarget
                                .value,
                            )
                          }
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none"
                        />
                      </label>

                      <label>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          To
                        </span>

                        <input
                          type="time"
                          value={
                            alerts.quietTo
                          }
                          onChange={(e) =>
                            updateAlert(
                              "quietTo",
                              e.currentTarget
                                .value,
                            )
                          }
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* DAILY BRIEF */}

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="size-4 text-primary" />

                    <p className="text-sm font-extrabold">
                      Daily Farming Brief
                    </p>
                  </div>

                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    One morning summary can combine your saved crop markets, weather and important activity.
                  </p>

                  <div className="mt-4">
                    <Toggle
                      label="Morning brief"
                      checked={
                        alerts.dailyBrief
                      }
                      onChange={(v) =>
                        updateAlert(
                          "dailyBrief",
                          v,
                        )
                      }
                    />
                  </div>

                  {alerts.dailyBrief && (
                    <label className="mt-4 block">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Delivery time
                      </span>

                      <input
                        type="time"
                        value={
                          alerts.briefTime
                        }
                        onChange={(e) =>
                          updateAlert(
                            "briefTime",
                            e.currentTarget
                              .value,
                          )
                        }
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* PREVIEW */}

            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold ${notificationStatusClass}`}
                >
                  {notificationStatus}
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Browser permission controls device notifications.
                </p>
              </div>

              <button
                onClick={() =>
                  void previewNotification()
                }
                className="press shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold"
              >
                Preview
              </button>
            </div>
          </div>
        </Section>

        {/* FARMING PREFERENCES */}

        <Section
          icon={Sprout}
          title="Farming preferences"
        >
          <div className="card-surface space-y-4 p-4">
            <div>
              <Label className="text-sm font-bold">
                {t("savedCrops")}
              </Label>

              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Your saved crops control which crops MarketMitra prioritises for market information and future alerts.
              </p>
            </div>

            {savedCropNames.length >
              0 && (
              <div className="rounded-2xl bg-primary/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Currently tracking
                </p>

                <p className="mt-1 text-sm font-bold">
                  {savedCropNames.join(
                    " · ",
                  )}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {crops.map((c) => {
                const active =
                  saved.includes(
                    c.id,
                  );

                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      toggleCrop(
                        c.id,
                      )
                    }
                    className={`press inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors duration-300 ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className="text-base">
                      {c.emoji}
                    </span>

                    {c.name[lang]}

                    {active ? (
                      <Check
                        className="size-3.5"
                        strokeWidth={
                          3
                        }
                      />
                    ) : (
                      <Sprout className="size-3.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <Link
              to="/weather"
              className="press flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm font-bold"
            >
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Farm location & weather
              </span>

              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </Section>

        {/* QUICK CONTROLS */}

        <Section
          icon={Zap}
          title="Quick controls"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/crops"
              className="card-surface hover-lift group flex items-center gap-4 p-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <TrendingUp className="size-5 text-primary" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">
                  Market prices
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Check your saved crop markets.
                </p>
              </div>

              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/diagnose"
              className="card-surface hover-lift group flex items-center gap-4 p-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <Sprout className="size-5 text-primary" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">
                  Crop diagnosis
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Check a crop when something looks wrong.
                </p>
              </div>

              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/link"
              className="card-surface hover-lift group flex items-center gap-4 p-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <Link2 className="size-5 text-primary" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">
                  Mitra Link
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Manage sharing and matching activity.
                </p>
              </div>

              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/weather"
              className="card-surface hover-lift group flex items-center gap-4 p-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <CloudRain className="size-5 text-primary" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">
                  Weather
                </p>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  Check conditions around your location.
                </p>
              </div>

              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Section>

        {/* PRIVACY & ACCOUNT */}

        <Section
          icon={Shield}
          title="Privacy & account"
        >
          <div className="card-surface overflow-hidden p-2">
            <button
              onClick={handleReset}
              className="press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold"
            >
              <RotateCcw className="size-4 text-primary" />

              <span className="flex-1 text-left">
                Reset app settings
              </span>

              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => {
                if (
                  !window.confirm(
                    "Sign out of MarketMitra?",
                  )
                ) {
                  return;
                }

                void handleSignOut();
              }}
              className="press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />

              <span className="flex-1 text-left">
                Sign Out
              </span>

              <ChevronRight className="size-4" />
            </button>
          </div>
        </Section>

        {/* ABOUT */}

        <Section
          icon={Info}
          title="About"
        >
          <div className="card-surface overflow-hidden p-2">
            <Link
              to="/about"
              className="press flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold"
            >
              <span>
                About MarketMitra
              </span>

              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>

            <Link
              to="/terms"
              className="press flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold"
            >
              <span>
                Terms & Conditions
              </span>

              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </Section>

        {/* FOOTER */}

        <footer className="border-t border-border pt-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            MarketMitra v1.0.0
          </p>

          <p className="mt-2 text-[11px] text-muted-foreground">
            Developed by Om Labhade
          </p>

          <p className="mt-1 text-[10px] text-muted-foreground/70">
            © 2026 MarketMitra. All rights reserved.
          </p>
        </footer>
      </div>
    </Screen>
  );
}