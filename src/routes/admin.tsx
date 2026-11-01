import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CloudSun,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand";
import { AdminErrors } from "@/components/admin-errors";
import { AdminNotices } from "@/components/admin-notices";
import { AdminUsers } from "@/components/admin-users";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminAuditLog,
  getAdminFeatureFlags,
  getAdminHealth,
  getAdminOperations,
  getAdminOverview,
  getAdminRegistrationTrend,
  getAdminSchemes,
  getAdminFeedback,
  updateAdminFeedbackStatus,
  setFeatureFlag,
  type AdminCount,
} from "@/lib/admin.functions";
import { getProviderDiagnostics } from "@/lib/market-prices.functions";
import type { ProviderDiagnostic } from "@/lib/market-types";

/** Professional, farmer-readable maintenance reasons. */
const MAINTENANCE_REASONS = [
  "Scheduled maintenance",
  "Upstream data source unavailable",
  "Performance issue under investigation",
  "Accuracy verification in progress",
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Control Center — MarketMitra" },
      {
        name: "description",
        content: "Private MarketMitra operations console.",
      },
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Control Center — MarketMitra",
      },
      {
        property: "og:description",
        content: "Private MarketMitra operations console.",
      },
    ],
  }),
  component: AdminPage,
});

/* ------------------------------------------------------------------ auth */

type AdminAuthState = {
  ready: boolean;
  email: string | null;
  isAdmin: boolean;
};

function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    ready: false,
    email: null,
    isAdmin: false,
  });

  useEffect(() => {
    let alive = true;

    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (alive) {
          setState({
            ready: true,
            email: null,
            isAdmin: false,
          });
        }
        return;
      }

      const { data: role, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!alive) return;

      setState({
        ready: true,
        email: session.user.email ?? null,
        isAdmin: !error && role?.role === "admin",
      });
    };

    void checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkAdmin();
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

function AdminPage() {
  const { ready, email, isAdmin } = useAdminAuth();

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[oklch(0.15_0.02_160)]">
        <Loader2 className="size-6 animate-spin text-[oklch(0.85_0.02_150)]" />
      </div>
    );
  }

  if (!email) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <Unauthorized email={email} />;
  }

  return <AdminConsole email={email} />;
}

/* ---------------------------------------------------------------- login */

