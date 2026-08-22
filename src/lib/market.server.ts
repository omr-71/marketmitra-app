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

type ApiPayload = {
  records?: Record<string, unknown>[];
  updated_date?: string;
  updated?: number;
};

const RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";

function pick(row: Record<string, unknown>, ...keys: string[]) {
  const normalized = new Map<string, unknown>();
  for (const [key, value] of Object.entries(row)) {
    normalized.set(key.toLowerCase().replace(/[^a-z]/g, ""), value);
  }
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase().replace(/[^a-z]/g, ""));
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function toIsoDate(value: string) {
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const iso = value.match(/^\d{4}-\d{2}-\d{2}/);
  return iso ? value.slice(0, 10) : "";
}

export function buildMandiUrl(
  apiKey: string,
  filters: { commodity: string; state: string; district?: string; market?: string },
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

export function parseMandiRecords(payload: ApiPayload): MandiRecord[] {
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
      (record) =>
        record.market &&
        record.arrivalDate &&
        Number.isFinite(record.modalPrice) &&
        record.modalPrice > 0 &&
        Number.isFinite(record.minPrice) &&
        Number.isFinite(record.maxPrice),
    )
    .sort((a, b) =>
      a.arrivalDate === b.arrivalDate
        ? b.modalPrice - a.modalPrice
        : a.arrivalDate < b.arrivalDate
          ? 1
          : -1,
    );
}

export function getSourceUpdatedAt(payload: ApiPayload): string | null {
  if (payload.updated_date) {
    const parsed = new Date(payload.updated_date);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  if (typeof payload.updated === "number") return new Date(payload.updated * 1000).toISOString();
  return null;
}

export async function persistMandiRecords(records: MandiRecord[]) {
  if (records.length === 0) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("market_prices").upsert(
    records.map((record) => ({
      commodity: record.commodity,
      variety: record.variety,
      state: record.state,
      district: record.district,
      market: record.market,
      min_price: record.minPrice,
      max_price: record.maxPrice,
      modal_price: record.modalPrice,
      arrival_date: record.arrivalDate,
      fetched_at: new Date().toISOString(),
    })),
    { onConflict: "commodity,state,district,market,variety,arrival_date" },
  );
  if (error) console.error("market_prices upsert failed", error.message);
}

export async function readStoredPriceHistory(commodity: string, state: string, market: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin
    .from("market_prices")
    .select("arrival_date, min_price, max_price, modal_price")
    .eq("commodity", commodity)
    .eq("state", state)
    .eq("market", market)
    .order("arrival_date", { ascending: false })
    .limit(60);
}