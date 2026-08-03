import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { crops, findCrop } from "@/lib/crops";
import { fetchMandiPrices } from "@/lib/market.functions";
import { fetchWeather } from "@/lib/weather.functions";
import { formatIstDateTime, inr } from "@/lib/format";
import {
  ArrowRight,
  BarChart3,
  CloudSun,
  Droplets,
  Landmark,
  Loader2,
  Sparkles,
  Store,
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
      fetchWeather({ data: { latitude: location!.latitude!, longitude: location!.longitude! } }),
    staleTime: 15 * 60 * 1000,
  });

  const records = priceQuery.data?.ok ? priceQuery.data.records : [];
  const best = records[0];
  const weather = weatherQuery.data?.ok ? weatherQuery.data : null;

  return (
    <Screen>
      <header className="px-5 pt-7">
        <p className="text-xs font-semibold text-muted-foreground">{t("welcome")}</p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">
          {profile?.full_name ?? "MarketMitra"}
        </h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {now.dateLabel} ·{" "}
          <span className="font-semibold tabular-nums text-foreground">{now.timeLabel} IST</span>
        </p>
      </header>

      <div className="mt-5 space-y-4 px-5">
        <LocationCard />

        {/* Weather */}
        <section className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{t("weather")}</p>
            <Link to="/weather" className="text-xs font-bold text-primary">
              {t("viewAll")}
            </Link>
          </div>
          {!location?.latitude ? (
            <p className="mt-3 text-xs text-muted-foreground">{t("locationNeeded")}</p>
          ) : weatherQuery.isPending ? (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </div>
          ) : weather ? (
            <>
              <div className="mt-3 flex items-end gap-3">
                <CloudSun className="size-9 text-primary" />
                <p className="text-4xl font-extrabold leading-none">{weather.current.temperature}°</p>
                <p className="mb-1 text-xs text-muted-foreground">
                  feels {weather.current.apparent}°
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                <Stat icon={<Droplets className="size-4 text-primary" />} label={t("humidity")} value={`${weather.current.humidity}%`} />
                <Stat icon={<Wind className="size-4 text-primary" />} label={t("wind")} value={`${weather.current.wind} km/h`} />
                <Stat icon={<CloudSun className="size-4 text-primary" />} label={t("rainChance")} value={`${weather.current.rainChance}%`} />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {t("lastUpdated")}: {formatIstDateTime(weather.updatedAt)} IST
              </p>
            </>
          ) : (
            <ErrorLine
              message={weatherQuery.data && !weatherQuery.data.ok ? weatherQuery.data.error : t("retry")}
              onRetry={() => void weatherQuery.refetch()}
              retryLabel={t("retry")}
            />
          )}
        </section>

        {/* Top market for the primary crop */}
        <section className="card-surface p-5">
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
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
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
                className="press grad-primary mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground"
              >
                {t("compareMarkets")} <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">{t("noPrices")}</p>
          )}
        </section>

        {/* Today's prices */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">{t("todayPrices")}</h2>
            <Link to="/crops" className="text-xs font-bold text-primary">
              {t("viewAll")}
            </Link>
          </div>

          {records.length === 0 ? (
            <p className="card-surface mt-3 p-4 text-xs text-muted-foreground">
              {location?.state ? t("noPrices") : t("locationNeeded")}
            </p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {records.slice(0, 5).map((r, i) => {
                const previous = records[i + 1];
                const change = previous ? ((r.modalPrice - previous.modalPrice) / previous.modalPrice) * 100 : 0;
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
              {priceQuery.data.source} · {t("lastUpdated")}: {formatIstDateTime(priceQuery.data.updatedAt)} IST
            </p>
          )}
        </section>

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
    </Screen>
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
