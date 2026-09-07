import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { Loader2, MapPin, PenLine, Settings as SettingsIcon, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Farmer profile — MarketMitra" },
      {
        name: "description",
        content: "Your farm location and personal details for MarketMitra.",
      },
      { property: "og:title", content: "Farmer profile — MarketMitra" },
      { property: "og:description", content: "Manage your MarketMitra profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://marketmitra.app/profile" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/profile" }],
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
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "";

  const locationText =
    [profile.village, profile.district, profile.state].filter(Boolean).join(", ") ||
    (location
      ? [location.city, location.district, location.state].filter(Boolean).join(", ")
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
        full_name: name.trim() || null,
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
        <div className="flex items-center justify-center gap-2 px-5 pt-10 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("loading")}
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="page-enter">
        <TopBar title={t("profile")} back="/home" />

        <div className="mx-auto w-full max-w-lg space-y-5 px-5 pt-6">
          {/* Identity */}
          <div className="page-item card-surface relative overflow-hidden p-6">
            <span className="grad-primary pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-15 blur-2xl" />
            <div className="flex items-center gap-4">
              <span className="grad-primary grid size-16 shrink-0 place-items-center rounded-3xl text-xl font-extrabold text-primary-foreground shadow-lg shadow-primary/25">
                {initials || <User className="size-7" />}
              </span>
              <div className="min-w-0 flex-1">
                {displayName ? (
                  <h2 className="truncate text-lg font-extrabold">{displayName}</h2>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-left text-lg font-extrabold text-primary"
                  >
                    Add your name
                  </button>
                )}
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0 text-primary" />
                  {locationText || (
                    <button onClick={() => setEditing(true)} className="text-primary">
                      Add your location
                    </button>
                  )}
                </p>
              </div>
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit profile"
                className="press inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground"
              >
                <PenLine className="size-3.5 text-primary" />
                Edit
              </button>
            </div>

            {incomplete && (
              <div className="mt-5 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <p className="text-sm font-bold">Complete your profile</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {!displayName && !locationText
                    ? "Add your name and where you farm so prices and weather match your area."
                    : !displayName
                      ? "Add your name so Mitra can greet you properly."
                      : "Add your village so prices and weather match your area."}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="press grad-primary mt-3 inline-flex h-10 items-center gap-1.5 rounded-2xl px-4 text-xs font-bold text-primary-foreground"
                >
                  <PenLine className="size-3.5" />
                  {!displayName ? "Add your name" : "Add your village"}
                </button>
              </div>
            )}
          </div>


          {/* Personal information */}
          <section className="page-item card-surface p-5">
            <h3 className="text-sm font-bold">Personal information</h3>
            <div className="mt-4 divide-y divide-border">
              <div className="flex items-center gap-3 py-3 first:pt-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <User className="size-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("fullName")}
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {displayName || <span className="font-normal text-muted-foreground">Not added yet</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 last:pb-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  <MapPin className="size-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {locationText || <span className="font-normal text-muted-foreground">Not added yet</span>}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Farm location: GPS + manual, reuses the existing location system */}
          <div className="page-item">
            <LocationCard />
          </div>
        </div>

        {/* Edit sheet */}
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
              <h2 className="text-base font-extrabold">Edit profile</h2>

              <label className="mt-5 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("fullName")}
                </span>
                <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                  <User className="size-4 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    placeholder="Add your name"
                    className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </div>
              </label>

              <label className="mt-3 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("village")}
                </span>
                <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <input
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village or town"
                    className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </div>
              </label>
              <p className="mt-2 text-[11px] text-muted-foreground">
                For a precise farm location, use the GPS option on the profile page.
              </p>

              <div className="mt-5 flex gap-2">
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
                  {saving && <Loader2 className="size-4 animate-spin" />}
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
