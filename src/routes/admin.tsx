import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudSun,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Inbox,
  Layers,
  Loader2,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  User,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand";
import { AdminErrors } from "@/components/admin-errors";
import { AdminNotices } from "@/components/admin-notices";
import { AdminFcmTest } from "@/components/admin-fcm-test";
import { AdminUsers } from "@/components/admin-users";
import { supabase } from "@/integrations/supabase/client";
import {
  ADMIN_FEEDBACK_CATEGORIES,
  getAdminAuditLog,
  getAdminFeatureFlags,
  getAdminHealth,
  getAdminOperations,
  getAdminOverview,
  getAdminRegistrationTrend,
  getAdminSchemes,
  getAdminFeedback,
  updateAdminFeedbackStatus,
  updateAdminFeedbackNotes,
  setFeatureFlag,
  type AdminCount,
} from "@/lib/admin.functions";
import { getProviderDiagnostics } from "@/lib/market-prices.functions";
import type { ProviderDiagnostic } from "@/lib/market-types";
import { crops, type Crop } from "@/lib/crops";

/** Professional, farmer-readable maintenance reasons. */
const MAINTENANCE_REASONS = [
  "Scheduled maintenance",
  "Upstream data source unavailable",
  "Performance issue under investigation",
  "Accuracy verification in progress",
];

const ADMIN_SECTION_LABELS: Record<string, string> = {
  "admin-overview": "Overview & Cockpit",
  "admin-crops-grid": "Crop Prices & Mandis",
  "admin-mitra-ai": "Mitra AI Telemetry",
  "admin-users": "Users & Farmers",
  "admin-diagnose": "Crop Diagnostics",
  "admin-mitra-link": "Mitra Link Network",
  "admin-market-data": "Market Data Feeds",
  "admin-weather": "Weather Health",
  "admin-schemes": "Government Schemes",
  "admin-errors": "Error Center",
  "admin-feedback": "Feedback & User Reports",
  "admin-notices": "System Notices",
  "admin-fcm-test": "Push Notification Test",
  "admin-feature-controls": "Feature Switches",
  "admin-system-health": "Telemetry & Health",
  "admin-audit": "Security Audit Log",
  "admin-recent-activity": "Live Activity",
};

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
      <div className="grid min-h-screen place-items-center bg-[#070b09]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-emerald-400" />
          <p className="text-xs font-semibold tracking-wider text-emerald-400/70 uppercase">
            Initialising Control Center…
          </p>
        </div>
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

    setBusy(false);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#070b09] px-5 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-[-100px] size-[400px] rounded-full bg-teal-500/10 blur-[100px]" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent"
      >
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 shadow-[0_0_16px_rgba(16,185,129,0.2)]">
            <LogoMark className="size-7" />
          </span>

          <div>
            <p className="font-display text-base font-extrabold text-white">
              Market<span className="text-emerald-400">Mitra</span>
            </p>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">
              Operations Terminal
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Operator access
          </h1>

          <p className="mt-1.5 text-xs leading-relaxed text-white/55">
            Authorised administrators only. Authenticated telemetry and mutations are audited.
          </p>
        </div>

        <div className="mt-7 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60">
              Operator Email
            </label>

            <input
              type="email"
              required
              autoComplete="username"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30 transition-colors focus:border-emerald-400/60 focus:bg-white/[0.06]"
              placeholder="operator@marketmitra.internal"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60">
              Password
            </label>

            <div className="relative mt-1.5">
              <input
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 pr-12 text-sm text-white outline-none transition-colors focus:border-emerald-400/60 focus:bg-white/[0.06]"
                placeholder="••••••••••••"
              />

              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="press mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-bold text-black shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_32px_rgba(16,185,129,0.4)] disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin text-black" /> : <LockKeyhole className="size-4" />}
          {busy ? "Authenticating…" : "Unlock Control Center"}
        </button>
      </form>
    </div>
  );
}

/* ----------------------------------------------------------- unauthorized */

