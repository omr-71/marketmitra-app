import { z } from "zod";

const spraySuggestionBaseSchema = z.object({
  productOrFormulation: z.string().trim().min(1).max(120).nullable(),
  activeIngredient: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((value) => !/\b(?:or|and)\b|[,/]/i.test(value)),
  targetCrop: z.string().trim().min(1).max(80),
  targetProblem: z.string().trim().min(1).max(120),
  whyRelevant: z.string().trim().min(1).max(300),
  precautions: z.array(z.string().trim().min(1).max(120)).max(2),
});

function isSpecificSpraySuggestion(recommendation: z.infer<typeof spraySuggestionBaseSchema>) {
  return (
    !recommendation.productOrFormulation ||
    !/\b(?:general|broad[- ]spectrum)\s+(?:protective\s+)?(?:fungicide|insecticide|pesticide)\b/i.test(
      recommendation.productOrFormulation,
    )
  );
}

export const sprayRecommendationSchema = spraySuggestionBaseSchema
  .extend({
    dosage: z.null(),
    preHarvestInterval: z.null(),
    sourceName: z.null(),
    sourceUrl: z.null(),
    verificationStatus: z.literal("verification_required"),
  })
  .refine(isSpecificSpraySuggestion);

export type SprayRecommendation = z.infer<typeof sprayRecommendationSchema>;

export type DiagnosisOk = {
  ok: true;
  usable: true;
  savedId?: string;
  crop: string;
  condition: string;
  confidence: number | null;
  severity: string | null;
  symptoms: string[];
  causes: string[];
  conditionsFavouring: string[];
  whatItIs: string;
  whyItHappens: string;
  whatToDoNow: string[];
  prevention: string[];
  monitoring: string[];
  sprayRecommendations: SprayRecommendation[];
  uncertaintyNote: string | null;
  analysedAt: string;
  model: string;
};

export type DiagnosisUnusable = {
  ok: true;
  usable: false;
  issueType: "image_quality" | "not_crop" | "inconclusive";
  imageIssues: string[];
  advice: string;
  analysedAt: string;
};

export type DiagnosisFailure = {
  ok: false;
  reason:
    | "not_configured"
    | "busy"
    | "no_credits"
    | "unavailable"
    | "invalid_image"
    | "invalid_response"
    | "timeout";
  message: string;
  fallbackTried?: boolean;
};

export type DiagnosisResult = DiagnosisOk | DiagnosisUnusable | DiagnosisFailure;

export type DiagnoseInput = {
  image: string;
  lang: "en" | "mr" | "hi";
  cropHint?: string | undefined;
};

export const cropImageDataUrlSchema = z
  .string()
  .min(100)
  .max(6_000_000)
  .regex(/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/);

export function decodeCropImageDataUrl(image: string) {
  const validatedImage = cropImageDataUrlSchema.parse(image);
  const [head, body] = validatedImage.split(",");
  const mime = /^data:(image\/(?:jpeg|jpg|png|webp));base64$/.exec(head ?? "")?.[1];
  if (!mime || !body) throw new Error("Invalid crop image.");

  const binary = atob(body);
  if (binary.length === 0 || binary.length > 4_500_000) {
    throw new Error("Crop image is empty or too large.");
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const isJpeg =
    (mime === "image/jpeg" || mime === "image/jpg") &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  const isPng =
    mime === "image/png" &&
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    mime === "image/webp" &&
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!isJpeg && !isPng && !isWebp) {
    throw new Error("Crop image content does not match its file type.");
  }

  const dimensions = isJpeg
    ? jpegDimensions(bytes)
    : isPng
      ? { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) }
      : webpDimensions(bytes);
  if (
    !dimensions ||
    dimensions.width < 64 ||
    dimensions.height < 64 ||
    dimensions.width * dimensions.height > 40_000_000
  ) {
    throw new Error("Crop image dimensions are invalid.");
  }

  return {
    bytes,
    mime,
    ext: mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg",
  };
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    (((bytes[offset] ?? 0) << 24) |
      ((bytes[offset + 1] ?? 0) << 16) |
      ((bytes[offset + 2] ?? 0) << 8) |
      (bytes[offset + 3] ?? 0)) >>>
    0
  );
}

function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xda || marker === 0xd9) break;
    if (
      marker === undefined ||
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      continue;
    }
    const segmentLength = ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame) {
      if (segmentLength < 8) return null;
      return {
        height: ((bytes[offset + 3] ?? 0) << 8) | (bytes[offset + 4] ?? 0),
        width: ((bytes[offset + 5] ?? 0) << 8) | (bytes[offset + 6] ?? 0),
      };
    }
    offset += segmentLength;
  }
  return null;
}

function webpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const chunkType = String.fromCharCode(...bytes.slice(12, 16));
  if (chunkType === "VP8X" && bytes.length >= 30) {
    const width = 1 + (bytes[24] ?? 0) + ((bytes[25] ?? 0) << 8) + ((bytes[26] ?? 0) << 16);
    const height = 1 + (bytes[27] ?? 0) + ((bytes[28] ?? 0) << 8) + ((bytes[29] ?? 0) << 16);
    return { width, height };
  }
  if (
    chunkType === "VP8 " &&
    bytes.length >= 30 &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    return {
      width: ((bytes[26] ?? 0) | ((bytes[27] ?? 0) << 8)) & 0x3fff,
      height: ((bytes[28] ?? 0) | ((bytes[29] ?? 0) << 8)) & 0x3fff,
    };
  }
  if (chunkType === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const bits =
      (bytes[21] ?? 0) |
      ((bytes[22] ?? 0) << 8) |
      ((bytes[23] ?? 0) << 16) |
      ((bytes[24] ?? 0) << 24);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
  }
  return null;
}

const langName = {
  en: "English",
  mr: "Marathi (मराठी)",
  hi: "Hindi (हिंदी)",
} as const;

const modelSchema = z
  .object({
    usable: z.boolean(),

    issueType: z.enum(["image_quality", "not_crop", "inconclusive"]).nullable().optional(),

    imageIssues: z.array(z.string().max(160)).max(4).nullable().optional(),

    advice: z.string().max(250).nullable().optional(),

    crop: z.string().max(80).nullable().optional(),

    condition: z.string().max(120).nullable().optional(),

    confidence: z.number().int().min(1).max(95).nullable().optional(),

    severity: z.string().max(60).nullable().optional(),

    symptoms: z.array(z.string().max(120)).max(3).nullable().optional(),

    causes: z.array(z.string().max(120)).max(3).nullable().optional(),

    conditionsFavouring: z.array(z.string().max(120)).max(3).nullable().optional(),

    whatItIs: z.string().max(250).nullable().optional(),

    whyItHappens: z.string().max(200).nullable().optional(),

    whatToDoNow: z.array(z.string().max(120)).max(3).nullable().optional(),

    prevention: z.array(z.string().max(120)).max(3).nullable().optional(),

    monitoring: z.array(z.string().max(120)).max(2).nullable().optional(),

    uncertaintyNote: z.string().max(250).nullable().optional(),
  })
  .superRefine((result, context) => {
    if (!result.usable) return;
    if (!result.crop?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["crop"],
        message: "Required for a usable diagnosis",
      });
    }
    if (!result.condition?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["condition"],
        message: "Required for a usable diagnosis",
      });
    }
    if (result.confidence == null) {
      context.addIssue({
        code: "custom",
        path: ["confidence"],
        message: "Required for a usable diagnosis",
      });
    }
  });

/*
 * Direct Groq vision model.
 *
 * qwen/qwen3.8-27b supports:
 * - image input
 * - JSON mode
 * - multilingual output
 * - reasoning
 */
const MODEL = "qwen/qwen3.8-27b";

export function validStoredSprayRecommendations(value: unknown): SprayRecommendation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = sprayRecommendationSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

const SYSTEM = `
You are a careful plant pathology assistant for Indian smallholder farmers.

Your job is to inspect ONLY the supplied crop image and report what the image actually supports.

IMPORTANT RULES:

1. IMAGE QUALITY FIRST
Before diagnosing anything, inspect the image quality.

If the photo is:
- blurry
- too dark
- over-exposed
- too far away
- badly framed
- blocked
- not clearly showing a crop plant, leaf, fruit, stem, or affected area

then set:
"usable": false
"issueType": "image_quality"

List the concrete image problems in imageIssues and give simple advice for taking a better photo.

Do NOT diagnose an unclear image. If no crop or plant is visible, use
issueType "not_crop". If a plant is visible but the cause cannot be
distinguished, use issueType "inconclusive".

2. IDENTIFY THE TYPE OF PROBLEM
When the image allows it, distinguish between:
- healthy plant
- disease
- pest damage
- nutrient deficiency
- physical damage
- weather/environmental damage

If the evidence is insufficient, do not invent an answer.
Compare fungal, bacterial, viral, pest-related, nutrient, environmental and
physical causes when relevant. Rank up to three plausible alternatives in
"causes", and include a brief visible clue or distinguishing check for each.
Do not present an assumed cause as an observed symptom.

3. NO FALSE CERTAINTY
Never invent a diagnosis.

If several conditions could explain the visible symptoms:
- explain the uncertainty
- lower confidence
- use uncertaintyNote

Confidence must be an honest integer from 1 to 95.

Never use 100.

4. FARMER-SAFE ACTIONS
Give practical, generic and label-driven guidance.

Allowed:
- removing severely affected plant material where appropriate
- sanitation
- field monitoring
- irrigation management
- avoiding unnecessary plant stress
- checking nearby plants
- improving airflow where appropriate
- crop hygiene
- contacting a local KVK or agriculture officer

Separate immediate care for the visible problem from prevention steps.
Explain possible crop impact cautiously in whatItIs; do not state that damage will occur.
Only suggest non-chemical field practices when they fit the visible condition.
Do not label a product, treatment or practice as certified organic or officially verified.

8. SPRAY RESEARCH
Do not recommend or name spray products or active ingredients in this image
analysis. The app has a separate source-retrieval service for treatment options.
Do not include spray suggestions in the response.

5. LANGUAGE
Every string value must be written in the requested language.

JSON keys must remain in English.

6. STYLE
Use short, simple sentences suitable for a farmer using a phone.

Do not use unnecessary technical jargon.
Keep each list to at most 3 brief items and each explanation to no more than
2 short sentences so the complete JSON response stays concise.

7. OUTPUT
Return ONLY one valid JSON object.

No Markdown.
No code fences.
No explanation outside JSON.
`;

