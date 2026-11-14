import {
  aggregateMarketPrices,
  normalizeCedaPriceRecords,
  providerCatalogue,
} from "./lib/market-providers.server";
import { computeFreshness } from "./lib/market-freshness";

export async function runVerification() {
  console.log("=== Provider registration and normalization ===");
  const catalogue = providerCatalogue();
  const cedaEntry = catalogue.find((provider) => provider.id === "ceda_agmarknet");
  if (!cedaEntry) throw new Error("CEDA provider is not registered");
  if (cedaEntry.priority !== 1) throw new Error("CEDA must be the primary provider");
  console.log("CEDA provider priority:", cedaEntry.priority);

  const cedaBase = "https://agmarknet.ceda.ashoka.edu.in/api";
  const [statesResponse, commoditiesResponse, districtsResponse] = await Promise.all([
    fetch(`${cedaBase}/states`),
    fetch(`${cedaBase}/commodities`),
    fetch(`${cedaBase}/districts?state_id=27`),
  ]);
  if (!statesResponse.ok || !commoditiesResponse.ok || !districtsResponse.ok) {
    throw new Error(
      `CEDA lookup failed: states=${statesResponse.status}, commodities=${commoditiesResponse.status}, districts=${districtsResponse.status}`,
    );
  }
  const [statesPayload, commoditiesPayload, districtsPayload] = await Promise.all([
    statesResponse.json() as Promise<{
      data?: { census_state_id: number; census_state_name: string }[];
    }>,
    commoditiesResponse.json() as Promise<{
      data?: { commodity_id: number; commodity_disp_name: string }[];
    }>,
    districtsResponse.json() as Promise<{
      data?: { census_district_id: number; census_district_name: string }[];
    }>,
  ]);
  const state = statesPayload.data?.find((row) => row.census_state_name === "Maharashtra");
  const commodity = commoditiesPayload.data?.find((row) => row.commodity_disp_name === "Onion");
  const district = districtsPayload.data?.find((row) => row.census_district_name === "Nashik");
  if (!state || !commodity || !district) {
    throw new Error("CEDA lookup did not include Maharashtra, Onion, and Nashik");
  }

  const historicalResponse = await fetch(`${cedaBase}/prices`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      state_id: state.census_state_id,
      commodity_id: commodity.commodity_id,
      district_id: district.census_district_id,
      calculation_type: "d",
      start_date: "2025-10-30",
      end_date: "2025-10-30",
    }),
  });
  if (!historicalResponse.ok) {
    throw new Error(`CEDA historical price query failed: HTTP ${historicalResponse.status}`);
  }
  const historicalPayload = (await historicalResponse.json()) as {
    data?: Record<string, unknown>[];
  };
  const sourceRows = historicalPayload.data ?? [];
  if (sourceRows.length === 0) {
    throw new Error("CEDA no longer returns the known Nashik Onion historical source record");
  }

  const testRecord = normalizeCedaPriceRecords(
    { Result: { Data: sourceRows } },
    {
      filters: { commodity: "Onion", state: "Maharashtra", district: "Nashik" },
      stateName: state.census_state_name,
      districtName: district.census_district_name,
      fetchedAt: new Date().toISOString(),
      sourceUpdatedAt: null,
    },
  )[0];
  const rawSourceRow = sourceRows[0]!;
  if (!testRecord) throw new Error("CEDA response normalization discarded the actual source row");
  if (testRecord.date !== rawSourceRow["t"]) {
    throw new Error(`Source date changed during normalization: ${rawSourceRow["t"]}`);
  }
  if (
    testRecord.minPrice !== Number(rawSourceRow["p_min"]) ||
    testRecord.maxPrice !== Number(rawSourceRow["p_max"]) ||
    testRecord.modalPrice !== Number(rawSourceRow["p_modal"])
  ) {
    throw new Error("Source prices changed during normalization");
  }
  if (testRecord.district !== "Nashik" || testRecord.market !== "Nashik District Average") {
    throw new Error("CEDA aggregate was not labeled by its actual district-level scope");
  }
  if (
    computeFreshness({
      dataDate: testRecord.date,
      now: new Date("2026-10-02T12:00:00+05:30"),
    }).label !== "UNAVAILABLE"
  ) {
    throw new Error("Historical CEDA data must not be shown as current");
  }
  if (
    normalizeCedaPriceRecords(sourceRows, {
      filters: {
        commodity: "Onion",
        state: "Maharashtra",
        district: "Nashik",
        market: "Nashik APMC",
      },
      stateName: "Maharashtra",
      districtName: "Nashik",
      fetchedAt: new Date().toISOString(),
      sourceUpdatedAt: null,
    }).length !== 0
  ) {
    throw new Error("CEDA district aggregate incorrectly matched a market-specific request");
  }
  console.log(
    "Live historical CEDA record passed normalization with source prices/date and district labeling",
  );

  console.log("\n=== Freshness boundary checks ===");
  const now = new Date("2026-10-02T12:00:00+05:30");
  if (computeFreshness({ dataDate: "2026-10-02", now }).level !== "today") {
    throw new Error("Current IST reporting date was not recognized");
  }
  if (computeFreshness({ dataDate: "2026-10-01", now }).level !== "yesterday") {
    throw new Error("Previous IST reporting date was not recognized");
  }
  if (computeFreshness({ dataDate: "2025-10-30", now }).label !== "UNAVAILABLE") {
    throw new Error("Stale source data must remain UNAVAILABLE");
  }

  console.log("\n=== Live CEDA → aggregator request: Maharashtra / Nashik / Onion ===");
  const result = await aggregateMarketPrices({
    commodity: "Onion",
    state: "Maharashtra",
    district: "Nashik",
  });
  const cedaAttempt = result.attempts.find((attempt) => attempt.providerId === "ceda_agmarknet");
  if (!cedaAttempt) throw new Error("CEDA provider attempt was not recorded");
  if (cedaAttempt.statusCode !== 200) {
    throw new Error(`Expected CEDA HTTP 200, got ${cedaAttempt.statusCode}`);
  }
  console.log("Date:", result.latestDate || "(none)", "freshness:", result.freshness.label);
  console.log(
    "Provider attempts:",
    result.attempts.map(({ providerId, ok, statusCode, latestDataDate, error }) => ({
      providerId,
      ok,
      statusCode,
      latestDataDate,
      error,
    })),
  );
  if (
    result.records.some(
      (record) => computeFreshness({ dataDate: record.date }).level === "unavailable",
    )
  ) {
    throw new Error("Aggregator returned a record outside the valid freshness window");
  }
  if (result.records.length === 0 && result.freshness.label !== "UNAVAILABLE") {
    throw new Error("No eligible source records must produce UNAVAILABLE");
  }

  console.log(
    "\nVerification passed; stale/missing provider records correctly remain unavailable.",
  );
}