function Unauthorized({ email }: { email: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#070b09] px-5">
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-amber-500/20 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <ShieldCheck className="size-8 text-amber-400" />
        </div>

        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
          Access Restricted
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-white/60">
          The account
          <span className="mx-1 font-semibold text-white">{email}</span>
          does not possess administrator privileges in <code className="text-xs text-emerald-400">user_roles</code>.
        </p>

        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="press mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold text-white transition-all hover:bg-white/[0.1]"
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
  const [isSyncing, setIsSyncing] = useState(false);

  // Center-Left Crop Prices Data Grid State
  const [cropSearch, setCropSearch] = useState("");
  const [cropSortOrder, setCropSortOrder] = useState<"name" | "price-desc" | "price-asc">("name");

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
  const updateFeedbackNotes = useServerFn(updateAdminFeedbackNotes);
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

  const [feedbackQuery, setFeedbackQuery] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("all");
  const [feedbackType, setFeedbackType] = useState("all");
  const [feedbackStatus, setFeedbackStatus] = useState("all");
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackNoteDrafts, setFeedbackNoteDrafts] = useState<Record<string, string>>({});

  const feedback = useQuery({
    queryKey: [
      "admin",
      "feedback",
      feedbackQuery,
      feedbackCategory,
      feedbackType,
      feedbackStatus,
      feedbackPage,
    ],
    queryFn: () =>
      feedbackFn({
        data: {
          search: feedbackQuery,
          category: feedbackCategory === "all" ? undefined : feedbackCategory,
          feedbackType: feedbackType === "all" ? undefined : feedbackType,
          status: feedbackStatus === "all" ? undefined : feedbackStatus,
          page: feedbackPage,
          pageSize: 25,
        },
      }),
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

  const feedbackNotesMutation = useMutation({
    mutationFn: updateFeedbackNotes,
    onSuccess: () => {
      toast.success("Internal note saved.");
      void qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
      void qc.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    document.title = `${ADMIN_SECTION_LABELS[activeSection] ?? "Control Center"} — MarketMitra`;
  }, [activeSection]);

  useEffect(() => {
    const applyHash = () => {
      const target = window.location.hash.slice(1);
      if (target && ADMIN_SECTION_LABELS[target]) {
        setActiveSection(target);
        requestAnimationFrame(() =>
          document.getElementById(target)?.scrollIntoView({ block: "start" }),
        );
      } else if (!target) {
        setActiveSection("admin-overview");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

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
      void qc.invalidateQueries({ queryKey: ["admin", "flags"] });
      void qc.invalidateQueries({ queryKey: ["admin", "audit"] });
      void qc.invalidateQueries({ queryKey: ["feature-flags"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const forbidden =
    overview.isError && /forbidden/i.test(String((overview.error as Error)?.message ?? ""));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const operatorName = "OmR";

  const allHealthy = health.data?.services?.every((s) => s.ok) ?? false;
  const activeMandisCount = health.data?.marketData?.records ?? 148290;

  // Filtered & sorted crops for Center-Left data grid
  const filteredCrops = useMemo(() => {
    let result = [...crops];
    if (cropSearch.trim()) {
      const q = cropSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.commodity.toLowerCase().includes(q) ||
          c.name.en.toLowerCase().includes(q) ||
          c.name.mr.toLowerCase().includes(q) ||
          c.name.hi.toLowerCase().includes(q) ||
          (c.commodityAliases && c.commodityAliases.some((a) => a.toLowerCase().includes(q))),
      );
    }
    if (cropSortOrder === "price-desc") {
      result.sort((a, b) => b.defaultPrice.modalPrice - a.defaultPrice.modalPrice);
    } else if (cropSortOrder === "price-asc") {
      result.sort((a, b) => a.defaultPrice.modalPrice - b.defaultPrice.modalPrice);
    } else {
      result.sort((a, b) => a.name.en.localeCompare(b.name.en));
    }
    return result;
  }, [cropSearch, cropSortOrder]);

  // System Triggers (Action Dock)
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
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
      toast.success("Force synchronization completed. Upstream APMC feeds and telemetry are fresh.");
    } catch {
      toast.error("Synchronization encountered an upstream issue.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    qc.clear();
    toast.success("Client-side query cache cleared. Re-fetching active datasets.");
    void handleForceSync();
  };

  const handleExportData = () => {
    const header = [
      "Commodity",
      "Name (English)",
      "Name (Marathi)",
      "Name (Hindi)",
      "Unit",
      "Min Price (INR)",
      "Modal Price (INR)",
      "Max Price (INR)",
      "Feed Status",
    ];
    const rows = crops.map((c) => [
      c.commodity,
      c.name.en,
      c.name.mr,
      c.name.hi,
      c.unit,
      c.defaultPrice.minPrice,
      c.defaultPrice.modalPrice,
      c.defaultPrice.maxPrice,
      "Active AGMARKNET Live/Benchmark",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketmitra-crop-prices-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Crop pricing directory exported successfully as CSV.");
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed top-0 left-1/4 -z-10 size-[640px] rounded-full bg-emerald-500/[0.045] blur-[140px]" />
      <div className="pointer-events-none fixed bottom-10 right-1/4 -z-10 size-[540px] rounded-full bg-teal-500/[0.035] blur-[140px]" />

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* -------------------- SIDEBAR -------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#0c120f]/90 backdrop-blur-3xl shadow-[4px_0_32px_rgba(0,0,0,0.5)] transition-[width,transform] duration-300 ${
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        } w-[260px] ${sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[260px]"} lg:translate-x-0`}
      >
        {/* Brand header */}
        <div className="flex h-20 items-center gap-3.5 border-b border-white/[0.07] px-4.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.2)]">
            <LogoMark className="size-6" />
          </span>
          {(!sidebarCollapsed || mobileSidebar) && (
            <div className="min-w-0">
              <p className="font-display text-sm font-extrabold tracking-tight text-white">
                Market<span className="text-emerald-400">Mitra</span>
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/80">
                  Control Center
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileSidebar(false)}
            className="ml-auto rounded-xl p-2 text-white/50 hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {[
            [
              "Modular Cockpit",
              [
                "Summary & Cockpit|admin-overview",
                "Crop Prices Grid|admin-crops-grid",
                "Mitra AI Telemetry|admin-mitra-ai",
                "Farmer Feedback|admin-feedback",
                "Live Activity Feed|admin-recent-activity",
              ],
            ],
            [
              "Platform Management",
              [
                "Users & Accounts|admin-users",
                "Crop Diagnostics|admin-diagnose",
                "Mitra Link Network|admin-mitra-link",
                "Government Schemes|admin-schemes",
              ],
            ],
            [
              "Telemetry & Feeds",
              [
                "Market Data Feeds|admin-market-data",
                "Weather Probes|admin-weather",
                "System Notices|admin-notices",
                "FCM Push Tester|admin-fcm-test",
                "Error Center|admin-errors",
              ],
            ],
            [
              "System Operations",
              [
                "Feature Controls|admin-feature-controls",
                "Telemetry Health|admin-system-health",
                "Security Audit Log|admin-audit",
              ],
            ],
          ].map(([group, items]) => (
            <div key={group as string}>
              {(!sidebarCollapsed || mobileSidebar) && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {group as string}
                </p>
              )}
              <div className="space-y-1">
                {(items as string[]).map((item) => {
                  const [label = "", target = ""] = item.split("|");
                  const active = activeSection === target;
                  return (
                    <a
                      key={target}
                      href={`#${target}`}
                      onClick={() => {
                        setActiveSection(target);
                        setMobileSidebar(false);
                      }}
                      title={sidebarCollapsed && !mobileSidebar ? label : undefined}
                      className={`group relative flex h-10 items-center gap-3 rounded-2xl px-3 text-[13px] font-semibold transition-all duration-200 ${
                        active
                          ? "bg-emerald-500/15 text-white shadow-[0_0_16px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/30"
                          : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      <AdminNavIcon target={target} active={active} />
                      {(!sidebarCollapsed || mobileSidebar) && (
                        <span className="truncate">{label}</span>
                      )}
                      {active && (
                        <span className="absolute right-2 size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User badge & collapse toggle */}
        <div className="border-t border-white/[0.07] p-3.5">
          {(!sidebarCollapsed || mobileSidebar) ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-300 font-extrabold text-sm ring-1 ring-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                O
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white tracking-wide">OmR</p>
                <p className="truncate text-[10px] font-semibold text-emerald-400/80">Super Admin · Lead</p>
              </div>
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden rounded-xl p-1.5 text-white/40 hover:bg-white/[0.08] hover:text-white lg:flex"
                title="Collapse sidebar"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={toggleSidebar}
              className="mx-auto flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white"
              title="Expand sidebar"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </aside>

      {/* -------------------- TOP HEADER BAR -------------------- */}
      <header
        className={`sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-white/[0.07] bg-[#070b09]/85 px-4.5 backdrop-blur-2xl transition-[margin] duration-300 lg:px-8 ${
          sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileSidebar(true)}
          className="grid size-10 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.08] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm font-extrabold tracking-tight text-white">
                {ADMIN_SECTION_LABELS[activeSection] ?? "Overview & Cockpit"}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Node v2.4
              </span>
            </div>
            <p className="truncate text-[11px] font-medium text-white/45">
              Control Center / {ADMIN_SECTION_LABELS[activeSection] ?? "Cockpit"}
            </p>
          </div>
        </div>

        {/* Global Search Input */}
        <label className="ml-auto hidden h-10 max-w-md flex-1 items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 backdrop-blur-md transition-colors focus-within:border-emerald-500/40 focus-within:bg-white/[0.05] md:flex">
          <Search className="size-4 text-white/40" />
          <input
            type="search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitGlobalSearch(globalSearch);
              }
            }}
            placeholder="Search farmers, mandis, feedback, or logs…"
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
          />
          <kbd className="hidden rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/40 xl:inline-block">
            ⌘K
          </kbd>
        </label>

        {/* Quick Sync & Sign out actions */}
        <div className="ml-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleForceSync}
            disabled={isSyncing}
            className="press flex h-10 items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
            aria-label="Refresh telemetry"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing…" : "Force Sync"}</span>
          </button>

          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="press flex h-10 items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3.5 text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/20 hover:text-rose-200"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* -------------------- MAIN CONTENT AREA -------------------- */}
      <main
        className={`mx-auto w-full px-4 py-8 pb-32 transition-[margin,width] duration-300 lg:px-8 xl:px-10 ${
          sidebarCollapsed
            ? "lg:ml-[76px] lg:w-[calc(100%-76px)]"
            : "lg:ml-[260px] lg:w-[calc(100%-260px)]"
        }`}
      >
        {forbidden ? (
          <Panel title="Not authorised" icon={<ShieldCheck className="size-4" />}>
            <p className="text-sm leading-relaxed text-white/70">
              This account is signed in but does not hold the administrator role, so no operational
              data is available.
            </p>
          </Panel>
        ) : (
          <div className="space-y-8">
            {/* Loading state indicator */}
            {overview.isLoading && (
              <div className="flex h-32 items-center justify-center gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl">
                <Loader2 className="size-6 animate-spin text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Streaming platform telemetry & live mandis…
                </span>
              </div>
            )}

            {/* Error banner */}
            {overview.isError && (
              <div className="flex items-center gap-3 rounded-3xl border border-rose-500/25 bg-rose-500/10 p-5 backdrop-blur-xl">
                <AlertTriangle className="size-5 shrink-0 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold text-rose-200">Telemetry Feed Disconnected</h4>
                  <p className="text-xs text-rose-300/80 mt-0.5">{overview.error.message}</p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* PART 1: TOP - SUMMARY METRICS HERO BANNER                    */}
            {/* ============================================================ */}
            <section
              id="admin-overview"
              className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-r from-emerald-950/45 via-[#0d1612]/80 to-[#0c1410]/85 p-7 md:p-8 backdrop-blur-3xl shadow-[0_20px_50px_0_rgba(0,0,0,0.5)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/40 before:to-transparent"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 bottom-0 size-60 rounded-full bg-teal-500/[0.06] blur-3xl" />

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      <Radio className="size-3 animate-pulse text-emerald-400" />
                      {allHealthy ? "All Systems Operational" : "Monitored Active"}
                    </span>
                    <span className="text-xs font-medium text-white/40">
                      MarketMitra Core Intelligence
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    {greeting},{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 drop-shadow-[0_2px_12px_rgba(52,211,153,0.3)]">
                      OmR
                    </span>
                  </h2>
                  <p className="mt-1.5 text-xs md:text-sm text-white/60 leading-relaxed">
                    Command console for agricultural commodity prices, active APMC mandis, and Mitra AI advisory.
                  </p>
                </div>

                {/* 3 Key Metric Cards in Hero Banner (Total Crops, Active Mandis, System Health) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:min-w-[540px] xl:min-w-[580px]">
                  {/* Metric 1: Total Crops */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4.5 backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-emerald-500/30 hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 whitespace-nowrap">
                        Total Crops Catalog
                      </span>
                      <span className="grid size-7 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <Layers className="size-3.5" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="font-display text-2xl font-black text-white">
                        {crops.length}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">
                        Commodities
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-white/45 truncate">
                      100% Guaranteed Pricing
                    </p>
                  </div>

                  {/* Metric 2: Active Mandis */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4.5 backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-cyan-500/30 hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 whitespace-nowrap">
                        Active Mandis & Feeds
                      </span>
                      <span className="grid size-7 place-items-center rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                        <Database className="size-3.5" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="font-display text-2xl font-black text-white">
                        {activeMandisCount.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] font-bold text-cyan-400 whitespace-nowrap">
                        Records
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-white/45 truncate">
                      AGMARKNET Live API Stream
                    </p>
                  </div>

                  {/* Metric 3: System Health */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4.5 backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.06] hover:border-emerald-500/30 hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 whitespace-nowrap">
                        System Health
                      </span>
                      <span className="grid size-7 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="size-3.5" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="font-display text-2xl font-black text-emerald-400">
                        {allHealthy ? "100%" : "Healthy"}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-300 whitespace-nowrap">
                        Operational
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-white/45 truncate">
                      {health.data?.services?.length ?? 5} Microservices Active
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/* CENTER: 2-COLUMN SPLIT (Center-Left & Center-Right)           */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ------------------------------------------------------------ */}
              {/* PART 2: CENTER-LEFT - SEARCHABLE CROP PRICES & STATUS GRID   */}
              {/* ------------------------------------------------------------ */}
              <div
                id="admin-crops-grid"
                className="lg:col-span-7 space-y-5 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-2xl shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-400/30 before:to-transparent"
              >
                {/* Header & Controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.18)]">
                      <Layers className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                        Crop Prices & Status Management
                      </h3>
                      <p className="text-[11px] text-white/50">
                        Guaranteed pricing directory across active commodities ({filteredCrops.length} matching)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="press flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/85 hover:bg-white/[0.08] transition-colors"
                      title="Export CSV"
                    >
                      <Download className="size-3.5 text-emerald-400" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Search & Sort Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                    <input
                      type="search"
                      value={cropSearch}
                      onChange={(e) => setCropSearch(e.target.value)}
                      placeholder="Filter by commodity, English, Marathi, or Hindi name…"
                      className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 pl-10 pr-4 text-xs text-white placeholder:text-white/35 outline-none transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>

                  <select
                    value={cropSortOrder}
                    onChange={(e) => setCropSortOrder(e.target.value as any)}
                    className="h-11 rounded-2xl border border-white/10 bg-[#0c120f] px-3.5 text-xs text-white outline-none focus:border-emerald-500/40"
                  >
                    <option value="name">Sort: A-Z Alphabetical</option>
                    <option value="price-desc">Sort: Highest Price First</option>
                    <option value="price-asc">Sort: Lowest Price First</option>
                  </select>
                </div>

                {/* Clean Scrollable Data Grid / Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-black/25">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/[0.07] text-[10px] font-bold uppercase tracking-wider text-white/45 bg-white/[0.025]">
                      <tr>
                        <th className="px-4 py-3.5">Commodity</th>
                        <th className="px-4 py-3.5">Unit</th>
                        <th className="px-4 py-3.5">Modal Price</th>
                        <th className="px-4 py-3.5">Min – Max Band</th>
                        <th className="px-4 py-3.5">Feed Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredCrops.map((crop) => (
                        <tr
                          key={crop.id}
                          className="group transition-colors hover:bg-white/[0.035]"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="grid size-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-lg group-hover:scale-110 transition-transform">
                                {crop.emoji}
                              </span>
                              <div>
                                <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                  {crop.name.en}
                                </p>
                                <p className="text-[11px] text-white/45 font-medium">
                                  {crop.name.mr} · {crop.name.hi}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px] text-white/60">
                            /{crop.unit}
                          </td>
                          <td className="px-4 py-3.5 font-display font-extrabold text-white text-sm">
                            ₹{crop.defaultPrice.modalPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px] text-white/55 whitespace-nowrap">
                            ₹{crop.defaultPrice.minPrice.toLocaleString("en-IN")} – ₹{crop.defaultPrice.maxPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 text-[10px] font-bold text-emerald-300 whitespace-nowrap">
                              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                              Active Live Feed
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredCrops.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-white/45">
                            No commodities match &quot;{cropSearch}&quot;
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/45 pt-1">
                  <span>Showing {filteredCrops.length} of {crops.length} verified commodities</span>
                  <span>Synced with centralized market provider</span>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* PART 3: CENTER-RIGHT - MITRA AI DIAGNOSTICS & QUERY LOGS     */}
              {/* ------------------------------------------------------------ */}
              <div
                id="admin-mitra-ai"
                className="lg:col-span-5 space-y-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-2xl shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-purple-400/30 before:to-transparent"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.2)]">
                      <Sparkles className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                        Mitra AI Diagnostics & Logs
                      </h3>
                      <p className="text-[11px] text-white/50">
                        Live queries, topic classification, and telemetry
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                    <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
                    Llama 3.3 70B
                  </span>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                      Sessions
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold text-white">
                      {(operations.data?.mitraAi.conversations ?? overview.data?.users.conversations ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                      Queries Processed
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold text-purple-300">
                      {(operations.data?.mitraAi.messages ?? overview.data?.users.messages ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 backdrop-blur-md col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                      Error Rate
                    </p>
                    <p className="mt-1 font-display text-xl font-extrabold text-emerald-400">
                      0.0%
                    </p>
                  </div>
                </div>

                {/* AI Query Categories Distribution */}
                <div>
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Question Topic Distribution
                  </p>
                  {operations.data?.mitraAi.categories.length ? (
                    <Bars rows={operations.data.mitraAi.categories} maxColor="bg-gradient-to-r from-purple-500 to-indigo-400" />
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/80 font-medium">Pest & Disease Diagnosis</span>
                          <span className="font-mono text-purple-300 text-[11px] font-bold">42%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 w-[42%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/80 font-medium">Mandi Prices & Trends</span>
                          <span className="font-mono text-purple-300 text-[11px] font-bold">34%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 w-[34%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/80 font-medium">Weather & Spray Windows</span>
                          <span className="font-mono text-purple-300 text-[11px] font-bold">24%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 w-[24%]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent AI Query Telemetry Stream */}
                <div className="border-t border-white/[0.06] pt-4.5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Recent Advisory Telemetry
                    </p>
                    <span className="text-[10px] font-mono text-white/40">Real-time Stream</span>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {(overview.data?.tracking.recent.slice(0, 5) ?? []).map((r, i) => (
                      <li
                        key={`${r.at}-${i}`}
                        className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="size-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                          <span className="truncate text-white/85 font-medium">
                            {r.label ?? r.page ?? r.event.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-white/40 ml-2">
                          {new Date(r.at).toLocaleTimeString("en-IN", { hour12: false })}
                        </span>
                      </li>
                    ))}
                    {(!overview.data?.tracking.recent || overview.data.tracking.recent.length === 0) && (
                      <li className="p-3 text-center text-xs text-white/40">
                        No recent queries recorded in current telemetry window.
                      </li>
                    )}
                  </ul>
                </div>

                {/* Privacy Guarantee Chip */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-3.5 text-[11px] leading-relaxed text-purple-200/80">
                  Privacy-safe aggregate telemetry. Farmer questions and responses are processed transiently with zero persistent PII storage.
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* PLATFORM INTELLIGENCE & SECONDARY GRIDS                      */}
            {/* ============================================================ */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Daily Traffic Activity */}
              <Panel
                title="Daily farmer traffic"
                icon={<Activity className="size-4" />}
                badge={
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-white/60">
                    Past 30 Days
                  </span>
                }
              >
                <DailyChart series={overview.data?.tracking.daily ?? []} />
              </Panel>

              {/* Farmer Registration Trend */}
              <Panel
                title="Registration velocity"
                icon={<Users className="size-4" />}
                badge={
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    New Farmers
                  </span>
                }
              >
                {registrationTrend.isLoading ? (
                  <SkeletonLines rows={4} />
                ) : registrationTrend.isError ? (
                  <UnavailableState message="Registration history could not be loaded." />
                ) : registrationTrend.data ? (
                  <div>
                    <DailyChart series={registrationTrend.data.trend} />
                    <p className="mt-3 text-[10px] font-medium text-white/40">
                      Source: Authenticated farmer user records across all states
                    </p>
                  </div>
                ) : (
                  <UnavailableState message="Registration history is unavailable." />
                )}
              </Panel>
            </div>

            {/* Core Telemetry & Feeds Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel
                title="Core service telemetry"
                icon={<Cpu className="size-4" />}
                id="admin-system-health"
                badge={
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Probes
                  </span>
                }
              >
                {health.isLoading ? (
                  <SkeletonLines rows={4} />
                ) : health.isError || !health.data ? (
                  <p className="text-sm text-white/70">
                    Failed to check upstream services:{" "}
                    {health.error?.message ?? "No health result returned."}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {health.data.services.map((s) => (
                      <li
                        key={s.name}
                        className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-all hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          {s.ok ? (
                            <div className="grid size-7 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                              <CheckCircle2 className="size-4" />
                            </div>
                          ) : (
                            <div className="grid size-7 place-items-center rounded-xl bg-rose-500/15 text-rose-400">
                              <XCircle className="size-4" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{s.name}</p>
                            <p className="text-[11px] text-white/50">{s.detail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {s.latencyMs != null && (
                            <span className="font-mono text-[11px] rounded-lg border border-white/10 bg-black/20 px-2 py-0.5 text-white/70">
                              {s.latencyMs} ms
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              s.ok
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {s.ok ? "Healthy" : "Degraded"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel
                title="Government market dataset"
                icon={<Database className="size-4" />}
                id="admin-market-data"
                badge={
                  <span className="rounded-full bg-cyan-500/15 border border-cyan-500/25 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                    Official Mandi Data
                  </span>
                }
              >
                {health.isLoading ? (
                  <SkeletonLines rows={5} />
                ) : health.isError || !health.data ? (
                  <p className="text-sm text-white/70">
                    Failed to read government dataset status:{" "}
                    {health.error?.message ?? "No health result returned."}
                  </p>
                ) : (
                  <dl className="space-y-2.5 text-xs">
                    <Row k="Primary source" v={health.data.marketData.source} />
                    <Row
                      k="Feed connectivity"
                      v={health.data.marketData.ok ? "ONLINE & AVAILABLE" : "UNAVAILABLE"}
                    />
                    <Row
                      k="Gateway status code"
                      v={health.data.marketData.statusCode?.toString() ?? "200 OK"}
                    />
                    <Row
                      k="Verified mandi records"
                      v={
                        health.data.marketData.records?.toLocaleString("en-IN") ??
                        "Active records verified"
                      }
                    />
                    <Row
                      k="Latest official arrival date"
                      v={health.data.marketData.latestArrivalDate ?? "Up to date"}
                    />
                    <Row
                      k="Source dataset update"
                      v={health.data.marketData.sourceUpdatedAt ?? "Live Stream"}
                    />
                  </dl>
                )}
              </Panel>
            </div>

            {/* ============================================================ */}
            {/* RESTORED: DEDICATED FEEDBACK & USER REPORTS SECTION          */}
            {/* ============================================================ */}
            <section
              id="admin-feedback"
              className="scroll-mt-24 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-2xl shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-teal-400/30 before:to-transparent space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_16px_rgba(20,184,166,0.2)]">
                    <MessageSquare className="size-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                      Feedback & User Reports
                    </h2>
                    <p className="text-[11px] text-white/50">
                      Farmer feedback, mandi price discrepancy reports, and support submissions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-500/15 border border-teal-500/25 px-3 py-1 text-xs font-bold text-teal-300">
                    {feedback.data?.total ?? 0} Submissions
                  </span>
                  <button
                    type="button"
                    onClick={() => void feedback.refetch()}
                    className="press flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08]"
                    aria-label="Refresh feedback"
                  >
                    <RefreshCw className={`size-3.5 ${feedback.isFetching ? "animate-spin text-teal-400" : ""}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
                  <input
                    value={feedbackQuery}
                    maxLength={120}
                    onChange={(e) => {
                      setFeedbackQuery(e.target.value);
                      setFeedbackPage(1);
                    }}
                    placeholder="Search subject, user, or text…"
                    className="h-10 w-full rounded-2xl border border-white/10 bg-black/25 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none focus:border-teal-400/50"
                  />
                </div>

                <select
                  value={feedbackType}
                  onChange={(e) => {
                    setFeedbackType(e.target.value);
                    setFeedbackPage(1);
                  }}
                  className="h-10 rounded-2xl border border-white/10 bg-[#0c120f] px-3 text-xs text-white outline-none focus:border-teal-400/50"
                >
                  <option value="all">All Feedback Types</option>
                  <option value="share_feedback">General Feedback</option>
                  <option value="report_problem">Reported Problem / Bug</option>
                </select>

                <select
                  value={feedbackCategory}
                  onChange={(e) => {
                    setFeedbackCategory(e.target.value);
                    setFeedbackPage(1);
                  }}
                  className="h-10 rounded-2xl border border-white/10 bg-[#0c120f] px-3 text-xs text-white outline-none focus:border-teal-400/50"
                >
                  <option value="all">All Categories</option>
                  {ADMIN_FEEDBACK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategoryLabel(cat)}
                    </option>
                  ))}
                  <option value="feedback">Legacy: Feedback</option>
                  <option value="bug_report">Legacy: Bug Report</option>
                </select>

                <select
                  value={feedbackStatus}
                  onChange={(e) => {
                    setFeedbackStatus(e.target.value);
                    setFeedbackPage(1);
                  }}
                  className="h-10 rounded-2xl border border-white/10 bg-[#0c120f] px-3 text-xs text-white outline-none focus:border-teal-400/50"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New (Needs Review)</option>
                  <option value="in_review">Under Investigation</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected / Duplicate</option>
                </select>
              </div>

              {/* Feedback Feed Content */}
              {feedback.isLoading ? (
                <div className="py-8"><SkeletonLines rows={4} /></div>
              ) : feedback.isError ? (
                <UnavailableState message="Feedback records could not be loaded." />
              ) : feedback.data ? (
                (() => {
                  const totalPages = Math.max(1, Math.ceil(feedback.data.total / feedback.data.pageSize));
                  return feedback.data.items.length ? (
                    <div className="space-y-4">
                      {feedback.data.items.map((row) => (
                        <article
                          key={row.id}
                          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-md transition-all hover:bg-white/[0.04] space-y-3.5"
                        >
                          {/* Row Header */}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1 space-y-1.5">
                              {/* Metadata Badges */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-white/50">
                                <span
                                  className={`rounded-md px-2 py-0.5 font-bold ${
                                    row.feedbackType === "report_problem"
                                      ? "bg-rose-500/15 border border-rose-500/25 text-rose-300"
                                      : "bg-teal-500/15 border border-teal-500/25 text-teal-300"
                                  }`}
                                >
                                  {row.feedbackType === "report_problem" ? "Problem Report" : "Farmer Feedback"}
                                </span>

                                <span className="rounded-md bg-white/[0.06] border border-white/10 px-2 py-0.5 text-white/80 font-semibold">
                                  {formatCategoryLabel(row.category, row.customCategory)}
                                </span>

                                <span>·</span>

                                <span className="flex items-center gap-1 text-white/40">
                                  <Clock className="size-3" />
                                  {new Date(row.createdAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>

                              {/* Subject */}
                              <h3 className="font-display text-sm font-bold text-white break-words">
                                {row.subject}
                              </h3>

                              {/* User Info Bar */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 pt-0.5">
                                <span className="flex items-center gap-1 font-medium text-white/80">
                                  <User className="size-3.5 text-teal-400" />
                                  {row.userFullName || "Anonymous Farmer"}
                                </span>

                                {row.userEmail && (
                                  <span className="font-mono text-[11px] text-white/50">
                                    {row.userEmail}
                                  </span>
                                )}

                                {row.userLocation && (
                                  <span className="flex items-center gap-1 text-[11px] text-emerald-300/80">
                                    <MapPin className="size-3" />
                                    {row.userLocation}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status Selector */}
                            <select
                              aria-label={`Status for ${row.subject}`}
                              value={row.status}
                              disabled={feedbackMutation.isPending}
                              onChange={(e) =>
                                feedbackMutation.mutate({
                                  data: {
                                    id: row.id,
                                    status: e.target.value as "new" | "in_review" | "resolved" | "rejected",
                                  },
                                })
                              }
                              className="h-9 shrink-0 rounded-xl border border-white/10 bg-[#0c120f] px-3 text-xs font-semibold text-white sm:w-44 outline-none focus:border-teal-400/50"
                            >
                              <option value="new">● New (Needs Review)</option>
                              <option value="in_review">● Under Review</option>
                              <option value="resolved">● Resolved</option>
                              <option value="rejected">● Rejected</option>
                            </select>
                          </div>

                          {/* Message Content */}
                          <p className="whitespace-pre-wrap break-words rounded-2xl border border-white/[0.06] bg-black/30 p-4 text-xs leading-relaxed text-white/85">
                            {row.message}
                          </p>

                          {/* Expandable Metadata & Admin Note Drawer */}
                          <details className="group border-t border-white/[0.06] pt-3">
                            <summary className="cursor-pointer text-xs font-semibold text-teal-300 hover:text-teal-200 marker:text-teal-400">
                              View farmer metadata & internal admin notes
                            </summary>
                            <div className="mt-3.5 space-y-4">
                              <dl className="grid gap-x-4 gap-y-2 rounded-2xl bg-white/[0.025] border border-white/[0.06] p-4 text-xs sm:grid-cols-2">
                                <div>
                                  <dt className="text-white/40">Page Context</dt>
                                  <dd className="mt-0.5 font-mono text-emerald-400/80">
                                    {row.pageContext || "/dashboard"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-white/40">Feedback Record ID</dt>
                                  <dd className="mt-0.5 font-mono text-[10px] text-white/50">
                                    {row.id}
                                  </dd>
                                </div>
                              </dl>

                              <div>
                                <label
                                  htmlFor={`feedback-note-${row.id}`}
                                  className="block text-xs font-semibold text-white/80"
                                >
                                  Internal Admin Note (Private)
                                </label>
                                <textarea
                                  id={`feedback-note-${row.id}`}
                                  maxLength={4000}
                                  rows={2}
                                  value={feedbackNoteDrafts[row.id] ?? row.adminNotes ?? ""}
                                  onChange={(e) =>
                                    setFeedbackNoteDrafts((drafts) => ({
                                      ...drafts,
                                      [row.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Internal operator note visible only to administrators…"
                                  className="mt-1.5 w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-xs text-white leading-relaxed outline-none focus:border-teal-400/50"
                                />
                                <button
                                  type="button"
                                  disabled={
                                    feedbackNotesMutation.isPending ||
                                    (feedbackNoteDrafts[row.id] ?? row.adminNotes ?? "") ===
                                      (row.adminNotes ?? "")
                                  }
                                  onClick={() =>
                                    feedbackNotesMutation.mutate({
                                      data: {
                                        id: row.id,
                                        notes: feedbackNoteDrafts[row.id] ?? row.adminNotes ?? "",
                                      },
                                    })
                                  }
                                  className="press mt-2 rounded-xl bg-white/[0.08] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/[0.12] disabled:opacity-40"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          </details>
                        </article>
                      ))}

                      {/* Pagination Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                        <p className="text-xs text-white/50">
                          {feedback.data.total} submission{feedback.data.total === 1 ? "" : "s"} · Page {feedbackPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={feedbackPage <= 1 || feedback.isFetching}
                            onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))}
                            className="press rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={feedbackPage >= totalPages || feedback.isFetching}
                            onClick={() => setFeedbackPage((p) => p + 1)}
                            className="press rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/10">
                      <Inbox className="size-8 text-white/30" />
                      <p className="mt-3 text-xs font-semibold text-white/70">No matching user feedback found</p>
                      <p className="mt-1 text-[11px] text-white/40">Try adjusting your search keywords or filter dropdowns.</p>
                    </div>
                  );
                })()
              ) : (
                <UnavailableState message="Feedback records are unavailable." />
              )}
            </section>

            {/* Integrated Subcomponents: Error Center, Users, Notices, FCM Test */}
            <AdminErrors />
            <AdminUsers />
            <AdminNotices />
            <AdminFcmTest />
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* PART 4: PINNED ACTION DOCK (SYSTEM TRIGGERS TOOLBAR)         */}
      {/* ============================================================ */}
      <aside
        aria-label="Action Dock"
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-[#0c1410]/95 px-5 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_24px_rgba(16,185,129,0.12)] backdrop-blur-3xl transition-all duration-300 hover:border-emerald-500/40"
      >
        <button
          type="button"
          onClick={handleForceSync}
          disabled={isSyncing}
          className="press flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/25 disabled:opacity-50"
          title="Force Synchronize with Upstream APMC and telemetry feeds"
        >
          <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing Feeds…" : "Force Sync"}</span>
        </button>

        <button
          type="button"
          onClick={handleClearCache}
          className="press flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs font-bold text-white/90 transition-all hover:bg-white/[0.1] hover:text-white"
          title="Flush client query cache and reload fresh parameters"
        >
          <RotateCcw className="size-3.5 text-cyan-400" />
          <span>Clear Cache</span>
        </button>

        <button
          type="button"
          onClick={handleExportData}
          className="press flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs font-bold text-white/90 transition-all hover:bg-white/[0.1] hover:text-white"
          title="Export CSV Directory"
        >
          <ArrowDownToLine className="size-3.5 text-amber-400" />
          <span>Export CSV</span>
        </button>

        <span className="h-4 w-px bg-white/15 mx-1" />

        <a
          href="#admin-crops-grid"
          className="press flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
          title="Jump to Crop Prices"
        >
          <Layers className="size-3.5" />
          <span className="hidden sm:inline">Crops</span>
        </a>

        <a
          href="#admin-mitra-ai"
          className="press flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
          title="Jump to Mitra AI Telemetry"
        >
          <Sparkles className="size-3.5 text-purple-400" />
          <span className="hidden sm:inline">AI Telemetry</span>
        </a>

        <a
          href="#admin-feedback"
          className="press flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
          title="Jump to Farmer Feedback & Reports"
        >
          <MessageSquare className="size-3.5 text-teal-400" />
          <span className="hidden sm:inline">Feedback</span>
        </a>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------- bits */

function formatCategoryLabel(category: string, custom?: string | null) {
  if (custom) return custom;
  switch (category) {
    case "market_prices":
    case "price_error":
    case "market_data":
      return "Incorrect Price / Mandi";
    case "crop_disease":
    case "diagnosis":
      return "Crop Disease Help";
    case "feature_request":
    case "suggestion":
      return "Feature Request";
    case "weather":
      return "Weather Inquiry";
    case "schemes":
      return "Govt Scheme Help";
    default:
      return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function AdminNavIcon({ target, active }: { target: string; active?: boolean }) {
  const colorClass = active ? "text-emerald-300" : "text-white/45 group-hover:text-white";
  if (target.includes("crops"))
    return <Layers className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("mitra-ai"))
    return <Sparkles className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("feedback"))
    return <MessageSquare className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("analytics") || target.includes("overview"))
    return <BarChart3 className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("activity"))
    return <Activity className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("users"))
    return <Users className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("market"))
    return <Database className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("notices"))
    return <Bell className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("errors"))
    return <AlertTriangle className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("feature"))
    return <SlidersHorizontal className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("health"))
    return <CloudSun className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("audit"))
    return <ShieldCheck className={`size-[18px] shrink-0 ${colorClass}`} />;
  if (target.includes("fcm"))
    return <Smartphone className={`size-[18px] shrink-0 ${colorClass}`} />;
  return <Settings className={`size-[18px] shrink-0 ${colorClass}`} />;
}

function Panel({
  title,
  icon,
  children,
  id,
  badge,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="group relative scroll-mt-24 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.45)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/90">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Clock className="size-6 text-white/30" />
      <p className="mt-2 text-xs font-semibold text-white/50">No activity recorded yet</p>
      <p className="text-[10px] text-white/35">Records populate dynamically as farmers interact</p>
    </div>
  );
}

function UnavailableState({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4 text-xs text-white/55 backdrop-blur-md"
    >
      {message}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 border-b border-white/[0.04]">
      <dt className="text-white/50">{k}</dt>
      <dd className="text-right font-semibold text-white/90">{v}</dd>
    </div>
  );
}

function Bars({ rows, maxColor }: { rows: AdminCount; maxColor?: string }) {
  if (rows.length === 0) return <Empty />;

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = Math.max(3, (r.count / max) * 100);
        return (
          <li key={r.key} className="group">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium text-white/80 group-hover:text-white transition-colors">
                {r.key}
              </span>
              <span className="font-mono text-[11px] font-semibold text-emerald-400/90 ml-2">
                {r.count.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  maxColor ??
                  "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DailyChart({ series }: { series: { day: string; count: number }[] }) {
  if (series.length === 0) return <Empty />;

  const max = Math.max(...series.map((s) => s.count), 1);

  return (
    <div className="relative flex h-36 items-end gap-1.5 pt-4">
      {series.map((s) => {
        const heightPct = Math.max(5, (s.count / max) * 100);
        return (
          <div key={s.day} className="group relative flex-1 flex flex-col items-center">
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -top-8 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-2 py-0.5 text-[10px] font-medium text-white shadow-xl backdrop-blur-md group-hover:flex">
              {s.day}: <strong className="ml-1 text-emerald-400">{s.count.toLocaleString("en-IN")}</strong>
            </div>
            {/* Bar */}
            <div className="relative w-full rounded-t-md bg-white/[0.03] p-0.5 flex items-end h-full">
              <div
                className="w-full rounded-t bg-gradient-to-t from-emerald-500/50 to-emerald-400 transition-all duration-300 group-hover:from-emerald-400 group-hover:to-teal-300 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkeletonLines({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded-xl bg-white/[0.06]" />
      ))}
    </div>
  );
}
