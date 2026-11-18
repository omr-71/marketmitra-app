import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import {
  deliveryRetryDecision,
  isPermanentFcmFailure,
  PENDING_DELIVERY_LEASE_MS,
  type DeliveryAttemptState,
  deliverySchema,
  type DispatchData,
} from "@/lib/notification-delivery-policy";

export { deliverySchema };
export type { DispatchData };

export type NotificationDiagnosticCode =
  | "FIREBASE_CONFIG_MISSING"
  | "FIREBASE_JSON_INVALID"
  | "FIREBASE_PROJECT_MISMATCH"
  | "FIREBASE_CREDENTIALS_INVALID"
  | "FIREBASE_ADMIN_INIT_FAILED"
  | "DATABASE_ERROR"
  | "AUTHORIZATION_ERROR"
  | "FCM_SEND_FAILED";

export class NotificationDiagnosticError extends Error {
  constructor(
    public readonly code: NotificationDiagnosticCode,
    public readonly details?: {
      environmentProjectId?: string;
      serviceAccountProjectId?: string;
      stage?: string;
      errorCode?: string;
      safeMessage?: string;
    },
  ) {
    super(code);
    this.name = "NotificationDiagnosticError";
  }
}

export function getSafeExceptionDetails(error: unknown) {
  const errorObject =
    typeof error === "object" && error !== null
      ? (error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown })
      : undefined;
  const errorCode =
    errorObject?.code !== undefined
      ? String(errorObject.code).slice(0, 120)
      : error instanceof Error
        ? error.name.slice(0, 120)
        : "unknown";
  const rawMessage =
    typeof errorObject?.message === "string"
      ? errorObject.message
      : error instanceof Error
        ? error.message
        : String(error ?? "unknown");
  const safeDetail = typeof errorObject?.details === "string" ? errorObject.details : undefined;
  const safeHint = typeof errorObject?.hint === "string" ? errorObject.hint : undefined;
  const safeMessage =
    rawMessage
      .replace(/-----BEGIN[^]*?PRIVATE KEY-----[^]*?-----END[^]*?PRIVATE KEY-----/gi, "[REDACTED_PRIVATE_KEY]")
      .replace(/[^\s<>]*@[^\s<>]*/g, "[REDACTED_EMAIL]")
      .replace(/(token|secret|credential|private[_-]?key)\s*[:=]\s*\S+/gi, "$1=[REDACTED]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) || "Unknown initialization error";
  const safeSupplement = safeDetail ?? safeHint;
  return {
    errorCode,
    safeMessage:
      safeSupplement && !safeMessage.toLowerCase().includes(safeSupplement.toLowerCase().slice(0, 40))
        ? `${safeMessage} ${safeSupplement}`.slice(0, 160)
        : safeMessage,
  };
}

function databaseDiagnostic(error: unknown, stage: string): NotificationDiagnosticError {
  return new NotificationDiagnosticError("DATABASE_ERROR", {
    stage,
    ...getSafeExceptionDetails(error),
  });
}

