import { z } from "zod";

import {
  buildTreatmentGuidance,
  extractTreatmentSources,
  normalizeTreatmentModelResponse,
  type TreatmentGuidance,
} from "./treatments.schema.ts";

export type TreatmentDiagnosis = {
  detectedCrop: string;
  selectedCrop: string | null;
  condition: string;
  alternativeConditions: string[];
  severity: string | null;
  confidence: number | null;
  uncertaintyNote: string | null;
  symptoms: string[];
};

export type TreatmentProviderErrorCode =
  | "TREATMENT_PROVIDER_NOT_CONFIGURED"
  | "TREATMENT_PROVIDER_TIMEOUT"
  | "TREATMENT_PROVIDER_UNAVAILABLE"
  | "TREATMENT_PROVIDER_RATE_LIMITED"
  | "TREATMENT_PROVIDER_AUTH_FAILED"
  | "TREATMENT_PROVIDER_REQUEST_REJECTED"
  | "TREATMENT_PROVIDER_INVALID_RESPONSE";

export type TreatmentProviderFailureStage =
  | "response_envelope"
  | "empty_content"
  | "truncated_content"
  | "provider_output_parsing"
  | "invalid_json"
  | "schema_validation"
  | "result_mapping";

export type TreatmentRateLimitDetails = {
  retryAfterMs: number | null;
  requestsLimit: number | null;
  requestsRemaining: number | null;
  requestsResetMs: number | null;
  tokensLimit: number | null;
  tokensRemaining: number | null;
  tokensResetMs: number | null;
};

export class TreatmentProviderError extends Error {
  readonly code: TreatmentProviderErrorCode;
  readonly status: number | null;
  readonly requestId: string;
  readonly rateLimit: TreatmentRateLimitDetails | null;
  declare readonly failureStage: TreatmentProviderFailureStage | null;
  declare readonly providerErrorType: string | null;
  declare readonly providerMessage: string | null;

  constructor(
    code: TreatmentProviderErrorCode,
    requestId: string,
    status: number | null = null,
    rateLimit: TreatmentRateLimitDetails | null = null,
    providerErrorType: string | null = null,
    providerMessage: string | null = null,
    failureStage: TreatmentProviderFailureStage | null = null,
  ) {
    super(
      code +
        (rateLimit?.retryAfterMs !== null && rateLimit?.retryAfterMs !== undefined
          ? `;retry_after_ms=${rateLimit.retryAfterMs}`
          : ""),
    );
    this.name = "TreatmentProviderError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.rateLimit = rateLimit;
    Object.defineProperties(this, {
      failureStage: { value: failureStage, enumerable: false },
      providerErrorType: { value: providerErrorType, enumerable: false },
      providerMessage: { value: providerMessage, enumerable: false },
    });
  }
}

function providerError(
  code: TreatmentProviderErrorCode,
  requestId: string,
  status: number | null = null,
  rateLimit: TreatmentRateLimitDetails | null = null,
  providerErrorType: string | null = null,
  providerMessage: string | null = null,
  failureStage: TreatmentProviderFailureStage | null = null,
): TreatmentProviderError {
  return new TreatmentProviderError(
    code,
    requestId,
    status,
    rateLimit,
    providerErrorType,
    providerMessage,
    failureStage,
  );
}

function sanitizeProviderMessage(message: string, diagnosis: TreatmentDiagnosis): string | null {
  let sanitized = message
    .replace(/Bearer\s+[^\s,;]+/gi, "[REDACTED]")
    .replace(
      /\b(api[-_ ]?key|token|secret|password|authorization)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]",
    )
    .replace(/https?:\/\/[^\s]+/gi, "[URL]")
    .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[REDACTED]")
    .replace(/[\r\n\t]+/g, " ");

  const privateTerms = [
    diagnosis.detectedCrop,
    diagnosis.selectedCrop,
    diagnosis.condition,
    diagnosis.uncertaintyNote,
    ...diagnosis.alternativeConditions,
    ...diagnosis.symptoms,
  ].filter((term): term is string => Boolean(term?.trim()));
  for (const term of privateTerms) {
    sanitized = sanitized.replace(
      new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
      "[REDACTED]",
    );
  }

  const trimmed = sanitized.trim().slice(0, 240);
  return trimmed || null;
}

