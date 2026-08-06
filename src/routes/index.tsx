import { createFileRoute, Link } from "@tanstack/react-router";
import field from "@/assets/field.jpg";
import { LogoMark } from "@/components/brand";
import { useLang } from "@/lib/i18n";
import { ArrowRight, BarChart3, CloudSun, Landmark } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarketMitra — Sell smarter at the right mandi" },
      {
        name: "description",
        content:
          "Live APMC mandi prices, transport cost and net profit comparison plus real Open-Meteo farm weather, in English, Marathi and Hindi.",
      },
      { property: "og:title", content: "MarketMitra — Sell smarter at the right mandi" },
      {
        property: "og:description",
        content:
          "Compare mandi prices, transport cost and net profit before you sell, with live weather for your farm.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const { t } = useLang();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.16_0.022_160)]">
      <img
        src={field}
        alt="Crop field at sunrise"
        width={1024}
        height={1280}
        className="absolute inset-0 size-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.16_0.022_160/0.65)_0%,oklch(0.14_0.02_160/0.92)_60%,oklch(0.13_0.02_160)_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-7 text-center lg:max-w-5xl lg:items-start lg:px-10 lg:text-left">
        <div className="relative animate-rise">
          <span className="absolute inset-0 -z-10 animate-breathe rounded-full bg-primary/35 blur-3xl" />
          <div className="grid size-24 place-items-center rounded-[2rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.16)] backdrop-blur-xl lg:size-28">
            <LogoMark className="size-14 lg:size-16" />
          </div>
        </div>

        <h1
          className="animate-rise mt-8 font-display text-4xl font-extrabold text-[oklch(0.98_0.01_140)] lg:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Market<span className="text-primary-glow">Mitra</span>
        </h1>
        <p
          className="animate-rise mt-3 max-w-xl text-base font-medium text-[oklch(0.88_0.02_145)] lg:text-xl"
          style={{ animationDelay: "160ms" }}
        >
          {t("tagline")}
        </p>

        <div
          className="animate-rise mt-10 w-full space-y-3 lg:max-w-xs"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            to="/home"
            className="press sheen-on-hover grad-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)]"
          >
            {t("getStarted")}
            <ArrowRight className="size-5" />
          </Link>
        </div>

        <div
          className="animate-rise mt-12 hidden w-full grid-cols-3 gap-4 lg:grid"
          style={{ animationDelay: "320ms" }}
        >
          <Highlight
            icon={<BarChart3 className="size-5 text-primary-glow" />}
            title="Official mandi prices"
            body="Min, modal and max rates from Agmarknet APMC reporting, timestamped in IST."
          />
          <Highlight
            icon={<CloudSun className="size-5 text-primary-glow" />}
            title="Real farm weather"
            body="GPS-based temperature, rain probability, UV and a 7-day outlook from Open-Meteo."
          />
          <Highlight
            icon={<Landmark className="size-5 text-primary-glow" />}
            title="Schemes & guidance"
            body="Government scheme details and daily farming guidance in your language."
          />
        </div>

        <p className="mt-10 text-xs text-[oklch(0.75_0.02_145)]">
          Official mandi data · English · मराठी · हिंदी
        </p>
      </div>
    </div>
  );
}

function Highlight({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-dark rounded-3xl p-5 text-left">
      {icon}
      <p className="mt-3 text-sm font-bold text-[oklch(0.97_0.01_140)]">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[oklch(0.82_0.02_145)]">{body}</p>
    </div>
  );
}
