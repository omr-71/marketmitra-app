import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { langNames, useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/crops";
import { supabase } from "@/integrations/supabase/client";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/auth.functions";
import { useSession } from "@/lib/session";
import { ArrowLeft, Loader2, MapPin, Phone, ShieldCheck, User2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login with OTP — MarketMitra" },
      {
        name: "description",
        content:
          "Sign in to MarketMitra with your mobile number and a 6-digit one-time password. Available in English, Marathi and Hindi.",
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

function Auth() {
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const { refresh } = useSession();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
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

  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const canSend = phoneValid && (mode === "login" || name.trim().length > 1) && !busy;

  const sendCode = async () => {
    if (!canSend) return;
    setBusy(true);
    try {
      const res = await requestPhoneOtp({
        data: { phone, mode, ...(mode === "signup" ? { fullName: name.trim() } : {}) },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDevCode(res.code);
      setSecondsLeft(res.expiresInSeconds);
      setCode("");
      setStep("otp");
      toast.success(`Verification code generated for +91 ${phone}`);
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
      const res = await verifyPhoneOtp({
        data: {
          phone,
          code,
          language: lang,
          ...(mode === "signup"
            ? { fullName: name.trim(), ...(village.trim() ? { village: village.trim() } : {}) }
            : {}),
        },
      });
      if (!res.ok) {
        toast.error(res.error);
        setCode("");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: res.email,
        password: res.password,
      });
      if (error) {
        toast.error("Verified, but sign-in failed. Please try again.");
        return;
      }
      await refresh();
      toast.success(`Welcome, ${res.fullName}`);
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

        {step === "phone" ? (
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
                <span className="text-xs font-semibold text-muted-foreground">{t("phone")}</span>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-card px-4 focus-within:border-primary">
                  <Phone className="size-5 shrink-0 text-muted-foreground" />
                  <span className="text-base font-bold text-muted-foreground">+91</span>
                  <input
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold tracking-wide outline-none"
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
              onClick={() => setStep("phone")}
              className="press mt-9 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground"
            >
              <ArrowLeft className="size-4" /> {t("changeNumber")}
            </button>

            <h2 className="mt-5 text-2xl font-extrabold">{t("verifyNumber")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("otpSentTo")} <span className="font-bold text-foreground">+91 {phone}</span>
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

            {devCode && (
              <div className="mt-4 rounded-2xl border border-dashed border-primary/45 bg-primary/5 p-4">
                <p className="text-xs font-bold text-primary">{t("demoCode")}</p>
                <p className="mt-1 text-lg font-extrabold tracking-[0.35em]">{devCode}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{t("smsPending")}</p>
              </div>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
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
              disabled={busy || secondsLeft > 240}
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
