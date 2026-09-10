import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { SourceNote } from "@/components/source-note";
import { CardSkeleton, RowSkeleton, StatSkeleton } from "@/components/skeletons";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useLocationContext } from "@/lib/location";
import { crops, findCrop } from "@/lib/crops";
import { fetchMandiPrices } from "@/lib/market.functions";
import { schemes } from "@/lib/schemes";
import { latestDiagnosisContext } from "@/lib/diagnose.functions";
import { loadLatestThread } from "@/lib/chat-history";
import { useAuth } from "@/lib/auth";
import { getWeather } from "@/lib/weather-fetch";
import { inr, useIstNow } from "@/lib/format";
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
  Leaf,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Store,
  Sun,
  TrendingDown,
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
    queryFn: () => getWeather(location!.latitude!, location!.longitude!),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const { user } = useAuth();

  const diagnosisQuery = useQuery({
    queryKey: ["latest-diagnosis", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => latestDiagnosisContext(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const diagnosis = diagnosisQuery.data ?? null;

  const chatQuery = useQuery({
    queryKey: ["latest-chat", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => loadLatestThread(user!.id),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const chatMessages = chatQuery.data?.messages ?? [];
  const lastChat =
    chatMessages
      .slice()
      .reverse()
      .map((m) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""))
      .find((text) => text.trim().length > 0) ?? null;

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
      {/* ---------- Hero ---------- */}
      <section className="grad-forest relative overflow-hidden px-5 pb-16 pt-8 text-primary-foreground lg:rounded-4xl lg:px-8 lg:pb-20 lg:pt-10">
        <span className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[oklch(1_0_0/0.1)]" />
        <span className="pointer-events-none absolute -bottom-24 -left-10 size-48 rounded-full bg-[oklch(1_0_0/0.07)]" />

        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] opacity-75">
              {t("welcome")}
            </p>
            <h1 className="mt-1 truncate font-display text-[26px] font-extrabold leading-tight tracking-tight lg:text-4xl">
              {profile?.full_name ?? "MarketMitra"}
            </h1>
            <p className="mt-1.5 text-xs font-semibold opacity-80">
              {now.dateLabel} · <span className="tabular-nums">{now.timeLabel} IST</span>
            </p>

            {weather ? (
              <div className="mt-6 flex items-end gap-4">
                <p className="font-display text-6xl font-extrabold leading-none tracking-tight lg:text-7xl">
                  {weather.current.temperature}°
                </p>
                <div className="mb-1.5 min-w-0">
                  <p className="truncate text-sm font-extrabold">
                    {conditionLabel(weather.current.code)}
                  </p>
                  <p className="truncate text-[11px] font-semibold opacity-80">
                    {location?.place || location?.district || ""}
                  </p>
                </div>
              </div>
            ) : location?.latitude != null && weatherQuery.isPending ? (
              <div className="mt-6 h-14 w-40 rounded-2xl bg-[oklch(1_0_0/0.16)]" />
            ) : null}

            {weather && (
              <p className="mt-4 max-w-md text-[13px] font-semibold leading-relaxed opacity-95">
                {todayInsight(weather)}
              </p>
            )}

            {weather && (
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-[oklch(1_0_0/0.13)] px-4 py-3 text-[12px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0" />
                  <b className="font-extrabold">{bestFarmingWindow(weather).window}</b>
                </span>
                <Link
                  to="/weather"
                  className="nudge-icon ml-auto flex items-center gap-1 font-extrabold"
                >
                  {t("viewAll")} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>

          {weather ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
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
          ) : (
            <div className="rounded-3xl bg-[oklch(1_0_0/0.12)] p-5">
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
      <div className="relative z-10 -mt-10 space-y-6 px-5 lg:px-8">
        {/* Quick actions — thumb reachable on mobile, toolbar on desktop */}
        <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-6">
          <QuickAction
            to="/crops"
            tint="tint-primary"
            icon={<Store className="size-5" />}
            label={t("selectCrop")}
          />
          <QuickAction
            to="/markets"
            search={{ crop: primary.id, qty: 20 }}
            tint="tint-gold"
            icon={<Sparkles className="size-5" />}
            label={t("compareMarkets")}
          />
          <QuickAction
            to="/predict"
            search={{
              crop: primary.id,
              market: best?.market ?? "",
              state: location?.state ?? "",
            }}
            tint="tint-sky"
            icon={<BarChart3 className="size-5" />}
            label={t("pricePrediction")}
          />
          <QuickAction
            to="/weather"
            tint="tint-sky"
            icon={<CloudSun className="size-5" />}
            label={t("weather")}
          />
          <QuickAction
            to="/diagnose"
            tint="tint-primary"
            icon={<Leaf className="size-5" />}
            label={t("diagnose")}
          />
          <QuickAction
            to="/schemes"
            tint="tint-earthy"
            icon={<Landmark className="size-5" />}
            label={t("schemes")}
          />
        </div>

        <LocationCard />

        {/* Key numbers */}
        {priceQuery.isPending && location?.state ? (
          <StatSkeleton />
        ) : records.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CounterCard label="Markets reporting" value={marketCount} accent="primary" />
            <CounterCard
              label={`${primary.name[lang]} top rate`}
              value={best?.modalPrice ?? 0}
              money
              accent="gold"
            />
            <CounterCard label="Average modal rate" value={avgModal} money accent="sky" />
            <CounterCard label="Price spread" value={spread} money accent="earthy" />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* Left column */}
          <div className="space-y-6">
            {/* Best market */}
            <section className="card-surface hover-lift overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border/70 px-5 py-4">
                <span className="tint-gold grid size-8 place-items-center rounded-xl">
                  <Sparkles className="size-4" />
                </span>
                <p className="eyebrow">{t("aiRecommendation")}</p>
              </div>

              <div className="p-5">
                {!location?.state ? (
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("locationNeeded")}
                  </p>
                ) : priceQuery.isPending ? (
                  <div className="space-y-2.5">
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
                  <p className="text-xs font-semibold text-muted-foreground">{t("noPrices")}</p>
                )}
              </div>
            </section>

            {/* Today's prices */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-extrabold tracking-tight">
                  {t("todayPrices")}
                </h2>
                <Link to="/crops" className="text-xs font-extrabold text-primary">
                  {t("viewAll")}
                </Link>
              </div>

              {priceQuery.isPending && location?.state ? (
                <div className="mt-3">
                  <RowSkeleton rows={4} />
                </div>
              ) : records.length === 0 ? (
                <p className="card-surface mt-3 p-4 text-xs font-semibold text-muted-foreground">
                  {location?.state ? t("noPrices") : t("locationNeeded")}
                </p>
              ) : (
                <div className="card-surface mt-3 divide-y divide-border/70 overflow-hidden">
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
                          <p
                            className={`flex items-center justify-end gap-0.5 text-[11px] font-extrabold ${
                              up ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {up ? (
                              <TrendingUp className="size-3" />
                            ) : (
                              <TrendingDown className="size-3" />
                            )}
                            {Math.abs(change).toFixed(1)}%
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {priceQuery.data?.ok && <SourceNote result={priceQuery.data} className="mt-3" />}
            </section>
          </div>

          {/* Right rail */}
          <div className="space-y-4">
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

            {/* Latest crop check — real saved diagnosis */}
            <Panel
              tint="tint-primary"
              icon={<Leaf className="size-4" />}
              title="Latest crop check"
              to="/diagnose"
              viewAll={t("viewAll")}
            >
              {diagnosisQuery.isPending ? (
                <div className="space-y-2">
                  <div className="shimmer h-3 w-2/3 rounded-xl" />
                  <div className="shimmer h-10 w-full rounded-2xl" />
                </div>
              ) : diagnosis ? (
                <>
                  <p className="text-[14px] font-extrabold leading-snug">
                    {diagnosis.crop ?? "Crop"} · {diagnosis.condition ?? "Checked"}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                    {diagnosis.severity ? `${diagnosis.severity} · ` : ""}
                    {diagnosis.confidence != null ? `${diagnosis.confidence}% match · ` : ""}
                    {new Intl.DateTimeFormat("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric",
                      month: "short",
                    }).format(new Date(diagnosis.checkedAt))}
                  </p>
                  {diagnosis.treatment[0] && (
                    <p className="mt-3 rounded-2xl bg-muted/50 p-3 text-[12px] font-semibold leading-relaxed">
                      {diagnosis.treatment[0]}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">
                  No crop photo checked yet. Take a photo of an affected leaf to get guidance.
                </p>
              )}
            </Panel>

            {/* Mitra AI — continues the farmer's real last conversation */}
            <Panel tint="tint-earthy" icon={<MessageCircle className="size-4" />} title="Mitra AI">
              {lastChat ? (
                <p className="line-clamp-3 text-[13px] font-semibold leading-relaxed">{lastChat}</p>
              ) : (
                <p className="text-xs font-semibold text-muted-foreground">
                  Ask about prices, sprays, weather or schemes in your language.
                </p>
              )}
            </Panel>

            {/* Schemes — real published benefits */}
            <Panel
              tint="tint-gold"
              icon={<Landmark className="size-4" />}
              title={t("schemes")}
              to="/schemes"
              viewAll={t("viewAll")}
            >
              <div className="-mx-1 divide-y divide-border/70">
                {schemes.slice(0, 3).map((scheme) => (
                  <Link
                    key={scheme.id}
                    to="/schemes"
                    className="press block px-1 py-3 first:pt-0 last:pb-0"
                  >
                    <p className="truncate text-sm font-extrabold">{scheme.name}</p>
                    <p className="truncate text-[11px] font-semibold text-muted-foreground">
                      {scheme.benefit}
                    </p>
                  </Link>
                ))}
              </div>
            </Panel>
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
    <div className="card-surface hover-lift relative overflow-hidden p-4">
      <span className={`${accentTint[accent]} absolute inset-x-0 top-0 h-1`} />
      <p className="truncate text-[11px] font-extrabold text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-xl font-extrabold tabular-nums leading-none lg:text-2xl">
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
      <button
        onClick={onRetry}
        className="press mt-2 rounded-full bg-muted px-3 py-1.5 text-[11px] font-bold"
      >
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
