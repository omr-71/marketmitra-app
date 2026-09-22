import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import {
  ArrowRight,
  BarChart3,
  CloudSun,
  Leaf,
  Loader2,
  MapPin,
  PenLine,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — MarketMitra" },
      {
        name: "description",
        content:
          "Manage your MarketMitra profile and farming location.",
      },
      {
        property: "og:title",
        content: "Profile — MarketMitra",
      },
      {
        property: "og:description",
        content:
          "Your MarketMitra profile, location and farming experience.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        property: "og:url",
        content: "https://marketmitra.app/profile",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://marketmitra.app/profile",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useLang();
  const { profile, loading, updateProfile } = useSession();
  const { location } = useLocationContext();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [saving, setSaving] = useState(false);

  const displayName = profile.full_name?.trim() || "";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "";

  const locationText =
    [profile.village, profile.district, profile.state]
      .filter(Boolean)
      .join(", ") ||
    (location
      ? [location.city, location.district, location.state]
          .filter(Boolean)
          .join(", ")
      : "");

  const incomplete = !displayName || !locationText;

  useEffect(() => {
    if (!editing) return;

    setName(profile.full_name ?? "");
    setVillage(profile.village ?? "");
  }, [editing, profile.full_name, profile.village]);

  const saveDetails = async () => {
    setSaving(true);

    try {
      await updateProfile({
        full_name: name.trim(),
        village: village.trim() || null,
      });

      toast.success(t("save"));
      setEditing(false);
    } catch {
      toast.error("Your change could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <TopBar title={t("profile")} back="/home" />

        <div className="flex items-center justify-center gap-2 px-5 pt-12 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t("loading")}
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="page-enter">
        <TopBar title={t("profile")} back="/home" />

        <div className="mx-auto w-full max-w-5xl space-y-8 px-5 pb-10 pt-6 lg:space-y-10 lg:pt-8">
          {/* PROFILE HERO */}
          <section
            className="relative overflow-hidden rounded-[2rem] p-7 text-ink-foreground lg:p-10"
            style={{
              backgroundImage: "var(--gradient-ink)",
            }}
          >
            <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/20 blur-[90px]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="grad-primary grid size-20 shrink-0 place-items-center rounded-[1.75rem] text-2xl font-extrabold text-primary-foreground shadow-[var(--shadow-float)]">
                  {initials || <User className="size-8" />}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-glow">
                    MarketMitra profile
                  </p>

                  <h1 className="mt-1 truncate font-display text-3xl font-extrabold lg:text-4xl">
                    {displayName || "Welcome to MarketMitra"}
                  </h1>

                  <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-foreground/65">
                    <MapPin className="size-3.5 text-primary-glow" />
                    {locationText || "Add your farming location"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="press glass-dark inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-xs font-bold"
              >
                <PenLine className="size-3.5 text-primary-glow" />
                Edit profile
              </button>
            </div>

            {incomplete && (
              <div className="glass-dark relative mt-8 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold">
                    Complete your profile
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-ink-foreground/60">
                    Add the missing details so MarketMitra can better
                    understand your area.
                  </p>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="press inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground"
                >
                  <PenLine className="size-3.5" />
                  Complete
                </button>
              </div>
            )}
          </section>

          {/* YOUR PROFILE */}
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Your profile
                </p>

                <h2 className="mt-2 font-display text-2xl font-extrabold lg:text-3xl">
                  Your information
                </h2>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="press hidden items-center gap-1.5 text-xs font-bold text-primary sm:flex"
              >
                Edit
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row">
              {/* NAME */}
              <div className="card-surface hover-lift flex flex-1 items-center gap-4 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <User className="size-5 text-primary" />
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Full name
                  </p>

                  <p className="mt-1 truncate text-sm font-extrabold">
                    {displayName || "Not added yet"}
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="card-surface hover-lift flex flex-1 items-center gap-4 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <MapPin className="size-5 text-primary" />
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Farming location
                  </p>

                  <p className="mt-1 truncate text-sm font-extrabold">
                    {locationText || "Not added yet"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* MARKET MITRA EXPERIENCE */}
          <section>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                MarketMitra
              </p>

              <h2 className="mt-2 font-display text-2xl font-extrabold lg:text-3xl">
                Everything you need, closer to the decision.
              </h2>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row">
              <Link
                to="/crops"
                className="card-surface hover-lift group flex flex-1 items-center gap-4 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <BarChart3 className="size-5 text-primary" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">Markets</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Compare market information before you travel.
                  </p>
                </div>

                <ArrowRight className="mm-row-arrow size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>

              <Link
                to="/diagnose"
                className="card-surface hover-lift group flex flex-1 items-center gap-4 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <Leaf className="size-5 text-primary" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">Diagnose</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Check crop problems when something looks wrong.
                  </p>
                </div>

                <ArrowRight className="mm-row-arrow size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>

              <Link
                to="/weather"
                className="card-surface hover-lift group flex flex-1 items-center gap-4 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <CloudSun className="size-5 text-primary" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">Weather</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Check today's conditions around your location.
                  </p>
                </div>

                <ArrowRight className="mm-row-arrow size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </div>
          </section>

          {/* LOCATION */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Your location
              </p>

              <h2 className="mt-2 font-display text-2xl font-extrabold lg:text-3xl">
                Keep your area accurate.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Your location helps MarketMitra show information relevant to
                your area.
              </p>
            </div>

            <LocationCard />
          </section>

          {/* PRIVACY / SETTINGS */}
          <section className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-7">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
                <ShieldCheck className="size-5 text-primary" />
              </span>

              <div>
                <p className="text-sm font-extrabold">
                  Your profile, your control.
                </p>

                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                  Manage your preferences and account options from Settings.
                </p>
              </div>
            </div>

            <Link
              to="/settings"
              className="press inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-xs font-bold"
            >
              <SettingsIcon className="size-4 text-primary" />
              Settings
              <ArrowRight className="size-3.5" />
            </Link>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-border/70 pt-6">
            <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  © 2026 Market Mitra. All rights reserved.
                </p>

                <p className="mt-1">
                  Developed by Om Labhade
                </p>
              </div>

              <Link
                to="/terms"
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </footer>
        </div>

        {/* EDIT PROFILE SHEET */}
        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
            onClick={() => !saving && setEditing(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Edit profile"
              className="w-full max-w-md rounded-t-[2rem] border border-border bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Profile
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold">
                    Edit your details
                  </h2>
                </div>

                <button
                  onClick={() => !saving && setEditing(false)}
                  disabled={saving}
                  className="grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <label className="mt-6 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("fullName")}
                </span>

                <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-primary/20">
                  <User className="size-4 text-muted-foreground" />

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoFocus
                    placeholder="Add your name"
                    className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("village")}
                </span>

                <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-primary/20">
                  <MapPin className="size-4 text-muted-foreground" />

                  <input
                    value={village}
                    onChange={(event) => setVillage(event.target.value)}
                    placeholder="Village or town"
                    className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </div>
              </label>

              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                For a precise farm location, use the location option on the
                profile page.
              </p>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="press h-12 flex-1 rounded-2xl border border-border bg-card text-sm font-bold disabled:opacity-50"
                >
                  {t("cancel")}
                </button>

                <button
                  onClick={saveDetails}
                  disabled={saving}
                  className="press grad-primary flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-50"
                >
                  {saving && (
                    <Loader2 className="size-4 animate-spin" />
                  )}

                  {t("save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}