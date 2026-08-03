import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { langNames, useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/data";
import { Phone, ShieldCheck, User2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login — MarketMitra" },
      {
        name: "description",
        content: "Sign in to MarketMitra with your phone number and pick your preferred language.",
      },
      { property: "og:title", content: "Login — MarketMitra" },
      { property: "og:description", content: "Phone login with English, Marathi and Hindi support." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const valid = phone.replace(/\D/g, "").length === 10 && (mode === "login" || name.trim().length > 1);

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
            <label className="block animate-rise">
              <span className="text-xs font-semibold text-muted-foreground">{t("fullName")}</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-card px-4">
                <User2 className="size-5 shrink-0 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Patil"
                  className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">{t("phone")}</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-input bg-card px-4 focus-within:border-primary">
              <Phone className="size-5 shrink-0 text-muted-foreground" />
              <span className="text-base font-bold text-muted-foreground">+91</span>
              <input
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold tracking-wide outline-none placeholder:font-normal placeholder:text-muted-foreground"
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
          disabled={!valid}
          onClick={() => navigate({ to: "/home" })}
          className="press grad-primary mt-8 h-14 w-full rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)] disabled:opacity-40 disabled:shadow-none"
        >
          {t("sendOtp")}
        </button>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          Your data stays private and encrypted
        </p>
      </div>
    </div>
  );
}
