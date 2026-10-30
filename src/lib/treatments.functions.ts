import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { retrieveTreatmentGuidance, TreatmentProviderError } from "./treatments.server";
import type { TreatmentGuidance } from "./treatments.schema";
import { getCachedTreatmentGuidance } from "./treatments.cache.server";

export type {
  TreatmentGuidance,
  TreatmentRecommendation,
  TreatmentSource,
} from "./treatments.schema";

export const getDiagnosisTreatmentGuidance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ diagnosisId: z.string().uuid(), lang: z.enum(["en", "mr", "hi"]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<TreatmentGuidance> => {
    const { data: diagnosis, error } = await context.supabase
      .from("crop_diagnoses")
      .select("crop,crop_hint,condition,severity,confidence,uncertainty_note,symptoms,causes")
      .eq("id", data.diagnosisId)
      .eq("user_id", context.userId)
      .eq("usable", true)
      .maybeSingle();

    if (error) throw new Error("TREATMENT_DIAGNOSIS_LOOKUP_FAILED");
    if (!diagnosis?.crop || !diagnosis.condition) {
      throw new Error("TREATMENT_DIAGNOSIS_NOT_FOUND");
    }
    const detectedCrop = diagnosis.crop;
    const condition = diagnosis.condition;
    const requestId = crypto.randomUUID();

    try {
      return await getCachedTreatmentGuidance(
        { userId: context.userId, diagnosisId: data.diagnosisId, lang: data.lang },
        () =>
          retrieveTreatmentGuidance(
            {
              detectedCrop,
              selectedCrop: diagnosis.crop_hint,
              condition,
              alternativeConditions: (diagnosis.causes ?? []).slice(0, 3),
              severity: diagnosis.severity,
              confidence: diagnosis.confidence,
              uncertaintyNote: diagnosis.uncertainty_note,
              symptoms: (diagnosis.symptoms ?? []).slice(0, 3),
            },
            data.lang,
            requestId,
          ),
      );
    } catch (error) {
      if (error instanceof Error && error.message === "TREATMENT_REQUEST_RATE_LIMITED") {
        throw error;
      }
      const { logApplicationError } = await import("./error-logging.server");
      const formattedRateValue = (value: number | null) =>
        value === null ? null : value.toLocaleString("en-US");
      const rateLimitHeaders =
        error instanceof TreatmentProviderError && error.rateLimit
          ? `; rate_limit_headers=${JSON.stringify({
              "retry-after-ms": formattedRateValue(error.rateLimit.retryAfterMs),
              "x-ratelimit-limit-requests": formattedRateValue(error.rateLimit.requestsLimit),
              "x-ratelimit-remaining-requests": formattedRateValue(
                error.rateLimit.requestsRemaining,
              ),
              "x-ratelimit-reset-requests-ms": formattedRateValue(error.rateLimit.requestsResetMs),
              "x-ratelimit-limit-tokens": formattedRateValue(error.rateLimit.tokensLimit),
              "x-ratelimit-remaining-tokens": formattedRateValue(error.rateLimit.tokensRemaining),
              "x-ratelimit-reset-tokens-ms": formattedRateValue(error.rateLimit.tokensResetMs),
            })}`
          : "";
      await logApplicationError({
        service: "diagnosis",
        requestId: error instanceof TreatmentProviderError ? error.requestId : requestId,
        provider: "Groq chat completions",
        errorType:
          error instanceof TreatmentProviderError
            ? error.code
            : error instanceof Error
              ? error.name
              : "unknown_error",
        message:
          error instanceof TreatmentProviderError
            ? `Treatment provider failure; category=${error.code}; status=${error.status ?? "not_received"}; request_id=${error.requestId}; failure_stage=${error.failureStage ?? "not_applicable"}; provider_error_type=${error.providerErrorType ?? "not_received"}; provider_error_message=${error.providerMessage ?? "not_received"}${rateLimitHeaders}`
            : `Treatment research failed; category=internal; request_id=${requestId}`,
      });
      throw error;
    }
  });
