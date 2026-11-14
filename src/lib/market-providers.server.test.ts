import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateMarketPrices,
  currentMarketRecords,
  normalizeRows,
  providers,
} from "./market-providers.server";
import { istToday } from "./market-freshness";

test("normalizes AGMARKNET source fields without changing crop, district, date, or prices", () => {
  const records = normalizeRows(
    [
      {
        Arrival_Date: "24/10/2026",
        Commodity: "Onion",
        District: "Nashik",
        Grade: "Local",
        Market: "APMC Devala ",
        Max_Price: 4300,
        Min_Price: 1000,
        Modal_Price: 3830,
        State: "Maharashtra",
        Variety: "Unhali",
      },
    ],
    {
      providerId: "agmarknet_variety",
      source: "AGMARKNET · Government of India",
      sourceUpdatedAt: "2026-10-25T05:00:00.000Z",
      fetchedAt: "2026-10-25T05:01:00.000Z",
    },
  );

  assert.equal(records.length, 1);
  assert.deepEqual(
    {
      commodity: records[0]!.commodity,
      district: records[0]!.district,
      market: records[0]!.market,
      date: records[0]!.date,
      minPrice: records[0]!.minPrice,
      maxPrice: records[0]!.maxPrice,
      modalPrice: records[0]!.modalPrice,
      sourceUpdatedAt: records[0]!.sourceUpdatedAt,
    },
    {
      commodity: "Onion",
      district: "Nashik",
      market: "APMC Devala",
      date: "2026-10-24",
      minPrice: 1000,
      maxPrice: 4300,
      modalPrice: 3830,
      sourceUpdatedAt: "2026-10-25T05:00:00.000Z",
    },
  );

  assert.equal(
    currentMarketRecords(
      records,
      { commodity: "Onion", state: "Maharashtra", district: "Nashik" },
      new Date("2026-10-25T10:00:00+05:30"),
    ).length,
    1,
  );
  assert.equal(
    currentMarketRecords(
      records,
      { commodity: "Tomato", state: "Maharashtra", district: "Nashik" },
      new Date("2026-10-25T10:00:00+05:30"),
    ).length,
    0,
  );
  assert.equal(
    currentMarketRecords(
      records,
      { commodity: "Onion", state: "Maharashtra", district: "Pune" },
      new Date("2026-10-25T10:00:00+05:30"),
    ).length,
    0,
  );
});

test("drops malformed AGMARKNET price rows instead of inventing values", () => {
  const records = normalizeRows(
    [
      {
        Arrival_Date: "24/10/2026",
        Commodity: "Onion",
        District: "Nashik",
        Market: "APMC Devala",
        Min_Price: "not a price",
        Max_Price: 4300,
        Modal_Price: 3830,
        State: "Maharashtra",
      },
    ],
    {
      providerId: "agmarknet_variety",
      source: "AGMARKNET · Government of India",
      sourceUpdatedAt: null,
      fetchedAt: "2026-10-25T05:01:00.000Z",
    },
  );

  assert.deepEqual(records, []);
});

