import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTreatmentGuidance,
  extractTreatmentSources,
  normalizeTreatmentModelResponse,
} from "./treatments.schema.ts";

const modelResponse = {
  causeCategory: "fungal",
  generalCare: ["Check nearby plants for the same symptoms."],
  organicManagement: [],
  organicBiological: [
    {
      productName: "Example biological product",
      brand: "Example brand",
      activeIngredient: "Example organism",
      formulation: null,
      targetCrop: "Tomato",
      targetCondition: "Tomato early blight",
      rationale: "The retrieved source describes its use for this crop and problem.",
      applicationMethod: null,
      dose: null,
      waterVolume: null,
      applicationInterval: null,
      maximumApplications: null,
      requiredPpe: [],
      preHarvestInterval: null,
      reEntryInterval: null,
      precautions: ["Follow the current product label."],
      sourceUrl: "https://ppqs.gov.in/record",
    },
  ],
  chemical: [
    {
      productName: "Example chemical product",
      brand: null,
      activeIngredient: "Example ingredient",
      formulation: null,
      targetCrop: "Tomato",
      targetCondition: "Tomato early blight",
      rationale: "The retrieved source describes its use for this crop and problem.",
      applicationMethod: null,
      dose: null,
      waterVolume: null,
      applicationInterval: null,
      maximumApplications: null,
      requiredPpe: [],
      preHarvestInterval: null,
      reEntryInterval: null,
      precautions: ["Use label-listed protective equipment."],
      sourceUrl: "https://example.com/untrusted",
    },
  ],
};

