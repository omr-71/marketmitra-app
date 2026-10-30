import { lazy, Suspense, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { crops, findCrop } from "@/lib/crops";
import { fetchPriceHistory } from "@/lib/market.functions";
import { noRecentMarketPricesMessage } from "@/lib/market-district";
import { marketPricesQuery } from "@/lib/market-queries";
import { predictPrice } from "@/lib/predict.functions";
import { formatIstDate, formatIstDateTime, inr } from "@/lib/format";
const PriceHistoryAreaChart = lazy(
  () => import("@/components/charts/price-history-area-chart"),
);
import { BarChart3, Loader2, ShieldCheck, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

const searchSchema = z.object({
  crop: z.string().catch("onion"),
  market: z.string().catch(""),
  state: z.string().catch(""),
  district: z.string().catch(""),
});

export const Route = createFileRoute("/_authenticated/predict")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Price prediction — MarketMitra" },
      {
        name: "description",
        content:
          "A short-term mandi price outlook built from the recorded price history of the market you selected.",
      },
      { property: "og:title", content: "Price prediction — MarketMitra" },
      {
        property: "og:description",
        content: "Sell-or-hold guidance with a confidence score and the reasoning behind it.",
      },
      { property: "og:url", content: "https://marketmitra.app/predict" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/predict" }],
  }),
  component: PredictPage,
});

function PredictPage() {
  const { t, lang } = useLang();
  const { crop: cropId, market, state, district } = Route.useSearch();
  const crop = findCrop(cropId) ?? crops[0]!;
  const ready = Boolean(market && state && district);

  useEffect(() => {
    if (ready) track("prediction_viewed", { label: crop.commodity });
  }, [ready, crop.commodity]);

  const currentPriceQuery = useQuery(
    marketPricesQuery({
      commodity: crop.commodity,
      state,
      district,
      market,
    }),
  );

  const historyQuery = useQuery({
    queryKey: ["history", crop.commodity, state, district, market],
    enabled: ready,
    queryFn: () =>
      fetchPriceHistory({ data: { commodity: crop.commodity, state, district, market } }),
    staleTime: 10 * 60 * 1000,
  });

  const predictionQuery = useQuery({
    queryKey: ["prediction", crop.commodity, state, district, market],
    enabled: ready && Boolean(currentPriceQuery.data?.records.length),
    queryFn: () => predictPrice({ data: { commodity: crop.commodity, state, district, market } }),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  const points = historyQuery.data?.points ?? [];
  const chart = points
    .slice(-21)
    .map((p) => ({ label: formatIstDate(p.date).slice(0, 6), price: p.modal }));
  const prediction = predictionQuery.data;

  if (!ready) {
    return (
      <Screen>
        <TopBar title={t("pricePrediction")} back="/home" />
        <div className="px-5 pt-5">
          <p className="card-surface hover-lift p-5 text-sm text-muted-foreground">
            Open a market from the comparison list to see its price outlook for the selected
            district.
          </p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar
        title={t("pricePrediction")}
        subtitle={`${crop.name[lang]} · ${market}`}
        back="/markets"
      />

      <div className="px-5 pt-5">
        <section className="card-surface hover-lift p-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/12">
              <Sparkles className="size-4 text-primary" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">3-day outlook</p>
          </div>

          {ready && currentPriceQuery.isPending ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </div>
          ) : currentPriceQuery.isError ? (
            <p className="mt-4 text-xs text-muted-foreground">{t("noPrices")}</p>
          ) : !currentPriceQuery.data?.records.length ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {noRecentMarketPricesMessage(district)}
            </p>
          ) : predictionQuery.isPending ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </div>
          ) : prediction?.ok ? (
            <>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-3xl font-extrabold">{inr(prediction.expectedPrice)}</p>
                <span
                  className={`mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    prediction.changePercent >= 0
                      ? "bg-primary/12 text-primary"
                      : "bg-destructive/12 text-destructive"
                  }`}
                >
                  {prediction.changePercent >= 0 ? (
                    <TrendingUp className="size-3.5" />
                  ) : (
                    <TrendingDown className="size-3.5" />
                  )}
                  {prediction.changePercent > 0 ? "+" : ""}
                  {prediction.changePercent}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {`${t("confidence")} ${prediction.confidence}% · built on ${prediction.basedOnDays} recorded days · ${formatIstDateTime(prediction.generatedAt)} IST`}
              </p>

              <div className="mt-4 rounded-3xl bg-primary/8 p-4 ring-1 ring-primary/25">
                <p className="flex items-center gap-1.5 text-sm font-extrabold text-primary">
                  <ShieldCheck className="size-4" />
                  {prediction.recommendation === "sell_now" ? t("sellNow") : t("hold")}
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-snug">
                  {prediction.explanation}
                </p>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <p className="text-sm font-bold">{t("forecastUnavailable")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {prediction?.message ?? "The forecast service could not be reached."}
              </p>
              <button
                onClick={() => void predictionQuery.refetch()}
                className="press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold"
              >
                {t("retry")}
              </button>
            </div>
          )}
        </section>

        <section className="card-surface hover-lift mt-4 p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <p className="text-sm font-bold">{t("priceHistory")}</p>
          </div>

          {historyQuery.isPending ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </p>
          ) : chart.length < 2 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {points.length === 0
                ? noRecentMarketPricesMessage(district)
                : `${points.length} day${points.length === 1 ? "" : "s"} of verified ${district} prices recorded for this market so far.`}
            </p>
          ) : (
            <Suspense
              fallback={
                <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              }
            >
              <PriceHistoryAreaChart
                data={chart}
                tooltipLabel={t("modalPrice")}
                formatPrice={inr}
              />
            </Suspense>
          )}
        </section>
      </div>
    </Screen>
  );
}

