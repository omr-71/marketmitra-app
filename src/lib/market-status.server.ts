/**
 * Builds the public (non-secret) health picture of the market data service from
 * the diagnostics rows the aggregator already writes to `api_fetch_logs`.
 * Never reads or returns API keys — only whether a credential is present.
 */

import { computeFreshness } from "./market-freshness";
import { providerCatalogue } from "./market-providers.server";
import type {
  MarketServiceStatus,
  ProviderDiagnostic,
  ProviderStatus,
} from "./market-types";

type LogRow = {
  provider: string;
  ok: boolean;
  status_code: number | null;
  record_count: number | null;
  latest_data_date: string | null;
  duration_ms: number | null;
  error: string | null;
  created_at: string;
};

function rollUp(configured: boolean, attempts: number, successes: number): ProviderStatus {
  if (!configured) return "not_configured";
  if (attempts === 0) return "unknown";
  if (successes === 0) return "down";
  return successes / attempts >= 0.6 ? "healthy" : "degraded";
}

export async function readMarketServiceStatus(): Promise<MarketServiceStatus> {
  const catalogue = providerCatalogue();
  let rows: LogRow[] = [];

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data } = await supabaseAdmin
      .from("api_fetch_logs")
      .select(
        "provider, ok, status_code, record_count, latest_data_date, duration_ms, error, created_at",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    rows = (data ?? []) as unknown as LogRow[];
  } catch (error) {
    console.error("[market] status read failed", error);
  }

  const providers: ProviderDiagnostic[] = catalogue.map((provider) => {
    const mine = rows.filter((r) => r.provider === provider.id);
    const ok = mine.filter((r) => r.ok);
    const failed = mine.filter((r) => !r.ok);
    const newest = mine[0];
    const latestDataDate =
      mine.map((r) => r.latest_data_date).filter(Boolean).sort().reverse()[0] ?? null;

    return {
      ...provider,
      status: rollUp(provider.configured, mine.length, ok.length),
      lastSuccessAt: ok[0]?.created_at ?? null,
      lastFailureAt: failed[0]?.created_at ?? null,
      lastError: failed[0]?.error ?? null,
      lastRecordCount: newest?.record_count ?? null,
      latestDataDate,
      lastDurationMs: newest?.duration_ms ?? null,
      attempts24h: mine.length,
      successes24h: ok.length,
    };
  });

  const live = providers.filter((p) => !p.archive);
  const lastSuccessAt =
    live
      .map((p) => p.lastSuccessAt)
      .filter((v): v is string => Boolean(v))
      .sort()
      .reverse()[0] ?? null;
  const latestDataDate =
    live
      .map((p) => p.latestDataDate)
      .filter((v): v is string => Boolean(v))
      .sort()
      .reverse()[0] ?? null;

  const overall: ProviderStatus = live.some((p) => p.status === "healthy")
    ? "healthy"
    : live.some((p) => p.status === "degraded")
      ? "degraded"
      : live.some((p) => p.status === "down")
        ? "down"
        : live.every((p) => p.status === "not_configured")
          ? "not_configured"
          : "unknown";

  return {
    generatedAt: new Date().toISOString(),
    overall,
    providers,
    lastSuccessAt,
    latestDataDate,
    freshness: computeFreshness({ dataDate: latestDataDate }),
  };
}
