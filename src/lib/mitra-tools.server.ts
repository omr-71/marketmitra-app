/**
 * Live data readers for Mitra AI. These hit the same official sources the app
 * screens use — AGMARKNET (data.gov.in) for mandi prices and Open-Meteo for
 * weather — so the assistant never invents numbers.
 */

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
  try {
    const { aggregateMarketPrices } = await import("./market-providers.server");
    const result = await aggregateMarketPrices({
      commodity: input.commodity,
      state: input.state,
      ...(input.district ? { district: input.district } : {}),
    });
    const rows: MitraMandiRow[] = result.records.slice(0, 25).map((record) => ({
      market: record.market,
      district: record.district,
      state: record.state,
      variety: record.variety,
      minPrice: record.minPrice,
      maxPrice: record.maxPrice,
      modalPrice: record.modalPrice,
      arrivalDate: record.date,
    }));

    if (rows.length === 0) {
      return { ok: false as const, error: "No recent official mandi records are available." };
    }

    return {
      ok: true as const,
      rows,
      latestDate: result.latestDate,
      source: result.source ?? "AGMARKNET · Government of India",
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
