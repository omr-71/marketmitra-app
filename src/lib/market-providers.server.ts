/**
 * Market price provider abstraction.
 *
 * Every provider returns the SAME normalized record shape, so the frontend and
 * Mitra AI never care which source answered. Providers are tried in priority
 * order; each attempt is logged for admin diagnostics. Nothing here ever
 * invents, averages across dates, or synthesises a price.
 */

import { computeFreshness, type Freshness } from "./market-freshness";

export type PriceRecord = {
  providerId: string;
  source: string;
  commodity: string;
  variety: string | null;
  grade: string | null;
  state: string;
  district: string;
  market: string;
  /** Official reporting date, yyyy-MM-dd. */
  date: string;
  arrival: number | null;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  currency: "INR";
  fetchedAt: string;
  sourceUpdatedAt: string | null;
};

export type ProviderAttempt = {
  providerId: string;
  provider: string;
  ok: boolean;
  statusCode: number | null;
  recordCount: number;
  latestDataDate: string | null;
  durationMs: number;
  error: string | null;
};

export type MarketFilters = {
  commodity: string;
  state: string;
  district?: string | undefined;
  market?: string | undefined;
};

type ProviderResult = {
  records: PriceRecord[];
  sourceUpdatedAt: string | null;
  statusCode: number | null;
};

type Provider = {
  id: string;
  name: string;
  /** Lower runs first. */
  priority: number;
  envKey: string | null;
  coverage: string;
  /** Archive providers must never be presented as current data. */
  archive: boolean;
  fetch: (filters: MarketFilters) => Promise<ProviderResult>;
};

/* ------------------------------------------------------------------ helpers */

function pick(row: Record<string, unknown>, ...keys: string[]) {
  const normalized = new Map<string, unknown>();
  for (const [k, v] of Object.entries(row)) {
    normalized.set(k.toLowerCase().replace(/[^a-z]/g, ""), v);
  }
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase().replace(/[^a-z]/g, ""));
    if (value !== undefined && value !== null && String(value).trim() !== "")
      return String(value).trim();
  }
  return "";
}

/** data.gov.in returns dd/MM/yyyy for arrival dates. */
function toIsoDate(value: string) {
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
}

function datasetUpdatedAt(payload: { updated_date?: string; updated?: number }): string | null {
  if (payload.updated_date) {
    const parsed = new Date(payload.updated_date);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  if (typeof payload.updated === "number") return new Date(payload.updated * 1000).toISOString();
  return null;
}

const looseEq = (a: string, b: string) =>
  a.toLowerCase().replace(/[^a-z0-9]/g, "") === b.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Rejects malformed / impossible rows so bad upstream data can never render. */
function isValid(record: PriceRecord) {
  return (
    Boolean(record.market) &&
    Boolean(record.date) &&
    Number.isFinite(record.minPrice) &&
    Number.isFinite(record.maxPrice) &&
    Number.isFinite(record.modalPrice) &&
    record.modalPrice > 0 &&
    record.minPrice >= 0 &&
    record.maxPrice >= record.minPrice &&
    record.modalPrice <= record.maxPrice * 1.5
  );
}

/** Newest reporting date first, then highest modal price. */
export function sortRecords(records: PriceRecord[]) {
  return [...records].sort((a, b) =>
    a.date === b.date ? b.modalPrice - a.modalPrice : a.date < b.date ? 1 : -1,
  );
}

/** Drops exact duplicates reported by the same source for the same day. */
function dedupe(records: PriceRecord[]) {
  const seen = new Set<string>();
  const out: PriceRecord[] = [];
  for (const r of records) {
    const key = [r.providerId, r.market, r.district, r.variety, r.grade, r.date, r.modalPrice].join(
      "|",
    );
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function normalizeRows(
  rows: Record<string, unknown>[],
  meta: { providerId: string; source: string; sourceUpdatedAt: string | null; fetchedAt: string },
): PriceRecord[] {
  const records = rows.map<PriceRecord>((row) => {
    const arrival = Number(pick(row, "arrivals", "arrival", "tonnes"));
    return {
      providerId: meta.providerId,
      source: meta.source,
      commodity: pick(row, "commodity"),
      variety: pick(row, "variety") || null,
      grade: pick(row, "grade") || null,
      state: pick(row, "state"),
      district: pick(row, "district"),
      market: pick(row, "market"),
      date: toIsoDate(pick(row, "arrival_date", "arrivaldate", "date")),
      arrival: Number.isFinite(arrival) && arrival > 0 ? arrival : null,
      minPrice: Number(pick(row, "min_price", "minprice")),
      maxPrice: Number(pick(row, "max_price", "maxprice")),
      modalPrice: Number(pick(row, "modal_price", "modalprice")),
      currency: "INR",
      fetchedAt: meta.fetchedAt,
      sourceUpdatedAt: meta.sourceUpdatedAt,
    };
  });
  return dedupe(sortRecords(records.filter(isValid)));
}

async function getJson(url: URL) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(`HTTP ${response.status}`) as Error & { statusCode: number };
    error.statusCode = response.status;
    console.error(`[market] ${url.host} failed ${response.status}: ${body.slice(0, 300)}`);
    throw error;
  }
  return { payload: await response.json(), statusCode: response.status };
}

/* ---------------------------------------------------------------- providers */

/**
 * PRIMARY — "Variety-wise Daily Market Prices Data of Commodity" (AGMARKNET).
 * The dataset is the full archive and its natural order is by market, NOT by
 * date, so `sort[Arrival_Date]=desc` is mandatory or years-old rows come back.
 */
const AGMARKNET_VARIETY = "35985678-0d79-46b4-9ed6-6f13308a1d24";
/** SECONDARY — "Current Daily Price of Various Commodities from Various Markets". */
const AGMARKNET_DAILY = "9ef84268-d588-465a-a308-a864a43d0070";

const agmarknetVariety: Provider = {
  id: "agmarknet_variety",
  name: "AGMARKNET · Variety-wise daily prices (data.gov.in)",
  priority: 1,
  envKey: "DATA_GOV_IN_API_KEY",
  coverage: "All states · full mandi archive · daily",
  archive: false,
  async fetch(filters) {
    const apiKey = process.env["DATA_GOV_IN_API_KEY"];
    if (!apiKey) throw new Error("missing_api_key");
    const fetchedAt = new Date().toISOString();

    const request = async (f: MarketFilters) => {
      const url = new URL(`https://api.data.gov.in/resource/${AGMARKNET_VARIETY}`);
      url.searchParams.set("api-key", apiKey);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "250");
      url.searchParams.set("sort[Arrival_Date]", "desc");
      url.searchParams.set("filters[Commodity]", f.commodity);
      url.searchParams.set("filters[State]", f.state);
      if (f.district) url.searchParams.set("filters[District]", f.district);
      if (f.market) url.searchParams.set("filters[Market]", f.market);
      return getJson(url);
    };

    let { payload, statusCode } = await request(filters);
    let rows = (payload as { records?: Record<string, unknown>[] }).records ?? [];
    // District names differ in spelling across AGMARKNET; widen to the state
    // (same official source) rather than showing nothing.
    if (rows.length === 0 && filters.district && !filters.market) {
      ({ payload, statusCode } = await request({
        commodity: filters.commodity,
        state: filters.state,
      }));
      rows = (payload as { records?: Record<string, unknown>[] }).records ?? [];
    }

    const sourceUpdatedAt = datasetUpdatedAt(payload as { updated_date?: string });
    return {
      records: normalizeRows(rows, {
        providerId: this.id,
        source: "AGMARKNET · Government of India",
        sourceUpdatedAt,
        fetchedAt,
      }),
      sourceUpdatedAt,
      statusCode,
    };
  },
};

