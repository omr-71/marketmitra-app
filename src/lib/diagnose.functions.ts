import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  analyseCropPhoto,
  cropImageDataUrlSchema,
  decodeCropImageDataUrl,
  validStoredSprayRecommendations,
} from "./diagnose.server";
import type { DiagnosisResult, SprayRecommendation } from "./diagnose.server";
export { getDiagnosisTreatmentGuidance } from "./treatments.functions";
export type {
  TreatmentGuidance,
  TreatmentRecommendation,
  TreatmentSource,
} from "./treatments.schema";

export type {
  DiagnosisOk,
  DiagnosisUnusable,
  DiagnosisFailure,
  DiagnosisResult,
  SprayRecommendation,
} from "./diagnose.server";

const inputSchema = z.object({
  /** JPEG/PNG/WebP data URL of the farmer's photo, already downscaled in the browser. */
  requestId: z.string().uuid(),
  image: cropImageDataUrlSchema,
  lang: z.enum(["en", "mr", "hi"]),
  cropHint: z.string().trim().max(60).optional(),
});

export type SavedDiagnosis = {
  id: string;
  createdAt: string;
  lang: string;
  cropHint: string | null;
  usable: boolean;
  crop: string | null;
  condition: string | null;
  confidence: number | null;
  severity: string | null;
  symptoms: string[];
  causes: string[];
  whatItIs: string | null;
  whyItHappens: string | null;
  whatToDoNow: string[];
  prevention: string[];
  monitoring: string[];
  sprayRecommendations: SprayRecommendation[];
  uncertaintyNote: string | null;
  imagePath: string | null;
  imageUrl: string | null;
};

type DiagnosisRow = Database["public"]["Tables"]["crop_diagnoses"]["Row"];

function toSavedResult(row: DiagnosisRow): DiagnosisResult & { savedId: string } {
  if (!row.usable || !row.crop || !row.condition) {
    throw new Error("Stored diagnosis is incomplete.");
  }
  const sprayRecommendations = validStoredSprayRecommendations(row.spray_recommendations);
  return {
    ok: true,
    usable: true,
    crop: row.crop,
    condition: row.condition,
    confidence: row.confidence,
    severity: row.severity,
    symptoms: row.symptoms ?? [],
    causes: row.causes ?? [],
    conditionsFavouring: row.conditions_favouring ?? [],
    whatItIs: row.what_it_is ?? "",
    whyItHappens: row.why_it_happens ?? "",
    whatToDoNow: row.what_to_do_now ?? [],
    prevention: row.prevention ?? [],
    monitoring: row.monitoring ?? [],
    sprayRecommendations,
    uncertaintyNote: row.uncertainty_note,
    analysedAt: row.created_at,
    model: row.provider ?? "saved",
    savedId: row.id,
  };
}

/**
 * Analyses the photo AND keeps a private record of usable results so the farmer
 * (and Mitra AI, on request) can look back at earlier checks.
 */
export const diagnoseCropImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<DiagnosisResult & { savedId?: string }> => {
    let image: ReturnType<typeof decodeCropImageDataUrl>;
    try {
      image = decodeCropImageDataUrl(data.image);
    } catch {
      throw new Error("INVALID_CROP_IMAGE");
    }

    const { data: prior, error: priorError } = await context.supabase
      .from("crop_diagnoses")
      .select("*")
      .eq("user_id", context.userId)
      .eq("request_id", data.requestId)
      .eq("usable", true)
      .maybeSingle();
    if (priorError) throw new Error("DIAGNOSIS_SAVE_FAILED");
    if (prior) return toSavedResult(prior);

    let result: DiagnosisResult;
    try {
      result = await analyseCropPhoto(data);
    } catch (error) {
      const { logApplicationError } = await import("./error-logging.server");
      await logApplicationError({
        service: "diagnosis",
        userId: context.userId,
        requestId: crypto.randomUUID(),
        provider: "Groq",
        errorType: error instanceof Error ? error.name : "UnknownError",
        message: "Crop diagnosis provider request failed.",
      });
      throw error;
    }
    if (!result.ok) {
      const { logApplicationError } = await import("./error-logging.server");
      await logApplicationError({
        service: "diagnosis",
        userId: context.userId,
        requestId: crypto.randomUUID(),
        provider: "Groq",
        errorType: result.reason,
        message: result.message,
      });
      return result;
    }

    if (!result.usable) return result;

    const path = `${context.userId}/${Date.now()}-${crypto.randomUUID()}.${image.ext}`;
    const upload = await context.supabase.storage
      .from("crop-photos")
      .upload(path, image.bytes, { contentType: image.mime, upsert: false });
    if (upload.error) {
      const { logApplicationError } = await import("./error-logging.server");
      await logApplicationError({
        service: "diagnosis",
        userId: context.userId,
        requestId: data.requestId,
        provider: "Supabase Storage",
        errorType: "photo_upload_failed",
        message: "Completed crop diagnosis photo could not be saved.",
      });
      throw new Error("DIAGNOSIS_SAVE_FAILED");
    }

    type Row = Database["public"]["Tables"]["crop_diagnoses"]["Insert"];
    const row: Row = {
      user_id: context.userId,
      request_id: data.requestId,
      image_path: path,
      lang: data.lang,
      crop_hint: data.cropHint ?? null,
      usable: true,
      crop: result.crop,
      condition: result.condition,
      confidence: result.confidence,
      severity: result.severity,
      symptoms: result.symptoms,
      causes: result.causes,
      conditions_favouring: result.conditionsFavouring,
      what_it_is: result.whatItIs,
      why_it_happens: result.whyItHappens,
      what_to_do_now: result.whatToDoNow,
      prevention: result.prevention,
      monitoring: result.monitoring,
      spray_recommendations: result.sprayRecommendations,
      uncertainty_note: result.uncertaintyNote,
      provider: result.model,
    };

    const saved = await context.supabase.from("crop_diagnoses").insert(row).select("*").single();
    if (saved.error || !saved.data) {
      const cleanup = await context.supabase.storage.from("crop-photos").remove([path]);
      if (cleanup.error) {
        const { logApplicationError } = await import("./error-logging.server");
        await logApplicationError({
          service: "diagnosis",
          userId: context.userId,
          requestId: data.requestId,
          provider: "Supabase Storage",
          errorType: "orphan_photo_cleanup_failed",
          message: "Temporary crop photo cleanup failed after a diagnosis save error.",
        });
      }

      if (saved.error?.code === "23505") {
        const { data: duplicate, error: duplicateError } = await context.supabase
          .from("crop_diagnoses")
          .select("*")
          .eq("user_id", context.userId)
          .eq("request_id", data.requestId)
          .eq("usable", true)
          .maybeSingle();
        if (!duplicateError && duplicate) return toSavedResult(duplicate);
      }

      const { logApplicationError } = await import("./error-logging.server");
      await logApplicationError({
        service: "diagnosis",
        userId: context.userId,
        requestId: data.requestId,
        provider: "Supabase",
        errorType: "persistence_failed",
        message: "Completed crop diagnosis could not be saved.",
      });
      throw new Error("DIAGNOSIS_SAVE_FAILED");
    }

    return toSavedResult(saved.data);
  });

