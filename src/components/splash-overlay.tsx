import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LogoMark } from "./brand";
import { useLang } from "@/lib/i18n";

/** Brief branded transition while the authenticated route checks the session. */
export function SplashOverlay() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSplashRoute = pathname === "/";
  const { t } = useLang();
  const [phase, setPhase] = useState<"in" | "out" | "done">(isSplashRoute ? "done" : "in");

  useEffect(() => {
    if (phase !== "in") return;
    const out = window.setTimeout(() => setPhase("out"), 120);
    const done = window.setTimeout(() => setPhase("done"), 270);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(done);
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] grid place-items-center bg-[var(--gradient-ink)] transition-opacity duration-150 ${
        phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center px-8 text-center">
        <div className="relative">
          <span className="absolute inset-0 -z-10 animate-breathe rounded-full bg-primary/40 blur-3xl" />
          <div className="animate-rise grid size-24 place-items-center rounded-[1.75rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.16)] backdrop-blur-xl md:size-28">
            <LogoMark className="size-14 md:size-16" />
          </div>
        </div>
        <p
          className="animate-rise mt-6 font-display text-2xl font-extrabold tracking-tight text-[oklch(0.98_0.01_140)] md:text-3xl"
          style={{ animationDelay: "90ms" }}
        >
          Market<span className="text-primary-glow">Mitra</span>
        </p>
        <p
          className="animate-rise mt-2 text-sm font-medium text-[oklch(0.85_0.02_145)]"
          style={{ animationDelay: "160ms" }}
        >
          {t("tagline")}
        </p>
        <span className="mt-7 block h-1 w-32 overflow-hidden rounded-full bg-[oklch(1_0_0/0.16)]">
          <span className="animate-loadbar block h-full w-1/2 rounded-full bg-primary-glow" />
        </span>
      </div>
    </div>
  );
}
