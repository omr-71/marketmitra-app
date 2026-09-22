import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import {
  DataProvenance,
  FreshnessBadge,
  UnavailableState,
} from "@/components/market-meta";
import { Reveal } from "@/components/reveal";
import { CardSkeleton, RowSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { crops, findCrop } from "@/lib/crops";
import {
  latestPerMarket,
  marketPricesQuery,
} from "@/lib/market-queries";
import { getWeather } from "@/lib/weather-fetch";
import { inr, useIstNow } from "@/lib/format";
import {
  bestFarmingWindow,
  conditionLabel,
  todayInsight,
  uvLabel,
} from "@/lib/farm-insights";
import {
  ArrowRight,
  CloudRain,
  CloudSun,
  Droplets,
  Leaf,
  Lightbulb,
  MapPin,
  Navigation,
  RefreshCw,
  Sun,
  ThermometerSun,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";

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
        content:
          "Live APMC prices and weather for your district in one place.",
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

  const savedIds = profile?.saved_crops?.length
    ? profile.saved_crops
    : ["onion"];

  const primary = findCrop(savedIds[0]!) ?? crops[0]!;

  const priceQuery = useQuery(
    marketPricesQuery({
      commodity: primary.commodity,
      ...(location?.state ? { state: location.state } : {}),
      ...(location?.district ? { district: location.district } : {}),
    }),
  );

  const weatherQuery = useQuery({
    queryKey: [
      "weather",
      location?.latitude,
      location?.longitude,
    ],
    enabled: Boolean(
      location?.latitude != null &&
        location?.longitude != null,
    ),
    queryFn: () =>
      getWeather(
        location!.latitude!,
        location!.longitude!,
      ),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const records = latestPerMarket(
    priceQuery.data?.records ?? [],
  );

  const best = records[0];

  const weather = weatherQuery.data?.ok
    ? weatherQuery.data
    : null;

  const marketCount = new Set(
    records.map((record) => record.market),
  ).size;

  const avgModal = records.length
    ? Math.round(
        records.reduce(
          (sum, record) => sum + record.modalPrice,
          0,
        ) / records.length,
      )
    : 0;

  const spread = best
    ? best.maxPrice - best.minPrice
    : 0;

  const farmingWindow = weather
    ? bestFarmingWindow(weather)
    : null;

  const WeatherIcon = weather
    ? weather.current.code <= 1
      ? Sun
      : weather.current.code >= 51
        ? CloudRain
        : CloudSun
    : CloudSun;

  return (
    <Screen>
      <main className="space-y-6 pb-8">
        {/* =====================================================
            PREMIUM WEATHER HEADER
        ====================================================== */}

        <Reveal>
          <section className="home-weather-hero grad-forest relative overflow-hidden px-5 pb-6 pt-5 text-primary-foreground sm:px-7 sm:pb-8 sm:pt-7 lg:rounded-[2rem] lg:px-10 lg:pb-9 lg:pt-8">
            <div
              className="weather-contour"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute right-[-8%] top-[-18%] size-64 rounded-full border border-primary-foreground/10"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute right-[8%] top-[2%] size-40 rounded-full border border-primary-foreground/10"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
                    {t("welcome")}
                  </p>

                  <h1 className="mt-1 truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[2.15rem]">
                    {profile?.full_name || "MarketMitra"}
                  </h1>

                  <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold opacity-70">
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

                {weather && (
                  <div className="weather-icon-enter grid size-12 shrink-0 place-items-center rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 sm:size-14">
                    <WeatherIcon
                      className="size-6 sm:size-7"
                      strokeWidth={1.65}
                    />
                  </div>
                )}
              </div>

              {weather ? (
                <>
                  <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
                    <div className="min-w-0">
                      <div className="flex items-end gap-4">
                        <p className="weather-temp-enter font-display text-[5.5rem] font-extrabold leading-[0.72] tracking-[-0.075em] sm:text-[7rem] lg:text-[7.8rem]">
                          {weather.current.temperature}°
                        </p>

                        <div className="mb-1.5 min-w-0">
                          <p className="truncate text-sm font-extrabold sm:text-base">
                            {conditionLabel(
                              weather.current.code,
                            )}
                          </p>

                          <p className="mt-1 text-[10px] font-semibold opacity-65 sm:text-xs">
                            Feels like{" "}
                            {weather.current.apparent}°
                          </p>
                        </div>
                      </div>

                      <p className="mt-7 max-w-xl text-xs font-medium leading-relaxed opacity-80 sm:text-sm">
                        {todayInsight(weather)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <WeatherMetric
                        icon={<Droplets className="size-4" />}
                        label={t("humidity")}
                        value={`${weather.current.humidity}%`}
                      />

                      <WeatherMetric
                        icon={<Wind className="size-4" />}
                        label={t("wind")}
                        value={`${weather.current.wind} km/h`}
                      />

                      <WeatherMetric
                        icon={<CloudRain className="size-4" />}
                        label={t("rainChance")}
                        value={`${weather.current.rainChance}%`}
                      />

                      <WeatherMetric
                        icon={<Sun className="size-4" />}
                        label="UV"
                        value={uvLabel(
                          weather.current.uvIndex,
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-8 border-t border-primary-foreground/10 pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {farmingWindow ? (
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-foreground/10">
                            <Lightbulb className="size-4" />
                          </span>

                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-55">
                              Best field window
                            </p>

                            <p className="mt-0.5 truncate text-xs font-extrabold">
                              {farmingWindow.window}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span />
                      )}

                      <Link
                        to="/weather"
                        className="nudge-icon flex w-fit items-center gap-1.5 text-xs font-extrabold opacity-85 transition-opacity hover:opacity-100"
                      >
                        {t("weather")}
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              ) : location?.latitude != null &&
                weatherQuery.isPending ? (
                <div className="mt-10">
                  <div className="shimmer h-24 w-52 rounded-3xl bg-primary-foreground/10" />
                </div>
              ) : (
                <div className="mt-10 max-w-md">
                  <p className="text-sm font-semibold opacity-80">
                    Turn on your location to see live local
                    weather and field conditions.
                  </p>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* =====================================================
            LOCATION
        ====================================================== */}

        <Reveal delay={60}>
          <LocationCard />
        </Reveal>

        {/* =====================================================
            MARKET COMMAND CENTER
        ====================================================== */}

        <Reveal delay={100}>
          <section className="card-surface overflow-hidden">
            <div className="border-b border-border/70 px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Market today</p>

                  <div className="mt-1 flex items-center gap-2">
                    <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                      {primary.name[lang]}
                    </h2>

                    <span className="tint-primary grid size-8 place-items-center rounded-xl text-base">
                      {primary.emoji}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                    Official mandi reports from your selected
                    district
                  </p>
                </div>

                {priceQuery.data && (
                  <FreshnessBadge
                    freshness={priceQuery.data.freshness}
                  />
                )}
              </div>
            </div>

            {!location?.district ? (
              <div className="px-5 py-8 sm:px-7">
                <EmptyMarketState />
              </div>
            ) : priceQuery.isPending ? (
              <div className="space-y-4 px-5 py-7 sm:px-7">
                <div className="shimmer h-3 w-40 rounded-full" />
                <div className="shimmer h-14 w-48 rounded-2xl" />
                <div className="shimmer h-4 w-full rounded-full" />
              </div>
            ) : priceQuery.isError ? (
              <div className="px-5 py-7 sm:px-7">
                <UnavailableState
                  onRetry={() =>
                    void priceQuery.refetch()
                  }
                  message="The latest official market prices could not be loaded."
                />
              </div>
            ) : best ? (
              <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                {/* PRICE */}
                <div className="border-b border-border/70 px-5 py-7 sm:px-7 lg:border-b-0 lg:border-r">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Highest modal rate
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <p className="font-display text-5xl font-extrabold tracking-[-0.055em] tabular-nums sm:text-6xl">
                      {inr(best.modalPrice)}
                    </p>

                    <span className="mb-2 text-[10px] font-bold text-muted-foreground">
                      / quintal
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                    <Navigation className="size-3.5 text-primary" />
                    <span>{best.market}</span>
                  </div>

                  <div className="mt-7">
                    <PriceRange
                      min={best.minPrice}
                      modal={best.modalPrice}
                      max={best.maxPrice}
                    />
                  </div>

                  <div className="mt-7 grid grid-cols-3 border-y border-border/70 py-3">
                    <Metric
                      label={t("minPrice")}
                      value={inr(best.minPrice)}
                    />

                    <Metric
                      label={t("modalPrice")}
                      value={inr(best.modalPrice)}
                    />

                    <Metric
                      label={t("maxPrice")}
                      value={inr(best.maxPrice)}
                    />
                  </div>

                  <Link
                    to="/markets"
                    search={{
                      crop: primary.id,
                      qty: 20,
                    }}
                    className="press nudge-icon mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl grad-primary text-sm font-extrabold text-primary-foreground"
                  >
                    Compare all markets
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                {/* GRAPH */}
                <div className="min-w-0 px-5 py-7 sm:px-7">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold">
                        District market pulse
                      </p>

                      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">
                        Modal rates across reported markets
                      </p>
                    </div>

                    <span className="flex shrink-0 items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                      <span className="live-dot size-1.5 rounded-full bg-primary" />
                      Live
                    </span>
                  </div>

                  {records.length > 1 ? (
                    <MarketPulse records={records} />
                  ) : (
                    <div className="mt-6 flex h-44 items-center justify-center rounded-2xl border border-dashed border-border/70">
                      <p className="max-w-xs px-5 text-center text-xs font-semibold text-muted-foreground">
                        Market movement will appear when multiple
                        official reports are available.
                      </p>
                    </div>
                  )}

                  {records.length > 0 && (
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <QuietMetric
                        label="Markets"
                        value={marketCount.toLocaleString(
                          "en-IN",
                        )}
                      />

                      <QuietMetric
                        label="Average"
                        value={inr(avgModal)}
                      />

                      <QuietMetric
                        label="Spread"
                        value={inr(spread)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-5 py-7 sm:px-7">
                <UnavailableState
                  onRetry={() =>
                    void priceQuery.refetch()
                  }
                />
              </div>
            )}
          </section>
        </Reveal>

        {/* =====================================================
            FIELD SIGNAL
        ====================================================== */}

        {weather && (
          <Reveal delay={140}>
            <Link
              to="/weather"
              className="card-surface group block overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 px-5 py-5 sm:px-7">
                <div className="tint-sky grid size-11 shrink-0 place-items-center rounded-2xl">
                  <Leaf className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="eyebrow">Field signal</p>

                  <p className="mt-1 truncate text-sm font-extrabold">
                    {todayInsight(weather)}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground">
                    <span>
                      {weather.current.temperature}°
                    </span>

                    <span>
                      {weather.current.humidity}% humidity
                    </span>

                    <span>
                      {weather.current.wind} km/h wind
                    </span>
                  </div>
                </div>

                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </Link>
          </Reveal>
        )}

        {/* =====================================================
            MARKET ACTIVITY
        ====================================================== */}

        <Reveal delay={180}>
          <section>
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <p className="eyebrow">Market activity</p>

                <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight">
                  {t("todayPrices")}
                </h2>
              </div>

              <Link
                to="/crops"
                className="nudge-icon flex items-center gap-1 text-xs font-extrabold text-primary"
              >
                {t("viewAll")}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {priceQuery.isPending &&
            location?.district ? (
              <div className="mt-4">
                <RowSkeleton rows={3} />
              </div>
            ) : records.length === 0 ? (
              <div className="card-surface mt-4 px-5 py-6">
                <p className="text-xs font-semibold text-muted-foreground">
                  {location?.district
                    ? t("noPrices")
                    : "Select your district to see prices."}
                </p>
              </div>
            ) : (
              <div className="card-surface mt-4 overflow-hidden">
                {records.slice(0, 4).map(
                  (record, index) => (
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
                      className="press group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 px-4 py-4 last:border-b-0 sm:px-6"
                    >
                      <div className="relative grid size-10 place-items-center rounded-xl bg-muted/60 text-base">
                        {primary.emoji}

                        {index === 0 && (
                          <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-primary text-[7px] font-black text-primary-foreground">
                            1
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-extrabold">
                            {record.market}
                          </p>

                          {index === 0 && (
                            <span className="hidden shrink-0 text-[8px] font-bold uppercase tracking-wide text-primary sm:block">
                              Highest
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-[10px] font-semibold text-muted-foreground">
                          {record.district} ·{" "}
                          {record.variety ??
                            primary.name[lang]}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-display text-sm font-extrabold tabular-nums">
                          {inr(record.modalPrice)}
                        </p>

                        {priceQuery.data && (
                          <FreshnessBadge
                            freshness={
                              priceQuery.data.freshness
                            }
                            className="mt-1"
                          />
                        )}
                      </div>

                      <ArrowRight className="hidden size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
                    </Link>
                  ),
                )}
              </div>
            )}

            {priceQuery.data && (
              <DataProvenance
                result={priceQuery.data}
                className="mt-3"
              />
            )}
          </section>
        </Reveal>

        {/* =====================================================
            WEATHER ERROR
        ====================================================== */}

        {!weather &&
          location?.latitude != null &&
          weatherQuery.data &&
          !weatherQuery.data.ok && (
            <Reveal delay={220}>
              <section className="card-surface px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="tint-sky grid size-9 place-items-center rounded-xl">
                    <CloudSun className="size-4" />
                  </span>

                  <div>
                    <p className="eyebrow">
                      {t("weather")}
                    </p>

                    <p className="mt-0.5 text-xs font-bold">
                      Weather couldn't be refreshed.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="ml-auto press"
                    onClick={() =>
                      void weatherQuery.refetch()
                    }
                  >
                    <RefreshCw className="mr-1.5 size-3.5" />
                    {t("retry")}
                  </Button>
                </div>
              </section>
            </Reveal>
          )}

        {!weather &&
          location?.latitude != null &&
          weatherQuery.isPending && (
            <Reveal delay={220}>
              <CardSkeleton lines={3} />
            </Reveal>
          )}
      </main>
    </Screen>
  );
}

/* ===============================================================
   WEATHER METRIC
================================================================ */

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="weather-metric-enter rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.075] px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] opacity-60">
        {icon}
        {label}
      </div>

      <p className="mt-1.5 truncate text-xs font-extrabold sm:text-sm">
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   PRICE RANGE
================================================================ */

function PriceRange({
  min,
  modal,
  max,
}: {
  min: number;
  modal: number;
  max: number;
}) {
  const range = Math.max(max - min, 1);

  const position = Math.min(
    100,
    Math.max(
      0,
      ((modal - min) / range) * 100,
    ),
  );

  return (
    <div>
      <div className="relative h-2 rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-primary/20"
          style={{ width: `${position}%` }}
        />

        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-primary shadow-sm transition-[left] duration-700 ease-out"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-muted-foreground tabular-nums">
        <span>{inr(min)}</span>
        <span>{inr(max)}</span>
      </div>
    </div>
  );
}

/* ===============================================================
   MARKET GRAPH
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

  const width = 720;
  const height = 210;
  const paddingX = 10;
  const paddingY = 20;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = values.map(
    (value, index) => {
      const x =
        paddingX +
        (index /
          Math.max(values.length - 1, 1)) *
          (width - paddingX * 2);

      const y =
        height -
        paddingY -
        ((value - min) / range) *
          (height - paddingY * 2);

      return {
        x,
        y,
        value,
      };
    },
  );

  const linePoints = points
    .map(
      (point) =>
        `${point.x},${point.y}`,
    )
    .join(" ");

  const areaPoints = [
    `${points[0]!.x},${height - paddingY}`,
    ...points.map(
      (point) =>
        `${point.x},${point.y}`,
    ),
    `${points[points.length - 1]!.x},${height - paddingY}`,
  ].join(" ");

  return (
    <div className="market-pulse-enter mt-6 overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-44 w-full"
        role="img"
        aria-label="Market modal price pulse"
      >
        {[0.2, 0.4, 0.6, 0.8].map(
          (ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={width}
              y1={height * ratio}
              y2={height * ratio}
              stroke="currentColor"
              strokeOpacity="0.06"
              strokeWidth="1"
            />
          ),
        )}

        <polygon
          points={areaPoints}
          fill="currentColor"
          fillOpacity="0.035"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary market-line"
        />

        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}-${index}`}
            cx={point.x}
            cy={point.y}
            r={index === points.length - 1 ? 5 : 3}
            className="fill-primary"
            opacity={
              index === points.length - 1
                ? 1
                : 0.45
            }
          />
        ))}

        {(() => {
          const last =
            points[points.length - 1]!;

          return (
            <circle
              cx={last.x}
              cy={last.y}
              r="11"
              className="fill-primary"
              opacity="0.12"
            />
          );
        })()}
      </svg>

      <div className="flex items-center justify-between border-t border-border/60 px-3 py-2.5 text-[9px] font-bold text-muted-foreground">
        <span>
          {inr(Math.round(min))}
        </span>

        <span>
          {values.length} market reports
        </span>

        <span>
          {inr(Math.round(max))}
        </span>
      </div>
    </div>
  );
}

/* ===============================================================
   SMALL METRICS
================================================================ */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 text-center first:text-left last:text-right">
      <p className="truncate font-display text-sm font-extrabold tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function QuietMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate font-display text-sm font-extrabold tabular-nums">
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   EMPTY MARKET
================================================================ */

function EmptyMarketState() {
  return (
    <div className="flex items-center gap-4">
      <span className="tint-primary grid size-11 shrink-0 place-items-center rounded-2xl">
        <MapPin className="size-5" />
      </span>

      <div>
        <p className="text-sm font-extrabold">
          Select your district
        </p>

        <p className="mt-1 text-xs font-semibold leading-relaxed text-muted-foreground">
          We'll show matching official mandi prices here.
        </p>
      </div>
    </div>
  );
}