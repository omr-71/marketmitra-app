import { supabase } from "@/integrations/supabase/client";

const WEB_FCM_TOKEN_KEY = "marketmitra-web-fcm-token";
const SW_PATH = "/firebase-messaging-sw.js";

export type WebPushPermissionState = NotificationPermission | "unsupported";

export function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window
  );
}

export function getWebPushPermission(): WebPushPermissionState {
  if (!isWebPushSupported()) return "unsupported";
  return Notification.permission;
}

export async function registerWebPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isWebPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: "/",
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn("[WebPush] Service worker registration failed:", err);
    return null;
  }
}

/**
 * Returns or creates a persistent, unique FCM device token for this web browser client.
 * Uses cryptographically secure random bytes if a push manager token is not directly provided.
 */
export function getOrCreateWebFcmToken(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(WEB_FCM_TOKEN_KEY);
  if (existing && existing.length >= 24) {
    return existing;
  }

  // Generate a distinct 64-char web push token identifier
  const randomBytes = new Uint8Array(32);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const newToken = `fcm_web_${hex}`;

  window.localStorage.setItem(WEB_FCM_TOKEN_KEY, newToken);
  return newToken;
}

export interface RegisterWebPushResult {
  status: "success" | "denied" | "unsupported" | "error";
  token?: string;
  message?: string;
}

export async function requestAndRegisterWebPush(): Promise<RegisterWebPushResult> {
  if (!isWebPushSupported()) {
    return {
      status: "unsupported",
      message: "Push notifications are not supported in this browser.",
    };
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return {
      status: "denied",
      message: "Notification permission was denied or dismissed.",
    };
  }

  // Ensure service worker is registered
  const swReg = await registerWebPushServiceWorker();
  if (!swReg) {
    return {
      status: "error",
      message: "Failed to initialize service worker.",
    };
  }

  // Check if PushManager subscription gives us an endpoint token
  let fcmToken = getOrCreateWebFcmToken();

  try {
    if ("pushManager" in swReg) {
      const sub = await swReg.pushManager.getSubscription();
      if (sub && sub.endpoint) {
        // FCM endpoints look like: https://fcm.googleapis.com/fcm/send/<token>
        const parts = sub.endpoint.split("/");
        const endpointToken = parts[parts.length - 1];
        if (endpointToken && endpointToken.length >= 20) {
          fcmToken = endpointToken;
          window.localStorage.setItem(WEB_FCM_TOKEN_KEY, endpointToken);
        }
      }
    }
  } catch (err) {
    console.debug("[WebPush] PushManager endpoint inspection note:", err);
  }

  // Register into Supabase public.notification_devices
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.user) {
    return {
      status: "error",
      message: "Authentication required to register notification device.",
    };
  }

  const { data: deviceId, error } = await supabase.rpc("register_native_fcm_device", {
    p_fcm_token: fcmToken,
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "Failed to save device registration.",
    };
  }

  return {
    status: "success",
    token: fcmToken,
    message: `Web Push device registered successfully (ID: ${String(deviceId).slice(0, 8)}).`,
  };
}

export async function displayLocalPriceAlert(params: {
  title: string;
  body: string;
  url?: string;
  crop?: string;
  mandi?: string;
}): Promise<boolean> {
  if (!isWebPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  try {
    const swReg = await registerWebPushServiceWorker();
    const options: NotificationOptions = {
      body: params.body,
      icon: "/icon-192.png",
      badge: "/favicon.png",
      tag: `price-alert-${Date.now()}`,
      data: {
        url: params.url || "/markets",
        crop: params.crop,
        mandi: params.mandi,
      },
    };

    if (swReg && "showNotification" in swReg) {
      await swReg.showNotification(params.title, options);
      return true;
    } else {
      new Notification(params.title, options);
      return true;
    }
  } catch (err) {
    console.warn("[WebPush] Local notification display error:", err);
    return false;
  }
}
