import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { langNames, useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/crops";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { ArrowLeft, Loader2, Mail, MapPin, ShieldCheck, User2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login with OTP — MarketMitra" },
      {
        name: "description",
        content:
          "Sign in to MarketMitra with your email address and a 6-digit one-time password. Available in English, Marathi and Hindi.",
      },
      { property: "og:title", content: "Login with OTP — MarketMitra" },
      {
        property: "og:description",
        content: "Secure OTP login for farmers, with English, Marathi and Hindi support.",
      },
    ],
  }),
  component: Auth,
});

const CODE_TTL_SECONDS = 3600;

function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("expired")) return "That code has expired. Please request a new one.";
  if (m.includes("invalid") || m.includes("token")) return "Incorrect code. Please check and try again.";
  if (m.includes("rate") || m.includes("limit") || m.includes("too many"))
    return "Too many requests. Please wait a minute and try again.";
  if (m.includes("signups not allowed") || m.includes("not found"))
    return "No account found for this email. Please sign up first.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Network problem. Check your connection and try again.";
  return message;
}

function Auth() {
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const { refresh } = useSession();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const canSend =
    emailValid && (mode === "login" || name.trim().length > 1) && !busy;

  const sendCode = async () => {
    if (!canSend) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: mode === "signup",
          ...(mode === "signup"
            ? { data: { full_name: name.trim(), village: village.trim() || null } }
            : {}),
        },
      });
      if (error) {
        toast.error(friendlyError(error.message));
        return;
      }
      setSecondsLeft(CODE_TTL_SECONDS);
      setCode("");
      setStep("otp");
      toast.success(`Code sent to ${email.trim().toLowerCase()}`);
    } catch {
      toast.error("Could not send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: "email",
      });
      if (error || !data.user) {
        toast.error(friendlyError(error?.message ?? "Verification failed."));
        setCode("");
        return;
      }

      const userId = data.user.id;
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", userId)
        .maybeSingle();

      let fullName = existing?.full_name ?? name.trim();

      if (!existing) {
        const meta = data.user.user_metadata as Record<string, unknown>;
        fullName = name.trim() || String(meta["full_name"] ?? "").trim();
        if (!fullName) {
          toast.error("Please sign up first so we can save your details.");
          return;
        }
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          full_name: fullName,
          village: village.trim() || (meta["village"] as string | null) || null,
          language: lang,
        });
        if (insertError) {
          toast.error("Signed in, but saving your profile failed. Please try again.");
          return;
        }
      } else {
        await supabase.from("profiles").update({ language: lang }).eq("id", userId);
      }

      await refresh();
      toast.success(`Welcome, ${fullName}`);
      void navigate({ to: "/home" });
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] px-6 pb-12 pt-14">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
            <img src={logo} alt="MarketMitra logo" width={816} height={816} className="size-8" loading="lazy" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold">MarketMitra</h1>
            <p className="truncate text-xs text-muted-foreground">{t("tagline")}</p>
          </div>
        </div>

        {step === "details" ? (
          <>
            <div className="mt-9 flex rounded-2xl bg-muted p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`press flex-1 rounded-xl py-2.5 text-sm font-bold ${
                    mode === m ? "bg-card text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground"
                  }`}
                >
                  {t(m === "login" ? "login" : "signup")}
                </button>
              ))}
            </div>

            <div className="mt-7 space-y-4">
              {mode === "signup" && (
                <>
                  <label className="block animate-rise">
                    <span className="text-xs font-semibold text-muted-foreground">{t("fullName")}</span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-card px-4 focus-within:border-primary">
                      <User2 className="size-5 shrink-0 text-muted-foreground" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 80))}
                        maxLength={80}
                        autoComplete="name"
                        className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
                      />
                    </div>
                  </label>
                  <label className="block animate-rise">
                    <span className="text-xs font-semibold text-muted-foreground">{t("village")}</span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-card px-4 focus-within:border-primary">
                      <MapPin className="size-5 shrink-0 text-muted-foreground" />
                      <input
                        value={village}
                        onChange={(e) => setVillage(e.target.value.slice(0, 80))}
                        maxLength={80}
                        className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
                      />
                    </div>
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">{t("email")}</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-card px-4 focus-within:border-primary">
                  <Mail className="size-5 shrink-0 text-muted-foreground" />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, 120))}
                    className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
                  />
                </div>
                <span className="mt-2 block text-xs text-muted-foreground">{t("otpHint")}</span>
              </label>

              <div>
                <span className="text-xs font-semibold text-muted-foreground">{t("language")}</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(langNames) as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`press rounded-2xl border py-3.5 text-sm font-bold ${
                        lang === l
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {langNames[l]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              disabled={!canSend}
              onClick={sendCode}
              className="press grad-primary mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)] disabled:opacity-40 disabled:shadow-none"
            >
              {busy && <Loader2 className="size-5 animate-spin" />}
              {t("sendOtp")}
            </button>
          </>
        ) : (
          <div className="animate-rise">
            <button
              onClick={() => setStep("details")}
              className="press mt-9 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground"
            >
              <ArrowLeft className="size-4" /> {t("changeNumber")}
            </button>

            <h2 className="mt-5 text-2xl font-extrabold">{t("verifyNumber")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("otpSentTo")}{" "}
              <span className="font-bold text-foreground">{email.trim().toLowerCase()}</span>
            </p>

            <input
              ref={otpRef}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") void verify();
              }}
              aria-label={t("enterOtp")}
              className="mt-7 h-16 w-full rounded-2xl border border-input bg-card text-center text-2xl font-extrabold tracking-[0.6em] outline-none focus:border-primary"
            />

            <p className="mt-4 text-xs text-muted-foreground">{t("checkInbox")}</p>

            <p className="mt-2 text-xs text-muted-foreground">
              {secondsLeft > 0
                ? `${t("codeExpires")} ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
                : t("codeExpired")}
            </p>

            <button
              disabled={code.length !== 6 || busy}
              onClick={verify}
              className="press grad-primary mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)] disabled:opacity-40 disabled:shadow-none"
            >
              {busy && <Loader2 className="size-5 animate-spin" />}
              {t("verifyOtp")}
            </button>

            <button
              disabled={busy || secondsLeft > CODE_TTL_SECONDS - 60}
              onClick={sendCode}
              className="press mt-3 h-12 w-full rounded-2xl border border-border text-sm font-bold text-muted-foreground disabled:opacity-40"
            >
              {t("resendOtp")}
            </button>
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          {t("privacyNote")}
        </p>
      </div>
    </div>
  );
}
