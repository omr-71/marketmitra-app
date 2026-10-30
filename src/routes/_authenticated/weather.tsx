import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Screen, TopBar } from "@/components/app-shell";
import { LocationCard } from "@/components/location-card";
import { CardSkeleton, StatSkeleton } from "@/components/skeletons";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { useLocationContext } from "@/lib/location";
import type { WeatherDay, WeatherResult, HourlyForecast } from "@/lib/weather.functions";
import { getWeather } from "@/lib/weather-fetch";
import { formatIstDateTime, formatIstTime, formatIstWeekday, istDate } from "@/lib/format";
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
  ChevronDown,
  ChevronRight,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Clock,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Lightbulb,
  MapPin,
  Moon,
  RefreshCw,
  Snowflake,
  Sprout,
  Sun,
  Sunrise,
  Sunset,
  ThermometerSun,
  Tractor,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/weather")({
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
      { property: "og:url", content: "https://marketmitra.app/weather" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/weather" }],
  }),
  component: WeatherPage,
});

/* ─── Types ─── */

type OkWeather = Extract<WeatherResult, { ok: true }>;

/* ─── Weather Code Helpers ─── */

function weatherAtmosphere(code: number, isDay: boolean): string {
  if (!isDay) return "weather-atmo-night";
  if (code === 0 || code <= 1) return "weather-atmo-sunny";
  if (code <= 3) return "weather-atmo-cloudy";
  if (code <= 48) return "weather-atmo-fog";
  if (code <= 57) return "weather-atmo-cloudy";
  if (code <= 67) return "weather-atmo-rain";
  if (code <= 77) return "weather-atmo-snow";
  if (code <= 82) return "weather-atmo-rain";
  if (code <= 86) return "weather-atmo-snow";
  return "weather-atmo-storm";
}

function WeatherIcon({
  code,
  isDay = true,
  className = "size-5",
}: {
  code: number;
  isDay?: boolean;
  className?: string;
}) {
  if (!isDay && code <= 2) return <Moon className={`${className} text-indigo-300`} />;
  if (code === 0) return <Sun className={`${className} text-amber-400 weather-icon-sun`} />;
  if (code <= 2) return <CloudSun className={`${className} text-amber-400 weather-icon-cloud`} />;
  if (code === 3) return <CloudSun className={`${className} text-slate-400 weather-icon-cloud`} />;
  if (code <= 48) return <CloudFog className={`${className} text-slate-400`} />;
  if (code <= 57) return <CloudDrizzle className={`${className} text-sky-400 weather-icon-rain`} />;
  if (code <= 67) return <CloudRain className={`${className} text-blue-400 weather-icon-rain`} />;
  if (code <= 77) return <CloudSnow className={`${className} text-blue-200`} />;
  if (code <= 82) return <CloudRain className={`${className} text-blue-500 weather-icon-rain`} />;
  if (code <= 86) return <Snowflake className={`${className} text-blue-200`} />;
  return <CloudLightning className={`${className} text-amber-500 weather-icon-storm`} />;
}

/* ─── Weather Alerts Generator ─── */

type WeatherAlert = {
  severity: "high" | "moderate" | "low";
  title: string;
  description: string;
  icon: React.ReactNode;
};