const agmarknetDaily: Provider = {
  id: "agmarknet_daily",
  name: "AGMARKNET · Current daily mandi prices (data.gov.in)",
  priority: 2,
  envKey: "DATA_GOV_IN_API_KEY",
  coverage: "Today's published snapshot · matched in memory",
  archive: false,
  async fetch(filters) {
    const apiKey = process.env["DATA_GOV_IN_API_KEY"];
    if (!apiKey) throw new Error("missing_api_key");
    const fetchedAt = new Date().toISOString();
    // This resource ignores server-side filters, so we take the published
    // snapshot and match commodity/state ourselves.
    const url = new URL(`https://api.data.gov.in/resource/${AGMARKNET_DAILY}`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5000");
    const { payload, statusCode } = await getJson(url);
    const rows = ((payload as { records?: Record<string, unknown>[] }).records ?? []).filter(
      (row) =>
        looseEq(pick(row, "commodity"), filters.commodity) &&
        looseEq(pick(row, "state"), filters.state),
    );
    const sourceUpdatedAt = datasetUpdatedAt(payload as { updated_date?: string });
    return {
      records: normalizeRows(rows, {
        providerId: this.id,
        source: "AGMARKNET daily snapshot · Government of India",
        sourceUpdatedAt,
        fetchedAt,
      }),
      sourceUpdatedAt,
      statusCode,
    };
  },
};

/**
 * LAST RESORT — officially reported records MarketMitra already stored. Flagged
 * as an archive so the UI always labels it "last available data", never today's.
 */
const storedArchive: Provider = {
  id: "marketmitra_archive",
  name: "MarketMitra archive of official AGMARKNET records",
  priority: 9,
  envKey: null,
  coverage: "Previously fetched official records only",
  archive: true,
  async fetch(filters) {
    const fetchedAt = new Date().toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("market_prices")
      .select("commodity, variety, state, district, market, min_price, max_price, modal_price, arrival_date")
      .eq("commodity", filters.commodity)
      .eq("state", filters.state)
      .order("arrival_date", { ascending: false })
      .limit(250);
    if (filters.market) query = query.eq("market", filters.market);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return {
      records: normalizeRows((data ?? []) as unknown as Record<string, unknown>[], {
        providerId: this.id,
        source: "AGMARKNET (last stored official record)",
        sourceUpdatedAt: null,
        fetchedAt,
      }),
      sourceUpdatedAt: null,
      statusCode: null,
    };
  },
};

export const providers: Provider[] = [agmarknetVariety, agmarknetDaily, storedArchive].sort(
  (a, b) => a.priority - b.priority,
);

export function providerCatalogue() {
  return providers.map((p) => ({
    id: p.id,
    name: p.name,
    priority: p.priority,
    coverage: p.coverage,
    archive: p.archive,
    requiresKey: Boolean(p.envKey),
    configured: p.envKey ? Boolean(process.env[p.envKey]) : true,
  }));
}

/* --------------------------------------------------------------- aggregator */

export type AggregateResult = {
  records: PriceRecord[];
  attempts: ProviderAttempt[];
  providerId: string | null;
  source: string | null;
  archive: boolean;
  latestDate: string;
  sourceUpdatedAt: string | null;
  fetchedAt: string;
  freshness: Freshness;
  /** Other sources that also reported the same latest date, for transparency. */
  corroboratedBy: string[];
};

async function logAttempts(attempts: ProviderAttempt[], filters: MarketFilters) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("api_fetch_logs").insert(
      attempts.map((a) => ({
        provider: a.providerId,
        ok: a.ok,
        status_code: a.statusCode,
        record_count: a.recordCount,
        latest_data_date: a.latestDataDate,
        duration_ms: a.durationMs,
        commodity: filters.commodity,
        state: filters.state,
        error: a.error,
      })),
    );
  } catch (error) {
    console.error("[market] diagnostics log failed", error);
  }
}

