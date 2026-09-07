import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Loader2, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  confirmPhoneVerificationCode,
  sendPhoneVerificationCode,
} from "@/lib/phone-verify.functions";
import { useSession } from "@/lib/session";
import { useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/crops";

const copy = {
  title: { en: "Mobile number", mr: "मोबाइल नंबर", hi: "मोबाइल नंबर" },
  hint: {
    en: "Verify your number so other farmers can reach you on Mitra Link.",
    mr: "मित्र लिंकवर इतर शेतकरी संपर्क करू शकतील म्हणून नंबर पडताळा.",
    hi: "मित्र लिंक पर दूसरे किसान संपर्क कर सकें, इसलिए नंबर सत्यापित करें.",
  },
  verified: { en: "Verified", mr: "पडताळलेले", hi: "सत्यापित" },
  notVerified: { en: "Not verified yet", mr: "अजून पडताळलेले नाही", hi: "अभी सत्यापित नहीं" },
  send: { en: "Send code", mr: "कोड पाठवा", hi: "कोड भेजें" },
  resend: { en: "Send a new code", mr: "नवीन कोड पाठवा", hi: "नया कोड भेजें" },
  codeLabel: { en: "6-digit code", mr: "६ अंकी कोड", hi: "6 अंकों का कोड" },
  confirm: { en: "Confirm", mr: "निश्चित करा", hi: "पुष्टि करें" },
  invalid: {
    en: "Enter a valid 10-digit mobile number.",
    mr: "वैध १० अंकी मोबाइल नंबर टाका.",
    hi: "मान्य 10 अंकों का मोबाइल नंबर डालें.",
  },
  sentTo: {
    en: "We sent a code to",
    mr: "आम्ही कोड पाठवला आहे",
    hi: "हमने कोड भेजा है",
  },
  done: { en: "Mobile number verified", mr: "मोबाइल नंबर पडताळला", hi: "मोबाइल नंबर सत्यापित" },
  wait: { en: "Wait", mr: "थांबा", hi: "रुकें" },
  seconds: { en: "s", mr: "से", hi: "से" },
} satisfies Record<string, Record<Lang, string>>;

export function PhoneVerifyCard() {
  const { lang } = useLang();
  const { profile, refresh } = useSession();
  const send = useServerFn(sendPhoneVerificationCode);
  const confirm = useServerFn(confirmPhoneVerificationCode);

  const savedDigits = (profile.phone ?? "").replace(/\D/g, "").slice(-10);
  const [phone, setPhone] = useState(savedDigits);
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"idle" | "code">("idle");
  const [maskedEmail, setMasked] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhone((current) => (current ? current : savedDigits));
  }, [savedDigits]);

  useEffect(() => {
    if (cooldown <= 0) return;
    timer.current = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [cooldown]);

  // Changing the number invalidates any verified state the farmer had.
  const numberChanged = savedDigits !== "" && phone !== savedDigits;
  const verified = profile.phone_verified && !numberChanged;

  const requestCode = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(copy.invalid[lang]);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await send({ data: { phone } });
      setMasked(result.maskedEmail);
      setStage("code");
      setCode("");
      setCooldown(45);
      await refresh();
      toast.success(`${copy.sentTo[lang]} ${result.maskedEmail}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the code just now.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError(copy.codeLabel[lang]);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await confirm({ data: { code } });
      await refresh();
      setStage("idle");
      setCode("");
      toast.success(copy.done[lang]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That code could not be checked.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-surface hover-lift space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.title[lang]}
        </p>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            <BadgeCheck className="size-3" /> {copy.verified[lang]}
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {copy.notVerified[lang]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3">
        <Phone className="size-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-muted-foreground">+91</span>
        <input
          value={phone}
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel-national"
          aria-label={copy.title[lang]}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
            setStage("idle");
            setError(null);
          }}
          className="h-12 w-full bg-transparent text-sm font-semibold outline-none"
        />
      </div>

      <p className="text-[11px] text-muted-foreground">{copy.hint[lang]}</p>

      {stage === "code" && (
        <div className="space-y-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
          <p className="text-[11px] font-semibold text-muted-foreground">
            {copy.sentTo[lang]} {maskedEmail}
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-label={copy.codeLabel[lang]}
              placeholder="------"
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 w-32 rounded-2xl border border-border bg-card text-center text-base font-bold tracking-[0.35em] outline-none"
            />
            <button
              onClick={() => void submitCode()}
              disabled={busy || code.length !== 6}
              className="press grad-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {copy.confirm[lang]}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-destructive">{error}</p>}

      <button
        onClick={() => void requestCode()}
        disabled={busy || cooldown > 0 || (verified && stage === "idle" && !numberChanged)}
        className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-bold disabled:opacity-60"
      >
        {busy && stage === "idle" ? <Loader2 className="size-4 animate-spin" /> : null}
        {cooldown > 0
          ? `${copy.wait[lang]} ${cooldown}${copy.seconds[lang]}`
          : stage === "code"
            ? copy.resend[lang]
            : copy.send[lang]}
      </button>
    </div>
  );
}