function generateAlerts(data: OkWeather): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const today = data.days[0];
  if (!today) return alerts;

  // Heavy rain
  if (today.rainMm >= 30) {
    alerts.push({
      severity: "high",
      title: "Heavy rainfall expected",
      description: `Up to ${today.rainMm} mm rain forecast today with ${today.rainChance}% probability. Protect harvested stock and avoid open-field operations.`,
      icon: <CloudRain className="size-5" />,
    });
  } else if (today.rainMm >= 10) {
    alerts.push({
      severity: "moderate",
      title: "Moderate rainfall expected",
      description: `About ${today.rainMm} mm rain forecast today (${today.rainChance}% probability). Plan field activities accordingly.`,
      icon: <CloudRain className="size-5" />,
    });
  }

  // Strong winds
  if (data.current.windGust >= 50 || data.current.wind >= 40) {
    alerts.push({
      severity: "high",
      title: "Strong winds",
      description: `Wind gusts up to ${data.current.windGust} km/h. Secure loose materials and avoid spraying operations.`,
      icon: <Wind className="size-5" />,
    });
  } else if (data.current.windGust >= 30 || data.current.wind >= 25) {
    alerts.push({
      severity: "moderate",
      title: "Windy conditions",
      description: `Wind speeds around ${data.current.wind} km/h with gusts up to ${data.current.windGust} km/h. Spraying not recommended.`,
      icon: <Wind className="size-5" />,
    });
  }

  // Extreme heat
  if (today.max >= 42) {
    alerts.push({
      severity: "high",
      title: "Extreme heat",
      description: `Temperature peaking at ${today.max}°C. Avoid prolonged outdoor work between 11am–4pm. Ensure adequate irrigation.`,
      icon: <ThermometerSun className="size-5" />,
    });
  } else if (today.max >= 38) {
    alerts.push({
      severity: "moderate",
      title: "Heat advisory",
      description: `Temperature expected to reach ${today.max}°C. Schedule field work for early morning or late afternoon.`,
      icon: <ThermometerSun className="size-5" />,
    });
  }

  // Thunderstorm from weather code
  if (data.current.code >= 95) {
    alerts.push({
      severity: "high",
      title: "Thunderstorm",
      description:
        "Active thunderstorm conditions. Stay indoors and avoid open fields and tall trees.",
      icon: <CloudLightning className="size-5" />,
    });
  }

  // UV
  if (data.current.uvIndex >= 11) {
    alerts.push({
      severity: "high",
      title: "Extreme UV radiation",
      description: `UV index ${data.current.uvIndex}. Avoid outdoor work during peak hours 10am–3pm.`,
      icon: <Sun className="size-5" />,
    });
  }

  return alerts;
}

/* ─── Main Page ─── */

function WeatherPage() {
  const { t } = useLang();
  const { location } = useLocationContext();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Live GPS location:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn("GPS location permission/error:", error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    if (location?.latitude != null) {
      track("weather_lookup");
    }
  }, [location?.latitude, location?.longitude]);

  const hasLocation = location?.latitude != null && location?.longitude != null;

  const query = useQuery({
    queryKey: ["weather", location?.latitude, location?.longitude],
    enabled: hasLocation,
    queryFn: () => getWeather(location!.latitude!, location!.longitude!),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const data = query.data?.ok ? query.data : null;

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

      <div className="space-y-5 px-5 pt-5 lg:px-0 lg:pt-7">
        <LocationCard />

        {!hasLocation ? (
          <NoLocationState />
        ) : query.isPending ? (
          <WeatherSkeleton />
        ) : !data ? (
          <ErrorState
            message={
              query.data && !query.data.ok ? query.data.error : "Weather could not be loaded."
            }
            onRetry={() => void query.refetch()}
            retryLabel={t("retry")}
          />
        ) : (
          <WeatherContent data={data} location={location} />
        )}
      </div>
    </Screen>
  );
}

/* ─── No Location State ─── */

function NoLocationState() {
  return (
    <div className="card-surface hover-lift flex flex-col items-center gap-3 p-8 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-primary/10">
        <MapPin className="size-6 text-primary" />
      </span>
      <p className="max-w-md text-sm text-muted-foreground">
        Allow location access to get automatic live weather for your current location.
      </p>
      <button
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log(
                "GPS permission granted:",
                position.coords.latitude,
                position.coords.longitude,
              );
              window.location.reload();
            },
            (error) => {
              console.warn("Unable to get GPS location:", error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        }}
        className="press rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
      >
        Allow Location
      </button>
      <p className="text-[11px] text-muted-foreground">
        Your browser will ask for location permission.
      </p>
    </div>
  );
}

/* ─── Skeleton State ─── */

function WeatherSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero skeleton */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="shimmer h-16 w-32 rounded-xl" />
            <div className="shimmer h-4 w-24 rounded-lg" />
            <div className="shimmer h-3 w-20 rounded-lg" />
          </div>
          <div className="shimmer size-16 rounded-2xl" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="shimmer h-12 rounded-xl" />
          <div className="shimmer h-12 rounded-xl" />
          <div className="shimmer h-12 rounded-xl" />
        </div>
      </div>
      {/* Hourly skeleton */}
      <div className="card-surface p-5">
        <div className="shimmer mb-3 h-4 w-28 rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer h-20 w-[68px] shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
      <StatSkeleton />
      <CardSkeleton lines={4} />
    </div>
  );
}

