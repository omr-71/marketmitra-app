import type { WeatherDay, WeatherResult } from "./weather.functions";

type WeatherSuccess = Extract<WeatherResult, { ok: true }>;
type JsonRecord = Record<string, unknown>;

const userAgent = "Market Mitra (https://marketmitra.app; hello.marketmitra@gmail.com)";
const fallbackTtlMs = 60 * 60 * 1000;
const cache = new Map<
  string,
  { payload: unknown; expiresAt: number; lastModified: string | null }
>();
const inFlight = new Map<string, Promise<unknown>>();

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getRecord(value: unknown): JsonRecord | null {
  return isRecord(value) ? value : null;
}

function getDetails(value: unknown): JsonRecord {
  const record = getRecord(value);
  return getRecord(record?.["details"]) ?? {};
}

function getSummarySymbol(value: unknown): string | null {
  const summary = getRecord(getRecord(value)?.["summary"]);
  return typeof summary?.["symbol_code"] === "string" ? summary["symbol_code"] : null;
}

function symbolCode(symbol: string | null): number | null {
  if (!symbol) return null;
  const code = symbol.toLowerCase().replace(/_(day|night|polartwilight)$/, "");
  if (code.includes("thunder")) return 95;
  if (code.includes("snowshowers")) return code.includes("heavy") ? 86 : 85;
  if (code.includes("rainshowers")) return code.includes("heavy") ? 82 : 80;
  if (code.includes("sleet")) return code.includes("heavy") ? 69 : 68;
  if (code.includes("snow")) return code.includes("heavy") ? 75 : code.includes("light") ? 71 : 73;
  if (code.includes("rain")) return code.includes("heavy") ? 65 : code.includes("light") ? 61 : 63;
  if (code.includes("drizzle"))
    return code.includes("heavy") ? 55 : code.includes("light") ? 51 : 53;
  if (code === "fog") return 45;
  if (code === "cloudy") return 3;
  if (code === "partlycloudy") return 2;
  if (code === "fair") return 1;
  if (code === "clearsky") return 0;
  return null;
}

