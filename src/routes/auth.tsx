import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoMark, Wordmark } from "@/components/brand";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MarketMitra agricultural intelligence" },
      {
        name: "description",
        content:
          "Sign in to MarketMitra for official APMC mandi prices, farm weather, crop diagnosis and government scheme guidance in English, Marathi and Hindi.",
      },
      { property: "og:title", content: "Sign in — MarketMitra" },
      {
        property: "og:description",
        content: "Intelligence for every decision from farm to market.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function safeRedirect(target?: string) {
  if (!target) return "/home";
  if (!target.startsWith("/") || target.startsWith("//")) return "/home";
  if (target.startsWith("/auth")) return "/home";
  return target;
}

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading: sessionLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const destination = safeRedirect(redirect);

  useEffect(() => {
    if (!sessionLoading && user) {
      void navigate({ to: destination, replace: true });
    }
  }, [sessionLoading, user, destination, navigate]);

  const google = async () => {
    setError(null);
    setNotice(null);
    setBusy("google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if ("error" in result && result.error) {
      setError("Google sign-in didn't complete. Please try again.");
      setBusy(null);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode !== "forgot" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setBusy("email");
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(
            signInError.message.toLowerCase().includes("invalid")
              ? "Email or password is incorrect."
              : signInError.message,
          );
        }
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() },
          },
        });
        if (signUpError) {
          setError(
            signUpError.message.toLowerCase().includes("already")
              ? "That email already has an account. Try signing in instead."
              : signUpError.message,
          );
        } else if (!data.session) {
          setNotice(`Confirm your email — we sent a verification link to ${email.trim()}.`);
        }
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) setError(resetError.message);
        else setNotice("Password reset link sent. Check your inbox.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.14_0.022_162)] text-[oklch(0.97_0.01_140)]">
      <AmbientVisual />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Visual / narrative side — desktop only */}
        <section className="hidden flex-col justify-between px-14 py-14 lg:flex">
          <div className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <Wordmark className="text-lg" />
          </div>

          <div className="max-w-lg">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[oklch(0.78_0.06_150)]">
              Agricultural intelligence · India
            </p>
            <h1 className="mt-5 font-display text-[2.75rem] font-extrabold leading-[1.06] tracking-tight">
              Intelligence for every decision from farm to market.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[oklch(0.82_0.02_148)]">
              Official APMC mandi rates, transport-adjusted net profit, GPS farm weather, AI crop
              diagnosis and verified scheme guidance — in one calm workspace.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[oklch(1_0_0/0.1)] pt-7">
              {[
                ["Agmarknet", "APMC price reporting"],
                ["Open-Meteo", "Farm weather models"],
                ["3 languages", "English · मराठी · हिंदी"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-sm font-bold text-[oklch(0.95_0.01_140)]">{term}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-[oklch(0.74_0.02_148)]">
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-xs text-[oklch(0.68_0.02_148)]">
            © 2026 Market Mitra · Developed by Om Labhade
          </p>
        </section>

        {/* Authentication panel */}
        <section className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[26rem]">
            <div className="flex flex-col items-center gap-3 lg:hidden">
              <span className="grid size-16 place-items-center rounded-[1.4rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.14)] backdrop-blur-xl">
                <LogoMark className="size-9" />
              </span>
              <Wordmark className="text-xl" />
              <p className="text-center text-[13px] leading-relaxed text-[oklch(0.8_0.02_148)]">
                Intelligence for every decision from farm to market.
              </p>
            </div>

            <div className="mt-7 rounded-[1.75rem] border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.055)] p-6 shadow-[0_30px_70px_-40px_oklch(0_0_0/0.9)] backdrop-blur-2xl sm:p-7 lg:mt-0">
              <h2 className="font-display text-xl font-bold tracking-tight">
                {mode === "signin"
                  ? "Welcome to Market Mitra"
                  : mode === "signup"
                    ? "Create your account"
                    : "Reset your password"}
              </h2>
              <p className="mt-1.5 text-[13px] text-[oklch(0.78_0.02_148)]">
                {mode === "signin"
                  ? "Sign in to continue to your dashboard."
                  : mode === "signup"
                    ? "A few details and your workspace is ready."
                    : "We'll email you a secure reset link."}
              </p>

              {mode !== "forgot" && (
                <>
                  <button
                    type="button"
                    onClick={() => void google()}
                    disabled={busy !== null}
                    className="press mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[oklch(1_0_0/0.96)] text-sm font-bold text-[oklch(0.2_0.02_160)] transition-colors hover:bg-white disabled:opacity-60"
                  >
                    {busy === "google" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <GoogleGlyph />
                    )}
                    Continue with Google
                  </button>

                  <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[oklch(0.66_0.02_148)]">
                    <span className="h-px flex-1 bg-[oklch(1_0_0/0.12)]" />
                    or use email
                    <span className="h-px flex-1 bg-[oklch(1_0_0/0.12)]" />
                  </div>
                </>
              )}

              <form onSubmit={submit} className={mode === "forgot" ? "mt-6 space-y-3" : "space-y-3"}>
                {mode === "signup" && (
                  <Field
                    icon={<User className="size-4" />}
                    label="Full name"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                )}
                <Field
                  icon={<Mail className="size-4" />}
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {mode !== "forgot" && (
                  <Field
                    icon={<Lock className="size-4" />}
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder="••••••••"
                  />
                )}

                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl bg-[oklch(0.55_0.19_25/0.16)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.9_0.08_30)]"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="flex items-start gap-2 rounded-xl bg-[oklch(0.72_0.17_148/0.14)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.9_0.1_150)]">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                    {notice}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy !== null}
                  className="press grad-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60"
                >
                  {busy === "email" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin"
                        ? "Sign in"
                        : mode === "signup"
                          ? "Create account"
                          : "Send reset link"}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                {mode === "signin" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setNotice(null);
                      }}
                      className="text-[oklch(0.78_0.02_148)] underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setError(null);
                        setNotice(null);
                      }}
                      className="text-primary-glow underline-offset-4 hover:underline"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                      setNotice(null);
                    }}
                    className="text-primary-glow underline-offset-4 hover:underline"
                  >
                    ← Back to sign in
                  </button>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-[oklch(0.66_0.02_148)]">
              Market Mitra uses official government mandi data and public weather models. Your farm
              details stay private to your account.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[oklch(0.7_0.02_148)]">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-2xl border border-[oklch(1_0_0/0.12)] bg-[oklch(0_0_0/0.18)] px-3.5 transition-colors focus-within:border-primary-glow/70">
        <span className="text-[oklch(0.7_0.02_148)]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent text-sm font-semibold text-[oklch(0.97_0.01_140)] outline-none placeholder:text-[oklch(0.55_0.02_148)]"
        />
      </div>
    </label>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.3 3.8l3.5 2.7c2.1-1.9 3.8-4.8 3.8-8.4z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.7-2.9l-3.5-2.7c-1 .7-2.3 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5l-3.7 2.8C3.4 21.3 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.6c-.3-.7-.4-1.5-.4-2.6s.2-1.9.4-2.6L1.5 6.6C.6 8.2 0 10 0 12s.6 3.8 1.5 5.4l3.7-2.8z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.8.9 4.7 1.8l3.2-3.1C17.9 1.5 15.2 0 12 0 7.4 0 3.4 2.7 1.5 6.6l3.7 2.8C6.1 6.8 8.8 4.7 12 4.7z"
      />
    </svg>
  );
}

