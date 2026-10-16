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

const SOURCE = "AGMARKNET · Government of India";

export const fetchMandiPrices = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<MandiPricesResult> => {
    const { aggregateMarketPrices, providerCatalogue } = await import("./market-providers.server");
    try {
      const result = await aggregateMarketPrices(data);
      if (result.records.length === 0) {
        const configured =
          providerCatalogue().find((provider) => provider.id === "agmarknet_variety")?.configured ??
          false;
        return {
          ok: false,
          code: configured ? "upstream" : "no_key",
          error: configured
            ? "No recent official mandi records are currently available."
            : "Market price service is not configured yet.",
        };
      }

      return {
        ok: true,
        records: result.records.map((record) => ({
          commodity: record.commodity,
          variety: record.variety,
          state: record.state,
          district: record.district,
          market: record.market,
          minPrice: record.minPrice,
          maxPrice: record.maxPrice,
          modalPrice: record.modalPrice,
          arrivalDate: record.date,
        })),
        latestDate: result.latestDate,
        sourceUpdatedAt: result.sourceUpdatedAt,
        fetchedAt: result.fetchedAt,
        source: result.source ?? SOURCE,
      };
    } catch (error) {
      console.error("market price service failed", error);
      return {
        ok: false,
        code: "upstream",
        error: "The government market price service is temporarily unavailable.",
      };
    }
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
    const byDate = new Map<string, PricePoint>();

    try {
      const { fetchAgmarknetHistory } = await import("./market-providers.server");
      const records = await fetchAgmarknetHistory(data);
      for (const record of records) {
        if (!byDate.has(record.date)) {
          byDate.set(record.date, {
            date: record.date,
            min: record.minPrice,
            max: record.maxPrice,
            modal: record.modalPrice,
          });
        }
      }
    } catch (error) {
      console.error("price history fetch failed", error);
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
