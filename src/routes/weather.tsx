import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { useLang } from "@/lib/i18n";
import { useLocationContext } from "@/lib/location";
import { fetchWeather, type WeatherDay } from "@/lib/weather.functions";
import { formatIstDateTime, formatIstTime, formatIstWeekday } from "@/lib/format";
import {
  AlertTriangle,
  CloudRain,
  CloudSun,
  Droplets,
  Loader2,
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
          "Live temperature, humidity, wind, rain probability, sunrise, sunset and a 7-day outlook for your farm location.",
      },
      { property: "og:title", content: "Farm weather — MarketMitra" },
      {
        property: "og:description",
        content: "Plan harvesting and transport around real rainfall probability.",
      },
    ],
  }),
  component: WeatherPage,
});

function conditionLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Mainly clear";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

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
      fetchWeather({ data: { latitude: location!.latitude!, longitude: location!.longitude! } }),
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

      <div className="space-y-4 px-5 pt-5">
        <LocationCard />

        {!location?.latitude ? (
          <p className="card-surface p-5 text-sm text-muted-foreground">
            Share your location to load the forecast for your farm — a district name alone cannot pinpoint
            rainfall.
          </p>
        ) : query.isPending ? (
          <div className="card-surface flex items-center gap-2 p-5 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {t("loading")}
          </div>
        ) : !data ? (
          <div className="card-surface p-5">
            <p className="text-sm font-semibold text-destructive">
              {query.data && !query.data.ok ? query.data.error : "Weather could not be loaded."}
            </p>
            <button
              onClick={() => void query.refetch()}
              className="press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <>
            <section className="card-surface p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-5xl font-extrabold leading-none">{data.current.temperature}°</p>
                  <p className="mt-1 text-sm font-semibold">{conditionLabel(data.current.code)}</p>
                  <p className="text-xs text-muted-foreground">Feels like {data.current.apparent}°</p>
                </div>
                <CloudSun className="size-14 text-primary" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <Metric icon={<Droplets className="size-4 text-primary" />} label={t("humidity")} value={`${data.current.humidity}%`} />
                <Metric icon={<Wind className="size-4 text-primary" />} label={t("wind")} value={`${data.current.wind} km/h`} />
                <Metric icon={<CloudRain className="size-4 text-primary" />} label={t("rainChance")} value={`${data.current.rainChance}%`} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-3 text-center">
                <Metric icon={<Sunrise className="size-4 text-warning" />} label={t("sunrise")} value={formatIstTime(data.sunrise)} />
                <Metric icon={<Sunset className="size-4 text-warning" />} label={t("sunset")} value={formatIstTime(data.sunset)} />
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground">
                {data.source} · {t("lastUpdated")}: {formatIstDateTime(data.updatedAt)} IST
              </p>
            </section>

            {wetDays.length > 0 && (
              <section className="rounded-3xl bg-warning/10 p-5 ring-1 ring-warning/30">
                <p className="flex items-center gap-2 text-sm font-extrabold text-warning">
                  <AlertTriangle className="size-4" /> {t("rainAlert")}
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-snug">
                  Rain is likely on{" "}
                  {wetDays.map((d) => formatIstWeekday(d.date)).join(", ")} — up to{" "}
                  {Math.max(...wetDays.map((d) => d.rainMm))} mm. Cover harvested stock and plan mandi trips
                  around these days.
                </p>
              </section>
            )}

            <section className="card-surface p-5">
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
                      {day.max}° <span className="text-xs font-semibold text-muted-foreground">{day.min}°</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card-surface p-5">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Sprout className="size-4 text-primary" /> {t("harvestAdvice")}
              </p>
              <ul className="mt-3 space-y-2 text-[13px] font-semibold leading-snug">
                {buildAdvice(data.days).map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </Screen>
  );
}

function buildAdvice(days: WeatherDay[]) {
  const advice: string[] = [];
  const dry = days.filter((d) => d.rainChance < 25);
  const wet = days.filter((d) => d.rainChance >= 60);
  const hot = days.filter((d) => d.max >= 38);

  if (dry.length > 0) {
    advice.push(
      `Dry window on ${dry.slice(0, 3).map((d) => formatIstWeekday(d.date)).join(", ")} — best for harvesting and drying.`,
    );
  }
  if (wet.length > 0) {
    advice.push(
      `Avoid open-yard drying on ${wet.map((d) => formatIstWeekday(d.date)).join(", ")}; rainfall up to ${Math.max(
        ...wet.map((d) => d.rainMm),
      )} mm expected.`,
    );
  }
  if (hot.length > 0) {
    advice.push(`Heat above 38° on ${hot.map((d) => formatIstWeekday(d.date)).join(", ")} — irrigate early morning.`);
  }
  if (advice.length === 0) {
    advice.push("Conditions are stable through the week — normal field operations can continue.");
  }
  return advice;
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
