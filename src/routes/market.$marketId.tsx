import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Screen, TopBar } from "@/components/app-shell";
import { SourceNote } from "@/components/source-note";
import { useLang } from "@/lib/i18n";
import { crops, findCrop } from "@/lib/crops";
import { fetchMandiPrices, fetchPriceHistory } from "@/lib/market.functions";
import { formatIstDate, inr } from "@/lib/format";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { BarChart3, Loader2, TrendingUp } from "lucide-react";

const searchSchema = z.object({
  crop: z.string().catch("onion"),
  state: z.string().catch("Maharashtra"),
});

export const Route = createFileRoute("/market/$marketId")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Market details — MarketMitra" },
      {
        name: "description",
        content: "Recorded price range, price history and reporting dates for this APMC mandi.",
      },
      { property: "og:title", content: "Market details — MarketMitra" },
      { property: "og:description", content: "Track how this mandi has been trading day by day." },
    ],
  }),
  component: MarketDetailPage,
});

function MarketDetailPage() {
  const { t, lang } = useLang();
  const { marketId } = Route.useParams();
  const { crop: cropId, state } = Route.useSearch();
  const crop = findCrop(cropId) ?? crops[0]!;

  const todayQuery = useQuery({
    queryKey: ["mandi-market", crop.commodity, state, marketId],
    queryFn: () =>
      fetchMandiPrices({ data: { commodity: crop.commodity, state, market: marketId } }),
    staleTime: 10 * 60 * 1000,
  });

  const historyQuery = useQuery({
    queryKey: ["history", crop.commodity, state, marketId],
    queryFn: () => fetchPriceHistory({ data: { commodity: crop.commodity, state, market: marketId } }),
    staleTime: 10 * 60 * 1000,
  });

  const latest = todayQuery.data?.ok ? todayQuery.data.records[0] : undefined;
  const points = historyQuery.data?.points ?? [];
  const chartData = points.slice(-14).map((p) => ({ label: formatIstDate(p.date).slice(0, 6), price: p.modal }));

  return (
    <Screen>
      <TopBar title={marketId} subtitle={`${crop.name[lang]} · ${state}`} back="/crops" />

      <div className="px-5 pt-5">
        {todayQuery.isPending ? (
          <div className="card-surface hover-lift flex items-center gap-2 p-5 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {t("loading")}
          </div>
        ) : todayQuery.data && !todayQuery.data.ok ? (
          <div className="card-surface hover-lift p-5">
            <p className="text-sm font-semibold text-destructive">{todayQuery.data.error}</p>
            <button
              onClick={() => void todayQuery.refetch()}
              className="press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold"
            >
              {t("retry")}
            </button>
          </div>
        ) : latest ? (
          <div className="card-surface hover-lift p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {t("modalPrice")}
            </p>
            <p className="mt-2 text-3xl font-extrabold">{inr(latest.modalPrice)}</p>
            <p className="text-xs text-muted-foreground">
              {t("perQuintal")} · {latest.variety ?? crop.name[lang]}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
              <div>
                <p className="text-sm font-extrabold">{inr(latest.minPrice)}</p>
                <p className="text-[10px] text-muted-foreground">{t("minPrice")}</p>
              </div>
              <div>
                <p className="text-sm font-extrabold">{inr(latest.maxPrice)}</p>
                <p className="text-[10px] text-muted-foreground">{t("maxPrice")}</p>
              </div>
            </div>
            {todayQuery.data?.ok && (
              <SourceNote
                result={todayQuery.data}
                priceDate={latest.arrivalDate}
                className="mt-3"
              />
            )}
          </div>

        ) : (
          <p className="card-surface hover-lift p-5 text-sm text-muted-foreground">{t("noPrices")}</p>
        )}

        <section className="card-surface hover-lift mt-4 p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <p className="text-sm font-bold">{t("priceHistory")}</p>
          </div>

          {historyQuery.isPending ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </p>
          ) : chartData.length < 2 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              History builds up as this mandi reports prices. {points.length} day
              {points.length === 1 ? "" : "s"} recorded so far.
            </p>
          ) : (
            <div className="-mx-2 mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [inr(v), t("modalPrice")]}
                  />
                  <Bar dataKey="price" radius={[8, 8, 0, 0]} fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <Link
          to="/predict"
          search={{ crop: crop.id, market: marketId, state }}
          className="press grad-primary mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground"
        >
          <TrendingUp className="size-5" /> {t("pricePrediction")}
        </Link>
      </div>
    </Screen>
  );
}
