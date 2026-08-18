import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { LogoMark } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminAuditLog,
  getAdminFeatureFlags,
  getAdminHealth,
  getAdminOverview,
  setFeatureFlag,
  type AdminCount,
} from "@/lib/admin.functions";

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
            {show ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
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
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LockKeyhole className="size-4" />
          )}

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
          <span className="mx-1 font-semibold text-[oklch(0.9_0.02_150)]">
            {email}
          </span>
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
  const overviewFn = useServerFn(getAdminOverview);
  const flagsFn = useServerFn(getAdminFeatureFlags);
  const auditFn = useServerFn(getAdminAuditLog);
  const healthFn = useServerFn(getAdminHealth);
  const updateFlag = useServerFn(setFeatureFlag);
  const qc = useQueryClient();

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => overviewFn(),
    retry: false,
    refetchInterval: 60_000,
  });

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

  const toggle = useMutation({
    mutationFn: (vars: { key: string; enabled: boolean }) =>
      updateFlag({ data: vars }),

    onSuccess: () => {
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
  });

  const forbidden =
    overview.isError &&
    /forbidden/i.test(
      String((overview.error as Error)?.message ?? ""),
    );

  return (
    <div className="min-h-screen bg-[oklch(0.14_0.02_160)] text-[oklch(0.95_0.01_145)]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[oklch(1_0_0/0.08)] bg-[oklch(0.14_0.02_160/0.86)] px-4 py-3 backdrop-blur-xl lg:px-8">
        <LogoMark className="size-8" />

        <div className="min-w-0">
          <p className="font-display text-sm font-extrabold">
            Control Center
          </p>

          <p className="truncate text-[11px] text-[oklch(0.75_0.02_150)]">
            {email}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => void overview.refetch()}
            className="press grid size-9 place-items-center rounded-full bg-[oklch(1_0_0/0.07)]"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`size-4 ${
                overview.isFetching ? "animate-spin" : ""
              }`}
            />
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

      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        {forbidden ? (
          <Panel
            title="Not authorised"
            icon={<ShieldCheck className="size-4" />}
          >
            <p className="text-sm leading-relaxed text-[oklch(0.8_0.02_150)]">
              This account is signed in but does not hold the administrator
              role, so no operational data is available.
            </p>
          </Panel>
        ) : overview.isLoading ? (
          <div className="grid h-64 place-items-center">
            <Loader2 className="size-6 animate-spin text-[oklch(0.8_0.02_150)]" />
          </div>
        ) : overview.isError ? (
          <Panel
            title="Data unavailable"
            icon={<AlertTriangle className="size-4" />}
          >
            <p className="text-sm text-[oklch(0.8_0.02_150)]">
              The console could not load operational data just now. Try
              refreshing.
            </p>
          </Panel>
        ) : (
          overview.data && (
            <div className="space-y-5">
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  label="Farmer profiles"
                  value={overview.data.users.profiles}
                  icon={<Users className="size-4" />}
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
                >
                  <UsageList features={overview.data.tracking.features} />
                </Panel>

                <Panel
                  title="Usage per day"
                  icon={<Activity className="size-4" />}
                >
                  <DailyChart series={overview.data.tracking.daily} />
                </Panel>
              </section>

              <section className="grid gap-5 lg:grid-cols-3">
                <Panel
                  title="Popular pages"
                  icon={<BarChart3 className="size-4" />}
                >
                  <Bars rows={overview.data.tracking.topPages} />
                </Panel>

                <Panel
                  title="Popular crops"
                  icon={<BarChart3 className="size-4" />}
                >
                  <Bars rows={overview.data.tracking.topCrops} />
                </Panel>

                <Panel
                  title="Devices & languages"
                  icon={<BarChart3 className="size-4" />}
                >
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
                >
                  {health.isLoading ? (
                    <SkeletonLines rows={3} />
                  ) : health.isError || !health.data ? (
                    <p className="text-sm text-[oklch(0.8_0.02_150)]">
                      Unable to check upstream services right now.
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-2.5">
                        {health.data.services.map((s) => (
                          <li
                            key={s.name}
                            className="flex items-start gap-3 text-sm"
                          >
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
                >
                  {health.isLoading ? (
                    <SkeletonLines rows={5} />
                  ) : health.isError || !health.data ? (
                    <p className="text-sm text-[oklch(0.8_0.02_150)]">
                      Unable to read the government dataset status right now.
                    </p>
                  ) : (
                    <>
                      <dl className="space-y-2 text-sm">
                        <Row k="Source" v={health.data.marketData.source} />

                        <Row
                          k="Reachable"
                          v={health.data.marketData.ok ? "Yes" : "No"}
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
                          v={
                            health.data.marketData.latestArrivalDate ??
                            "No data available yet"
                          }
                        />

                        <Row
                          k="Source updated"
                          v={health.data.marketData.sourceUpdatedAt ?? "Not published"}
                        />
                      </dl>

                      <p className="mt-3 text-[11px] leading-relaxed text-[oklch(0.68_0.02_150)]">
                        {health.data.marketData.detail}. Prices are read live from
                        the government dataset and can never be edited from this
                        console.
                      </p>
                    </>
                  )}
                </Panel>
              </section>


              <Panel
                title="Feature control"
                icon={<ToggleRight className="size-4" />}
              >
                {flags.isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : flags.data && flags.data.length > 0 ? (
                  <ul className="divide-y divide-[oklch(1_0_0/0.08)]">
                    {flags.data.map((f) => (
                      <li
                        key={f.key}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {f.label}
                          </p>

                          <p className="text-xs text-[oklch(0.72_0.02_150)]">
                            {f.enabled
                              ? "Live for all farmers"
                              : "Showing maintenance message"}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={toggle.isPending}
                          onClick={() =>
                            toggle.mutate({
                              key: f.key,
                              enabled: !f.enabled,
                            })
                          }
                          className="press ml-auto shrink-0"
                          aria-label={`${
                            f.enabled ? "Disable" : "Enable"
                          } ${f.label}`}
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

              <section className="grid gap-5 lg:grid-cols-2">
                <Panel
                  title="Recent activity"
                  icon={<Activity className="size-4" />}
                >
                  {overview.data.tracking.recent.length === 0 ? (
                    <Empty />
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {overview.data.tracking.recent.map((r, i) => (
                        <li
                          key={`${r.at}-${i}`}
                          className="flex items-center gap-2"
                        >
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
                    Aggregate, anonymous events only — no names, contacts,
                    coordinates or Mitra AI message contents are recorded.
                  </p>
                </Panel>

                <Panel
                  title="Admin audit log"
                  icon={<ShieldCheck className="size-4" />}
                >
                  {audit.data && audit.data.length > 0 ? (
                    <ul className="space-y-2 text-xs">
                      {audit.data.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center gap-2"
                        >
                          <span className="rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 font-semibold">
                            {a.action.replace(/_/g, " ")}
                          </span>

                          <span className="truncate text-[oklch(0.75_0.02_150)]">
                            {JSON.stringify(a.detail)}
                          </span>

                          <span className="ml-auto shrink-0 text-[oklch(0.65_0.02_150)]">
                            {new Date(a.created_at).toLocaleString(
                              "en-IN",
                            )}
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
          )
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------- bits */

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-5 backdrop-blur-xl">
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
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-4">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[oklch(0.74_0.03_150)]">
        {icon}
        {label}
      </p>

      <p className="mt-2 font-display text-2xl font-extrabold">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function Empty() {
  return (
    <p className="text-sm text-[oklch(0.75_0.02_150)]">
      No data available yet.
    </p>
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

            <span className="text-[oklch(0.74_0.02_150)]">
              {r.count.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-1 h-1.5 rounded-full bg-[oklch(1_0_0/0.08)]">
            <div
              className="h-full rounded-full bg-[oklch(0.7_0.16_150)]"
              style={{
                width: `${Math.max(
                  4,
                  (r.count / max) * 100,
                )}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DailyChart({
  series,
}: {
  series: { day: string; count: number }[];
}) {
  if (series.length === 0) return <Empty />;

  const max = Math.max(...series.map((s) => s.count));

  return (
    <div className="flex h-32 items-end gap-1">
      {series.map((s) => (
        <div
          key={s.day}
          className="group flex-1"
          title={`${s.day}: ${s.count}`}
        >
          <div
            className="w-full rounded-t bg-[oklch(0.7_0.16_150)] transition-all group-hover:bg-[oklch(0.8_0.17_150)]"
            style={{
              height: `${Math.max(
                3,
                (s.count / max) * 120,
              )}px`,
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