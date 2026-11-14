import assert from "node:assert/strict";
import test from "node:test";

import {
  analyseCropPhoto,
  cropImageDataUrlSchema,
  decodeCropImageDataUrl,
  validStoredSprayRecommendations,
} from "./diagnose.server.ts";

function jpegDataUrl() {
  const imageBytes = Buffer.alloc(80);
  imageBytes.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  imageBytes.set([0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0x64, 0x03], 20);
  imageBytes.set([0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00, 0xff, 0xd9], 30);
  return `data:image/jpeg;base64,${imageBytes.toString("base64")}`;
}

const validRecommendation = {
  productOrFormulation: null,
  activeIngredient: "Bacillus subtilis",
  targetCrop: "Tomato",
  targetProblem: "Early blight",
  whyRelevant: "A previously recorded suggestion.",
  precautions: [],
  dosage: null,
  preHarvestInterval: null,
  sourceName: null,
  sourceUrl: null,
  verificationStatus: "verification_required",
};

test("accepts an image URL only when its encoded bytes match its declared type", () => {
  const image = jpegDataUrl();
  const decoded = decodeCropImageDataUrl(image);

  assert.equal(decoded.mime, "image/jpeg");
  assert.equal(decoded.ext, "jpg");
  assert.deepEqual([...decoded.bytes.slice(0, 3)], [0xff, 0xd8, 0xff]);
  assert.equal(cropImageDataUrlSchema.safeParse(image).success, true);
  assert.equal(
    cropImageDataUrlSchema.safeParse(image.replace("image/jpeg", "image/svg+xml")).success,
    false,
  );
  assert.throws(() =>
    decodeCropImageDataUrl(`data:image/jpeg;base64,${Buffer.alloc(80, 1).toString("base64")}`),
  );
});

test("rejects encoded image requests above the size limit", () => {
  const oversized = `data:image/jpeg;base64,${"A".repeat(6_000_000)}`;
  assert.equal(cropImageDataUrlSchema.safeParse(oversized).success, false);
});

test("rejects truncated image headers and implausibly large dimensions", () => {
  const truncated = Buffer.alloc(80);
  truncated.set([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11]);
  assert.throws(() =>
    decodeCropImageDataUrl(`data:image/jpeg;base64,${truncated.toString("base64")}`),
  );

  const tooLarge = Buffer.from(jpegDataUrl().split(",")[1]!, "base64");
  tooLarge[25] = 0x1b;
  tooLarge[26] = 0x58;
  tooLarge[27] = 0x1b;
  tooLarge[28] = 0x58;
  assert.throws(() =>
    decodeCropImageDataUrl(`data:image/jpeg;base64,${tooLarge.toString("base64")}`),
  );
});

test("drops malformed legacy spray records without losing valid records", () => {
  assert.deepEqual(
    validStoredSprayRecommendations([validRecommendation, { productOrFormulation: "broken" }]),
    [validRecommendation],
  );
  assert.deepEqual(validStoredSprayRecommendations({ legacy: "invalid" }), []);
});

