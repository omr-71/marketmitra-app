import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import field from "@/assets/field.jpg";
import { useLang } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MarketMitra — Sell Smarter. Earn Better." },
      {
        name: "description",
        content:
          "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell.",
      },
      { property: "og:title", content: "MarketMitra — Sell Smarter. Earn Better." },
      {
        property: "og:description",
        content: "Pick the best market for every crop with live prices and AI price forecasts.",
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

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-7 text-center">
        <div className="relative animate-rise">
          <span className="absolute inset-0 -z-10 rounded-full bg-primary/35 blur-3xl animate-breathe" />
          <div className="grid size-28 place-items-center rounded-[2rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.16)] backdrop-blur-xl">
            <img src={logo} alt="MarketMitra logo" width={816} height={816} className="size-16" />
          </div>
        </div>

        <h1
          className="mt-8 animate-rise text-4xl font-extrabold text-[oklch(0.98_0.01_140)]"
          style={{ animationDelay: "80ms" }}
        >
          Market<span className="text-primary-glow">Mitra</span>
        </h1>
        <p
          className="mt-3 animate-rise text-base font-medium text-[oklch(0.88_0.02_145)]"
          style={{ animationDelay: "160ms" }}
        >
          {t("tagline")}
        </p>

        <div
          className="mt-10 w-full animate-rise space-y-3"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            to="/auth"
            className="press grad-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)]"
          >
            {t("getStarted")}
            <ArrowRight className="size-5" />
          </Link>
          <Link
            to="/home"
            className="press flex h-14 w-full items-center justify-center rounded-2xl border border-[oklch(1_0_0/0.18)] bg-[oklch(1_0_0/0.06)] text-base font-semibold text-[oklch(0.94_0.01_140)] backdrop-blur-xl"
          >
            Explore demo
          </Link>
        </div>

        <p className="mt-10 text-xs text-[oklch(0.75_0.02_145)]">
          Trusted mandi data · 1,200+ markets · English · मराठी · हिंदी
        </p>
      </div>
    </div>
  );
}
