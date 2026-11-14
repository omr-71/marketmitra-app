import assert from "node:assert/strict";
import test from "node:test";

import {
  collectKeysetPages,
  comparableMarketMovements,
  fetchValidatedWeatherForecast,
  forEachIsolatedUser,
  isDailySummaryWindow,
  parseWeatherForecast,
} from "./notification-intelligence-policy.ts";
import type { PriceRecord } from "./market-providers.server";

const now = new Date("2026-11-01T04:30:00.000Z");

function record(
  overrides: Partial<PriceRecord> & Pick<PriceRecord, "date" | "market" | "modalPrice">,
): PriceRecord {
  return {
    providerId: "agmarknet_variety",
    source: "AGMARKNET · Government of India",
    commodity: "Onion",
    variety: "Local",
    grade: null,
    state: "Maharashtra",
    district: "Nashik",
    arrival: null,
    minPrice: overrides.modalPrice,
    maxPrice: overrides.modalPrice,
    currency: "INR",
    fetchedAt: "2026-11-01T00:00:00.000Z",
    sourceUpdatedAt: null,
    ...overrides,
  };
}

test("market comparisons stay within the same market and commodity identity", () => {
  const comparisons = comparableMarketMovements([
    record({ date: "2026-10-31", market: "Nashik APMC", modalPrice: 1000 }),
    record({ date: "2026-11-01", market: "Pimpalgaon APMC", modalPrice: 1500 }),
    record({ date: "2026-10-31", market: "Nashik APMC", modalPrice: 1100, variety: "Red" }),
    record({ date: "2026-11-01", market: "Nashik APMC", modalPrice: 1200 }),
  ], undefined, now);
  assert.equal(comparisons.length, 1);
  assert.equal(comparisons[0]?.current.market, "Nashik APMC");
  assert.equal(comparisons[0]?.previous.modalPrice, 1000);
});

test("ambiguous same-day prices are not compared", () => {
  const comparisons = comparableMarketMovements([
    record({ date: "2026-10-31", market: "Nashik APMC", modalPrice: 1000 }),
    record({ date: "2026-10-31", market: "Nashik APMC", modalPrice: 1050 }),
    record({ date: "2026-11-01", market: "Nashik APMC", modalPrice: 1200 }),
  ], undefined, now);
  assert.equal(comparisons.length, 0);
});

test("stale, invalid-date, and unverified market observations are rejected", () => {
  assert.equal(comparableMarketMovements([
    record({ date: "2026-10-30", market: "Nashik APMC", modalPrice: 1000 }),
    record({ date: "2026-10-31", market: "Nashik APMC", modalPrice: 1200 }),
  ], undefined, now).length, 0);
  assert.equal(comparableMarketMovements([
    record({ date: "2026-02-30", market: "Nashik APMC", modalPrice: 1000 }),
    record({ date: "2026-11-01", market: "Nashik APMC", modalPrice: 1200 }),
  ], undefined, now).length, 0);
  assert.equal(comparableMarketMovements([
    record({ date: "2026-10-31", market: "Nashik APMC", modalPrice: 1000, providerId: "unverified" }),
    record({ date: "2026-11-01", market: "Nashik APMC", modalPrice: 1200, providerId: "unverified" }),
  ], undefined, now).length, 0);
});

test("daily summary eligibility covers Vercel Hobby's conservative 06:00–08:00 IST window", () => {
  assert.equal(isDailySummaryWindow(new Date("2026-11-01T01:30:00.000Z")), true);
  assert.equal(isDailySummaryWindow(new Date("2026-11-01T02:29:00.000Z")), true);
  assert.equal(isDailySummaryWindow(new Date("2026-11-01T00:29:00.000Z")), false);
  assert.equal(isDailySummaryWindow(new Date("2026-11-01T00:30:00.000Z")), true);
  assert.equal(isDailySummaryWindow(new Date("2026-11-01T02:30:00.000Z")), false);
});

test("notification preference pages use a strict keyset without duplicates", async () => {
  const pages = [
    [{ user_id: "001" }, { user_id: "002" }],
    [{ user_id: "003" }, { user_id: "004" }],
    [{ user_id: "005" }],
  ];
  const cursors: Array<string | null> = [];
  const users = await collectKeysetPages(async (cursor, size) => {
    cursors.push(cursor);
    assert.equal(size, 2);
    return pages.shift() ?? [];
  }, 2);
  assert.deepEqual(users.map((user) => user.user_id), ["001", "002", "003", "004", "005"]);
  assert.deepEqual(cursors, [null, "002", "004"]);
});

test("notification preference pagination fails explicitly on duplicate or unordered rows", async () => {
  await assert.rejects(() => collectKeysetPages(async (cursor) =>
    cursor === null ? [{ user_id: "002" }, { user_id: "003" }] : [{ user_id: "003" }],
  2), /strictly ordered/);
  await assert.rejects(() => collectKeysetPages(async () => {
    throw new Error("provider failure");
  }), /provider failure/);
});

test("weather forecast requires a valid provider date and every finite measurement", () => {
  const valid = {
    daily: {
      time: ["2026-11-01"],
      temperature_2m_max: [40],
      precipitation_probability_max: [70],
      precipitation_sum: [25],
      wind_speed_10m_max: [15],
    },
  };
  assert.deepEqual(parseWeatherForecast(valid, "2026-11-01"), {
    ok: true,
    forecast: {
      date: "2026-11-01",
      temperatureMax: 40,
      precipitationProbabilityMax: 70,
      precipitationSum: 25,
      windSpeedMax: 15,
    },
  });
  assert.deepEqual(parseWeatherForecast({ daily: {} }, "2026-11-01"), {
    ok: false,
    reason: "invalid_forecast_date",
  });
  assert.deepEqual(parseWeatherForecast({
    daily: { ...valid.daily, temperature_2m_max: [null] },
  }, "2026-11-01"), { ok: false, reason: "missing_measurement" });
  assert.deepEqual(parseWeatherForecast(valid, "2026-11-02"), {
    ok: false,
    reason: "invalid_forecast_date",
  });
});

test("weather request failures are classified without fabricating a forecast", async () => {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  assert.deepEqual(await fetchValidatedWeatherForecast(url, async () => {
    throw new Error("network");
  }), { ok: false, reason: "network_error" });
  assert.deepEqual(await fetchValidatedWeatherForecast(url, async () =>
    new Response("", { status: 503 }),
  ), { ok: false, reason: "http_503" });
  assert.deepEqual(await fetchValidatedWeatherForecast(url, async () =>
    new Response("not json", { status: 200 }),
  ), { ok: false, reason: "invalid_json" });
  assert.deepEqual(await fetchValidatedWeatherForecast(url, async () =>
    new Response(JSON.stringify({}), { status: 200 }),
  ), { ok: false, reason: "invalid_payload" });
});

test("weather evaluation continues after a user's processing error", async () => {
  const processed: number[] = [];
  let failures = 0;
  await forEachIsolatedUser([1, 2, 3], async (user) => {
    if (user === 2) throw new Error("user failure");
    processed.push(user);
  }, () => failures += 1);
  assert.deepEqual(processed, [1, 3]);
  assert.equal(failures, 1);
});
