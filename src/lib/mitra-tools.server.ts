/**
 * Live data readers for Mitra AI. These hit the same official sources the app
 * screens use — AGMARKNET (data.gov.in) for mandi prices and Open-Meteo for
 * weather — so the assistant never invents numbers.
 */

const RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
const MARKET_SOURCE = "AGMARKNET · Government of India";

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

function toIsoDate(value: string) {
  const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
}

export type MitraMandiRow = {
  market: string;
  district: string;
  state: string;
  variety: string | null;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
};

export async function readMandiPrices(input: {
  commodity: string;
  state: string;
  district?: string | null;
}) {
  const apiKey = process.env["DATA_GOV_IN_API_KEY"];
  if (!apiKey) {
    return { ok: false as const, error: "Market price service is not configured." };
  }

  const request = async (district?: string | null) => {
    const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "250");
    url.searchParams.set("sort[Arrival_Date]", "desc");
    url.searchParams.set("filters[Commodity]", input.commodity);
    url.searchParams.set("filters[State]", input.state);
    if (district) url.searchParams.set("filters[District]", district);
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(String(response.status));
    return (await response.json()) as { records?: Record<string, unknown>[] };
  };

  try {
    let payload = await request(input.district);
    if ((payload.records?.length ?? 0) === 0 && input.district) payload = await request(null);

    const rows: MitraMandiRow[] = (payload.records ?? [])
      .map((row) => ({
        market: pick(row, "market"),
        district: pick(row, "district"),
        state: pick(row, "state"),
        variety: pick(row, "variety") || null,
        minPrice: Number(pick(row, "min_price", "minprice")),
        maxPrice: Number(pick(row, "max_price", "maxprice")),
        modalPrice: Number(pick(row, "modal_price", "modalprice")),
        arrivalDate: toIsoDate(pick(row, "arrival_date", "arrivaldate")),
      }))
      .filter((r) => r.market && r.arrivalDate && Number.isFinite(r.modalPrice) && r.modalPrice > 0)
      .sort((a, b) =>
        a.arrivalDate === b.arrivalDate
          ? b.modalPrice - a.modalPrice
          : a.arrivalDate < b.arrivalDate
            ? 1
            : -1,
      );

    if (rows.length === 0) {
      return {
        ok: true as const,
        rows: [],
        latestDate: "",
        source: MARKET_SOURCE,
        note: "No recent official record for this crop in that state.",
      };
    }

    return {
      ok: true as const,
      rows: rows.slice(0, 25),
      latestDate: rows[0]!.arrivalDate,
      source: MARKET_SOURCE,
      note: null,
    };
  } catch (error) {
    console.error("mitra mandi read failed", error);
    return { ok: false as const, error: "The government market price service is unavailable." };
  }
}

export async function readWeather(input: { latitude: number; longitude: number }) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(input.latitude));
  url.searchParams.set("longitude", String(input.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(String(response.status));
    const payload = (await response.json()) as {
      current?: Record<string, number | string>;
      daily?: Record<string, (number | string)[]>;
    };
    const daily = payload.daily ?? {};
    const days = (daily["time"] ?? []).map((date, i) => ({
      date: String(date),
      maxTemp: Number(daily["temperature_2m_max"]?.[i]),
      minTemp: Number(daily["temperature_2m_min"]?.[i]),
      rainChance: Number(daily["precipitation_probability_max"]?.[i]),
      rainMm: Number(daily["precipitation_sum"]?.[i]),
      uvIndexMax: Number(daily["uv_index_max"]?.[i]),
      windMax: Number(daily["wind_speed_10m_max"]?.[i]),
    }));

    return {
      ok: true as const,
      current: payload.current ?? null,
      days,
      source: "Open-Meteo forecast (IST)",
    };
  } catch (error) {
    console.error("mitra weather read failed", error);
    return { ok: false as const, error: "The weather service is unavailable right now." };
  }
}
