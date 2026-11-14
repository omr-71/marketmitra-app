import assert from "node:assert/strict";
import test from "node:test";

import {
  deliveryRetryDecision,
  MAX_DELIVERY_ATTEMPTS,
  PENDING_DELIVERY_LEASE_MS,
} from "./notification-delivery-policy.ts";

const now = Date.parse("2026-11-01T07:00:00.000Z");
const attempt = (status: string, ageMs: number, error_code: string | null = null, device_id = "device-1") => ({
  device_id,
  status,
  error_code,
  created_at: new Date(now - ageMs).toISOString(),
});

test("successful attempts are terminal and pending attempts prevent concurrent sends", () => {
  assert.equal(deliveryRetryDecision([attempt("sent", 0)], "device-1", now), "already_sent");
  assert.equal(deliveryRetryDecision([attempt("pending", 1000)], "device-1", now), "in_progress");
});

test("one device success does not suppress delivery to another device", () => {
  assert.equal(
    deliveryRetryDecision([
      attempt("sent", 0, null, "device-1"),
      attempt("failed_transient", 10 * 60_000, null, "device-2"),
    ], "device-2", now),
    "send",
  );
  assert.equal(
    deliveryRetryDecision([
      attempt("sent", 0, null, "device-1"),
      attempt("pending", 1000, null, "device-2"),
    ], "device-1", now),
    "already_sent",
  );
  assert.equal(
    deliveryRetryDecision([
      attempt("sent", 0, null, "device-1"),
      attempt("failed_transient", 10 * 60_000, null, "device-2"),
    ], "device-1", now),
    "already_sent",
  );
});

test("stale pending attempts are quarantined instead of duplicated", () => {
  assert.equal(
    deliveryRetryDecision([attempt("pending", PENDING_DELIVERY_LEASE_MS + 1)], "device-1", now),
    "unknown_outcome",
  );
  assert.equal(
    deliveryRetryDecision([
      attempt("pending", PENDING_DELIVERY_LEASE_MS + 1, null, "device-1"),
      attempt("sent", 0, null, "device-2"),
    ], "device-1", now),
    "unknown_outcome",
  );
});

test("transient failures retry with backoff and a bounded attempt count", () => {
  assert.equal(deliveryRetryDecision([attempt("failed_transient", 60_000)], "device-1", now), "backoff");
  assert.equal(deliveryRetryDecision([attempt("failed_transient", 10 * 60_000)], "device-1", now), "send");
  assert.equal(
    deliveryRetryDecision(
      Array.from({ length: MAX_DELIVERY_ATTEMPTS }, (_, i) =>
        attempt("failed_transient", (i + 1) * 90 * 60_000),
      ),
      "device-1",
      now,
    ),
    "retry_limit",
  );
});

test("permanent token failures do not retry", () => {
  assert.equal(
    deliveryRetryDecision(
      [attempt("failed_permanent", 24 * 60 * 60_000, "messaging/registration-token-not-registered")],
      "device-1",
      now,
    ),
    "permanent_failure",
  );
});