async function readProviderErrorDetails(
  response: Response,
  diagnosis: TreatmentDiagnosis,
): Promise<{ type: string | null; message: string | null }> {
  try {
    const body: unknown = await response.json();
    const parsed = z
      .object({
        error: z
          .object({
            message: z.string().optional(),
            type: z.string().optional(),
          })
          .optional(),
      })
      .safeParse(body);
    if (!parsed.success) return { type: null, message: null };

    const type = parsed.data.error?.type;
    return {
      type: type && /^[a-zA-Z0-9_.-]{1,80}$/.test(type) ? type : null,
      message: parsed.data.error?.message
        ? sanitizeProviderMessage(parsed.data.error.message, diagnosis)
        : null,
    };
  } catch {
    return { type: null, message: null };
  }
}

function parseCountHeader(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseDurationMs(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return Math.min(Number(trimmed) * 1000, 7 * 24 * 60 * 60_000);
  }
  const tokenPattern = /(\d+(?:\.\d+)?)(ms|s|m|h|d)/gy;
  let totalMs = 0;
  let matched = "";
  for (const token of trimmed.matchAll(tokenPattern)) {
    const amount = Number(token[1]);
    const unit = token[2];
    const multiplier =
      unit === "ms"
        ? 1
        : unit === "s"
          ? 1000
          : unit === "m"
            ? 60_000
            : unit === "h"
              ? 3_600_000
              : 86_400_000;
    totalMs += amount * multiplier;
    matched += token[0];
  }
  if (matched !== trimmed || !Number.isFinite(totalMs)) return null;
  return Math.min(totalMs, 7 * 24 * 60 * 60_000);
}

function parseRetryAfterMs(value: string | null, now = Date.now()): number | null {
  const duration = parseDurationMs(value);
  if (duration !== null) return duration;
  if (!value) return null;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, Math.min(date - now, 7 * 24 * 60 * 60_000)) : null;
}

function readRateLimitDetails(headers: Headers): TreatmentRateLimitDetails {
  const requestsRemaining = parseCountHeader(headers.get("x-ratelimit-remaining-requests"));
  const tokensRemaining = parseCountHeader(headers.get("x-ratelimit-remaining-tokens"));
  const requestsResetMs = parseDurationMs(headers.get("x-ratelimit-reset-requests"));
  const tokensResetMs = parseDurationMs(headers.get("x-ratelimit-reset-tokens"));
  const retryAfterMs = parseRetryAfterMs(headers.get("retry-after"));
  const exhaustedResets = [
    requestsRemaining === 0 ? requestsResetMs : null,
    tokensRemaining === 0 ? tokensResetMs : null,
  ].filter((duration): duration is number => duration !== null);

  return {
    retryAfterMs: retryAfterMs ?? (exhaustedResets.length ? Math.max(...exhaustedResets) : null),
    requestsLimit: parseCountHeader(headers.get("x-ratelimit-limit-requests")),
    requestsRemaining,
    requestsResetMs,
    tokensLimit: parseCountHeader(headers.get("x-ratelimit-limit-tokens")),
    tokensRemaining,
    tokensResetMs,
  };
}

const SYSTEM_PROMPT = `Research crop care for farmers in India. Use browser_search and cite only exact URLs returned by opened official Indian agriculture, ICAR, agricultural-university, or government registration pages.

Never infer a pathogen from generic symptoms such as "leaf spot", rename/narrow the diagnosis, or invent product names, evidence, URLs, doses, label claims, or registrations. Include products and crop/problem-specific practices only when an opened source explicitly supports the crop and stated diagnosis. Never put synthetic pesticides or chemical seed treatments in organicManagement. Do not provide doses or application instructions. For viral or uncertain causes, return no products. If evidence is insufficient, return empty candidate arrays and conservative generalCare.

Return only one JSON object with these keys:
{"causeCategory":"fungal|bacterial|viral|pest|nutrient|environmental|mixed|uncertain","generalCare":["..."],"organicManagement":[{"category":"cultural|sanitation|water|spacing|rotation|resistant_variety|biological_control|organic_input","name":"...","targetCrop":"...","targetCondition":"...","rationale":"...","limitations":"...","sourceUrl":"https://..."}],"organicBiological":[{"recommendationType":"commercial_product|biological_control|active_ingredient|general_organic_treatment","productName":"... or null","brand":"... or null","activeIngredient":"... or null","formulation":"... or null","targetCrop":"...","targetCondition":"...","rationale":"...","applicationMethod":null,"dose":null,"waterVolume":null,"applicationInterval":null,"maximumApplications":null,"requiredPpe":[],"preHarvestInterval":null,"reEntryInterval":null,"precautions":[],"sourceUrl":"https://... or null"}],"chemical":[{"recommendationType":"commercial_product|active_ingredient","productName":"... or null","brand":"... or null","activeIngredient":"... or null","formulation":"... or null","targetCrop":"...","targetCondition":"...","rationale":"...","applicationMethod":null,"dose":null,"waterVolume":null,"applicationInterval":null,"maximumApplications":null,"requiredPpe":[],"preHarvestInterval":null,"reEntryInterval":null,"precautions":[],"sourceUrl":"https://... or null"}]}

Use the requested language for brief generalCare. Request crop/problem-specific product evidence, but never treat an AI-generated name or claim as evidence. Include active ingredients when official guidance supports them even if no brand is verified. Use applicationMethod only when the opened source or current product label explicitly provides it; all dosage, interval, PPE, PHI and re-entry fields remain null/empty unless directly supported by an opened label. Clearly retain uncertainty and alternatives from the diagnosis. Never fill fields from memory.`;

