/**

 * Market price provider abstraction.

 *

 * Every provider returns the SAME normalized record shape, so the frontend and

 * Mitra AI never care which source answered. Providers are tried in priority

 * order; each attempt is logged for admin diagnostics. Nothing here ever

 * invents, averages across dates, or synthesises a price.

 */

import {
  computeFreshness,
  isCurrentMarketDate,
  istToday,
  type Freshness,
} from "./market-freshness";

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

  fetch: (filters: MarketFilters, deadlineAtMs?: number) => Promise<ProviderResult>;
};

const DATA_GOV_REQUEST_BUDGET_MS = 45_000;

/* ------------------------------------------------------------------ helpers */

type DataGovErrorKind = "timeout" | "network" | "http" | "invalid_json" | "request";

class DataGovRequestError extends Error {
  constructor(
    readonly kind: DataGovErrorKind,
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = "DataGovRequestError";
  }
}

const TRANSIENT_NETWORK_CODES = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function getNetworkErrorCode(error: unknown) {
  if (!(error instanceof Error) || !error.cause || typeof error.cause !== "object") return null;
  const code = (error.cause as { code?: unknown }).code;
  return typeof code === "string" && TRANSIENT_NETWORK_CODES.has(code) ? code : null;
}

function isTransientNetworkError(error: unknown) {
  return error instanceof TypeError || getNetworkErrorCode(error) !== null;
}

