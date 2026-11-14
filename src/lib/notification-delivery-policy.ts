import { z } from "zod";

export const deliverySchema = z.object({
  category: z.enum(["market", "weather", "scheme", "updates", "general"]),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  url: z.string().startsWith("/").max(500).default("/notifications"),
  userId: z.string().uuid().optional(),
  state: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  dedupeKey: z.string().min(1).max(160).optional(),
});

export type DispatchData = z.infer<typeof deliverySchema>;

export type DeliveryAttemptState = {
  id?: string;
  device_id: string | null;
  status: string;
  error_code: string | null;
  created_at: string;
};

export type DeliveryRetryDecision =
  | "send"
  | "already_sent"
  | "in_progress"
  | "unknown_outcome"
  | "permanent_failure"
  | "retry_limit"
  | "backoff";

export const MAX_DELIVERY_ATTEMPTS = 3;
export const PENDING_DELIVERY_LEASE_MS = 15 * 60 * 1000;

const RETRY_DELAYS_MS = [5 * 60 * 1000, 60 * 60 * 1000];

const PERMANENT_FCM_CODES = new Set([
  "messaging/invalid-argument",
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
  "messaging/mismatched-credential",
  "messaging/sender-id-mismatch",
  "messaging/third-party-auth-error",
]);

export function isPermanentFcmFailure(errorCode: string | null | undefined) {
  return Boolean(errorCode && PERMANENT_FCM_CODES.has(errorCode.toLowerCase()));
}

export function deliveryRetryDecision(
  attempts: DeliveryAttemptState[],
  deviceId: string,
  now = Date.now(),
): DeliveryRetryDecision {
  const deviceAttempts = attempts.filter((attempt) => attempt.device_id === deviceId);
  if (deviceAttempts.some((attempt) => attempt.status === "sent")) return "already_sent";
  if (deviceAttempts.some((attempt) => attempt.status === "unknown")) return "unknown_outcome";

  const pending = deviceAttempts.find((attempt) => attempt.status === "pending");
  if (pending) {
    const age = now - Date.parse(pending.created_at);
    return age > PENDING_DELIVERY_LEASE_MS ? "unknown_outcome" : "in_progress";
  }

  if (deviceAttempts.some((attempt) =>
    attempt.status === "failed_permanent" || isPermanentFcmFailure(attempt.error_code),
  )) {
    return "permanent_failure";
  }
  if (deviceAttempts.length >= MAX_DELIVERY_ATTEMPTS) return "retry_limit";

  const latest = [...deviceAttempts].sort((a, b) =>
    Date.parse(b.created_at) - Date.parse(a.created_at),
  )[0];
  if (latest && (latest.status === "failed" || latest.status === "failed_transient")) {
    const delay = RETRY_DELAYS_MS[Math.min(deviceAttempts.length - 1, RETRY_DELAYS_MS.length - 1)]!;
    if (now - Date.parse(latest.created_at) < delay) return "backoff";
  }
  return "send";
}
