import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

/**
 * Privacy-conscious usage tracking.
 *
 * We store only: event name, route path, an optional non-personal label
 * (e.g. crop name), a random per-tab session id, device category and UI
 * language. No names, phone numbers, emails, coordinates or message text.
 */
export type AnalyticsEvent =
  | "page_view"
  | "app_launch"
  | "crop_selected"
  | "market_search"
  | "weather_lookup"
  | "diagnose_started"
  | "diagnose_completed"
  | "diagnose_failed"
  | "mitra_ai_opened"
  | "mitra_ai_message"
  | "mitra_ai_error"
  | "mitra_ai_retry"
  | "scheme_viewed"
  | "prediction_viewed";

const SESSION_KEY = "mm-analytics-session";

function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function device(): string {
  if (typeof window === "undefined") return "unknown";
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const w = window.innerWidth;
  const kind = w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  return standalone ? `${kind}-pwa` : kind;
}

function lang(): string {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem("mm-lang") ?? "en";
  } catch {
    return "en";
  }
}

/** Fire-and-forget: analytics must never block or break a user flow. */
export function track(
  event: AnalyticsEvent,
  opts: { label?: string | null; page?: string; props?: Record<string, unknown> } = {},
) {
  if (typeof window === "undefined") return;
  const row = {
    event,
    page: opts.page ?? window.location.pathname,
    label: opts.label ?? null,
    session_id: sessionId(),
    device: device(),
    lang: lang(),
    props: (opts.props ?? {}) as never,
  };
  try {
    // Analytics is best-effort: a missing/unavailable backend must never break the UI.
    void Promise.resolve(supabase.from("analytics_events").insert(row)).catch(() => undefined);
  } catch {
    /* backend not configured */
  }
}

let launched = false;

/** Records one page_view per route change (and one app_launch per tab). */
export function usePageTracking() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (launched) return;
    launched = true;
    track("app_launch", { page: pathname });
  }, [pathname]);

  useEffect(() => {
    // Never track the private admin area.
    if (pathname.startsWith("/admin")) return;
    track("page_view", { page: pathname });
  }, [pathname]);
}
