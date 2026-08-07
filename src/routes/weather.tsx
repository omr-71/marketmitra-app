import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { CardSkeleton, StatSkeleton } from "@/components/skeletons";
import { useLang } from "@/lib/i18n";
import { useLocationContext } from "@/lib/location";
import type { WeatherDay } from "@/lib/weather.functions";
import { getWeather } from "@/lib/weather-fetch";
import { formatIstDateTime, formatIstTime, formatIstWeekday } from "@/lib/format";
import {
  bestFarmingWindow,
  conditionLabel,
  farmingTips,
  harvestAdvice,
  todayInsight,
  uvLabel,
} from "@/lib/farm-insights";
import {
  AlertTriangle,
  CloudRain,
  CloudSun,
  Clock,
  Droplets,
  Gauge,
  Lightbulb,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  Sunrise,
  Sunset,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Farm weather — MarketMitra" },
      {
        name: "description",
        content:
          "Live temperature, humidity, wind, rain probability, UV index, air pressure, sunrise, sunset and a 7-day outlook for your farm location.",
      },
      { property: "og:title", content: "Farm weather — MarketMitra" },
      {
        property: "og:description",
        content: "Plan harvesting and transport around real rainfall probability and UV.",
      },
    ],
  }),
  component: WeatherPage,
});

function DayIcon({ day }: { day: WeatherDay }) {
  if (day.rainChance >= 60) return <CloudRain className="size-5 text-primary" />;
  if (day.rainChance >= 25) return <CloudSun className="size-5 text-primary" />;
  return <Sun className="size-5 text-warning" />;
}

function WeatherPage() {
  const { t } = useLang();
  const { location } = useLocationContext();

  const query = useQuery({
    queryKey: ["weather", location?.latitude, location?.longitude],
    enabled: Boolean(location?.latitude != null && location?.longitude != null),
    queryFn: () =>
      getWeather(location!.latitude!, location!.longitude!),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const data = query.data?.ok ? query.data : null;
  const wetDays = data?.days.filter((d) => d.rainChance >= 60) ?? [];

  return (
    <Screen>
      <TopBar
        title={t("weather")}
        subtitle={location?.place || location?.district || ""}
        back="/home"
        action={
          <button
            onClick={() => void query.refetch()}
            className="press grid size-9 place-items-center rounded-full bg-muted"
            aria-label={t("retry")}
          >
            <RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="space-y-4 px-5 pt-5 lg:px-0 lg:pt-7">
        <LocationCard />

        {!location?.latitude ? (
          <div className="card-surface hover-lift flex flex-col items-center gap-3 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-3xl bg-primary/10">
              <MapPin className="size-6 text-primary" />
            </span>
            <p className="max-w-md text-sm text-muted-foreground">
              Share your location to load the forecast for your farm — a district name alone cannot
              pinpoint rainfall.
            </p>
          </div>
        ) : query.isPending ? (
          <div className="space-y-4">
            <CardSkeleton lines={4} />
            <StatSkeleton />
            <CardSkeleton lines={6} />
          </div>
        ) : !data ? (
          <div className="card-surface hover-lift p-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </span>
            <p className="mt-3 text-sm font-semibold text-destructive">
              {query.data && !query.data.ok ? query.data.error : "Weather could not be loaded."}
            </p>
            <button
              onClick={() => void query.refetch()}
              className="press mt-4 rounded-full bg-muted px-4 py-2 text-xs font-bold"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
              <section className="card-surface hover-lift overflow-hidden p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-6xl font-extrabold leading-none">
                      {data.current.temperature}°
                    </p>
                    <p className="mt-2 text-sm font-bold">{conditionLabel(data.current.code)}</p>
                    <p className="text-xs text-muted-foreground">
                      Feels like {data.current.apparent}°
                    </p>
                  </div>
                  <CloudSun className="size-16 text-primary lg:size-20" />
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <Metric icon={<Droplets className="size-4 text-primary" />} label={t("humidity")} value={`${data.current.humidity}%`} />
                  <Metric icon={<Wind className="size-4 text-primary" />} label={t("wind")} value={`${data.current.wind} km/h`} />
                  <Metric icon={<CloudRain className="size-4 text-primary" />} label={t("rainChance")} value={`${data.current.rainChance}%`} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
                  <Metric icon={<Sunrise className="size-4 text-warning" />} label={t("sunrise")} value={formatIstTime(data.sunrise)} />
                  <Metric icon={<Sunset className="size-4 text-warning" />} label={t("sunset")} value={formatIstTime(data.sunset)} />
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground">
                  {data.source} · {t("lastUpdated")}: {formatIstDateTime(data.updatedAt)} IST
                </p>
              </section>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <TileStat
                    icon={<Sun className="size-4 text-warning" />}
                    label="UV index"
                    value={String(data.current.uvIndex)}
                    hint={uvLabel(data.current.uvIndex)}
                  />
                  <TileStat
                    icon={<Gauge className="size-4 text-primary" />}
                    label="Air pressure"
                    value={`${data.current.pressure}`}
                    hint="hPa"
                  />
                </div>

                <section className="card-surface hover-lift p-5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                    <Lightbulb className="size-4" /> Today's weather insight
                  </p>
                  <p className="mt-2.5 text-[15px] font-semibold leading-snug">{todayInsight(data)}</p>
                </section>

                <section className="card-surface hover-lift p-5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                    <Clock className="size-4" /> Best time for farming today
                  </p>
                  <p className="mt-2 font-display text-lg font-extrabold">
                    {bestFarmingWindow(data).window}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{bestFarmingWindow(data).reason}</p>
                </section>
              </div>
            </div>

            {wetDays.length > 0 && (
              <section className="rounded-3xl bg-warning/10 p-5 ring-1 ring-warning/30">
                <p className="flex items-center gap-2 text-sm font-extrabold text-warning">
                  <AlertTriangle className="size-4" /> {t("rainAlert")}
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-snug">
                  Rain is likely on {wetDays.map((d) => formatIstWeekday(d.date)).join(", ")} — up to{" "}
                  {Math.max(...wetDays.map((d) => d.rainMm))} mm. Cover harvested stock and plan mandi
                  trips around these days.
                </p>
              </section>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="card-surface hover-lift p-5">
                <p className="text-sm font-bold">{t("sevenDay")}</p>
                <div className="mt-3 space-y-2">
                  {data.days.map((day) => (
                    <div
                      key={day.date}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                    >
                      <DayIcon day={day} />
                      <p className="truncate text-sm font-bold">{formatIstWeekday(day.date)}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{day.rainChance}%</p>
                      <p className="text-sm font-extrabold">
                        {day.max}°{" "}
                        <span className="text-xs font-semibold text-muted-foreground">{day.min}°</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="space-y-4">
                <section className="card-surface hover-lift p-5">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Sprout className="size-4 text-primary" /> {t("harvestAdvice")}
                  </p>
                  <ul className="mt-3 space-y-2 text-[13px] font-semibold leading-snug">
                    {harvestAdvice(data.days).map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="card-surface hover-lift p-5">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Lightbulb className="size-4 text-primary" /> Farming tips for these conditions
                  </p>
                  <ul className="mt-3 space-y-2 text-[13px] font-semibold leading-snug">
                    {farmingTips(data).map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mx-auto mb-1 w-fit">{icon}</div>
      <p className="truncate text-sm font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function TileStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card-surface hover-lift p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{hint}</p>
    </div>
  );
}
