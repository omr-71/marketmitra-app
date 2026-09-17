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
  ArrowRight,
  Clock,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Lightbulb,
  MapPin,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
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
      { property: "og:url", content: "https://marketmitra.app/home" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/home" }],
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
    ? Math.round(records.reduce((sum, r) => sum + r.modalPrice, 0) / records.length)
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
      {/* ---------- Hero ---------- */}
      <section className="home-weather-hero grad-forest relative overflow-hidden px-4 pb-7 pt-5 text-primary-foreground sm:px-6 sm:pb-9 sm:pt-7 lg:rounded-4xl lg:px-9 lg:pb-16 lg:pt-10">
        <div className="weather-contour" aria-hidden="true" />
        <div className="relative grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:gap-8">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] opacity-70">{t("welcome")}</p>
                <h1 className="mt-1 truncate font-display text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                  {profile?.full_name || "MarketMitra"}
                </h1>
                <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold opacity-80 sm:text-xs">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{location?.place || location?.district || t("locationNeeded")}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0 tabular-nums">{now.timeLabel} IST</span>
                </p>
              </div>
              {weather && (
                <span className="weather-icon-enter grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/12 sm:size-14">
                  <WeatherIcon className="size-7 sm:size-8" strokeWidth={1.8} />
                </span>
              )}
            </div>

            {weather ? (
              <div className="mt-6 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-end gap-3 sm:mt-8 sm:gap-5">
                <p className="weather-temp-enter font-display text-6xl font-extrabold leading-[0.8] sm:text-7xl lg:text-8xl">
                  {weather.current.temperature}°
                </p>
                <div className="mb-0.5 min-w-0 sm:mb-1">
                  <p className="truncate text-sm font-extrabold sm:text-base">{conditionLabel(weather.current.code)}</p>
                  <p className="mt-1 truncate text-[10px] font-semibold opacity-75 sm:text-xs">
                    Feels like {weather.current.apparent}° · {now.dateLabel}
                  </p>
                </div>
              </div>
            ) : location?.latitude != null && weatherQuery.isPending ? (
              <div className="mt-6 h-14 w-40 rounded-2xl bg-[oklch(1_0_0/0.16)]" />
            ) : null}

            {weather && (
              <p className="mt-4 max-w-xl text-[12px] font-semibold leading-relaxed opacity-95 sm:text-sm">
                {todayInsight(weather)}
              </p>
            )}

            {weather && farmingWindow && (
              <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-3.5 py-3 text-[11px] font-semibold sm:mt-5 sm:text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-primary-foreground/10"><Clock className="size-3.5" /></span>
                  <span className="min-w-0"><span className="block text-[9px] font-bold uppercase opacity-70">Best field window</span><b className="block truncate font-extrabold">{farmingWindow.window}</b></span>
                </span>
                <Link
                  to="/weather"
                  className="nudge-icon flex shrink-0 items-center gap-1 font-extrabold"
                >
                  {t("viewAll")} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>

          {weather ? (
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 lg:content-start lg:gap-3">
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
              <div className="col-span-2 mt-1 grid min-w-0 grid-cols-3 divide-x divide-primary-foreground/15 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 py-3 sm:col-span-4 lg:col-span-2">
                <WeatherDetail icon={<ThermometerSun />} label="Feels" value={`${weather.current.apparent}°`} />
                <WeatherDetail icon={<Sunrise />} label="Sunrise" value={formatSunTime(weather.sunrise)} />
                <WeatherDetail icon={<Sunset />} label="Sunset" value={formatSunTime(weather.sunset)} />
              </div>
              <Link to="/weather" className="press col-span-2 mt-1 grid grid-cols-3 gap-1 rounded-2xl bg-primary-foreground/10 p-2 sm:col-span-4 lg:col-span-2">
                {weather.days.slice(1, 4).map((day) => (
                  <span key={day.date} className="min-w-0 rounded-xl px-1.5 py-1.5 text-center">
                    <span className="block text-[9px] font-bold uppercase opacity-70">{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short" }).format(new Date(day.date))}</span>
                    <span className="mt-1 block text-xs font-extrabold tabular-nums">{day.max}° <span className="opacity-60">{day.min}°</span></span>
                    <span className="mt-0.5 flex items-center justify-center gap-1 text-[9px] font-bold opacity-75"><Droplets className="size-2.5" />{day.rainChance}%</span>
                  </span>
                ))}
              </Link>
            </div>
          ) : (
              <div className="rounded-2xl bg-primary-foreground/10 p-4">
              <p className="text-sm font-extrabold">{t("weather")}</p>
              {weatherQuery.data && !weatherQuery.data.ok ? (
                <ErrorLine
                  message={weatherQuery.data.error}
                  onRetry={() => void weatherQuery.refetch()}
                  retryLabel={t("retry")}
                  onDark
                />
              ) : (
                <p className="mt-2 text-xs font-semibold opacity-85">{t("locationNeeded")}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Dashboard body ---------- */}
      <div className="relative z-10 space-y-5 px-4 pt-4 sm:px-5 lg:-mt-8 lg:space-y-6 lg:px-8 lg:pt-0">
        <Reveal><LocationCard /></Reveal>

        {/* Key numbers */}
        {!location?.district ? null : priceQuery.isPending ? (
          <StatSkeleton />
        ) : records.length > 0 ? (
          <Reveal delay={40} className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            <CounterCard label="Markets reporting" value={marketCount} accent="primary" />
            <CounterCard
              label={`${primary.name[lang]} top rate`}
              value={best?.modalPrice ?? 0}
              money
              accent="gold"
            />
            <CounterCard label="Average modal rate" value={avgModal} money accent="sky" />
            <CounterCard label="Price spread" value={spread} money accent="earthy" />
          </Reveal>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* Left column */}
          <div className="space-y-6">
            {/* Best market */}
            <Reveal delay={80} className="card-surface hover-lift overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border/70 px-5 py-4">
                <span className="tint-gold grid size-8 place-items-center rounded-xl">
                  <Sparkles className="size-4" />
                </span>
                <p className="eyebrow">{t("aiRecommendation")}</p>
              </div>

              <div className="p-5">
                {!location?.district ? (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Select your district to see matching official market prices.
                  </p>
                ) : priceQuery.isPending ? (
                  <div className="space-y-2.5">
                    <div className="shimmer h-3 w-3/4 rounded-xl" />
                    <div className="shimmer h-16 w-full rounded-2xl" />
                  </div>
                ) : priceQuery.isError ? (
                  <UnavailableState onRetry={() => void priceQuery.refetch()} message="The latest official market prices could not be loaded." />
                ) : best ? (
                  <>
                    <p className="text-[15px] font-semibold leading-relaxed">
                      {primary.name[lang]} is fetching the highest reported rate at{" "}
                      <b className="font-extrabold">{best.market}</b>, {best.district}.
                    </p>
                    <div className="mt-4 grid grid-cols-3 divide-x divide-border/70 rounded-2xl bg-muted/50 py-3 text-center">
                      <Stat label={t("minPrice")} value={inr(best.minPrice)} />
                      <Stat label={t("modalPrice")} value={inr(best.modalPrice)} />
                      <Stat label={t("maxPrice")} value={inr(best.maxPrice)} />
                    </div>
                    <Link
                      to="/markets"
                      search={{ crop: primary.id, qty: 20 }}
                      className="press nudge-icon grad-primary mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-extrabold text-primary-foreground lg:max-w-xs"
                    >
                      {t("compareMarkets")} <ArrowRight className="size-4" />
                    </Link>
                  </>
                ) : (
                  <UnavailableState onRetry={() => void priceQuery.refetch()} />
                )}
              </div>
            </Reveal>

            {/* Today's prices */}
            <Reveal delay={120}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-extrabold tracking-tight">
                  {t("todayPrices")}
                </h2>
                <Link to="/crops" className="text-xs font-extrabold text-primary">
                  {t("viewAll")}
                </Link>
              </div>

              {priceQuery.isPending && location?.district ? (
                <div className="mt-3">
                  <RowSkeleton rows={4} />
                </div>
              ) : records.length === 0 ? (
                <p className="card-surface mt-3 p-4 text-xs font-semibold text-muted-foreground">
                  {location?.district ? t("noPrices") : "Select your district to see prices."}
                </p>
              ) : (
                <div className="card-surface mt-3 divide-y divide-border/70 overflow-hidden">
                  {records.slice(0, 6).map((r) => {
                    return (
                      <Link
                        key={`${r.market}-${r.variety}-${r.date}`}
                        to="/market/$marketId"
                        params={{ marketId: r.market }}
                        search={{ crop: primary.id, state: r.state, district: r.district }}
                        className="press grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 hover:bg-muted/40"
                      >
                        <span className="tint-primary grid size-10 shrink-0 place-items-center rounded-2xl text-lg">
                          {primary.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold">{r.market}</p>
                          <p className="truncate text-[11px] font-semibold text-muted-foreground">
                            {r.district} · {r.variety ?? primary.name[lang]}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-display text-sm font-extrabold tabular-nums">
                            {inr(r.modalPrice)}
                          </p>
                          {priceQuery.data && <FreshnessBadge freshness={priceQuery.data.freshness} className="mt-1" />}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {priceQuery.data && <DataProvenance result={priceQuery.data} className="mt-3" />}
            </Reveal>
          </div>

          {/* Desktop intelligence rail; mobile stays focused on today's decision. */}
          <div className="hidden space-y-4 lg:block">
            {weather ? (
              <Panel
                tint="tint-sky"
                icon={<Lightbulb className="size-4" />}
                title="Weather outlook"
                to="/weather"
                viewAll={t("viewAll")}
              >
                <p className="text-[13px] font-semibold leading-relaxed">{todayInsight(weather)}</p>
                <div className="mt-4 space-y-2.5">
                  {weather.days.slice(0, 4).map((d) => (
                    <div
                      key={d.date}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-xs font-semibold"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <CloudSun className="size-3.5 shrink-0 text-sky" />
                        {new Intl.DateTimeFormat("en-IN", {
                          timeZone: "Asia/Kolkata",
                          weekday: "short",
                        }).format(new Date(d.date))}
                      </span>
                      <span className="text-muted-foreground tabular-nums">{d.rainChance}%</span>
                      <span className="font-display font-extrabold tabular-nums">
                        {d.max}° / {d.min}°
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : (
              location?.latitude != null && weatherQuery.isPending && <CardSkeleton lines={4} />
            )}

          </div>
        </div>
      </div>
    </Screen>
  );
}

const accentTint = {
  primary: "tint-primary",
  gold: "tint-gold",
  sky: "tint-sky",
  earthy: "tint-earthy",
} as const;

function CounterCard({
  label,
  value,
  money,
  accent = "primary",
}: {
  label: string;
  value: number;
  money?: boolean;
  accent?: keyof typeof accentTint;
}) {
  const shown = useCountUp(value);
  return (
    <div className="card-surface hover-lift relative min-w-0 overflow-hidden p-3.5 sm:p-4">
      <span className={`${accentTint[accent]} absolute inset-x-0 top-0 h-1`} />
      <p className="line-clamp-2 min-h-7 text-[10px] font-extrabold leading-snug text-muted-foreground sm:text-[11px]">{label}</p>
      <p className="mt-1.5 min-w-0 truncate font-display text-base font-extrabold tabular-nums leading-none sm:text-xl lg:text-2xl">
        {money ? inr(Math.round(shown)) : Math.round(shown).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function Panel({
  tint,
  icon,
  title,
  to,
  viewAll,
  children,
}: {
  tint: string;
  icon: React.ReactNode;
  title: string;
  to?: string;
  viewAll?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface hover-lift overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3.5">
        <span className={`${tint} grid size-8 shrink-0 place-items-center rounded-xl`}>{icon}</span>
        <p className="eyebrow truncate">{title}</p>
        {to && viewAll && (
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={to as any}
            className="ml-auto shrink-0 text-xs font-extrabold text-primary"
          >
            {viewAll}
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

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
    <div className="weather-metric-enter min-w-0 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/12 px-3 py-3">
      <div className="flex min-w-0 items-center gap-1.5 text-[9px] font-bold uppercase opacity-85 sm:text-[10px]">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-extrabold sm:text-sm">{value}</p>
    </div>
  );
}

function WeatherDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="min-w-0 px-2 text-center">
      <span className="mx-auto block w-fit [&_svg]:size-3.5">{icon}</span>
      <span className="mt-1 block text-[9px] font-bold uppercase opacity-65">{label}</span>
      <span className="mt-0.5 block truncate text-[10px] font-extrabold sm:text-xs">{value}</span>
    </span>
  );
}

function formatSunTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon && <div className="mx-auto mb-1 w-fit">{icon}</div>}
      <p className="truncate text-sm font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ErrorLine({
  message,
  onRetry,
  retryLabel,
  onDark = false,
}: {
  message: string;
  onRetry: () => void;
  retryLabel: string;
  onDark?: boolean;
}) {
  return (
    <div className="mt-3">
      <p className={`text-xs font-semibold ${onDark ? "text-primary-foreground" : "text-destructive"}`}>
        {message}
      </p>
      <Button
        type="button"
        variant={onDark ? "ghost" : "secondary"}
        size="sm"
        onClick={onRetry}
        className={`press mt-2 ${onDark ? "bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20" : ""}`}
      >
        {retryLabel}
      </Button>
    </div>
  );
}