/* ─── Error State ─── */

function ErrorState({
  message,
  onRetry,
  retryLabel,
}: {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="card-surface hover-lift p-6 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </span>
      <p className="mt-3 text-sm font-semibold text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className="press mt-4 rounded-full bg-muted px-4 py-2 text-xs font-bold"
      >
        {retryLabel}
      </button>
    </div>
  );
}

/* ─── Main Weather Content ─── */

function WeatherContent({
  data,
  location,
}: {
  data: OkWeather;
  location: { place?: string; district?: string; state?: string } | null;
}) {
  const { t } = useLang();
  const alerts = useMemo(() => generateAlerts(data), [data]);
  const atmosphere = weatherAtmosphere(data.current.code, data.current.isDay);

  return (
    <div className="space-y-5">
      {/* ── Alerts ── */}
      {alerts.length > 0 && <WeatherAlerts alerts={alerts} />}

      {/* ── Desktop: two-column layout ── */}
      <div className="weather-desktop-grid">
        {/* Left column */}
        <div className="space-y-5">
          {/* Hero */}
          <WeatherHero data={data} atmosphere={atmosphere} />

          {/* Hourly Forecast */}
          {data.hourly && data.hourly.length > 0 && <HourlyForecastSection hourly={data.hourly} />}

          {/* Weather Insight */}
          <WeatherInsight data={data} />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Weather Metrics */}
          <WeatherMetrics data={data} />

          {/* Sunrise/Sunset */}
          <SunriseSunset sunrise={data.sunrise} sunset={data.sunset} />

          {/* Best Farming Window */}
          <FarmingWindowCard data={data} />
        </div>
      </div>

      {/* ── Rain Alert Banner ── */}
      <RainAlertBanner days={data.days} />

      {/* ── 7-Day Forecast ── */}
      <SevenDayForecast days={data.days} />

      {/* ── Agricultural Intelligence ── */}
      <div className="weather-desktop-grid">
        <HarvestAdviceCard days={data.days} />
        <FarmingTipsCard data={data} />
      </div>

      {/* ── Data Attribution ── */}
      <DataAttribution data={data} />
    </div>
  );
}

/* ─── Weather Hero ─── */

