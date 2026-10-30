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
import { featureKeyForPath, MaintenanceNotice, useFeature } from "@/lib/features";
import { BrandLockup, LogoMark, Wordmark } from "./brand";
import { SystemNotices } from "./system-notices";

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

  return (to: string) => pathname === to || (to !== "/home" && pathname.startsWith(to));
}

import { motion } from "motion/react";
import { SPRINGS, useReducedMotion } from "@/lib/motion";

export function BottomNav() {
  const { t } = useLang();
  const isActive = useActive();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="bottom-nav-shell relative mx-auto flex h-[68px] items-center overflow-hidden rounded-[26px] border border-border/80 bg-card/95 px-1.5 shadow-lg backdrop-blur-md">
        {nav.map(({ to, icon: Icon, key }) => {
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              className={`press group relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-center px-0.5 ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[52px] w-[48px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-primary/10 shadow-xs" />
              )}

              <span
                className={`relative grid size-8 place-items-center rounded-full transition-transform duration-200 ${
                  active ? "scale-105" : "group-hover:scale-105"
                }`}
              >
                <Icon className="size-[19px]" strokeWidth={active ? 2.4 : 1.8} />

                {active && (
                  <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </span>

              <span
                className={`relative mt-0.5 w-full truncate px-0.5 text-center text-[9px] font-bold leading-none ${
                  active ? "text-primary" : ""
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
  const coarsePointer =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const simplifyMotion = reducedMotion || coarsePointer;

  return (
    <aside className="app-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-card px-4 py-6 lg:flex">
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
              {active &&
                (simplifyMotion ? (
                  <span className="absolute inset-0 -z-10 rounded-xl bg-primary/12" />
                ) : (
                  <motion.span
                    layoutId="sideNavActivePill"
                    transition={SPRINGS.navPill}
                    className="absolute inset-0 -z-10 rounded-xl bg-primary/12"
                  />
                ))}
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
          className={`app-page mx-auto w-full max-w-[440px] md:max-w-3xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 ${
            withNav ? "pb-28 lg:pb-0" : ""
          } ${className}`}
        >
          {withNav && <SystemNotices />}
          <div key={pathname} className="animate-page">
            {disabled ? <MaintenanceNotice flag={disabled} /> : children}
          </div>

          {withNav && <SiteFooter />}
        </div>
      </div>

      {withNav && <div aria-hidden="true" className="bottom-nav-scroll-glass" />}
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
  className = "",
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
  /** Show the top-right settings shortcut (hidden on the settings screen). */
  settings?: boolean;
  className?: string;
}) {
  return (
    <header
      className={`app-topbar mobile-glass sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 px-4 py-3 backdrop-blur-[20px] backdrop-saturate-[180%] lg:px-0 lg:py-6 ${className}`}
    >
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
        <h1 className="truncate font-display text-base font-bold lg:text-2xl">{title}</h1>

        {subtitle && (
          <p className="truncate text-xs text-muted-foreground lg:text-sm">{subtitle}</p>
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

        <Link to="/terms" className="transition-colors hover:text-primary">
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
