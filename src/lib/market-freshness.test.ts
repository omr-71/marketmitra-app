import assert from "node:assert/strict";
import test from "node:test";

import { computeFreshness, isCurrentMarketDate } from "./market-freshness";

const now = new Date("2026-10-25T10:00:00+05:30");

test("accepts today and yesterday as recent market reports", () => {
  assert.equal(isCurrentMarketDate("2026-10-25", now), true);
  assert.equal(isCurrentMarketDate("2026-10-24", now), true);
  assert.equal(computeFreshness({ dataDate: "2026-10-25", now }).level, "today");
  assert.equal(computeFreshness({ dataDate: "2026-10-24", now }).level, "yesterday");
});

test("rejects stale and future market dates", () => {
  assert.equal(isCurrentMarketDate("2026-10-23", now), false);
  assert.equal(isCurrentMarketDate("2026-10-26", now), false);
  assert.equal(computeFreshness({ dataDate: "2026-10-23", now }).level, "unavailable");
});
