import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  commodity: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(60),
  district: z.string().trim().max(60).optional(),
  market: z.string().trim().max(80).optional(),
});

export type MandiRecord = {
  commodity: string;
  variety: string | null;
  state: string;
  district: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  /** Official reporting (arrival) date of this price, ISO yyyy-MM-dd. */
  arrivalDate: string;
};

export type MandiPricesResult =
  | {
      ok: true;
      records: MandiRecord[];
      /** Newest reporting date present in this result set (yyyy-MM-dd) or "". */
      latestDate: string;
      /** When data.gov.in last published/refreshed the dataset (ISO). */
      sourceUpdatedAt: string | null;
      /** When MarketMitra performed this fetch (ISO) — never shown as the price date. */
      fetchedAt: string;
      source: string;
    }
  | { ok: false; error: string; code: "no_key" | "upstream" | "network" };

/** "Variety-wise Daily Market Prices Data of Commodity" — AGMARKNET via data.gov.in. */
const RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
const SOURCE = "AGMARKNET · Government of India";

function pick(row: Record<string, unknown>, ...keys: string[]) {
  const normalized = new Map<string, unknown>();
  for (const [k, v] of Object.entries(row)) {
    normalized.set(k.toLowerCase().replace(/[^a-z]/g, ""), v);
  }
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase().replace(/[^a-z]/g, ""));
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

/** Agmarknet returns dd/MM/yyyy */
function toIsoDate(value: string) {
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const iso = value.match(/^\d{4}-\d{2}-\d{2}/);
  return iso ? value.slice(0, 10) : "";
}

type ApiPayload = {
  records?: Record<string, unknown>[];
  updated_date?: string;
  updated?: number;
};

/**
 * The dataset is the full AGMARKNET archive (80M+ rows) and its default order
 * is by market/commodity, NOT by date — so a plain filtered query returns the
 * OLDEST rows. `sort[Arrival_Date]=desc` is essential: without it the app shows
 * years-old prices. Field ids are case-sensitive (Commodity, State, District,
 * Market).
 */
function buildUrl(
  apiKey: string,
  filters: { commodity: string; state: string; district?: string | undefined; market?: string | undefined },
  limit: number,
) {
  const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort[Arrival_Date]", "desc");
  url.searchParams.set("filters[Commodity]", filters.commodity);
  url.searchParams.set("filters[State]", filters.state);
  if (filters.district) url.searchParams.set("filters[District]", filters.district);
  if (filters.market) url.searchParams.set("filters[Market]", filters.market);
  return url;
}

function parseRecords(payload: ApiPayload): MandiRecord[] {
  return (payload.records ?? [])
    .map((row) => {
      const variety = pick(row, "variety");
      return {
        commodity: pick(row, "commodity"),
        variety: variety || null,
        state: pick(row, "state"),
        district: pick(row, "district"),
        market: pick(row, "market"),
        minPrice: Number(pick(row, "min_price", "minprice")),
        maxPrice: Number(pick(row, "max_price", "maxprice")),
        modalPrice: Number(pick(row, "modal_price", "modalprice")),
        arrivalDate: toIsoDate(pick(row, "arrival_date", "arrivaldate")),
      };
    })
    .filter(
      (r) =>
        r.market &&
        r.arrivalDate &&
        Number.isFinite(r.modalPrice) &&
        r.modalPrice > 0 &&
        Number.isFinite(r.minPrice) &&
        Number.isFinite(r.maxPrice),
    )
    .sort((a, b) =>
      a.arrivalDate === b.arrivalDate ? b.modalPrice - a.modalPrice : a.arrivalDate < b.arrivalDate ? 1 : -1,
    );
}

