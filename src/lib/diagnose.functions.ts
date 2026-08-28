import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyseCropPhoto } from "./diagnose.server";

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

export const diagnoseCropImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => analyseCropPhoto(data));
