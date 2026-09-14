/**
 * Market price provider abstraction.
 *
 * Every provider returns the SAME normalized record shape, so the frontend and
 * Mitra AI never care which source answered. Providers are tried in priority
 * order; each attempt is logged for admin diagnostics. Nothing here ever
 * invents, averages across dates, or synthesises a price.
 */

import { computeFreshness, isCurrentMarketDate, type Freshness } from "./market-freshness";

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

/** Re-check every normalized row, even when an upstream API claims it applied filters. */
export function matchesMarketFilters(record: PriceRecord, filters: MarketFilters) {
  return (
    looseEq(record.commodity, filters.commodity) &&
    looseEq(record.state, filters.state) &&
    (!filters.district || looseEq(record.district, filters.district)) &&
    (!filters.market || looseEq(record.market, filters.market))
  );
}

export function currentMarketRecords(
  records: PriceRecord[],
  filters: MarketFilters,
  now: Date = new Date(),
) {
  return dedupe(
    sortRecords(
      records.filter(
        (record) =>
          isValid(record) &&
          matchesMarketFilters(record, filters) &&
          isCurrentMarketDate(record.date, now),
      ),
    ),
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

    const { payload, statusCode } = await request(filters);
    const rows = (payload as { records?: Record<string, unknown>[] }).records ?? [];

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
    // This resource ignores server-side filters, so we strictly match all
    // requested location and crop fields ourselves.
    const url = new URL(`https://api.data.gov.in/resource/${AGMARKNET_DAILY}`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "5000");
    const { payload, statusCode } = await getJson(url);
    const rows = ((payload as { records?: Record<string, unknown>[] }).records ?? []).filter(
      (row) =>
        looseEq(pick(row, "commodity"), filters.commodity) &&
        looseEq(pick(row, "state"), filters.state) &&
        (!filters.district || looseEq(pick(row, "district"), filters.district)) &&
        (!filters.market || looseEq(pick(row, "market"), filters.market)),
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
      .gte("arrival_date", (() => {
        const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
          new Date(),
        );
        const yesterday = new Date(`${today}T00:00:00Z`);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        return yesterday.toISOString().slice(0, 10);
      })())
      .lte(
        "arrival_date",
        new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
      )
      .order("arrival_date", { ascending: false })
      .limit(250);
    if (filters.district) query = query.eq("district", filters.district);
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
  return [
    ...providers.map((p) => ({
      id: p.id,
      name: p.name,
      priority: p.priority,
      coverage: p.coverage,
      archive: p.archive,
      requiresKey: Boolean(p.envKey),
      configured: p.envKey ? Boolean(process.env[p.envKey]) : true,
    })),
    {
      id: CEDA_ID,
      name: "CEDA Agmarknet open research API (state-level cross-check)",
      priority: 5,
      coverage: "State-level daily averages · used only to cross-check prices",
      archive: true,
      requiresKey: false,
      configured: true,
    },
  ];
}

/* ------------------------------------------------- cross-check: CEDA (open) */

/**
 * CEDA (Centre for Economic Data & Analysis, Ashoka University) publishes an
 * open, keyless API over the same official AGMARKNET reporting, aggregated to
 * state-level daily averages. It is NOT per-mandi and it lags the portal, so it
 * is never shown as a price — it is used purely to sanity-check the mandi
 * numbers we do show and to flag source disagreement.
 */
const CEDA_ID = "ceda_agmarknet";
const CEDA_BASE = "https://agmarknet.ceda.ashoka.edu.in/api";

type CedaLookup = { states: { id: number; name: string }[]; commodities: { id: number; name: string }[] };
let cedaLookup: { at: number; value: CedaLookup } | null = null;

async function loadCedaLookup(): Promise<CedaLookup> {
  if (cedaLookup && Date.now() - cedaLookup.at < 6 * 3600_000) return cedaLookup.value;
  const [statesRes, commoditiesRes] = await Promise.all([
    fetch(`${CEDA_BASE}/states`, { headers: { accept: "application/json" } }),
    fetch(`${CEDA_BASE}/commodities`, { headers: { accept: "application/json" } }),
  ]);
  if (!statesRes.ok || !commoditiesRes.ok) throw new Error("ceda_lookup_failed");
  const states = (await statesRes.json()) as {
    data?: { census_state_id: number; census_state_name: string }[];
  };
  const commodities = (await commoditiesRes.json()) as {
    data?: { commodity_id: number; commodity_disp_name: string }[];
  };
  const value: CedaLookup = {
    states: (states.data ?? []).map((s) => ({ id: s.census_state_id, name: s.census_state_name })),
    commodities: (commodities.data ?? []).map((c) => ({
      id: c.commodity_id,
      name: c.commodity_disp_name,
    })),
  };
  cedaLookup = { at: Date.now(), value };
  return value;
}

export type StateBenchmark = {
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
};

/** Latest state-level daily average for this commodity, or null. Never a price shown as current. */
async function fetchStateBenchmark(filters: MarketFilters): Promise<StateBenchmark | null> {
  const lookup = await loadCedaLookup();
  const state = lookup.states.find((s) => looseEq(s.name, filters.state));
  const commodity = lookup.commodities.find((c) => looseEq(c.name, filters.commodity));
  if (!state || !commodity) return null;

  const end = new Date();
  const start = new Date(end.getTime() - 400 * 86_400_000);
  const response = await fetch(`${CEDA_BASE}/prices`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      state_id: state.id,
      commodity_id: commodity.id,
      district_id: null,
      calculation_type: "d",
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = (await response.json()) as {
    data?: { t: string; p_min: number; p_max: number; p_modal: number }[];
  };
  const rows = (payload.data ?? [])
    .filter((r) => typeof r.t === "string" && Number.isFinite(r.p_modal) && r.p_modal > 0)
    .sort((a, b) => (a.t < b.t ? 1 : -1));
  const newest = rows[0];
  if (!newest) return null;
  return {
    date: newest.t.slice(0, 10),
    minPrice: Math.round(newest.p_min),
    maxPrice: Math.round(newest.p_max),
    modalPrice: Math.round(newest.p_modal),
  };
}

/* --------------------------------------------------------------- aggregator */

export type Consensus = "single" | "corroborated" | "conflict";

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
  /** Internal confidence signal — never rendered as technical text. */
  consensus: Consensus;
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

const marketKey = (r: PriceRecord) =>
  `${r.market}|${r.district}|${r.variety ?? ""}`.toLowerCase().replace(/[^a-z0-9|]/g, "");

/**
 * Merges records from several sources that all report the same reporting date.
 * Same mandi + variety reported twice: keep the record from the higher-priority
 * source, and flag a conflict when the two modal prices differ materially
 * (>12%) instead of averaging unrelated numbers.
 */
function mergeSameDate(groups: { priority: number; records: PriceRecord[] }[]) {
  const chosen = new Map<string, PriceRecord>();
  let conflict = false;
  for (const group of [...groups].sort((a, b) => a.priority - b.priority)) {
    for (const record of group.records) {
      const key = marketKey(record);
      const existing = chosen.get(key);
      if (!existing) {
        chosen.set(key, record);
        continue;
      }
      const spread =
        Math.abs(existing.modalPrice - record.modalPrice) /
        Math.max(existing.modalPrice, record.modalPrice);
      if (spread > 0.12) conflict = true;
    }
  }
  return { records: sortRecords([...chosen.values()]), conflict };
}

/**
 * Queries every configured provider in PARALLEL and returns the set whose
 * underlying MARKET DATA DATE is newest — not whichever API answered first.
 * Records are normalized, validated, deduped across sources and cross-checked
 * against the state-level benchmark. Nothing is ever fabricated or averaged.
 */
export async function aggregateMarketPrices(filters: MarketFilters): Promise<AggregateResult> {
  const attempts: ProviderAttempt[] = [];
  const successes: { provider: Provider; result: ProviderResult }[] = [];

  const runnable = providers.filter((p) => !p.envKey || Boolean(process.env[p.envKey]));
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
    }
  }

  const benchmarkStarted = Date.now();
  const settled = await Promise.allSettled([
    ...runnable.map(async (provider) => {
      const started = Date.now();
      try {
        const rawResult = await provider.fetch(filters);
        const result = {
          ...rawResult,
          records: currentMarketRecords(rawResult.records, filters),
        };
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
        if (result.records.length > 0) successes.push({ provider, result });
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
    }),
    (async () => {
      try {
        const benchmark = await fetchStateBenchmark(filters);
        attempts.push({
          providerId: CEDA_ID,
          provider: "CEDA Agmarknet open research API",
          ok: Boolean(benchmark),
          statusCode: 200,
          recordCount: benchmark ? 1 : 0,
          latestDataDate: benchmark?.date ?? null,
          durationMs: Date.now() - benchmarkStarted,
          error: benchmark ? null : "No benchmark rows",
        });
        return benchmark;
      } catch (error) {
        attempts.push({
          providerId: CEDA_ID,
          provider: "CEDA Agmarknet open research API",
          ok: false,
          statusCode: null,
          recordCount: 0,
          latestDataDate: null,
          durationMs: Date.now() - benchmarkStarted,
          error: (error as Error).message.slice(0, 300),
        });
        return null;
      }
    })(),
  ]);

  const benchmark =
    settled[settled.length - 1]?.status === "fulfilled"
      ? ((settled[settled.length - 1] as PromiseFulfilledResult<StateBenchmark | null>)
          .value ?? null)
      : null;

  void logAttempts(attempts, filters);

  // Prefer live sources; stored official rows are eligible only inside the same
  // today/yesterday window already enforced above.
  const live = successes.filter((s) => !s.provider.archive);
  const pool = live.length > 0 ? live : successes;

  if (pool.length === 0) {
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
      consensus: "single",
    };
  }

  // "Latest" = newest underlying market data date, ties broken by source priority.
  const latestDate = pool
    .map((s) => s.result.records[0]?.date ?? "")
    .sort()
    .reverse()[0]!;
  const onLatest = pool.filter((s) => s.result.records[0]?.date === latestDate);
  const primary = [...onLatest].sort((a, b) => a.provider.priority - b.provider.priority)[0]!;

  const merged = mergeSameDate(
    onLatest.map((s) => ({
      priority: s.provider.priority,
      records: s.result.records.filter((r) => r.date === latestDate),
    })),
  );
  const records = merged.records;

  await persist(records);

  let conflict = merged.conflict;
  if (benchmark && benchmark.date === latestDate && records[0]) {
    const spread =
      Math.abs(benchmark.modalPrice - records[0].modalPrice) /
      Math.max(benchmark.modalPrice, records[0].modalPrice);
    if (spread > 0.4) conflict = true;
  }

  const corroboratedBy = onLatest
    .filter((s) => s.provider.id !== primary.provider.id)
    .map((s) => s.provider.name);
  if (benchmark && benchmark.date === latestDate) {
    corroboratedBy.push("CEDA Agmarknet open research API");
  }

  return {
    records,
    attempts,
    providerId: primary.provider.id,
    source: records[0]?.source ?? primary.provider.name,
    archive: primary.provider.archive,
    latestDate,
    sourceUpdatedAt: primary.result.sourceUpdatedAt,
    fetchedAt: records[0]?.fetchedAt ?? new Date().toISOString(),
    freshness: computeFreshness({
      dataDate: latestDate,
      sourceUpdatedAt: primary.provider.archive ? null : primary.result.sourceUpdatedAt,
    }),
    corroboratedBy,
    consensus: conflict ? "conflict" : corroboratedBy.length > 0 ? "corroborated" : "single",
  };
}
