import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { langNames, useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { crops, type Lang } from "@/lib/crops";
import { Check, Loader2, MapPin, Phone, Sprout, User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Farmer profile — MarketMitra" },
      {
        name: "description",
        content: "Your farm location, saved crops and language preference for mandi price tracking.",
      },
      { property: "og:title", content: "Farmer profile — MarketMitra" },
      { property: "og:description", content: "Manage your MarketMitra preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang } = useLang();
  const { profile, loading, updateProfile } = useSession();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");

  useEffect(() => {
    setName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setVillage(profile.village ?? "");
  }, [profile.full_name, profile.phone, profile.village]);

  const saved = profile.saved_crops ?? [];
  const displayName = profile.full_name?.trim() || t("profile");
  const initials =
    (profile.full_name ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "MM";

  const dirty =
    name.trim() !== (profile.full_name ?? "") ||
    phone.trim() !== (profile.phone ?? "") ||
    village.trim() !== (profile.village ?? "");

  const saveDetails = () => {
    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    updateProfile({
      full_name: name.trim() || null,
      phone: phone.trim() || null,
      village: village.trim() || null,
    });
    toast.success(t("save"));
  };

  const toggleCrop = (id: string) => {
    const next = saved.includes(id) ? saved.filter((c) => c !== id) : [...saved, id];
    updateProfile({ saved_crops: next });
  };

  const changeLanguage = (next: Lang) => {
    setLang(next);
    updateProfile({ language: next });
  };

  if (loading) {
    return (
      <Screen>
        <TopBar title={t("profile")} back="/home" />
        <div className="flex items-center justify-center gap-2 px-5 pt-10 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("loading")}
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title={t("profile")} back="/home" />

      <div className="space-y-5 px-5 pt-5">
        <div className="card-surface p-5">
          <div className="flex items-center gap-4">
            <span className="grad-primary grid size-16 shrink-0 place-items-center rounded-3xl text-xl font-extrabold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold">{displayName}</h2>
              {profile.phone && (
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Phone className="size-3.5" /> +91 {profile.phone}
                </p>
              )}
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {[profile.village, profile.district, profile.state].filter(Boolean).join(", ") ||
                  t("locationNeeded")}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("name")}
              </span>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                <User className="size-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("phone")}
              </span>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                <Phone className="size-4 text-muted-foreground" />
                <input
                  value={phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
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
              onClick={saveDetails}
              disabled={!dirty}
              className="press grad-primary flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {t("save")}
            </button>
          </div>
        </div>

        <LocationCard />

        <section>
          <h3 className="text-sm font-bold">{t("savedCrops")}</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Saved crops decide what your dashboard tracks.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {crops.map((c) => {
              const active = saved.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCrop(c.id)}
                  className={`press inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold ${
                    active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                  }`}
                >
                  <span className="text-base">{c.emoji}</span>
                  {c.name[lang]}
                  {active ? <Check className="size-3.5" strokeWidth={3} /> : <Sprout className="size-3.5" />}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold">{t("language")}</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(langNames) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLanguage(l)}
                className={`press rounded-2xl border py-3.5 text-sm font-bold ${
                  lang === l
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {langNames[l]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </Screen>
  );
}
