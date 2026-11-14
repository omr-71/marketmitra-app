import assert from "node:assert/strict";
import test from "node:test";

import { buildDiagnosisManagementFallback } from "./treatments.presentation.ts";

test("builds a useful organic-management fallback from diagnosis steps", () => {
  assert.deepEqual(
    buildDiagnosisManagementFallback({
      whatToDoNow: ["Remove affected leaves carefully.", "Avoid overhead watering."],
      prevention: ["Avoid overhead watering.", "Inspect nearby plants."],
    }),
    ["Remove affected leaves carefully.", "Avoid overhead watering.", "Inspect nearby plants."],
  );
});

test("returns an empty fallback when diagnosis has no management steps", () => {
  assert.deepEqual(buildDiagnosisManagementFallback({ whatToDoNow: [], prevention: [] }), []);
});
