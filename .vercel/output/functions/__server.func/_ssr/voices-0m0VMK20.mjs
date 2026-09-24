//#region node_modules/.nitro/vite/services/ssr/assets/voices-0m0VMK20.js
/** Licensed ElevenLabs catalogue voices, presented as Mitra voice identities. */
var MITRA_VOICES = [
	{
		id: "aarohi",
		providerId: "EXAVITQu4vr4xnSDxMaL",
		name: "Aarohi",
		gender: "female",
		style: {
			en: "Warm and conversational",
			mr: "उबदार आणि सहज संवादी",
			hi: "गर्मजोशी भरी और सहज"
		}
	},
	{
		id: "meera",
		providerId: "Xb7hH8MSUJpSbSDYk0k2",
		name: "Meera",
		gender: "female",
		style: {
			en: "Clear and precise",
			mr: "स्पष्ट आणि नेमकी",
			hi: "स्पष्ट और सटीक"
		}
	},
	{
		id: "kavita",
		providerId: "XrExE9yKIg1WjnnlVkGX",
		name: "Kavita",
		gender: "female",
		style: {
			en: "Gentle and patient",
			mr: "सौम्य आणि संयमी",
			hi: "कोमल और धैर्यवान"
		}
	},
	{
		id: "arjun",
		providerId: "JBFqnCBsd6RMkjVDRZzb",
		name: "Arjun",
		gender: "male",
		style: {
			en: "Calm and steady",
			mr: "शांत आणि स्थिर",
			hi: "शांत और स्थिर"
		}
	},
	{
		id: "rohan",
		providerId: "TX3LPaxmHKxFdv7VOQHJ",
		name: "Rohan",
		gender: "male",
		style: {
			en: "Bright and energetic",
			mr: "उत्साही आणि ताजा",
			hi: "उत्साही और ऊर्जावान"
		}
	},
	{
		id: "vikram",
		providerId: "nPczCjzI2devNBz1zQrb",
		name: "Vikram",
		gender: "male",
		style: {
			en: "Deep and assured",
			mr: "खर्जातला आणि विश्वासदायी",
			hi: "गहरा और भरोसेमंद"
		}
	}
];
function findVoice(id) {
	return MITRA_VOICES.find((v) => v.id === id) ?? MITRA_VOICES[0];
}
/**
* Subtle delivery changes per mood. Stability high = even keel, lower =
* more natural variation. Style stays low so nothing sounds acted out.
*/
var MOOD_SETTINGS = {
	friendly: {
		stability: .45,
		similarity_boost: .8,
		style: .25,
		speed: 1
	},
	informative: {
		stability: .62,
		similarity_boost: .8,
		style: .1,
		speed: 1
	},
	concerned: {
		stability: .7,
		similarity_boost: .82,
		style: .15,
		speed: .94
	},
	reassuring: {
		stability: .6,
		similarity_boost: .85,
		style: .2,
		speed: .93
	},
	happy: {
		stability: .4,
		similarity_boost: .78,
		style: .35,
		speed: 1.04
	}
};
var CONCERN_WORDS = [
	"warning",
	"alert",
	"avoid",
	"risk",
	"damage",
	"heavy rain",
	"loss",
	"do not",
	"unsafe",
	"danger",
	"इशारा",
	"धोका",
	"नुकसान",
	"टाळा",
	"चेतावनी",
	"खतरा",
	"बचें"
];
var REASSURE_WORDS = [
	"don't worry",
	"no need to worry",
	"understandable",
	"i understand",
	"we can",
	"काळजी करू नका",
	"समजतं",
	"चिंता न करें",
	"समझ सकता"
];
var HAPPY_WORDS = [
	"good news",
	"increased",
	"higher price",
	"best price",
	"congratulations",
	"excellent",
	"चांगली बातमी",
	"वाढ",
	"सर्वोत्तम",
	"अभिनंदन",
	"अच्छी खबर",
	"बढ़"
];
var DATA_WORDS = [
	"₹",
	"quintal",
	"agmarknet",
	"क्विंटल",
	"mandi",
	"forecast",
	"अंदाज"
];
/** Infers a natural mood from the answer text — no model call needed. */
function detectMood(text) {
	const t = text.toLowerCase();
	const has = (list) => list.some((w) => t.includes(w.toLowerCase()));
	if (has(CONCERN_WORDS)) return "concerned";
	if (has(REASSURE_WORDS)) return "reassuring";
	if (has(HAPPY_WORDS)) return "happy";
	if (has(DATA_WORDS)) return "informative";
	return "friendly";
}
//#endregion
export { findVoice as i, MOOD_SETTINGS as n, detectMood as r, MITRA_VOICES as t };
