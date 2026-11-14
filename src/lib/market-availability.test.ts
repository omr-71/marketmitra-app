import assert from "node:assert/strict";
import test from "node:test";
import { marketAvailabilityNotice, marketRequestFailureNotice } from "./market-availability";
import type { ProviderAttempt } from "./market-types";

const attempt = (overrides: Partial<ProviderAttempt> = {}): ProviderAttempt => ({
  providerId: "agmarknet_variety",
  provider: "AGMARKNET",
  ok: false,
  statusCode: 200,
  recordCount: 0,
  latestDataDate: null,
  sourceUpdatedAt: null,
  durationMs: 100,
  error: "No current records returned",
  ...overrides,
});

const now = new Date("2026-10-25T10:00:00+05:30");

test("reports stale district data and preserves the source reporting and update dates", () => {
  const notice = marketAvailabilityNotice(
    [
      attempt({
        latestDataDate: "2026-10-23",
        sourceUpdatedAt: "2026-10-23T23:34:49Z",
      }),
    ],
    "Nashik",
    now,
  );

  assert.equal(notice.title, "Market data is stale");
  assert.ok(
    notice.message.includes("No recent verified market prices available for this crop in Nashik."),
  );
  assert.ok(notice.message.includes("23 Oct 2026"));
  assert.ok(notice.message.includes("24 Oct 2026"));
});

test("explains an empty result with the source update timestamp", () => {
  const notice = marketAvailabilityNotice(
    [attempt({ sourceUpdatedAt: "2026-10-25T05:00:29Z" })],
    "Pune",
    now,
  );

  assert.equal(notice.title, "No recent verified market prices available");
  assert.ok(
    notice.message.includes("No recent verified market prices available for this crop in Pune."),
  );
  assert.ok(notice.message.includes("25 Oct 2026"));
});

test("identifies provider authentication errors separately from empty responses", () => {
  const notice = marketAvailabilityNotice(
    [attempt({ statusCode: 403, error: "HTTP 403" })],
    "Nashik",
    now,
  );

  assert.equal(notice.title, "Market provider authentication failed");
  assert.ok(notice.message.includes("HTTP 403"));
  assert.ok(notice.message.includes("AGMARKNET_API_KEY"));
});

test("identifies unconfigured credentials", () => {
  const notice = marketAvailabilityNotice(
    [attempt({ statusCode: null, error: "API key not configured" })],
    "Nashik",
    now,
  );

  assert.equal(notice.title, "Market data is not configured");
});

test("identifies network failures", () => {
  const notice = marketRequestFailureNotice(new Error("provider request timed out"));

  assert.equal(notice.title, "Market data source could not be reached");
});

test("identifies malformed provider responses", () => {
  const notice = marketRequestFailureNotice(
    new Error("data.gov.in returned an unexpected response structure"),
  );

  assert.equal(notice.title, "Market data response could not be read");
});

test("does not hide one provider failure when another provider returns no records", () => {
  const notice = marketAvailabilityNotice(
    [
      attempt(),
      attempt({
        providerId: "ceda_agmarknet",
        provider: "CEDA",
        statusCode: null,
        error: "data.gov.in request timed out",
      }),
    ],
    "Nashik",
    now,
  );

  assert.equal(notice.title, "No recent verified market prices available");
  assert.ok(notice.message.includes("CEDA did not respond"));
});

test("does not label an empty provider result as an upstream failure", () => {
  const notice = marketAvailabilityNotice([attempt()], "Nashik", now);

  assert.equal(notice.title, "No recent verified market prices available");
});
