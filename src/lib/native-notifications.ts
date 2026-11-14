import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    MarketMitraAndroidNotifications?: {
      requestPermission(): void;
      getPermissionStatus(): string;
      getFcmToken(): string;
        openNotificationSettings(): void;
      setSoundPreference(sound: string): void;
      previewSound(sound: string): void;
    };
  }
}

export function isNativeAndroidApp() {
  return typeof window !== "undefined" && Boolean(window.MarketMitraAndroidNotifications);
}

export function getNativeNotificationPermissionStatus() {
  const status = window.MarketMitraAndroidNotifications?.getPermissionStatus();
  if (status === "granted" || status === "denied" || status === "global-disabled") return status;
  return "denied";
}

export function refreshNativeNotificationPermission() {
  if (!isNativeAndroidApp()) return;
  return getNativeNotificationPermissionStatus();
}

export function openNativeNotificationSettings() {
  if (!isNativeAndroidApp()) return false;
  window.MarketMitraAndroidNotifications?.openNotificationSettings();
  return true;
}

export async function registerNativeFcmToken(token: string) {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return { status: "failed", reason: "session_missing" as const };
  if (!token) return { status: "failed", reason: "token_missing" as const };
  const { data: deviceId, error } = await supabase.rpc("register_native_fcm_device", {
    p_fcm_token: token,
  });
  if (error) {
    return {
      status: "failed",
      reason: "supabase_error",
      code: error.code || "unknown",
      message: error.message?.slice(0, 120) || "Device registration failed.",
    } as const;
  }
  if (!deviceId) return { status: "failed", reason: "no_write_result", code: "no_data" } as const;
  return { status: "success" } as const;
}

export async function syncNativeFcmToken() {
  if (!isNativeAndroidApp()) return false;
  let token = window.MarketMitraAndroidNotifications?.getFcmToken();
  if (!token) {
    await new Promise((resolve) => window.setTimeout(resolve, 750));
    token = window.MarketMitraAndroidNotifications?.getFcmToken();
  }
  return token ? (await registerNativeFcmToken(token)).status === "success" : false;
}

export function requestNativeNotificationPermission() {
  if (!isNativeAndroidApp()) return false;
  window.MarketMitraAndroidNotifications?.requestPermission();
  return true;
}

export async function syncNotificationPreference(
  preferences: {
    enabled?: boolean;
    market_updates?: boolean;
    weather_alerts?: boolean;
    government_schemes?: boolean;
    app_updates?: boolean;
    sound?: "signature" | "soft" | "silent";
    quiet_hours_enabled?: boolean;
    quiet_from?: string;
    quiet_to?: string;
  },
) {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return false;
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: data.session.user.id,
    ...preferences,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function deactivateNativeFcmDevice() {
  if (!isNativeAndroidApp()) return false;
  const token = window.MarketMitraAndroidNotifications?.getFcmToken();
  if (!token) return true;
  const { error } = await supabase
    .from("notification_devices")
    .update({ disabled: true })
    .eq("fcm_token", token)
    .eq("provider", "fcm");
  return !error;
}