test("retries commodity aliases after mismatched responses and isolates crop and district", async () => {
  const today = istToday();
  const yesterdayDate = new Date(`${today}T00:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  const apiDate = (date: string) => date.split("-").reverse().join("/");
  const row = (commodity: string, district: string, date: string) => ({
    Arrival_Date: apiDate(date),
    Commodity: commodity,
    District: district,
    Market: `APMC ${district}`,
    Min_Price: 1000,
    Max_Price: 3000,
    Modal_Price: 2000,
    State: "Maharashtra",
  });
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["AGMARKNET_API_KEY"];
  const requests: string[] = [];
  process.env["AGMARKNET_API_KEY"] = "market-provider-test-key";
  globalThis.fetch = async (input) => {
    const url = new URL(
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
    );
    requests.push(url.searchParams.get("filters[Commodity]") ?? "");
    const commodity = url.searchParams.get("filters[Commodity]");
    const records =
      commodity === "Tomato"
        ? [
            row("Tomato", "Nashik", today),
            row("Onion", "Nashik", today),
            row("Tomato", "Pune", today),
          ]
        : commodity === "Soybean"
          ? [
              row("Soybean", "Nasik", yesterday),
              row("Tomato", "Nasik", yesterday),
              row("Soybean", "Pune", yesterday),
            ]
          : [row("Tomato", "Nashik", today)];
    return new Response(JSON.stringify({ records, total: records.length }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const provider = providers.find(({ id }) => id === "agmarknet_variety");
    assert.ok(provider);

    const tomato = await provider.fetch({
      commodity: "Tomato",
      state: "Maharashtra",
      district: "Nashik",
    });
    assert.deepEqual(
      tomato.records.map(({ commodity, district, date }) => ({ commodity, district, date })),
      [{ commodity: "Tomato", district: "Nashik", date: today }],
    );

    const soybean = await provider.fetch({
      commodity: "Soyabean",
      state: "Maharashtra",
      district: "Nashik",
    });
    assert.deepEqual(
      soybean.records.map(({ commodity, district, date }) => ({ commodity, district, date })),
      [{ commodity: "Soybean", district: "Nasik", date: yesterday }],
    );
    assert.ok(requests.includes("Soyabean"));
    assert.ok(requests.includes("Soybean"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["AGMARKNET_API_KEY"];
    else process.env["AGMARKNET_API_KEY"] = originalApiKey;
  }
});

test("prefers today's district prices and falls back to yesterday's cached prices", async () => {
  const today = istToday();
  const yesterdayDate = new Date(`${today}T00:00:00Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  const fetchedAt = new Date().toISOString();
  const record = (market: string, date: string, providerId: string) => ({
    providerId,
    source: providerId,
    commodity: "Onion",
    variety: null,
    grade: null,
    state: "Maharashtra",
    district: "Ahilyanagar",
    market,
    date,
    arrival: null,
    minPrice: 1000,
    maxPrice: 3000,
    modalPrice: 2000,
    currency: "INR" as const,
    fetchedAt,
    sourceUpdatedAt: null,
  });
  const originalProviders = providers.splice(0);
  const originalFetch = globalThis.fetch;
  const originalSupabaseUrl = process.env["SUPABASE_URL"];
  const originalServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const requests: string[] = [];

  process.env["SUPABASE_URL"] = "https://market-test.invalid";
  process.env["SUPABASE_SERVICE_ROLE_KEY"] = "market-test-key";
  globalThis.fetch = async (input) => {
    requests.push(input instanceof Request ? input.url : String(input));
    return new Response("[]", {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  };
  providers.push(
    {
      id: "live-test",
      name: "Live test provider",
      priority: 1,
      envKey: null,
      coverage: "test",
      archive: false,
      fetch: async () => ({
        records: [record("APMC Sangamner", today, "live-test")],
        sourceUpdatedAt: null,
        statusCode: 200,
      }),
    },
    {
      id: "archive-test",
      name: "Archive test provider",
      priority: 9,
      envKey: null,
      coverage: "test",
      archive: true,
      fetch: async () => ({
        records: [record("APMC Kopargaon", yesterday, "archive-test")],
        sourceUpdatedAt: null,
        statusCode: 200,
      }),
    },
  );

  try {
    const result = await aggregateMarketPrices({
      commodity: "Onion",
      state: "Maharashtra",
      district: "Ahilyanagar",
    });

    assert.deepEqual(
      result.records.map(({ market, date }) => ({ market, date })),
      [{ market: "APMC Sangamner", date: today }],
    );
    assert.ok(requests.length >= 2);
    assert.ok(requests.every((url) => url.startsWith("https://market-test.invalid/")));

    providers[0]!.fetch = async () => ({
      records: [],
      sourceUpdatedAt: null,
      statusCode: 200,
    });
    const yesterdayResult = await aggregateMarketPrices({
      commodity: "Onion",
      state: "Maharashtra",
      district: "Ahilyanagar",
    });
    assert.deepEqual(
      yesterdayResult.records.map(({ market, date }) => ({ market, date })),
      [{ market: "APMC Kopargaon", date: yesterday }],
    );
  } finally {
    providers.splice(0, providers.length, ...originalProviders);
    globalThis.fetch = originalFetch;
    if (originalSupabaseUrl === undefined) delete process.env["SUPABASE_URL"];
    else process.env["SUPABASE_URL"] = originalSupabaseUrl;
    if (originalServiceKey === undefined) delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
    else process.env["SUPABASE_SERVICE_ROLE_KEY"] = originalServiceKey;
  }
});
