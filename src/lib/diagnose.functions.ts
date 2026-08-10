import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
};

export type DiagnosisResult = DiagnosisOk | DiagnosisUnusable | DiagnosisFailure;

const langName = { en: "English", mr: "Marathi (मराठी)", hi: "Hindi (हिंदी)" } as const;

const modelSchema = z.object({
  usable: z.boolean(),
  imageIssues: z.array(z.string().max(160)).max(6).nullable().optional(),
  advice: z.string().max(400).nullable().optional(),
  crop: z.string().max(80).nullable().optional(),
  condition: z.string().max(120).nullable().optional(),
  confidence: z.number().nullable().optional(),
  severity: z.string().max(60).nullable().optional(),
  symptoms: z.array(z.string().max(240)).max(8).nullable().optional(),
  causes: z.array(z.string().max(240)).max(8).nullable().optional(),
  conditionsFavouring: z.array(z.string().max(240)).max(8).nullable().optional(),
  whatItIs: z.string().max(700).nullable().optional(),
  whyItHappens: z.string().max(700).nullable().optional(),
  whatToDoNow: z.array(z.string().max(300)).max(8).nullable().optional(),
  prevention: z.array(z.string().max(300)).max(8).nullable().optional(),
  monitoring: z.array(z.string().max(300)).max(8).nullable().optional(),
  uncertaintyNote: z.string().max(400).nullable().optional(),
});

const MODEL = "openai/gpt-5.6-sol";

const SYSTEM = `You are a plant pathology assistant for Indian smallholder farmers. You look ONLY at the photo supplied and report what is actually visible.

Hard rules:
- Judge image quality first. If the photo is blurry, too dark or over-exposed, taken too far away, badly framed, or does not clearly show a crop plant / leaf / fruit, set "usable": false, list the concrete problems in imageIssues, and give short re-shoot advice. Do NOT diagnose in that case.
- Never invent a diagnosis. If the visible evidence fits several conditions, say so and lower the confidence.
- Confidence is an honest integer 1-95. Never use 100 and never claim certainty or guaranteed accuracy.
- Treatment guidance must be evidence-based, generic and label-driven: cultural, sanitation, irrigation and monitoring steps, plus "use only a product registered for this crop and disease, follow the product label dose and interval, and confirm with your local KVK / agriculture officer". NEVER name a pesticide, fungicide or brand, never give a dose, concentration, spray volume or chemical mixture, and never promise a cure.
- Keep sentences short and plain, written for a farmer with a phone.
- Write EVERY string value in the requested language. Keep the JSON keys in English.
- Respond with a single JSON object only.`;

export const diagnoseCropImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<DiagnosisResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return {
        ok: false,
        reason: "not_configured",
        message: "Image analysis is not configured for this app yet.",
      };
    }

    const userText = `Analyse this crop photo.
${data.cropHint ? `The farmer says the crop may be: ${data.cropHint}. Verify it from the image; correct it if the image shows something else.\n` : ""}Answer language: ${langName[data.lang]}.

Return JSON with exactly these keys:
{"usable": boolean, "imageIssues": string[], "advice": string, "crop": string, "condition": string, "confidence": integer 1-95, "severity": string or null, "symptoms": string[], "causes": string[], "conditionsFavouring": string[], "whatItIs": string, "whyItHappens": string, "whatToDoNow": string[], "prevention": string[], "monitoring": string[], "uncertaintyNote": string or null}

If usable is false, fill imageIssues and advice and leave the diagnosis fields empty/null. If usable is true, fill the diagnosis fields; set severity only when the photo genuinely shows how widespread the damage is, otherwise null. Set uncertaintyNote whenever confidence is below 70 or the signs are ambiguous, telling the farmer to send a clearer photo or consult an agricultural expert.`;

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
        body: JSON.stringify({
          model: MODEL,
          reasoning_effort: "none",
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                { type: "text", text: userText },
                { type: "image_url", image_url: { url: data.image } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`disease AI failed [${response.status}]: ${body.slice(0, 400)}`);
        if (response.status === 429)
          return { ok: false, reason: "busy", message: "Analysis service is busy. Please try again in a minute." };
        if (response.status === 402)
          return { ok: false, reason: "no_credits", message: "Analysis service is out of credits." };
        return { ok: false, reason: "unavailable", message: "Analysis service is temporarily unavailable." };
      }

      const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error("empty completion");

      const parsed = modelSchema.parse(JSON.parse(content));
      const analysedAt = new Date().toISOString();

      if (!parsed.usable || !parsed.condition || !parsed.crop) {
        return {
          ok: true,
          usable: false,
          imageIssues: (parsed.imageIssues ?? []).filter(Boolean),
          advice:
            parsed.advice ??
            "Please send a clearer, well-lit close-up of the affected leaf filling most of the frame.",
          analysedAt,
        };
      }

      const confidence = Math.max(1, Math.min(95, Math.round(parsed.confidence ?? 40)));

      return {
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
        uncertaintyNote:
          parsed.uncertaintyNote ?? (confidence < 70 ? "Signs are not conclusive in this photo." : null),
        analysedAt,
        model: MODEL,
      };
    } catch (error) {
      console.error("disease analysis error", error);
      return { ok: false, reason: "unavailable", message: "Analysis could not be completed. Please try again." };
    }
  });
