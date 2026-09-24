import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diagnose.functions-B7W7npQR.js
var langName = {
	en: "English",
	mr: "Marathi (मराठी)",
	hi: "Hindi (हिंदी)"
};
var modelSchema = objectType({
	usable: booleanType(),
	imageIssues: arrayType(stringType().max(160)).max(6).nullable().optional(),
	advice: stringType().max(400).nullable().optional(),
	crop: stringType().max(80).nullable().optional(),
	condition: stringType().max(120).nullable().optional(),
	confidence: numberType().nullable().optional(),
	severity: stringType().max(60).nullable().optional(),
	symptoms: arrayType(stringType().max(240)).max(8).nullable().optional(),
	causes: arrayType(stringType().max(240)).max(8).nullable().optional(),
	conditionsFavouring: arrayType(stringType().max(240)).max(8).nullable().optional(),
	whatItIs: stringType().max(700).nullable().optional(),
	whyItHappens: stringType().max(700).nullable().optional(),
	whatToDoNow: arrayType(stringType().max(300)).max(8).nullable().optional(),
	prevention: arrayType(stringType().max(300)).max(8).nullable().optional(),
	monitoring: arrayType(stringType().max(300)).max(8).nullable().optional(),
	uncertaintyNote: stringType().max(400).nullable().optional()
});
var MODEL = "qwen/qwen3.8-27b";
var SYSTEM = `
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
function userText(data) {
	return `
Analyse this crop photo carefully.

