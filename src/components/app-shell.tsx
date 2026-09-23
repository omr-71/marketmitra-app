import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Store,
  CloudSun,
  Landmark,
  User,
  ChevronLeft,
  Info,
  Mail,
  Stethoscope,
  Handshake,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { usePageTracking } from "@/lib/analytics";
import {
  featureKeyForPath,
  MaintenanceNotice,
  useFeature,
} from "@/lib/features";
import { BrandLockup, LogoMark, Wordmark } from "./brand";

const nav = [
  { to: "/home", icon: Home, key: "home" as const },
  { to: "/crops", icon: Store, key: "markets" as const },
  { to: "/link", icon: Handshake, key: "mitraLink" as const },
  { to: "/diagnose", icon: Stethoscope, key: "diagnose" as const },
  { to: "/weather", icon: CloudSun, key: "weather" as const },
  { to: "/schemes", icon: Landmark, key: "schemes" as const },
  { to: "/profile", icon: User, key: "profile" as const },
];

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (to: string) =>
    pathname === to || (to !== "/home" && pathname.startsWith(to));
}

import { motion } from "motion/react";
import { SPRINGS, useReducedMotion } from "@/lib/motion";

export function BottomNav() {
  const { t } = useLang();
  const isActive = useActive();
  const reducedMotion = useReducedMotion();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="relative mx-auto flex h-[72px] items-center overflow-hidden rounded-[30px] border border-white/30 bg-white/[0.68] px-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.20),0_4px_12px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.18)] backdrop-blur-[28px] backdrop-saturate-[180%] dark:border-white/[0.12] dark:bg-slate-950/[0.70] dark:shadow-[0_20px_55px_rgba(0,0,0,0.45),0_4px_14px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.10)]">

        {/* Glass reflection */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 dark:via-white/30" />

        <div className="pointer-events-none absolute -left-10 -top-12 h-28 w-40 rounded-full bg-white/30 blur-3xl dark:bg-white/[0.04]" />

        <div className="pointer-events-none absolute -right-10 bottom-[-45px] h-28 w-40 rounded-full bg-primary/10 blur-3xl" />

        {nav.map(({ to, icon: Icon, key }) => {
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              className={`press group relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-center px-0.5 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* Dynamic liquid bubble with layout animation */}
              {active && (
                reducedMotion ? (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[57px] w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white/[0.58] shadow-[0_7px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.20)] backdrop-blur-xl dark:bg-white/[0.09] dark:shadow-[0_8px_25px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]" />
                ) : (
                  <motion.span
                    layoutId="bottomNavBubble"
                    transition={SPRINGS.navPill}
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[57px] w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white/[0.58] shadow-[0_7px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.20)] backdrop-blur-xl dark:bg-white/[0.09] dark:shadow-[0_8px_25px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]"
                  />
                )
              )}

              {/* Bubble highlight */}
              {active && (
                <>
                  <span className="pointer-events-none absolute left-1/2 top-[8px] h-2.5 w-7 -translate-x-1/2 rounded-full bg-white/70 blur-[2px] dark:bg-white/20" />
                  <span className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-md" />
                </>
              )}

              <span
                className={`relative grid size-8 place-items-center rounded-full transition-all duration-300 ${
                  active
                    ? "scale-110 -translate-y-1"
                    : "group-hover:-translate-y-0.5 group-hover:scale-105"
                }`}
              >
                <Icon
                  className={`size-[19px] transition-all duration-300 ${
                    active
                      ? "drop-shadow-[0_2px_5px_rgba(37,99,235,0.18)]"
                      : ""
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />

                {/* Active floating dot */}
                {active && (
                  reducedMotion ? (
                    <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_currentColor]" />
                  ) : (
                    <motion.span
                      layoutId="bottomNavDot"
                      transition={SPRINGS.tactile}
                      className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_currentColor]"
                    />
                  )
                )}
              </span>

              <span
                className={`relative mt-0.5 w-full truncate px-0.5 text-center text-[9px] font-bold leading-none transition-all duration-300 ${
                  active ? "translate-y-[-1px]" : ""
                }`}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Desktop-only left rail: makes the app read like a professional web platform. */
export function SideNav() {
  const { t } = useLang();
  const isActive = useActive();
  const reducedMotion = useReducedMotion();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card px-4 py-6 lg:flex">
      <Link to="/home" className="flex items-center gap-3 px-2">
        <LogoMark className="size-9" />
        <Wordmark className="text-lg" />
      </Link>

      <p className="mt-9 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        Workspace
      </p>

      <nav className="mt-2 space-y-1">
        {nav.map(({ to, icon: Icon, key }) => {
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              className={`press relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {active && (
                reducedMotion ? (
                  <span className="absolute inset-0 -z-10 rounded-xl bg-primary/12" />
                ) : (
                  <motion.span
                    layoutId="sideNavActivePill"
                    transition={SPRINGS.navPill}
                    className="absolute inset-0 -z-10 rounded-xl bg-primary/12"
                  />
                )
              )}
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
              {t(key)}
            </Link>
          );
        })}
      </nav>


      <Link
        to="/about"
        className="press mt-auto flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Info className="size-5" strokeWidth={1.9} />
        About MarketMitra
      </Link>

      <p className="mt-3 px-3 text-[11px] leading-relaxed text-muted-foreground">
        Official APMC mandi prices · Verified weather data
        <br />
        English · मराठी · हिंदी
      </p>
    </aside>
  );
}

export function Screen({
  children,
  nav: withNav = true,
  className = "",
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  usePageTracking();
  const flag = useFeature(featureKeyForPath(pathname));
  const disabled = flag && !flag.enabled ? flag : null;

  return (
    <div className="app-canvas min-h-screen bg-background lg:flex">
      {withNav && <SideNav />}

      <div className="min-w-0 flex-1">
        <div
          data-route={pathname}
          className={`app-page mx-auto w-full max-w-[430px] lg:max-w-6xl lg:px-8 ${
            withNav ? "pb-28 lg:pb-0" : ""
          } ${className}`}
        >
          <div key={pathname} className="animate-page">
            {disabled ? (
              <MaintenanceNotice flag={disabled} />
            ) : (
              children
            )}
          </div>

          {withNav && <SiteFooter />}
        </div>
      </div>

      {withNav && <BottomNav />}
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
  action,
  settings = true,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
  /** Show the top-right settings shortcut (hidden on the settings screen). */
  settings?: boolean;
}) {
  return (
    <header className="app-topbar sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md lg:bg-background/90 lg:px-0 lg:py-6 lg:backdrop-blur-xl">
      {back ? (
        <Link
          to={back}
          className="press group grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
          aria-label="Back"
        >
          <ChevronLeft className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </Link>
      ) : (
        <span className="size-9 shrink-0 lg:hidden" />
      )}

      <div className="min-w-0 text-center lg:text-left">
        <h1 className="truncate font-display text-base font-bold lg:text-2xl">
          {title}
        </h1>

        {subtitle && (
          <p className="truncate text-xs text-muted-foreground lg:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex min-w-9 shrink-0 items-center justify-end gap-2">
        {action}

        {settings && (
          <Link
            to="/settings"
            className="press group grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
            aria-label="Settings"
          >
            <Settings className="size-4.5 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        )}
      </div>
    </header>
  );
}

/** Minimal, elegant site footer. */
export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border/70 px-5 pb-6 pt-6 text-center lg:mt-16 lg:px-0 lg:pb-10 lg:pt-8">
      <div className="flex flex-col items-center gap-2 text-[11px] font-semibold text-muted-foreground sm:flex-row sm:justify-center sm:gap-5">
        <p>© 2026 Market Mitra.All rights reserved</p>
        <p>Developed by Om Labhade</p>

        <Link
          to="/terms"
          className="transition-colors hover:text-primary"
        >
          Terms &amp; Conditions
        </Link>

        <a
          href="mailto:hello.marketmitra@gmail.com"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Mail className="size-3.5 text-primary" />
          hello.marketmitra@gmail.com
        </a>
      </div>
    </footer>
  );
}

export function MobileBrandBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
      <BrandLockup />
    </div>
  );
}