import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Screen, TopBar } from "@/components/app-shell";
import { DataProvenance, FreshnessBadge, UnavailableState } from "@/components/market-meta";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { crops, findCrop } from "@/lib/crops";
import { useLocationContext } from "@/lib/location";
import { latestPerMarket as pickLatestPerMarket, marketPricesQuery } from "@/lib/market-queries";
import { computeFreshness } from "@/lib/market-freshness";
import type { PriceRecord } from "@/lib/market-types";
import { locateMarket } from "@/lib/market-geo";
import { DEFAULT_RATE_PER_KM, estimateTransport, roadDistanceKm } from "@/lib/transport";
import { formatIstDate, inr } from "@/lib/format";
import { Award, Loader2, MapPin, RefreshCw, Search, SlidersHorizontal, Truck } from "lucide-react";

const searchSchema = z.object({
  crop: z.string().catch("onion"),
  qty: z.number().min(1).max(500).catch(20),
});

export const Route = createFileRoute("/_authenticated/markets")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Best market comparison — MarketMitra" },
      {
        name: "description",
        content:
          "Compare official AGMARKNET mandi rates with your estimated transport cost and commission to find the best available price.",
      },
      { property: "og:title", content: "Best market comparison — MarketMitra" },
      {
        property: "og:description",
        content: "Rank mandis by net money in hand using government-reported prices.",
      },
      { property: "og:url", content: "https://marketmitra.app/markets" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/markets" }],
  }),
  component: MarketsPage,
});

/** How many mandis we resolve coordinates for (keeps geocoding requests low). */
const GEO_LIMIT = 12;