function configureFirebaseAdmin() {
  if (getApps().length) return;

  const projectId = process.env["FIREBASE_PROJECT_ID"]?.trim();
  const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  console.error(
    `[FCM stage=environment] projectId=${Boolean(projectId)} serviceAccountJson=${Boolean(serviceAccountJson)}`,
  );
  if (!projectId) {
    throw new NotificationDiagnosticError("FIREBASE_CONFIG_MISSING");
  }
  if (!serviceAccountJson) {
    throw new NotificationDiagnosticError("FIREBASE_CONFIG_MISSING");
  }

  let parsedServiceAccount: {
    project_id?: unknown;
    client_email?: unknown;
    private_key?: unknown;
    private_key_id?: unknown;
  };
  try {
    parsedServiceAccount = JSON.parse(serviceAccountJson) as typeof parsedServiceAccount;
  } catch (error) {
    const details = getSafeExceptionDetails(error);
    console.error(`[FCM stage=json_parse] ${details.errorCode}`);
    throw new NotificationDiagnosticError("FIREBASE_JSON_INVALID", {
      stage: "json_parse",
      ...details,
    });
  }

  if (parsedServiceAccount.project_id !== projectId) {
    throw new NotificationDiagnosticError("FIREBASE_PROJECT_MISMATCH", {
      environmentProjectId: projectId,
      ...(typeof parsedServiceAccount.project_id === "string"
        ? { serviceAccountProjectId: parsedServiceAccount.project_id }
        : {}),
    });
  }
  if (
    typeof parsedServiceAccount.client_email !== "string" ||
    !parsedServiceAccount.client_email ||
    typeof parsedServiceAccount.private_key !== "string" ||
    !parsedServiceAccount.private_key
  ) {
    throw new NotificationDiagnosticError("FIREBASE_CREDENTIALS_INVALID");
  }

  const privateKey = parsedServiceAccount.private_key.replace(/\\n/g, "\n").trim();
  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    throw new NotificationDiagnosticError("FIREBASE_CREDENTIALS_INVALID");
  }

  let serviceAccountCredential;
  try {
    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail: parsedServiceAccount.client_email,
      privateKey,
    };
    serviceAccountCredential = cert(serviceAccount);
  } catch (error) {
    const details = getSafeExceptionDetails(error);
    console.error(`[FCM stage=credential_construction] ${details.errorCode}`);
    throw new NotificationDiagnosticError("FIREBASE_CREDENTIALS_INVALID", {
      stage: "credential_construction",
      ...details,
    });
  }

  try {
    initializeApp({
      credential: serviceAccountCredential,
      projectId,
    });
  } catch (error) {
    const details = getSafeExceptionDetails(error);
    console.error(`[FCM stage=admin_initialization] ${details.errorCode}`);
    throw new NotificationDiagnosticError("FIREBASE_ADMIN_INIT_FAILED", {
      stage: "admin_initialization",
      ...details,
    });
  }
}

function getFirebaseErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null) return "send_failed";
  const code = "code" in error ? error.code : undefined;
  return typeof code === "string" && /^[a-z0-9/_-]{1,120}$/i.test(code)
    ? code.toLowerCase()
    : "unknown";
}