const UNCERTAIN_DIAGNOSIS_GUIDANCE: Record<"en" | "mr" | "hi", string> = {
  en: "The image diagnosis is too uncertain for a responsible product recommendation. Confirm the crop problem with your local KVK or agriculture officer before spraying.",
  mr: "फोटोवरील निदान उत्पादन सुचवण्यासाठी पुरेसे निश्चित नाही. फवारणीपूर्वी स्थानिक KVK किंवा कृषी अधिकाऱ्यांकडून पिकाच्या समस्येची खात्री करा.",
  hi: "फ़ोटो से मिला निदान उत्पाद सुझाने के लिए पर्याप्त निश्चित नहीं है। छिड़काव से पहले स्थानीय KVK या कृषि अधिकारी से समस्या की पुष्टि करें।",
};

export async function retrieveTreatmentGuidance(
  diagnosis: TreatmentDiagnosis,
  lang: "en" | "mr" | "hi",
  requestId: string = crypto.randomUUID(),
): Promise<TreatmentGuidance> {
  const apiKey = process.env["GROQ_SPRAY_API_KEY"];
  if (!apiKey) {
    throw providerError("TREATMENT_PROVIDER_NOT_CONFIGURED", requestId);
  }

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              language: lang,
              diagnosis: {
                crop: diagnosis.detectedCrop,
                farmerCropHint: diagnosis.selectedCrop,
                likelyCondition: diagnosis.condition,
                confidence: diagnosis.confidence,
                uncertainty: diagnosis.uncertaintyNote,
                visibleSymptoms: diagnosis.symptoms,
                alternativeConditions: diagnosis.alternativeConditions,
                severity: diagnosis.severity,
              },
              instruction:
                "Use the image-confirmed crop, not a conflicting farmer hint. Search current authoritative sources for the exact crop and stated condition. Tailor the answer to this confidence, uncertainty, visible symptoms, and alternatives. Do not convert a syndrome into a confirmed pathogen. Return an empty product array rather than guessing when the cause or crop-specific evidence is unclear.",
            }),
          },
        ],
        tools: [{ type: "browser_search" }],
        tool_choice: "required",
        response_format: { type: "json_object" },
        temperature: 1,
        max_completion_tokens: 2400,
        reasoning_effort: "low",
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw providerError(
      timedOut ? "TREATMENT_PROVIDER_TIMEOUT" : "TREATMENT_PROVIDER_UNAVAILABLE",
      requestId,
    );
  }
  if (!response.ok) {
    if (response.status === 429) {
      const providerDetails = await readProviderErrorDetails(response, diagnosis);
      throw providerError(
        "TREATMENT_PROVIDER_RATE_LIMITED",
        requestId,
        response.status,
        readRateLimitDetails(response.headers),
        providerDetails.type,
        providerDetails.message,
      );
    }
    if (response.status === 400) {
      const providerDetails = await readProviderErrorDetails(response, diagnosis);
      const providerOutputParsingFailed =
        providerDetails.message !== null &&
        /parsing failed|parse.*(?:tool call|output)|generated output that could not be parsed/i.test(
          providerDetails.message,
        );
      throw providerError(
        providerOutputParsingFailed
          ? "TREATMENT_PROVIDER_INVALID_RESPONSE"
          : "TREATMENT_PROVIDER_REQUEST_REJECTED",
        requestId,
        response.status,
        null,
        providerDetails.type,
        providerDetails.message,
        providerOutputParsingFailed ? "provider_output_parsing" : null,
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw providerError("TREATMENT_PROVIDER_AUTH_FAILED", requestId, response.status);
    }
    if (response.status >= 500) {
      throw providerError("TREATMENT_PROVIDER_UNAVAILABLE", requestId, response.status);
    }
    throw providerError("TREATMENT_PROVIDER_REQUEST_REJECTED", requestId, response.status);
  }

  const groqResponseSchema = z.object({
    choices: z
      .array(
        z.object({
          finish_reason: z.string().nullable().optional(),
          message: z.object({
            content: z
              .union([
                z.string(),
                z.array(z.object({ type: z.string().optional(), text: z.string().optional() })),
              ])
              .nullable()
              .optional(),
            executed_tools: z.unknown().optional(),
            tool_results: z.unknown().optional(),
          }),
        }),
      )
      .min(1),
  });

  let groqResponse: z.infer<typeof groqResponseSchema>;
  try {
    groqResponse = groqResponseSchema.parse(await response.json());
  } catch {
    throw providerError(
      "TREATMENT_PROVIDER_INVALID_RESPONSE",
      requestId,
      response.status,
      null,
      null,
      null,
      "response_envelope",
    );
  }

  const choice = groqResponse.choices[0];
  const message = choice?.message;
  if (choice?.finish_reason === "length") {
    throw providerError(
      "TREATMENT_PROVIDER_INVALID_RESPONSE",
      requestId,
      response.status,
      null,
      null,
      null,
      "truncated_content",
    );
  }
  const contentValue = message?.content;
  const content =
    typeof contentValue === "string"
      ? contentValue.trim()
      : contentValue
          ?.flatMap((part) => (part.text ? [part.text] : []))
          .join("\n")
          .trim();
  if (!content) {
    throw providerError(
      "TREATMENT_PROVIDER_INVALID_RESPONSE",
      requestId,
      response.status,
      null,
      null,
      null,
      "empty_content",
    );
  }

  let parsedResponse: unknown;
  try {
    const fencedJson = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedJson?.[1] ?? content;
    const start = candidate.indexOf("{");
    if (start < 0) throw new Error("No JSON object in model output.");
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let index = start; index < candidate.length; index += 1) {
      const character = candidate[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === "{") depth += 1;
      else if (character === "}") {
        depth -= 1;
        if (depth === 0) {
          end = index + 1;
          break;
        }
      }
    }
    if (end < 0) throw new Error("Incomplete JSON object in model output.");
    parsedResponse = JSON.parse(candidate.slice(start, end));
  } catch {
    throw providerError(
      "TREATMENT_PROVIDER_INVALID_RESPONSE",
      requestId,
      response.status,
      null,
      null,
      null,
      "invalid_json",
    );
  }

  let modelResponse: ReturnType<typeof normalizeTreatmentModelResponse>;
  try {
    modelResponse = normalizeTreatmentModelResponse(parsedResponse);
  } catch {
    throw providerError(
      "TREATMENT_PROVIDER_INVALID_RESPONSE",
      requestId,
      response.status,
      null,
      null,
      null,
      "schema_validation",
    );
  }

  const sources = extractTreatmentSources(message?.executed_tools ?? message?.tool_results);
  const targetCrop = diagnosis.detectedCrop;
  try {
    const guidance = buildTreatmentGuidance(
      modelResponse,
      sources,
      new Date().toISOString(),
      targetCrop,
      diagnosis.condition,
    );
    if (diagnosis.confidence !== null && diagnosis.confidence >= 45) return guidance;
    return {
      ...guidance,
      generalCare:
        guidance.generalCare.length > 0
          ? guidance.generalCare
          : [UNCERTAIN_DIAGNOSIS_GUIDANCE[lang]],
      organicBiological: [],
      chemical: [],
    };
  } catch {
    throw providerError(
      "TREATMENT_PROVIDER_INVALID_RESPONSE",
      requestId,
      response.status,
      null,
      null,
      null,
      "result_mapping",
    );
  }
}
