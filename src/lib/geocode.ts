/**
 * Forward geocoding for manual location entry (city / district / state).
 * Open-Meteo's geocoding API is CORS-enabled and needs no key, so the request
 * runs in the farmer's own browser — manual mode therefore works even when GPS
 * permission is blocked, and weather still gets real coordinates.
 */
export type GeocodeHit = {
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
};

type OpenMeteoGeoResponse = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
  }[];
};

async function search(query: string): Promise<GeocodeHit[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
  if (!response.ok) return [];
  const json = (await response.json()) as OpenMeteoGeoResponse;
  return (json.results ?? [])
    .filter((r) => (r.country_code ?? "IN") === "IN")
    .map((r) => ({
      name: r.name,
      district: (r.admin2 ?? r.admin3 ?? "").replace(/\s+district$/i, ""),
      state: r.admin1 ?? "",
      latitude: r.latitude,
      longitude: r.longitude,
    }));
}

/**
 * Resolve coordinates for a manually entered place. Tries the most specific
 * query first (city), then falls back to district and state so the farmer
 * always gets a usable forecast.
 */
export async function geocodePlace(input: {
  city?: string;
  district?: string;
  state?: string;
}): Promise<GeocodeHit | null> {
  const city = input.city?.trim();
  const district = input.district?.trim();
  const state = input.state?.trim();

  const attempts = [city, district, state].filter((v): v is string => Boolean(v));
  if (attempts.length === 0) return null;

  for (const attempt of attempts) {
    try {
      const hits = await search(attempt);
      if (hits.length === 0) continue;
      // Prefer a hit inside the chosen state, then the chosen district.
      const inState = state
        ? hits.filter((h) => h.state.toLowerCase().includes(state.toLowerCase()))
        : hits;
      const pool = inState.length > 0 ? inState : hits;
      const inDistrict = district
        ? pool.filter((h) => h.district.toLowerCase().includes(district.toLowerCase()))
        : pool;
      return (inDistrict[0] ?? pool[0]) ?? null;
    } catch {
      // try the next, less specific query
    }
  }
  return null;
}
