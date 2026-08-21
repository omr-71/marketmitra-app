import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoMark, Wordmark } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — MarketMitra" },
      {
        name: "description",
        content: "Choose a new password for your MarketMitra account and get back to your mandi intelligence dashboard.",
      },
      { property: "og:title", content: "Set a new password — MarketMitra" },
      {
        property: "og:description",
        content: "Choose a new password for your MarketMitra account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = window.location.hash ?? "";
    const isRecovery = hash.includes("type=recovery");

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session || isRecovery) setReady(true);
      else setError("This reset link is invalid or has expired. Request a new one from the sign-in page.");
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => void navigate({ to: "/home", replace: true }), 1200);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[oklch(0.14_0.022_162)] px-5 py-12 text-[oklch(0.97_0.01_140)]">
      <div className="pointer-events-none absolute -left-32 top-[-10%] size-[40rem] rounded-full bg-[radial-gradient(circle,oklch(0.5_0.15_152/0.45),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-[-20%] size-[32rem] rounded-full bg-[radial-gradient(circle,oklch(0.45_0.09_205/0.35),transparent_65%)] blur-3xl" />

      <div className="relative w-full max-w-[26rem]">
        <div className="flex flex-col items-center gap-3">
          <span className="grid size-16 place-items-center rounded-[1.4rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.14)] backdrop-blur-xl">
            <LogoMark className="size-9" />
          </span>
          <Wordmark className="text-xl" />
        </div>

        <div className="mt-7 rounded-[1.75rem] border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.055)] p-6 shadow-[0_30px_70px_-40px_oklch(0_0_0/0.9)] backdrop-blur-2xl sm:p-7">
          <h1 className="font-display text-xl font-bold tracking-tight">Set a new password</h1>
          <p className="mt-1.5 text-[13px] text-[oklch(0.78_0.02_148)]">
            Choose a strong password you haven't used before.
          </p>

          {done ? (
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-[oklch(0.72_0.17_148/0.14)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.9_0.1_150)]">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
              Password updated. Taking you to your dashboard…
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <Field label="New password" value={password} onChange={setPassword} />
              <Field label="Confirm password" value={confirm} onChange={setConfirm} />

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-[oklch(0.55_0.19_25/0.16)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.9_0.08_30)]"
                >
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !ready}
                className="press grad-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Update password
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => void navigate({ to: "/auth", search: { redirect: undefined } })}
            className="mt-5 text-xs font-semibold text-primary-glow underline-offset-4 hover:underline"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[oklch(0.7_0.02_148)]">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-2xl border border-[oklch(1_0_0/0.12)] bg-[oklch(0_0_0/0.18)] px-3.5 transition-colors focus-within:border-primary-glow/70">
        <span className="text-[oklch(0.7_0.02_148)]">
          <Lock className="size-4" />
        </span>
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
          className="h-12 w-full bg-transparent text-sm font-semibold text-[oklch(0.97_0.01_140)] outline-none placeholder:text-[oklch(0.55_0.02_148)]"
        />
      </div>
    </label>
  );
}
