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

export function BottomNav() {
  const { t } = useLang();
  const isActive = useActive();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-3 lg:hidden">
      <div className="glass flex items-center justify-between rounded-3xl px-1.5 py-2 shadow-[var(--shadow-card)]">
        {nav.map(
          ({ to, icon: Icon, key }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`press nav-pill flex flex-1 flex-col items-center gap-1 rounded-2xl px-0.5 py-2 text-[9.5px] font-semibold ${
                  active
                    ? "nav-pill-active text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`relative size-5 transition-transform duration-300 ${
                    active ? "-translate-y-px scale-110" : ""
                  }`}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                <span className="relative w-full truncate text-center">
                  {t(key)}
                </span>
              </Link>
            );
          },
        )}
      </div>
    </nav>
  );
}


/** Desktop-only left rail: makes the app read like a professional web platform. */
export function SideNav() {
  const { t } = useLang();
  const isActive = useActive();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/60 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link to="/home" className="flex items-center gap-3 px-2">
        <LogoMark className="size-9" />
        <Wordmark className="text-lg" />
      </Link>

      <nav className="mt-8 space-y-1.5">
        {nav.map(({ to, icon: Icon, key }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`press flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition-colors ${
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
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
    <div className="min-h-screen bg-background lg:flex">
      {withNav && <SideNav />}
      <div className="min-w-0 flex-1">
        <div
          className={`mx-auto w-full max-w-[430px] lg:max-w-6xl lg:px-8 ${
            withNav ? "pb-28 lg:pb-0" : ""
          } ${className}`}
        >
          <div key={pathname} className="animate-page">
            {disabled ? <MaintenanceNotice flag={disabled} /> : children}
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
    <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md lg:bg-background/85 lg:rounded-b-3xl lg:px-6 lg:py-5 lg:backdrop-blur-xl">
      {back ? (
        <Link
          to={back}
          className="press grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span className="size-9 shrink-0 lg:hidden" />
      )}
      <div className="min-w-0 text-center lg:text-left">
        <h1 className="truncate font-display text-base font-bold lg:text-2xl">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground lg:text-sm">{subtitle}</p>}
      </div>
      <div className="flex min-w-9 shrink-0 items-center justify-end gap-2">
        {action}
        {settings && (
          <Link
            to="/settings"
            className="press grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground"
            aria-label="Settings"
          >
            <Settings className="size-4.5" />
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
