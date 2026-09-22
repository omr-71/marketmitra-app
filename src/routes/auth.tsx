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
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl lg:grid-cols-2">
          <div className="hidden min-h-[650px] flex-col justify-between bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 p-10 lg:flex">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20">
                  <ShieldCheck className="h-6 w-6 text-blue-400" />
                </div>

                <div>
                  <div className="text-xl font-bold">Market Mitra</div>
                  <div className="text-sm text-slate-400">
                    Sell Smarter. Earn Better.
                  </div>
                </div>
              </div>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Everything a farmer needs, in one place.
              </h1>

              <p className="mt-5 max-w-md text-slate-400">
                Market prices, crop diagnosis, weather, schemes and Mitra Link
                — built to make everyday farming decisions easier.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm font-semibold text-white">Mitra AI</div>

              <div className="mt-1 text-sm text-slate-400">
                Agriculture Intelligence for smarter decisions.
              </div>
            </div>
          </div>

          <div className="flex min-h-[650px] items-center justify-center bg-slate-950 p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold">
                  {isSignin ? "Welcome back" : "Create your account"}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {isSignin
                    ? "Sign in to continue to Market Mitra."
                    : "Create your Market Mitra account in seconds."}
                </p>
              </div>

              <button
                type="button"
                onClick={google}
                disabled={busy !== null}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white py-3.5 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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

                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-500">OR</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={submit} className="space-y-4">
                {!isSignin && (
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Full name
                    </label>

                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3.5 pl-12 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3.5 pl-12 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {notice && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {notice}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSignin ? "Sign in" : "Create account"}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
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
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  {isSignin ? "Create one" : "Sign in"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Back to Market Mitra
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}