import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ApplicationErrorInput = {
  service: "mitra_ai" | "diagnosis" | "weather" | "authentication" | "database";
  severity?: "warning" | "error" | "critical";
  userId?: string | null;
  requestId?: string | null;
  provider?: string | null;
  errorType: string;
  message: string;
};

function safeText(value: string, maxLength: number): string {
  return value
    .replace(/Bearer\s+[^\s,;]+/gi, "Bearer [REDACTED]")
    .replace(
      /\b(api[-_ ]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]",
    )
    .replace(/https?:\/\/[^\s]+/gi, "[URL]")
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[PHONE]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, maxLength);
}

/** Best-effort server-only error recording; log messages are scrubbed before storage. */
export async function logApplicationError(input: ApplicationErrorInput) {
  try {
    const { error } = await supabaseAdmin.from("application_error_logs").insert({
      service: input.service,
      severity: input.severity ?? "error",
      user_id: input.userId ?? null,
      request_id: input.requestId ? safeText(input.requestId, 128) : null,
      provider: input.provider ? safeText(input.provider, 100) : null,
      error_type: safeText(input.errorType, 120),
      message: safeText(input.message, 500),
    });
    if (error) {
      console.error("[admin:error-log] Could not persist application error.");
    }
  } catch {
    console.error("[admin:error-log] Could not persist application error.");
  }
}
