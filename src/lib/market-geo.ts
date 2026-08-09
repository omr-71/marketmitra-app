/**
 * Resolve mandi coordinates so transport distance is a real geographic distance,
 * not a guess. Uses Open-Meteo's keyless, CORS-enabled geocoding API from the
 * farmer's own browser and caches every lookup in localStorage, so repeat visits
 * make no extra requests.
 */
import type { Coords } from "./transport";

const CACHE_KEY = "mm-market-geo";
const MISS = "none";

type CacheShape = Record<string, { lat: number; lon: number } | typeof MISS>;

function readCache(): CacheShape {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: CacheShape) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* private mode */
  }
}

/** "Pune(Moshi) APMC" -> "Pune", "AGRICULTURE PRODUCE MARKET COMITEE CHANDWAD" -> "Chandwad" */
export function marketPlaceName(market: string) {
  let name = market
    .replace(/\bAPMC\b/gi, "")
    .replace(/AGRICULTURE PRODUCE MARKET (COMITEE|COMMITTEE)/gi, "")
    .replace(/\b(Frui|Fruit|Veg\.?|Vegetable|Market|Mandi|RBZ)\b/gi, "")
    .replace(/\(([^)]*)\)/g, " $1 ")
    .replace(/[,&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!name) name = market.trim();
  // Prefer the first token group; multi-word village names still resolve.
  return name;
}

async function geocode(query: string, state: string): Promise<Coords | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "10");
  url.searchParams.set("language", "en");
  url.searchParams.set("countryCode", "IN");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
  if (!response.ok) return null;
  const json = (await response.json()) as {
    results?: { latitude: number; longitude: number; admin1?: string }[];
  };
  const hits = json.results ?? [];
  if (hits.length === 0) return null;
  const inState = state
    ? hits.filter((h) => (h.admin1 ?? "").toLowerCase().includes(state.toLowerCase().slice(0, 6)))
    : hits;
  const hit = (inState[0] ?? hits[0])!;
  return { latitude: hit.latitude, longitude: hit.longitude };
}

/**
 * Look up coordinates for a mandi. Tries the cleaned market name, then the
 * district — returns null when neither resolves, so the UI can simply omit
 * transport instead of inventing a distance.
 */
export async function locateMarket(
  market: string,
  district: string,
  state: string,
): Promise<Coords | null> {
  const key = `${market}|${district}|${state}`.toLowerCase();
  const cache = readCache();
  const cached = cache[key];
  if (cached === MISS) return null;
  if (cached) return { latitude: cached.lat, longitude: cached.lon };

  const attempts = [marketPlaceName(market), district].filter(Boolean);
  for (const attempt of attempts) {
    try {
      const hit = await geocode(attempt, state);
      if (hit) {
        cache[key] = { lat: hit.latitude, lon: hit.longitude };
        writeCache(cache);
        return hit;
      }
    } catch {
      return null; // network problem: don't poison the cache
    }
  }
  cache[key] = MISS;
  writeCache(cache);
  return null;
}
