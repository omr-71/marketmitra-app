import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Store,
  CloudSun,
  Landmark,
  User,
  ChevronLeft,
  Info,
  Stethoscope,
  Handshake,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext, memo } from "react";
import { useLang } from "@/lib/i18n";
import { usePageTracking } from "@/lib/analytics";
import { featureKeyForPath, MaintenanceNotice, useFeature } from "@/lib/features";
import { BrandLockup, LogoMark, Wordmark } from "./brand";

type ShellContextValue = {
  hasOuterShell: boolean;
};

export const ShellContext = createContext<ShellContextValue>({
  hasOuterShell: false,
});

export const useShell = () => useContext(ShellContext);

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

export const BottomNav = memo(function BottomNav() {
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
});

/** Desktop-only left rail: makes the app read like a professional web platform. */
export const SideNav = memo(function SideNav() {
  const { t } = useLang();
  const isActive = useActive();
  const reducedMotion = useReducedMotion();
  const coarsePointer =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const simplifyMotion = reducedMotion || coarsePointer;

  return (
    <aside className="app-sidebar fixed top-4 left-4 bottom-4 z-30 hidden h-[calc(100vh-32px)] w-64 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/5 lg:flex">
      <Link to="/home" className="flex items-center gap-3 px-2">
        <LogoMark className="size-9" />
        <Wordmark className="text-lg" />
      </Link>

      <p className="mt-9 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        Workspace
      </p>

      <nav className="mt-2 space-y-2">
        {nav.map(({ to, icon: Icon, key }) => {
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              className={`press group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-200 ${
                active
                  ? "border border-primary/25 bg-primary/10 text-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"
                  : "border border-transparent bg-transparent text-muted-foreground hover:-translate-y-0.5 hover:border-slate-200/90 hover:bg-slate-50/80 hover:text-foreground hover:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]"
              }`}
            >
              <Icon className="size-5 transition-transform duration-200 group-hover:scale-105" strokeWidth={active ? 2.4 : 1.9} />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/about"
        className="press group mt-auto flex items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-sm font-bold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200/90 hover:bg-slate-50/80 hover:text-foreground hover:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]"
      >
        <Info className="size-5 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.9} />
        About MarketMitra
      </Link>

      <p className="mt-3 px-3 text-[11px] leading-relaxed text-muted-foreground">
        Official APMC mandi prices · Verified weather data
        <br />
        English · मराठी · हिंदी
      </p>
    </aside>
  );
});

export function Screen({
  children,
  nav: withNav = true,
  className = "",
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  const { hasOuterShell } = useShell();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  usePageTracking();
  const flag = useFeature(featureKeyForPath(pathname));
  const disabled = flag && !flag.enabled ? flag : null;

  const content = (
    <div
      data-route={pathname}
      className={`app-page mx-auto w-full max-w-[440px] md:max-w-3xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-4 ${
        withNav ? "pb-28 lg:pb-0" : ""
      } ${className}`}
    >
      <div className="will-change-transform">
        {disabled ? <MaintenanceNotice flag={disabled} /> : children}
      </div>

      {withNav && <SiteFooter />}
    </div>
  );

  if (hasOuterShell) {
    return content;
  }

  return (
    <div className="app-canvas min-h-screen bg-[#f9fafb]">
      {withNav && <SideNav />}

      <div
        className={`min-w-0 flex-1 bg-transparent ${
          withNav ? "lg:pl-[18rem]" : ""
        } lg:py-4 lg:pr-4`}
      >
        {content}
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
  settings = false,
  className = "",
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
  /** Show the top-right settings shortcut. */
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
    <footer className="mt-16 hidden border-t border-border/60 pb-8 pt-7 text-center lg:block">
      <p className="text-[11px] font-medium tracking-[0.01em] text-muted-foreground/80">
        © 2026 MarketMitra. All rights reserved.
      </p>
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
