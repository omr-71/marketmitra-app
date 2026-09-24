import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { n as MOOD_SETTINGS, t as MITRA_VOICES } from "./voices-0m0VMK20.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tts.functions-UpBmDo1t.js
var schema = objectType({
	text: stringType().trim().min(1).max(1200),
	/** Mitra voice identity chosen in Settings. */
	voiceId: stringType().trim().min(1),
	mood: enumType([
		"friendly",
		"informative",
		"concerned",
		"reassuring",
		"happy"
	]).default("informative"),
	/** Farmer speed preference (0.7–1.4). */
	speed: numberType().min(.7).max(1.4).default(1),
	/** UI language so Hindi/Marathi answers are phonemised natively, not as English. */
	lang: enumType([
		"en",
		"hi",
		"mr"
	]).default("en")
});
/** ElevenLabs phonemisation hint. Marathi shares Hindi's Devanagari engine. */
var LANG_CODE = {
	en: "en",
	hi: "hi",
	mr: "hi"
};
var synthesizeMitraSpeech_createServerFn_handler = createServerRpc({
	id: "93e3157faecc9e09237f53341cf3d76f2b32b21079e797891fa02e1dadbb95fd",
	name: "synthesizeMitraSpeech",
	filename: "src/lib/tts.functions.ts"
}, (opts) => synthesizeMitraSpeech.__executeServer(opts));
var synthesizeMitraSpeech = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => schema.parse(data)).handler(synthesizeMitraSpeech_createServerFn_handler, async ({ data }) => {
	const voice = MITRA_VOICES.find((v) => v.id === data.voiceId);
	if (!voice) throw new Error("That voice is not available. Please pick another voice.");
	const key = process.env["ELEVENLABS_API_KEY"];
	if (!key) throw new Error("Spoken answers are not configured right now.");
	const mood = MOOD_SETTINGS[data.mood];
	const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.providerId}?output_format=mp3_44100_128`, {
		method: "POST",
		headers: {
			"xi-api-key": key,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			text: data.text,
			model_id: "eleven_multilingual_v2",
			language_code: LANG_CODE[data.lang],
			voice_settings: {
				stability: mood.stability,
				similarity_boost: mood.similarity_boost,
				style: mood.style,
				speed: Math.max(.7, Math.min(1.2, mood.speed * data.speed)),
				use_speaker_boost: true
			}
		})
	});
	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		console.error("Mitra speech provider failed", response.status, detail.slice(0, 300));
		if (response.status === 401 || response.status === 403) throw new Error("Spoken answers are not available right now.");
		if (response.status === 429) throw new Error("Too many voice requests just now. Please try again in a moment.");
		throw new Error("Mitra could not speak that answer. Please try again.");
	}
	const buffer = await response.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
	return {
		audio: btoa(binary),
		mime: "audio/mpeg",
		voiceId: voice.id
	};
});
//#endregion
export { synthesizeMitraSpeech_createServerFn_handler };
