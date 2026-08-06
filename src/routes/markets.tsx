import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { crops, findCrop } from "@/lib/crops";
import { useLocationContext } from "@/lib/location";
import { fetchMandiPrices } from "@/lib/market.functions";
import { formatIstDate, formatIstDateTime, inr } from "@/lib/format";
import { Award, Loader2, RefreshCw, Search, SlidersHorizontal } from "lucide-react";

const searchSchema = z.object({
  crop: z.string().catch("onion"),
  qty: z.number().min(1).max(500).catch(20),
});

export const Route = createFileRoute("/markets")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Best market comparison — MarketMitra" },
      {
        name: "description",
        content:
          "Compare live APMC mandi rates with your transport cost and commission to find the highest net realisation.",
      },
      { property: "og:title", content: "Best market comparison — MarketMitra" },
      {
        property: "og:description",
        content: "Rank nearby mandis by net money in hand, not just headline price.",
      },
    ],
  }),
  component: MarketsPage,
});

function MarketsPage() {
  const { t, lang } = useLang();
  const { crop: cropId, qty } = Route.useSearch();
  const { location } = useLocationContext();
  const crop = findCrop(cropId) ?? crops[0]!;

  const [query, setQuery] = useState("");
  const [transport, setTransport] = useState(120);
  const [commission, setCommission] = useState(2);
  const [showFilters, setShowFilters] = useState(false);

  const priceQuery = useQuery({
    queryKey: ["mandi", crop.commodity, location?.state, location?.district],
    enabled: Boolean(location?.state),
    queryFn: () =>
      fetchMandiPrices({
        data: {
          commodity: crop.commodity,
          state: location!.state,
          ...(location?.district ? { district: location.district } : {}),
        },
      }),
    staleTime: 10 * 60 * 1000,
  });

  const ranked = useMemo(() => {
    if (!priceQuery.data?.ok) return [];
    const latestByMarket = new Map<string, (typeof priceQuery.data.records)[number]>();
    for (const record of priceQuery.data.records) {
      const existing = latestByMarket.get(record.market);
      if (!existing || existing.arrivalDate < record.arrivalDate) latestByMarket.set(record.market, record);
    }
    return [...latestByMarket.values()]
      .filter((r) => {
        const q = query.trim().toLowerCase();
        return !q || r.market.toLowerCase().includes(q) || r.district.toLowerCase().includes(q);
      })
      .map((r) => {
        const gross = r.modalPrice * qty;
        const transportCost = transport * qty;
        const commissionCost = (gross * commission) / 100;
        return { record: r, gross, transportCost, commissionCost, net: gross - transportCost - commissionCost };
      })
      .sort((a, b) => b.net - a.net);
  }, [priceQuery.data, query, qty, transport, commission]);

  return (
    <Screen>
      <TopBar
        title={t("compareMarkets")}
        subtitle={`${crop.name[lang]} · ${qty} ${crop.unit}`}
        back="/crops"
        action={
          <button
            onClick={() => void priceQuery.refetch()}
            className="press grid size-9 place-items-center rounded-full bg-muted"
            aria-label={t("retry")}
          >
            <RefreshCw className={`size-4 ${priceQuery.isFetching ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="px-5 pt-5">
        <div className="flex gap-2">
          <label className="card-surface hover-lift flex h-12 flex-1 items-center gap-2 px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchMarket")}
              maxLength={60}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`press grid size-12 shrink-0 place-items-center rounded-2xl ${
              showFilters ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
            aria-label="Filters"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        {showFilters && (
          <div className="card-surface hover-lift mt-3 space-y-4 p-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{t("transportRate")}</span>
                <span className="text-primary">{inr(transport)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={800}
                step={10}
                value={transport}
                onChange={(e) => setTransport(Number(e.target.value))}
                className="mt-2 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary"
                aria-label={t("transportRate")}
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{t("commissionRate")}</span>
                <span className="text-primary">{commission}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="mt-2 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary"
                aria-label={t("commissionRate")}
              />
            </div>
          </div>
        )}

        {!location?.state ? (
          <p className="card-surface hover-lift mt-5 p-5 text-sm text-muted-foreground">{t("locationNeeded")}</p>
        ) : priceQuery.isPending ? (
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-surface hover-lift h-28 animate-pulse" />
            ))}
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </p>
          </div>
        ) : priceQuery.data && !priceQuery.data.ok ? (
          <div className="card-surface hover-lift mt-5 p-5">
            <p className="text-sm font-semibold text-destructive">{priceQuery.data.error}</p>
            <button
              onClick={() => void priceQuery.refetch()}
              className="press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold"
            >
              {t("retry")}
            </button>
          </div>
        ) : ranked.length === 0 ? (
          <p className="card-surface hover-lift mt-5 p-5 text-sm text-muted-foreground">{t("noPrices")}</p>
        ) : (
          <div className="mt-5 space-y-3">
            {ranked.map((row, index) => (
              <Link
                key={row.record.market}
                to="/market/$marketId"
                params={{ marketId: row.record.market }}
                search={{ crop: crop.id, state: row.record.state }}
                className={`press card-surface block p-4 ${index === 0 ? "ring-2 ring-primary/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">{row.record.market}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {row.record.district} · {formatIstDate(row.record.arrivalDate)}
                    </p>
                  </div>
                  {index === 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground">
                      <Award className="size-3" /> {t("bestChoice")}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
                  <Cell label={t("minPrice")} value={inr(row.record.minPrice)} />
                  <Cell label={t("modalPrice")} value={inr(row.record.modalPrice)} />
                  <Cell label={t("maxPrice")} value={inr(row.record.maxPrice)} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                  <Cell label="Gross" value={inr(row.gross)} />
                  <Cell label={t("transport")} value={`- ${inr(row.transportCost)}`} />
                  <Cell label={t("netProfit")} value={inr(row.net)} accent />
                </div>
              </Link>
            ))}
          </div>
        )}

        {priceQuery.data?.ok && (
          <p className="mt-4 text-[11px] text-muted-foreground">
            {priceQuery.data.source} · {t("lastUpdated")}: {formatIstDateTime(priceQuery.data.updatedAt)} IST.
            Net realisation uses the transport and commission values you set above.
          </p>
        )}
      </div>
    </Screen>
  );
}

function Cell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className={`truncate text-sm font-extrabold ${accent ? "text-primary" : ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
