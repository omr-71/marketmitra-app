import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { CardSkeleton, RowSkeleton, StatSkeleton } from "@/components/skeletons";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { crops, findCrop } from "@/lib/crops";
import { fetchMandiPrices } from "@/lib/market.functions";
import { getWeather } from "@/lib/weather-fetch";
import { formatIstDateTime, inr, useIstNow } from "@/lib/format";
import { useCountUp } from "@/lib/use-count-up";
import { bestFarmingWindow, conditionLabel, todayInsight, uvLabel } from "@/lib/farm-insights";
import {
  ArrowRight,
  BarChart3,
  Clock,
  CloudRain,
  CloudSun,
  Droplets,
  Landmark,
  Lightbulb,
  Sparkles,
  Store,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/home")({
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

  const priceQuery = useQuery({
    queryKey: ["mandi", primary.commodity, location?.state, location?.district],
    enabled: Boolean(location?.state),
    queryFn: () =>
      fetchMandiPrices({
        data: {
          commodity: primary.commodity,
          state: location!.state,
          ...(location?.district ? { district: location.district } : {}),
        },
      }),
    staleTime: 10 * 60 * 1000,
  });

  const weatherQuery = useQuery({
    queryKey: ["weather", location?.latitude, location?.longitude],
    enabled: Boolean(location?.latitude != null && location?.longitude != null),
    queryFn: () =>
      getWeather(location!.latitude!, location!.longitude!),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const records = priceQuery.data?.ok ? priceQuery.data.records : [];
  const best = records[0];
  const weather = weatherQuery.data?.ok ? weatherQuery.data : null;

  const marketCount = new Set(records.map((r) => r.market)).size;
  const spread = best ? best.maxPrice - best.minPrice : 0;
  const avgModal = records.length
    ? Math.round(records.reduce((sum, r) => sum + r.modalPrice, 0) / records.length)
    : 0;

  return (
    <Screen>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 pt-7 lg:px-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{t("welcome")}</p>
          <h1 className="mt-0.5 truncate font-display text-2xl font-extrabold tracking-tight lg:text-3xl">
            {profile?.full_name ?? "MarketMitra"}
          </h1>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {now.dateLabel} ·{" "}
            <span className="font-semibold tabular-nums text-foreground">{now.timeLabel} IST</span>
          </p>
        </div>
      </header>

      <div className="mt-5 space-y-4 px-5 lg:px-0">
        <LocationCard />

        {/* Today's farming summary */}
        {weather && (
          <section className="grad-primary relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-float)] lg:p-6">
            <span className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-[oklch(1_0_0/0.14)] blur-2xl" />
            <div className="relative grid gap-5 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Today's farming summary
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <p className="font-display text-5xl font-extrabold leading-none">
                    {weather.current.temperature}°
                  </p>
                  <div className="mb-1">
                    <p className="text-sm font-bold">{conditionLabel(weather.current.code)}</p>
                    <p className="text-[11px] opacity-85">
                      {location?.place || location?.district || ""}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] font-semibold leading-snug opacity-95">
                  {todayInsight(weather)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <GlassStat icon={<Droplets className="size-4" />} label={t("humidity")} value={`${weather.current.humidity}%`} />
                <GlassStat icon={<Wind className="size-4" />} label={t("wind")} value={`${weather.current.wind} km/h`} />
                <GlassStat icon={<CloudRain className="size-4" />} label={t("rainChance")} value={`${weather.current.rainChance}%`} />
                <GlassStat icon={<Sun className="size-4" />} label="UV" value={uvLabel(weather.current.uvIndex)} />
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-[oklch(1_0_0/0.14)] px-4 py-3 text-[12px] font-semibold backdrop-blur-sm">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" /> Best time for farming today:{" "}
                <b className="font-extrabold">{bestFarmingWindow(weather).window}</b>
              </span>
              <Link to="/weather" className="ml-auto flex items-center gap-1 font-bold underline-offset-2 hover:underline">
                {t("viewAll")} <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </section>
        )}

        {!weather && location?.latitude != null && weatherQuery.isPending && <CardSkeleton lines={4} />}

        {!location?.latitude && (
          <section className="card-surface hover-lift p-5">
            <p className="text-sm font-bold">{t("weather")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("locationNeeded")}</p>
          </section>
        )}

        {weatherQuery.data && !weatherQuery.data.ok && (
          <section className="card-surface hover-lift p-5">
            <p className="text-sm font-bold">{t("weather")}</p>
            <ErrorLine
              message={weatherQuery.data.error}
              onRetry={() => void weatherQuery.refetch()}
              retryLabel={t("retry")}
            />
          </section>
        )}

        {/* Statistics */}
        {priceQuery.isPending && location?.state ? (
          <StatSkeleton />
        ) : records.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CounterCard label="Markets reporting" value={marketCount} />
            <CounterCard label={`${primary.name[lang]} top rate`} value={best?.modalPrice ?? 0} money />
            <CounterCard label="Average modal rate" value={avgModal} money />
            <CounterCard label="Price spread" value={spread} money />
          </div>
        ) : null}

        {/* Best market recommendation */}
        <section className="card-surface hover-lift p-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/12">
              <Sparkles className="size-4 text-primary" />
            </span>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {t("aiRecommendation")}
            </p>
          </div>

          {!location?.state ? (
            <p className="mt-3 text-xs text-muted-foreground">{t("locationNeeded")}</p>
          ) : priceQuery.isPending ? (
            <div className="mt-4 space-y-2.5">
              <div className="shimmer h-3 w-3/4 rounded-xl" />
              <div className="shimmer h-16 w-full rounded-2xl" />
            </div>
          ) : priceQuery.data && !priceQuery.data.ok ? (
            <ErrorLine
              message={priceQuery.data.error}
              onRetry={() => void priceQuery.refetch()}
              retryLabel={t("retry")}
            />
          ) : best ? (
            <>
              <p className="mt-3 text-[15px] font-semibold leading-snug">
                {primary.name[lang]} is fetching the highest reported rate at{" "}
                <b>{best.market}</b>, {best.district}.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
                <Stat label={t("minPrice")} value={inr(best.minPrice)} />
                <Stat label={t("modalPrice")} value={inr(best.modalPrice)} />
                <Stat label={t("maxPrice")} value={inr(best.maxPrice)} />
              </div>
              <Link
                to="/markets"
                search={{ crop: primary.id, qty: 20 }}
                className="press grad-primary mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground lg:max-w-xs"
              >
                {t("compareMarkets")} <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">{t("noPrices")}</p>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* Today's prices */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">{t("todayPrices")}</h2>
              <Link to="/crops" className="text-xs font-bold text-primary">
                {t("viewAll")}
              </Link>
            </div>

            {priceQuery.isPending && location?.state ? (
              <div className="mt-3">
                <RowSkeleton rows={4} />
              </div>
            ) : records.length === 0 ? (
              <p className="card-surface hover-lift mt-3 p-4 text-xs text-muted-foreground">
                {location?.state ? t("noPrices") : t("locationNeeded")}
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {records.slice(0, 6).map((r, i) => {
                  const previous = records[i + 1];
                  const change = previous
                    ? ((r.modalPrice - previous.modalPrice) / previous.modalPrice) * 100
                    : 0;
                  const up = change >= 0;
                  return (
                    <Link
                      key={`${r.market}-${r.variety}-${r.arrivalDate}`}
                      to="/market/$marketId"
                      params={{ marketId: r.market }}
                      search={{ crop: primary.id, state: r.state }}
                      className="press card-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-lg">
                        {primary.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{r.market}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {r.district} · {r.variety ?? primary.name[lang]}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold">{inr(r.modalPrice)}</p>
                        <p
                          className={`flex items-center justify-end gap-0.5 text-[11px] font-bold ${
                            up ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                          {Math.abs(change).toFixed(1)}%
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {priceQuery.data?.ok && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                {priceQuery.data.source} · {t("lastUpdated")}:{" "}
                {formatIstDateTime(priceQuery.data.updatedAt)} IST
              </p>
            )}
          </section>

          <div className="space-y-4">
            {weather && (
              <section className="card-surface hover-lift p-5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                  <Lightbulb className="size-4" /> Today's weather insight
                </p>
                <p className="mt-2.5 text-[14px] font-semibold leading-snug">{todayInsight(weather)}</p>
                <div className="mt-4 space-y-2">
                  {weather.days.slice(0, 4).map((d) => (
                    <div key={d.date} className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CloudSun className="size-3.5 text-primary" />
                        {new Intl.DateTimeFormat("en-IN", {
                          timeZone: "Asia/Kolkata",
                          weekday: "short",
                        }).format(new Date(d.date))}
                      </span>
                      <span className="text-muted-foreground">{d.rainChance}% rain</span>
                      <span className="font-extrabold">
                        {d.max}° / {d.min}°
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick actions */}
            <section>
              <h2 className="text-sm font-bold">{t("quickActions")}</h2>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                <QuickAction to="/crops" icon={<Store className="size-5 text-primary" />} label={t("selectCrop")} />
                <QuickAction
                  to="/predict"
                  search={{ crop: primary.id, market: best?.market ?? "", state: location?.state ?? "" }}
                  icon={<BarChart3 className="size-5 text-primary" />}
                  label={t("pricePrediction")}
                />
                <QuickAction to="/schemes" icon={<Landmark className="size-5 text-primary" />} label={t("schemes")} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function CounterCard({ label, value, money }: { label: string; value: number; money?: boolean }) {
  const shown = useCountUp(value);
  return (
    <div className="card-surface hover-lift p-4">
      <p className="truncate text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-xl font-extrabold tabular-nums leading-none lg:text-2xl">
        {money ? inr(Math.round(shown)) : Math.round(shown).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function GlassStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[oklch(1_0_0/0.14)] px-3 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide opacity-85">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-extrabold">{value}</p>
    </div>
  );
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
}: {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-destructive">{message}</p>
      <button onClick={onRetry} className="press mt-2 rounded-full bg-muted px-3 py-1.5 text-[11px] font-bold">
        {retryLabel}
      </button>
    </div>
  );
}

function QuickAction({
  to,
  search,
  icon,
  label,
}: {
  to: string;
  search?: Record<string, unknown>;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search={search as any}
      className="press card-surface flex flex-col items-center gap-2 px-2 py-4 text-center"
    >
      {icon}
      <span className="line-clamp-2 text-[11px] font-bold leading-tight">{label}</span>
    </Link>
  );
}