function userText(data: DiagnoseInput, focusedSecondLook = false) {
  return `
Analyse this crop photo carefully.

${focusedSecondLook ? "This is one focused second look because the first assessment was inconclusive. Compare only evidence visible in the photo and identify which additional symptom or field observation would best distinguish the leading possibilities. Do not force a disease identification.\n" : ""}
${
  data.cropHint
    ? `The farmer thinks the crop may be: ${data.cropHint}.
Verify the crop from the image and correct it if necessary.
`
    : ""
}

Answer language: ${langName[data.lang]}.

Return JSON with exactly these keys:

{
  "usable": boolean,
  "issueType": "image_quality" | "not_crop" | "inconclusive" | null,
  "imageIssues": string[],
  "advice": string,
  "crop": string,
  "condition": string,
  "confidence": integer,
  "severity": string or null,
  "symptoms": string[],
  "causes": string[],
  "conditionsFavouring": string[],
  "whatItIs": string,
  "whyItHappens": string,
  "whatToDoNow": string[],
  "prevention": string[],
  "monitoring": string[],
  "uncertaintyNote": string or null
}

If usable is false:
- set issueType to the best matching reason
- fill imageIssues
- fill advice
- leave diagnosis fields empty or null

If usable is true:
- identify the most likely condition supported by the image
- put observed signs in symptoms; put alternatives and distinguishing checks in causes
- if the visible pattern is only a syndrome such as "leaf spot", do not turn it into a specific fungal or bacterial pathogen; name plausible causes and the signs or field checks that distinguish them
- include useful discriminating observations in causes, for example whether spots are water-soaked, have halos, show concentric rings, have visible growth, or occur with insect vectors, only when applicable to this crop and image
- explain what visible evidence supports the leading possibility in whyItHappens
- fill the diagnosis fields
- use confidence from 1 to 95
- only set severity when the image genuinely supports it
- otherwise use null
- do not provide spray products, active ingredients, dosages, or treatment citations;
  treatment guidance is retrieved separately from opened agricultural sources

Set uncertaintyNote whenever:
- confidence is below 70
- multiple conditions are plausible
- the visible symptoms are ambiguous
- additional evidence would be useful
`;
}

type Attempt =
  | {
      kind: "result";
      result: DiagnosisOk | DiagnosisUnusable;
    }
  | {
      kind: "retryable";
      reason: DiagnosisFailure["reason"];
      message: string;
    };