export async function dispatchNotificationUnchecked(data: DispatchData) {
  configureFirebaseAdmin();
  let devicesQuery = supabaseAdmin
    .from("notification_devices")
    .select("id,user_id,fcm_token,prefs,state,district,disabled")
    .eq("provider", "fcm")
    .eq("disabled", false)
    .not("fcm_token", "is", null);
  if (data.userId) devicesQuery = devicesQuery.eq("user_id", data.userId);
  if (data.state) devicesQuery = devicesQuery.eq("state", data.state);
  if (data.district) devicesQuery = devicesQuery.eq("district", data.district);
  const { data: devices, error } = await devicesQuery;
  if (error) throw databaseDiagnostic(error, "notification_devices_select");
  if (!devices?.length) return { sent: 0, accepted: 0, status: "no_device" as const };

  const userIds = [...new Set(devices.map((device) => device.user_id).filter(Boolean))] as string[];
  const { data: preferences, error: preferencesError } = await supabaseAdmin
    .from("notification_preferences")
    .select("*")
    .in("user_id", userIds);
  if (preferencesError) throw databaseDiagnostic(preferencesError, "notification_preferences_select");
  const preferenceMap = new Map(preferences?.map((item) => [item.user_id, item]));
  const categoryColumn = {
    market: "market_updates",
    weather: "weather_alerts",
    scheme: "government_schemes",
    updates: "app_updates",
    general: "enabled",
  } as const;

  let accepted = 0;
  let blockedByPreferences = 0;
  let deliveryErrorCode: string | undefined;
  for (const device of devices) {
    if (!device.user_id) continue;
    if (!device.fcm_token) continue;
    const preference = preferenceMap.get(device.user_id);
    if (preference && !preference.enabled) {
      blockedByPreferences += 1;
      continue;
    }
    const preferenceColumn = categoryColumn[data.category];
    if (preference && preferenceColumn !== "enabled" && !preference[preferenceColumn]) {
      blockedByPreferences += 1;
      continue;
    }

    const { data: history, error: historyError } = await supabaseAdmin
      .from("notification_history")
      .upsert(
        {
          user_id: device.user_id,
          category: data.category,
          title: data.title,
          body: data.body,
          url: data.url,
          data: { dedupe_key: data.dedupeKey ?? null },
          dedupe_key: data.dedupeKey ? `${device.user_id}:${data.dedupeKey}` : null,
        },
        { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
      )
      .select("id")
      .maybeSingle();
    if (historyError) throw databaseDiagnostic(historyError, "notification_history_upsert");

    let historyId = history?.id;
    const historyDedupeKey = data.dedupeKey ? `${device.user_id}:${data.dedupeKey}` : null;
    if (!historyId && historyDedupeKey) {
      const existingHistory = await supabaseAdmin
        .from("notification_history")
        .select("id")
        .eq("user_id", device.user_id)
        .eq("dedupe_key", historyDedupeKey)
        .maybeSingle();
      if (existingHistory.error) {
        throw databaseDiagnostic(existingHistory.error, "notification_history_lookup");
      }
      historyId = existingHistory.data?.id;
    }
    if (!historyId) continue;

    const { data: priorAttempts, error: attemptsError } = await supabaseAdmin
      .from("notification_delivery_attempts")
      .select("id,device_id,status,error_code,created_at")
      .eq("notification_id", historyId)
      .eq("provider", "fcm")
      .eq("device_id", device.id)
      .order("created_at", { ascending: true });
    if (attemptsError) throw databaseDiagnostic(attemptsError, "notification_delivery_attempts_select");

    const attempts = (priorAttempts ?? []) as DeliveryAttemptState[];
    const decision = deliveryRetryDecision(attempts, device.id);
    if (decision === "unknown_outcome") {
      const stalePending = attempts.find(
        (attempt) =>
          attempt.status === "pending" &&
          Date.now() - Date.parse(attempt.created_at) > PENDING_DELIVERY_LEASE_MS,
      );
      if (stalePending) {
        const { error: quarantineError } = await supabaseAdmin
          .from("notification_delivery_attempts")
          .update({ status: "unknown", error_code: "delivery_outcome_unknown" })
          .eq("id", stalePending.id ?? "")
          .eq("device_id", device.id)
          .eq("status", "pending");
        if (quarantineError) {
          throw databaseDiagnostic(quarantineError, "notification_delivery_attempt_quarantine");
        }
      }
      continue;
    }
    if (decision !== "send") continue;

    const { data: claim, error: claimError } = await supabaseAdmin
      .from("notification_delivery_attempts")
      .insert({
        notification_id: historyId,
        device_id: device.id,
        provider: "fcm",
        status: "pending",
      })
      .select("id")
      .single();
    if (claimError?.code === "23505") continue;
    if (claimError || !claim) {
      throw databaseDiagnostic(claimError ?? new Error("delivery_claim_missing"), "notification_delivery_attempt_claim");
    }

    let message: string;
    try {
      message = await getMessaging().send({
        token: device.fcm_token,
        data: {
          category: data.category,
          title: data.title,
          body: data.body,
          url: data.url,
          notification_id: historyId,
          sound: preference?.sound === "silent" ? "silent" : preference?.sound ?? "signature",
        },
        android: {
          priority: "high",
        },
        webpush: {
          notification: {
            title: data.title,
            body: data.body,
            icon: "/icon-192.png",
            badge: "/favicon.png",
          },
          fcmOptions: {
            link: data.url,
          },
        },
      });
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      deliveryErrorCode = code;
      const permanentFailure = isPermanentFcmFailure(code);
      const { error: attemptUpdateError } = await supabaseAdmin
        .from("notification_delivery_attempts")
        .update({
          status: permanentFailure ? "failed_permanent" : "failed_transient",
          error_code: code,
        })
        .eq("id", claim.id);
      if (attemptUpdateError) {
        throw databaseDiagnostic(attemptUpdateError, "notification_delivery_attempt_failure");
      }
      if (
        code.includes("registration-token-not-valid") ||
        code.includes("registration-token-not-registered") ||
        code.includes("messaging/invalid-registration-token") ||
        code.includes("messaging/registration-token-not-registered")
      ) {
        const { error: disableError } = await supabaseAdmin
          .from("notification_devices")
          .update({ disabled: true })
          .eq("id", device.id);
        if (disableError) throw databaseDiagnostic(disableError, "notification_device_disable");
      }
      continue;
    }

    const { error: acceptedUpdateError } = await supabaseAdmin
      .from("notification_delivery_attempts")
      .update({ status: "sent", provider_message_id: message })
      .eq("id", claim.id);
    if (acceptedUpdateError) {
      throw databaseDiagnostic(acceptedUpdateError, "notification_delivery_attempt_acceptance");
    }
    accepted += 1;
  }
  if (accepted > 0) return { sent: accepted, accepted, status: "accepted" as const };
  if (blockedByPreferences === devices.length) {
    return { sent: 0, accepted: 0, status: "preferences_blocked" as const };
  }
  if (deliveryErrorCode) {
    return {
      sent: 0,
      accepted: 0,
      status: "delivery_error" as const,
      diagnosticCode: "FCM_SEND_FAILED" as const,
      errorCode: deliveryErrorCode,
    };
  }
  return { sent: 0, accepted: 0, status: "not_sent" as const };
}

export async function dispatchNotification(data: DispatchData, adminUserId: string) {
  const { data: role, error: roleError } = await supabaseAdmin.rpc("has_role", {
    _user_id: adminUserId,
    _role: "admin",
  });
  if (roleError) throw databaseDiagnostic(roleError, "admin_authorization");
  if (role !== true) {
    throw new NotificationDiagnosticError("AUTHORIZATION_ERROR");
  }
  return dispatchNotificationUnchecked(data);
}

export async function sendAdminFcmTestHandler(adminUserId: string) {
  try {
    return await dispatchNotification(
      {
        category: "general",
        title: "Market Mitra Test",
        body: "Your Android push notifications are working!",
        url: "/notifications",
        userId: adminUserId,
        dedupeKey: `admin-fcm-test:${Date.now()}`,
      },
      adminUserId,
    );
  } catch (error) {
    const code =
      error instanceof NotificationDiagnosticError
        ? error.code
        : "FIREBASE_ADMIN_INIT_FAILED";
    const details =
      error instanceof NotificationDiagnosticError ? error.details : undefined;
    const rawDetails = getSafeExceptionDetails(error);
    const stage =
      details?.stage ??
      (code === "DATABASE_ERROR" ? "database_operation" : "configure_firebase_admin");
    console.error(`[FCM diagnostic] ${code} stage=${stage} error=${rawDetails.errorCode}`);
    return {
      sent: 0,
      accepted: 0,
      status: "diagnostic_error" as const,
      diagnosticCode: code,
      stage,
      errorCode: details?.errorCode ?? rawDetails.errorCode,
      safeMessage: details?.safeMessage ?? rawDetails.safeMessage,
      ...(details ?? {}),
    };
  }
}

export async function sendUserPriceAlertTestHandler(
  userId: string,
  options?: {
    crop?: string | undefined;
    mandi?: string | undefined;
    priceChangePercent?: number | undefined;
    currentPrice?: number | undefined;
    previousPrice?: number | undefined;
  },
) {
  const crop = options?.crop || "Onion";
  const mandi = options?.mandi || "Lasalgaon APMC";
  const percent = options?.priceChangePercent ?? 18.5;
  const currentPrice = options?.currentPrice ?? 2450;
  const previousPrice = options?.previousPrice ?? 2065;
  const direction = percent >= 0 ? "increased" : "decreased";
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  try {
    return await dispatchNotificationUnchecked({
      category: "market",
      title: `Price Alert: ${crop} ${direction} ${Math.abs(percent)}%`,
      body: `${crop} modal price at ${mandi} surged to ₹${currentPrice}/q (was ₹${previousPrice}/q on ${dateStr}). Tap to inspect buyers.`,
      url: `/markets?crop=${encodeURIComponent(crop.toLowerCase())}&market=${encodeURIComponent(mandi)}`,
      userId,
      dedupeKey: `price-alert-test:${userId}:${Date.now()}`,
    });
  } catch (error) {
    const code =
      error instanceof NotificationDiagnosticError
        ? error.code
        : "FIREBASE_ADMIN_INIT_FAILED";
    const details =
      error instanceof NotificationDiagnosticError ? error.details : undefined;
    const rawDetails = getSafeExceptionDetails(error);
    const stage =
      details?.stage ??
      (code === "DATABASE_ERROR" ? "database_operation" : "configure_firebase_admin");
    console.error(`[FCM user test diagnostic] ${code} stage=${stage} error=${rawDetails.errorCode}`);
    return {
      sent: 0,
      accepted: 0,
      status: "diagnostic_error" as const,
      diagnosticCode: code,
      stage,
      errorCode: details?.errorCode ?? rawDetails.errorCode,
      safeMessage: details?.safeMessage ?? rawDetails.safeMessage,
      ...(details ?? {}),
    };
  }
}
