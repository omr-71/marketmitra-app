import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Screen, TopBar } from "@/components/app-shell";
import {
  DataProvenance,
  FreshnessBadge,
  UnavailableState,
} from "@/components/market-meta";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { crops, findCrop } from "@/lib/crops";
import { useLocationContext } from "@/lib/location";
import {
  latestPerMarket as pickLatestPerMarket,
  marketPricesQuery,
} from "@/lib/market-queries";
import { computeFreshness } from "@/lib/market-freshness";
import type { PriceRecord } from "@/lib/market-types";
import { locateMarket } from "@/lib/market-geo";
import {
  DEFAULT_RATE_PER_KM,
  estimateTransport,
  roadDistanceKm,
} from "@/lib/transport";
import { formatIstDate, inr } from "@/lib/format";
import {
  Award,
  ArrowRight,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from "lucide-react";

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
      {
        property: "og:url",
        content: "https://marketmitra.app/markets",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://marketmitra.app/markets",
      },
    ],
  }),
  component: MarketsPage,
});

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
    if (location?.state) {
      track("market_search", { label: crop.commodity });
    }
  }, [crop.commodity, location?.state]);

  const priceQuery = useQuery(
    marketPricesQuery({
      commodity: crop.commodity,
      ...(location?.state ? { state: location.state } : {}),
      ...(location?.district ? { district: location.district } : {}),
    }),
  );

  const result = priceQuery.data ?? null;

  const latestPerMarket = useMemo<PriceRecord[]>(
    () => (result ? pickLatestPerMarket(result.records) : []),
    [result],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return latestPerMarket.filter(
      (r) =>
        !q ||
        r.market.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q),
    );
  }, [latestPerMarket, query]);

  const origin =
    location?.latitude != null && location?.longitude != null
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      : null;

  const [distances, setDistances] = useState<Record<string, number>>({});

  const geoTargets = visible.slice(0, GEO_LIMIT);

  const geoKey = origin
    ? geoTargets.map((r) => r.market).join("|")
    : "";

  useEffect(() => {
    if (!origin || geoTargets.length === 0) return;

    let cancelled = false;

    void (async () => {
      for (const record of geoTargets) {
        if (cancelled) return;

        const coords = await locateMarket(
          record.market,
          record.district,
          record.state,
        );

        if (cancelled || !coords) continue;

        const km = roadDistanceKm(origin, coords);

        setDistances((prev) =>
          prev[record.market] === km
            ? prev
            : {
                ...prev,
                [record.market]: km,
              },
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

        const transport =
          km != null
            ? estimateTransport(km, qty, ratePerKm)
            : null;

        const commissionCost = Math.round(
          (gross * commission) / 100,
        );

        return {
          record,
          gross,
          transport,
          commissionCost,
          net:
            gross -
            (transport?.totalCost ?? 0) -
            commissionCost,
        };
      }),
    [visible, qty, distances, ratePerKm, commission],
  );

  const comparableDate = visible[0]?.date ?? "";

  const sameDay = rows.filter(
    (r) => r.record.date === comparableDate,
  );

  const bestPrice = [...sameDay].sort(
    (a, b) =>
      b.record.modalPrice - a.record.modalPrice,
  )[0];

  const withTransport = sameDay.filter(
    (r) => r.transport,
  );

  const bestPractical =
    withTransport.length > 1
      ? [...withTransport].sort(
          (a, b) => b.net - a.net,
        )[0]
      : undefined;

  return (
    <Screen>
      <div className="mm-market-page relative min-h-full overflow-hidden">
        {/* LIVE MARKET WORLD */}
        <div
          className="mm-market-world pointer-events-none absolute z-0"
          aria-hidden="true"
        >
          <div className="mm-market-world-grid" />

          <div className="mm-market-orb mm-market-orb-one" />
          <div className="mm-market-orb mm-market-orb-two" />
          <div className="mm-market-orb mm-market-orb-three" />

          <div className="mm-market-scan" />

          <span className="mm-market-particle mm-market-particle-one" />
          <span className="mm-market-particle mm-market-particle-two" />
          <span className="mm-market-particle mm-market-particle-three" />
          <span className="mm-market-particle mm-market-particle-four" />
        </div>

        <div className="relative z-10">
          <TopBar
            title={t("compareMarkets")}
            subtitle={`${crop.name[lang]} · ${qty} ${crop.unit}`}
            back="/crops"
            action={
              <button
                onClick={() => void priceQuery.refetch()}
                className="press mm-icon-button grid size-9 place-items-center rounded-full bg-muted"
                aria-label={t("retry")}
              >
                <RefreshCw
                  className={`size-4 ${
                    priceQuery.isFetching
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>
            }
          />

          <div className="px-4 pt-4 sm:px-5 lg:px-0 lg:pt-6">
            {/* PAGE INTRO */}
            <section className="mb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="mm-live-dot" />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      Live market intelligence
                    </p>
                  </div>

                  <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                    {location?.district ||
                      "Choose your district"}
                  </h1>

                  <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    Latest official{" "}
                    {crop.name[lang]} prices from
                    available markets, with transport
                    estimates calculated around your
                    location.
                  </p>
                </div>

                <div className="hidden shrink-0 rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2 text-right sm:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Quantity
                  </p>
                  <p className="mt-0.5 font-display text-lg font-black">
                    {qty}{" "}
                    <span className="text-xs font-bold text-muted-foreground">
                      {crop.unit}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {/* COMMAND SEARCH */}
            <section className="mm-market-command glass-dark overflow-hidden rounded-[24px]">
              <div className="mm-command-light" />
              <div className="mm-panel-glow" />

              <div className="relative z-10 p-3">
                <div className="flex gap-2">
                  <label className="mm-interactive flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-border/60 bg-background/60 px-4 backdrop-blur-xl">
                    <Search className="size-4 shrink-0 text-muted-foreground" />

                    <input
                      value={query}
                      onChange={(e) =>
                        setQuery(e.target.value)
                      }
                      placeholder={t("searchMarket")}
                      maxLength={60}
                      className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60"
                    />

                    {query && (
                      <span className="mm-live-dot mm-mini-live-dot" />
                    )}
                  </label>

                  <button
                    onClick={() =>
                      setShowFilters((s) => !s)
                    }
                    className={`press grid size-12 shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
                      showFilters
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    aria-label="Filters"
                  >
                    <SlidersHorizontal
                      className={`size-4 transition-transform duration-300 ${
                        showFilters
                          ? "rotate-90"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                {/* FILTER PANEL */}
                <div
                  className={`grid transition-all duration-500 ${
                    showFilters
                      ? "mt-3 grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-xl">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>
                              Transport rate
                            </span>

                            <span className="font-black text-primary">
                              {inr(ratePerKm)}/km
                            </span>
                          </div>

                          <input
                            type="range"
                            min={5}
                            max={120}
                            step={1}
                            value={ratePerKm}
                            onChange={(e) =>
                              setRatePerKm(
                                Number(e.target.value),
                              )
                            }
                            className="mt-3 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary"
                            aria-label="Transport rate per km"
                          />

                          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                            Your vehicle hire rate.
                            Round-trip estimate.
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>
                              {t("commissionRate")}
                            </span>

                            <span className="font-black text-primary">
                              {commission}%
                            </span>
                          </div>

                          <input
                            type="range"
                            min={0}
                            max={10}
                            step={0.5}
                            value={commission}
                            onChange={(e) =>
                              setCommission(
                                Number(e.target.value),
                              )
                            }
                            className="mt-3 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary"
                            aria-label={t(
                              "commissionRate",
                            )}
                          />

                          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                            Applied to gross sale value.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION STATE */}
            {!location?.district ? (
              <section className="mm-empty-market card-surface relative mt-5 overflow-hidden rounded-[24px] p-5 text-center">
                <div className="mm-empty-ring" />

                <div className="relative z-10">
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10">
                    <MapPin className="size-5 text-primary" />
                  </div>

                  <p className="text-sm font-extrabold">
                    Select your district
                  </p>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                    Your district helps Market Mitra
                    compare the most relevant official
                    mandi prices.
                  </p>
                </div>
              </section>
            ) : priceQuery.isPending ? (
              <div className="mt-5 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="mm-market-skeleton card-surface relative h-32 overflow-hidden rounded-[22px] animate-pulse"
                  >
                    <div className="mm-skeleton-shine" />
                  </div>
                ))}

                <p className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {t("loading")}
                </p>
              </div>
            ) : priceQuery.isError ? (
              <div className="mt-5">
                <UnavailableState
                  onRetry={() =>
                    void priceQuery.refetch()
                  }
                  message="The official market price service could not be reached."
                />
              </div>
            ) : rows.length === 0 ? (
              <div className="mt-5">
                <UnavailableState
                  onRetry={() =>
                    void priceQuery.refetch()
                  }
                />
              </div>
            ) : (
              <>
                {/* SNAPSHOT */}
                <section className="mm-snapshot relative mt-5 overflow-hidden rounded-[22px] bg-background/50 p-4 backdrop-blur-xl">
                  <div className="mm-snapshot-shine pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-3.5 text-primary" />

                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                          Market snapshot
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {sameDay.length} market
                        {sameDay.length === 1
                          ? ""
                          : "s"}{" "}
                        in the latest reporting
                        window.
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Status
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs font-black">
                        <span className="mm-live-dot" />
                        Live
                      </div>
                    </div>
                  </div>
                </section>

                {/* BEST MARKET */}
                {bestPrice && result && (
                  <section className="mm-best-market relative mt-4 overflow-hidden rounded-[28px] border border-gold/20 bg-background/65 p-5 backdrop-blur-2xl sm:p-6">
                    <div className="mm-best-glow pointer-events-none" />
                    <div className="mm-best-grid pointer-events-none" />
                    <div className="mm-best-scan pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="eyebrow flex items-center gap-1.5 text-gold-foreground">
                            <Award className="size-3.5" />
                            {t("bestChoice")}
                          </p>

                          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Highest available modal
                            price
                          </p>
                        </div>

                        <div className="grid size-10 place-items-center rounded-2xl bg-gold/10">
                          <span className="text-lg">
                            ₹
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 font-display text-xl font-black tracking-tight sm:text-2xl">
                        {bestPrice.record.market}
                      </p>

                      <p className="mt-1 font-display text-4xl font-black tracking-tight sm:text-5xl">
                        {inr(
                          bestPrice.record.modalPrice,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("perQuintal")} ·{" "}
                        {t("modalPrice")}
                        {bestPrice.record.variety
                          ? ` · ${bestPrice.record.variety}`
                          : ""}
                        {bestPrice.record.grade
                          ? ` · ${bestPrice.record.grade}`
                          : ""}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                        <FreshnessBadge
                          freshness={result.freshness}
                        />

                        <span>
                          {formatIstDate(
                            bestPrice.record.date,
                          )}
                        </span>

                        <span>·</span>

                        <span>
                          {bestPrice.record.district}
                        </span>
                      </div>

                      {bestPractical &&
                        bestPractical.record.market !==
                          bestPrice.record.market && (
                          <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 p-3.5">
                            <div className="flex items-start gap-2.5">
                              <Truck className="mt-0.5 size-4 shrink-0 text-primary" />

                              <p className="text-[11px] font-semibold leading-relaxed">
                                Best practical choice
                                after estimated
                                transport:{" "}
                                <b>
                                  {
                                    bestPractical
                                      .record.market
                                  }
                                </b>{" "}
                                —{" "}
                                {inr(
                                  bestPractical.net,
                                )}{" "}
                                net for {qty}{" "}
                                {crop.unit} (
                                {
                                  bestPractical
                                    .transport!
                                    .distanceKm
                                }{" "}
                                km).
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </section>
                )}

                {/* MARKET LIST */}
                <section className="mt-5">
                  <div className="mb-3 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                        Available mandis
                      </p>

                      <h2 className="mt-0.5 font-display text-lg font-black">
                        Compare markets
                      </h2>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black text-muted-foreground">
                      {rows.length} results
                    </span>
                  </div>

                  <div className="space-y-3">
                    {rows.map((row, index) => {
                      const isBest =
                        row.record.market ===
                        bestPrice?.record.market;

                      const rowFreshness =
                        computeFreshness({
                          dataDate: row.record.date,
                        });

                      return (
                        <Link
                          key={row.record.market}
                          to="/market/$marketId"
                          params={{
                            marketId:
                              row.record.market,
                          }}
                          search={{
                            crop: crop.id,
                            state: row.record.state,
                            district:
                              row.record.district,
                          }}
                          className={`mm-market-card group relative block min-w-0 overflow-hidden rounded-[24px] bg-background/65 p-4 backdrop-blur-xl ${
                            isBest
                              ? "border-gold/50 ring-1 ring-gold/20"
                              : ""
                          }`}
                        >
                          <div className="mm-card-sweep pointer-events-none" />

                          <div className="relative z-10">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="mm-market-index">
                                  {String(
                                    index + 1,
                                  ).padStart(2, "0")}
                                </span>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black">
                                    {row.record.market}

                                    {row.record
                                      .variety ? (
                                      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                        {
                                          row.record
                                            .variety
                                        }
                                        {row.record
                                          .grade
                                          ? ` · ${row.record.grade}`
                                          : ""}
                                      </span>
                                    ) : null}
                                  </p>

                                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <FreshnessBadge
                                      freshness={
                                        rowFreshness
                                      }
                                    />

                                    <span>
                                      {
                                        row.record
                                          .district
                                      }
                                    </span>

                                    <span>·</span>

                                    <span>
                                      {formatIstDate(
                                        row.record
                                          .date,
                                      )}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {isBest && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black text-primary-foreground shadow-lg shadow-primary/20">
                                  <Award className="size-3" />
                                  {t("bestChoice")}
                                </span>
                              )}
                            </div>

                            {/* PRICE STRIP */}
                            <div className="mt-4 grid min-w-0 grid-cols-3 gap-1 rounded-2xl border border-border/50 bg-muted/45 p-2.5 text-center sm:gap-2 sm:p-3">
                              <Cell
                                label={t("minPrice")}
                                value={inr(
                                  row.record
                                    .minPrice,
                                )}
                              />

                              <Cell
                                label={t("modalPrice")}
                                value={inr(
                                  row.record
                                    .modalPrice,
                                )}
                                accent
                                large
                              />

                              <Cell
                                label={t("maxPrice")}
                                value={inr(
                                  row.record
                                    .maxPrice,
                                )}
                              />
                            </div>

                            {/* PROFIT STRIP */}
                            <div className="mt-3 grid min-w-0 grid-cols-3 gap-1 border-t border-border/60 pt-3 text-center sm:gap-2">
                              <Cell
                                label="Gross"
                                value={inr(
                                  row.gross,
                                )}
                              />

                              <Cell
                                label={
                                  row.transport
                                    ? `${t(
                                        "transport",
                                      )} (est.)`
                                    : t(
                                        "transport",
                                      )
                                }
                                value={
                                  row.transport
                                    ? `- ${inr(
                                        row
                                          .transport
                                          .totalCost,
                                      )}`
                                    : "—"
                                }
                              />

                              <Cell
                                label={t(
                                  "netProfit",
                                )}
                                value={inr(
                                  row.net,
                                )}
                                accent
                              />
                            </div>

                            {/* TRANSPORT */}
                            {row.transport ? (
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-[10px] font-semibold leading-relaxed text-muted-foreground">
                                  <Truck className="size-3 shrink-0 text-primary" />

                                  <span>
                                    {location?.place ||
                                      location?.district ||
                                      "Your location"}{" "}
                                    →
                                  </span>

                                  <span>
                                    {row.record.market}
                                  </span>

                                  <span>
                                    · ~
                                    {
                                      row.transport
                                        .distanceKm
                                    }{" "}
                                    km
                                  </span>

                                  <span>
                                    ·{" "}
                                    {inr(
                                      row.transport
                                        .ratePerKm,
                                    )}
                                    /km
                                  </span>
                                </p>

                                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                              </div>
                            ) : (
                              <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                                <MapPin className="size-3 shrink-0" />
                                Distance unavailable —
                                transport not included.
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {result && (
              <div className="mm-divider mt-5 pt-4">
                <DataProvenance result={result} />

                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Transport is an estimate from road
                  distance × your ₹/km rate, not an
                  official freight rate. Commission is
                  the percentage you set.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}

function Cell({
  label,
  value,
  accent,
  large,
}: {
  label: string;
  value: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div>
      <p
        className={`truncate font-display font-black ${
          large
            ? "text-sm sm:text-base"
            : "text-xs sm:text-sm"
        } ${accent ? "text-primary" : ""}`}
      >
        {value}
      </p>

      <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-muted-foreground sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}