async function callGroq(data: DiagnoseInput, focusedSecondLook = false): Promise<Attempt> {
  const apiKey = process.env["GROQ_API_KEY"];

  if (!apiKey) {
    return {
      kind: "retryable",
      reason: "not_configured",
      message: "Groq image analysis is not configured.",
    };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model: MODEL,

        messages: [
          {
            role: "system",
            content: SYSTEM,
          },

          {
            role: "user",
            content: [
              {
                type: "text",
                text: userText(data, focusedSecondLook),
              },

              {
                type: "image_url",
                image_url: {
                  url: data.image,
                },
              },
            ],
          },
        ],

        response_format: {
          type: "json_object",
        },

        temperature: 0.2,

        max_completion_tokens: 1000,

        reasoning_effort: "none",

        reasoning_format: "hidden",
      }),
      signal: AbortSignal.timeout(40_000),
    });

    if (!response.ok) {
      console.error(`Groq disease AI failed [${response.status}]`);

      if (response.status === 401 || response.status === 403) {
        return {
          kind: "retryable",
          reason: "not_configured",
          message:
            "Image analysis is unavailable because its server configuration needs attention.",
        };
      }

      if (response.status === 429) {
        return {
          kind: "retryable",
          reason: "busy",
          message: "Image analysis is temporarily busy.",
        };
      }

      if (response.status === 402) {
        return {
          kind: "retryable",
          reason: "no_credits",
          message: "Image analysis quota has been reached.",
        };
      }

      return {
        kind: "retryable",
        reason: "unavailable",
        message: "Image analysis is temporarily unavailable.",
      };
    }

    const json = z
      .object({
        choices: z
          .array(z.object({ message: z.object({ content: z.string().nullable() }) }))
          .min(1),
      })
      .parse(await response.json());

    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response");
    }

    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = modelSchema.parse(JSON.parse(cleaned));

    const analysedAt = new Date().toISOString();

    /*
     * The model decided that the image is not reliable enough.
     */
    if (!parsed.usable) {
      return {
        kind: "result",

        result: {
          ok: true,
          usable: false,

          issueType: parsed.issueType ?? "image_quality",
          imageIssues: (parsed.imageIssues ?? []).filter(Boolean),

          advice:
            parsed.advice ??
            "Please send a clearer, well-lit close-up of the affected leaf or plant.",

          analysedAt,
        },
      };
    }

    if (!parsed.crop || !parsed.condition || parsed.confidence == null) {
      return {
        kind: "retryable",
        reason: "invalid_response",
        message: "Image analysis returned an unreadable result.",
      };
    }

    const confidence = parsed.confidence ?? null;

    return {
      kind: "result",

      result: {
        ok: true,
        usable: true,

        crop: parsed.crop,
        condition: parsed.condition,

        confidence,

        severity: parsed.severity ?? null,

        symptoms: (parsed.symptoms ?? []).filter(Boolean),

        causes: (parsed.causes ?? []).filter(Boolean),

        conditionsFavouring: (parsed.conditionsFavouring ?? []).filter(Boolean),

        whatItIs: parsed.whatItIs ?? "",

        whyItHappens: parsed.whyItHappens ?? "",

        whatToDoNow: (parsed.whatToDoNow ?? []).filter(Boolean),

        prevention: (parsed.prevention ?? []).filter(Boolean),

        monitoring: (parsed.monitoring ?? []).filter(Boolean),

        sprayRecommendations: [],

        uncertaintyNote:
          parsed.uncertaintyNote ??
          (confidence !== null && confidence < 70
            ? "The visible signs are not conclusive in this photo."
            : null),

        analysedAt,

        model: MODEL,
      },
    };
  } catch (error) {
    const reason: DiagnosisFailure["reason"] =
      error instanceof Error && error.name === "TimeoutError"
        ? "timeout"
        : error instanceof SyntaxError || error instanceof z.ZodError
          ? "invalid_response"
          : "unavailable";
    console.error(
      "Groq crop disease analysis error:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return {
      kind: "retryable",
      reason,
      message:
        reason === "timeout"
          ? "Image analysis timed out."
          : reason === "invalid_response"
            ? "Image analysis returned an unreadable result."
            : "Image analysis could not be completed.",
    };
  }
}

/**
 * Main crop-photo analysis function.
 *
 * Uses the direct Groq API instead of the Lovable AI gateway.
 */
export async function analyseCropPhoto(data: DiagnoseInput): Promise<DiagnosisResult> {
  const apiKey = process.env["GROQ_API_KEY"];

  if (!apiKey) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Image analysis is not configured for this app yet.",
    };
  }

  const attempt = await callGroq(data);

  if (attempt.kind === "result") {
    const shouldTakeFocusedSecondLook =
      (attempt.result.usable && (attempt.result.confidence ?? 100) < 45) ||
      (!attempt.result.usable && attempt.result.issueType === "inconclusive");
    if (shouldTakeFocusedSecondLook) {
      const secondLook = await callGroq(data, true);
      if (
        secondLook.kind === "result" &&
        secondLook.result.usable &&
        (!attempt.result.usable ||
          (secondLook.result.confidence ?? 0) > (attempt.result.confidence ?? 0))
      ) {
        return {
          ...secondLook.result,
          uncertaintyNote:
            secondLook.result.uncertaintyNote ??
            "A second look still cannot confirm the cause; compare the suggested alternatives with the plant in the field.",
        };
      }
    }
    return attempt.result;
  }

  return {
    ok: false,
    reason: attempt.reason,
    message: attempt.message,
  };
}
