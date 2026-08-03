import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { useLang } from "@/lib/i18n";
import { weather } from "@/lib/data";
import {
  CloudRain,
  CloudSun,
  Droplets,
  Sun,
  Sprout,
  Wind,
  AlertTriangle,
  Thermometer,
} from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather & harvest advice — MarketMitra" },
      {
        name: "description",
        content: "Local forecast, rain alerts and harvest recommendations tailored to your village.",
      },
      { property: "og:title", content: "Weather & harvest advice — MarketMitra" },
      {
        property: "og:description",
        content: "7-day rainfall outlook with practical harvest and storage guidance.",
      },
    ],
  }),
  component: WeatherPage,
});

const icons = { sun: Sun, rain: CloudRain, cloud: CloudSun } as const;

function WeatherPage() {
  const { t, lang } = useLang();

  return (
    <Screen>
      <TopBar title={t("weather")} subtitle={weather.district} back="/home" />

      <div className="px-5 pt-5">
        <div className="grad-ink relative overflow-hidden rounded-3xl p-6 text-[oklch(0.97_0.01_140)]">
          <span className="absolute -left-10 -top-12 size-48 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-5xl font-extrabold">{weather.temp}°</p>
              <p className="mt-1 text-sm font-semibold text-[oklch(0.88_0.02_145)]">
                {weather.condition[lang]}
              </p>
              <p className="text-xs text-[oklch(0.78_0.02_145)]">Feels like 32° · Aug 3</p>
            </div>
            <CloudRain className="size-20 shrink-0 text-primary-glow" strokeWidth={1.3} />
          </div>
          <div className="relative mt-5 grid grid-cols-4 gap-2">
            {[
              { icon: Droplets, v: `${weather.humidity}%`, l: "Humidity" },
              { icon: CloudRain, v: `${weather.rainChance}%`, l: "Rain" },
              { icon: Wind, v: `${weather.wind}`, l: "km/h" },
              { icon: Thermometer, v: "24°", l: "Min" },
            ].map(({ icon: Icon, v, l }) => (
              <div key={l} className="glass-dark rounded-2xl px-2.5 py-2.5 text-center">
                <Icon className="mx-auto size-4 text-primary-glow" />
                <p className="mt-1 text-xs font-bold">{v}</p>
                <p className="truncate text-[10px] text-[oklch(0.8_0.02_145)]">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-3xl bg-warning/15 p-5 ring-1 ring-warning/35">
          <AlertTriangle className="size-5 shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="text-sm font-extrabold">{t("rainAlert")}</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/80">
              Moderate to heavy rain expected Tuesday evening through Wednesday (65–80% chance).
              Cover harvested produce and avoid transporting open loads to the mandi.
            </p>
          </div>
        </div>

        <div className="card-surface mt-4 p-5">
          <h2 className="text-sm font-bold">7-day outlook</h2>
          <div className="mt-4 space-y-3">
            {weather.week.map((d) => {
              const Icon = icons[d.icon as keyof typeof icons];
              return (
                <div key={d.day} className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="w-9 shrink-0 text-xs font-bold text-muted-foreground">{d.day}</span>
                  <Icon className="size-5 shrink-0 text-primary" strokeWidth={1.9} />
                  <div className="h-1.5 min-w-0 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary/70"
                      style={{ width: `${d.rain}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-extrabold">{d.temp}°</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-surface mt-4 p-5">
          <div className="flex items-center gap-2">
            <Sprout className="size-4.5 text-primary" />
            <h2 className="text-sm font-bold">{t("harvestAdvice")}</h2>
          </div>
          <div className="mt-3 space-y-3">
            {[
              {
                title: "Harvest onion before Tuesday",
                body: "Soil moisture will rise sharply — lift bulbs and cure them under shade for 2 days.",
              },
              {
                title: "Delay tomato picking to Thursday",
                body: "Dry window returns Thursday, reducing transit damage and rejection at the mandi.",
              },
              {
                title: "Hold soybean spraying",
                body: "Rain within 6 hours of spraying will wash off the application. Wait until Friday.",
              },
            ].map((a) => (
              <div key={a.title} className="rounded-2xl bg-secondary/70 p-4">
                <p className="text-sm font-bold">{a.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
