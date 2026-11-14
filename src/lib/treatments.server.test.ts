import assert from "node:assert/strict";
import test from "node:test";

import { retrieveTreatmentGuidance, TreatmentProviderError } from "./treatments.server.ts";

const diagnosis = {
  detectedCrop: "Tomato",
  selectedCrop: "Tomato",
  condition: "Possible early blight",
  alternativeConditions: ["Nutrient stress"],
  severity: "moderate",
  confidence: 68,
  uncertaintyNote: "Other leaf problems can look similar.",
  symptoms: ["Concentric leaf spots"],
};

const modelOutput = {
  disease: "Tomato early blight",
  organic_sprays: [
    {
      name: "Neem Oil 10000 ppm",
      dosage: "2 ml/L",
    },
  ],
  inorganic_sprays: [
    {
      name: "Mancozeb 75% WP",
      dosage: "2.5 kg/ha",
    },
  ],
  non_chemical_steps: [
    "Rotate crops with non-host species",
    "Remove and destroy infected lower leaves",
  ],
};

test("uses only the spray-specific Groq key for treatment research", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  let requestBody: Record<string, unknown> | undefined;
  process.env["GROQ_API_KEY"] = "ordinary-ai-test-key";
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer spray-only-test-key");
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(modelOutput),
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const result = await retrieveTreatmentGuidance({ ...diagnosis, selectedCrop: "Potato" }, "en");

    assert.equal(requestBody?.["model"], "openai/gpt-oss-120b");
    assert.equal(requestBody?.["max_completion_tokens"], 2400);
    assert.deepEqual(requestBody?.["response_format"], { type: "json_object" });
    assert.equal(requestBody?.["temperature"], 0.2);
    assert.equal(result.organic_sprays.length, 1);
    assert.equal(result.organic_sprays[0]?.name, "Neem Oil 10000 ppm");
    assert.equal(result.organic_sprays[0]?.dosage, "2 ml/L");
    assert.equal(result.inorganic_sprays.length, 1);
    assert.equal(result.inorganic_sprays[0]?.name, "Mancozeb 75% WP");
    assert.equal(result.inorganic_sprays[0]?.dosage, "2.5 kg/ha");
    assert.equal(result.non_chemical_steps.length, 2);
    const messages = requestBody?.["messages"] as { content: string }[] | undefined;
    assert.match(
      messages?.[0]?.content ?? "",
      /You are an expert agronomist/,
    );
    assert.match(
      messages?.[0]?.content ?? "",
      /Mancozeb 75% WP/,
    );
    assert.match(
      messages?.[1]?.content ?? "",
      /Crop: Tomato, Disease: Possible early blight/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["GROQ_API_KEY"];
    else process.env["GROQ_API_KEY"] = originalApiKey;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("produces verified organic and inorganic recommendations from the diagnosis context", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify(modelOutput),
            },
          },
        ],
      }),
      { status: 200 },
    )) as typeof fetch;

  try {
    const result = await retrieveTreatmentGuidance(diagnosis, "en");
    assert.equal(result.organic_sprays.length, 1);
    assert.equal(result.inorganic_sprays.length, 1);
    assert.equal(result.organic_sprays[0]?.name, "Neem Oil 10000 ppm");
    assert.equal(result.organic_sprays[0]?.dosage, "2 ml/L");
    assert.equal(result.inorganic_sprays[0]?.name, "Mancozeb 75% WP");
    assert.equal(result.inorganic_sprays[0]?.dosage, "2.5 kg/ha");
    assert.equal(result.non_chemical_steps.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("parses a complete response returned in a fenced JSON block with opened evidence", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: `\`\`\`json\n${JSON.stringify(modelOutput)}\n\`\`\``,
            },
          },
        ],
      }),
      { status: 200 },
    )) as typeof fetch;

  try {
    const result = await retrieveTreatmentGuidance(diagnosis, "en");
    assert.equal(result.organic_sprays.length, 1);
    assert.equal(result.inorganic_sprays.length, 1);
    assert.equal(result.organic_sprays[0]?.name, "Neem Oil 10000 ppm");
    assert.equal(result.inorganic_sprays[0]?.name, "Mancozeb 75% WP");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("passes uncertain diagnosis context to Groq but suppresses product candidates below the confidence threshold", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  let requestMessage = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as {
      messages: { content: string }[];
    };
    requestMessage = body.messages[1]?.content ?? "";
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: JSON.stringify(modelOutput) } }],
      }),
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    const result = await retrieveTreatmentGuidance({ ...diagnosis, confidence: 30 }, "en");
    assert.match(requestMessage, /Crop: Tomato, Disease: Possible early blight/);
    assert.equal(result.organic_sprays.length, 1);
    assert.equal(result.inorganic_sprays.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("does not retry an uncertain network failure", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  let attempts = 0;
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () => {
    attempts += 1;
    throw new TypeError("network connection reset");
  }) as typeof fetch;

  try {
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en"),
      (error: unknown) =>
        error instanceof TreatmentProviderError && error.code === "TREATMENT_PROVIDER_UNAVAILABLE",
    );
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("classifies provider timeouts without retrying", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  let attempts = 0;
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () => {
    attempts += 1;
    throw new DOMException("upstream timeout detail", "TimeoutError");
  }) as typeof fetch;

  try {
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en"),
      (error: unknown) => error instanceof Error && error.message === "TREATMENT_PROVIDER_TIMEOUT",
    );
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("does not retry provider server errors", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  let attempts = 0;
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () => {
    attempts += 1;
    return new Response("private provider detail", { status: 503 });
  }) as typeof fetch;

  try {
    const requestId = crypto.randomUUID();
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en", requestId),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "TREATMENT_PROVIDER_UNAVAILABLE" &&
        "status" in error &&
        error.status === 503 &&
        "requestId" in error &&
        error.requestId === requestId,
    );
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("classifies provider authentication failures without exposing upstream body", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response("secret authorization detail", { status: 401 })) as typeof fetch;

  try {
    const requestId = crypto.randomUUID();
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en", requestId),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "TREATMENT_PROVIDER_AUTH_FAILED" &&
        "status" in error &&
        error.status === 401 &&
        !error.message.includes("secret authorization detail"),
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("classifies Groq generated-output parse failures without leaking private details", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  let attempts = 0;
  globalThis.fetch = (async () => {
    attempts += 1;
    return new Response(
      JSON.stringify({
        error: {
          type: "invalid_request_error",
          message:
            "Parsing failed. The model generated output that could not be parsed. Please adjust your prompt. See 'failed_generation' for more details. Diagnosis: Possible early blight; token=secret-value https://private.example/path",
        },
      }),
      { status: 400 },
    );
  }) as typeof fetch;

  try {
    await assert.rejects(retrieveTreatmentGuidance(diagnosis, "en"), (error: unknown) => {
      assert.ok(error instanceof TreatmentProviderError);
      assert.equal(error.code, "TREATMENT_PROVIDER_INVALID_RESPONSE");
      assert.equal(error.status, 400);
      assert.equal(error.providerErrorType, "invalid_request_error");
      assert.match(error.providerMessage ?? "", /model generated output that could not be parsed/i);
      assert.equal(error.failureStage, "provider_output_parsing");
      assert.doesNotMatch(
        error.providerMessage ?? "",
        /Possible early blight|secret-value|private\.example/,
      );
      return true;
    });
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("turns provider rate limits into a safe recoverable error", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response("private upstream detail", { status: 429 })) as typeof fetch;

  try {
    const requestId = crypto.randomUUID();
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en", requestId),
      (error: unknown) =>
        error instanceof Error &&
        error.message === "TREATMENT_PROVIDER_RATE_LIMITED" &&
        "status" in error &&
        error.status === 429 &&
        "requestId" in error &&
        error.requestId === requestId,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("captures only documented rate-limit headers and does not retry a 429", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  let attempts = 0;
  globalThis.fetch = (async () => {
    attempts += 1;
    return new Response(
      JSON.stringify({
        error: {
          type: "rate_limit_exceeded",
          message:
            "Rate limit reached for this request. Diagnosis: Possible early blight. token=secret-value https://private.example/path",
        },
      }),
      {
        status: 429,
        headers: {
          "retry-after": "142",
          "x-ratelimit-limit-requests": "1000",
          "x-ratelimit-remaining-requests": "1000",
          "x-ratelimit-reset-requests": "1ms",
          "x-ratelimit-limit-tokens": "8000",
          "x-ratelimit-remaining-tokens": "8000",
          "x-ratelimit-reset-tokens": "1ms",
        },
      },
    );
  }) as typeof fetch;

  try {
    await assert.rejects(retrieveTreatmentGuidance(diagnosis, "en"), (error: unknown) => {
      assert.ok(error instanceof TreatmentProviderError);
      assert.equal(error.message, "TREATMENT_PROVIDER_RATE_LIMITED;retry_after_ms=142000");
      assert.deepEqual(error.rateLimit, {
        retryAfterMs: 142_000,
        requestsLimit: 1000,
        requestsRemaining: 1000,
        requestsResetMs: 1,
        tokensLimit: 8000,
        tokensRemaining: 8000,
        tokensResetMs: 1,
      });
      assert.equal(error.providerErrorType, "rate_limit_exceeded");
      const providerMessage = error.providerMessage;
      assert.match(providerMessage ?? "", /Rate limit reached for this request/);
      assert.doesNotMatch(
        providerMessage ?? "",
        /Possible early blight|secret-value|private\.example/,
      );
      assert.doesNotMatch(error.message, /rate_limit_exceeded|Possible early blight|secret-value/);
      assert.doesNotMatch(JSON.stringify(error), /rate_limit_exceeded|Rate limit reached/);
      return true;
    });
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("rejects malformed structured model output without exposing its contents", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({ choices: [{ message: { content: "not-json-private-upstream-detail" } }] }),
      { status: 200 },
    )) as typeof fetch;

  try {
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en"),
      (error: unknown) =>
        error instanceof TreatmentProviderError &&
        error.message === "TREATMENT_PROVIDER_INVALID_RESPONSE" &&
        error.failureStage === "invalid_json",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("rejects incomplete structured model output", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ causeCategory: "fungal" }) } }],
      }),
      { status: 200 },
    )) as typeof fetch;

  try {
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en"),
      (error: unknown) =>
        error instanceof TreatmentProviderError &&
        error.message === "TREATMENT_PROVIDER_INVALID_RESPONSE" &&
        error.failureStage === "schema_validation",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("classifies provider responses truncated at the completion limit without exposing content", async () => {
  const originalFetch = globalThis.fetch;
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_SPRAY_API_KEY"] = "spray-only-test-key";
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            finish_reason: "length",
            message: { content: null, executed_tools: [] },
          },
        ],
      }),
      { status: 200 },
    )) as typeof fetch;

  try {
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en"),
      (error: unknown) =>
        error instanceof TreatmentProviderError &&
        error.message === "TREATMENT_PROVIDER_INVALID_RESPONSE" &&
        error.failureStage === "truncated_content",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("requires the spray-specific key even when the ordinary Groq key exists", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  process.env["GROQ_API_KEY"] = "ordinary-ai-test-key";
  delete process.env["GROQ_SPRAY_API_KEY"];
  let providerRequested = false;
  globalThis.fetch = (async () => {
    providerRequested = true;
    throw new Error("Treatment request must not be sent without the spray key");
  }) as typeof fetch;

  try {
    await assert.rejects(
      retrieveTreatmentGuidance(diagnosis, "en"),
      (error: unknown) =>
        error instanceof Error && error.message === "TREATMENT_PROVIDER_NOT_CONFIGURED",
    );
    assert.equal(providerRequested, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["GROQ_API_KEY"];
    else process.env["GROQ_API_KEY"] = originalApiKey;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});
