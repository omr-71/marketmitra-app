import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { crops, inr, rankedMarkets } from "@/lib/data";
import { BadgeCheck, ChevronRight, LineChart, MapPin, Truck } from "lucide-react";

type Search = { crop: string; qty: number };

export const Route = createFileRoute("/markets")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    crop: typeof search["crop"] === "string" ? (search["crop"] as string) : "onion",
    qty: Number(search["qty"]) > 0 ? Number(search["qty"]) : 30,
  }),
  head: () => ({
    meta: [
      { title: "Best market comparison — MarketMitra" },
      {
        name: "description",
        content:
          "Compare mandi price, distance, transport cost and estimated net profit across nearby markets.",
      },
      { property: "og:title", content: "Best market comparison — MarketMitra" },
      {
        property: "og:description",
        content: "See which market pays you the most after transport and commission.",
      },
    ],
  }),
  component: MarketsPage,
});

function MarketsPage() {
  const { t, lang } = useLang();
  const { crop: cropId, qty } = Route.useSearch();
  const crop = crops.find((c) => c.id === cropId) ?? crops[0]!;
  const ranked = rankedMarkets(qty);
  const best = ranked[0]!;
  const lowest = ranked[ranked.length - 1]!;

  return (
    <Screen>
      <TopBar
        title={t("compareMarkets")}
        subtitle={`${crop.emoji} ${crop.name[lang]} · ${qty} ${crop.unit}`}
        back="/crops"
      />

      <div className="px-5 pt-5">
        <Link
          to="/predict"
          className="press card-surface flex items-center gap-3 px-4 py-3.5"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10">
            <LineChart className="size-4.5 text-primary" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{t("pricePrediction")}</span>
            <span className="block truncate text-[11px] text-muted-foreground">
              Prices may increase by 8% in the next 3 days
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>

        <div className="mt-5 space-y-3">
          {ranked.map(({ market, net, transport }, i) => {
            const isBest = i === 0;
            const delta = net - lowest.net;
            return (
              <Link
                key={market.id}
                to="/market/$marketId"
                params={{ marketId: market.id }}
                className={`press block overflow-hidden rounded-3xl border p-5 ${
                  isBest
                    ? "border-primary/45 bg-primary/6 shadow-[var(--shadow-float)]"
                    : "card-surface"
                }`}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    {isBest && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-foreground">
                        <BadgeCheck className="size-3" />
                        {t("bestChoice")}
                      </span>
                    )}
                    <h2 className="truncate text-base font-extrabold">{market.name}</h2>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {market.district} · {t("demand")}: {market.demand}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-muted-foreground">{t("price")}</p>
                    <p className="text-lg font-extrabold">{inr(market.price)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted/70 px-3 py-2.5">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">{t("distance")}</p>
                      <p className="truncate text-xs font-bold">{market.distanceKm} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-muted/70 px-3 py-2.5">
                    <Truck className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">{t("transport")}</p>
                      <p className="truncate text-xs font-bold">{inr(transport)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-border/70 pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{t("netProfit")}</p>
                    <p
                      className={`text-xl font-extrabold ${isBest ? "text-primary" : "text-foreground"}`}
                    >
                      {inr(net)}
                    </p>
                  </div>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {delta > 0 ? `+${inr(delta)} vs lowest` : "Baseline"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl bg-secondary p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Why this market</p>
          <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
            {best.market.name} has high arrivals ({best.market.arrivals}) with strong trader demand.
            Even after {inr(best.transport)} transport and 2% commission you keep{" "}
            <b>{inr(best.net)}</b> for {qty} {crop.unit} of {crop.name[lang].toLowerCase()}.
          </p>
        </div>
      </div>
    </Screen>
  );
}
