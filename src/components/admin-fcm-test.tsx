import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BellRing, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

import { sendAdminFcmTest } from "@/lib/notification.functions";

type TestResult = {
  status?: string;
  accepted?: number;
  errorCode?: string;
  diagnosticCode?: string;
  environmentProjectId?: string;
  serviceAccountProjectId?: string;
  stage?: string;
  safeMessage?: string;
};

export function AdminFcmTest() {
  const sendTest = useServerFn(sendAdminFcmTest);
  const [result, setResult] = useState<TestResult | null>(null);
  const mutation = useMutation({
    mutationFn: () => sendTest({ data: {} }),
    onSuccess: (value) => setResult(value as TestResult),
    onError: (error) => setResult({
      status: error instanceof Error && /authorized|forbidden/i.test(error.message)
        ? "authorization_error"
        : "delivery_error",
    }),
  });

  let message: string | null = null;
  if (result?.status === "accepted" && result.accepted === 1) {
    message = "FCM accepted the test notification. Confirm receipt on the Android device.";
  } else if (result?.status === "no_device") {
    message = "No registered Android device is associated with this administrator.";
  } else if (result?.status === "preferences_blocked") {
    message = "The test was blocked by your notification preferences.";
  } else if (result?.status === "delivery_error") {
    message = `FCM delivery failed${result.errorCode ? `: ${result.errorCode}` : "."}`;
  } else if (result?.status === "authorization_error") {
    message = "Authentication or administrator authorization failed.";
  } else if (result?.status === "diagnostic_error") {
    const diagnosticMessages: Record<string, string> = {
      FIREBASE_CONFIG_MISSING: "Firebase server configuration is missing.",
      FIREBASE_JSON_INVALID: "Firebase service account configuration is invalid.",
      FIREBASE_PROJECT_MISMATCH: "Firebase sender project does not match its credentials.",
      FIREBASE_CREDENTIALS_INVALID: "Firebase credentials are incomplete or invalid.",
      FIREBASE_ADMIN_INIT_FAILED: "Firebase Admin initialization failed.",
      DATABASE_ERROR: "Database access failed during the notification test.",
      AUTHORIZATION_ERROR: "Administrator authorization failed.",
      FCM_SEND_FAILED: "Firebase rejected the notification send request.",
    };
    message = diagnosticMessages[result.diagnosticCode ?? ""]
      ?? "The notification test could not be completed.";
    if (result.diagnosticCode === "FIREBASE_PROJECT_MISMATCH") {
      message = "Firebase project mismatch.";
    }
    if (result.stage && result.errorCode) {
      message += ` Stage: ${result.stage}. Error: ${result.errorCode}${result.safeMessage ? ` — ${result.safeMessage}` : ""}`;
    }
  } else if (result) {
    message = "The notification was not sent.";
  }

  return (
    <section id="admin-fcm-test" className="scroll-mt-24 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-blue-400/25 before:to-transparent">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[oklch(0.84_0.02_150)]">
          Test push notification
        </h2>
        <p className="mt-1 text-xs text-[oklch(0.72_0.02_150)]">
          Sends to the Android device registered to the authenticated administrator.
        </p>
      </div>
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => {
          setResult(null);
          mutation.mutate();
        }}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[oklch(0.7_0.16_150)] px-4 text-xs font-bold text-[oklch(0.14_0.02_160)] disabled:opacity-50"
      >
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}
        {mutation.isPending ? "Sending…" : "Send test push"}
      </button>
      {message && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-[oklch(1_0_0/0.09)] bg-black/10 p-4 text-xs leading-relaxed">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-[oklch(0.8_0.16_150)]" />
          <p>{message}</p>
        </div>
      )}
    </section>
  );
}