function MarketsPage() {
  const { t, lang } = useLang();
  const { crop: cropId, qty } = Route.useSearch();
  const { location } = useLocationContext();
  const crop = findCrop(cropId) ?? crops[0]!;

  const [query, setQuery] = useState("");
  const [ratePerKm, setRatePerKm] = useState(DEFAULT_RATE_PER_KM);
  const [commission, setCommission] = useState(2);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (location?.state) track("market_search", { label: crop.commodity });
  }, [crop.commodity, location?.state]);

  const priceQuery = useQuery(
    marketPricesQuery({
      commodity: crop.commodity,
      ...(location?.state ? { state: location.state } : {}),
      ...(location?.district ? { district: location.district } : {}),
    }),
  );

  const result = priceQuery.data ?? null;

  /** Latest official record per mandi, newest reporting date first. */
  const latestPerMarket = useMemo<PriceRecord[]>(
    () => (result ? pickLatestPerMarket(result.records) : []),
    [result],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return latestPerMarket.filter(
      (r) => !q || r.market.toLowerCase().includes(q) || r.district.toLowerCase().includes(q),
    );
  }, [latestPerMarket, query]);

  /* Distances for the top mandis, from real geocoded coordinates. */
  const origin =
    location?.latitude != null && location?.longitude != null
      ? { latitude: location.latitude, longitude: location.longitude }
      : null;
  const [distances, setDistances] = useState<Record<string, number>>({});
  const geoTargets = visible.slice(0, GEO_LIMIT);
  const geoKey = origin ? geoTargets.map((r) => r.market).join("|") : "";

  useEffect(() => {
    if (!origin || geoTargets.length === 0) return;
    let cancelled = false;
    void (async () => {
      for (const record of geoTargets) {
        if (cancelled) return;
        const coords = await locateMarket(record.market, record.district, record.state);
        if (cancelled || !coords) continue;
        const km = roadDistanceKm(origin, coords);
        setDistances((prev) =>
          prev[record.market] === km ? prev : { ...prev, [record.market]: km },
        );
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoKey, origin?.latitude, origin?.longitude]);

  const rows = useMemo(
    () =>
      visible.map((record) => {
        const gross = record.modalPrice * qty;
        const km = distances[record.market];
        const transport = km != null ? estimateTransport(km, qty, ratePerKm) : null;
        const commissionCost = Math.round((gross * commission) / 100);
        return {
          record,
          gross,
          transport,
          commissionCost,
          net: gross - (transport?.totalCost ?? 0) - commissionCost,
        };
      }),
    [visible, qty, distances, ratePerKm, commission],
  );

  /**
   * Best choice is only compared inside the newest reporting date group — never
   * across different dates, which would compare last week against today.
   */
  const comparableDate = visible[0]?.arrivalDate ?? "";
  const sameDay = rows.filter((r) => r.record.arrivalDate === comparableDate);
  const bestPrice = [...sameDay].sort((a, b) => b.record.modalPrice - a.record.modalPrice)[0];
  const withTransport = sameDay.filter((r) => r.transport);
  const bestPractical =
    withTransport.length > 1 ? [...withTransport].sort((a, b) => b.net - a.net)[0] : undefined;

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
                <span>Transport rate (₹ per km)</span>
                <span className="text-primary">{inr(ratePerKm)}/km</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={1}
                value={ratePerKm}
                onChange={(e) => setRatePerKm(Number(e.target.value))}
                className="mt-2 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary"
                aria-label="Transport rate per km"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Set your own vehicle hire rate. Cost is estimated for the round trip.
              </p>
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
          <p className="card-surface hover-lift mt-5 p-5 text-sm text-muted-foreground">
            {t("locationNeeded")}
          </p>
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
        ) : rows.length === 0 ? (
          <p className="card-surface hover-lift mt-5 p-5 text-sm text-muted-foreground">
            {t("noPrices")}
          </p>
        ) : (
          <>
            {bestPrice && result && (
              <section className="mt-5 rounded-3xl bg-primary/10 p-5 ring-1 ring-primary/25">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                  <Award className="size-3.5" /> {t("bestChoice")} · best available price
                </p>
                <p className="mt-1.5 text-lg font-extrabold">{bestPrice.record.market}</p>
                <p className="font-display text-3xl font-extrabold">
                  {inr(bestPrice.record.modalPrice)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("perQuintal")} · {t("modalPrice")}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  Updated: {formatIstDate(bestPrice.record.arrivalDate)} ·{" "}
                  {bestPrice.record.district}
                </p>

                {bestPractical && bestPractical.record.market !== bestPrice.record.market && (
                  <p className="mt-3 border-t border-primary/20 pt-3 text-[12px] font-semibold leading-snug">
                    Best practical choice after estimated transport:{" "}
                    <b>{bestPractical.record.market}</b> — {inr(bestPractical.net)} net for {qty}{" "}
                    {crop.unit} ({bestPractical.transport!.distanceKm} km).
                  </p>
                )}
              </section>
            )}

            <div className="mt-4 space-y-3">
              {rows.map((row) => {
                const isBest = row.record.market === bestPrice?.record.market;
                const older = row.record.arrivalDate !== comparableDate;
                return (
                  <Link
                    key={row.record.market}
                    to="/market/$marketId"
                    params={{ marketId: row.record.market }}
                    search={{ crop: crop.id, state: row.record.state }}
                    className={`press card-surface block p-4 ${isBest ? "ring-2 ring-primary/40" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">{row.record.market}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {row.record.district} · Updated {formatIstDate(row.record.arrivalDate)}
                          {older ? " (older report)" : ""}
                        </p>
                      </div>
                      {isBest && (
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
                      <Cell
                        label={row.transport ? `${t("transport")} (est.)` : t("transport")}
                        value={row.transport ? `- ${inr(row.transport.totalCost)}` : "—"}
                      />
                      <Cell label={t("netProfit")} value={inr(row.net)} accent />
                    </div>

                    {row.transport ? (
                      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[10px] font-semibold text-muted-foreground">
                        <Truck className="size-3" />
                        {location?.place || location?.district || "Your location"} →{" "}
                        {row.record.market} · ~{row.transport.distanceKm} km ·{" "}
                        {inr(row.transport.ratePerKm)}/km round trip ·{" "}
                        {inr(row.transport.perQuintal)}/{crop.unit} (estimated)
                      </p>
                    ) : (
                      <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                        <MapPin className="size-3" /> Distance not available for this mandi —
                        transport not included.
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {result && (
          <div className="mt-4">
            <SourceNote result={result} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Transport is an estimate from road distance × your ₹/km rate, not an official freight
              rate. Commission is the % you set.
            </p>
          </div>
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
