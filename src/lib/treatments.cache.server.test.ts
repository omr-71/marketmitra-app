import assert from "node:assert/strict";
import test from "node:test";

import { getCachedTreatmentGuidance } from "./treatments.cache.server.ts";
import type { TreatmentGuidance } from "./treatments.schema.ts";

const guidance: TreatmentGuidance = {
  organic_sprays: [],
  inorganic_sprays: [],
  non_chemical_steps: [],
  generalCare: [],
  organicManagement: [],
  organicBiological: [],
  chemical: [],
  sources: [],
  retrievedAt: "2026-10-24T00:00:00.000Z",
  sourceStatus: "no_authoritative_sources",
};

test("deduplicates in-flight requests and caches results by user, diagnosis and language", async () => {
  const userId = crypto.randomUUID();
  const key = { userId, diagnosisId: crypto.randomUUID(), lang: "en" as const };
  let loads = 0;
  let release: ((result: TreatmentGuidance) => void) | undefined;
  const load = () => {
    loads += 1;
    return new Promise<TreatmentGuidance>((resolve) => {
      release = resolve;
    });
  };

  const first = getCachedTreatmentGuidance(key, load);
  const concurrent = getCachedTreatmentGuidance(key, load);
  assert.equal(loads, 1);
  release?.(guidance);
  assert.equal(await first, guidance);
  assert.equal(await concurrent, guidance);
  assert.equal(await getCachedTreatmentGuidance(key, load), guidance);
  assert.equal(loads, 1);
});

test("reuses cached guidance containing source-supported recommendations", async () => {
  const userId = crypto.randomUUID();
  const key = { userId, diagnosisId: crypto.randomUUID(), lang: "en" as const };
  const guidanceWithRecommendation: TreatmentGuidance = {
    ...guidance,
    sourceStatus: "sources_found",
    organicBiological: [
      {
        productName: "Bacillus subtilis",
        brand: null,
        activeIngredient: "Bacillus subtilis",
        recommendationType: "biological_control",
        formulation: null,
        targetCrop: "Tomato",
        targetCondition: "Early blight",
        rationale:
          "Official guidance supports this biological control for the stated crop and problem.",
        applicationMethod: null,
        dose: null,
        waterVolume: null,
        applicationInterval: null,
        maximumApplications: null,
        requiredPpe: [],
        preHarvestInterval: null,
        reEntryInterval: null,
        precautions: [],
        sourceName: "Agricultural guidance",
        sourceUrl: "https://icar.org.in/tomato",
        verificationStatus: "source_supported_needs_label_check",
      },
    ],
  };
  let loads = 0;
  const load = async () => {
    loads += 1;
    return guidanceWithRecommendation;
  };

  assert.equal(await getCachedTreatmentGuidance(key, load), guidanceWithRecommendation);
  assert.equal(await getCachedTreatmentGuidance(key, load), guidanceWithRecommendation);
  assert.equal(loads, 1);
});

test("limits authenticated users to ten uncached spray requests per hour", async () => {
  const userId = crypto.randomUUID();
  const load = async () => guidance;

  for (let request = 0; request < 10; request += 1) {
    await getCachedTreatmentGuidance(
      { userId, diagnosisId: crypto.randomUUID(), lang: "en" },
      load,
    );
  }

  await assert.rejects(
    getCachedTreatmentGuidance({ userId, diagnosisId: crypto.randomUUID(), lang: "en" }, load),
    (error: unknown) =>
      error instanceof Error && error.message === "TREATMENT_REQUEST_RATE_LIMITED",
  );
});

test("releases request-limit reservations after a failed load so retry works", async () => {
  const userId = crypto.randomUUID();
  const key = { userId, diagnosisId: crypto.randomUUID(), lang: "en" as const };
  await assert.rejects(
    getCachedTreatmentGuidance(key, async () => {
      throw new Error("transient provider failure");
    }),
    /transient provider failure/,
  );

  assert.equal(await getCachedTreatmentGuidance(key, async () => guidance), guidance);
});
