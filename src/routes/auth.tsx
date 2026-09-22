import { useState } from "react";
import {
  Link,
  useNavigate,
  createFileRoute,
} from "@tanstack/react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import marketMitraLogo from "@/assets/marketmitra-logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const google = () => {
    setError(null);
    setNotice(null);
    setBusy("google");

    const redirectTo = `${window.location.origin}/auth`;

    const url = new URL(
      "https://bulpboucdnkvepxabyuy.supabase.co/auth/v1/authorize",
    );

    url.searchParams.set("provider", "google");
    url.searchParams.set("redirect_to", redirectTo);

    window.location.assign(url.toString());
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setNotice(null);
    setBusy("email");

    try {
      if (!email.trim() || !password) {
        throw new Error("Please enter your email and password.");
      }

      if (mode === "signup") {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setNotice(
          "Account created. Please check your email if confirmation is required.",
        );
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) {
          throw signInError;
        }

        navigate({ to: "/home" });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  const isSignin = mode === "signin";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020b07] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-600/15 blur-[120px]" />
        <div className="absolute -bottom-48 -right-32 h-[550px] w-[550px] rounded-full bg-green-500/10 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-emerald-400/[0.06] blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/[0.10] bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">

          {/* LEFT PANEL */}
          <div className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-[#071710] to-[#020b07]" />

            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-emerald-400/10 bg-emerald-500/[0.06] blur-sm" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full border border-green-400/10 bg-green-400/[0.04]" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12">

              {/* BRAND */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-white/5 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
                    <img
                      src={marketMitraLogo}
                      alt="Market Mitra"
                      className="h-10 w-10 object-contain"
                    />
                  </div>

                  <div>
                    <div className="text-xl font-bold tracking-tight">
                      Market Mitra
                    </div>

                    <div className="mt-0.5 text-xs font-medium tracking-[0.18em] text-emerald-400/80">
                      SELL SMARTER. EARN BETTER.
                    </div>
                  </div>
                </div>

                {/* HERO */}
                <div className="mt-20 max-w-xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/[0.08] px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Agriculture Intelligence
                  </div>

                  <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">
                    Smarter farming.
                    <br />

                    <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
                      Better decisions.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                    One powerful platform for market prices, crop diagnosis,
                    weather, government schemes and farmer-to-farmer resource
                    connections.
                  </p>
                </div>

                {/* FEATURE CARDS */}
                <div className="mt-12 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                    </div>

                    <div className="text-sm font-semibold text-white">
                      Real Market Data
                    </div>

                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      Make decisions with current mandi information.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10">
                      <Sparkles className="h-4.5 w-4.5 text-green-400" />
                    </div>

                    <div className="text-sm font-semibold text-white">
                      Mitra Intelligence
                    </div>

                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      Agriculture intelligence built around farmers.
                    </div>
                  </div>
                </div>
              </div>

              {/* FOUNDER / ABOUT */}
              <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-emerald-500/10">
                      <img
                        src={marketMitraLogo}
                        alt="Market Mitra"
                        className="h-8 w-8 object-contain"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                        Created by
                      </div>

                      <div className="mt-0.5 text-sm font-semibold text-white">
                        Om Labhade
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/about"
                    className="group flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    About Market Mitra
                    <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* BOTTOM */}
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-5">
                <div className="text-xs text-slate-600">
                  Built for modern Indian agriculture
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  Secure access
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AUTH PANEL */}
          <div className="relative flex items-center justify-center border-white/[0.07] bg-[#030c08]/80 px-5 py-8 sm:px-10 lg:border-l lg:px-14">
            <div className="w-full max-w-md">

              {/* MOBILE BRAND */}
              <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-white/5">
                  <img
                    src={marketMitraLogo}
                    alt="Market Mitra"
                    className="h-9 w-9 object-contain"
                  />
                </div>

                <div>
                  <div className="text-lg font-bold">Market Mitra</div>

                  <div className="text-[10px] tracking-[0.16em] text-emerald-400/80">
                    SELL SMARTER. EARN BETTER.
                  </div>
                </div>
              </div>

              {/* HEADING */}
              <div className="mb-8">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  {isSignin ? "Welcome back" : "Get started"}
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {isSignin ? "Welcome back." : "Create your account."}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {isSignin
                    ? "Sign in to continue to your Market Mitra dashboard."
                    : "Create your Market Mitra account and start making smarter decisions."}
                </p>
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={google}
                disabled={busy !== null}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.06] px-4 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="relative"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.5A9.75 9.75 0 0 0 12 21.5Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.53 13.62A5.86 5.86 0 0 1 6.22 12c0-.56.1-1.11.31-1.62v-2.5H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.12l3.25-2.5Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.35c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.45 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.72 5.38l3.25 2.5 3.25 2.5C7.3 8.07 9.46 6.35 12 6.35Z"
                  />
                </svg>

                <span className="relative">
                  {busy === "google"
                    ? "Connecting..."
                    : "Continue with Google"}
                </span>
              </button>

              {/* DIVIDER */}
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/[0.08]" />

                <span className="text-[10px] font-medium tracking-[0.18em] text-slate-600">
                  OR CONTINUE WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              {/* FORM */}
              <form onSubmit={submit} className="space-y-4">
                {!isSignin && (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Full name
                    </label>

                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-emerald-500/60 focus:bg-emerald-500/[0.04] focus:ring-4 focus:ring-emerald-500/[0.06]"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-600" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-emerald-500/60 focus:bg-emerald-500/[0.04] focus:ring-4 focus:ring-emerald-500/[0.06]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-600" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-emerald-500/60 focus:bg-emerald-500/[0.04] focus:ring-4 focus:ring-emerald-500/[0.06]"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-300"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300">
                    {error}
                  </div>
                )}

                {/* NOTICE */}
                {notice && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm leading-5 text-emerald-300">
                    {notice}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.20)] transition-all duration-300 hover:from-emerald-500 hover:to-green-400 hover:shadow-[0_12px_35px_rgba(16,185,129,0.30)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <span className="relative">
                    {busy === "email"
                      ? isSignin
                        ? "Signing in..."
                        : "Creating account..."
                      : isSignin
                        ? "Sign in"
                        : "Create account"}
                  </span>

                  <ArrowRight className="relative h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>

              {/* SWITCH */}
              <div className="mt-7 text-center text-sm text-slate-500">
                {isSignin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(isSignin ? "signup" : "signin");
                    setError(null);
                    setNotice(null);
                  }}
                  className="font-semibold text-emerald-400 transition-colors hover:text-green-300"
                >
                  {isSignin ? "Create one" : "Sign in"}
                </button>
              </div>

              {/* MOBILE ABOUT */}
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                      Market Mitra
                    </div>

                    <div className="mt-1 text-sm font-semibold text-white">
                      Created by Om Labhade
                    </div>
                  </div>

                  <Link
                    to="/about"
                    className="text-xs font-medium text-emerald-400"
                  >
                    About
                  </Link>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-7 flex items-center justify-center gap-4">
                <Link
                  to="/"
                  className="text-xs text-slate-600 transition-colors hover:text-slate-400"
                >
                  Back to Market Mitra
                </Link>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <span className="text-xs text-slate-700">
                  Secure authentication
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}