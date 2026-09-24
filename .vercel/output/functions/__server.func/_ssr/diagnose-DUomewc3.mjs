import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { M as useServerFn, S as useLang, b as track, d as diagnoseCropImage, g as listCropDiagnoses, l as crops, u as deleteCropDiagnosis } from "./router-5yV9beqj.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as Sparkles, D as Stethoscope, Ht as Camera, N as ShieldCheck, R as RefreshCw, Wt as BookOpen, kt as CloudUpload, lt as Info, m as TriangleAlert, n as X, ot as Leaf, pt as History, rt as LoaderCircle, ut as Image, vt as FlaskConical, x as Thermometer, xt as Eye } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diagnose-DUomewc3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var L = {
	title: {
		en: "Crop disease identifier",
		mr: "पीक रोग ओळख",
		hi: "फ़सल रोग पहचान"
	},
	subtitle: {
		en: "AI reading of a real leaf photo",
		mr: "प्रत्यक्ष पानाच्या फोटोवरून AI विश्लेषण",
		hi: "असली पत्ते की फ़ोटो से AI विश्लेषण"
	},
	deskSubtitle: {
		en: "AI-assisted identification from a real photo of your crop",
		mr: "तुमच्या पिकाच्या खऱ्या फोटोवरून AI-सहाय्यित ओळख",
		hi: "आपकी फ़सल की असली फ़ोटो से AI-सहायित पहचान"
	},
	intro: {
		en: "Take a close-up of the affected leaf, fruit or stem in daylight. The photo is analysed by an AI vision model — it is a guide, not a lab test.",
		mr: "प्रभावित पान, फळ किंवा खोडाचा दिवसाच्या उजेडात जवळून फोटो घ्या. फोटोचे AI विश्लेषण होते — हा सल्ला आहे, प्रयोगशाळा चाचणी नाही.",
		hi: "प्रभावित पत्ता, फल या तना दिन के उजाले में नज़दीक से फ़ोटो लें. फ़ोटो का AI विश्लेषण होता है — यह मार्गदर्शन है, प्रयोगशाला जाँच नहीं."
	},
	camera: {
		en: "Take photo",
		mr: "फोटो घ्या",
		hi: "फ़ोटो लें"
	},
	gallery: {
		en: "Upload from gallery",
		mr: "गॅलरीतून अपलोड",
		hi: "गैलरी से अपलोड"
	},
	cropHint: {
		en: "Crop (optional)",
		mr: "पीक (ऐच्छिक)",
		hi: "फ़सल (वैकल्पिक)"
	},
	notSure: {
		en: "Not sure",
		mr: "माहीत नाही",
		hi: "पता नहीं"
	},
	analyse: {
		en: "Analyse photo",
		mr: "फोटो तपासा",
		hi: "फ़ोटो जाँचें"
	},
	analysing: {
		en: "Analysing the photo…",
		mr: "फोटो तपासत आहे…",
		hi: "फ़ोटो जाँच रहे हैं…"
	},
	remove: {
		en: "Remove photo",
		mr: "फोटो काढा",
		hi: "फ़ोटो हटाएँ"
	},
	change: {
		en: "Change photo",
		mr: "फोटो बदला",
		hi: "फ़ोटो बदलें"
	},
	again: {
		en: "New diagnosis",
		mr: "नवीन तपासणी",
		hi: "नई जाँच"
	},
	retry: {
		en: "Try again",
		mr: "पुन्हा प्रयत्न",
		hi: "फिर कोशिश करें"
	},
	aiAnalysis: {
		en: "AI Analysis",
		mr: "AI विश्लेषण",
		hi: "AI विश्लेषण"
	},
	confidence: {
		en: "AI confidence",
		mr: "AI विश्वास",
		hi: "AI विश्वास"
	},
	confidenceNote: {
		en: "AI confidence — not scientific certainty",
		mr: "AI विश्वास — शास्त्रीय खात्री नाही",
		hi: "AI विश्वास — वैज्ञानिक निश्चितता नहीं"
	},
	cropDetected: {
		en: "Crop detected",
		mr: "ओळखलेले पीक",
		hi: "पहचानी गई फ़सल"
	},
	condition: {
		en: "Condition detected",
		mr: "ओळखलेला रोग / स्थिती",
		hi: "पहचानी गई बीमारी / स्थिति"
	},
	severity: {
		en: "Severity",
		mr: "तीव्रता",
		hi: "गंभीरता"
	},
	symptoms: {
		en: "Symptoms",
		mr: "लक्षणे",
		hi: "लक्षण"
	},
	causes: {
		en: "Causes",
		mr: "कारणे",
		hi: "कारण"
	},
	envConditions: {
		en: "Conditions that favour it",
		mr: "पोषक हवामान स्थिती",
		hi: "अनुकूल मौसम स्थितियाँ"
	},
	diagnosisTab: {
		en: "Diagnosis",
		mr: "निदान",
		hi: "निदान"
	},
	whatItIs: {
		en: "What it is",
		mr: "हे काय आहे",
		hi: "यह क्या है"
	},
	whyItHappens: {
		en: "Why it happens",
		mr: "हे का होते",
		hi: "यह क्यों होता है"
	},
	whatToDo: {
		en: "Immediate action",
		mr: "तातडीची कृती",
		hi: "तत्काल कार्रवाई"
	},
	treatment: {
		en: "Treatment",
		mr: "उपचार",
		hi: "उपचार"
	},
	sprays: {
		en: "Sprays",
		mr: "फवारणी",
		hi: "स्प्रे"
	},
	prevention: {
		en: "Prevention",
		mr: "प्रतिबंध",
		hi: "रोकथाम"
	},
	expert: {
		en: "Expert guidance",
		mr: "तज्ज्ञ मार्गदर्शन",
		hi: "विशेषज्ञ मार्गदर्शन"
	},
	sources: {
		en: "Sources",
		mr: "स्रोत",
		hi: "स्रोत"
	},
	monitoring: {
		en: "Keep watching for",
		mr: "पुढे लक्ष ठेवा",
		hi: "आगे ध्यान रखें"
	},
	uncertain: {
		en: "Not conclusive",
		mr: "निश्चित नाही",
		hi: "निश्चित नहीं"
	},
	imageProblem: {
		en: "Photo is not clear enough",
		mr: "फोटो पुरेसा स्पष्ट नाही",
		hi: "फ़ोटो पर्याप्त स्पष्ट नहीं"
	},
	disclaimer: {
		en: "AI guidance only — never 100% accurate. Confirm with your local KVK or agriculture officer before spending on inputs. Use only products registered for this crop and disease, and follow the product label for dose and interval.",
		mr: "हे केवळ AI मार्गदर्शन आहे — १००% अचूक नाही. खर्च करण्यापूर्वी स्थानिक KVK किंवा कृषी अधिकाऱ्याकडून खात्री करा. या पिकासाठी नोंदणीकृत उत्पादनेच वापरा आणि मात्रा व अंतर लेबलप्रमाणे पाळा.",
		hi: "यह केवल AI मार्गदर्शन है — 100% सटीक नहीं. खर्च करने से पहले स्थानीय KVK या कृषि अधिकारी से पुष्टि करें. इस फ़सल के लिए पंजीकृत उत्पाद ही उपयोग करें और मात्रा व अंतराल लेबल के अनुसार रखें."
	},
	pickFirst: {
		en: "Add a photo to start",
		mr: "सुरू करण्यासाठी फोटो जोडा",
		hi: "शुरू करने के लिए फ़ोटो जोड़ें"
	},
	emptyTitle: {
		en: "Upload a clear photo of your crop or affected plant part to begin AI-assisted identification.",
		mr: "AI-सहाय्यित ओळख सुरू करण्यासाठी तुमच्या पिकाचा किंवा प्रभावित भागाचा स्पष्ट फोटो अपलोड करा.",
		hi: "AI-सहायित पहचान शुरू करने के लिए अपनी फ़सल या प्रभावित भाग की स्पष्ट फ़ोटो अपलोड करें."
	},
	dropHint: {
		en: "Drag and drop an image here, or use the buttons below",
		mr: "इथे इमेज ड्रॅग-ड्रॉप करा, किंवा खालील बटणे वापरा",
		hi: "यहाँ इमेज ड्रैग-ड्रॉप करें, या नीचे के बटन इस्तेमाल करें"
	},
	tips: {
		en: "Photo tips",
		mr: "फोटो टिप्स",
		hi: "फ़ोटो टिप्स"
	},
	tip1: {
		en: "Fill the frame with the affected leaf or fruit",
		mr: "प्रभावित पान किंवा फळ पूर्ण फ्रेममध्ये घ्या",
		hi: "प्रभावित पत्ते या फल से फ़्रेम भरें"
	},
	tip2: {
		en: "Shoot in daylight, avoid shadows and flash",
		mr: "दिवसाच्या उजेडात, सावली व फ्लॅश टाळा",
		hi: "दिन के उजाले में लें, छाया व फ़्लैश से बचें"
	},
	tip3: {
		en: "Hold steady so the photo is sharp",
		mr: "फोटो स्पष्ट येण्यासाठी हात स्थिर ठेवा",
		hi: "फ़ोटो साफ़ आने के लिए हाथ स्थिर रखें"
	},
	tip4: {
		en: "Include both healthy and damaged parts",
		mr: "निरोगी व खराब दोन्ही भाग दिसू द्या",
		hi: "स्वस्थ और खराब दोनों हिस्से शामिल करें"
	},
	loading1: {
		en: "Analysing crop image…",
		mr: "पिकाचा फोटो तपासत आहे…",
		hi: "फ़सल की फ़ोटो जाँची जा रही है…"
	},
	loading2: {
		en: "Examining visible symptoms…",
		mr: "दिसणारी लक्षणे तपासत आहे…",
		hi: "दिखने वाले लक्षण जाँचे जा रहे हैं…"
	},
	loading3: {
		en: "Preparing agricultural guidance…",
		mr: "कृषी मार्गदर्शन तयार करत आहे…",
		hi: "कृषि मार्गदर्शन तैयार किया जा रहा है…"
	},
	noInfo: {
		en: "This information is not available for the current diagnosis.",
		mr: "सध्याच्या निदानासाठी ही माहिती उपलब्ध नाही.",
		hi: "वर्तमान निदान के लिए यह जानकारी उपलब्ध नहीं है."
	},
	noSpray: {
		en: "No verified treatment information is currently available.",
		mr: "सध्या पडताळलेली फवारणी माहिती उपलब्ध नाही.",
		hi: "फ़िलहाल सत्यापित उपचार जानकारी उपलब्ध नहीं है."
	},
	noSprayWhy: {
		en: "MarketMitra does not connect to a verified pesticide-label database, so no product name, active ingredient, dose or interval is shown. Ask your KVK or the state agriculture department for a label-approved recommendation for this crop and condition.",
		mr: "MarketMitra कोणत्याही पडताळलेल्या कीटकनाशक-लेबल डेटाबेसशी जोडलेले नाही, त्यामुळे उत्पादनाचे नाव, घटक, मात्रा किंवा अंतर दाखवले जात नाही. या पिकासाठी व स्थितीसाठी लेबल-मान्य शिफारशीसाठी KVK किंवा राज्य कृषी विभागाशी संपर्क साधा.",
		hi: "MarketMitra किसी सत्यापित कीटनाशक-लेबल डेटाबेस से जुड़ा नहीं है, इसलिए उत्पाद नाम, सक्रिय तत्व, मात्रा या अंतराल नहीं दिखाया जाता. इस फ़सल व स्थिति के लिए लेबल-अनुमोदित सिफ़ारिश हेतु KVK या राज्य कृषि विभाग से संपर्क करें."
	},
	sourceAi: {
		en: "AI-generated interpretation",
		mr: "AI-निर्मित विश्लेषण",
		hi: "AI-निर्मित व्याख्या"
	},
	sourceAiBody: {
		en: "Crop, condition, symptoms, causes and guidance on this page are the vision model's reading of your photo only.",
		mr: "या पानावरील पीक, स्थिती, लक्षणे, कारणे व मार्गदर्शन हे केवळ तुमच्या फोटोवरील मॉडेलचे वाचन आहे.",
		hi: "इस पेज पर फ़सल, स्थिति, लक्षण, कारण व मार्गदर्शन केवल आपकी फ़ोटो पर मॉडल का पठन है."
	},
	sourceVerified: {
		en: "Verified source information",
		mr: "पडताळलेली स्रोत माहिती",
		hi: "सत्यापित स्रोत जानकारी"
	},
	model: {
		en: "Model",
		mr: "मॉडेल",
		hi: "मॉडल"
	},
	analysedAt: {
		en: "Analysed at",
		mr: "तपासले",
		hi: "जाँचा गया"
	},
	language: {
		en: "Language",
		mr: "भाषा",
		hi: "भाषा"
	},
	askExpert: {
		en: "Confirm this reading with your local Krishi Vigyan Kendra (KVK) or the district agriculture officer before spending on any input. Carry the affected plant part with you if possible.",
		mr: "कोणताही खर्च करण्यापूर्वी हे निदान स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा जिल्हा कृषी अधिकाऱ्याकडून तपासा. शक्य असल्यास प्रभावित भाग सोबत न्या.",
		hi: "कोई भी खर्च करने से पहले इस निदान की पुष्टि स्थानीय कृषि विज्ञान केंद्र (KVK) या ज़िला कृषि अधिकारी से करें. संभव हो तो प्रभावित हिस्सा साथ ले जाएँ."
	},
	workspace: {
		en: "Diagnosis workspace",
		mr: "तपासणी कक्ष",
		hi: "जाँच कक्ष"
	},
	invalidImage: {
		en: "That file could not be read as an image. Please choose a JPG, PNG or WebP photo.",
		mr: "ही फाईल इमेज म्हणून वाचता आली नाही. कृपया JPG, PNG किंवा WebP फोटो निवडा.",
		hi: "यह फ़ाइल इमेज के रूप में नहीं पढ़ी जा सकी. कृपया JPG, PNG या WebP फ़ोटो चुनें."
	},
	networkError: {
		en: "Analysis could not be completed. Please check your connection and try again.",
		mr: "विश्लेषण पूर्ण होऊ शकले नाही. कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा.",
		hi: "विश्लेषण पूरा नहीं हो सका. कृपया कनेक्शन जाँचकर फिर कोशिश करें."
	},
	historyTitle: {
		en: "Your earlier checks",
		mr: "तुमच्या आधीच्या तपासण्या",
		hi: "आपकी पिछली जाँचें"
	},
	historyLoading: {
		en: "Loading your saved checks…",
		mr: "तुमच्या तपासण्या उघडत आहे…",
		hi: "आपकी जाँचें खुल रही हैं…"
	},
	historyEmpty: {
		en: "Your successful crop checks are saved here privately, so you can compare them later.",
		mr: "तुमच्या यशस्वी तपासण्या येथे खासगीरित्या जतन होतात, नंतर तुलना करता येते.",
		hi: "आपकी सफल जाँचें यहाँ निजी रूप से सुरक्षित रहती हैं, बाद में तुलना कर सकते हैं."
	},
	historyDelete: {
		en: "Delete this check",
		mr: "ही तपासणी हटवा",
		hi: "यह जाँच हटाएँ"
	}
};
var langLabel = {
	en: "English",
	mr: "मराठी",
	hi: "हिंदी"
};
/** Downscale in the browser so uploads stay small and fast on mobile data. */
async function toCompactDataUrl(file) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas unavailable");
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close?.();
	return canvas.toDataURL("image/jpeg", .82);
}
function Bullets({ items, empty }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm leading-relaxed text-muted-foreground",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2.5",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-2.5 text-sm leading-relaxed text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
		}, item))
	});
}
function Block({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border border-border/70 bg-card/40 p-4 lg:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-bold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2.5",
			children
		})]
	});
}
/** Circular AI-confidence indicator (SVG, no animation loops). */
function ConfidenceDial({ value, label, note }) {
	const r = 34;
	const c = 2 * Math.PI * r;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative size-[86px] shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 80 80",
				className: "size-full -rotate-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "40",
					cy: "40",
					r,
					fill: "none",
					strokeWidth: "8",
					className: "stroke-muted"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "40",
					cy: "40",
					r,
					fill: "none",
					strokeWidth: "8",
					strokeLinecap: "round",
					className: "stroke-primary transition-[stroke-dashoffset] duration-700 ease-out",
					strokeDasharray: c,
					strokeDashoffset: c - c * Math.max(0, Math.min(100, value)) / 100
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display text-lg font-bold text-primary",
					children: [value, "%"]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-muted-foreground",
				children: note
			})]
		})]
	});
}
function DiagnosePage() {
	const { lang } = useLang();
	const s = (k) => L[k][lang];
	const cameraRef = (0, import_react.useRef)(null);
	const galleryRef = (0, import_react.useRef)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [cropHint, setCropHint] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("diagnosis");
	const [loadStep, setLoadStep] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!busy) {
			setLoadStep(0);
			return;
		}
		const id = setInterval(() => setLoadStep((n) => (n + 1) % 3), 2200);
		return () => clearInterval(id);
	}, [busy]);
	const pick = (0, import_react.useCallback)(async (file) => {
		if (!file) return;
		setError(null);
		setResult(null);
		setTab("diagnosis");
		if (!file.type.startsWith("image/")) {
			setError(L.invalidImage[lang]);
			return;
		}
		try {
			setPreview(await toCompactDataUrl(file));
		} catch {
			setError(L.invalidImage[lang]);
		}
	}, [lang]);
	const qc = useQueryClient();
	const listFn = useServerFn(listCropDiagnoses);
	const deleteFn = useServerFn(deleteCropDiagnosis);
	const history = useQuery({
		queryKey: ["crop-diagnoses"],
		queryFn: () => listFn(),
		retry: false,
		staleTime: 6e4
	});
	const remove = useMutation({
		mutationFn: (vars) => deleteFn({ data: vars }),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ["crop-diagnoses"] })
	});
	const openSaved = (h) => {
		setError(null);
		setPreview(h.imageUrl);
		setTab("diagnosis");
		setResult({
			ok: true,
			usable: true,
			crop: h.crop ?? "",
			condition: h.condition ?? "",
			confidence: h.confidence ?? 0,
			severity: h.severity,
			symptoms: h.symptoms,
			causes: h.causes,
			conditionsFavouring: [],
			whatItIs: h.whatItIs ?? "",
			whyItHappens: h.whyItHappens ?? "",
			whatToDoNow: h.whatToDoNow,
			prevention: h.prevention,
			monitoring: h.monitoring,
			uncertaintyNote: h.uncertaintyNote,
			analysedAt: h.createdAt,
			model: "saved"
		});
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const run = async () => {
		if (!preview || !preview.startsWith("data:")) return;
		setBusy(true);
		setError(null);
		setResult(null);
		track("diagnose_started", { label: cropHint || null });
		try {
			const data = await diagnoseCropImage({ data: {
				image: preview,
				lang,
				...cropHint ? { cropHint } : {}
			} });
			setResult(data);
			setTab("diagnosis");
			track(data.ok ? "diagnose_completed" : "diagnose_failed", { label: cropHint || null });
			if (!data.ok) setError(data.message);
			else qc.invalidateQueries({ queryKey: ["crop-diagnoses"] });
		} catch {
			track("diagnose_failed");
			setError(L.networkError[lang]);
		} finally {
			setBusy(false);
		}
	};
	const reset = () => {
		setPreview(null);
		setResult(null);
		setError(null);
		setTab("diagnosis");
		if (cameraRef.current) cameraRef.current.value = "";
		if (galleryRef.current) galleryRef.current.value = "";
	};
	const diagnosis = result?.ok && result.usable ? result : null;
	const tabs = (0, import_react.useMemo)(() => [
		{
			id: "diagnosis",
			label: s("diagnosisTab"),
			icon: Stethoscope
		},
		{
			id: "symptoms",
			label: s("symptoms"),
			icon: Eye
		},
		{
			id: "causes",
			label: s("causes"),
			icon: TriangleAlert
		},
		{
			id: "action",
			label: s("whatToDo"),
			icon: Sparkles
		},
		{
			id: "treatment",
			label: s("treatment"),
			icon: ShieldCheck
		},
		{
			id: "sprays",
			label: s("sprays"),
			icon: FlaskConical
		},
		{
			id: "prevention",
			label: s("prevention"),
			icon: Leaf
		},
		{
			id: "expert",
			label: s("expert"),
			icon: Info
		},
		{
			id: "sources",
			label: s("sources"),
			icon: BookOpen
		}
	], [lang]);
	const uploader = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface border-t-4 border-t-primary p-4 lg:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 text-sm font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stethoscope, { className: "size-4 text-primary" }), s("aiAnalysis")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-xs leading-relaxed text-muted-foreground lg:text-sm",
				children: s("intro")
			}),
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "animate-scale-in relative mt-4 overflow-hidden rounded-2xl border border-border/70",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: preview,
					alt: "Crop photo selected for analysis",
					loading: "lazy",
					decoding: "async",
					className: "aspect-[4/3] max-h-[55vh] w-full object-cover lg:aspect-auto lg:h-[340px] lg:max-h-none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-2 top-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => galleryRef.current?.click(),
						className: "press rounded-full bg-background/85 px-3 py-2 text-xs font-bold backdrop-blur transition-colors hover:bg-background",
						children: s("change")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: reset,
						"aria-label": s("remove"),
						className: "press grid size-9 place-items-center rounded-full bg-background/85 backdrop-blur transition-colors hover:bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onDragOver: (e) => {
					e.preventDefault();
					setDragging(true);
				},
				onDragLeave: () => setDragging(false),
				onDrop: (e) => {
					e.preventDefault();
					setDragging(false);
					pick(e.dataTransfer.files?.[0]);
				},
				onClick: () => galleryRef.current?.click(),
				onKeyDown: (e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						galleryRef.current?.click();
					}
				},
				role: "button",
				tabIndex: 0,
				"aria-label": s("gallery"),
				className: `mt-4 grid cursor-pointer place-items-center rounded-xl border border-dashed px-4 py-7 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-5 lg:py-14 ${dragging ? "border-primary bg-primary/8" : "border-border/80 bg-muted/40 hover:border-primary/60"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "size-7 text-primary/80" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-md text-sm font-semibold",
						children: s("emptyTitle")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-xs text-muted-foreground",
						children: s("dropHint")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => cameraRef.current?.click(),
					className: "press flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), s("camera")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => galleryRef.current?.click(),
					className: "press flex items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-4" }), s("gallery")]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: cameraRef,
				type: "file",
				accept: "image/*",
				capture: "environment",
				className: "sr-only",
				"aria-label": s("camera"),
				onChange: (e) => void pick(e.target.files?.[0])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: galleryRef,
				type: "file",
				accept: "image/*",
				className: "sr-only",
				"aria-label": s("gallery"),
				onChange: (e) => void pick(e.target.files?.[0])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "crop-hint",
				className: "mt-4 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground",
				children: s("cropHint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				id: "crop-hint",
				value: cropHint,
				onChange: (e) => setCropHint(e.target.value),
				className: "mt-1.5 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: s("notSure")
				}), crops.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: c.commodity,
					children: c.name[lang]
				}, c.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: !preview || busy,
				onClick: () => void run(),
				className: "press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), busy ? s("analysing") : preview ? s("analyse") : s("pickFirst")]
			}),
			!preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl border border-border/70 bg-muted/30 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wide text-muted-foreground",
					children: s("tips")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1.5",
					children: [
						s("tip1"),
						s("tip2"),
						s("tip3"),
						s("tip4")
					].map((tip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2 text-xs leading-relaxed text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tip })]
					}, tip))
				})]
			})
		]
	});
	const tabContent = (d) => {
		switch (tab) {
			case "diagnosis": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: s("whatItIs"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted-foreground",
							children: d.whatItIs || s("noInfo")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: s("whyItHappens"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted-foreground",
							children: d.whyItHappens || s("noInfo")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: s("envConditions"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
							items: d.conditionsFavouring,
							empty: s("noInfo")
						})
					})
				]
			});
			case "symptoms": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				title: s("symptoms"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: d.symptoms,
					empty: s("noInfo")
				})
			});
			case "causes": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				title: s("causes"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: d.causes,
					empty: s("noInfo")
				})
			});
			case "action": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				title: s("whatToDo"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: d.whatToDoNow,
					empty: s("noInfo")
				})
			});
			case "treatment": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: s("treatment"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
							items: d.whatToDoNow,
							empty: s("noInfo")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
						title: s("monitoring"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
							items: d.monitoring,
							empty: s("noInfo")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-3xl border border-border/70 p-4 text-xs leading-relaxed text-muted-foreground",
						children: s("disclaimer")
					})
				]
			});
			case "sprays": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 lg:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlaskConical, { className: "size-4" }), s("noSpray")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: s("noSprayWhy")
				})]
			});
			case "prevention": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				title: s("prevention"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bullets, {
					items: d.prevention,
					empty: s("noInfo")
				})
			});
			case "expert": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: s("expert"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: s("askExpert")
					})
				}), d.uncertaintyNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: s("uncertain"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: d.uncertaintyNote
					})
				})]
			});
			case "sources": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: s("sourceAi"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: s("sourceAiBody")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 space-y-1.5 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3 border-t border-border/60 pt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "font-semibold",
									children: s("model")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "truncate",
									children: d.model
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3 border-t border-border/60 pt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "font-semibold",
									children: s("analysedAt")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: new Date(d.analysedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3 border-t border-border/60 pt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "font-semibold",
									children: s("language")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: langLabel[lang] })]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: s("sourceVerified"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted-foreground",
						children: s("noSpray")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted-foreground",
						children: s("noSprayWhy")
					})]
				})]
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
			title: s("title"),
			subtitle: s("subtitle"),
			back: "/home",
			action: preview || result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: reset,
				"aria-label": s("again"),
				className: "press grid size-9 place-items-center rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
			}) : void 0
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-6 pt-5 lg:px-0 lg:pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 hidden items-end justify-between gap-6 border-b border-border/70 pb-5 lg:flex",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-[0.18em] text-primary",
							children: s("workspace")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-display text-3xl font-bold",
							children: s("title")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: s("deskSubtitle")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-border/70 px-3 py-1.5 text-xs font-bold text-muted-foreground",
						children: langLabel[lang]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: reset,
						className: "press flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm font-bold transition-colors hover:bg-muted/70",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), s("again")]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 lg:sticky lg:top-6",
					children: uploader
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-4",
					children: [
						busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "animate-fade-in grid place-items-center rounded-3xl border border-border/70 bg-card/40 p-8 text-center lg:min-h-[360px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-8 animate-spin text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm font-bold",
									children: [
										s("loading1"),
										s("loading2"),
										s("loading3")
									][loadStep]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-xs text-muted-foreground",
									children: s("confidenceNote")
								})
							] })
						}),
						!busy && error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "animate-fade-in flex items-start gap-2 rounded-3xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-semibold text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }), preview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => void run(),
									className: "press underline",
									children: s("retry")
								})]
							})]
						}),
						!busy && result?.ok && !result.usable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "animate-fade-in rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 lg:p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }), s("imageProblem")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: result.imageIssues.map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2 text-sm leading-relaxed text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: issue })]
									}, issue))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted-foreground",
									children: result.advice
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: reset,
									className: "press mt-3 flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-xs font-bold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), s("again")]
								})
							]
						}),
						!busy && !error && !result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden place-items-center rounded-3xl border border-dashed border-border/70 bg-card/30 p-10 text-center lg:grid lg:min-h-[360px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "mx-auto size-8 text-primary/70" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 font-display text-lg font-bold",
										children: s("workspace")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-muted-foreground",
										children: s("emptyTitle")
									})
								]
							})
						}),
						!busy && diagnosis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "animate-fade-in space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "card-surface border-t-4 border-t-primary p-4 lg:p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-5 lg:grid-cols-2 lg:items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] font-bold uppercase tracking-wide text-muted-foreground",
													children: s("cropDetected")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-display text-xl font-bold lg:text-2xl",
													children: diagnosis.crop
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground",
													children: s("condition")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-display text-lg font-bold text-primary lg:text-xl",
													children: diagnosis.condition
												}),
												diagnosis.severity && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thermometer, { className: "size-3.5 text-primary" }),
														s("severity"),
														": ",
														diagnosis.severity
													]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfidenceDial, {
											value: diagnosis.confidence,
											label: s("confidence"),
											note: s("confidenceNote")
										})]
									}), diagnosis.uncertaintyNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-4 rounded-2xl bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold",
											children: [s("uncertain"), ": "]
										}), diagnosis.uncertaintyNote]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "tablist",
									"aria-label": s("aiAnalysis"),
									className: "-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0",
									children: tabs.map(({ id, label, icon: Icon }) => {
										const active = tab === id;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											role: "tab",
											type: "button",
											"aria-selected": active,
											onClick: () => setTab(id),
											className: `press flex shrink-0 items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-colors ${active ? "border-primary bg-primary/12 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }), label]
										}, id);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "animate-fade-in space-y-3",
									children: tabContent(diagnosis)
								}, tab),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: reset,
									className: "press flex w-full items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm font-bold transition-colors hover:bg-muted/70",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), s("again")]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-base font-bold",
						children: s("historyTitle")
					})]
				}), history.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: s("historyLoading")
				}) : (history.data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: s("historyEmpty")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: history.data?.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "group card-surface flex min-w-0 items-center gap-3 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => openSaved(h),
							className: "press flex min-w-0 flex-1 items-center gap-3 text-left",
							children: [h.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: h.imageUrl,
								alt: h.condition ?? s("historyTitle"),
								loading: "lazy",
								className: "size-14 shrink-0 rounded-2xl object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-14 shrink-0 place-items-center rounded-2xl bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-5 text-primary/70" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-bold",
									children: h.condition
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate text-xs text-muted-foreground",
									children: [
										h.crop,
										" · ",
										new Date(h.createdAt).toLocaleDateString(),
										h.confidence ? ` · ${h.confidence}%` : ""
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": s("historyDelete"),
							onClick: () => remove.mutate({ id: h.id }),
							className: "press grid size-8 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}, h.id))
				})]
			})
		]
	})] });
}
//#endregion
export { DiagnosePage as component };
