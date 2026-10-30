import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";

import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { UnavailableState } from "@/components/market-meta";
import { Reveal } from "@/components/reveal";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { CardSkeleton, RowSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";

import { useLang, type DictKey } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext, type FarmLocation } from "@/lib/location";
import { crops, findCrop, type Crop, type Lang } from "@/lib/crops";
import { latestPerMarket, marketPricesQuery } from "@/lib/market-queries";
import { getWeather } from "@/lib/weather-fetch";
import type { WeatherResult } from "@/lib/weather.functions";
import type { PriceRecord } from "@/lib/market-types";
import { inr, useIstNow } from "@/lib/format";
import { bestFarmingWindow, conditionLabel, todayInsight, uvLabel } from "@/lib/farm-insights";

import {
  ArrowRight,
  CheckCircle2,
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  Lightbulb,
  MapPin,
  Navigation,
  RefreshCw,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Dashboard — MarketMitra" },
      {
        name: "description",
        content:
          "Live mandi prices, local weather and market guidance for your district, updated from official sources.",
      },
      {
        property: "og:title",
        content: "Dashboard — MarketMitra",
      },
      {
        property: "og:description",
        content: "Live APMC prices and weather for your district in one place.",
      },
      {
        property: "og:url",
        content: "https://marketmitra.app/home",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://marketmitra.app/home",
      },
    ],
  }),
  component: HomePage,
});

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage() {
  const { t, lang } = useLang();
  const { profile } = useSession();
  const { location } = useLocationContext();

  const savedIds = profile?.saved_crops?.length ? profile.saved_crops : ["onion"];
  const primary = findCrop(savedIds[0]!) ?? crops[0]!;

  const priceQuery = useQuery(
    marketPricesQuery({
      commodity: primary.commodity,
      ...(location?.state ? { state: location.state } : {}),
      ...(location?.district ? { district: location.district } : {}),
    }),
  );

  const weatherQuery = useQuery({
    queryKey: ["weather", location?.latitude, location?.longitude],
    enabled: Boolean(location?.latitude != null && location?.longitude != null),
    queryFn: () => getWeather(location!.latitude!, location!.longitude!),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const records = latestPerMarket(priceQuery.data?.records ?? []);
  const best = records[0];
  const weather = weatherQuery.data?.ok ? weatherQuery.data : null;

  const marketCount = new Set(records.map((record) => record.market)).size;
  const avgModal = records.length
    ? Math.round(records.reduce((sum, record) => sum + record.modalPrice, 0) / records.length)
    : 0;
  const spread = best ? Math.max(best.maxPrice - best.minPrice, 0) : 0;
  const farmingWindow = weather ? bestFarmingWindow(weather) : null;

  const WeatherIcon = weather
    ? weather.current.code <= 1
      ? Sun
      : weather.current.code >= 51
        ? CloudRain
        : CloudSun
    : CloudSun;

  const locationLabel = location?.place || location?.district || t("locationNeeded");

  return (
    <Screen>
      <main className="pb-12 pt-3 sm:pt-4">
        {/* =====================================================
            HEADER / WELCOME
        ===================================================== */}
        <Reveal>
          <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Agricultural Intelligence Dashboard
              </p>
              <h1 className="mt-0.5 font-display text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {profile?.full_name ? `Welcome, ${profile.full_name}` : "MarketMitra Overview"}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-[11px] font-bold text-foreground shadow-xs">
                <MapPin className="size-3 text-primary" />
                <span className="truncate max-w-[140px] sm:max-w-xs">{locationLabel}</span>
              </span>
              <span className="hidden text-border sm:inline">|</span>
              <span className="tabular-nums text-[11px]">
                <LiveClock />
              </span>
            </div>
          </header>
        </Reveal>

        <div className="space-y-6 sm:space-y-7">
          {/* ===================================================
              TOP SECTION: WEATHER SUMMARY + LOCATION SELECTOR
          =================================================== */}
          <section className="grid gap-5 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <Reveal delay={40}>
                <WeatherSummaryCard
                  weather={weather}
                  weatherIcon={WeatherIcon}
                  farmingWindow={farmingWindow}
                  weatherPending={weatherQuery.isPending}
                  weatherLinkLabel={t("weather")}
                  insight={weather ? todayInsight(weather) : null}
                  locationLabel={locationLabel}
                  hasLocation={Boolean(location?.latitude != null && location?.longitude != null)}
                  onRetry={() => void weatherQuery.refetch()}
                  t={t}
                />
              </Reveal>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <Reveal delay={80}>
                <LocationCard className="h-full" />
              </Reveal>
            </div>
          </section>

          {/* ===================================================
              MARKET INTELLIGENCE (PRIMARY METRIC CENTERPIECE)
          =================================================== */}
          <Reveal delay={120}>
            <MarketIntelligenceCard
              primary={primary}
              lang={lang}
              location={location}
              priceQuery={priceQuery}
              records={records}
              best={best}
              marketCount={marketCount}
              avgModal={avgModal}
              spread={spread}
              t={t}
            />
          </Reveal>

          {/* ===================================================
              BOTTOM ROW: TODAY'S CROP PRICES + FIELD SIGNAL
          =================================================== */}
          <section className="grid gap-5 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <Reveal delay={160}>
                <MarketActivity
                  records={records}
                  primary={primary}
                  lang={lang}
                  priceQuery={priceQuery}
                  location={location}
                  t={t}
                />
              </Reveal>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              {weather ? (
                <Reveal delay={200}>
                  <FieldSignal weather={weather} />
                </Reveal>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-center">
                  <Leaf className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-2 text-xs font-bold text-foreground">Field Signal</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Connect your location to view localized field spray and farming windows.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Fallback weather error state */}
          {!weather && location?.latitude != null && weatherQuery.data && !weatherQuery.data.ok && (
            <Reveal delay={220}>
              <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-destructive">
                  <CloudSun className="size-4 shrink-0" />
                  <span className="font-semibold">Weather service temporarily unreachable.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-bold"
                  onClick={() => void weatherQuery.refetch()}
                >
                  <RefreshCw className="mr-1 size-3" />
                  {t("retry")}
                </Button>
              </div>
            </Reveal>
          )}
        </div>
      </main>
    </Screen>
  );
}

function LiveClock() {
  const { timeLabel } = useIstNow();
  return <>{timeLabel} IST</>;
}

/* =========================================================
   RESTRAINED, STATIC FOREST-GREEN WEATHER SUMMARY CARD
========================================================= */

type ActiveWeather = Extract<WeatherResult, { ok: true }>;

function WeatherSummaryCard({
  weather,
  weatherIcon: WeatherIcon,
  farmingWindow,
  weatherPending,
  weatherLinkLabel,
  insight,
  locationLabel,
  hasLocation,
  onRetry,
  t,
}: {
  weather: ActiveWeather | null;
  weatherIcon: ComponentType<{ className?: string; strokeWidth?: number }>;
  farmingWindow: ReturnType<typeof bestFarmingWindow> | null;
  weatherPending: boolean;
  weatherLinkLabel: string;
  insight: string | null;
  locationLabel: string;
  hasLocation: boolean;
  onRetry: () => void;
  t: (key: DictKey) => string;
}) {
  if (weatherPending) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mt-4 h-12 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
          <div className="h-14 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!hasLocation) {
    return (
      <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-[#103826] p-5 text-white shadow-xs sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-200">
            <CloudSun className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t("weather")} · Real-time
            </span>
          </div>
          <p className="mt-3 text-base font-extrabold sm:text-lg">Local Weather Unavailable</p>
          <p className="mt-1 text-xs text-emerald-100/80">
            Select your district or use GPS location to view live temperature, rain probability, and
            field advisory.
          </p>
        </div>
        <div className="mt-5 border-t border-white/10 pt-3">
          <Link
            to="/weather"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 transition-colors hover:text-white"
          >
            {weatherLinkLabel} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-[#103826] p-5 text-white shadow-xs sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-200">
            <CloudSun className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("weather")}</span>
          </div>
          <p className="mt-3 text-sm font-extrabold sm:text-base">Unable to load live weather</p>
          <p className="mt-1 text-xs text-emerald-100/80">
            We could not fetch data for {locationLabel}. Please retry.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            className="h-8 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="size-3" />
            {t("retry")}
          </Button>
          <Link
            to="/weather"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 transition-colors hover:text-white"
          >
            {weatherLinkLabel} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#174831] bg-[#0e3322] p-5 text-white shadow-xs sm:p-6">
      {/* Top row: Condition, Time, Location */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              {t("weather")}
            </span>
            <span className="text-emerald-500">·</span>
            <span className="truncate text-[10px] font-bold text-emerald-100/80">
              {locationLabel}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-3">
            <div className="font-display text-4xl font-black tracking-tight sm:text-5xl">
              <AnimatedNumber value={weather.current.temperature} suffix="°C" />
            </div>
            <div>
              <p className="text-xs font-extrabold sm:text-sm">
                {conditionLabel(weather.current.code)}
              </p>
              <p className="text-[10px] font-semibold text-emerald-200/75">
                Feels like {weather.current.apparent}°C
              </p>
            </div>
          </div>
        </div>

        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-200 sm:size-14">
          <WeatherIcon className="size-6 sm:size-7" strokeWidth={1.75} />
        </div>
      </div>

      {/* Insight */}
      {insight && (
        <p className="mt-3 text-xs font-medium leading-relaxed text-emerald-100/90 sm:text-[13px]">
          {insight}
        </p>
      )}

      {/* Weather Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            <Droplets className="size-3.5" />
            <span>{t("humidity")}</span>
          </div>
          <p className="mt-1 text-xs font-black sm:text-sm">{weather.current.humidity}%</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            <Wind className="size-3.5" />
            <span>{t("wind")}</span>
          </div>
          <p className="mt-1 text-xs font-black sm:text-sm">{weather.current.wind} km/h</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            <CloudRain className="size-3.5" />
            <span>{t("rainChance")}</span>
          </div>
          <p className="mt-1 text-xs font-black sm:text-sm">{weather.current.rainChance}%</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            <Sun className="size-3.5" />
            <span>UV Index</span>
          </div>
          <p className="mt-1 text-xs font-black sm:text-sm">{uvLabel(weather.current.uvIndex)}</p>
        </div>
      </div>

      {/* Bottom bar: Farming window & full link */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-3">
        {farmingWindow ? (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200">
            <Lightbulb className="size-3.5 shrink-0 text-amber-300" />
            <span>Field window: {farmingWindow.window}</span>
          </div>
        ) : (
          <span />
        )}

        <Link
          to="/weather"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-200 transition-colors hover:text-white"
        >
          {weatherLinkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   MARKET INTELLIGENCE (PRIMARY METRIC CENTERPIECE)
========================================================= */

function MarketIntelligenceCard({
  primary,
  lang,
  location,
  priceQuery,
  records,
  best,
  marketCount,
  avgModal,
  spread,
  t,
}: {
  primary: Crop;
  lang: Lang;
  location: FarmLocation | null;
  priceQuery: ReturnType<typeof useQuery>;
  records: PriceRecord[];
  best: PriceRecord | undefined;
  marketCount: number;
  avgModal: number;
  spread: number;
  t: (key: DictKey) => string;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6 lg:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Official Market Intelligence
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-lg">
              {primary.emoji}
            </span>
            <h2 className="font-display text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {primary.name[lang]}
            </h2>
            <span className="hidden rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground sm:inline-block">
              {primary.commodity}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-3" />
            Validated APMC Data
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {!location?.district ? (
        <div className="py-8 text-center sm:py-10">
          <MapPin className="mx-auto size-8 text-muted-foreground/60" />
          <h3 className="mt-2 text-sm font-extrabold text-foreground">Select your district</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Choose your home district above to view official APMC mandi rates and market
            comparisons.
          </p>
        </div>
      ) : priceQuery.isPending ? (
        <div className="space-y-4 py-8">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="h-12 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-64 animate-pulse rounded bg-muted" />
        </div>
      ) : priceQuery.isError ? (
        <div className="py-6">
          <UnavailableState onRetry={() => void priceQuery.refetch()} />
        </div>
      ) : best ? (
        <div className="grid gap-6 pt-5 lg:grid-cols-12 lg:gap-8">
          {/* Primary Price Side (Left) */}
          <div className="lg:col-span-5 lg:border-r lg:border-border/70 lg:pr-8">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Highest Modal Rate
            </p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                <AnimatedNumber value={best.modalPrice} prefix="₹" formatIndian />
              </span>
              <span className="text-xs font-bold text-muted-foreground">/ quintal</span>
            </div>

            {/* Mandi & Location */}
            <div className="mt-3 flex items-center gap-1.5 text-xs font-extrabold text-foreground">
              <Navigation className="size-3.5 text-primary" />
              <span>
                {best.market} APMC ({best.district})
              </span>
            </div>

            {/* Price Range Indicator */}
            <div className="mt-6">
              <PriceRange min={best.minPrice} modal={best.modalPrice} max={best.maxPrice} />
            </div>

            {/* Min / Modal / Max Numbers */}
            <div className="mt-5 grid grid-cols-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-center">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {t("minPrice")}
                </p>
                <p className="mt-0.5 font-display text-xs font-extrabold tabular-nums sm:text-sm">
                  {inr(best.minPrice)}
                </p>
              </div>
              <div className="border-x border-border/70">
                <p className="text-[9px] font-bold uppercase tracking-wide text-primary">
                  {t("modalPrice")}
                </p>
                <p className="mt-0.5 font-display text-xs font-extrabold tabular-nums text-primary sm:text-sm">
                  {inr(best.modalPrice)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {t("maxPrice")}
                </p>
                <p className="mt-0.5 font-display text-xs font-extrabold tabular-nums sm:text-sm">
                  {inr(best.maxPrice)}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <Link
              to="/markets"
              search={{
                crop: primary.id,
                qty: 20,
              }}
              className="press mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-extrabold text-primary-foreground shadow-xs transition-opacity hover:opacity-95"
            >
              <span>Compare all markets</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* District Market Pulse Side (Right) */}
          <div className="min-w-0 lg:col-span-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">District Market Pulse</h3>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Modal rates across reporting markets in {location.district}
                </p>
              </div>

              {records.length > 0 && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  {marketCount} APMC {marketCount === 1 ? "mandi" : "mandis"}
                </span>
              )}
            </div>

            {records.length > 1 ? (
              <div className="mt-4">
                <MarketPulse records={records} />
              </div>
            ) : records.length === 1 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 text-xs text-muted-foreground">
                <p className="font-bold text-foreground">Single APMC market report available</p>
                <p className="mt-1 leading-relaxed">
                  Only 1 mandi has currently filed prices for {primary.name[lang]} in{" "}
                  {location.district} today. Tap &ldquo;Compare all markets&rdquo; to view rates
                  across neighboring districts.
                </p>
              </div>
            ) : null}

            {records.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-border/70 bg-card p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Reporting Mandis
                  </p>
                  <p className="mt-1 font-display text-sm font-black tabular-nums sm:text-base">
                    {marketCount}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    District Average
                  </p>
                  <p className="mt-1 font-display text-sm font-black tabular-nums sm:text-base">
                    {inr(avgModal)}
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Price Spread
                  </p>
                  <p className="mt-1 font-display text-sm font-black tabular-nums sm:text-base">
                    {inr(spread)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-6">
          <UnavailableState onRetry={() => void priceQuery.refetch()} />
        </div>
      )}
    </section>
  );
}

/* =========================================================
   STATIC, HIGH-PRECISION PRICE RANGE BAR
========================================================= */

function PriceRange({ min, modal, max }: { min: number; modal: number; max: number }) {
  const range = Math.max(max - min, 1);
  const position = Math.min(100, Math.max(0, ((modal - min) / range) * 100));

  return (
    <div>
      <div className="relative h-2 w-full rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${position}%` }}
        />
        <div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-xs"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground tabular-nums">
        <span>Min: {inr(min)}</span>
        <span className="text-primary">Modal: {inr(modal)}</span>
        <span>Max: {inr(max)}</span>
      </div>
    </div>
  );
}

/* =========================================================
   CLEAN, STATIC SVG MARKET PULSE CHART
========================================================= */

function MarketPulse({ records }: { records: Array<{ market: string; modalPrice: number }> }) {
  const validRecords = records
    .slice(0, 8)
    .filter((record) => Number.isFinite(Number(record.modalPrice)));

  if (validRecords.length < 2) return null;

  const width = 600;
  const height = 180;
  const paddingX = 20;
  const paddingY = 24;

  const values = validRecords.map((r) => Number(r.modalPrice));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = validRecords.map((record, index) => {
    const x = paddingX + (index / (validRecords.length - 1)) * (width - paddingX * 2);
    const y =
      height - paddingY - ((Number(record.modalPrice) - min) / range) * (height - paddingY * 2);
    return { x, y, market: record.market, value: record.modalPrice };
  });

  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPoints = [
    `${points[0]!.x.toFixed(1)},${height - paddingY}`,
    ...points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${points[points.length - 1]!.x.toFixed(1)},${height - paddingY}`,
  ].join(" ");

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/15 p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-36 w-full sm:h-40"
        role="img"
        aria-label="District modal price trend"
      >
        <defs>
          <linearGradient id="staticMarketGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingY + ratio * (height - paddingY * 2)}
            y2={paddingY + ratio * (height - paddingY * 2)}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#staticMarketGradient)" />

        {/* Trend Polyline */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={`${p.market}-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === 0 ? 4.5 : 3}
              className={i === 0 ? "fill-primary stroke-background" : "fill-primary"}
              strokeWidth={i === 0 ? 1.5 : 0}
            >
              <title>{`${p.market}: ${inr(p.value)}`}</title>
            </circle>
          </g>
        ))}
      </svg>

      <div className="flex items-center justify-between border-t border-border/60 px-2 pt-1 text-[9px] font-bold text-muted-foreground">
        <span>Min: {inr(Math.round(min))}</span>
        <span className="hidden sm:inline">{validRecords.length} reported mandis</span>
        <span>Max: {inr(Math.round(max))}</span>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD SIGNAL (COMPACT INFORMATIONAL CARD)
========================================================= */

function FieldSignal({ weather }: { weather: ActiveWeather }) {
  return (
    <Link
      to="/weather"
      className="group block rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:border-primary/50 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Leaf className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Field Signal
            </p>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <p className="mt-1 text-xs font-extrabold text-foreground sm:text-sm">
            {todayInsight(weather)}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-bold text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5">{weather.current.temperature}°C</span>
            <span className="rounded-md bg-muted px-2 py-0.5">
              {weather.current.humidity}% humidity
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5">
              {weather.current.wind} km/h wind
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   TODAY'S CROP PRICES (MARKET ACTIVITY)
========================================================= */

function MarketActivity({
  records,
  primary,
  lang,
  priceQuery,
  location,
  t,
}: {
  records: PriceRecord[];
  primary: Crop;
  lang: Lang;
  priceQuery: ReturnType<typeof useQuery>;
  location: FarmLocation | null;
  t: (key: DictKey) => string;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            APMC Market Activity
          </p>
          <h2 className="mt-0.5 font-display text-base font-black tracking-tight text-foreground sm:text-lg">
            {t("todayPrices")}
          </h2>
        </div>

        <Link
          to="/crops"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary/80"
        >
          {t("viewAll")}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {priceQuery.isPending && location?.district ? (
        <div className="mt-4">
          <RowSkeleton rows={3} />
        </div>
      ) : records.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-muted-foreground">
          {t("noPrices")}
        </div>
      ) : (
        <div className="mt-2 divide-y divide-border/60">
          {records.slice(0, 4).map((record, index) => (
            <Link
              key={`${record.market}-${record.variety}-${record.date}`}
              to="/market/$marketId"
              params={{
                marketId: record.market,
              }}
              search={{
                crop: primary.id,
                state: record.state,
                district: record.district,
              }}
              className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/30 sm:px-2 rounded-lg"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-sm font-black text-foreground">
                  {index === 0 ? "1" : primary.emoji}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-extrabold text-foreground sm:text-sm">
                      {record.market}
                    </p>
                    {index === 0 && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[8px] font-black uppercase text-primary">
                        Top Rate
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] font-medium text-muted-foreground">
                    {record.district} · {record.variety ?? primary.name[lang]}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="text-right">
                  <p className="font-display text-xs font-black tabular-nums text-foreground sm:text-sm">
                    {inr(record.modalPrice)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">/ quintal</p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