function dateInIndia(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isDay(symbol: string | null): boolean | null {
  if (!symbol) return null;
  if (/_day$/.test(symbol)) return true;
  if (/_night$/.test(symbol) || /_polartwilight$/.test(symbol)) return false;
  return null;
}

function periodForInterval(data: JsonRecord, hours: number): JsonRecord | null {
  const period = hours <= 1.5 ? "next_1_hours" : hours <= 7.5 ? "next_6_hours" : "next_12_hours";
  return getRecord(data[period]);
}

export function mapMetNorwayForecast(payload: unknown, now = new Date()): WeatherSuccess {
  const properties = getRecord(getRecord(payload)?.["properties"]);
  const rawSeries = properties?.["timeseries"];
  if (!Array.isArray(rawSeries) || rawSeries.length === 0) {
    throw new Error("MET Norway returned no forecast time series.");
  }

  const series = rawSeries.flatMap((item) => {
    const record = getRecord(item);
    const data = getRecord(record?.["data"]);
    const instant = getRecord(data?.["instant"]);
    const details = getRecord(instant?.["details"]);
    const time = typeof record?.["time"] === "string" ? record["time"] : null;
    const temperature = finite(details?.["air_temperature"]);
    if (!data || !details || !time || !Number.isFinite(Date.parse(time)) || temperature === null) {
      return [];
    }

    const nextTime = rawSeries
      .map((candidate) => getRecord(candidate))
      .find((candidate) => {
        const candidateTime = candidate?.["time"];
        return typeof candidateTime === "string" && Date.parse(candidateTime) > Date.parse(time);
      })?.["time"];
    const intervalHours =
      typeof nextTime === "string" ? (Date.parse(nextTime) - Date.parse(time)) / 3_600_000 : 1;
    const period = periodForInterval(data, intervalHours);
    const symbol =
      getSummarySymbol(period) ??
      getSummarySymbol(data["next_1_hours"]) ??
      getSummarySymbol(data["next_6_hours"]) ??
      getSummarySymbol(data["next_12_hours"]);

    return [
      {
        time,
        nextTime: typeof nextTime === "string" ? nextTime : null,
        data,
        details,
        temperature,
        symbol,
        code: symbolCode(symbol),
        isDay: isDay(symbol),
        humidity: finite(details["relative_humidity"]),
        wind: finite(details["wind_speed"]),
        gust: finite(details["wind_speed_of_gust"]),
        pressure: finite(details["air_pressure_at_sea_level"]),
        uv: finite(details["ultraviolet_index_clear_sky"]),
        period,
      },
    ];
  });

  const current = series[0];
  if (!current) throw new Error("MET Norway forecast is missing current air temperature.");

  const daysByDate = new Map<
    string,
    WeatherDay & {
      temperatures: number[];
      rainPeriods: { start: number; end: number; amount: number | null }[];
    }
  >();
  for (const point of series) {
    const date = dateInIndia(point.time);
    let day = daysByDate.get(date);
    if (!day) {
      day = {
        date,
        max: null,
        min: null,
        rainChance: null,
        rainMm: null,
        code: point.code,
        uvIndex: null,
        windMax: null,
        temperatures: [],
        rainPeriods: [],
      };
      daysByDate.set(date, day);
    }

    day.temperatures.push(point.temperature);
    if (point.code !== null && day.code === null) day.code = point.code;
    if (point.uv !== null) day.uvIndex = Math.max(day.uvIndex ?? point.uv, point.uv);
    if (point.wind !== null) {
      const windKmh = point.wind * 3.6;
      day.windMax = Math.round(Math.max(day.windMax ?? windKmh, windKmh));
    }
    if (point.period) {
      const precipitation = finite(getDetails(point.period)["precipitation_amount"]);
      if (point.nextTime) {
        day.rainPeriods.push({
          start: Date.parse(point.time),
          end: Date.parse(point.nextTime),
          amount: precipitation,
        });
      }
    }
  }

  const days = [...daysByDate.entries()]
    .map(([date, day]) => {
      const dayStart = Date.parse(`${date}T00:00:00+05:30`);
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      let cursor = dayStart;
      let rainTotal = 0;
      let completeRainTotal = true;
      for (const interval of day.rainPeriods.sort((a, b) => a.start - b.start)) {
        if (interval.start < dayStart || interval.start >= dayEnd) continue;
        if (interval.start !== cursor || interval.end > dayEnd || interval.amount === null) {
          completeRainTotal = false;
          break;
        }
        rainTotal += interval.amount;
        cursor = interval.end;
      }
      if (cursor !== dayEnd) completeRainTotal = false;

      return {
        ...day,
        max: day.temperatures.length ? Math.round(Math.max(...day.temperatures)) : null,
        min: day.temperatures.length ? Math.round(Math.min(...day.temperatures)) : null,
        rainMm: completeRainTotal ? Number(rainTotal.toFixed(1)) : null,
      };
    })
    .map(({ temperatures: _temperatures, rainPeriods: _rainPeriods, ...day }) => day)
    .slice(0, 7);
  const forecastEnd = now.getTime() + 24 * 60 * 60 * 1000;
  const hourly = series
    .filter((point) => {
      const time = Date.parse(point.time);
      return time >= Date.parse(current.time) && time < forecastEnd;
    })
    .map((point) => {
      const period = point.period;
      return {
        time: point.time,
        temperature: Math.round(point.temperature),
        code: point.code,
        rainChance: finite(getDetails(period)["probability_of_precipitation"]),
        isDay: point.isDay,
      };
    });

  return {
    ok: true,
    updatedAt:
      typeof getRecord(properties?.["meta"])?.["updated_at"] === "string"
        ? (getRecord(properties?.["meta"])?.["updated_at"] as string)
        : now.toISOString(),
    current: {
      temperature: Math.round(current.temperature),
      apparent: null,
      humidity: current.humidity === null ? null : Math.round(current.humidity),
      wind: current.wind === null ? null : Math.round(current.wind * 3.6),
      rainChance: finite(getDetails(current.period)["probability_of_precipitation"]),
      code: current.code,
      isDay: current.isDay,
      pressure: current.pressure === null ? null : Math.round(current.pressure),
      uvIndex: current.uv,
      precipitation: null,
      windGust: current.gust === null ? null : Math.round(current.gust * 3.6),
      visibility: null,
    },
    observedAt: current.time,
    sunrise: null,
    sunset: null,
    days,
    hourly,
    source: "MET Norway",
  };
}

function expiryTime(response: Response, now: number): number {
  const expires = response.headers.get("expires");
  if (expires) {
    const parsed = Date.parse(expires);
    if (Number.isFinite(parsed)) return Math.max(parsed, now);
  }
  const cacheControl = response.headers.get("cache-control");
  const maxAge = cacheControl?.match(/(?:^|,)\s*max-age=(\d+)/i)?.[1];
  return now + (maxAge ? Number(maxAge) * 1000 : fallbackTtlMs);
}

function metNorwayUrl(latitude: number, longitude: number): URL {
  const url = new URL("https://api.met.no/weatherapi/locationforecast/2.0/compact");
  url.searchParams.set("lat", latitude.toFixed(4));
  url.searchParams.set("lon", longitude.toFixed(4));
  return url;
}

export async function fetchMetNorwayForecast(
  latitude: number,
  longitude: number,
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<unknown> {
  const url = metNorwayUrl(latitude, longitude);
  const key = url.toString();
  const cached = cache.get(key);
  if (cached && now < cached.expiresAt) return cached.payload;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const headers = new Headers({
      accept: "application/json",
      "user-agent": userAgent,
    });
    if (cached?.lastModified) headers.set("if-modified-since", cached.lastModified);

    const response = await fetchImpl(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 304 && cached) {
      cached.expiresAt = expiryTime(response, now);
      return cached.payload;
    }
    if (!response.ok) throw new Error(`MET Norway returned HTTP ${response.status}.`);

    const payload: unknown = await response.json();
    mapMetNorwayForecast(payload, new Date(now));
    cache.set(key, {
      payload,
      expiresAt: expiryTime(response, now),
      lastModified: response.headers.get("last-modified"),
    });
    if (cache.size > 128) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    return payload;
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

export type WeatherProviderDependencies = {
  fetchPrimary: (url: URL) => Promise<Response>;
  fetchFallback: (latitude: number, longitude: number) => Promise<unknown>;
};

export async function fetchWeatherFromProviders(
  primaryUrl: URL,
  latitude: number,
  longitude: number,
  dependencies: WeatherProviderDependencies,
): Promise<{ source: "Open-Meteo" | "MET Norway"; payload: unknown }> {
  let response: Response | null = null;
  let useFallback = false;

  try {
    response = await dependencies.fetchPrimary(primaryUrl);
    useFallback = response.status >= 500 && response.status <= 599;
  } catch (error) {
    if (
      !(error instanceof TypeError) &&
      (!(error instanceof Error) || error.name !== "TimeoutError")
    ) {
      throw error;
    }
    useFallback = true;
  }

  if (!useFallback && response) {
    if (!response.ok) throw new Error(`Open-Meteo returned HTTP ${response.status}.`);
    return { source: "Open-Meteo", payload: await response.json() };
  }

  const payload = await dependencies.fetchFallback(latitude, longitude);
  mapMetNorwayForecast(payload);
  return { source: "MET Norway", payload };
}
