import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyseCropPhoto } from "./diagnose.server";
import type { DiagnosisResult } from "./diagnose.server";

export type {
  DiagnosisOk,
  DiagnosisUnusable,
  DiagnosisFailure,
  DiagnosisResult,
} from "./diagnose.server";

const inputSchema = z.object({
  /** JPEG/PNG/WebP data URL of the farmer's photo, already downscaled in the browser. */
  image: z
    .string()
    .min(100)
    .max(6_000_000)
    .refine((v) => /^data:image\/(jpeg|jpg|png|webp);base64,/.test(v), "unsupported image"),
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
  uncertaintyNote: string | null;
  imagePath: string | null;
  imageUrl: string | null;
};

function dataUrlToBytes(image: string) {
  const [head, body] = image.split(",");
  const mime = /data:([^;]+);/.exec(head ?? "")?.[1] ?? "image/jpeg";
  const binary = atob(body ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, mime, ext: mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg" };
}

/**
 * Analyses the photo AND keeps a private record of usable results so the farmer
 * (and Mitra AI, on request) can look back at earlier checks.
 */
export const diagnoseCropImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<DiagnosisResult & { savedId?: string }> => {
    const result = await analyseCropPhoto(data);
    if (!result.ok) return result;

    // Persist quietly: a storage/database hiccup must never lose the diagnosis.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { bytes, mime, ext } = dataUrlToBytes(data.image);
      const path = `${context.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const upload = await supabaseAdmin.storage
        .from("crop-photos")
        .upload(path, bytes, { contentType: mime, upsert: false });

      const row = result.usable
        ? {
            user_id: context.userId,
            image_path: upload.error ? null : path,
            lang: data.lang,
            crop_hint: data.cropHint ?? null,
            usable: true,
            crop: result.crop,
            condition: result.condition,
            confidence: result.confidence,
            severity: result.severity,
            symptoms: result.symptoms,
            causes: result.causes,
            what_it_is: result.whatItIs,
            why_it_happens: result.whyItHappens,
            what_to_do_now: result.whatToDoNow,
            prevention: result.prevention,
            monitoring: result.monitoring,
            uncertainty_note: result.uncertaintyNote,
            provider: result.model,
          }
        : {
            user_id: context.userId,
            image_path: upload.error ? null : path,
            lang: data.lang,
            crop_hint: data.cropHint ?? null,
            usable: false,
            image_issues: result.imageIssues,
            advice: result.advice,
          };

      const saved = await supabaseAdmin
        .from("crop_diagnoses")
        .insert(row)
        .select("id")
        .single();

      if (saved.data?.id) return { ...result, savedId: saved.data.id };
    } catch (error) {
      console.error("diagnosis persistence failed", error);
    }

    return result;
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

    if (error || !data) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    return Promise.all(
      data.map(async (r) => {
        let imageUrl: string | null = null;
        if (r.image_path) {
          const signed = await supabaseAdmin.storage
            .from("crop-photos")
            .createSignedUrl(r.image_path, 60 * 60);
          imageUrl = signed.data?.signedUrl ?? null;
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
    await context.supabase
      .from("crop_diagnoses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { ok: true };
  });

export type DiagnosisContext = {
  id: string;
  crop: string | null;
  condition: string | null;
  confidence: number | null;
  severity: string | null;
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
      .select("id,crop,condition,confidence,severity,created_at")
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
      checkedAt: data.created_at,
    };
  });