test("sends the supplied image to Groq and returns structured diagnosis data", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  const image = jpegDataUrl();
  let requestBody: Record<string, unknown> | undefined;
  process.env["GROQ_API_KEY"] = "test-groq-key";
  process.env["GROQ_SPRAY_API_KEY"] = "test-spray-key";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-groq-key");
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                usable: true,
                crop: "Tomato",
                condition: "Possible early blight",
                confidence: 64,
                issueType: null,
                symptoms: ["Concentric leaf spots"],
                uncertaintyNote: "Other leaf problems may look similar.",
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const result = await analyseCropPhoto({ image, lang: "en" });
    const messages = requestBody?.["messages"] as
      | { role: string; content: string | { type: string; image_url?: { url: string } }[] }[]
      | undefined;
    const userContent = messages?.find((message) => message.role === "user")?.content;

    assert.equal(requestBody?.["model"], "qwen/qwen3.8-27b");
    assert.ok(Array.isArray(userContent));
    assert.equal(userContent[1]?.image_url?.url, image);
    assert.equal(result.ok, true);
    if (!result.ok || !result.usable) return;
    assert.equal(result.crop, "Tomato");
    assert.equal(result.condition, "Possible early blight");
    assert.equal(result.confidence, 64);
    assert.equal(result.sprayRecommendations.length, 0);
    assert.ok(result.uncertaintyNote);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["GROQ_API_KEY"];
    else process.env["GROQ_API_KEY"] = originalApiKey;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("reports provider failures and malformed model output without fabricating a diagnosis", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  const originalSprayApiKey = process.env["GROQ_SPRAY_API_KEY"];
  const originalConsoleError = console.error;
  process.env["GROQ_API_KEY"] = "test-groq-key";
  process.env["GROQ_SPRAY_API_KEY"] = "test-spray-key";
  console.error = () => {};

  try {
    globalThis.fetch = (async () => new Response("quota", { status: 429 })) as typeof fetch;
    const busy = await analyseCropPhoto({ image: jpegDataUrl(), lang: "en" });
    assert.equal(busy.ok, false);
    if (busy.ok) return;
    assert.equal(busy.reason, "busy");

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: "not valid JSON" } }] }), {
        status: 200,
      })) as typeof fetch;
    const malformed = await analyseCropPhoto({ image: jpegDataUrl(), lang: "en" });
    assert.equal(malformed.ok, false);
    if (malformed.ok) return;
    assert.equal(malformed.reason, "invalid_response");
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
    if (originalApiKey === undefined) delete process.env["GROQ_API_KEY"];
    else process.env["GROQ_API_KEY"] = originalApiKey;
    if (originalSprayApiKey === undefined) delete process.env["GROQ_SPRAY_API_KEY"];
    else process.env["GROQ_SPRAY_API_KEY"] = originalSprayApiKey;
  }
});

test("takes one focused second look only for an inconclusive low-confidence diagnosis", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  let calls = 0;
  let secondLookText = "";
  process.env["GROQ_API_KEY"] = "ordinary-ai-test-key";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    calls += 1;
    const body = JSON.parse(String(init?.body)) as {
      messages: { content: string | { type: string; text?: string }[] }[];
    };
    if (calls === 2) {
      const content = body.messages[1]?.content;
      if (Array.isArray(content)) secondLookText = content[0]?.text ?? "";
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                usable: true,
                issueType: null,
                crop: "Tomato",
                condition: calls === 1 ? "Possible leaf spot" : "Possible early blight",
                confidence: calls === 1 ? 40 : 58,
                symptoms: ["Concentric spots"],
                causes: ["Bacterial spot is another possibility."],
                uncertaintyNote: "A field check is needed.",
              }),
            },
          },
        ],
      }),
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    const result = await analyseCropPhoto({ image: jpegDataUrl(), lang: "en" });
    assert.equal(calls, 2);
    assert.match(secondLookText, /focused second look/i);
    assert.equal(result.ok, true);
    if (!result.ok || !result.usable) return;
    assert.equal(result.condition, "Possible early blight");
    assert.equal(result.confidence, 58);
    assert.ok(result.uncertaintyNote);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["GROQ_API_KEY"];
    else process.env["GROQ_API_KEY"] = originalApiKey;
  }
});

test("does not retry analysis automatically when the first result is confident", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  let calls = 0;
  process.env["GROQ_API_KEY"] = "ordinary-ai-test-key";
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                usable: true,
                crop: "Tomato",
                condition: "Leaf spot",
                confidence: 72,
              }),
            },
          },
        ],
      }),
      { status: 200 },
    );
  }) as typeof fetch;

  try {
    await analyseCropPhoto({ image: jpegDataUrl(), lang: "en" });
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env["GROQ_API_KEY"];
    else process.env["GROQ_API_KEY"] = originalApiKey;
  }
});

test("handles a missing ordinary diagnosis key without making a provider request", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env["GROQ_API_KEY"];
  delete process.env["GROQ_API_KEY"];
  globalThis.fetch = (async () => {
    throw new Error("Provider must not be called without the diagnosis key");
  }) as typeof fetch;

  try {
    const result = await analyseCropPhoto({ image: jpegDataUrl(), lang: "en" });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.reason, "not_configured");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey !== undefined) process.env["GROQ_API_KEY"] = originalApiKey;
  }
});
