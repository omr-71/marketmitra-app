import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Store, CloudSun, Landmark, User, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";

const nav = [
  { to: "/home", icon: Home, key: "home" as const },
  { to: "/crops", icon: Store, key: "markets" as const },
  { to: "/weather", icon: CloudSun, key: "weather" as const },
  { to: "/schemes", icon: Landmark, key: "schemes" as const },
  { to: "/profile", icon: User, key: "profile" as const },
];

export function BottomNav() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-3">
      <div className="glass flex items-center justify-between rounded-3xl px-2 py-2 shadow-[var(--shadow-card)]">
        {nav.map(({ to, icon: Icon, key }) => {
          const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`press flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold ${
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
              <span className="truncate">{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Screen({
  children,
  nav = true,
  className = "",
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto w-full max-w-[430px] ${nav ? "pb-28" : ""} ${className}`}>
        {children}
      </div>
      {nav && <BottomNav />}
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl">
      {back ? (
        <Link
          to={back}
          className="press grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span className="size-9 shrink-0" />
      )}
      <div className="min-w-0 text-center">
        <h1 className="truncate text-base font-bold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid size-9 shrink-0 place-items-center">{action}</div>
    </header>
  );
}
