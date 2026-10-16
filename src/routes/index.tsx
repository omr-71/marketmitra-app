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
          "Latest reported APMC mandi prices, transport cost and net profit comparison plus real Open-Meteo farm weather, in English, Marathi and Hindi.",
      },
      { property: "og:title", content: "MarketMitra — Sell smarter at the right mandi" },
      {
        property: "og:description",
        content:
          "Compare reported mandi prices, transport cost and net profit before you sell, with live weather for your farm.",
      },
      { property: "og:url", content: "https://marketmitra.app/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://marketmitra.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://marketmitra.app/#website",
          name: "MarketMitra",
          url: "https://marketmitra.app/",
          description:
            "Compare the latest published official APMC mandi prices, transport cost and net profit, with live farm weather, in English, Marathi and Hindi.",
          inLanguage: ["en", "mr", "hi"],
        }),
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
          <span className="mt-2 block text-xl font-bold text-[oklch(0.9_0.02_145)] lg:text-3xl">
            Compare mandi prices and sell where you earn the most
          </span>
        </h1>
        <p
          className="animate-rise mt-3 max-w-xl text-base font-medium text-[oklch(0.88_0.02_145)] lg:text-xl"
          style={{ animationDelay: "160ms" }}
        >
          {t("tagline")}
        </p>
        <p
          className="animate-rise mt-3 max-w-2xl text-sm leading-relaxed text-[oklch(0.82_0.02_145)] lg:text-base"
          style={{ animationDelay: "200ms" }}
        >
          MarketMitra shows the latest published official APMC rates for your crop across nearby
          markets, subtracts the transport cost to each one, and tells you which mandi leaves the
          most money in your hand. Add live farm weather, government scheme details, crop disease
          help and farmer-to-farmer equipment sharing — all in English, मराठी and हिंदी.
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

        <h2
          className="animate-rise mt-12 w-full text-left font-display text-lg font-bold text-[oklch(0.95_0.01_140)] lg:text-2xl"
          style={{ animationDelay: "300ms" }}
        >
          What you get with MarketMitra
        </h2>

        <div
          className="animate-rise mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
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

function Highlight({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="glass-dark rounded-3xl p-5 text-left">
      {icon}
      <p className="mt-3 text-sm font-bold text-[oklch(0.97_0.01_140)]">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-[oklch(0.82_0.02_145)]">{body}</p>
    </div>
  );
}