function WeatherHero({ data, atmosphere }: { data: OkWeather; atmosphere: string }) {
  const today = data.days[0];

  return (
    <section
      className={`weather-atmosphere ${atmosphere} relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 sm:p-7`}
      style={{ isolation: "isolate" }}
    >
      <div className="relative z-10">
        {/* Condition & Icon */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {/* Temperature */}
            <p className="weather-hero-temp text-7xl sm:text-8xl lg:text-[6.5rem]">
              <AnimatedNumber value={data.current.temperature} suffix="°" />
            </p>

            {/* Condition label */}
            <p className="mt-2 text-base font-bold tracking-tight sm:text-lg">
              {conditionLabel(data.current.code)}
            </p>

            {/* Feels like + High/Low */}
            <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium">Feels like {data.current.apparent}°</span>
              {today && (
                <span className="font-semibold">
                  H:{today.max}° L:{today.min}°
                </span>
              )}
            </div>
          </div>

          {/* Large weather icon */}
          <div className="weather-float-1 ml-3 flex shrink-0 items-start pt-2">
            <WeatherIcon
              code={data.current.code}
              isDay={data.current.isDay}
              className="size-16 sm:size-20 lg:size-24 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-background/40 p-3 backdrop-blur-sm">
          <QuickStat
            icon={<Droplets className="size-3.5 text-sky-500" />}
            label="Humidity"
            value={`${data.current.humidity}%`}
          />
          <QuickStat
            icon={<Wind className="size-3.5 text-teal-500" />}
            label="Wind"
            value={`${data.current.wind} km/h`}
          />
          <QuickStat
            icon={<CloudRain className="size-3.5 text-blue-500" />}
            label="Rain"
            value={`${data.current.rainChance}%`}
          />
        </div>
      </div>
    </section>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {icon}
      <span className="text-sm font-extrabold tabular-nums">{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

/* ─── Hourly Forecast ─── */

function HourlyForecastSection({ hourly }: { hourly: HourlyForecast[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find current hour index
  const nowHour = new Date().getHours();
  const currentIdx = hourly.findIndex((h) => {
    const hourTime = istDate(h.time);
    return hourTime.getHours() >= nowHour;
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Hourly Forecast
        </p>
      </div>

      <div ref={scrollRef} className="weather-hourly-scroll px-4 pb-4">
        {hourly.map((h, i) => {
          const hourTime = istDate(h.time);
          const isNow = i === currentIdx || (currentIdx === -1 && i === 0);
          const timeLabel = isNow
            ? "Now"
            : new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                hour: "numeric",
                hour12: true,
              }).format(hourTime);

          return (
            <div
              key={h.time}
              className={`weather-hourly-item flex flex-col items-center gap-1.5 rounded-2xl px-2.5 py-3 transition-colors ${
                isNow ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"
              }`}
            >
              <span
                className={`text-[11px] font-bold ${
                  isNow ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {timeLabel}
              </span>

              <WeatherIcon code={h.code} isDay={h.isDay} className="size-5" />

              <span className="text-sm font-extrabold tabular-nums">{h.temperature}°</span>

              {h.rainChance > 0 && (
                <span className="text-[10px] font-bold text-blue-500">{h.rainChance}%</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Weather Insight ─── */

function WeatherInsight({ data }: { data: OkWeather }) {
  const insight = todayInsight(data);

  return (
    <section className="weather-float-2 overflow-hidden rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky">
        <Lightbulb className="size-3.5" />
        Today's Insight
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-relaxed">{insight}</p>
    </section>
  );
}

/* ─── Weather Metrics ─── */

function WeatherMetrics({ data }: { data: OkWeather }) {
  const metrics = [
    {
      icon: <Droplets className="size-4 text-sky-500" />,
      label: "Humidity",
      value: `${data.current.humidity}`,
      unit: "%",
      description:
        data.current.humidity >= 80
          ? "High — slows drying"
          : data.current.humidity >= 60
            ? "Moderate"
            : "Low — good for drying",
    },
    {
      icon: <Wind className="size-4 text-teal-500" />,
      label: "Wind",
      value: `${data.current.wind}`,
      unit: "km/h",
      description:
        data.current.wind >= 25
          ? "Strong — avoid spraying"
          : data.current.wind >= 15
            ? "Moderate breeze"
            : "Light breeze",
    },
    {
      icon: <Wind className="size-4 text-teal-600" />,
      label: "Gusts",
      value: `${data.current.windGust}`,
      unit: "km/h",
      description:
        data.current.windGust >= 40
          ? "Strong gusts"
          : data.current.windGust >= 20
            ? "Moderate gusts"
            : "Calm",
    },
    {
      icon: <CloudRain className="size-4 text-blue-500" />,
      label: "Rain Probability",
      value: `${data.current.rainChance}`,
      unit: "%",
      description:
        data.current.rainChance >= 60
          ? "Rain likely today"
          : data.current.rainChance >= 30
            ? "Some chance"
            : "Dry conditions",
    },
    {
      icon: <Droplets className="size-4 text-blue-400" />,
      label: "Precipitation",
      value: `${data.current.precipitation}`,
      unit: "mm",
      description: data.current.precipitation > 0 ? "Active rain" : "No rain currently",
    },
    {
      icon: <Sun className="size-4 text-amber-500" />,
      label: "UV Index",
      value: `${data.current.uvIndex}`,
      unit: "",
      description: uvLabel(data.current.uvIndex),
    },
    {
      icon: <Gauge className="size-4 text-violet-500" />,
      label: "Pressure",
      value: `${data.current.pressure}`,
      unit: "hPa",
      description:
        data.current.pressure < 1000
          ? "Low — unsettled weather"
          : data.current.pressure > 1020
            ? "High — stable weather"
            : "Normal",
    },
    ...(data.current.visibility != null
      ? [
          {
            icon: <Eye className="size-4 text-slate-500" />,
            label: "Visibility",
            value: `${data.current.visibility}`,
            unit: "km",
            description:
              data.current.visibility >= 10
                ? "Excellent"
                : data.current.visibility >= 5
                  ? "Good"
                  : "Poor",
          },
        ]
      : []),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Weather Details
      </p>

      <div className="weather-metrics-grid">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl bg-muted/40 p-3.5 transition-all hover:bg-muted/70 lg:hover:shadow-sm">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-2 font-display text-xl font-extrabold leading-none tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-xs font-bold text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{description}</p>
    </div>
  );
}

/* ─── Sunrise/Sunset ─── */

function SunriseSunset({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const sunriseTime = istDate(sunrise);
  const sunsetTime = istDate(sunset);
  const now = new Date();

  // Calculate sun progress (0 to 1)
  const dayStart = sunriseTime.getTime();
  const dayEnd = sunsetTime.getTime();
  const dayLength = dayEnd - dayStart;
  const elapsed = now.getTime() - dayStart;
  const progress = Math.max(0, Math.min(1, dayLength > 0 ? elapsed / dayLength : 0));
  const isDaytime = now >= sunriseTime && now <= sunsetTime;

  return (
    <section className="weather-float-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Daylight
      </p>

      {/* Sun arc */}
      <div className="weather-sun-arc">
        <svg viewBox="0 0 200 95" className="w-full" aria-hidden="true">
          {/* Dashed background arc */}
          <path d="M 10 85 Q 100 -10 190 85" className="weather-sun-arc-path" />
          {/* Active progress arc */}
          {isDaytime && (
            <path
              d="M 10 85 Q 100 -10 190 85"
              className="weather-sun-arc-active"
              strokeDasharray={`${progress * 280} 280`}
            />
          )}
          {/* Sun dot */}
          {isDaytime && (
            <circle
              cx={10 + progress * 180}
              cy={85 - Math.sin(progress * Math.PI) * 90}
              r="5"
              className="weather-sun-dot"
            />
          )}
          {/* Horizon line */}
          <line
            x1="5"
            y1="85"
            x2="195"
            y2="85"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Times */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sunrise className="size-4 text-amber-500" />
          <div>
            <p className="text-xs font-extrabold">{formatIstTime(sunrise)}</p>
            <p className="text-[9px] text-muted-foreground">Sunrise</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="text-right">
            <p className="text-xs font-extrabold">{formatIstTime(sunset)}</p>
            <p className="text-[9px] text-muted-foreground">Sunset</p>
          </div>
          <Sunset className="size-4 text-orange-500" />
        </div>
      </div>
    </section>
  );
}

/* ─── Farming Window Card ─── */

function FarmingWindowCard({ data }: { data: OkWeather }) {
  const window = bestFarmingWindow(data);

  return (
    <section className="overflow-hidden rounded-2xl border border-gold/30 bg-gold/5 p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-foreground">
        <Tractor className="size-3.5" />
        Best Farming Window
      </div>

      <p className="mt-3 font-display text-lg font-extrabold leading-tight">{window.window}</p>

      <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground">
        {window.reason}
      </p>
    </section>
  );
}

/* ─── Weather Alerts ─── */

function WeatherAlerts({ alerts }: { alerts: WeatherAlert[] }) {
  return (
    <StaggerContainer className="space-y-2.5" staggerDelay={0.06}>
      {alerts.map((alert, i) => (
        <StaggerItem key={i}>
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              alert.severity === "high"
                ? "weather-alert-high border-destructive/25"
                : alert.severity === "moderate"
                  ? "weather-alert-moderate border-warning/25"
                  : "weather-alert-low border-sky/25"
            }`}
          >
            <span
              className={`mt-0.5 shrink-0 ${
                alert.severity === "high"
                  ? "text-destructive"
                  : alert.severity === "moderate"
                    ? "text-warning"
                    : "text-sky"
              }`}
            >
              {alert.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{alert.title}</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                {alert.description}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                alert.severity === "high"
                  ? "bg-destructive/10 text-destructive"
                  : alert.severity === "moderate"
                    ? "bg-warning/10 text-warning-foreground"
                    : "bg-sky/10 text-sky"
              }`}
            >
              {alert.severity}
            </span>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

/* ─── Rain Alert Banner ─── */

function RainAlertBanner({ days }: { days: WeatherDay[] }) {
  const { t } = useLang();
  const wetDays = days.filter((d) => d.rainChance >= 60);

  if (wetDays.length === 0) return null;

  return (
    <section className="rounded-2xl border border-warning/25 bg-warning/6 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-bold text-warning-foreground">{t("rainAlert")}</p>
          <p className="mt-1.5 text-[13px] font-semibold leading-relaxed">
            Rain is likely on {wetDays.map((d) => formatIstWeekday(d.date)).join(", ")} — up to{" "}
            {Math.max(...wetDays.map((d) => d.rainMm))} mm. Cover harvested stock and plan mandi
            trips around these days.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── 7-Day Forecast ─── */

function SevenDayForecast({ days }: { days: WeatherDay[] }) {
  const { t } = useLang();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Calculate temp range for the bar visualization
  const allTemps = days.flatMap((d) => [d.min, d.max]);
  const weekMin = Math.min(...allTemps);
  const weekMax = Math.max(...allTemps);
  const range = weekMax - weekMin || 1;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="px-5 pt-5 pb-3">
        <p className="text-sm font-bold">{t("sevenDay")}</p>
      </div>

      <div className="divide-y divide-border/40 px-5 pb-4">
        {days.map((day) => {
          const isExpanded = expandedDay === day.date;
          const leftPct = ((day.min - weekMin) / range) * 100;
          const widthPct = ((day.max - day.min) / range) * 100;

          return (
            <div key={day.date}>
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/30"
              >
                {/* Day name */}
                <span className="w-10 shrink-0 text-sm font-bold">
                  {formatIstWeekday(day.date)}
                </span>

                {/* Icon */}
                <span className="shrink-0">
                  <WeatherIcon code={day.code} className="size-5" />
                </span>

                {/* Rain chance */}
                <span className="w-9 shrink-0 text-right text-[11px] font-bold text-blue-500">
                  {day.rainChance > 0 ? `${day.rainChance}%` : ""}
                </span>

                {/* Temperature range bar */}
                <div className="mx-2 min-w-0 flex-1">
                  <div className="weather-temp-range">
                    <div
                      className="weather-temp-range-fill"
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(widthPct, 8)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Min/Max */}
                <span className="w-7 shrink-0 text-right text-xs font-semibold text-muted-foreground tabular-nums">
                  {day.min}°
                </span>
                <span className="w-7 shrink-0 text-right text-sm font-extrabold tabular-nums">
                  {day.max}°
                </span>

                {/* Expand arrow */}
                <ChevronDown
                  className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="grid grid-cols-2 gap-2 pb-3 pl-10 sm:grid-cols-4">
                  <MiniStat label="Condition" value={conditionLabel(day.code)} />
                  <MiniStat label="Rainfall" value={`${day.rainMm} mm`} />
                  <MiniStat label="Max wind" value={`${day.windMax} km/h`} />
                  <MiniStat label="UV Index" value={`${day.uvIndex} — ${uvLabel(day.uvIndex)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs font-bold">{value}</p>
    </div>
  );
}

/* ─── Harvest Advice ─── */

function HarvestAdviceCard({ days }: { days: WeatherDay[] }) {
  const { t } = useLang();
  const advice = harvestAdvice(days);

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
        <Sprout className="size-3.5" />
        {t("harvestAdvice")}
      </div>

      <ul className="mt-4 space-y-2.5">
        {advice.map((line) => (
          <li key={line} className="flex gap-2.5 text-[13px] font-semibold leading-relaxed">
            <ChevronRight className="mt-1 size-3 shrink-0 text-primary" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Farming Tips ─── */

function FarmingTipsCard({ data }: { data: OkWeather }) {
  const tips = farmingTips(data);

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-foreground">
        <Lightbulb className="size-3.5" />
        Farming Tips
      </div>

      <ul className="mt-4 space-y-2.5">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2.5 text-[13px] font-semibold leading-relaxed">
            <ChevronRight className="mt-1 size-3 shrink-0 text-gold" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Data Attribution ─── */

function DataAttribution({ data }: { data: OkWeather }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] font-semibold text-muted-foreground">
          {data.source || "Open-Meteo"}
        </span>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">
        {data.observedAt
          ? `Observed ${formatIstTime(data.observedAt)} IST`
          : `Updated ${formatIstDateTime(data.updatedAt)} IST`}
        {data.days.length > 0 &&
          ` · Forecast to ${formatIstWeekday(data.days[data.days.length - 1]!.date)}`}
      </span>
    </div>
  );
}
