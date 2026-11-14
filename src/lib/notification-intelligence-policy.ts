import type { PriceRecord } from "@/lib/market-providers.server";
import { isCurrentMarketDate, istToday } from "./market-freshness.ts";

const DAILY_SUMMARY_START_MINUTE_IST = 6 * 60;
const DAILY_SUMMARY_END_MINUTE_IST = 8 * 60;
const VERIFIED_MARKET_PROVIDER = "agmarknet_variety";
const VERIFIED_MARKET_SOURCE = "AGMARKNET · Government of India";

export type WeatherForecastDay = {
  date: string;
  temperatureMax: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  windSpeedMax: number;
};

export type WeatherForecastResult =
  | { ok: true; forecast: WeatherForecastDay }
  | { ok: false; reason: string };

function normalizedIdentity(value: string | null) {
  return (value ?? "").normalize("NFKC").trim().toLocaleLowerCase("en-IN").replace(/\s+/g, " ");
}

function observationGroupKey(record: PriceRecord) {
  return [
    record.providerId,
    normalizedIdentity(record.source),
    normalizedIdentity(record.commodity),
    normalizedIdentity(record.variety),
    normalizedIdentity(record.grade),
    normalizedIdentity(record.state),
    normalizedIdentity(record.district),
    normalizedIdentity(record.market),
    record.currency,
  ].join("\u0000");
}

export function comparableMarketMovements(
  records: PriceRecord[],
  preferredMarket?: string,
  now = new Date(),
) {
  const marketFilter = preferredMarket ? normalizedIdentity(preferredMarket) : null;
  const groups = new Map<string, PriceRecord[]>();

  for (const record of records) {
    if (
      record.providerId !== VERIFIED_MARKET_PROVIDER ||
      normalizedIdentity(record.source) !== normalizedIdentity(VERIFIED_MARKET_SOURCE) ||
      !record.commodity ||
      !record.state ||
      !record.district ||
      !record.market ||
      !isIsoDate(record.date) ||
      !isCurrentMarketDate(record.date, now) ||
      !Number.isFinite(record.modalPrice) ||
      record.modalPrice <= 0 ||
      record.currency !== "INR" ||
      (marketFilter && normalizedIdentity(record.market) !== marketFilter)
    ) {
      continue;
    }

    const key = observationGroupKey(record);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  const comparisons: Array<{ current: PriceRecord; previous: PriceRecord }> = [];
  for (const group of groups.values()) {
    const byDate = new Map<string, PriceRecord[]>();
    for (const record of group) {
      const observations = byDate.get(record.date) ?? [];
      observations.push(record);
      byDate.set(record.date, observations);
    }

    const uniqueDailyRecords: PriceRecord[] = [];
    for (const observations of byDate.values()) {
      const prices = new Set(observations.map((record) => record.modalPrice));
      if (prices.size === 1) uniqueDailyRecords.push(observations[0]!);
    }
    uniqueDailyRecords.sort((a, b) => b.date.localeCompare(a.date));
    if (uniqueDailyRecords.length >= 2) {
      comparisons.push({
        current: uniqueDailyRecords[0]!,
        previous: uniqueDailyRecords[1]!,
      });
    }
  }
  return comparisons;
}

export function isDailySummaryWindow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? -1);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? -1);
  const minuteOfDay = hour * 60 + minute;
  return minuteOfDay >= DAILY_SUMMARY_START_MINUTE_IST &&
    minuteOfDay < DAILY_SUMMARY_END_MINUTE_IST;
}

export async function collectKeysetPages<T extends { user_id: string }>(
  fetchPage: (afterUserId: string | null, pageSize: number) => Promise<T[]>,
  pageSize = 500,
) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error("Page size must be a positive integer.");
  }

  const collected: T[] = [];
  let cursor: string | null = null;
  while (true) {
    const page = await fetchPage(cursor, pageSize);
    if (page.length > pageSize) {
      throw new Error("Notification preference page exceeded its requested size.");
    }
    if (page.length === 0) break;

    for (const row of page) {
      if (!row.user_id || (cursor !== null && row.user_id <= cursor)) {
        throw new Error("Notification preference pages were not strictly ordered.");
      }
      collected.push(row);
      cursor = row.user_id;
    }
    if (page.length < pageSize) break;
  }
  return collected;
}

export async function forEachIsolatedUser<T>(
  users: T[],
  processUser: (user: T) => Promise<void>,
  onFailure: () => void,
) {
  for (const user of users) {
    try {
      await processUser(user);
    } catch {
      onFailure();
    }
  }
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month! - 1 &&
    date.getUTCDate() === day;
}

export function parseWeatherForecast(
  payload: unknown,
  today = istToday(),
): WeatherForecastResult {
  if (!payload || typeof payload !== "object" || !("daily" in payload)) {
    return { ok: false, reason: "invalid_payload" };
  }
  const daily = payload.daily;
  if (!daily || typeof daily !== "object") return { ok: false, reason: "invalid_payload" };

  const fields = daily as Record<string, unknown>;
  const date = Array.isArray(fields["time"]) ? fields["time"][0] : undefined;
  if (!isIsoDate(date)) return { ok: false, reason: "invalid_forecast_date" };
  if (date < today || date > addIsoDays(today, 1)) {
    return { ok: false, reason: "invalid_forecast_date" };
  }

  const measurements = [
    fields["temperature_2m_max"],
    fields["precipitation_probability_max"],
    fields["precipitation_sum"],
    fields["wind_speed_10m_max"],
  ].map((values) => Array.isArray(values) ? values[0] : undefined);
  if (measurements.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { ok: false, reason: "missing_measurement" };
  }

  const [temperatureMax, precipitationProbabilityMax, precipitationSum, windSpeedMax] =
    measurements as [number, number, number, number];
  if (
    temperatureMax < -90 || temperatureMax > 65 ||
    precipitationProbabilityMax < 0 || precipitationProbabilityMax > 100 ||
    precipitationSum < 0 ||
    windSpeedMax < 0
  ) {
    return { ok: false, reason: "missing_measurement" };
  }
  return {
    ok: true,
    forecast: { date, temperatureMax, precipitationProbabilityMax, precipitationSum, windSpeedMax },
  };
}

export async function fetchValidatedWeatherForecast(
  url: URL,
  fetcher: typeof fetch = fetch,
): Promise<WeatherForecastResult> {
  let response: Response;
  try {
    response = await fetcher(url, { signal: AbortSignal.timeout(10000) });
  } catch {
    return { ok: false, reason: "network_error" };
  }
  if (!response.ok) return { ok: false, reason: `http_${response.status}` };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
  return parseWeatherForecast(payload);
}

function addIsoDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + days));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}
