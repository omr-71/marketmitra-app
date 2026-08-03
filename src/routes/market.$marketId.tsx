import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { inr, markets } from "@/lib/data";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Clock, Flame, MapPin, Navigation, Package, Phone } from "lucide-react";

export const Route = createFileRoute("/market/$marketId")({
  loader: ({ params }) => {
    const market = markets.find((m) => m.id === params.marketId);
    if (!market) throw notFound();
    return { market };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Market unavailable — MarketMitra" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.market.name} — MarketMitra`;
    const description = `Price history, demand level, distance and travel time for ${loaderData.market.name}, ${loaderData.market.district}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: MarketDetail,
});

const demandTone = {
  High: "bg-primary/12 text-primary",
  Medium: "bg-warning/20 text-warning-foreground",
  Low: "bg-muted text-muted-foreground",
} as const;

function MarketDetail() {
  const { t } = useLang();
  const { market } = Route.useLoaderData();
  const week = market.history;
  const change = ((week[week.length - 1]!.price - week[0]!.price) / week[0]!.price) * 100;

  return (
    <Screen>
      <TopBar title={market.name} subtitle={market.district} back="/crops" />

      <div className="px-5 pt-5">
        <div className="grad-ink relative overflow-hidden rounded-3xl p-5 text-[oklch(0.97_0.01_140)]">
          <span className="absolute -right-10 -top-12 size-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative">
            <p className="text-xs text-[oklch(0.82_0.02_145)]">Today's rate</p>
            <p className="mt-1 text-4xl font-extrabold">{inr(market.price)}</p>
            <p className="text-xs font-semibold text-primary-glow">
              +{change.toFixed(1)}% this week · {t("perQuintal")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="glass-dark rounded-full px-3 py-1.5 text-[11px] font-bold">
                {market.arrivals} arrivals
              </span>
              <span className="glass-dark rounded-full px-3 py-1.5 text-[11px] font-bold">
                Open 6 AM – 6 PM
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { icon: MapPin, label: t("distance"), value: `${market.distanceKm} km` },
            { icon: Clock, label: t("travelTime"), value: `${Math.floor(market.travelMins / 60)}h ${market.travelMins % 60}m` },
            { icon: Package, label: t("transport"), value: `${inr(market.transportPerQuintal)}/q` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card-surface px-3 py-3.5">
              <Icon className="size-4 text-primary" />
              <p className="mt-2 truncate text-[10px] text-muted-foreground">{label}</p>
              <p className="truncate text-xs font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        <div className="card-surface mt-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{t("priceHistory")}</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${demandTone[market.demand]}`}
            >
              {t("demand")}: {market.demand}
            </span>
          </div>
          <div className="-mx-2 mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [inr(v), "Price"]}
                />
                <Bar dataKey="price" radius={[8, 8, 8, 8]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface mt-4 p-5">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-warning" />
            <h2 className="text-sm font-bold">Trader activity</h2>
          </div>
          <div className="mt-3 space-y-3">
            {[
              { name: "Shree Traders", note: "Buying onion · 200 q/day", tag: "Verified" },
              { name: "Ganesh Agro Exports", note: "Export grade only", tag: "Top payer" },
              { name: "Nashik Fresh Mandi Co.", note: "Instant UPI payment", tag: "Fast pay" },
            ].map((tr) => (
              <div key={tr.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{tr.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{tr.note}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground">
                  {tr.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="press card-surface flex h-14 items-center justify-center gap-2 text-sm font-bold">
            <Phone className="size-4 text-primary" />
            Call mandi
          </button>
          <Link
            to="/markets"
            search={{ crop: "onion", qty: 30 }}
            className="press grad-primary flex h-14 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-float)]"
          >
            <Navigation className="size-4" />
            Plan trip
          </Link>
        </div>
      </div>
    </Screen>
  );
}
