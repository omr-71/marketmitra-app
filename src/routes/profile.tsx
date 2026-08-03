import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { langNames, useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { crops, type Lang } from "@/lib/crops";
import { updateFarmerProfile } from "@/lib/profile.functions";
import { Check, Loader2, LogOut, MapPin, Phone, Sprout } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Farmer profile — MarketMitra" },
      {
        name: "description",
        content: "Your verified email, farm location, saved crops and language preference.",
      },
      { property: "og:title", content: "Farmer profile — MarketMitra" },
      { property: "og:description", content: "Manage your MarketMitra account and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, setLang } = useLang();
  const { profile, email, signOut, refresh, loading } = useSession();
  const navigate = useNavigate();
  const [savingCrops, setSavingCrops] = useState(false);

  const saved = profile?.saved_crops ?? [];
  const displayName = profile?.full_name ?? "—";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "—";

  const toggleCrop = async (id: string) => {
    if (!profile) return;
    const next = saved.includes(id) ? saved.filter((c) => c !== id) : [...saved, id];
    setSavingCrops(true);
    const result = await updateFarmerProfile({ data: { saved_crops: next } });
    setSavingCrops(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    await refresh();
  };

  const changeLanguage = async (next: Lang) => {
    setLang(next);
    if (!profile) return;
    await updateFarmerProfile({ data: { language: next } });
    await refresh();
  };

  const handleLogout = async () => {
    await signOut();
    void navigate({ to: "/auth" });
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

  if (!profile) {
    return (
      <Screen>
        <TopBar title={t("profile")} back="/home" />
        <div className="px-5 pt-5">
          <p className="card-surface p-5 text-sm text-muted-foreground">
            Sign in with your email to view your profile.
          </p>
          <Link
            to="/auth"
            className="press grad-primary mt-4 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground"
          >
            {t("login")}
          </Link>
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
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Mail className="size-3.5" /> {email ?? "—"}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {[profile.village, profile.district, profile.state].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          </div>
          <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            Email verified · data encrypted at rest
          </p>
        </div>

        <LocationCard />

        <section>
          <h3 className="text-sm font-bold">
            {t("savedCrops")} {savingCrops && <Loader2 className="ml-1 inline size-3.5 animate-spin" />}
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Saved crops decide what your dashboard tracks.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {crops.map((c) => {
              const active = saved.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => void toggleCrop(c.id)}
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
                onClick={() => void changeLanguage(l)}
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

        <button
          onClick={() => void handleLogout()}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-4 text-sm font-bold text-destructive"
        >
          <LogOut className="size-4" /> {t("logout")}
        </button>
      </div>
    </Screen>
  );
}