/** The farmer's own diagnosis history, newest first, with short-lived photo links. */
export const listCropDiagnoses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SavedDiagnosis[]> => {
    const { data, error } = await context.supabase
      .from("crop_diagnoses")
      .select("*")
      .eq("user_id", context.userId)
      .eq("usable", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) throw new Error("Your saved crop checks could not be loaded.");
    if (!data) return [];

    return Promise.all(
      data.map(async (r) => {
        let imageUrl: string | null = null;
        if (r.image_path) {
          const signed = await context.supabase.storage
            .from("crop-photos")
            .createSignedUrl(r.image_path, 60 * 60);
          if (signed.error || !signed.data?.signedUrl) {
            const { logApplicationError } = await import("./error-logging.server");
            await logApplicationError({
              service: "diagnosis",
              userId: context.userId,
              requestId: r.request_id,
              provider: "Supabase Storage",
              errorType: signed.error?.name ?? "photo_url_missing",
              message:
                "A saved crop photo could not be opened; diagnosis history remains available.",
            });
          } else {
            imageUrl = signed.data.signedUrl;
          }
        }
        return {
          id: r.id,
          createdAt: r.created_at,
          lang: r.lang,
          cropHint: r.crop_hint,
          usable: r.usable,
          crop: r.crop,
          condition: r.condition,
          confidence: r.confidence,
          severity: r.severity,
          symptoms: r.symptoms ?? [],
          causes: r.causes ?? [],
          whatItIs: r.what_it_is,
          whyItHappens: r.why_it_happens,
          whatToDoNow: r.what_to_do_now ?? [],
          prevention: r.prevention ?? [],
          monitoring: r.monitoring ?? [],
          sprayRecommendations: validStoredSprayRecommendations(r.spray_recommendations),
          uncertaintyNote: r.uncertainty_note,
          imagePath: r.image_path,
          imageUrl,
        };
      }),
    );
  });

export const deleteCropDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: diagnosis, error: lookupError } = await context.supabase
      .from("crop_diagnoses")
      .select("image_path")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (lookupError) throw new Error("The saved crop check could not be deleted.");
    if (!diagnosis) return { ok: true };

    if (diagnosis.image_path) {
      const { error: storageError } = await context.supabase.storage
        .from("crop-photos")
        .remove([diagnosis.image_path]);
      if (storageError) throw new Error("The saved photo could not be deleted. Please try again.");
    }

    const { error } = await context.supabase
      .from("crop_diagnoses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("The saved crop check could not be deleted.");
    return { ok: true };
  });

export type DiagnosisContext = {
  id: string;
  crop: string | null;
  condition: string | null;
  confidence: number | null;
  severity: string | null;
  /** Immediate actions saved with the check, including any spray guidance. */
  treatment: string[];
  prevention: string[];
  checkedAt: string;
} | null;

/**
 * Compact context only — one recent crop check, never the whole history, so
 * Mitra AI can follow up on a diagnosis without being flooded with data.
 */
export const latestDiagnosisContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DiagnosisContext> => {
    const { data } = await context.supabase
      .from("crop_diagnoses")
      .select("id,crop,condition,confidence,severity,what_to_do_now,prevention,created_at")
      .eq("user_id", context.userId)
      .eq("usable", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;
    return {
      id: data.id,
      crop: data.crop,
      condition: data.condition,
      confidence: data.confidence,
      severity: data.severity,
      treatment: (data.what_to_do_now ?? []).slice(0, 4),
      prevention: (data.prevention ?? []).slice(0, 3),
      checkedAt: data.created_at,
    };
  });