/** Slow ambient topographic + mandi-network field. Purely decorative. */
function AmbientVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-32 top-[-10%] size-[46rem] rounded-full bg-[radial-gradient(circle,oklch(0.5_0.15_152/0.5),transparent_65%)] blur-3xl" />
      <div className="absolute -right-24 bottom-[-20%] size-[38rem] rounded-full bg-[radial-gradient(circle,oklch(0.45_0.09_205/0.4),transparent_65%)] blur-3xl" />
      <svg className="absolute inset-0 size-full opacity-[0.5]" preserveAspectRatio="none">
        <defs>
          <pattern id="mm-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path
              d="M56 0H0V56"
              fill="none"
              stroke="oklch(1 0 0 / 0.045)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mm-grid)" />
      </svg>
      <svg
        viewBox="0 0 800 600"
        className="absolute inset-0 size-full opacity-40 motion-safe:animate-[mm-drift_28s_ease-in-out_infinite_alternate]"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M-40 ${120 + i * 48} C 160 ${60 + i * 46}, 320 ${210 + i * 40}, 520 ${140 + i * 44} S 760 ${
              90 + i * 48
            }, 860 ${170 + i * 42}`}
            fill="none"
            stroke="oklch(0.72 0.17 148 / 0.22)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.022_162/0.35)_0%,oklch(0.13_0.02_162/0.8)_100%)]" />
    </div>
  );
}