function AdminLogin() {
  const [emailValue, setEmailValue] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailValue.trim(),
      password,
    });

    if (signInError) {
      setBusy(false);
      setError("Those credentials were not accepted.");
      return;
    }

    /*
     * The auth listener in useAdminAuth() will now check
     * public.user_roles and only allow users with role = admin.
     */

    setBusy(false);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[oklch(0.14_0.02_160)] px-5">
      <div className="pointer-events-none absolute -top-32 left-1/2 size-[420px] -translate-x-1/2 animate-breathe rounded-full bg-[oklch(0.7_0.16_150/0.18)] blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-140px] right-[-80px] size-[360px] animate-breathe rounded-full bg-[oklch(0.6_0.12_200/0.14)] blur-3xl" />

      <form
        onSubmit={submit}
        className="animate-rise relative w-full max-w-sm rounded-3xl border border-[oklch(1_0_0/0.12)] bg-[oklch(1_0_0/0.05)] p-7 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.14)]">
            <LogoMark className="size-7" />
          </span>

          <div>
            <p className="font-display text-base font-extrabold text-[oklch(0.98_0.01_140)]">
              Market<span className="text-[oklch(0.8_0.17_150)]">Mitra</span>
            </p>

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.75_0.03_150)]">
              Control Center
            </p>
          </div>
        </div>

        <h1 className="mt-7 font-display text-xl font-bold text-[oklch(0.98_0.01_140)]">
          Private access
        </h1>

        <p className="mt-1 text-xs leading-relaxed text-[oklch(0.78_0.02_150)]">
          Authorised operators only. Every action is logged.
        </p>

        <label className="mt-6 block text-[11px] font-bold uppercase tracking-wider text-[oklch(0.75_0.03_150)]">
          Email
        </label>

        <input
          type="email"
          required
          autoComplete="username"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-2xl border border-[oklch(1_0_0/0.14)] bg-[oklch(1_0_0/0.06)] px-4 text-sm text-[oklch(0.98_0.01_140)] outline-none placeholder:text-[oklch(0.68_0.02_150)] focus:border-[oklch(0.7_0.16_150/0.6)]"
          placeholder="you@example.com"
        />

        <label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-[oklch(0.75_0.03_150)]">
          Password
        </label>

        <div className="relative mt-1.5">
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-2xl border border-[oklch(1_0_0/0.14)] bg-[oklch(1_0_0/0.06)] px-4 pr-12 text-sm text-[oklch(0.98_0.01_140)] outline-none focus:border-[oklch(0.7_0.16_150/0.6)]"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.75_0.03_150)]"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-[oklch(0.55_0.18_25/0.16)] px-3 py-2 text-xs font-semibold text-[oklch(0.9_0.06_30)]">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="press mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.62_0.15_150)] text-sm font-bold text-[oklch(0.13_0.02_160)] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}

          {busy ? "Verifying…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------------------------------------- unauthorized */

function Unauthorized({ email }: { email: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[oklch(0.14_0.02_160)] px-5">
      <div className="w-full max-w-md rounded-3xl border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.05)] p-7 text-center backdrop-blur-xl">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[oklch(0.55_0.18_25/0.14)]">
          <ShieldCheck className="size-7 text-[oklch(0.8_0.08_25)]" />
        </div>

        <h1 className="mt-5 font-display text-xl font-bold text-[oklch(0.98_0.01_140)]">
          Not authorised
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-[oklch(0.78_0.02_150)]">
          The account
          <span className="mx-1 font-semibold text-[oklch(0.9_0.02_150)]">{email}</span>
          is signed in, but it does not have administrator access.
        </p>

        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="press mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(1_0_0/0.08)] text-sm font-bold text-[oklch(0.95_0.01_145)]"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- console */

function AdminConsole({ email }: { email: string }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("admin-overview");
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("marketmitra-admin-sidebar-collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("marketmitra-admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const submitGlobalSearch = (value: string) => {
    setGlobalSearch(value);
    if (!value.trim()) return;
    window.dispatchEvent(new CustomEvent("marketmitra-admin-user-search", { detail: value }));
    document.querySelector("#admin-users")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const overviewFn = useServerFn(getAdminOverview);
  const flagsFn = useServerFn(getAdminFeatureFlags);
  const auditFn = useServerFn(getAdminAuditLog);
  const healthFn = useServerFn(getAdminHealth);
  const diagnosticsFn = useServerFn(getProviderDiagnostics);
  const operationsFn = useServerFn(getAdminOperations);
  const schemesFn = useServerFn(getAdminSchemes);
  const feedbackFn = useServerFn(getAdminFeedback);
  const updateFeedbackStatus = useServerFn(updateAdminFeedbackStatus);
  const registrationTrendFn = useServerFn(getAdminRegistrationTrend);
  const updateFlag = useServerFn(setFeatureFlag);
  const qc = useQueryClient();

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => overviewFn(),
    retry: false,
    refetchInterval: 60_000,
  });

  const registrationTrend = useQuery({
    queryKey: ["admin", "registration-trend", 30],
    queryFn: () => registrationTrendFn({ data: { days: 30 } }),
    retry: false,
    refetchInterval: 300_000,
  });

  const operations = useQuery({
    queryKey: ["admin", "operations"],
    queryFn: () => operationsFn(),
    retry: false,
  });

  const schemeCatalogue = useQuery({
    queryKey: ["admin", "schemes"],
    queryFn: () => schemesFn(),
    retry: false,
  });

  const feedback = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: () => feedbackFn(),
    retry: false,
  });

  const feedbackMutation = useMutation({
    mutationFn: updateFeedbackStatus,
    onSuccess: () => {
      toast.success("Feedback status updated.");
      void qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
      void qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const [feedbackQuery, setFeedbackQuery] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("all");
  const [feedbackStatus, setFeedbackStatus] = useState("all");

  const sectionLabels: Record<string, string> = {
    "admin-overview": "Overview",
    "admin-analytics": "User activity",
    "admin-mitra-ai": "Mitra AI",
    "admin-users": "Users",
    "admin-diagnose": "Diagnose",
    "admin-mitra-link": "Mitra Link",
    "admin-market-data": "Markets & prices",
    "admin-weather": "Weather",
    "admin-schemes": "Government schemes",
    "admin-errors": "Reports & feedback",
    "admin-feedback": "Reports & feedback",
    "admin-notices": "Notices",
    "admin-feature-controls": "Features",
    "admin-system-health": "System health",
    "admin-audit": "Audit logs",
    "admin-recent-activity": "Live activity",
  };

  useEffect(() => {
    document.title = `${sectionLabels[activeSection] ?? "Dashboard"} — MarketMitra Admin`;
  }, [activeSection]);

  useEffect(() => {
    const applyHash = () => {
      const target = window.location.hash.slice(1);
      if (target && sectionLabels[target]) {
        setActiveSection(target);
        requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: "start" }));
      } else if (!target) {
        setActiveSection("admin-overview");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    const sectionIds = [
      "admin-overview",
      "admin-analytics",
      "admin-recent-activity",
      "admin-users",
      "admin-mitra-ai",
      "admin-diagnose",
      "admin-mitra-link",
      "admin-market-data",
      "admin-weather",
      "admin-schemes",
      "admin-notices",
      "admin-errors",
      "admin-feedback",
      "admin-feature-controls",
      "admin-system-health",
      "admin-audit",
    ];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (window.location.hash) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [overview.data]);

  const flags = useQuery({
    queryKey: ["admin", "flags"],
    queryFn: () => flagsFn(),
    retry: false,
  });

  const audit = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => auditFn(),
    retry: false,
  });

  const health = useQuery({
    queryKey: ["admin", "health"],
    queryFn: () => healthFn(),
    retry: false,
    refetchInterval: 120_000,
  });

  const diagnostics = useQuery({
    queryKey: ["admin", "provider-diagnostics"],
    queryFn: () => diagnosticsFn(),
    retry: false,
    refetchInterval: 120_000,
  });

  const toggle = useMutation({
    mutationFn: (vars: {
      key: string;
      enabled: boolean;
      reason?: string | null;
      message?: string | null;
    }) => updateFlag({ data: vars }),

    onSuccess: () => {
      toast.success("Feature status updated.");
      void qc.invalidateQueries({
        queryKey: ["admin", "flags"],
      });

      void qc.invalidateQueries({
        queryKey: ["admin", "audit"],
      });

      void qc.invalidateQueries({
        queryKey: ["feature-flags"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const forbidden =
    overview.isError && /forbidden/i.test(String((overview.error as Error)?.message ?? ""));

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.02_160)] text-[oklch(0.95_0.01_145)]">
      {mobileSidebar && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.07] bg-[oklch(0.13_0.018_160)] transition-[width,transform] duration-300 ${
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        } w-[248px] ${sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[248px]"} lg:translate-x-0`}
      >
        <div className="flex h-[72px] items-center gap-3 border-b border-white/[0.07] px-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-300/20">
            <LogoMark className="size-6" />
          </span>
          {(!sidebarCollapsed || mobileSidebar) && <div className="min-w-0">
            <p className="font-display text-sm font-bold">MarketMitra</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Control center</p>
          </div>}
          <button
            type="button"
            onClick={() => setMobileSidebar(false)}
            className="ml-auto rounded-lg p-2 text-white/60 hover:bg-white/[0.07] lg:hidden"
            aria-label="Close navigation"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {[
            ["Overview", ["Dashboard|admin-overview", "Analytics|admin-analytics", "Live activity|admin-recent-activity"]],
            ["User intelligence", ["Users|admin-users", "Mitra AI|admin-mitra-ai", "Diagnose|admin-diagnose", "Mitra Link|admin-mitra-link"]],
            ["Management", ["Markets & prices|admin-market-data", "Weather|admin-weather", "Government schemes|admin-schemes", "Notices|admin-notices", "Reports & feedback|admin-feedback", "Errors & application reports|admin-errors"]],
            ["System", ["Feature management|admin-feature-controls", "System health|admin-system-health", "Audit logs|admin-audit"]],
          ].map(([group, items]) => (
            <div key={group as string} className="mb-5">
              {(!sidebarCollapsed || mobileSidebar) && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{group as string}</p>}
              <div className="space-y-1">
                {(items as string[]).map((item) => {
                  const [label = "", target = ""] = item.split("|");
                  return (
                    <a
                      key={target}
                      href={`#${target}`}
                      onClick={() => {
                        setActiveSection(target);
                        setMobileSidebar(false);
                      }}
                      title={sidebarCollapsed && !mobileSidebar ? label : undefined}
                      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors ${
                        activeSection === target
                          ? "bg-emerald-400/[0.12] text-white ring-1 ring-emerald-300/[0.08]"
                          : "text-white/58 hover:bg-white/[0.055] hover:text-white"
                      }`}
                    >
                      <AdminNavIcon target={target} />
                      {(!sidebarCollapsed || mobileSidebar) && <span className="truncate">{label}</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <button
          type="button"
          onClick={toggleSidebar}
          className="m-3 hidden h-10 items-center justify-center rounded-xl text-white/45 hover:bg-white/[0.055] lg:flex"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </aside>
      <header className={`sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.07] bg-[oklch(0.14_0.02_160/0.92)] px-4 py-3 backdrop-blur-xl lg:px-6 ${sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[248px]"}`}>
        <button
          type="button"
          onClick={() => setMobileSidebar(true)}
          className="grid size-9 place-items-center rounded-xl border border-white/[0.08] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="font-display text-sm font-extrabold">{sectionLabels[activeSection] ?? "Dashboard"}</p>
          <p className="truncate text-[11px] text-white/40">Operations / {sectionLabels[activeSection] ?? "Overview"}</p>
        </div>

        <label className="ml-auto hidden h-9 max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 md:flex">
          <Search className="size-4 text-white/35" />
          <input
            type="search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitGlobalSearch(globalSearch);
              }
            }}
            placeholder="Search users, data, feedback..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void Promise.all([
                overview.refetch(),
                flags.refetch(),
                audit.refetch(),
                health.refetch(),
                diagnostics.refetch(),
                registrationTrend.refetch(),
                operations.refetch(),
                schemeCatalogue.refetch(),
                feedback.refetch(),
                qc.invalidateQueries({ queryKey: ["admin", "users"] }),
                qc.invalidateQueries({ queryKey: ["admin", "notices"] }),
              ]);
            }}
            className="press grid size-9 place-items-center rounded-full bg-[oklch(1_0_0/0.07)]"
            aria-label="Refresh"
          >
            <RefreshCw className={`size-4 ${overview.isFetching ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="press flex h-9 items-center gap-2 rounded-full bg-[oklch(1_0_0/0.07)] px-3 text-xs font-bold"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </header>

      <main
        className={`mx-auto w-full px-4 py-6 lg:px-7 xl:px-8 ${
          sidebarCollapsed ? "lg:ml-[76px] lg:w-[calc(100%-76px)]" : "lg:ml-[248px] lg:w-[calc(100%-248px)]"
        }`}
      >
        {forbidden ? (
          <Panel title="Not authorised" icon={<ShieldCheck className="size-4" />}>
            <p className="text-sm leading-relaxed text-[oklch(0.8_0.02_150)]">
              This account is signed in but does not hold the administrator role, so no operational
              data is available.
            </p>
          </Panel>
        ) : (
          <div className="space-y-5">
            {overview.isLoading && (
              <div className="grid h-24 place-items-center rounded-3xl border border-[oklch(1_0_0/0.09)]">
                <Loader2 className="size-5 animate-spin text-[oklch(0.8_0.02_150)]" />
              </div>
            )}
            {overview.isError && (
              <Panel title="Overview unavailable" icon={<AlertTriangle className="size-4" />}>
                <p role="alert" className="text-sm text-[oklch(0.9_0.06_30)]">
                  Failed to load overview: {overview.error.message}
                </p>
              </Panel>
            )}
            {overview.data && (
              <div id="admin-overview" className="space-y-5">
                <section className="flex flex-wrap items-end justify-between gap-3 pb-1 pt-1">
                  <div>
                    <p className="text-xs font-semibold text-emerald-300/70">Good morning, Admin</p>
                    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
                      Here&apos;s what&apos;s happening across MarketMitra.
                    </h1>
                  </div>
                  <p className="text-xs text-white/45">
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </section>
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat
                    label="Registered users"
                    value={overview.data.users.registered}
                    icon={<Users className="size-4" />}
                  />

                  <Stat
                    label="Active users · 24h"
                    value={overview.data.users.activeToday}
                    icon={<Activity className="size-4" />}
                  />

                  <Stat
                    label="Active users · 7d"
                    value={overview.data.users.activeWeek}
                    icon={<Activity className="size-4" />}
                  />

                  <Stat
                    label="New users · today"
                    value={overview.data.users.newToday}
                    icon={<Users className="size-4" />}
                  />

                  <Stat
                    label="New users · 7d"
                    value={overview.data.users.newWeek}
                    icon={<Users className="size-4" />}
                  />

                  <Stat
                    label="Mitra AI conversations"
                    value={overview.data.users.conversations}
                    detail={`${overview.data.users.conversationsToday.toLocaleString("en-IN")} today`}
                    icon={<Sparkles className="size-4" />}
                  />

                  <Stat
                    label="Mitra AI messages"
                    value={overview.data.users.messages}
                    detail={`${overview.data.users.messagesToday.toLocaleString("en-IN")} today`}
                    icon={<Sparkles className="size-4" />}
                  />

                  <Stat
                    label="Crop diagnoses"
                    value={overview.data.users.diagnoses}
                    detail={`${overview.data.users.diagnosesToday.toLocaleString("en-IN")} today`}
                    icon={<Activity className="size-4" />}
                  />

                  <Stat
                    label="Sessions · 30 days"
                    value={overview.data.tracking.sessions}
                    icon={<Activity className="size-4" />}
                  />

                  <Stat
                    label="Sessions · 24 hours"
                    value={overview.data.tracking.sessions24h}
                    icon={<Sparkles className="size-4" />}
                  />

                  <Stat
                    label="Page views · 30 days"
                    value={overview.data.tracking.pageViews}
                    icon={<BarChart3 className="size-4" />}
                  />
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <Panel
                    title="Feature usage · last 30 days"
                    icon={<BarChart3 className="size-4" />}
                    id="admin-analytics"
                  >
                    <UsageList features={overview.data.tracking.features} />
                  </Panel>

                  <Panel title="Usage per day" icon={<Activity className="size-4" />}>
                    <DailyChart series={overview.data.tracking.daily} />
                  </Panel>
                  <Panel title="User registrations · last 30 days" icon={<Users className="size-4" />}>
                    {registrationTrend.isLoading ? (
                      <SkeletonLines rows={4} />
                    ) : registrationTrend.isError ? (
                      <UnavailableState message="Registration history could not be loaded." />
                    ) : registrationTrend.data ? (
                      <div>
                        <DailyChart series={registrationTrend.data.trend} />
                        <p className="mt-2 text-[10px] text-white/35">Source: authenticated user creation records</p>
                      </div>
                    ) : (
                      <UnavailableState message="Registration history is unavailable." />
                    )}
                  </Panel>
                </section>

                <section className="grid gap-5 lg:grid-cols-3">
                  <Panel title="Popular pages" icon={<BarChart3 className="size-4" />}>
                    <Bars rows={overview.data.tracking.topPages} />
                  </Panel>

                  <Panel title="Popular crops" icon={<BarChart3 className="size-4" />}>
                    <Bars rows={overview.data.tracking.topCrops} />
                  </Panel>

                  <Panel title="Devices & languages" icon={<BarChart3 className="size-4" />}>
                    <Bars rows={overview.data.tracking.devices} />

                    <div className="mt-3 border-t border-[oklch(1_0_0/0.08)] pt-3">
                      <Bars rows={overview.data.tracking.languages} />
                    </div>
                  </Panel>
                </section>

                <section className="grid gap-5 lg:grid-cols-2">
                  <Panel
                    title="Service health"
                    icon={<Activity className="size-4" />}
                    id="admin-system-health"
                  >
                    {health.isLoading ? (
                      <SkeletonLines rows={3} />
                    ) : health.isError || !health.data ? (
                      <p className="text-sm text-[oklch(0.8_0.02_150)]">
                        Failed to check upstream services:{" "}
                        {health.error?.message ?? "No health result returned."}
                      </p>
                    ) : (
                      <>
                        <ul className="space-y-2.5">
                          {health.data.services.map((s) => (
                            <li key={s.name} className="flex items-start gap-3 text-sm">
                              {s.ok ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[oklch(0.75_0.16_150)]" />
                              ) : (
                                <XCircle className="mt-0.5 size-4 shrink-0 text-[oklch(0.68_0.18_25)]" />
                              )}

                              <div className="min-w-0">
                                <p className="font-semibold">{s.name}</p>

                                <p className="text-xs text-[oklch(0.75_0.02_150)]">
                                  {s.detail}
                                  {s.latencyMs != null ? ` · ${s.latencyMs} ms` : ""}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <p className="mt-3 text-[11px] text-[oklch(0.68_0.02_150)]">
                          Checked live at{" "}
                          {new Date(health.data.generatedAt).toLocaleString("en-IN")}
                        </p>
                      </>
                    )}
                  </Panel>

                  <Panel
                    title="Market data source"
                    icon={<Database className="size-4" />}
                    id="admin-market-data"
                  >
                    {health.isLoading ? (
                      <SkeletonLines rows={5} />
                    ) : health.isError || !health.data ? (
                      <p className="text-sm text-[oklch(0.8_0.02_150)]">
                        Failed to read government dataset status:{" "}
                        {health.error?.message ?? "No health result returned."}
                      </p>
                    ) : (
                      <>
                        <dl className="space-y-2 text-sm">
                          <Row k="Source" v={health.data.marketData.source} />

                          <Row
                            k="Provider status"
                            v={health.data.marketData.ok ? "AVAILABLE" : "UNAVAILABLE"}
                          />

                          <Row
                            k="HTTP status"
                            v={health.data.marketData.statusCode?.toString() ?? "Unavailable"}
                          />

                          <Row
                            k="Records in dataset"
                            v={
                              health.data.marketData.records?.toLocaleString("en-IN") ??
                              "No data available yet"
                            }
                          />

                          <Row
                            k="Latest arrival date"
                            v={health.data.marketData.latestArrivalDate ?? "No data available yet"}
                          />

                          <Row
                            k="Source updated"
                            v={health.data.marketData.sourceUpdatedAt ?? "Not published"}
                          />
                        </dl>

                        <p className="mt-3 text-[11px] leading-relaxed text-[oklch(0.68_0.02_150)]">
                          {health.data.marketData.detail}. Prices are read live from the government
                          dataset and can never be edited from this console.
                        </p>
                      </>
                    )}
                  </Panel>
                </section>

                <Panel
                  title="Feature control"
                  icon={<ToggleRight className="size-4" />}
                  id="admin-feature-controls"
                >
                  {flags.isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : flags.isError ? (
                    <p role="alert" className="text-sm text-[oklch(0.9_0.06_30)]">
                      Failed to load feature controls: {flags.error.message}
                    </p>
                  ) : flags.data && flags.data.length > 0 ? (
                    <ul className="divide-y divide-[oklch(1_0_0/0.08)]">
                      {flags.data.map((f) => (
                        <li key={f.key} className="flex items-center gap-3 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{f.label}</p>

                            <p className="text-xs text-[oklch(0.72_0.02_150)]">
                              {f.enabled
                                ? "Live for all farmers"
                                : `Maintenance${f.reason ? ` — ${f.reason}` : ""}`}
                            </p>
                            <p className="mt-1 text-[10px] text-[oklch(0.65_0.02_150)]">
                              Last changed{" "}
                              {f.updated_at
                                ? new Date(f.updated_at).toLocaleString("en-IN")
                                : "unavailable"}
                              {f.updated_by ? ` · by ${f.updated_by}` : ""}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={toggle.isPending}
                            onClick={() => {
                              if (f.enabled) {
                                if (!window.confirm(`Disable ${f.label} for users?`)) return;
                                toggle.mutate({
                                  key: f.key,
                                  enabled: false,
                                  reason: MAINTENANCE_REASONS[0]!,
                                  message:
                                    "We are improving this section right now. Everything else in MarketMitra keeps working — please check back a little later.",
                                });
                                return;
                              }
                              if (!window.confirm(`Enable ${f.label} for users?`)) return;
                              toggle.mutate({
                                key: f.key,
                                enabled: true,
                                reason: null,
                                message: null,
                              });
                            }}
                            className="press ml-auto shrink-0"
                            aria-label={`${f.enabled ? "Disable" : "Enable"} ${f.label}`}
                          >
                            {f.enabled ? (
                              <ToggleRight className="size-9 text-[oklch(0.75_0.16_150)]" />
                            ) : (
                              <ToggleLeft className="size-9 text-[oklch(0.6_0.02_150)]" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[oklch(0.78_0.02_150)]">
                      No feature switches found.
                    </p>
                  )}
                </Panel>

                <Panel title="Market data providers" icon={<Database className="size-4" />}>
                  {diagnostics.isLoading ? (
                    <SkeletonLines rows={3} />
                  ) : diagnostics.isError || !diagnostics.data ? (
                    <p className="text-sm text-[oklch(0.8_0.02_150)]">
                      Failed to load provider diagnostics:{" "}
                      {diagnostics.error?.message ?? "No diagnostics returned."}
                    </p>
                  ) : (
                    <>
                      <p className="mb-3 text-[11px] text-[oklch(0.72_0.02_150)]">
                        Overall {diagnostics.data.overall.replace("_", " ")} ·{" "}
                        {diagnostics.data.latestDataDate
                          ? `latest official data date ${diagnostics.data.latestDataDate}`
                          : "no official data date recorded"}
                      </p>

                      <ul className="space-y-2.5">
                        {diagnostics.data.providers.map((p) => (
                          <li key={p.id} className="rounded-2xl bg-[oklch(1_0_0/0.05)] p-3">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-bold">{p.name}</span>

                              <span className="ml-auto shrink-0 rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 text-[10px] font-bold uppercase">
                                {providerStatusLabel(p)}
                              </span>
                            </div>

                            <p className="mt-1 text-[11px] text-[oklch(0.72_0.02_150)]">
                              priority {p.priority} · {p.coverage}
                              {p.requiresKey
                                ? p.configured
                                  ? " · key configured"
                                  : " · key missing"
                                : ""}
                            </p>

                            <p className="mt-1 text-[11px] text-[oklch(0.72_0.02_150)]">
                              {p.successes24h}/{p.attempts24h} calls ok · 24h ·{" "}
                              {p.lastDurationMs === null
                                ? "no latency yet"
                                : `${p.lastDurationMs} ms last call`}
                              {p.lastRecordCount === null ? "" : ` · ${p.lastRecordCount} rows`}
                            </p>

                            <p className="mt-1 text-[11px] text-[oklch(0.65_0.02_150)]">
                              last attempted {p.lastAttemptAt ?? "—"}
                              {p.lastStatusCode === null ? "" : ` · HTTP ${p.lastStatusCode}`}
                              {p.latestDataDate ? ` · latest data ${p.latestDataDate}` : ""}
                            </p>

                            <p className="mt-1 text-[11px] text-[oklch(0.65_0.02_150)]">
                              last success {p.lastSuccessAt ?? "—"}
                              {p.lastError ? ` · last error: ${p.lastError}` : ""}
                              {p.archive ? " · archive data is historical, not a live price" : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Panel>

                <section className="grid gap-5 lg:grid-cols-2">
                  <Panel title="Recent activity" icon={<Activity className="size-4" />} id="admin-recent-activity">
                    {overview.data.tracking.recent.length === 0 ? (
                      <Empty />
                    ) : (
                      <ul className="space-y-2 text-xs">
                        {overview.data.tracking.recent.map((r, i) => (
                          <li key={`${r.at}-${i}`} className="flex items-center gap-2">
                            <span className="rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 font-semibold">
                              {r.event.replace(/_/g, " ")}
                            </span>

                            <span className="truncate text-[oklch(0.75_0.02_150)]">
                              {r.label ?? r.page ?? ""}
                            </span>

                            <span className="ml-auto shrink-0 text-[oklch(0.65_0.02_150)]">
                              {new Date(r.at).toLocaleTimeString("en-IN", {
                                hour12: false,
                              })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-3 text-[11px] leading-relaxed text-[oklch(0.68_0.02_150)]">
                      Aggregate, anonymous events only — no names, contacts, coordinates or Mitra AI
                      message contents are recorded.
                    </p>
                  </Panel>

                  <Panel
                    title="Admin audit log"
                    icon={<ShieldCheck className="size-4" />}
                    id="admin-audit"
                  >
                    {audit.isLoading ? (
                      <SkeletonLines rows={3} />
                    ) : audit.isError ? (
                      <p role="alert" className="text-sm text-[oklch(0.9_0.06_30)]">
                        Failed to load audit entries: {audit.error.message}
                      </p>
                    ) : audit.data && audit.data.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {audit.data.map((a) => (
                          <li key={a.id} className="flex items-center gap-2">
                            <span className="rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 font-semibold">
                              {a.action.replace(/_/g, " ")}
                            </span>

                            <span className="truncate text-[oklch(0.75_0.02_150)]">
                              {JSON.stringify(a.detail)} · admin {a.admin_id}
                            </span>

                            <span className="ml-auto shrink-0 text-[oklch(0.65_0.02_150)]">
                              {new Date(a.created_at).toLocaleString("en-IN")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Empty />
                    )}
                  </Panel>
                </section>
              </div>
            )}
            {!overview.data && (
              <>
                <section id="admin-overview" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <UnavailableState message="Dashboard data is unavailable while Supabase server configuration is missing or backend requests fail." />
                </section>
                <section id="admin-analytics" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <Panel title="User activity unavailable">
                    <UnavailableState message="Analytics require the admin overview and registration history server functions." />
                  </Panel>
                </section>
                <section id="admin-recent-activity" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <Panel title="Live activity unavailable">
                    <UnavailableState message="Activity events require the admin overview server function." />
                  </Panel>
                </section>
                <section id="admin-market-data" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <Panel title="Markets & prices unavailable">
                    <UnavailableState message="Market data requires the configured Supabase server connection and market provider integration." />
                  </Panel>
                </section>
                <section id="admin-feature-controls" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <Panel title="Feature management unavailable">
                    <UnavailableState message="Feature flags require an authorized admin server connection." />
                  </Panel>
                </section>
                <section id="admin-system-health" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <Panel title="System health unavailable">
                    <UnavailableState message="Service health requires the admin health server function." />
                  </Panel>
                </section>
                <section id="admin-audit" className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
                  <Panel title="Audit logs unavailable">
                    <UnavailableState message="Audit records require an authorized admin server connection." />
                  </Panel>
                </section>
              </>
            )}
            <section id="admin-mitra-ai" className="scroll-mt-20 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Mitra AI operations</h2>
              <p className="mt-1 text-xs text-white/55">Privacy-safe aggregate conversation analytics. Private message contents are not displayed.</p>
              {operations.isLoading ? <div className="mt-4"><SkeletonLines rows={4} /></div> :
                operations.isError ? <p role="alert" className="mt-4 text-sm text-red-200">Mitra AI records could not be loaded.</p> :
                operations.data ? (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                      <Stat label="Conversations" value={operations.data.mitraAi.conversations} />
                      <Stat label="Messages" value={operations.data.mitraAi.messages} />
                      <Stat label="User messages" value={operations.data.mitraAi.userMessages} />
                      <Stat label="Unique users" value={operations.data.mitraAi.uniqueUsers} />
                      <Stat label="Recorded errors" value={operations.data.mitraAi.errors} />
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <Panel title="Question categories">
                        {operations.data.mitraAi.categories.length ? (
                          <Bars rows={operations.data.mitraAi.categories} />
                        ) : <Empty />}
                      </Panel>
                      <Panel title="Conversation quality">
                        <dl className="space-y-2 text-sm">
                          <Row k="Average messages / conversation" v={operations.data.mitraAi.averageMessagesPerConversation?.toString() ?? "Unavailable"} />
                          <Row k="Stored private content" v="Not displayed" />
                          <Row k="Source" v="chat_conversations and chat_messages" />
                        </dl>
                      </Panel>
                    </div>
                  </>
                ) : <UnavailableState message="Mitra AI records are unavailable." />}
            </section>
            <section id="admin-diagnose" className="scroll-mt-20 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Crop diagnosis operations</h2>
              {operations.isLoading ? <SkeletonLines rows={3} /> : operations.isError ? (
                <p role="alert" className="mt-4 text-sm text-red-200">Diagnosis records could not be loaded.</p>
              ) : operations.data && (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Stat label="Diagnosis records" value={operations.data.diagnose.total} />
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-white/45"><tr><th className="py-2">Request</th><th>Status</th><th>Created</th></tr></thead>
                      <tbody>{operations.data.diagnose.recent.map((row) => (
                        <tr key={row.id} className="border-t border-white/[0.07]"><td className="py-2 font-mono">{row.id.slice(0, 8)}</td><td>{row.status ?? "Unknown"}</td><td>{new Date(row.createdAt).toLocaleString("en-IN")}</td></tr>
                      ))}</tbody>
                    </table>
                    {!operations.data.diagnose.recent.length && <Empty />}
                  </div>
                </>
              )}
            </section>
            <section id="admin-mitra-link" className="scroll-mt-20 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Mitra Link operations</h2>
              {operations.isLoading ? <SkeletonLines rows={3} /> : operations.isError ? (
                <p role="alert" className="mt-4 text-sm text-red-200">Mitra Link records could not be loaded.</p>
              ) : operations.data && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Stat label="Listings" value={operations.data.mitraLink.listings} />
                  <Stat label="Requests" value={operations.data.mitraLink.requests} />
                  <Stat label="Matches" value={operations.data.mitraLink.matches} />
                </div>
              )}
            </section>
            <section id="admin-weather" className="scroll-mt-20 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Weather operations</h2>
              <p className="mt-1 text-xs text-white/55">A weather source status is shown only when it is available from the existing health probes.</p>
              <Panel title="Weather health">
                {health.isLoading ? <SkeletonLines rows={3} /> : health.isError ? (
                  <UnavailableState message="Weather health could not be checked." />
                ) : health.data ? (
                  <ul className="space-y-2 text-sm">
                    {health.data.services.filter((service) => /weather/i.test(service.name)).map((service) => (
                      <li key={service.name}><strong>{service.name}</strong>: {service.detail}</li>
                    ))}
                    {!health.data.services.some((service) => /weather/i.test(service.name)) && <li>No weather-specific health probe is configured.</li>}
                  </ul>
                ) : <UnavailableState message="Weather health is unavailable." />}
              </Panel>
            </section>
            <section id="admin-schemes" className="scroll-mt-20 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Government schemes</h2>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/55">{schemeCatalogue.data?.source ?? "Source: farmer-facing verified catalogue"}</p>
                <button type="button" onClick={() => void schemeCatalogue.refetch()} className="grid size-9 place-items-center rounded-xl bg-white/[0.07]" aria-label="Refresh schemes">
                  <RefreshCw className={`size-4 ${schemeCatalogue.isFetching ? "animate-spin" : ""}`} />
                </button>
              </div>
              {schemeCatalogue.isLoading ? <div className="mt-4"><SkeletonLines rows={5} /></div> :
                schemeCatalogue.isError ? <UnavailableState message="Government schemes could not be loaded." /> :
                schemeCatalogue.data?.schemes.length ? (
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {schemeCatalogue.data.schemes.map((scheme) => (
                      <article key={scheme.id} className="rounded-2xl border border-white/[0.08] bg-black/10 p-4">
                        <div className="flex gap-2">
                          <h3 className="text-sm font-bold">{scheme.name}</h3>
                          <span className="ml-auto rounded-full bg-emerald-300/10 px-2 py-1 text-[10px] uppercase text-emerald-200">Active</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-white/65">{scheme.description}</p>
                        <p className="mt-3 text-[11px] text-white/55"><strong>Benefits:</strong> {scheme.benefit}</p>
                        <p className="mt-2 text-[11px] text-white/55"><strong>Eligibility:</strong> {scheme.eligibility.join("; ")}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-white/45">
                          <span>{scheme.source}</span>
                          {scheme.lastUpdated && <span>Verified {scheme.lastUpdated}</span>}
                          {scheme.applicationUrl && <a className="ml-auto font-bold text-emerald-300 underline" href={scheme.applicationUrl} target="_blank" rel="noreferrer">Official application</a>}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <Empty />}
            </section>
            <section id="admin-feedback" className="scroll-mt-20 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Reports & feedback</h2>
                  <p className="mt-1 text-xs text-white/55">Submitted by authenticated MarketMitra users.</p>
                </div>
                <button type="button" onClick={() => void feedback.refetch()} className="grid size-9 place-items-center rounded-xl bg-white/[0.07]" aria-label="Refresh feedback">
                  <RefreshCw className={`size-4 ${feedback.isFetching ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <input value={feedbackQuery} onChange={(event) => setFeedbackQuery(event.target.value)} placeholder="Search feedback" className="h-9 rounded-lg border border-white/10 bg-black/15 px-3 text-xs" />
                <select value={feedbackCategory} onChange={(event) => setFeedbackCategory(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[oklch(0.18_0.02_160)] px-3 text-xs">
                  <option value="all">All categories</option><option value="feedback">Feedback</option><option value="bug_report">Bug report</option>
                </select>
                <select value={feedbackStatus} onChange={(event) => setFeedbackStatus(event.target.value)} className="h-9 rounded-lg border border-white/10 bg-[oklch(0.18_0.02_160)] px-3 text-xs">
                  <option value="all">All statuses</option><option value="new">New</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
                </select>
              </div>
              {feedback.isLoading ? <div className="mt-4"><SkeletonLines rows={4} /></div> : feedback.isError ? (
                <UnavailableState message="Feedback records could not be loaded." />
              ) : feedback.data ? (() => {
                const needle = feedbackQuery.trim().toLowerCase();
                const rows = feedback.data.filter((row) =>
                  (!needle || `${row.subject} ${row.message}`.toLowerCase().includes(needle)) &&
                  (feedbackCategory === "all" || row.category === feedbackCategory) &&
                  (feedbackStatus === "all" || row.status === feedbackStatus),
                );
                return rows.length ? (
                  <div className="mt-4 divide-y divide-white/[0.07]">
                    {rows.map((row) => (
                      <article key={row.id} className="py-4">
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase text-white/45">
                          <span>{row.category.replace("_", " ")}</span><span>{new Date(row.createdAt).toLocaleString("en-IN")}</span>
                        </div>
                        <h3 className="mt-1 text-sm font-bold">{row.subject}</h3>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-white/65">{row.message}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <select aria-label={`Status for ${row.subject}`} value={row.status} disabled={feedbackMutation.isPending} onChange={(event) => feedbackMutation.mutate({ data: { id: row.id, status: event.target.value as "new" | "in_review" | "resolved" } })} className="h-8 rounded-lg border border-white/10 bg-[oklch(0.18_0.02_160)] px-2 text-xs">
                            <option value="new">New</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
                          </select>
                          {row.userId && <span className="ml-auto truncate font-mono text-[10px] text-white/35">{row.userId}</span>}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <p className="mt-4 text-sm text-white/55">No feedback matches the current filters.</p>;
              })() : <UnavailableState message="Feedback records are unavailable." />}
            </section>
            <AdminErrors />
            <AdminUsers />
            <AdminNotices />
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------- bits */

function AdminNavIcon({ target }: { target: string }) {
  if (target.includes("analytics") || target.includes("overview")) return <BarChart3 className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("activity")) return <Activity className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("users")) return <Users className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("market")) return <Database className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("notices")) return <Bell className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("errors")) return <AlertTriangle className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("feature")) return <SlidersHorizontal className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("health")) return <CloudSun className="size-[17px] shrink-0 text-emerald-300/70" />;
  if (target.includes("audit")) return <ShieldCheck className="size-[17px] shrink-0 text-emerald-300/70" />;
  return <Settings className="size-[17px] shrink-0 text-emerald-300/70" />;
}

function providerStatusLabel(provider: ProviderDiagnostic) {
  if (provider.archive) {
    if (provider.latestDataDate) return "STALE";
    return provider.configured ? "NO DATA AVAILABLE" : "NOT CONFIGURED";
  }

  switch (provider.status) {
    case "healthy":
      return "LIVE · HEALTHY";
    case "degraded":
      return "DEGRADED";
    case "down":
      return "UNAVAILABLE";
    case "not_configured":
      return "NOT CONFIGURED";
    default:
      return "UNAVAILABLE";
  }
}

function Panel({
  title,
  icon,
  children,
  id,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-20 rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-5 backdrop-blur-xl"
    >
      <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[oklch(0.76_0.03_150)]">
        {icon}
        {title}
      </p>

      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  detail,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className="rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-4">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[oklch(0.74_0.03_150)]">
        {icon}
        {label}
      </p>

      <p className="mt-2 font-display text-2xl font-extrabold">{value.toLocaleString("en-IN")}</p>
      {detail && <p className="mt-1 text-[10px] text-[oklch(0.68_0.02_150)]">{detail}</p>}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-[oklch(0.75_0.02_150)]">No data available yet.</p>;
}

function UnavailableState({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-4 text-xs text-white/55">
      {message}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[oklch(0.74_0.02_150)]">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}

function Bars({ rows }: { rows: AdminCount }) {
  if (rows.length === 0) return <Empty />;

  const max = Math.max(...rows.map((r) => r.count));

  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-semibold">{r.key}</span>

            <span className="text-[oklch(0.74_0.02_150)]">{r.count.toLocaleString("en-IN")}</span>
          </div>

          <div className="mt-1 h-1.5 rounded-full bg-[oklch(1_0_0/0.08)]">
            <div
              className="h-full rounded-full bg-[oklch(0.7_0.16_150)]"
              style={{
                width: `${Math.max(4, (r.count / max) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DailyChart({ series }: { series: { day: string; count: number }[] }) {
  if (series.length === 0) return <Empty />;

  const max = Math.max(...series.map((s) => s.count));

  return (
    <div className="flex h-32 items-end gap-1">
      {series.map((s) => (
        <div key={s.day} className="group flex-1" title={`${s.day}: ${s.count}`}>
          <div
            className="w-full rounded-t bg-[oklch(0.7_0.16_150)] transition-all group-hover:bg-[oklch(0.8_0.17_150)]"
            style={{
              height: `${Math.max(3, (s.count / max) * 120)}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function UsageList({
  features,
}: {
  features: {
    marketSearches: number;
    weatherLookups: number;
    diagnoseStarted: number;
    diagnoseCompleted: number;
    diagnoseFailed: number;
    mitraConversations: number;
    mitraMessages: number;
    mitraErrors: number;
    schemeViews: number;
  };
}) {
  const rows: AdminCount = [
    {
      key: "Market searches",
      count: features.marketSearches,
    },
    {
      key: "Weather lookups",
      count: features.weatherLookups,
    },
    {
      key: "Diagnoses started",
      count: features.diagnoseStarted,
    },
    {
      key: "Diagnoses completed",
      count: features.diagnoseCompleted,
    },
    {
      key: "Diagnosis failures",
      count: features.diagnoseFailed,
    },
    {
      key: "Mitra AI conversations",
      count: features.mitraConversations,
    },
    {
      key: "Mitra AI questions",
      count: features.mitraMessages,
    },
    {
      key: "Mitra AI errors",
      count: features.mitraErrors,
    },
    {
      key: "Scheme views",
      count: features.schemeViews,
    },
  ];

  if (rows.every((r) => r.count === 0)) {
    return <Empty />;
  }

  return <Bars rows={rows} />;
}
function SkeletonLines({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded-lg bg-[oklch(1_0_0/0.07)]" />
      ))}
    </div>
  );
}
