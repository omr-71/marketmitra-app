import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { DataProvenance, FreshnessBadge, UnavailableState } from "@/components/market-meta";
import { Reveal } from "@/components/reveal";
import { CardSkeleton, RowSkeleton, StatSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { crops, findCrop } from "@/lib/crops";
import { latestPerMarket, marketPricesQuery } from "@/lib/market-queries";
import { getWeather } from "@/lib/weather-fetch";
import { inr, useIstNow } from "@/lib/format";
import { useCountUp } from "@/lib/use-count-up";
import { bestFarmingWindow, conditionLabel, todayInsight, uvLabel } from "@/lib/farm-insights";
import {
  Activity,
  ArrowRight,
  CloudRain,
  CloudSun,
  Droplets,
  Lightbulb,
  MapPin,
  Sparkles,
  Sun,
  ThermometerSun,
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
      { property: "og:title", content: "Dashboard — MarketMitra" },
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

function HomePage() {
  const { t, lang } = useLang();
  const { profile } = useSession();
  const { location } = useLocationContext();
  const now = useIstNow();

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

  const marketCount = new Set(records.map((r) => r.market)).size;
  const spread = best ? best.maxPrice - best.minPrice : 0;
  const avgModal = records.length
    ? Math.round(
        records.reduce((sum, r) => sum + r.modalPrice, 0) / records.length,
      )
    : 0;

  const farmingWindow = weather ? bestFarmingWindow(weather) : null;

  const WeatherIcon = weather
    ? weather.current.code <= 1
      ? Sun
      : weather.current.code >= 51
        ? CloudRain
        : CloudSun
    : CloudSun;

  return (
    <Screen>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="home-weather-hero grad-forest relative overflow-hidden px-4 pb-7 pt-5 text-primary-foreground sm:px-6 sm:pb-8 sm:pt-7 lg:rounded-4xl lg:px-9 lg:pb-10 lg:pt-9">
        <div className="weather-contour" aria-hidden="true" />

        {/* subtle architectural lines — not decorative gradients */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M0 330 C180 250 290 365 470 295 S760 185 920 260 S1080 330 1200 210"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M0 370 C190 290 300 395 490 325 S760 215 930 285 S1080 350 1200 240"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M760 0 C820 100 910 100 970 30 S1100 -10 1200 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="relative">
          {/* top identity row */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] opacity-65">
                {t("welcome")}
              </p>

              <h1 className="mt-1 truncate font-display text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                {profile?.full_name || "MarketMitra"}
              </h1>

              <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold opacity-75 sm:text-xs">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">
                  {location?.place ||
                    location?.district ||
                    t("locationNeeded")}
                </span>

                <span aria-hidden="true">·</span>

                <span className="shrink-0 tabular-nums">
                  {now.timeLabel} IST
                </span>
              </div>
            </div>

            {/* weather badge */}
            {weather && (
              <div className="weather-icon-enter relative grid size-12 shrink-0 place-items-center rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 sm:size-14">
                <span className="absolute inset-1 rounded-xl border border-primary-foreground/10" />
                <WeatherIcon
                  className="relative size-7 sm:size-8"
                  strokeWidth={1.7}
                />
              </div>
            )}
          </div>

          {weather ? (
            <div className="mt-8 grid gap-7 lg:mt-12 lg:grid-cols-[1fr_auto] lg:items-end">
              {/* temperature */}
              <div className="min-w-0">
                <div className="flex items-end gap-4">
                  <p className="weather-temp-enter font-display text-7xl font-extrabold leading-[0.72] tracking-[-0.06em] sm:text-8xl lg:text-[7.5rem]">
                    {weather.current.temperature}°
                  </p>

                  <div className="mb-1 min-w-0">
                    <p className="truncate text-sm font-extrabold sm:text-base">
                      {conditionLabel(weather.current.code)}
                    </p>

                    <p className="mt-1 truncate text-[10px] font-semibold opacity-70 sm:text-xs">
                      Feels like {weather.current.apparent}° ·{" "}
                      {now.dateLabel}
                    </p>
                  </div>
                </div>

                <p className="mt-6 max-w-xl text-[12px] font-semibold leading-relaxed opacity-90 sm:text-sm">
                  {todayInsight(weather)}
                </p>
              </div>

              {/* compact weather information */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[420px] lg:grid-cols-2">
                <GlassStat
                  icon={<Droplets className="size-4" />}
                  label={t("humidity")}
                  value={`${weather.current.humidity}%`}
                />

                <GlassStat
                  icon={<Wind className="size-4" />}
                  label={t("wind")}
                  value={`${weather.current.wind} km/h`}
                />

                <GlassStat
                  icon={<CloudRain className="size-4" />}
                  label={t("rainChance")}
                  value={`${weather.current.rainChance}%`}
                />

                <GlassStat
                  icon={<Sun className="size-4" />}
                  label="UV"
                  value={uvLabel(weather.current.uvIndex)}
                />
              </div>
            </div>
          ) : location?.latitude != null && weatherQuery.isPending ? (
            <div className="mt-8 h-16 w-44 rounded-2xl bg-primary-foreground/10" />
          ) : null}

          {/* bottom hero strip */}
          <div className="mt-7 border-t border-primary-foreground/10 pt-4 sm:mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {weather && farmingWindow ? (
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-foreground/10">
                    <Lightbulb className="size-3.5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wide opacity-60">
                      Best field window
                    </p>

                    <p className="truncate text-xs font-extrabold">
                      {farmingWindow.window}
                    </p>
                  </div>
                </div>
              ) : (
                <span />
              )}

              <Link
                to="/weather"
                className="nudge-icon flex w-fit items-center gap-1.5 text-xs font-extrabold opacity-90 hover:opacity-100"
              >
                {t("weather")}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BODY
      ========================================================= */}
      <div className="relative z-10 space-y-5 px-4 pt-4 sm:px-5 lg:-mt-5 lg:space-y-6 lg:px-8 lg:pt-0">
        <Reveal>
          <LocationCard />
        </Reveal>

        {/* =======================================================
            MARKET SNAPSHOT
        ======================================================= */}
        <Reveal delay={50}>
          <section className="card-surface overflow-hidden">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* left — decision */}
              <div className="border-b border-border/70 p-5 lg:border-b-0 lg:border-r lg:p-6">
                <div className="flex items-center gap-2">
                  <span className="tint-gold grid size-8 place-items-center rounded-xl">
                    <Sparkles className="size-4" />
                  </span>

                  <div>
                    <p className="eyebrow">Market signal</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
                      {primary.name[lang]}
                    </p>
                  </div>

                  {priceQuery.data && (
                    <FreshnessBadge
                      freshness={priceQuery.data.freshness}
                      className="ml-auto"
                    />
                  )}
                </div>

                {!location?.district ? (
                  <p className="mt-7 text-xs font-semibold leading-relaxed text-muted-foreground">
                    Select your district to see matching official market
                    prices.
                  </p>
                ) : priceQuery.isPending ? (
                  <div className="mt-7 space-y-3">
                    <div className="shimmer h-3 w-2/3 rounded-xl" />
                    <div className="shimmer h-12 w-40 rounded-2xl" />
                    <div className="shimmer h-3 w-full rounded-xl" />
                  </div>
                ) : priceQuery.isError ? (
                  <div className="mt-5">
                    <UnavailableState
                      onRetry={() => void priceQuery.refetch()}
                      message="The latest official market prices could not be loaded."
                    />
                  </div>
                ) : best ? (
                  <>
                    <p className="mt-6 text-xs font-semibold text-muted-foreground">
                      Highest reported modal rate
                    </p>

                    <div className="mt-1 flex items-end gap-3">
                      <p className="font-display text-4xl font-extrabold tracking-tight tabular-nums">
                        {inr(best.modalPrice)}
                      </p>

                      <span className="mb-1.5 rounded-lg bg-muted px-2 py-1 text-[10px] font-extrabold">
                        / quintal
                      </span>
                    </div>

                    <p className="mt-3 text-[13px] font-semibold leading-relaxed">
                      {primary.name[lang]} is reporting its highest rate at{" "}
                      <b className="font-extrabold">{best.market}</b>.
                    </p>

                    <div className="mt-5 grid grid-cols-3 divide-x divide-border/70 rounded-2xl bg-muted/50 py-3 text-center">
                      <Stat
                        label={t("minPrice")}
                        value={inr(best.minPrice)}
                      />
                      <Stat
                        label={t("modalPrice")}
                        value={inr(best.modalPrice)}
                      />
                      <Stat
                        label={t("maxPrice")}
                        value={inr(best.maxPrice)}
                      />
                    </div>

                    <Link
                      to="/markets"
                      search={{ crop: primary.id, qty: 20 }}
                      className="press nudge-icon mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl grad-primary text-sm font-extrabold text-primary-foreground"
                    >
                      {t("compareMarkets")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </>
                ) : (
                  <div className="mt-5">
                    <UnavailableState
                      onRetry={() => void priceQuery.refetch()}
                    />
                  </div>
                )}
              </div>

              {/* right — live visual */}
              <div className="relative min-w-0 p-5 lg:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">Live market pulse</p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Reported mandi rates across your selected district
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Live
                  </span>
                </div>

                {records.length > 1 ? (
                  <MarketPulse records={records} />
                ) : (
                  <div className="mt-6 flex h-32 items-center justify-center rounded-2xl bg-muted/35">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Market trend will appear when multiple live reports are
                      available.
                    </p>
                  </div>
                )}

                {records.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniMetric
                      label="Markets"
                      value={marketCount.toLocaleString("en-IN")}
                    />

                    <MiniMetric
                      label="Average"
                      value={inr(avgModal)}
                    />

                    <MiniMetric
                      label="Spread"
                      value={inr(spread)}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* =======================================================
            SMALL WEATHER SIGNAL
        ======================================================= */}
        {weather && (
          <Reveal delay={90}>
            <Link
              to="/weather"
              className="card-surface hover-lift group block overflow-hidden"
            >
              <div className="grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                <div className="flex items-center gap-3 border-b border-border/70 p-4 lg:border-b-0 lg:border-r lg:p-5">
                  <span className="tint-sky grid size-10 place-items-center rounded-2xl">
                    <WeatherIcon className="size-5" strokeWidth={1.7} />
                  </span>

                  <div>
                    <p className="eyebrow">Field signal</p>
                    <p className="mt-0.5 font-display text-xl font-extrabold tabular-nums">
                      {weather.current.temperature}°
                    </p>
                  </div>
                </div>

                <div className="min-w-0 p-4 lg:px-6 lg:py-5">
                  <p className="text-[13px] font-semibold leading-relaxed">
                    {todayInsight(weather)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Droplets className="size-3" />
                      {weather.current.humidity}% humidity
                    </span>

                    <span className="flex items-center gap-1">
                      <Wind className="size-3" />
                      {weather.current.wind} km/h
                    </span>

                    <span className="flex items-center gap-1">
                      <ThermometerSun className="size-3" />
                      Feels {weather.current.apparent}°
                    </span>
                  </div>
                </div>

                <div className="hidden items-center gap-2 px-5 text-xs font-extrabold text-primary lg:flex">
                  {t("viewAll")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* =======================================================
            RECENT PRICES
        ======================================================= */}
        <Reveal delay={120}>
          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Market activity</p>
                <h2 className="mt-1 font-display text-lg font-extrabold tracking-tight">
                  {t("todayPrices")}
                </h2>
              </div>

              <Link
                to="/crops"
                className="flex items-center gap-1 text-xs font-extrabold text-primary"
              >
                {t("viewAll")}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {priceQuery.isPending && location?.district ? (
              <div className="mt-3">
                <RowSkeleton rows={3} />
              </div>
            ) : records.length === 0 ? (
              <p className="card-surface mt-3 p-4 text-xs font-semibold text-muted-foreground">
                {location?.district
                  ? t("noPrices")
                  : "Select your district to see prices."}
              </p>
            ) : (
              <div className="card-surface mt-3 divide-y divide-border/70 overflow-hidden">
                {records.slice(0, 4).map((r, index) => (
                  <Link
                    key={`${r.market}-${r.variety}-${r.date}`}
                    to="/market/$marketId"
                    params={{ marketId: r.market }}
                    search={{
                      crop: primary.id,
                      state: r.state,
                      district: r.district,
                    }}
                    className="press grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 hover:bg-muted/40 sm:px-5"
                  >
                    <span className="tint-primary grid size-10 shrink-0 place-items-center rounded-2xl text-lg">
                      {primary.emoji}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[8px] font-extrabold">
                          {index + 1}
                        </span>

                        <p className="truncate text-sm font-extrabold">
                          {r.market}
                        </p>
                      </div>

                      <p className="mt-0.5 truncate pl-6 text-[11px] font-semibold text-muted-foreground">
                        {r.district} · {r.variety ?? primary.name[lang]}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-display text-sm font-extrabold tabular-nums">
                        {inr(r.modalPrice)}
                      </p>

                      {priceQuery.data && (
                        <FreshnessBadge
                          freshness={priceQuery.data.freshness}
                          className="mt-1"
                        />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {priceQuery.data && (
              <DataProvenance
                result={priceQuery.data}
                className="mt-3"
              />
            )}
          </div>
        </Reveal>

        {/* =======================================================
            WEATHER LOADING / ERROR
        ======================================================= */}
        {!weather &&
          location?.latitude != null &&
          weatherQuery.isPending && (
            <Reveal delay={140}>
              <CardSkeleton lines={3} />
            </Reveal>
          )}

        {!weather &&
          location?.latitude != null &&
          weatherQuery.data &&
          !weatherQuery.data.ok && (
            <Reveal delay={140}>
              <section className="card-surface p-5">
                <div className="flex items-center gap-2">
                  <span className="tint-sky grid size-8 place-items-center rounded-xl">
                    <CloudSun className="size-4" />
                  </span>

                  <p className="eyebrow">{t("weather")}</p>
                </div>

                <ErrorLine
                  message={weatherQuery.data.error}
                  onRetry={() => void weatherQuery.refetch()}
                  retryLabel={t("retry")}
                />
              </section>
            </Reveal>
          )}
      </div>
    </Screen>
  );
}

/* ===============================================================
   LIVE MARKET GRAPH
   Uses ONLY actual returned market records.
================================================================ */

function MarketPulse({
  records,
}: {
  records: Array<{ modalPrice: number }>;
}) {
  const values = records
    .slice(0, 8)
    .map((record) => Number(record.modalPrice))
    .filter((value) => Number.isFinite(value));

  if (values.length < 2) {
    return null;
  }

  const width = 620;
  const height = 150;
  const paddingX = 8;
  const paddingY = 14;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x =
      paddingX +
      (index / Math.max(values.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((value - min) / range) *
        (height - paddingY * 2);

    return { x, y, value };
  });

  const linePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${points[0]!.x},${height - paddingY}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${points[points.length - 1]!.x},${height - paddingY}`,
  ].join(" ");

  const last = points[points.length - 1]!;

  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl border border-border/60 bg-muted/25 px-2 py-3 sm:px-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-muted/40 to-transparent" />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="relative h-32 w-full"
        aria-label="Market modal price pulse"
      >
        <defs>
          <linearGradient
            id="marketPulseArea"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={width}
            y1={height * ratio}
            y2={height * ratio}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        ))}

        <polygon
          points={areaPoints}
          fill="url(#marketPulseArea)"
          className="text-primary"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />

        <circle
          cx={last.x}
          cy={last.y}
          r="5"
          className="fill-primary"
        />

        <circle
          cx={last.x}
          cy={last.y}
          r="9"
          className="fill-primary opacity-20"
        />
      </svg>

      <div className="relative mt-1 flex items-center justify-between px-1 text-[9px] font-bold text-muted-foreground">
        <span>{inr(Math.round(min))}</span>
        <span className="flex items-center gap-1">
          <Activity className="size-3" />
          {values.length} reports
        </span>
        <span>{inr(Math.round(max))}</span>
      </div>
    </div>
  );
}

/* ===============================================================
   SMALL COMPONENTS
================================================================ */

function GlassStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="weather-metric-enter min-w-0 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 px-3 py-3">
      <div className="flex min-w-0 items-center gap-1.5 text-[9px] font-bold uppercase opacity-75 sm:text-[10px]">
        {icon}
        {label}
      </div>

      <p className="mt-1 truncate text-xs font-extrabold sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate font-display text-sm font-extrabold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-extrabold tabular-nums">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function ErrorLine({
  message,
  onRetry,
  retryLabel,
}: {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-destructive">
        {message}
      </p>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onRetry}
        className="press mt-2"
      >
        {retryLabel}
      </Button>
    </div>
  );
}