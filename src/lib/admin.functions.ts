import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminSeries = { day: string; count: number }[];
export type AdminCount = { key: string; count: number }[];

export type ServiceHealth = {
  name: string;
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  detail: string;
};

export type AdminOverview = {
  generatedAt: string;
  tracking: {
    since: string;
    totalEvents: number;
    sessions: number;
    sessions24h: number;
    pageViews: number;
    eventsByType: AdminCount;
    topPages: AdminCount;
    topCrops: AdminCount;
    devices: AdminCount;
    languages: AdminCount;
    daily: AdminSeries;
    recent: { event: string; page: string | null; label: string | null; at: string }[];
    features: {
      marketSearches: number;
      weatherLookups: number;
      diagnoseStarted: number;
      diagnoseCompleted: number;
      diagnoseFailed: number;
      mitraConversations: number;
      mitraMessages: number;
      mitraErrors: number;
      schemeViews: number;
    };
  };
  users: { profiles: number };
  services: ServiceHealth[];
  marketData: {
    source: string;
    ok: boolean;
    records: number | null;
    latestArrivalDate: string | null;
    sourceUpdatedAt: string | null;
    detail: string;
  };
};

async function assertAdmin(supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> }, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new Error("Forbidden");
}

function bucket(rows: { key: string | null }[], limit = 8): AdminCount {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = row.key?.trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function probe(name: string, url: string, detailOk: string): Promise<ServiceHealth> {
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return {
      name,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      detail: res.ok ? detailOk : `Upstream responded ${res.status}`,
    };
  } catch {
    return { name, ok: false, status: null, latencyMs: Date.now() - started, detail: "Request failed or timed out" };
  }
}

/** Whether the signed-in user is an administrator. Safe for any signed-in user. */
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { admin: data === true };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [{ data: events }, { count: profiles }] = await Promise.all([
      supabaseAdmin
        .from("analytics_events")
        .select("event,page,label,device,lang,session_id,created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(20000),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const rows = events ?? [];
    const dayMap = new Map<string, number>();
    for (const r of rows) {
      const day = (r.created_at ?? "").slice(0, 10);
      if (day) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
    }
    const daily = [...dayMap.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const cutoff = Date.now() - 24 * 3600 * 1000;
    const countOf = (event: string) => rows.filter((r) => r.event === event).length;

    const key = process.env["DATA_GOV_IN_API_KEY"];
    const marketUrl = key
      ? `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${key}&format=json&limit=1&sort%5BArrival_Date%5D=desc`
      : null;

    const [weather, aiGateway, marketProbe] = await Promise.all([
      probe(
        "Open-Meteo weather",
        "https://api.open-meteo.com/v1/forecast?latitude=19.99&longitude=73.79&current=temperature_2m",
        "Live weather reachable",
      ),
      probe("Lovable AI gateway", "https://ai.gateway.lovable.dev/v1/models", "Gateway reachable"),
      marketUrl
        ? probe("AGMARKNET market data", marketUrl, "Government market data reachable")
        : Promise.resolve<ServiceHealth>({
            name: "AGMARKNET market data",
            ok: false,
            status: null,
            latencyMs: null,
            detail: "Market data key is not configured",
          }),
    ]);

    let marketData: AdminOverview["marketData"] = {
      source: "AGMARKNET · data.gov.in",
      ok: false,
      records: null,
      latestArrivalDate: null,
      sourceUpdatedAt: null,
      detail: marketUrl ? "Could not read the latest record" : "Market data key is not configured",
    };
    if (marketUrl && marketProbe.ok) {
      try {
        const res = await fetch(marketUrl, { signal: AbortSignal.timeout(8000) });
        const json = (await res.json()) as {
          total?: number;
          updated_date?: string;
          records?: { arrival_date?: string; Arrival_Date?: string }[];
        };
        const rec = json.records?.[0];
        marketData = {
          source: "AGMARKNET · data.gov.in",
          ok: true,
          records: typeof json.total === "number" ? json.total : null,
          latestArrivalDate: rec?.arrival_date ?? rec?.Arrival_Date ?? null,
          sourceUpdatedAt: json.updated_date ?? null,
          detail: "Latest record read directly from the government dataset",
        };
      } catch {
        /* keep the failure shape above */
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      tracking: {
        since: since.toISOString(),
        totalEvents: rows.length,
        sessions: new Set(rows.map((r) => r.session_id).filter(Boolean)).size,
        sessions24h: new Set(
          rows.filter((r) => new Date(r.created_at ?? 0).getTime() >= cutoff).map((r) => r.session_id).filter(Boolean),
        ).size,
        pageViews: countOf("page_view"),
        eventsByType: bucket(rows.map((r) => ({ key: r.event })), 14),
        topPages: bucket(rows.filter((r) => r.event === "page_view").map((r) => ({ key: r.page }))),
        topCrops: bucket(rows.filter((r) => r.event === "crop_selected").map((r) => ({ key: r.label }))),
        devices: bucket(rows.map((r) => ({ key: r.device })), 6),
        languages: bucket(rows.map((r) => ({ key: r.lang })), 6),
        daily,
        recent: rows.slice(0, 25).map((r) => ({
          event: r.event,
          page: r.page ?? null,
          label: r.label ?? null,
          at: r.created_at,
        })),
        features: {
          marketSearches: countOf("market_search"),
          weatherLookups: countOf("weather_lookup"),
          diagnoseStarted: countOf("diagnose_started"),
          diagnoseCompleted: countOf("diagnose_completed"),
          diagnoseFailed: countOf("diagnose_failed"),
          mitraConversations: countOf("mitra_ai_opened"),
          mitraMessages: countOf("mitra_ai_message"),
          mitraErrors: countOf("mitra_ai_error"),
          schemeViews: countOf("scheme_viewed"),
        },
      },
      users: { profiles: profiles ?? 0 },
      services: [weather, aiGateway, marketProbe],
      marketData,
    };
  });

export const getAdminFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("feature_flags")
      .select("key,label,enabled,maintenance_message,updated_at")
      .order("label");
    if (error) throw new Error("Could not load feature switches");
    return data ?? [];
  });

export const setFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { key: string; enabled: boolean; message?: string | null }) =>
    z
      .object({
        key: z.string().min(1).max(64),
        enabled: z.boolean(),
        message: z.string().max(400).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("feature_flags")
      .update({
        enabled: data.enabled,
        maintenance_message: data.message ?? null,
        updated_by: context.userId,
      })
      .eq("key", data.key);
    if (error) throw new Error("Could not update the feature switch");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: context.userId,
      action: data.enabled ? "feature_enabled" : "feature_disabled",
      detail: { key: data.key, message: data.message ?? null } as never,
    });
    return { ok: true };
  });

export const getAdminAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data } = await context.supabase
      .from("admin_audit_log")
      .select("id,action,detail,created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    return data ?? [];
  });