test("marks candidates source-supported only when an opened authoritative source supports them", () => {
  const result = buildTreatmentGuidance(
    modelResponse,
    [
      {
        name: "Official use record",
        url: "https://ppqs.gov.in/record",
        evidenceText:
          "Tomato early blight Example biological product Example brand Example organism Example chemical product Example ingredient",
      },
      {
        name: "Untrusted page",
        url: "https://example.com/untrusted",
        evidenceText: "Tomato early blight Example ingredient",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.equal(result.organicBiological.length, 1);
  assert.equal(result.chemical.length, 0);
  assert.equal(result.organicBiological[0]?.sourceName, "Official use record");
  assert.equal(result.organicBiological[0]?.productName, "Example biological product");
  assert.equal(result.organicBiological[0]?.brand, "Example brand");
  assert.equal(
    result.organicBiological[0]?.verificationStatus,
    "source_supported_needs_label_check",
  );
  assert.deepEqual(result.chemical, []);
  assert.equal(result.sources.length, 1);
  assert.deepEqual(result.organicBiological[0]?.precautions, []);
  assert.equal(result.organicBiological[0]?.dose, null);
  assert.equal(result.organicBiological[0]?.targetCrop, "Tomato");
  assert.equal("evidenceText" in result.sources[0]!, false);
});

test("keeps crop-specific organic practices only when an opened source supports them", () => {
  const organicManagement = {
    category: "sanitation",
    name: "Remove infected leaves",
    targetCrop: "Tomato",
    targetCondition: "Early blight",
    rationale: "Removing affected leaves may reduce local disease spread.",
    limitations: "It will not cure infection already present in the plant.",
    sourceUrl: "https://ppqs.gov.in/record",
  };
  const result = buildTreatmentGuidance(
    { ...modelResponse, organicManagement: [organicManagement] },
    [
      {
        name: "Tomato disease guidance",
        url: "https://ppqs.gov.in/record",
        evidenceText:
          "Tomato early blight. Remove infected leaves to reduce local disease spread. This does not cure infection in the plant.",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.equal(result.organicManagement.length, 1);
  assert.equal(result.organicManagement[0]?.sourceName, "Tomato disease guidance");
  assert.equal(result.organicManagement[0]?.verificationStatus, "source_supported");
  assert.equal(result.organicManagement[0]?.sourceUrl, organicManagement.sourceUrl);
});

test("drops organic practices without relevant crop, condition, and practice evidence", () => {
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicManagement: [
        {
          category: "organic_input",
          name: "Apply neem oil",
          targetCrop: "Tomato",
          targetCondition: "Early blight",
          rationale: "May reduce disease.",
          limitations: "Does not cure disease.",
          sourceUrl: "https://ppqs.gov.in/record",
        },
      ],
    },
    [
      {
        name: "Generic farming information",
        url: "https://ppqs.gov.in/record",
        evidenceText: "General safe pesticide handling guidance.",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.organicManagement, []);
});

test("rejects source-backed options for a pathogen not identified by the diagnosis", () => {
  const sourceUrl = "https://nhb.gov.in/tomato-guidance";
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicManagement: [
        {
          category: "biological_control",
          name: "Seed treatment with Trichoderma viride",
          targetCrop: "Tomato",
          targetCondition: "Septoria leaf spot",
          rationale: "The source describes the practice for the named pathogen.",
          limitations: "The diagnosis does not identify this pathogen.",
          sourceUrl,
        },
      ],
      organicBiological: [
        {
          ...modelResponse.organicBiological[0],
          targetCondition: "Septoria leaf spot",
          sourceUrl,
        },
      ],
    },
    [
      {
        name: "Tomato disease guidance",
        url: sourceUrl,
        evidenceText:
          "Tomato Septoria leaf spot. Seed treatment with Trichoderma viride. Example biological product Example brand Example organism.",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Likely leaf spot",
  );

  assert.deepEqual(result.organicManagement, []);
  assert.deepEqual(result.organicBiological, []);
});

test("does not classify synthetic fungicide seed treatments as organic management", () => {
  const sourceUrl = "https://nhb.gov.in/tomato-guidance";
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicManagement: [
        {
          category: "cultural",
          name: "Seed treatment with Thiram or Dithane M-45",
          targetCrop: "Tomato",
          targetCondition: "Septoria leaf spot",
          rationale: "The source describes seed treatment for this disease.",
          limitations: "These are chemical pesticide treatments.",
          sourceUrl,
        },
      ],
    },
    [
      {
        name: "Tomato disease guidance",
        url: sourceUrl,
        evidenceText: "Tomato Septoria leaf spot. Seed treatment with Thiram or Dithane M-45.",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Septoria leaf spot",
  );

  assert.deepEqual(result.organicManagement, []);
});

test("accepts a valid empty response without fabricating products or organic practices", () => {
  const result = buildTreatmentGuidance(
    {
      causeCategory: "uncertain",
      generalCare: ["Take another clear photo and seek local confirmation."],
      organicManagement: [],
      organicBiological: [],
      chemical: [],
    },
    [],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Leaf symptoms",
  );

  assert.deepEqual(result.organicManagement, []);
  assert.deepEqual(result.organicBiological, []);
  assert.deepEqual(result.chemical, []);
});

test("omits products that are not supported by a relevant opened source", () => {
  const result = buildTreatmentGuidance(
    modelResponse,
    [],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.organicBiological, []);
  assert.deepEqual(result.chemical, []);
  assert.equal(result.sourceStatus, "no_authoritative_sources");
  assert.deepEqual(result.generalCare, modelResponse.generalCare);
});

test("keeps source-supported active ingredients when no commercial product is verified", () => {
  const sourceUrl = "https://ppqs.gov.in/record";
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicBiological: [
        {
          ...modelResponse.organicBiological[0],
          productName: null,
          brand: null,
          activeIngredient: "Bacillus subtilis",
          recommendationType: "biological_control",
          sourceUrl,
        },
      ],
      chemical: [
        {
          ...modelResponse.chemical[0],
          productName: null,
          brand: null,
          activeIngredient: "Example ingredient",
          recommendationType: "active_ingredient",
          sourceUrl,
        },
      ],
    },
    [
      {
        name: "Official crop guidance",
        url: sourceUrl,
        evidenceText:
          "Tomato early blight Bacillus subtilis Example ingredient is listed for tomato early blight.",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.equal(result.organicBiological.length, 1);
  assert.equal(result.organicBiological[0]?.productName, "Bacillus subtilis");
  assert.equal(result.organicBiological[0]?.recommendationType, "biological_control");
  assert.equal(result.chemical.length, 1);
  assert.equal(result.chemical[0]?.productName, "Example ingredient");
  assert.equal(result.chemical[0]?.recommendationType, "active_ingredient");
});

test("normalizes supported model aliases and drops only malformed candidates", () => {
  const normalized = normalizeTreatmentModelResponse({
    cause: "Fungal",
    general_care: "Remove badly affected leaves.",
    organic_sprays: [
      {
        name: "Bacillus subtilis",
        active_ingredient: "Bacillus subtilis",
        crop: "Tomato",
        disease: "Early blight",
        purpose: "A biological control listed for the crop and disease.",
        source: { url: "https://icar.org.in/tomato-guidance" },
      },
      { name: "Incomplete recommendation" },
    ],
    inorganic: [],
  });

  assert.equal(normalized.causeCategory, "fungal");
  assert.deepEqual(normalized.generalCare, ["Remove badly affected leaves."]);
  assert.equal(normalized.organicBiological.length, 1);
  assert.equal(normalized.organicBiological[0]?.recommendationType, "biological_control");
  assert.equal(normalized.organicBiological[0]?.sourceUrl, "https://icar.org.in/tomato-guidance");
  assert.deepEqual(normalized.chemical, []);
});

test("accepts valid organic-only and inorganic-only model results", () => {
  const sourceUrl = "https://ppqs.gov.in/record";
  const organicOnly = buildTreatmentGuidance(
    { causeCategory: "fungal", organicBiological: [modelResponse.organicBiological[0]] },
    [
      {
        name: "Official organic guidance",
        url: sourceUrl,
        evidenceText:
          "Tomato early blight Example biological product Example brand Example organism",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );
  const inorganicOnly = buildTreatmentGuidance(
    {
      causeCategory: "fungal",
      inorganic: [{ ...modelResponse.chemical[0], sourceUrl }],
    },
    [
      {
        name: "Official chemical guidance",
        url: sourceUrl,
        evidenceText: "Tomato early blight Example chemical product Example ingredient",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.equal(organicOnly.organicBiological.length, 1);
  assert.deepEqual(organicOnly.chemical, []);
  assert.deepEqual(inorganicOnly.organicBiological, []);
  assert.equal(inorganicOnly.chemical.length, 1);
});

test("drops candidates for a different crop or condition than the diagnosis", () => {
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicBiological: [
        {
          ...modelResponse.organicBiological[0],
          targetCrop: "Corn",
          targetCondition: "Corn rust",
        },
      ],
    },
    [
      {
        name: "Tomato use record",
        url: "https://ppqs.gov.in/record",
        evidenceText:
          "Tomato early blight Example biological product Example brand Example organism",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.organicBiological, []);
});

test("does not return chemical candidates for a viral cause", () => {
  const result = buildTreatmentGuidance(
    { ...modelResponse, causeCategory: "viral" },
    [],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Mosaic virus",
  );

  assert.equal(result.chemical.length, 0);
  assert.equal(result.organicBiological.length, 0);
});

test("does not return any product candidates for an uncertain cause", () => {
  const result = buildTreatmentGuidance(
    { ...modelResponse, causeCategory: "uncertain" },
    [],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Leaf spots",
  );

  assert.deepEqual(result.organicBiological, []);
  assert.deepEqual(result.chemical, []);
});

test("limits candidates to three across organic and chemical sections", () => {
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicBiological: Array.from({ length: 3 }, (_, index) => ({
        ...modelResponse.organicBiological[0],
        productName: `Biological product ${index + 1}`,
        brand: null,
        activeIngredient: null,
        sourceUrl: "https://ppqs.gov.in/record",
      })),
      chemical: Array.from({ length: 3 }, (_, index) => ({
        ...modelResponse.chemical[0],
        productName: `Chemical product ${index + 1}`,
        activeIngredient: null,
        sourceUrl: "https://ppqs.gov.in/record",
      })),
    },
    [
      {
        name: "Official crop-use source",
        url: "https://ppqs.gov.in/record",
        evidenceText:
          "Tomato early blight Biological product 1 Biological product 2 Biological product 3 Chemical product 1 Chemical product 2 Chemical product 3",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.equal(result.organicBiological.length + result.chemical.length, 3);
});

test("does not treat a source as support when crop, condition, or ingredient evidence is missing", () => {
  const result = buildTreatmentGuidance(
    modelResponse,
    [
      {
        name: "Official generic guidance",
        url: "https://ppqs.gov.in/record",
        evidenceText: "Official pesticide safety information with no crop-specific use listed.",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.organicBiological, []);
  assert.deepEqual(result.chemical, []);
  assert.equal(result.sourceStatus, "sources_found");
});

test("does not source-support a commercial name from ingredient evidence alone", () => {
  const result = buildTreatmentGuidance(
    modelResponse,
    [
      {
        name: "Official use record",
        url: "https://ppqs.gov.in/record",
        evidenceText: "Tomato early blight Example ingredient",
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.chemical, []);
});

test("does not combine unrelated evidence from distant parts of one source page", () => {
  const result = buildTreatmentGuidance(
    modelResponse,
    [
      {
        name: "Official use record",
        url: "https://ppqs.gov.in/record",
        evidenceText: [
          "L1: Tomato use records",
          "L2: Other crops and conditions",
          "L3: More unrelated records",
          "L4: More unrelated records",
          "L5: More unrelated records",
          "L6: Early blight listed for a different formulation",
          "L7: Other records",
          "L8: Other records",
          "L9: Example organism listed for a different crop",
        ].join("\n"),
      },
    ],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.organicBiological, []);
  assert.deepEqual(result.chemical, []);
});

test("rejects malformed model output", () => {
  assert.throws(() =>
    buildTreatmentGuidance(
      { ...modelResponse, chemical: "not-an-array" },
      [],
      "",
      "Tomato",
      "Early blight",
    ),
  );
});

test("omits unsupported products and their model-generated directions", () => {
  const result = buildTreatmentGuidance(
    {
      ...modelResponse,
      organicBiological: [
        {
          ...modelResponse.organicBiological[0],
          applicationMethod: "Spray directly on leaves",
          dose: null,
          sourceUrl: "https://fake.gov.in/label",
        },
      ],
    },
    [],
    "2026-10-23T00:00:00.000Z",
    "Tomato",
    "Early blight",
  );

  assert.deepEqual(result.organicBiological, []);
});

test("extracts only official pages actually opened by Groq browser search", () => {
  const sources = extractTreatmentSources([
    {
      name: "browser.search",
      output: "L1: URL: https://exa.ai/search?q=tomato",
    },
    {
      name: "browser.open",
      output:
        "L0: \nL1: URL: https://ppqs.gov.in/record\nL2: ```\nL3: Major Uses of Pesticides | GOI\nL4: Tomato early blight Example ingredient",
    },
    {
      name: "browser.open",
      output: "L1: URL: https://example.com/record\nL2: Tomato early blight Example ingredient",
    },
  ]);

  assert.deepEqual(sources, [
    {
      name: "Major Uses of Pesticides | GOI",
      url: "https://ppqs.gov.in/record",
      evidenceText:
        "L0: \nL1: URL: https://ppqs.gov.in/record\nL2: ```\nL3: Major Uses of Pesticides | GOI\nL4: Tomato early blight Example ingredient",
    },
  ]);
});

test("ignores malformed browser-open URLs without failing the response pipeline", () => {
  assert.deepEqual(
    extractTreatmentSources([
      {
        name: "browser.open",
        output: "L1: URL: https://[\nL2: malformed source response",
      },
    ]),
    [],
  );
});
