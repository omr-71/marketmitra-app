import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accessibility,
  Bell,
  ChevronRight,
  Check,
  Globe,
  Info,
  LogOut,
  MapPin,
  Palette,
  Phone,
  RotateCcw,
  Shield,
  Sprout,
  User,
  Volume2,
} from "lucide-react";
import { Screen, TopBar } from "@/components/app-shell";
import { useAuth } from "@/lib/auth";
import { useSession } from "@/lib/session";
import { useSettings } from "@/lib/settings";
import { VOICE_PERSONALITIES } from "@/lib/voice";
import { useTheme, themes } from "@/lib/theme";
import { langNames, useLang } from "@/lib/i18n";
import { crops, type Lang } from "@/lib/crops";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MarketMitra" },
      {
        name: "description",
        content:
          "Manage your MarketMitra profile, language, theme, accessibility and alert preferences in one place.",
      },
      { property: "og:title", content: "Settings — MarketMitra" },
      {
        property: "og:description",
        content: "Profile, language, theme, accessibility and alert preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

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
        <Icon className="size-4 text-primary" /> {title}
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
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const { signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { settings, setNotifications, setAppearance, setVoice, reset } = useSettings();
  const { profile, updateProfile } = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setVillage(profile.village ?? "");
  }, [profile.full_name, profile.phone, profile.village]);

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const msg = {
    nameRequired: {
      en: "Full name is required.",
      mr: "पूर्ण नाव आवश्यक आहे.",
      hi: "पूरा नाम आवश्यक है.",
    },
    phoneRequired: {
      en: "Mobile number is required.",
      mr: "मोबाइल नंबर आवश्यक आहे.",
      hi: "मोबाइल नंबर आवश्यक है.",
    },
    phoneInvalid: {
      en: "Enter a valid 10-digit Indian mobile number.",
      mr: "वैध १० अंकी मोबाइल नंबर टाका.",
      hi: "मान्य 10 अंकों का मोबाइल नंबर डालें.",
    },
  } as const;

  const saveProfile = () => {
    const next: { name?: string; phone?: string } = {};
    if (!name.trim()) next.name = msg.nameRequired[lang];
    if (!phone.trim()) next.phone = msg.phoneRequired[lang];
    else if (!/^[6-9]\d{9}$/.test(phone.trim())) next.phone = msg.phoneInvalid[lang];
    setErrors(next);
    if (next.name || next.phone) return;

    updateProfile({
      full_name: name.trim(),
      phone: phone.trim(),
      village: village.trim() || null,
    });
    toast.success(t("save"));
  };

  const changeLanguage = (next: Lang) => {
    setLang(next);
    updateProfile({ language: next });
    toast.success(`${langNames[next]}`);
  };

  /** Requests browser permission once, only when a farmer turns an alert on. */
  const enableAlerts = async (key: "market" | "weather" | "updates", value: boolean) => {
    setNotifications({ [key]: value } as never);
    if (!value) return;
    if (permission === "unsupported") {
      toast.info("Your browser does not support push alerts. In-app alerts still work.");
      return;
    }
    if (permission === "granted") return;
    if (permission === "denied") {
      toast.info("Notifications are blocked in your browser settings. Allow them there to get alerts.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") toast.success("Alerts enabled on this device");
    else toast.info("You can enable alerts later from your browser settings.");
  };

  const previewNotification = () => {
    if (permission !== "granted") {
      toast.info("Allow notifications first to see a preview.");
      return;
    }
    new Notification("MarketMitra", {
      body: "This is how your market and weather alerts will look.",
      icon: "/icon-192.png",
    });
  };

  const saved = profile.saved_crops ?? [];
  const toggleCrop = (id: string) => {
    const next = saved.includes(id) ? saved.filter((c) => c !== id) : [...saved, id];
    updateProfile({ saved_crops: next });
  };

  const handleReset = () => {
    if (!window.confirm("Reset all app settings to their defaults? Your profile data is kept.")) return;
    reset();
    setTheme("emerald");
    toast.success("Settings reset");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <Screen>
      <TopBar title={t("settings")} back="/profile" settings={false} />

      <div className="space-y-6 px-5 pt-5 pb-10 lg:mx-auto lg:max-w-3xl">
        {/* Personal information */}
        <Section icon={User} title="Personal information">
          <div className="card-surface hover-lift space-y-3 p-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("fullName")} *
              </span>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                <User className="size-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] font-semibold text-destructive">{errors.name}</p>}
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("phone")} *
              </span>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                <Phone className="size-4 text-muted-foreground" />
                <input
                  value={phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={!!errors.phone}
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] font-semibold text-destructive">{errors.phone}</p>
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
                  onChange={(e) => setVillage(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>
            <button
              onClick={saveProfile}
              className="press grad-primary flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground"
            >
              {t("save")}
            </button>
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          <div className="card-surface hover-lift space-y-4 p-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Theme
              </Label>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`press flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all duration-300 ${
                      theme === th.id
                        ? "border-primary bg-primary/10 shadow-[var(--shadow-card)]"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className="flex shrink-0 gap-0.5">
                      {th.swatch.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="size-3 rounded-full ring-1 ring-border"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-bold">{th.label}</span>
                    {theme === th.id && (
                      <Check className="size-3.5 shrink-0 text-primary" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Accessibility */}
        <Section icon={Accessibility} title="Accessibility">
          <div className="card-surface hover-lift space-y-4 p-4">
            <Toggle
              label="Compact Mode"
              hint="Tighter spacing so more fits on screen"
              checked={settings.appearance.density === "compact"}
              onChange={(v) => setAppearance({ density: v ? "compact" : "comfortable" })}
            />
            <Toggle
              label="Larger Text"
              hint="Increase text size across the app"
              checked={settings.appearance.textSize === "lg"}
              onChange={(v) => setAppearance({ textSize: v ? "lg" : "md" })}
            />
            <Toggle
              label="Reduce Motion"
              hint="Minimise animations and transitions"
              checked={settings.appearance.reduceMotion}
              onChange={(v) => setAppearance({ reduceMotion: v })}
            />
            <Toggle
              label="High Contrast"
              hint="Stronger borders and text contrast"
              checked={settings.appearance.highContrast}
              onChange={(v) => setAppearance({ highContrast: v })}
            />
          </div>
        </Section>

        {/* Language */}
        <Section icon={Globe} title={t("language")}>
          <div className="card-surface p-2">
            {(Object.keys(langNames) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLanguage(l)}
                className={`press flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition-colors duration-300 ${
                  lang === l ? "bg-primary/10 text-primary" : "text-foreground"
                }`}
              >
                {langNames[l]}
                {lang === l && <Check className="size-4" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </Section>

        {/* Mitra voice */}
        <Section icon={Volume2} title="Mitra voice">
          <div className="card-surface hover-lift space-y-4 p-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Voice personality
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_PERSONALITIES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoice({ voiceId: v.id })}
                    className={`press rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
                      settings.voice.voiceId === v.id
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/70 text-foreground"
                    }`}
                  >
                    {v.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>Speaking speed</span>
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.1}
                value={settings.voice.speed}
                onChange={(e) => setVoice({ speed: Number(e.currentTarget.value) })}
                className="w-36 accent-[var(--color-primary)]"
                aria-label="Speaking speed"
              />
            </label>

            <label className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>Volume</span>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.1}
                value={settings.voice.volume}
                onChange={(e) => setVoice({ volume: Number(e.currentTarget.value) })}
                className="w-36 accent-[var(--color-primary)]"
                aria-label="Volume"
              />
            </label>

            <Toggle
              label="Expressive delivery"
              hint="Mitra matches the tone of the answer — calm, caring or cheerful."
              checked={settings.voice.emotional}
              onChange={(v) => setVoice({ emotional: v })}
            />
            <Toggle
              label="Speak answers aloud"
              hint="Mitra reads every reply automatically."
              checked={settings.voice.autoPlay}
              onChange={(v) => setVoice({ autoPlay: v })}
            />
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notifications">
          <div className="card-surface hover-lift space-y-4 p-4">
            <Toggle
              label="Market Updates"
              hint="New official mandi prices for your saved crops"
              checked={settings.notifications.market}
              onChange={(v) => void enableAlerts("market", v)}
            />
            <Toggle
              label="Weather Alerts"
              hint="Severe weather warnings for your farm location"
              checked={settings.notifications.weather}
              onChange={(v) => void enableAlerts("weather", v)}
            />
            <Toggle
              label="System Notifications"
              hint="App updates and important announcements"
              checked={settings.notifications.updates}
              onChange={(v) => void enableAlerts("updates", v)}
            />
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <p className="text-[11px] text-muted-foreground">
                {permission === "granted"
                  ? "Alerts are allowed on this device."
                  : permission === "denied"
                    ? "Alerts are blocked in your browser settings."
                    : permission === "unsupported"
                      ? "This browser does not support push alerts."
                      : "Turn an alert on to allow notifications."}
              </p>
              <button
                onClick={previewNotification}
                className="press shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold"
              >
                Preview
              </button>
            </div>
          </div>
        </Section>

        {/* Farming preferences */}
        <Section icon={Sprout} title="Farming preferences">
          <div className="card-surface space-y-3 p-4">
            <div>
              <Label className="text-sm font-bold">{t("savedCrops")}</Label>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Saved crops decide what your dashboard and alerts track.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {crops.map((c) => {
                const active = saved.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCrop(c.id)}
                    className={`press inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors duration-300 ${
                      active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                    }`}
                  >
                    <span className="text-base">{c.emoji}</span>
                    {c.name[lang]}
                    {active ? (
                      <Check className="size-3.5" strokeWidth={3} />
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
                <MapPin className="size-4 text-primary" /> Farm location &amp; weather
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </Section>

        {/* Privacy */}
        <Section icon={Shield} title="Privacy">
          <div className="card-surface p-2">
            <button
              onClick={handleReset}
              className="press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold"
            >
              <RotateCcw className="size-4 text-primary" />
              Reset app settings
            </button>
            <button
              onClick={handleSignOut}
              className="press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </Section>

        {/* About */}
        <Section icon={Info} title="About">
          <div className="card-surface p-2">
            <Link
              to="/about"
              className="press flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold"
            >
              About MarketMitra
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </Section>

        <div className="pt-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Market Mitra v1.0.0
          </p>
        </div>
      </div>
    </Screen>
  );
}
