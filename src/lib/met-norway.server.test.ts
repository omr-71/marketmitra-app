import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchMetNorwayForecast,
  fetchWeatherFromProviders,
  mapMetNorwayForecast,
} from "./met-norway.server.ts";

const primaryUrl = new URL("https://api.open-meteo.com/v1/forecast");
const forecast = {
  properties: {
    meta: { updated_at: "2026-11-02T15:00:00Z" },
    timeseries: [
      {
        time: "2026-11-02T15:00:00Z",
        data: {
          instant: {
            details: {
              air_temperature: 22.4,
              relative_humidity: 61,
              wind_speed: 2,
              air_pressure_at_sea_level: 1012,
            },
          },
          next_1_hours: {
            summary: { symbol_code: "partlycloudy_day" },
            details: { precipitation_amount: 0.1 },
          },
        },
      },
      {
        time: "2026-11-02T16:00:00Z",
        data: {
          instant: { details: { air_temperature: 23, wind_speed: 3 } },
          next_1_hours: {
            summary: { symbol_code: "rain_day" },
            details: { precipitation_amount: 1.2 },
          },
        },
      },
    ],
  },
};

test("keeps Open-Meteo primary when it succeeds", async () => {
  let fallbackCalls = 0;
  const result = await fetchWeatherFromProviders(primaryUrl, 18.716, 73.771, {
    fetchPrimary: async () => Response.json({ current: { temperature_2m: 25 } }),
    fetchFallback: async () => {
      fallbackCalls += 1;
      return forecast;
    },
  });

  assert.equal(result.source, "Open-Meteo");
  assert.equal(fallbackCalls, 0);
});

test("uses a mapped MET Norway forecast after a temporary Open-Meteo 503", async () => {
  let fallbackCalls = 0;
  const result = await fetchWeatherFromProviders(primaryUrl, 18.716, 73.771, {
    fetchPrimary: async () => new Response("overloaded", { status: 503 }),
    fetchFallback: async () => {
      fallbackCalls += 1;
      return forecast;
    },
  });

  const weather = mapMetNorwayForecast(result.payload, new Date("2026-11-02T15:00:00Z"));
  assert.equal(result.source, "MET Norway");
  assert.equal(fallbackCalls, 1);
  assert.equal(weather.current.temperature, 22);
  assert.equal(weather.current.wind, 7);
  assert.equal(weather.current.rainChance, null);
  assert.equal(weather.current.apparent, null);
  assert.equal(weather.sunrise, null);
  assert.equal(weather.days[0]?.rainMm, null);
  assert.equal(weather.hourly[0]?.time, "2026-11-02T15:00:00Z");
});

test("reports failure when the primary and fallback providers both fail", async () => {
  await assert.rejects(
    fetchWeatherFromProviders(primaryUrl, 18.716, 73.771, {
      fetchPrimary: async () => new Response("overloaded", { status: 503 }),
      fetchFallback: async () => {
        throw new Error("MET Norway returned HTTP 503.");
      },
    }),
    /MET Norway returned HTTP 503/,
  );
});

test("rejects malformed fallback responses rather than returning success-shaped data", async () => {
  await assert.rejects(
    (async () => {
      const result = await fetchWeatherFromProviders(primaryUrl, 18.716, 73.771, {
        fetchPrimary: async () => new Response("overloaded", { status: 503 }),
        fetchFallback: async () => ({ properties: { timeseries: [] } }),
      });
      return mapMetNorwayForecast(result.payload);
    })(),
    /no forecast time series/i,
  );
});

test("uses MET Norway after an Open-Meteo timeout", async () => {
  const timeout = new Error("Request timed out");
  timeout.name = "TimeoutError";
  const result = await fetchWeatherFromProviders(primaryUrl, 18.716, 73.771, {
    fetchPrimary: async () => {
      throw timeout;
    },
    fetchFallback: async () => forecast,
  });

  assert.equal(result.source, "MET Norway");
});

test("sends an identifying User-Agent, rounds coordinates, and caches until Expires", async () => {
  const now = Date.parse("2026-11-02T15:00:00Z");
  const until = "Mon, 02 Nov 2026 16:00:00 GMT";
  let calls = 0;
  let requestedUrl = "";
  let userAgent = "";
  const request = async (input: URL | RequestInfo, init?: RequestInit) => {
    calls += 1;
    requestedUrl = String(input);
    userAgent = new Headers(init?.headers).get("user-agent") ?? "";
    return Response.json(forecast, {
      headers: { expires: until, "last-modified": "Mon, 02 Nov 2026 15:00:00 GMT" },
    });
  };

  await fetchMetNorwayForecast(18.71601, 73.77102, request, now);
  await fetchMetNorwayForecast(18.71602, 73.77103, request, now + 30_000);

  assert.equal(calls, 1);
  assert.match(requestedUrl, /lat=18\.7160/);
  assert.match(requestedUrl, /lon=73\.7710/);
  assert.match(userAgent, /marketmitra\.app/);
  assert.match(userAgent, /hello\.marketmitra@gmail\.com/);
});

test("revalidates expired MET Norway cache with If-Modified-Since", async () => {
  const now = Date.parse("2026-11-02T15:00:00Z");
  let calls = 0;
  let conditionalHeader: string | null = null;
  const fetchImpl = async (_input: URL | RequestInfo, init?: RequestInit) => {
    calls += 1;
    if (calls === 1) {
      return Response.json(forecast, {
        headers: {
          expires: "Mon, 02 Nov 2026 15:01:00 GMT",
          "last-modified": "Mon, 02 Nov 2026 15:00:00 GMT",
        },
      });
    }
    conditionalHeader = new Headers(init?.headers).get("if-modified-since");
    return new Response(null, {
      status: 304,
      headers: { expires: "Mon, 02 Nov 2026 16:00:00 GMT" },
    });
  };

  await fetchMetNorwayForecast(18.71611, 73.77111, fetchImpl, now);
  const cached = await fetchMetNorwayForecast(18.71611, 73.77111, fetchImpl, now + 120_000);

  assert.equal(calls, 2);
  assert.equal(conditionalHeader, "Mon, 02 Nov 2026 15:00:00 GMT");
  assert.deepEqual(cached, forecast);
});