async function persist(records: PriceRecord[]) {
  const live = records.filter((r) => r.providerId !== storedArchive.id);
  if (live.length === 0) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("market_prices").upsert(
      live.map((r) => ({
        commodity: r.commodity,
        variety: r.variety,
        state: r.state,
        district: r.district,
        market: r.market,
        min_price: r.minPrice,
        max_price: r.maxPrice,
        modal_price: r.modalPrice,
        arrival_date: r.date,
        fetched_at: r.fetchedAt,
      })),
      { onConflict: "commodity,state,district,market,variety,arrival_date" },
    );
    if (error) console.error("[market] upsert failed", error.message);
  } catch (error) {
    console.error("[market] upsert threw", error);
  }
}

/**
 * Tries every configured provider in priority order and returns the freshest
 * valid set. Never merges records from different providers or dates into one
 * price — corroboration is reported separately.
 */
export async function aggregateMarketPrices(filters: MarketFilters): Promise<AggregateResult> {
  const attempts: ProviderAttempt[] = [];
  const successes: { provider: Provider; result: ProviderResult }[] = [];

  for (const provider of providers) {
    if (provider.envKey && !process.env[provider.envKey]) {
      attempts.push({
        providerId: provider.id,
        provider: provider.name,
        ok: false,
        statusCode: null,
        recordCount: 0,
        latestDataDate: null,
        durationMs: 0,
        error: "API key not configured",
      });
      continue;
    }
    const started = Date.now();
    try {
      const result = await provider.fetch(filters);
      attempts.push({
        providerId: provider.id,
        provider: provider.name,
        ok: result.records.length > 0,
        statusCode: result.statusCode,
        recordCount: result.records.length,
        latestDataDate: result.records[0]?.date ?? null,
        durationMs: Date.now() - started,
        error: result.records.length === 0 ? "No records returned" : null,
      });
      if (result.records.length > 0) {
        successes.push({ provider, result });
        // A non-archive hit is authoritative; stop there.
        if (!provider.archive) break;
      }
    } catch (error) {
      const err = error as Error & { statusCode?: number };
      attempts.push({
        providerId: provider.id,
        provider: provider.name,
        ok: false,
        statusCode: err.statusCode ?? null,
        recordCount: 0,
        latestDataDate: null,
        durationMs: Date.now() - started,
        error: err.message.slice(0, 300),
      });
    }
  }

  void logAttempts(attempts, filters);

  const chosen = successes[0];
  if (!chosen) {
    return {
      records: [],
      attempts,
      providerId: null,
      source: null,
      archive: false,
      latestDate: "",
      sourceUpdatedAt: null,
      fetchedAt: new Date().toISOString(),
      freshness: { level: "unavailable", label: "UNAVAILABLE", ageDays: null },
      corroboratedBy: [],
    };
  }

  const records = chosen.result.records;
  await persist(records);
  const latestDate = records[0]?.date ?? "";

  return {
    records,
    attempts,
    providerId: chosen.provider.id,
    source: records[0]?.source ?? chosen.provider.name,
    archive: chosen.provider.archive,
    latestDate,
    sourceUpdatedAt: chosen.result.sourceUpdatedAt,
    fetchedAt: records[0]?.fetchedAt ?? new Date().toISOString(),
    freshness: computeFreshness({
      dataDate: latestDate,
      sourceUpdatedAt: chosen.provider.archive ? null : chosen.result.sourceUpdatedAt,
    }),
    corroboratedBy: successes
      .slice(1)
      .filter((s) => s.result.records[0]?.date === latestDate)
      .map((s) => s.provider.name),
  };
}
