import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  ChevronRight,
  Globe,
  Info,
  LogOut,
  Palette,
  Shield,
  Check,
} from "lucide-react";
import { Screen, TopBar } from "@/components/app-shell";
import { FreshnessBadge } from "@/components/market-meta";
import { useAuth } from "@/lib/auth";
import { useSession } from "@/lib/session";
import { useSettings } from "@/lib/settings";
import { useTheme, themes } from "@/lib/theme";
import { langNames, useLang } from "@/lib/i18n";
import { marketStatusQuery } from "@/lib/market-queries";
import { formatIstDate, formatIstDateTime } from "@/lib/format";
import type { Lang } from "@/lib/crops";
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
          "Manage your MarketMitra language, theme, alerts and check live market data source health.",
      },
      { property: "og:title", content: "Settings — MarketMitra" },
      {
        property: "og:description",
        content: "Language, theme, alerts and official market data source status.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { settings, setNotifications, setAppearance } = useSettings();
  const { updateProfile } = useSession();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const changeLanguage = (next: Lang) => {
    setLang(next);
    updateProfile({ language: next });
    toast.success(`Language changed to ${langNames[next]}`);
  };

  const status = useQuery(marketStatusQuery);

  return (
    <Screen>
      <TopBar title="Settings" back="/profile" settings={false} />

      <div className="space-y-6 px-5 pt-5 pb-10">
        {/* Appearance Section */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Palette className="size-4 text-primary" /> Appearance
          </h3>
          <div className="card-surface p-4 space-y-4">
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Theme
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`press flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors ${
                      theme === th.id ? "border-primary bg-primary/10" : "border-border bg-card"
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
                    {theme === th.id && <Check className="size-3.5 shrink-0 text-primary" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Compact Mode</Label>
                <p className="text-[11px] text-muted-foreground">Show more content on screen</p>
              </div>
              <Switch 
                checked={settings.appearance.density === "compact"}
                onCheckedChange={(checked) => setAppearance({ density: checked ? "compact" : "comfortable" })}
              />
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Globe className="size-4 text-primary" /> Language
          </h3>
          <div className="card-surface p-2">
            {(Object.keys(langNames) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLanguage(l)}
                className={`press flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold ${
                  lang === l ? "bg-primary/10 text-primary" : "text-foreground"
                }`}
              >
                {langNames[l]}
                {lang === l && <Check className="size-4" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Bell className="size-4 text-primary" /> Notifications
          </h3>
          <div className="card-surface p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Market Updates</Label>
                <p className="text-[11px] text-muted-foreground">Daily price alerts for your crops</p>
              </div>
              <Switch 
                checked={settings.notifications.market}
                onCheckedChange={(checked) => setNotifications({ market: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Weather Alerts</Label>
                <p className="text-[11px] text-muted-foreground">Severe weather warnings for your farm</p>
              </div>
              <Switch 
                checked={settings.notifications.weather}
                onCheckedChange={(checked) => setNotifications({ weather: checked })}
              />
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Shield className="size-4 text-primary" /> Account
          </h3>
          <div className="card-surface p-2">
            <button
              onClick={handleSignOut}
              className="press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </section>

        <div className="text-center pt-4">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Market Mitra v1.0.0
          </p>
        </div>
      </div>
    </Screen>
  );
}