function isTimeoutError(error: unknown, signal: AbortSignal) {
  return (
    signal.aborted ||
    (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError"))
  );
}

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

export function toIsoDate(value: string) {
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const dashedDmy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const isoTimestamp = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/i,
  );
  const parts = dmy
    ? [dmy[3]!, dmy[2]!, dmy[1]!]
    : dashedDmy
      ? [dashedDmy[3]!, dashedDmy[2]!, dashedDmy[1]!]
      : isoDate
        ? [isoDate[1]!, isoDate[2]!, isoDate[3]!]
        : isoTimestamp
          ? [isoTimestamp[1]!, isoTimestamp[2]!, isoTimestamp[3]!]
          : null;
  if (!parts) return "";
  const [year, month, day] = parts.map(Number);
  const parsedDate = new Date(Date.UTC(year!, month! - 1, day!));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month! - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return "";
  }

  if (!isoTimestamp || isoDate) return `${parts[0]}-${parts[1]}-${parts[2]}`;

  const normalizedTimestamp = value.replace(" ", "T");
  const timestamp = isoTimestamp[4] ? normalizedTimestamp : `${normalizedTimestamp}+05:30`;
  const instant = new Date(timestamp);
  if (Number.isNaN(instant.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(instant);
}

function datasetUpdatedAt(payload: Record<string, unknown>): string | null {
  const updatedDate = pick(payload, "updated_date", "updated_at");
  if (updatedDate) {
    const parsed = new Date(updatedDate);

    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  const updated = Number(pick(payload, "updated"));
  if (Number.isFinite(updated) && updated > 0)
    return new Date(updated < 10_000_000_000 ? updated * 1000 : updated).toISOString();

  return null;
}

function payloadRows(payload: unknown, depth = 0): Record<string, unknown>[] {
  if (Array.isArray(payload))
    return payload.filter(
      (row): row is Record<string, unknown> =>
        Boolean(row) && typeof row === "object" && !Array.isArray(row),
    );
  if (!payload || typeof payload !== "object" || depth > 3) return [];

  const object = payload as Record<string, unknown>;
  for (const key of ["records", "data", "result", "response", "results", "prices", "rows"]) {
    const value = Object.entries(object).find(
      ([field]) => normalizedName(field) === normalizedName(key),
    )?.[1];
    if (Array.isArray(value)) {
      const rows = payloadRows(value, depth + 1);
      if (rows.length > 0) return rows;
    }
    if (value && typeof value === "object") {
      const rows = payloadRows(value, depth + 1);
      if (rows.length > 0) return rows;
    }
  }
  return [];
}

function hasRowsCollection(payload: unknown, depth = 0): boolean {
  if (Array.isArray(payload))
    return payload.every((row) => Boolean(row) && typeof row === "object" && !Array.isArray(row));
  if (!payload || typeof payload !== "object" || depth > 3) return false;

  const object = payload as Record<string, unknown>;
  for (const key of ["records", "data", "result", "response", "results", "prices", "rows"]) {
    const value = Object.entries(object).find(
      ([field]) => normalizedName(field) === normalizedName(key),
    )?.[1];
    if (
      (Array.isArray(value) &&
        value.every((row) => Boolean(row) && typeof row === "object" && !Array.isArray(row))) ||
      (value && hasRowsCollection(value, depth + 1))
    ) {
      return true;
    }
  }
  return false;
}

function numericValue(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const normalized = /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(trimmed)
    ? trimmed.replace(/,/g, "")
    : trimmed;
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const normalizedName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const DISTRICT_ALIASES: string[][] = [
  ["Nashik", "Nasik"],

  ["Chhatrapati Sambhajinagar", "Chattrapati Sambhajinagar", "Aurangabad"],

  ["Ahilyanagar", "Ahmednagar"],

  ["Dharashiv", "Osmanabad"],

  ["Gurugram", "Gurgaon"],

  ["Prayagraj", "Allahabad"],

  ["Ayodhya", "Faizabad"],

  ["Bengaluru Urban", "Bangalore Urban", "Bangalore"],

  ["Mysuru", "Mysore"],

  ["Belagavi", "Belgaum"],

  ["Kalaburagi", "Gulbarga"],

  ["Vijayapura", "Bijapur"],

  ["Ballari", "Bellary"],

  ["Shivamogga", "Shimoga"],

  ["Tumakuru", "Tumkur"],
];

function titleCase(value: string) {
  return value

    .trim()

    .toLowerCase()

    .replace(/(^|[\s()-])\p{L}/gu, (letter) => letter.toUpperCase());
}

function districtVariants(value: string) {
  const normalized = normalizedName(value);

  const aliases = DISTRICT_ALIASES.find((group) =>
    group.some((candidate) => normalizedName(candidate) === normalized),
  );

  return [...new Set([titleCase(value), ...(aliases ?? [])])];
}

const looseEq = (a: string, b: string) => normalizedName(a) === normalizedName(b);

function districtEq(a: string, b: string) {
  const accepted = districtVariants(b).map(normalizedName);

  return accepted.includes(normalizedName(a));
}

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
    (!filters.district || districtEq(record.district, filters.district)) &&
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
  const records = rows.map<PriceRecord | null>((row) => {
    const minPrice = numericValue(pick(row, "min_price", "minprice"));
    const maxPrice = numericValue(pick(row, "max_price", "maxprice"));
    const modalPrice = numericValue(pick(row, "modal_price", "modalprice"));
    const date = toIsoDate(pick(row, "arrival_date", "arrivaldate", "date"));
    if (minPrice == null || maxPrice == null || modalPrice == null || !date) return null;

    const arrival = numericValue(pick(row, "arrivals", "arrival", "tonnes"));

    return {
      providerId: meta.providerId,

      source: meta.source,

      commodity: pick(row, "commodity"),

      variety: pick(row, "variety") || null,

      grade: pick(row, "grade") || null,

      state: pick(row, "state"),

      district: pick(row, "district"),

      market: pick(row, "market"),

      date,

      arrival: arrival != null && arrival > 0 ? arrival : null,

      minPrice,

      maxPrice,

      modalPrice,

      currency: "INR",

      fetchedAt: meta.fetchedAt,

      sourceUpdatedAt: meta.sourceUpdatedAt,
    };
  });

  return dedupe(
    sortRecords(
      records.filter((record): record is PriceRecord => record !== null && isValid(record)),
    ),
  );
}

async function getJson(url: URL, deadlineAtMs?: number) {
  const method = "GET";
  const timeoutMs = 15_000;
  const retryDelayMs = 300;
  const maxAttempts = 2;
  const startedAt = Date.now();
  const requestDeadlineAtMs = deadlineAtMs ?? startedAt + DATA_GOV_REQUEST_BUDGET_MS;
  const cacheUrl = new URL(url);
  cacheUrl.searchParams.delete("api-key");
  const cacheKey = cacheUrl.toString();
  const cached = dataGovCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { payload: cached.payload, statusCode: cached.statusCode };
  }
  if (cached) dataGovCache.delete(cacheKey);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const remainingMs = requestDeadlineAtMs - Date.now();
    if (remainingMs <= 0) {
      console.error("[market] data.gov.in request budget exhausted", {
        hostname: url.hostname,
        pathname: url.pathname,
        elapsedMs: Date.now() - startedAt,
      });
      throw new DataGovRequestError("timeout", "data.gov.in request timed out");
    }

    const attemptTimeoutMs = Math.min(timeoutMs, remainingMs);
    const signal = AbortSignal.timeout(attemptTimeoutMs);
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: { accept: "application/json" },
        signal,
      });
    } catch (error) {
      const retryable = isTimeoutError(error, signal) || isTransientNetworkError(error);
      const kind = isTimeoutError(error, signal) ? "timeout" : retryable ? "network" : "request";
      const causeCode = getNetworkErrorCode(error);
      const hasRetryBudget = requestDeadlineAtMs - Date.now() >= retryDelayMs + timeoutMs;
      const willRetry = retryable && attempt < maxAttempts && hasRetryBudget;
      console.error("[market] data.gov.in request diagnostic", {
        hostname: url.hostname,
        pathname: url.pathname,
        method,
        failure: kind,
        attempt,
        willRetry,
        timeoutMs: attemptTimeoutMs,
        elapsedMs: Date.now() - startedAt,
        causeCode,
      });
      if (willRetry) {
        await new Promise<void>((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }
      throw new DataGovRequestError(
        kind,
        kind === "timeout"
          ? "data.gov.in request timed out"
          : kind === "network"
            ? `data.gov.in network request failed${causeCode ? ` (${causeCode})` : ""}`
            : "data.gov.in request failed",
      );
    }

    if (!response.ok) {
      console.error("[market] data.gov.in HTTP error", {
        hostname: url.hostname,
        pathname: url.pathname,
        statusCode: response.status,
      });
      throw new DataGovRequestError(
        "http",
        `data.gov.in responded with HTTP ${response.status}`,
        response.status,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      const timeout = isTimeoutError(error, signal);
      const network = !timeout && isTransientNetworkError(error);
      const kind = timeout ? "timeout" : network ? "network" : "invalid_json";
      const hasRetryBudget = requestDeadlineAtMs - Date.now() >= retryDelayMs + timeoutMs;
      const willRetry = (timeout || network) && attempt < maxAttempts && hasRetryBudget;
      console.error("[market] data.gov.in response diagnostic", {
        hostname: url.hostname,
        pathname: url.pathname,
        failure: kind,
        attempt,
        willRetry,
        statusCode: response.status,
        timeoutMs: attemptTimeoutMs,
        elapsedMs: Date.now() - startedAt,
      });
      if (willRetry) {
        await new Promise<void>((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }
      throw new DataGovRequestError(
        kind,
        kind === "timeout"
          ? "data.gov.in request timed out"
          : kind === "network"
            ? "data.gov.in response network error"
            : "data.gov.in returned invalid JSON",
        response.status,
      );
    }

    if (!hasRowsCollection(payload)) {
      throw new DataGovRequestError(
        "invalid_json",
        "data.gov.in returned an unexpected response structure",
        response.status,
      );
    }

    if (dataGovCache.size >= 100) {
      const firstKey = dataGovCache.keys().next().value;
      if (firstKey) dataGovCache.delete(firstKey);
    }
    dataGovCache.set(cacheKey, {
      payload,
      statusCode: response.status,
      expiresAt: Date.now() + 15 * 60_000,
    });
    return { payload, statusCode: response.status };
  }

  throw new DataGovRequestError("request", "data.gov.in request failed");
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
const AGMARKNET_KEY_ENV = "AGMARKNET_API_KEY";
const AGMARKNET_PAGE_SIZE = 1000;
const AGMARKNET_MAX_RECORDS = 5000;

const dataGovCache = new Map<string, { payload: unknown; statusCode: number; expiresAt: number }>();

function getAgmarknetApiKey() {
  return process.env[AGMARKNET_KEY_ENV]?.trim() || null;
}

function buildAgmarknetUrl(
  resourceId: string,
  apiKey: string,
  filters: MarketFilters,
  limit: number,
  offset: number,
  arrivalDate?: string,
) {
  const url = new URL(`https://api.data.gov.in/resource/${resourceId}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  if (resourceId === AGMARKNET_VARIETY) {
    url.searchParams.set("sort[Arrival_Date]", "desc");
    if (filters.commodity) url.searchParams.set("filters[Commodity]", titleCase(filters.commodity));
    if (filters.state) url.searchParams.set("filters[State]", titleCase(filters.state));
    if (filters.district) url.searchParams.set("filters[District]", titleCase(filters.district));
    if (filters.market) url.searchParams.set("filters[Market]", titleCase(filters.market));
    if (arrivalDate) url.searchParams.set("filters[Arrival_Date]", arrivalDate);
  }
  return url;
}

async function fetchAgmarknetRows(
  resourceId: string,
  apiKey: string,
  filters: MarketFilters,
  maxRecords: number,
  arrivalDate?: string,
  deadlineAtMs?: number,
) {
  const rows: Record<string, unknown>[] = [];
  let payload: unknown = null;
  let statusCode: number | null = null;
  const limit = Math.min(AGMARKNET_PAGE_SIZE, maxRecords);
  const requestDeadlineAtMs = deadlineAtMs ?? Date.now() + DATA_GOV_REQUEST_BUDGET_MS;

  for (let offset = 0; offset < maxRecords; offset += limit) {
    const response = await getJson(
      buildAgmarknetUrl(resourceId, apiKey, filters, limit, offset, arrivalDate),
      requestDeadlineAtMs,
    );
    payload = response.payload;
    statusCode = response.statusCode;
    const pageRows = payloadRows(payload);
    rows.push(...pageRows);

    const total =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? numericValue((payload as Record<string, unknown>)["total"])
        : null;
    if (
      pageRows.length < limit ||
      rows.length >= maxRecords ||
      (total !== null && rows.length >= total)
    ) {
      break;
    }
  }

  return { rows, payload, statusCode };
}

export async function fetchAgmarknetHistory(filters: MarketFilters): Promise<PriceRecord[]> {
  const apiKey = getAgmarknetApiKey();
  if (!apiKey) throw new Error(`${AGMARKNET_KEY_ENV} is not configured`);

  const fetchedAt = new Date().toISOString();
  const result = await fetchAgmarknetRows(AGMARKNET_VARIETY, apiKey, filters, 60);
  return normalizeRows(result.rows, {
    providerId: "agmarknet_variety",
    source: "AGMARKNET · Government of India",
    sourceUpdatedAt: datasetUpdatedAt((result.payload ?? {}) as Record<string, unknown>),
    fetchedAt,
  }).filter((record) => matchesMarketFilters(record, filters));
}

export async function probeAgmarknet() {
  const startedAt = Date.now();
  const apiKey = getAgmarknetApiKey();
  if (!apiKey) {
    return {
      ok: false,
      statusCode: null,
      latencyMs: null,
      records: null,
      latestArrivalDate: null,
      sourceUpdatedAt: null,
      detail: `${AGMARKNET_KEY_ENV} is not configured`,
    };
  }

  try {
    const response = await getJson(
      buildAgmarknetUrl(AGMARKNET_VARIETY, apiKey, { commodity: "", state: "" }, 1, 0),
    );
    const payload =
      response.payload && typeof response.payload === "object" && !Array.isArray(response.payload)
        ? (response.payload as Record<string, unknown>)
        : {};
    const firstRecord = payloadRows(payload)[0];
    return {
      ok: true,
      statusCode: response.statusCode,
      latencyMs: Date.now() - startedAt,
      records: numericValue(payload["total"]),
      latestArrivalDate: firstRecord
        ? toIsoDate(pick(firstRecord, "arrival_date", "date")) || null
        : null,
      sourceUpdatedAt: datasetUpdatedAt(payload),
      detail: "Latest record read directly from the government dataset",
    };
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: unknown }).statusCode)
        : null;
    return {
      ok: false,
      statusCode: Number.isFinite(statusCode) ? statusCode : null,
      latencyMs: Date.now() - startedAt,
      records: null,
      latestArrivalDate: null,
      sourceUpdatedAt: null,
      detail: statusCode
        ? `Government market data source responded with HTTP ${statusCode}`
        : "Could not reach the government market data source",
    };
  }
}

const agmarknetVariety: Provider = {
  id: "agmarknet_variety",

  name: "AGMARKNET · Variety-wise daily prices (data.gov.in)",

  priority: 2,

  envKey: AGMARKNET_KEY_ENV,

  coverage: "All states · full mandi archive · daily",

  archive: false,

  async fetch(filters, deadlineAtMs) {
    const apiKey = getAgmarknetApiKey();

    if (!apiKey) throw new Error("missing_api_key");

    const fetchedAt = new Date().toISOString();

    const request = (f: MarketFilters, arrivalDate?: string, limit = AGMARKNET_MAX_RECORDS) =>
      fetchAgmarknetRows(AGMARKNET_VARIETY, apiKey, f, limit, arrivalDate, deadlineAtMs);

    const districtAttempts = filters.district ? districtVariants(filters.district) : [undefined];

    let payload: unknown = null;

    let statusCode: number | null = null;

    let rows: Record<string, unknown>[] = [];

    for (const district of districtAttempts) {
      const response = await request({ ...filters, ...(district ? { district } : {}) });

      payload = response.payload;

      statusCode = response.statusCode;

      rows = response.rows;

      if (rows.length > 0) break;
    }

    // Geocoders and the official dataset often use different district spellings.
    // Retry without a server-side district filter, then strictly re-check every row below before it can reach the UI.
    if (rows.length === 0 && filters.district) {
      const fallbackFilters = { commodity: filters.commodity, state: filters.state };
      const fallback = await request(fallbackFilters, undefined, AGMARKNET_MAX_RECORDS);
      payload = fallback.payload;
      statusCode = fallback.statusCode;
      rows = fallback.rows;
    }

    const sourceUpdatedAt = datasetUpdatedAt((payload ?? {}) as { updated_date?: string });
    const records = normalizeRows(rows, {
      providerId: this.id,

      source: "AGMARKNET · Government of India",

      sourceUpdatedAt,

      fetchedAt,
    });
    if (rows.length > 0 && records.length === 0) {
      throw new DataGovRequestError(
        "invalid_json",
        "data.gov.in returned no usable market-price records",
        statusCode ?? undefined,
      );
    }

    return {
      records,

      sourceUpdatedAt,

      statusCode,
    };
  },
};

const agmarknetDaily: Provider = {
  id: "agmarknet_daily",

  name: "AGMARKNET · Current daily mandi prices (data.gov.in)",

  priority: 3,

  envKey: AGMARKNET_KEY_ENV,

  coverage: "Today's published snapshot · matched in memory",

  archive: false,

  async fetch(filters, deadlineAtMs) {
    const apiKey = getAgmarknetApiKey();

    if (!apiKey) throw new Error("missing_api_key");

    const fetchedAt = new Date().toISOString();

    // This resource ignores server-side filters, so we strictly match all

    // requested location and crop fields ourselves.

    const url = buildAgmarknetUrl(AGMARKNET_DAILY, apiKey, filters, AGMARKNET_MAX_RECORDS, 0);

    const { payload, statusCode } = await getJson(url, deadlineAtMs);

    const rows = ((payload as { records?: Record<string, unknown>[] }).records ?? []).filter(
      (row) =>
        looseEq(pick(row, "commodity"), filters.commodity) &&
        looseEq(pick(row, "state"), filters.state) &&
        (!filters.district || districtEq(pick(row, "district"), filters.district)) &&
        (!filters.market || looseEq(pick(row, "market"), filters.market)),
    );

    const sourceUpdatedAt = datasetUpdatedAt(payload as { updated_date?: string });
    const records = normalizeRows(rows, {
      providerId: this.id,

      source: "AGMARKNET daily snapshot · Government of India",

      sourceUpdatedAt,

      fetchedAt,
    });
    if (rows.length > 0 && records.length === 0) {
      throw new DataGovRequestError(
        "invalid_json",
        "data.gov.in returned no usable market-price records",
        statusCode ?? undefined,
      );
    }

    return {
      records,

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

      .select(
        "commodity, variety, state, district, market, min_price, max_price, modal_price, arrival_date",
      )

      .eq("commodity", filters.commodity)

      .eq("state", filters.state)

      .gte(
        "arrival_date",
        (() => {
          const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
            new Date(),
          );

          const yesterday = new Date(`${today}T00:00:00Z`);

          yesterday.setUTCDate(yesterday.getUTCDate() - 1);

          return yesterday.toISOString().slice(0, 10);
        })(),
      )

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

const CEDA_ID = "ceda_agmarknet";
const CEDA_BASE = "https://agmarknet.ceda.ashoka.edu.in/api";

const STATE_ALIASES: Record<string, string> = {
  chattisgarh: "chhattisgarh",
  jammuandkashmir: "jammukashmir",
  pondicherry: "puducherry",
  uttrakhand: "uttarakhand",
};

function findCedaState(states: { id: number; name: string }[], stateName: string) {
  const normTarget = normalizedName(stateName);
  const aliased = STATE_ALIASES[normTarget] || normTarget;
  const match = states.find((s) => looseEq(s.name, stateName) || looseEq(s.name, aliased));
  if (match) return match;
  return states.find((s) => {
    const sNorm = normalizedName(s.name);
    return sNorm.includes(aliased) || aliased.includes(sNorm);
  });
}

const cedaAgmarknet: Provider = {
  id: CEDA_ID,
  name: "CEDA Agmarknet open research API",
  priority: 1,
  envKey: null,
  coverage: "State and district daily averages (CEDA AGMARKNET open data)",
  archive: false,
  async fetch(filters) {
    if (filters.market) {
      return { records: [], sourceUpdatedAt: null, statusCode: 200 };
    }

    const lookup = await loadCedaLookup();

    const stateMatch = findCedaState(lookup.states, filters.state);
    if (!stateMatch) {
      return { records: [], sourceUpdatedAt: null, statusCode: 200 };
    }

    let commMatch = lookup.commodities.find((c) => looseEq(c.name, filters.commodity));
    if (!commMatch && filters.commodity.includes("(")) {
      const cleanName = filters.commodity.split("(")[0]!.trim();
      commMatch = lookup.commodities.find(
        (c) => looseEq(c.name, cleanName) || c.name.toLowerCase().includes(cleanName.toLowerCase()),
      );
    }
    if (!commMatch) {
      return { records: [], sourceUpdatedAt: null, statusCode: 200 };
    }

    let districtMatch: CedaDistrict | null = null;
    if (filters.district) {
      const districts = await loadCedaDistricts(stateMatch.id);
      districtMatch =
        districts.find((district) => districtEq(district.name, filters.district!)) ?? null;
      if (!districtMatch) return { records: [], sourceUpdatedAt: null, statusCode: 200 };
    }

    const endDate = istToday();
    const startDate = new Date(`${endDate}T00:00:00Z`);
    startDate.setUTCDate(startDate.getUTCDate() - 1);
    const response = await fetch(`${CEDA_BASE}/prices`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        state_id: stateMatch.id,
        commodity_id: commMatch.id,
        district_id: districtMatch?.id ?? null,
        calculation_type: "d",
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const error = new Error(`HTTP ${response.status}`) as Error & { statusCode: number };
      error.statusCode = response.status;
      console.error(`[market] CEDA prices failed ${response.status}: ${body.slice(0, 300)}`);
      throw error;
    }

    const payload = await response.json();
    const sourceUpdatedAt =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? datasetUpdatedAt(payload as Record<string, unknown>)
        : null;
    const fetchedAt = new Date().toISOString();

    return {
      records: normalizeCedaPriceRecords(payload, {
        filters,
        stateName: stateMatch.name,
        districtName: districtMatch?.name ?? null,
        fetchedAt,
        sourceUpdatedAt,
      }),
      sourceUpdatedAt,
      statusCode: response.status,
    };
  },
};

export const providers: Provider[] = [
  agmarknetVariety,
  agmarknetDaily,
  cedaAgmarknet,
  storedArchive,
].sort((a, b) => a.priority - b.priority);

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

/* ---------------------------------------------------------- CEDA provider */

/**
 * CEDA (Centre for Economic Data & Analysis, Ashoka University) publishes an
 * open, keyless API over official AGMARKNET reporting, aggregated to
 * state- or district-level daily averages. It does not provide mandi-level
 * prices, so those averages are labelled by their actual aggregation level.
 */
type CedaLookup = {
  states: { id: number; name: string }[];
  commodities: { id: number; name: string }[];
};

let cedaLookup: { at: number; value: CedaLookup } | null = null;

async function loadCedaLookup(): Promise<CedaLookup> {
  if (cedaLookup && Date.now() - cedaLookup.at < 6 * 3600_000) return cedaLookup.value;

  const [statesRes, commoditiesRes] = await Promise.all([
    fetch(`${CEDA_BASE}/states`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(6_000),
    }),
    fetch(`${CEDA_BASE}/commodities`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(6_000),
    }),
  ]);

  if (!statesRes.ok || !commoditiesRes.ok) {
    throw new Error(
      `CEDA lookup failed (states=${statesRes.status}, commodities=${commoditiesRes.status})`,
    );
  }

  const [statesPayload, commoditiesPayload] = await Promise.all([
    statesRes.json(),
    commoditiesRes.json(),
  ]);

  const value: CedaLookup = {
    states: payloadRows(statesPayload)
      .map((row) => ({
        id: numericValue(pick(row, "census_state_id", "state_id", "id")),
        name: pick(row, "census_state_name", "state_name", "name"),
      }))
      .filter((row): row is { id: number; name: string } => row.id != null && Boolean(row.name)),
    commodities: payloadRows(commoditiesPayload)
      .map((row) => ({
        id: numericValue(pick(row, "commodity_id", "id")),
        name: pick(row, "commodity_disp_name", "commodity_name", "name"),
      }))
      .filter((row): row is { id: number; name: string } => row.id != null && Boolean(row.name)),
  };

  if (value.states.length === 0 || value.commodities.length === 0)
    throw new Error("CEDA lookup returned no usable states or commodities");

  cedaLookup = { at: Date.now(), value };

  return value;
}

type CedaDistrict = { id: number; name: string };

async function loadCedaDistricts(stateId: number): Promise<CedaDistrict[]> {
  const response = await fetch(`${CEDA_BASE}/districts?state_id=${stateId}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`CEDA district lookup failed (HTTP ${response.status})`);

  return payloadRows(await response.json())
    .map((row) => ({
      id: numericValue(pick(row, "census_district_id", "district_id", "id")),
      name: pick(row, "census_district_name", "district_name", "name"),
    }))
    .filter((row): row is CedaDistrict => row.id != null && Boolean(row.name));
}

export function normalizeCedaPriceRecords(
  payload: unknown,
  options: {
    filters: MarketFilters;
    stateName: string;
    districtName: string | null;
    providerId?: string;
    fetchedAt: string;
    sourceUpdatedAt: string | null;
  },
): PriceRecord[] {
  const rows = payloadRows(payload);
  const records = rows.map<PriceRecord | null>((row) => {
    const date = toIsoDate(pick(row, "t", "arrival_date", "date"));
    const minPrice = numericValue(pick(row, "p_min", "min_price", "minPrice"));
    const maxPrice = numericValue(pick(row, "p_max", "max_price", "maxPrice"));
    const modalPrice = numericValue(pick(row, "p_modal", "modal_price", "modalPrice"));
    if (!date || minPrice == null || maxPrice == null || modalPrice == null) return null;

    const actualMarket = pick(row, "market", "mandi");
    if (options.filters.market && !looseEq(actualMarket, options.filters.market)) return null;
    if (options.filters.market && !actualMarket) return null;

    const district = pick(row, "district") || options.districtName || "All districts";
    const market =
      actualMarket ||
      (options.districtName
        ? `${options.districtName} District Average`
        : `${options.stateName} State Average`);

    return {
      providerId: options.providerId ?? CEDA_ID,
      source: "CEDA Agmarknet open research API",
      commodity: pick(row, "cmdty", "commodity") || options.filters.commodity,
      variety: pick(row, "variety") || null,
      grade: pick(row, "grade") || null,
      state: pick(row, "state") || options.stateName,
      district,
      market,
      date,
      arrival: numericValue(pick(row, "arrivals", "arrival")) ?? null,
      minPrice,
      maxPrice,
      modalPrice,
      currency: "INR",
      fetchedAt: options.fetchedAt,
      sourceUpdatedAt: options.sourceUpdatedAt,
    };
  });

  return dedupe(
    sortRecords(records.filter((row): row is PriceRecord => row != null && isValid(row))),
  );
}

/* --------------------------------------------------------------- aggregator */

export type Consensus = "single" | "corroborated" | "conflict";

export type AggregateResult = {
  records: PriceRecord[];

  /** Strict India-time reporting-day groups. Never contains any other date. */

  todayRecords: PriceRecord[];

  yesterdayRecords: PriceRecord[];

  todayAvailable: boolean;

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

    const { error } = await supabaseAdmin.from("api_fetch_logs").insert(
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
    if (error) console.error("[market] diagnostics log failed", error.message);
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

/** Keeps the newest eligible source record independently for each mandi. */
export function selectLatestPerMarket(records: PriceRecord[]) {
  const latest = new Map<string, PriceRecord>();

  for (const record of sortRecords(records)) {
    const key = marketKey(record);
    if (!latest.has(key)) latest.set(key, record);
  }

  return sortRecords([...latest.values()]);
}

/**

 * Queries every configured provider in PARALLEL and retains the newest eligible
 * record independently for each market — not whichever API answered first.

 * Records are normalized, validated, deduped across sources and cross-checked

 * by the source. Nothing is ever fabricated, averaged locally, or synthesized.

 */

export async function aggregateMarketPrices(filters: MarketFilters): Promise<AggregateResult> {
  const attempts: ProviderAttempt[] = [];

  const successes: { provider: Provider; result: ProviderResult }[] = [];
  const providerDeadlineAtMs = Date.now() + DATA_GOV_REQUEST_BUDGET_MS;

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

  await Promise.all(
    runnable.map(async (provider) => {
      const started = Date.now();

      try {
        const rawResult = await provider.fetch(filters, providerDeadlineAtMs);

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

          latestDataDate: result.records[0]?.date ?? rawResult.records[0]?.date ?? null,

          durationMs: Date.now() - started,

          error: result.records.length === 0 ? "No current records returned" : null,
        });

        if (result.records.length === 0) {
          console.warn("[market] provider returned no matching records", {
            provider: provider.id,
            failure: "empty_records",
            statusCode: result.statusCode,
          });
        }

        if (result.records.length > 0) successes.push({ provider, result });
      } catch (error) {
        const dataGovError = error instanceof DataGovRequestError ? error : null;
        const statusCode =
          dataGovError?.statusCode ??
          (error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode: unknown }).statusCode)
            : null);
        console.error("[market] provider fetch failed", {
          provider: provider.id,
          failure: dataGovError?.kind ?? "provider_error",
          statusCode: Number.isFinite(statusCode) ? statusCode : null,
        });

        attempts.push({
          providerId: provider.id,

          provider: provider.name,

          ok: false,

          statusCode: Number.isFinite(statusCode) ? statusCode : null,

          recordCount: 0,

          latestDataDate: null,

          durationMs: Date.now() - started,

          error: dataGovError?.message ?? "Provider request failed",
        });
      }
    }),
  );

  await logAttempts(attempts, filters);

  // Prefer live sources; stored official rows are eligible only inside the same

  // today/yesterday window already enforced above.

  const live = successes.filter((s) => !s.provider.archive);

  const pool = live.length > 0 ? live : successes;

  if (pool.length === 0) {
    const receivedEmptyResponses = attempts.some(
      (attempt) =>
        attempt.statusCode !== null &&
        attempt.statusCode >= 200 &&
        attempt.statusCode < 300 &&
        attempt.error === "No current records returned",
    );
    if (!receivedEmptyResponses) {
      const failures = attempts
        .filter((attempt) => attempt.error && attempt.error !== "No current records returned")
        .map(
          (attempt) =>
            `${attempt.providerId}${attempt.statusCode ? ` HTTP ${attempt.statusCode}` : ""}: ${attempt.error}`,
        );
      throw new Error(
        failures.length > 0
          ? `All market price providers failed: ${failures.join("; ")}`
          : "All market price providers failed to return a usable response",
      );
    }

    return {
      records: [],

      todayRecords: [],

      yesterdayRecords: [],

      todayAvailable: false,

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

  // Collect all distinct reporting dates across eligible records, ordered newest first
  const allDates = [...new Set(pool.flatMap((s) => s.result.records.map((record) => record.date)))]
    .sort()
    .reverse();

  if (allDates.length === 0) {
    return {
      records: [],
      todayRecords: [],
      yesterdayRecords: [],
      todayAvailable: false,
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

  const today = istToday();
  const yesterdayDate = new Date(`${today}T00:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const mergeDate = (date: string) =>
    mergeSameDate(
      pool
        .map((s) => ({
          priority: s.provider.priority,
          records: s.result.records.filter((record) => record.date === date),
        }))
        .filter((group) => group.records.length > 0),
    );

  const mergedByDate = new Map(allDates.map((date) => [date, mergeDate(date)]));
  const todayMerged = mergedByDate.get(today) ?? mergeDate(today);
  const yesterdayMerged = mergedByDate.get(yesterday) ?? mergeDate(yesterday);
  const todayRecords = todayMerged.records;
  const yesterdayRecords = yesterdayMerged.records;
  const todayAvailable = todayRecords.length > 0;

  // Determine latest actual reporting date
  const latestDate = todayAvailable
    ? today
    : yesterdayRecords.length > 0
      ? yesterday
      : allDates[0]!;

  const records = selectLatestPerMarket(
    [...mergedByDate.values()].flatMap((group) => group.records),
  );

  const onLatest = pool.filter((s) =>
    s.result.records.some((record) => record.date === latestDate),
  );

  const primary =
    [...onLatest].sort((a, b) => a.provider.priority - b.provider.priority)[0] ?? pool[0]!;

  await persist(records);

  const corroboratedBy = onLatest

    .filter((s) => s.provider.id !== primary.provider.id)

    .map((s) => s.provider.name);
  const selectedDates = new Set(records.map((record) => record.date));
  const hasConflict = [...selectedDates].some((date) => mergedByDate.get(date)?.conflict);

  return {
    records,

    todayRecords,

    yesterdayRecords,

    todayAvailable,

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

    consensus: hasConflict ? "conflict" : corroboratedBy.length > 0 ? "corroborated" : "single",
  };
}
