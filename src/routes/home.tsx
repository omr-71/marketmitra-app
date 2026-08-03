import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { crops, farmer, inr, weather } from "@/lib/data";
import { useSession } from "@/lib/session";
import {
  ArrowUpRight,
  Bell,
  CloudRain,
  Droplets,
  LineChart,
  Sparkles,
  Store,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wind,
  Landmark,
} from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Dashboard — MarketMitra" },
      {
        name: "description",
        content: "Live crop prices, weather, and AI market recommendations for your farm today.",
      },
      { property: "og:title", content: "Dashboard — MarketMitra" },
      {
        property: "og:description",
        content: "Today's mandi rates, rain alerts and the best market to sell your crop.",
      },
    ],
  }),
  component: HomePage,
});

const actions = [
  { to: "/crops", icon: Store, label: "Compare markets" },
  { to: "/predict", icon: LineChart, label: "Price forecast" },
  { to: "/weather", icon: CloudRain, label: "Rain alert" },
  { to: "/schemes", icon: Landmark, label: "Schemes" },
];

function HomePage() {
  const { t, lang } = useLang();
  const { profile } = useSession();

  return (
    <Screen>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10">
            <img src={logo} alt="MarketMitra" width={816} height={816} className="size-7" loading="lazy" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">{t("welcome")}</p>
            <h1 className="truncate text-lg font-extrabold">{profile?.full_name ?? "MarketMitra"}</h1>
          </div>
        </div>
        <button className="press relative grid size-11 shrink-0 place-items-center rounded-2xl border border-border bg-card">
          <Bell className="size-5" />
          <span className="absolute right-3 top-3 size-2 rounded-full bg-destructive" />
        </button>
      </header>

      {/* Weather card */}
      <section className="mt-5 px-5">
        <div className="grad-ink relative overflow-hidden rounded-3xl p-5 text-[oklch(0.97_0.01_140)] shadow-[var(--shadow-card)]">
          <span className="absolute -right-8 -top-10 size-40 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-[oklch(0.8_0.02_145)]">{weather.district}</p>
              <p className="mt-1 text-4xl font-extrabold">{weather.temp}°C</p>
              <p className="text-sm font-medium text-[oklch(0.86_0.02_145)]">
                {weather.condition[lang]}
              </p>
            </div>
            <CloudRain className="size-12 shrink-0 text-primary-glow" strokeWidth={1.6} />
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: Droplets, label: "Humidity", value: `${weather.humidity}%` },
              { icon: CloudRain, label: "Rain", value: `${weather.rainChance}%` },
              { icon: Wind, label: "Wind", value: `${weather.wind} km/h` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass-dark rounded-2xl px-3 py-2.5">
                <Icon className="size-4 text-primary-glow" />
                <p className="mt-1 text-sm font-bold">{value}</p>
                <p className="truncate text-[10px] text-[oklch(0.8_0.02_145)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI recommendation */}
      <section className="mt-4 px-5">
        <Link
          to="/markets"
          search={{ crop: "onion", qty: 30 }}
          className="press card-surface block overflow-hidden p-5"
        >
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/12">
              <Sparkles className="size-4 text-primary" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {t("aiRecommendation")}
            </p>
          </div>
          <p className="mt-3 text-[15px] font-semibold leading-snug">
            Sell 30 quintal of onion at <span className="text-primary">Lasalgaon APMC</span> today —
            it beats your nearest mandi by {inr(6180)} after transport.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Estimated net</p>
              <p className="text-lg font-extrabold">{inr(75258)}</p>
            </div>
            <span className="press grad-primary inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold text-primary-foreground">
              {t("compareMarkets")}
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </Link>
      </section>

      {/* Quick actions */}
      <section className="mt-6 px-5">
        <h2 className="text-sm font-bold">{t("quickActions")}</h2>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {actions.map(({ to, icon: Icon, label }) => (
            <Link
              key={to + label}
              to={to}
              className="press card-surface flex flex-col items-center gap-2 px-1.5 py-3.5"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10">
                <Icon className="size-4.5 text-primary" />
              </span>
              <span className="text-center text-[10px] font-semibold leading-tight text-muted-foreground">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's prices */}
      <section className="mt-6 px-5">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-bold">{t("todayPrices")}</h2>
          <Link to="/crops" className="text-xs font-bold text-primary">
            {t("viewAll")}
          </Link>
        </div>
        <div className="mt-3 space-y-2.5">
          {crops.slice(0, 5).map((c) => {
            const up = c.change >= 0;
            return (
              <Link
                key={c.id}
                to="/markets"
                search={{ crop: c.id, qty: 20 }}
                className="press card-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-lg">
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{c.name[lang]}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {t("perQuintal")} · Lasalgaon
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-extrabold">{inr(c.price)}</span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                      up ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {Math.abs(c.change)}%
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-5">
        <Link
          to="/crops"
          className="press flex items-center gap-3 rounded-3xl border border-dashed border-primary/40 bg-primary/5 px-5 py-4"
        >
          <Sprout className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 text-sm font-semibold">
            Add today's harvest to get a fresh market plan
          </span>
        </Link>
      </section>
    </Screen>
  );
}
