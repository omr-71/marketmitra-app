import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { forecast, inr } from "@/lib/data";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Sparkles, TrendingUp, CalendarClock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "AI price prediction — MarketMitra" },
      {
        name: "description",
        content: "7-day AI forecast of mandi prices with a clear sell-or-wait recommendation.",
      },
      { property: "og:title", content: "AI price prediction — MarketMitra" },
      {
        property: "og:description",
        content: "Onion prices may rise 8% in the next 3 days — plan your sale.",
      },
    ],
  }),
  component: PredictPage,
});

function PredictPage() {
  const { t } = useLang();
  const min = Math.min(...forecast.map((f) => f.price));
  const max = Math.max(...forecast.map((f) => f.price));

  return (
    <Screen>
      <TopBar title={t("pricePrediction")} subtitle="Onion · Lasalgaon APMC" back="/home" />

      <div className="px-5 pt-5">
        <div className="card-surface p-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/12">
              <Sparkles className="size-4 text-primary" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">7-day forecast</p>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-extrabold">{inr(forecast[0].price)}</p>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-bold text-primary">
              <TrendingUp className="size-3.5" />
              +8.0%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Confidence 87% · updated 10 min ago</p>

          <div className="-mx-2 mt-5 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  domain={[min - 80, max + 80]}
                  hide
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [inr(v), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  fill="url(#gp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-primary/8 p-5 ring-1 ring-primary/25">
          <p className="text-sm font-extrabold text-primary">Recommendation</p>
          <p className="mt-2 text-[15px] font-semibold leading-snug">
            Prices may increase by 8% in the next 3 days. Hold your stock and sell on{" "}
            <b>Thursday</b> at Lasalgaon APMC for the best return.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="card-surface p-4">
            <CalendarClock className="size-5 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">Best sell day</p>
            <p className="text-base font-extrabold">Thursday</p>
            <p className="text-[11px] font-semibold text-primary">{inr(2830)} / quintal</p>
          </div>
          <div className="card-surface p-4">
            <AlertTriangle className="size-5 text-warning" />
            <p className="mt-2 text-xs text-muted-foreground">Risk factor</p>
            <p className="text-base font-extrabold">Rain on Wed</p>
            <p className="text-[11px] font-semibold text-muted-foreground">May delay arrivals</p>
          </div>
        </div>

        <div className="card-surface mt-4 p-5">
          <p className="text-sm font-bold">Signals used by the model</p>
          <ul className="mt-3 space-y-2.5">
            {[
              "Arrivals down 12% across Nashik belt",
              "Export demand up from Bangladesh & Sri Lanka",
              "Rainfall forecast reducing supply this week",
              "5-year seasonal price pattern for August",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Screen>
  );
}