function sourceUpdatedAt(payload: ApiPayload): string | null {
  if (payload.updated_date) {
    const parsed = new Date(payload.updated_date);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  if (typeof payload.updated === "number") {
    return new Date(payload.updated * 1000).toISOString();
  }
  return null;
}

async function persist(records: MandiRecord[]) {
  if (records.length === 0) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("market_prices").upsert(
    records.map((r) => ({
      commodity: r.commodity,
      variety: r.variety,
      state: r.state,
      district: r.district,
      market: r.market,
      min_price: r.minPrice,
      max_price: r.maxPrice,
      modal_price: r.modalPrice,
      arrival_date: r.arrivalDate,
      fetched_at: new Date().toISOString(),
    })),
    { onConflict: "commodity,state,district,market,variety,arrival_date" },
  );
  if (error) console.error("market_prices upsert failed", error.message);
}

export const fetchMandiPrices = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<MandiPricesResult> => {
    const apiKey = process.env["DATA_GOV_IN_API_KEY"];
    if (!apiKey) {
      return { ok: false, code: "no_key", error: "Market price service is not configured yet." };
    }

    const request = async (filters: Parameters<typeof buildUrl>[1]) => {
      const response = await fetch(buildUrl(apiKey, filters, 250), {
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        const body = await response.text();
        console.error(`data.gov.in request failed [${response.status}]: ${body.slice(0, 400)}`);
        throw new Error(String(response.status));
      }
      return (await response.json()) as ApiPayload;
    };

    let payload: ApiPayload;
    try {
      payload = await request(data);
      // District filters can be narrow or spelled differently in AGMARKNET.
      // Widen to the state (still the same official source) rather than showing nothing.
      if ((payload.records?.length ?? 0) === 0 && data.district && !data.market) {
        payload = await request({ commodity: data.commodity, state: data.state });
      }
    } catch (error) {
      const status = (error as Error).message;
      if (status === "403" || status === "401") {
        return {
          ok: false,
          code: "upstream",
          error: "The government market price service rejected the request.",
        };
      }
      if (/^\d+$/.test(status)) {
        return {
          ok: false,
          code: "upstream",
          error: "The government market price service is temporarily unavailable.",
        };
      }
      console.error("data.gov.in network error", error);
      return { ok: false, code: "network", error: "Could not reach the market price service." };
    }

    const records = parseRecords(payload);
    await persist(records);

    return {
      ok: true,
      records,
      latestDate: records[0]?.arrivalDate ?? "",
      sourceUpdatedAt: sourceUpdatedAt(payload),
      fetchedAt: new Date().toISOString(),
      source: SOURCE,
    };
  });

const historySchema = z.object({
  commodity: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(60),
  market: z.string().trim().min(1).max(80),
});

export type PricePoint = { date: string; min: number; max: number; modal: number };

/**
 * Real reported history for one mandi, straight from AGMARKNET (newest first,
 * returned oldest-first for charting). Falls back to previously stored official
 * records if the API is unreachable — never to generated values.
 */
export const fetchPriceHistory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => historySchema.parse(data))
  .handler(async ({ data }): Promise<{ points: PricePoint[] }> => {
    const apiKey = process.env["DATA_GOV_IN_API_KEY"];
    const byDate = new Map<string, PricePoint>();

    if (apiKey) {
      try {
        const response = await fetch(
          buildUrl(apiKey, { commodity: data.commodity, state: data.state, market: data.market }, 60),
          { headers: { accept: "application/json" } },
        );
        if (response.ok) {
          for (const r of parseRecords((await response.json()) as ApiPayload)) {
            if (!byDate.has(r.arrivalDate)) {
              byDate.set(r.arrivalDate, {
                date: r.arrivalDate,
                min: r.minPrice,
                max: r.maxPrice,
                modal: r.modalPrice,
              });
            }
          }
        }
      } catch (error) {
        console.error("price history fetch failed", error);
      }
    }

    if (byDate.size === 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin
        .from("market_prices")
        .select("arrival_date, min_price, max_price, modal_price")
        .eq("commodity", data.commodity)
        .eq("state", data.state)
        .eq("market", data.market)
        .order("arrival_date", { ascending: false })
        .limit(60);
      if (error) console.error("price history read failed", error.message);
      for (const row of rows ?? []) {
        if (byDate.has(row.arrival_date)) continue;
        byDate.set(row.arrival_date, {
          date: row.arrival_date,
          min: Number(row.min_price),
          max: Number(row.max_price),
          modal: Number(row.modal_price),
        });
      }
    }

    return { points: [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1)) };
  });
