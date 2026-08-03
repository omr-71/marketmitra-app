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
  arrivalDate: string;
};

export type MandiPricesResult =
  | { ok: true; records: MandiRecord[]; updatedAt: string; source: string }
  | { ok: false; error: string; code: "no_key" | "upstream" | "network" };

const RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
const SOURCE = "Agmarknet · data.gov.in";

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

export const fetchMandiPrices = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<MandiPricesResult> => {
    const apiKey = process.env["DATA_GOV_IN_API_KEY"];
    if (!apiKey) {
      return {
        ok: false,
        code: "no_key",
        error: "Market price service is not configured yet.",
      };
    }

    const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "500");
    url.searchParams.set("filters[commodity]", data.commodity);
    url.searchParams.set("filters[state]", data.state);
    if (data.district) url.searchParams.set("filters[district]", data.district);
    if (data.market) url.searchParams.set("filters[market]", data.market);

    let payload: { records?: Record<string, unknown>[] };
    try {
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) {
        const body = await response.text();
        console.error(`data.gov.in request failed [${response.status}]: ${body.slice(0, 400)}`);
        return {
          ok: false,
          code: "upstream",
          error:
            response.status === 403
              ? "The market price service rejected the request. The API key needs to be checked."
              : "The government market price service is temporarily unavailable.",
        };
      }
      payload = (await response.json()) as { records?: Record<string, unknown>[] };
    } catch (error) {
      console.error("data.gov.in network error", error);
      return { ok: false, code: "network", error: "Could not reach the market price service." };
    }

    const records: MandiRecord[] = (payload.records ?? [])
      .map((row) => {
        const minPrice = Number(pick(row, "min_price", "minprice"));
        const maxPrice = Number(pick(row, "max_price", "maxprice"));
        const modalPrice = Number(pick(row, "modal_price", "modalprice"));
        const variety = pick(row, "variety");
        return {
          commodity: pick(row, "commodity"),
          variety: variety || null,
          state: pick(row, "state"),
          district: pick(row, "district"),
          market: pick(row, "market"),
          minPrice,
          maxPrice,
          modalPrice,
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
      .sort((a, b) => (a.arrivalDate === b.arrivalDate ? b.modalPrice - a.modalPrice : a.arrivalDate < b.arrivalDate ? 1 : -1));

    if (records.length > 0) {
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

    return { ok: true, records, updatedAt: new Date().toISOString(), source: SOURCE };
  });

const historySchema = z.object({
  commodity: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(60),
  market: z.string().trim().min(1).max(80),
});

export type PricePoint = { date: string; min: number; max: number; modal: number };

export const fetchPriceHistory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => historySchema.parse(data))
  .handler(async ({ data }): Promise<{ points: PricePoint[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("market_prices")
      .select("arrival_date, min_price, max_price, modal_price")
      .eq("commodity", data.commodity)
      .eq("state", data.state)
      .eq("market", data.market)
      .order("arrival_date", { ascending: false })
      .limit(60);

    if (error) {
      console.error("price history read failed", error.message);
      return { points: [] };
    }

    const byDate = new Map<string, PricePoint>();
    for (const row of rows ?? []) {
      if (byDate.has(row.arrival_date)) continue;
      byDate.set(row.arrival_date, {
        date: row.arrival_date,
        min: Number(row.min_price),
        max: Number(row.max_price),
        modal: Number(row.modal_price),
      });
    }

    return {
      points: [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1)),
    };
  });