${data.cropHint ? `The farmer thinks the crop may be: ${data.cropHint}.
Verify the crop from the image and correct it if necessary.
` : ""}

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
async function callGroq(data) {
	const apiKey = process.env["GROQ_API_KEY"];
	if (!apiKey) return {
		kind: "retryable",
		reason: "not_configured",
		message: "Groq image analysis is not configured."
	};
	try {
		const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: MODEL,
				messages: [{
					role: "system",
					content: SYSTEM
				}, {
					role: "user",
					content: [{
						type: "text",
						text: userText(data)
					}, {
						type: "image_url",
						image_url: { url: data.image }
					}]
				}],
				response_format: { type: "json_object" },
				temperature: .2,
				max_completion_tokens: 1800,
				reasoning_effort: "medium",
				reasoning_format: "hidden"
			})
		});
		if (!response.ok) {
			const body = await response.text();
			console.error(`Groq disease AI failed [${response.status}]: ${body.slice(0, 500)}`);
			if (response.status === 401 || response.status === 403) return {
				kind: "retryable",
				reason: "unavailable",
				message: "Image analysis authorization failed."
			};
			if (response.status === 429) return {
				kind: "retryable",
				reason: "busy",
				message: "Image analysis is temporarily busy."
			};
			if (response.status === 402) return {
				kind: "retryable",
				reason: "no_credits",
				message: "Image analysis quota has been reached."
			};
			return {
				kind: "retryable",
				reason: "unavailable",
				message: "Image analysis is temporarily unavailable."
			};
		}
		const content = (await response.json()).choices?.[0]?.message?.content;
		if (!content) throw new Error("Groq returned an empty response");
		const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
		const parsed = modelSchema.parse(JSON.parse(cleaned));
		const analysedAt = (/* @__PURE__ */ new Date()).toISOString();
		if (!parsed.usable || !parsed.condition || !parsed.crop) return {
			kind: "result",
			result: {
				ok: true,
				usable: false,
				imageIssues: (parsed.imageIssues ?? []).filter(Boolean),
				advice: parsed.advice ?? "Please send a clearer, well-lit close-up of the affected leaf or plant.",
				analysedAt
			}
		};
		const confidence = Math.max(1, Math.min(95, Math.round(parsed.confidence ?? 40)));
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
				uncertaintyNote: parsed.uncertaintyNote ?? (confidence < 70 ? "The visible signs are not conclusive in this photo." : null),
				analysedAt,
				model: MODEL
			}
		};
	} catch (error) {
		console.error("Groq crop disease analysis error:", error);
		return {
			kind: "retryable",
			reason: "unavailable",
			message: "Image analysis could not be completed."
		};
	}
}
/**
* Main crop-photo analysis function.
*
* Uses the direct Groq API instead of the Lovable AI gateway.
*/
async function analyseCropPhoto(data) {
	if (!process.env["GROQ_API_KEY"]) return {
		ok: false,
		reason: "not_configured",
		message: "Image analysis is not configured for this app yet."
	};
	const attempt = await callGroq(data);
	if (attempt.kind === "result") return attempt.result;
	return {
		ok: false,
		reason: attempt.reason,
		message: attempt.message
	};
}
var inputSchema = objectType({
	/** JPEG/PNG/WebP data URL of the farmer's photo, already downscaled in the browser. */
	image: stringType().min(100).max(6e6).refine((v) => /^data:image\/(jpeg|jpg|png|webp);base64,/.test(v), "unsupported image"),
	lang: enumType([
		"en",
		"mr",
		"hi"
	]),
	cropHint: stringType().trim().max(60).optional()
});
function dataUrlToBytes(image) {
	const [head, body] = image.split(",");
	const mime = /data:([^;]+);/.exec(head ?? "")?.[1] ?? "image/jpeg";
	const binary = atob(body ?? "");
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return {
		bytes,
		mime,
		ext: mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg"
	};
}
/**
* Analyses the photo AND keeps a private record of usable results so the farmer
* (and Mitra AI, on request) can look back at earlier checks.
*/
var diagnoseCropImage_createServerFn_handler = createServerRpc({
	id: "b290c1d39325ae1c0f5ffa98ae93963af1491f9dac893e2524a97ba9f2434f8e",
	name: "diagnoseCropImage",
	filename: "src/lib/diagnose.functions.ts"
}, (opts) => diagnoseCropImage.__executeServer(opts));
var diagnoseCropImage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => inputSchema.parse(data)).handler(diagnoseCropImage_createServerFn_handler, async ({ data, context }) => {
	const result = await analyseCropPhoto(data);
	if (!result.ok) return result;
	try {
		const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
		const { bytes, mime, ext } = dataUrlToBytes(data.image);
		const path = `${context.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
		const upload = await supabaseAdmin.storage.from("crop-photos").upload(path, bytes, {
			contentType: mime,
			upsert: false
		});
		const row = result.usable ? {
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
			provider: result.model
		} : {
			user_id: context.userId,
			image_path: upload.error ? null : path,
			lang: data.lang,
			crop_hint: data.cropHint ?? null,
			usable: false,
			image_issues: result.imageIssues,
			advice: result.advice
		};
		const saved = await supabaseAdmin.from("crop_diagnoses").insert(row).select("id").single();
		if (saved.data?.id) return {
			...result,
			savedId: saved.data.id
		};
	} catch (error) {
		console.error("diagnosis persistence failed", error);
	}
	return result;
});
var listCropDiagnoses_createServerFn_handler = createServerRpc({
	id: "4691ca99c6afa9ebd745a06686e74fa34f7af1183f24812d5e265745681c0741",
	name: "listCropDiagnoses",
	filename: "src/lib/diagnose.functions.ts"
}, (opts) => listCropDiagnoses.__executeServer(opts));
var listCropDiagnoses = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listCropDiagnoses_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("crop_diagnoses").select("*").eq("user_id", context.userId).eq("usable", true).order("created_at", { ascending: false }).limit(12);
	if (error || !data) return [];
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	return Promise.all(data.map(async (r) => {
		let imageUrl = null;
		if (r.image_path) imageUrl = (await supabaseAdmin.storage.from("crop-photos").createSignedUrl(r.image_path, 3600)).data?.signedUrl ?? null;
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
			imageUrl
		};
	}));
});
var deleteCropDiagnosis_createServerFn_handler = createServerRpc({
	id: "f91c79017bdd7188c29bab67dbb4bbb3500a7ec00461ff8f5c19544fd36c6a03",
	name: "deleteCropDiagnosis",
	filename: "src/lib/diagnose.functions.ts"
}, (opts) => deleteCropDiagnosis.__executeServer(opts));
var deleteCropDiagnosis = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ id: stringType().uuid() }).parse(input)).handler(deleteCropDiagnosis_createServerFn_handler, async ({ data, context }) => {
	await context.supabase.from("crop_diagnoses").delete().eq("id", data.id).eq("user_id", context.userId);
	return { ok: true };
});
var latestDiagnosisContext_createServerFn_handler = createServerRpc({
	id: "a00164bf9cacbeda2aba2372f6a6a5cd0163b1098c61d3611fbab7c16bf2225c",
	name: "latestDiagnosisContext",
	filename: "src/lib/diagnose.functions.ts"
}, (opts) => latestDiagnosisContext.__executeServer(opts));
var latestDiagnosisContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(latestDiagnosisContext_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.from("crop_diagnoses").select("id,crop,condition,confidence,severity,what_to_do_now,prevention,created_at").eq("user_id", context.userId).eq("usable", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
	if (!data) return null;
	return {
		id: data.id,
		crop: data.crop,
		condition: data.condition,
		confidence: data.confidence,
		severity: data.severity,
		treatment: (data.what_to_do_now ?? []).slice(0, 4),
		prevention: (data.prevention ?? []).slice(0, 3),
		checkedAt: data.created_at
	};
});
//#endregion
export { deleteCropDiagnosis_createServerFn_handler, diagnoseCropImage_createServerFn_handler, latestDiagnosisContext_createServerFn_handler, listCropDiagnoses_createServerFn_handler };
