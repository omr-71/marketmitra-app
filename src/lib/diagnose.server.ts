import { z } from "zod";

export type DiagnosisOk = {
  ok: true;
  usable: true;
  crop: string;
  condition: string;
  confidence: number;
  severity: string | null;
  symptoms: string[];
  causes: string[];
  conditionsFavouring: string[];
  whatItIs: string;
  whyItHappens: string;
  whatToDoNow: string[];
  prevention: string[];
  monitoring: string[];
  uncertaintyNote: string | null;
  analysedAt: string;
  model: string;
};

export type DiagnosisUnusable = {
  ok: true;
  usable: false;
  imageIssues: string[];
  advice: string;
  analysedAt: string;
};

export type DiagnosisFailure = {
  ok: false;
  reason: "not_configured" | "busy" | "no_credits" | "unavailable";
  message: string;
  fallbackTried?: boolean;
};

export type DiagnosisResult =
  | DiagnosisOk
  | DiagnosisUnusable
  | DiagnosisFailure;

export type DiagnoseInput = {
  image: string;
  lang: "en" | "mr" | "hi";
  cropHint?: string | undefined;
};

const langName = {
  en: "English",
  mr: "Marathi (मराठी)",
  hi: "Hindi (हिंदी)",
} as const;

const modelSchema = z.object({
  usable: z.boolean(),

  imageIssues: z
    .array(z.string().max(160))
    .max(6)
    .nullable()
    .optional(),

  advice: z.string().max(400).nullable().optional(),

  crop: z.string().max(80).nullable().optional(),

  condition: z.string().max(120).nullable().optional(),

  confidence: z.number().nullable().optional(),

  severity: z.string().max(60).nullable().optional(),

  symptoms: z
    .array(z.string().max(240))
    .max(8)
    .nullable()
    .optional(),

  causes: z
    .array(z.string().max(240))
    .max(8)
    .nullable()
    .optional(),

  conditionsFavouring: z
    .array(z.string().max(240))
    .max(8)
    .nullable()
    .optional(),

  whatItIs: z.string().max(700).nullable().optional(),

  whyItHappens: z.string().max(700).nullable().optional(),

  whatToDoNow: z
    .array(z.string().max(300))
    .max(8)
    .nullable()
    .optional(),

  prevention: z
    .array(z.string().max(300))
    .max(8)
    .nullable()
    .optional(),

  monitoring: z
    .array(z.string().max(300))
    .max(8)
    .nullable()
    .optional(),

  uncertaintyNote: z.string().max(400).nullable().optional(),
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

List the concrete image problems in imageIssues and give simple advice for taking a better photo.

Do NOT diagnose an unclear image.

2. IDENTIFY THE TYPE OF PROBLEM
When the image allows it, distinguish between:
- healthy plant
- disease
- pest damage
- nutrient deficiency
- physical damage
- weather/environmental damage

If the evidence is insufficient, do not invent an answer.

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

Do NOT provide:
- pesticide names
- fungicide names
- insecticide names
- chemical brands
- chemical doses
- concentrations
- spray volumes
- chemical mixtures
- guaranteed cures

When chemical treatment may be relevant, say:

"Use only a product registered for this crop and disease, follow the product label, and confirm with your local KVK or agriculture officer."

5. LANGUAGE
Every string value must be written in the requested language.

JSON keys must remain in English.

6. STYLE
Use short, simple sentences suitable for a farmer using a phone.

Do not use unnecessary technical jargon.

7. OUTPUT
Return ONLY one valid JSON object.

No Markdown.
No code fences.
No explanation outside JSON.
`;

function userText(data: DiagnoseInput) {
  return `
Analyse this crop photo carefully.

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
- fill imageIssues
- fill advice
- leave diagnosis fields empty or null

If usable is true:
- identify the most likely condition supported by the image
- fill the diagnosis fields
- use confidence from 1 to 95
- only set severity when the image genuinely supports it
- otherwise use null

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

async function callGroq(
  data: DiagnoseInput,
): Promise<Attempt> {
  const apiKey = process.env["GROQ_API_KEY"];

  if (!apiKey) {
    return {
      kind: "retryable",
      reason: "not_configured",
      message: "Groq image analysis is not configured.",
    };
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
                  text: userText(data),
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

          max_completion_tokens: 1800,

          reasoning_effort: "medium",

          reasoning_format: "hidden",
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();

      console.error(
        `Groq disease AI failed [${response.status}]: ${body.slice(0, 500)}`,
      );

      if (response.status === 401 || response.status === 403) {
        return {
          kind: "retryable",
          reason: "unavailable",
          message: "Image analysis authorization failed.",
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

    const json = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

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
    if (!parsed.usable || !parsed.condition || !parsed.crop) {
      return {
        kind: "result",

        result: {
          ok: true,
          usable: false,

          imageIssues: (parsed.imageIssues ?? []).filter(Boolean),

          advice:
            parsed.advice ??
            "Please send a clearer, well-lit close-up of the affected leaf or plant.",

          analysedAt,
        },
      };
    }

    const confidence = Math.max(
      1,
      Math.min(
        95,
        Math.round(parsed.confidence ?? 40),
      ),
    );

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

        conditionsFavouring:
          (parsed.conditionsFavouring ?? []).filter(Boolean),

        whatItIs: parsed.whatItIs ?? "",

        whyItHappens: parsed.whyItHappens ?? "",

        whatToDoNow:
          (parsed.whatToDoNow ?? []).filter(Boolean),

        prevention:
          (parsed.prevention ?? []).filter(Boolean),

        monitoring:
          (parsed.monitoring ?? []).filter(Boolean),

        uncertaintyNote:
          parsed.uncertaintyNote ??
          (confidence < 70
            ? "The visible signs are not conclusive in this photo."
            : null),

        analysedAt,

        model: MODEL,
      },
    };
  } catch (error) {
    console.error(
      "Groq crop disease analysis error:",
      error,
    );

    return {
      kind: "retryable",
      reason: "unavailable",
      message: "Image analysis could not be completed.",
    };
  }
}

/**
 * Main crop-photo analysis function.
 *
 * Uses the direct Groq API instead of the Lovable AI gateway.
 */
export async function analyseCropPhoto(
  data: DiagnoseInput,
): Promise<DiagnosisResult> {
  const apiKey = process.env["GROQ_API_KEY"];

  if (!apiKey) {
    return {
      ok: false,
      reason: "not_configured",
      message:
        "Image analysis is not configured for this app yet.",
    };
  }

  const attempt = await callGroq(data);

  if (attempt.kind === "result") {
    return attempt.result;
  }

  return {
    ok: false,
    reason: attempt.reason,
    message: attempt.message,
  };
}