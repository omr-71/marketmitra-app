import assert from "node:assert/strict";
import test from "node:test";
import { fetchWeatherResponse } from "./weather-provider.ts";

const url = new URL("https://api.open-meteo.com/v1/forecast");

test("retries a transient provider 503 and returns the genuine successful response", async () => {
  let calls = 0;
  const response = await fetchWeatherResponse(url, async () => {
    calls += 1;
    return calls === 1
      ? new Response("overloaded", { status: 503 })
      : new Response('{"current":{"temperature_2m":21}}', {
          status: 200,
          headers: { "content-type": "application/json" },
        });
  });

  assert.equal(calls, 2);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).current.temperature_2m, 21);
});

test("does not retry non-transient provider responses", async () => {
  let calls = 0;
  const response = await fetchWeatherResponse(url, async () => {
    calls += 1;
    return new Response("invalid request", { status: 400 });
  });

  assert.equal(calls, 1);
  assert.equal(response.status, 400);
});

test("returns the provider's final response after one retry", async () => {
  let calls = 0;
  const response = await fetchWeatherResponse(url, async () => {
    calls += 1;
    return new Response("overloaded", { status: 503 });
  });

  assert.equal(calls, 2);
  assert.equal(response.status, 503);
});
