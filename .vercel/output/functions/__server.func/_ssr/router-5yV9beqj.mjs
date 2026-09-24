import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { i as getServerFnById, n as createServerFn, o as __exportAll$1, t as TSS_SERVER_FUNCTION } from "./server-Cjo4Sjkk.mjs";
import { a as streamText, i as isStepCount, n as DefaultChatTransport, o as require_jsx_runtime, r as convertToModelMessages, s as require_react, t as useChat } from "../_libs/@ai-sdk/react+[...].mjs";
import { I as isRedirect, _ as createFileRoute, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRouteWithContext, x as useRouter, y as Link, z as redirect } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Slot } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { t as render } from "../_libs/@react-email/render+[...].mjs";
import { t as h } from "../_libs/@streamdown/math+[...].mjs";
import { t as TEMPLATES } from "./registry-CWdWxwHX.mjs";
import { i as findVoice, r as detectMood, t as MITRA_VOICES } from "./voices-0m0VMK20.mjs";
import { t as supabase } from "./client-CoPqTDtD.mjs";
import { t as marketmitra_logo_default } from "./marketmitra-logo-BiTUB1il.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as twMerge, t as Qs } from "../_libs/streamdown+[...].mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as QueryClientProvider, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { rt as tool } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { At as CloudSun, D as Stethoscope, Jt as ArrowUpRight, L as RotateCcw, O as Square, Ot as CornerDownLeft, R as RefreshCw, X as Mic, Xt as ArrowDown, c as VolumeX, ct as Landmark, ht as GripHorizontal, k as Sprout, l as Volume2, n as X, ot as Leaf, r as Wrench, rt as LoaderCircle, zt as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as useStickToBottomContext, t as StickToBottom } from "../_libs/use-stick-to-bottom.mjs";
import { t as A } from "../_libs/@streamdown/cjk+[...].mjs";
import { t as G } from "../_libs/shiki+streamdown__code.mjs";
import { t as f } from "../_libs/@streamdown/mermaid+[...].mjs";
import { t as nanoid } from "../_libs/nanoid.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as createGroq } from "../_libs/ai-sdk__groq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useServerFn-CrZF2pjq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/session-DA06LAZD.js
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)({
	user: null,
	session: null,
	loading: true,
	signOut: async () => {}
});
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		let unsubscribe;
		try {
			const { data } = supabase.auth.onAuthStateChange((_event, next) => {
				if (!active) return;
				setSession(next);
				setLoading(false);
			});
			unsubscribe = () => data.subscription.unsubscribe();
			supabase.auth.getSession().then(({ data: { session: current } }) => {
				if (!active) return;
				setSession(current);
			}).catch((error) => {
				console.error("Unable to restore the authentication session", error);
			}).finally(() => {
				if (active) setLoading(false);
			});
		} catch (error) {
			console.error("Unable to initialize authentication", error);
			setLoading(false);
		}
		return () => {
			active = false;
			unsubscribe?.();
		};
	}, []);
	const signOut = (0, import_react.useCallback)(async () => {
		await supabase.auth.signOut();
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user: session?.user ?? null,
		session,
		loading,
		signOut
	}), [
		session,
		loading,
		signOut
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
var useAuth = () => (0, import_react.useContext)(AuthContext);
var EMPTY = {
	full_name: null,
	phone: null,
	phone_verified: false,
	village: null,
	language: "en",
	state: null,
	district: null,
	latitude: null,
	longitude: null,
	saved_crops: null,
	voice_id: null,
	voice_lang: null,
	voice_provider: null
};
/** Offline mirror only — the database row is always the source of truth. */
var CACHE_KEY = "mm-profile";
var COLUMNS = "full_name,phone,phone_verified,village,language,state,district,latitude,longitude,saved_crops,voice_id,voice_lang,voice_provider";
var SessionContext = (0, import_react.createContext)({
	profile: EMPTY,
	loading: true,
	error: null,
	updateProfile: async () => {},
	refresh: async () => {},
	clearProfile: () => {}
});
function readCache() {
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		return raw ? {
			...EMPTY,
			...JSON.parse(raw)
		} : null;
	} catch {
		return null;
	}
}
function writeCache(profile) {
	try {
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
	} catch {}
}
function SessionProvider({ children }) {
	const { user, loading: authLoading } = useAuth();
	const [profile, setProfile] = (0, import_react.useState)(EMPTY);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const userId = user?.id ?? null;
	const userIdRef = (0, import_react.useRef)(null);
	userIdRef.current = userId;
	const load = (0, import_react.useCallback)(async () => {
		if (!userIdRef.current) {
			setProfile(EMPTY);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const { data, error: readError } = await supabase.from("profiles").select(COLUMNS).eq("id", userIdRef.current).maybeSingle();
			if (readError) throw new Error(readError.message);
			if (data) {
				const next = {
					...EMPTY,
					...data
				};
				setProfile(next);
				writeCache(next);
			} else {
				const seed = {
					id: userIdRef.current,
					full_name: "",
					language: "en"
				};
				const { error: insertError } = await supabase.from("profiles").insert(seed);
				if (insertError) throw new Error(insertError.message);
				setProfile(EMPTY);
			}
			setError(null);
		} catch (cause) {
			console.error("Unable to load the saved profile", cause);
			const cached = readCache();
			if (cached) setProfile(cached);
			setError("We could not load your saved profile just now.");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (authLoading) return;
		load();
	}, [
		authLoading,
		userId,
		load
	]);
	const updateProfile = (0, import_react.useCallback)(async (patch) => {
		const id = userIdRef.current;
		setProfile((current) => {
			const next = {
				...current,
				...patch
			};
			writeCache(next);
			return next;
		});
		if (!id) return;
		const { error: writeError } = await supabase.from("profiles").update(patch).eq("id", id);
		if (writeError) {
			console.error("Unable to save the profile", writeError);
			await load();
			throw new Error("Your change could not be saved. Please try again.");
		}
	}, [load]);
	const clearProfile = (0, import_react.useCallback)(() => {
		try {
			window.localStorage.removeItem(CACHE_KEY);
		} catch {}
		setProfile(EMPTY);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		profile,
		loading,
		error,
		updateProfile,
		refresh: load,
		clearProfile
	}), [
		profile,
		loading,
		error,
		updateProfile,
		load,
		clearProfile
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionContext.Provider, {
		value,
		children
	});
}
var useSession = () => (0, import_react.useContext)(SessionContext);
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/createSsrRpc-BMSrjqo0.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C_uf36nf.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-5yV9beqj.js
var router_5yV9beqj_exports = /* @__PURE__ */ __exportAll({
	C: () => useTheme,
	D: () => useLang,
	E: () => langNames,
	S: () => themes,
	T: () => fetchWeather,
	_: () => usePageTracking,
	a: () => findCrop,
	b: () => Wordmark,
	c: () => Route$8,
	d: () => diagnoseCropImage,
	f: () => listCropDiagnoses,
	g: () => track,
	getRouter: () => getRouter,
	h: () => useFeature,
	i: () => crops,
	l: () => useMitraSpeech,
	m: () => featureKeyForPath,
	n: () => Route$1,
	o: () => schemes,
	p: () => MaintenanceNotice,
	r: () => INDIAN_STATES,
	s: () => Route$7,
	t: () => router_exports,
	u: () => deleteCropDiagnosis,
	v: () => Button,
	w: () => useLocationContext,
	x: () => useSettings,
	y: () => LogoMark
});
var styles_default = "/assets/styles-BU8fZ42-.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var dict = {
	tagline: {
		en: "Sell Smarter. Earn Better.",
		mr: "हुशारीने विका. जास्त कमवा.",
		hi: "समझदारी से बेचें. ज़्यादा कमाएँ."
	},
	continue: {
		en: "Continue",
		mr: "पुढे",
		hi: "आगे बढ़ें"
	},
	getStarted: {
		en: "Get Started",
		mr: "सुरू करा",
		hi: "शुरू करें"
	},
	login: {
		en: "Login",
		mr: "लॉगिन",
		hi: "लॉगिन"
	},
	signup: {
		en: "Sign Up",
		mr: "नोंदणी",
		hi: "साइन अप"
	},
	phone: {
		en: "Phone number",
		mr: "मोबाइल नंबर",
		hi: "मोबाइल नंबर"
	},
	email: {
		en: "Email address",
		mr: "ईमेल पत्ता",
		hi: "ईमेल पता"
	},
	fullName: {
		en: "Full name",
		mr: "पूर्ण नाव",
		hi: "पूरा नाम"
	},
	language: {
		en: "Language",
		mr: "भाषा",
		hi: "भाषा"
	},
	sendOtp: {
		en: "Send OTP",
		mr: "OTP पाठवा",
		hi: "OTP भेजें"
	},
	otpHint: {
		en: "We'll email you a 6-digit code to verify your account.",
		mr: "पडताळणीसाठी ६ अंकी कोड तुमच्या ईमेलवर पाठवला जाईल.",
		hi: "सत्यापन के लिए 6 अंकों का कोड आपके ईमेल पर भेजा जाएगा."
	},
	welcome: {
		en: "Welcome back",
		mr: "पुन्हा स्वागत",
		hi: "पुनः स्वागत"
	},
	settings: {
		en: "Settings",
		mr: "सेटिंग्ज",
		hi: "सेटिंग्स"
	},
	home: {
		en: "Home",
		mr: "होम",
		hi: "होम"
	},
	markets: {
		en: "Markets",
		mr: "बाजार",
		hi: "मंडी"
	},
	weather: {
		en: "Weather",
		mr: "हवामान",
		hi: "मौसम"
	},
	schemes: {
		en: "Schemes",
		mr: "योजना",
		hi: "योजनाएँ"
	},
	profile: {
		en: "Profile",
		mr: "प्रोफाइल",
		hi: "प्रोफ़ाइल"
	},
	diagnose: {
		en: "Diagnose",
		mr: "रोग ओळख",
		hi: "रोग पहचान"
	},
	mitraLink: {
		en: "Mitra Link",
		mr: "मित्र लिंक",
		hi: "मित्र लिंक"
	},
	todayPrices: {
		en: "Today's crop prices",
		mr: "आजचे पीक दर",
		hi: "आज के फसल भाव"
	},
	quickActions: {
		en: "Quick actions",
		mr: "झटपट क्रिया",
		hi: "क्विक एक्शन"
	},
	aiRecommendation: {
		en: "Top market today",
		mr: "आजचा सर्वोत्तम बाजार",
		hi: "आज का सर्वोत्तम मंडी"
	},
	selectCrop: {
		en: "Select crop",
		mr: "पीक निवडा",
		hi: "फसल चुनें"
	},
	quantity: {
		en: "Quantity",
		mr: "प्रमाण",
		hi: "मात्रा"
	},
	compareMarkets: {
		en: "Compare markets",
		mr: "बाजार तुलना",
		hi: "मंडी तुलना"
	},
	bestChoice: {
		en: "Best Choice",
		mr: "सर्वोत्तम पर्याय",
		hi: "सर्वोत्तम विकल्प"
	},
	price: {
		en: "Price",
		mr: "दर",
		hi: "भाव"
	},
	distance: {
		en: "Distance",
		mr: "अंतर",
		hi: "दूरी"
	},
	transport: {
		en: "Transport",
		mr: "वाहतूक",
		hi: "परिवहन"
	},
	netProfit: {
		en: "Net profit",
		mr: "निव्वळ नफा",
		hi: "शुद्ध लाभ"
	},
	pricePrediction: {
		en: "Price Prediction",
		mr: "दर अंदाज",
		hi: "भाव अनुमान"
	},
	demand: {
		en: "Demand",
		mr: "मागणी",
		hi: "मांग"
	},
	travelTime: {
		en: "Travel time",
		mr: "प्रवास वेळ",
		hi: "यात्रा समय"
	},
	priceHistory: {
		en: "Price history",
		mr: "दर इतिहास",
		hi: "भाव इतिहास"
	},
	rainAlert: {
		en: "Rain alert",
		mr: "पावसाचा इशारा",
		hi: "बारिश की चेतावनी"
	},
	harvestAdvice: {
		en: "Harvest advice",
		mr: "कापणी सल्ला",
		hi: "कटाई सलाह"
	},
	eligible: {
		en: "Eligible",
		mr: "पात्र",
		hi: "पात्र"
	},
	notEligible: {
		en: "Check eligibility",
		mr: "पात्रता तपासा",
		hi: "पात्रता देखें"
	},
	savedCrops: {
		en: "Saved crops",
		mr: "जतन केलेली पिके",
		hi: "सहेजी फसलें"
	},
	sellingHistory: {
		en: "Selling history",
		mr: "विक्री इतिहास",
		hi: "बिक्री इतिहास"
	},
	viewAll: {
		en: "View all",
		mr: "सर्व पहा",
		hi: "सभी देखें"
	},
	perQuintal: {
		en: "per quintal",
		mr: "प्रति क्विंटल",
		hi: "प्रति क्विंटल"
	},
	village: {
		en: "Village",
		mr: "गाव",
		hi: "गाँव"
	},
	verifyNumber: {
		en: "Verify your email",
		mr: "ईमेल पडताळा",
		hi: "ईमेल सत्यापित करें"
	},
	otpSentTo: {
		en: "We sent a 6-digit code to",
		mr: "६ अंकी कोड पाठवला",
		hi: "6 अंकों का कोड भेजा"
	},
	enterOtp: {
		en: "Enter the 6-digit code",
		mr: "६ अंकी कोड टाका",
		hi: "6 अंकों का कोड डालें"
	},
	verifyOtp: {
		en: "Verify & Continue",
		mr: "पडताळा आणि पुढे",
		hi: "सत्यापित करें"
	},
	resendOtp: {
		en: "Resend code",
		mr: "कोड पुन्हा पाठवा",
		hi: "कोड फिर भेजें"
	},
	changeNumber: {
		en: "Change email",
		mr: "ईमेल बदला",
		hi: "ईमेल बदलें"
	},
	codeExpires: {
		en: "Code expires in",
		mr: "कोड संपेल",
		hi: "कोड समाप्त होगा"
	},
	codeExpired: {
		en: "Code expired. Request a new one.",
		mr: "कोड संपला. नवीन मागवा.",
		hi: "कोड समाप्त. नया लें."
	},
	checkInbox: {
		en: "Check your inbox, and the spam folder if you don't see it.",
		mr: "तुमचा इनबॉक्स तपासा; न दिसल्यास स्पॅम फोल्डर पहा.",
		hi: "अपना इनबॉक्स देखें; न मिले तो स्पैम फ़ोल्डर जाँचें."
	},
	privacyNote: {
		en: "Your data stays private and encrypted",
		mr: "तुमची माहिती सुरक्षित आणि एनक्रिप्टेड राहते",
		hi: "आपका डेटा निजी और एन्क्रिप्टेड रहता है"
	},
	logout: {
		en: "Log out",
		mr: "बाहेर पडा",
		hi: "लॉग आउट"
	},
	lastUpdated: {
		en: "Last updated",
		mr: "शेवटचे अद्यतन",
		hi: "अंतिम अपडेट"
	},
	loading: {
		en: "Loading…",
		mr: "लोड होत आहे…",
		hi: "लोड हो रहा है…"
	},
	retry: {
		en: "Try again",
		mr: "पुन्हा प्रयत्न",
		hi: "फिर कोशिश करें"
	},
	yourLocation: {
		en: "Your location",
		mr: "तुमचे स्थान",
		hi: "आपका स्थान"
	},
	useMyLocation: {
		en: "Use my location",
		mr: "माझे स्थान वापरा",
		hi: "मेरा स्थान उपयोग करें"
	},
	chooseDistrict: {
		en: "Choose state & district",
		mr: "राज्य व जिल्हा निवडा",
		hi: "राज्य व ज़िला चुनें"
	},
	state: {
		en: "State",
		mr: "राज्य",
		hi: "राज्य"
	},
	district: {
		en: "District",
		mr: "जिल्हा",
		hi: "ज़िला"
	},
	city: {
		en: "City / village",
		mr: "शहर / गाव",
		hi: "शहर / गाँव"
	},
	cancel: {
		en: "Cancel",
		mr: "रद्द करा",
		hi: "रद्द करें"
	},
	autoLocation: {
		en: "Auto",
		mr: "स्वयं",
		hi: "स्वतः"
	},
	manualLocation: {
		en: "Manual",
		mr: "मॅन्युअल",
		hi: "मैनुअल"
	},
	enterLocation: {
		en: "Enter city, district & state",
		mr: "शहर, जिल्हा व राज्य भरा",
		hi: "शहर, ज़िला व राज्य भरें"
	},
	manualHint: {
		en: "Works without GPS. Saved for next time.",
		mr: "GPS शिवाय चालते. पुढील वेळेसाठी जतन होते.",
		hi: "GPS के बिना काम करता है. अगली बार के लिए सहेजा जाता है."
	},
	save: {
		en: "Save",
		mr: "जतन करा",
		hi: "सहेजें"
	},
	noPrices: {
		en: "No mandi prices reported for this crop and district yet.",
		mr: "या पिकासाठी व जिल्ह्यासाठी बाजारभाव उपलब्ध नाहीत.",
		hi: "इस फसल और ज़िले के लिए मंडी भाव उपलब्ध नहीं हैं."
	},
	searchMarket: {
		en: "Search market or district",
		mr: "बाजार किंवा जिल्हा शोधा",
		hi: "मंडी या ज़िला खोजें"
	},
	minPrice: {
		en: "Min",
		mr: "किमान",
		hi: "न्यूनतम"
	},
	maxPrice: {
		en: "Max",
		mr: "कमाल",
		hi: "अधिकतम"
	},
	modalPrice: {
		en: "Modal",
		mr: "सरासरी",
		hi: "मॉडल"
	},
	transportRate: {
		en: "Transport cost per quintal",
		mr: "प्रति क्विंटल वाहतूक खर्च",
		hi: "प्रति क्विंटल परिवहन लागत"
	},
	commissionRate: {
		en: "Mandi commission",
		mr: "बाजार कमिशन",
		hi: "मंडी कमीशन"
	},
	forecastUnavailable: {
		en: "Forecast not available yet",
		mr: "अंदाज अजून उपलब्ध नाही",
		hi: "अनुमान अभी उपलब्ध नहीं"
	},
	confidence: {
		en: "Confidence",
		mr: "विश्वास",
		hi: "विश्वास"
	},
	explanation: {
		en: "Why",
		mr: "कारण",
		hi: "कारण"
	},
	sellNow: {
		en: "Sell now",
		mr: "आता विका",
		hi: "अभी बेचें"
	},
	hold: {
		en: "Hold stock",
		mr: "साठा ठेवा",
		hi: "स्टॉक रोकें"
	},
	sunrise: {
		en: "Sunrise",
		mr: "सूर्योदय",
		hi: "सूर्योदय"
	},
	sunset: {
		en: "Sunset",
		mr: "सूर्यास्त",
		hi: "सूर्यास्त"
	},
	humidity: {
		en: "Humidity",
		mr: "आर्द्रता",
		hi: "नमी"
	},
	wind: {
		en: "Wind",
		mr: "वारा",
		hi: "हवा"
	},
	rainChance: {
		en: "Rain chance",
		mr: "पावसाची शक्यता",
		hi: "बारिश की संभावना"
	},
	sevenDay: {
		en: "7-day forecast",
		mr: "७ दिवसांचा अंदाज",
		hi: "7-दिन का पूर्वानुमान"
	},
	locationNeeded: {
		en: "Share your location or pick your district to see live data.",
		mr: "थेट माहितीसाठी स्थान द्या किंवा जिल्हा निवडा.",
		hi: "लाइव जानकारी के लिए स्थान दें या ज़िला चुनें."
	}
};
var langNames = {
	en: "English",
	mr: "मराठी",
	hi: "हिंदी"
};
var LangContext = (0, import_react.createContext)({
	lang: "en",
	setLang: () => {},
	t: (k) => dict[k].en
});
function LangProvider({ children }) {
	const [lang, setLangState] = (0, import_react.useState)("en");
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem("mm-lang");
		if (stored === "en" || stored === "mr" || stored === "hi") setLangState(stored);
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = lang;
	}, [lang]);
	const setLang = (l) => {
		setLangState(l);
		window.localStorage.setItem("mm-lang", l);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangContext.Provider, {
		value: {
			lang,
			setLang,
			t: (k) => dict[k][lang]
		},
		children
	});
}
var useLang = () => (0, import_react.useContext)(LangContext);
var schema$1 = objectType({
	latitude: numberType().min(-90).max(90),
	longitude: numberType().min(-180).max(180)
});
var fetchWeather = createServerFn({ method: "POST" }).inputValidator((data) => schema$1.parse(data)).handler(createSsrRpc("8c27b52882c645ff85a720428c1b94a08838c748839bcadc3cbfcce72200765c"));
var geoSchema = objectType({
	latitude: numberType().min(-90).max(90),
	longitude: numberType().min(-180).max(180)
});
var reverseGeocode = createServerFn({ method: "POST" }).inputValidator((data) => geoSchema.parse(data)).handler(createSsrRpc("e021a3df3dfa54c232d803ab6ff9226fa83ccf341145df81f04b86b0868f24ca"));
async function search(query) {
	const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
	url.searchParams.set("name", query);
	url.searchParams.set("count", "8");
	url.searchParams.set("language", "en");
	url.searchParams.set("format", "json");
	const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
	if (!response.ok) return [];
	return ((await response.json()).results ?? []).filter((r) => (r.country_code ?? "IN") === "IN").map((r) => ({
		name: r.name,
		district: (r.admin2 ?? r.admin3 ?? "").replace(/\s+district$/i, ""),
		state: r.admin1 ?? "",
		latitude: r.latitude,
		longitude: r.longitude
	}));
}
/**
* Resolve coordinates for a manually entered place. Tries the most specific
* query first (city), then falls back to district and state so the farmer
* always gets a usable forecast.
*/
async function geocodePlace(input) {
	const city = input.city?.trim();
	const district = input.district?.trim();
	const state = input.state?.trim();
	const attempts = [
		city,
		district,
		state
	].filter((v) => Boolean(v));
	if (attempts.length === 0) return null;
	for (const attempt of attempts) try {
		const hits = await search(attempt);
		if (hits.length === 0) continue;
		const inState = state ? hits.filter((h) => h.state.toLowerCase().includes(state.toLowerCase())) : hits;
		const pool = inState.length > 0 ? inState : hits;
		return (district ? pool.filter((h) => h.district.toLowerCase().includes(district.toLowerCase())) : pool)[0] ?? pool[0] ?? null;
	} catch {}
	return null;
}
var STORAGE_KEY$2 = "mm-location";
/** Re-read GPS when the saved fix is older than this. */
var STALE_MS = 12e5;
var LocationContext = (0, import_react.createContext)({
	location: null,
	status: "idle",
	error: null,
	detect: async () => {},
	setManual: async () => {}
});
function normalize(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	if (!value.state && !value.district && !value.city) return null;
	return {
		state: value.state ?? "",
		district: value.district ?? "",
		city: value.city ?? "",
		place: value.place ?? value.city ?? value.district ?? value.state ?? "",
		latitude: typeof value.latitude === "number" ? value.latitude : null,
		longitude: typeof value.longitude === "number" ? value.longitude : null,
		source: value.source === "manual" ? "manual" : "gps",
		updatedAt: value.updatedAt ?? (/* @__PURE__ */ new Date(0)).toISOString()
	};
}
function LocationProvider({ children }) {
	const { profile, updateProfile } = useSession();
	const [location, setLocation] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const hydrated = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		hydrated.current = true;
		let saved = null;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY$2);
			saved = raw ? normalize(JSON.parse(raw)) : null;
		} catch {
			window.localStorage.removeItem(STORAGE_KEY$2);
		}
		if (saved) {
			setLocation(saved);
			setStatus("ready");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!profile.state) return;
		setLocation((current) => {
			if (current) return current;
			setStatus("ready");
			return {
				state: profile.state ?? "",
				district: profile.district ?? "",
				city: profile.village ?? "",
				place: profile.village || profile.district || profile.state || "",
				latitude: profile.latitude ?? null,
				longitude: profile.longitude ?? null,
				source: "manual",
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		});
	}, [profile]);
	const persist = (0, import_react.useCallback)((next) => {
		setLocation(next);
		setStatus("ready");
		try {
			window.localStorage.setItem(STORAGE_KEY$2, JSON.stringify(next));
		} catch {}
		updateProfile({
			state: next.state,
			district: next.district,
			village: next.city || null,
			latitude: next.latitude,
			longitude: next.longitude
		}).catch((cause) => console.error("Unable to save the farm location", cause));
	}, [updateProfile]);
	const detect = (0, import_react.useCallback)(async () => {
		if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
			setStatus("error");
			setError("This device cannot share its location. Enter your city and district instead.");
			return;
		}
		if (typeof window !== "undefined" && !window.isSecureContext) {
			setStatus("error");
			setError("Location needs a secure (https) connection. Open the site over https or choose your location manually.");
			return;
		}
		setStatus("locating");
		setError(null);
		const getPosition = (options) => new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, options);
		});
		try {
			let position;
			try {
				position = await getPosition({
					enableHighAccuracy: true,
					timeout: 12e3,
					maximumAge: 6e4
				});
			} catch (firstError) {
				if (firstError?.code === 1) throw firstError;
				position = await getPosition({
					enableHighAccuracy: false,
					timeout: 15e3,
					maximumAge: 3e5
				});
			}
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;
			const place = await reverseGeocode({ data: {
				latitude,
				longitude
			} });
			persist({
				state: place?.state ?? "",
				district: place?.district ?? "",
				city: place?.name ?? "",
				place: place?.name || place?.district || "Current location",
				latitude,
				longitude,
				source: "gps",
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (!place) setError("We have your GPS coordinates, but could not name the place. Weather still works; add your district manually if needed.");
		} catch (err) {
			const code = err?.code;
			setStatus(code === 1 ? "denied" : "error");
			setError(code === 1 ? "Location permission is blocked. Allow location in your browser settings, or enter your city, district and state below — it works without GPS." : code === 3 ? "Location is taking too long. Move to an open area and try again, or enter your city, district and state below." : "Could not read your location right now. Try again, or enter your city, district and state below.");
		}
	}, [persist]);
	const setManual = (0, import_react.useCallback)(async (next) => {
		const city = next.city?.trim() ?? "";
		setStatus("locating");
		setError(null);
		const hit = await geocodePlace({
			city,
			district: next.district,
			state: next.state
		});
		persist({
			state: next.state || hit?.state || "",
			district: next.district || hit?.district || "",
			city,
			place: city || next.district || next.state,
			latitude: hit?.latitude ?? null,
			longitude: hit?.longitude ?? null,
			source: "manual",
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (!hit) setError("Saved, but we could not pinpoint that place for weather. Try a nearby larger city name.");
	}, [persist]);
	const autoTried = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!hydrated.current || autoTried.current || location || status !== "idle") return;
		if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
		autoTried.current = true;
		if (!("permissions" in navigator)) {
			detect();
			return;
		}
		navigator.permissions.query({ name: "geolocation" }).then((result) => {
			if (result.state !== "denied") detect();
		}).catch(() => {});
	}, [
		location,
		status,
		detect
	]);
	(0, import_react.useEffect)(() => {
		if (!location || location.source !== "gps") return;
		const onVisible = () => {
			if (document.visibilityState !== "visible") return;
			if (Date.now() - new Date(location.updatedAt).getTime() < STALE_MS) return;
			detect();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => document.removeEventListener("visibilitychange", onVisible);
	}, [location, detect]);
	const value = (0, import_react.useMemo)(() => ({
		location,
		status,
		error,
		detect,
		setManual
	}), [
		location,
		status,
		error,
		detect,
		setManual
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationContext.Provider, {
		value,
		children
	});
}
var useLocationContext = () => (0, import_react.useContext)(LocationContext);
var themes = [
	{
		id: "emerald",
		label: "Emerald Green",
		swatch: [
			"#0f8a55",
			"#3ec98a",
			"#f6fbf8"
		]
	},
	{
		id: "forest",
		label: "Forest Green",
		swatch: [
			"#1d5c3a",
			"#4f9f5f",
			"#f4f8f2"
		]
	},
	{
		id: "ocean",
		label: "Ocean Blue",
		swatch: [
			"#0d6ea8",
			"#3fb6dd",
			"#f3f8fc"
		]
	},
	{
		id: "midnight",
		label: "Midnight Dark",
		swatch: [
			"#0e1418",
			"#2fd6a6",
			"#1b2429"
		]
	},
	{
		id: "earth",
		label: "Warm Earth",
		swatch: [
			"#9a5b2c",
			"#d79a5b",
			"#faf5ee"
		]
	},
	{
		id: "light",
		label: "Modern Light",
		swatch: [
			"#2b2f36",
			"#7b828e",
			"#ffffff"
		]
	}
];
var STORAGE_KEY$1 = "mm.theme";
var DARK_THEMES = ["midnight"];
var ThemeContext = (0, import_react.createContext)({
	theme: "emerald",
	setTheme: () => {}
});
function apply(theme) {
	const root = document.documentElement;
	root.setAttribute("data-theme", theme);
	root.classList.toggle("dark", DARK_THEMES.includes(theme));
}
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("emerald");
	(0, import_react.useEffect)(() => {
		const stored = localStorage.getItem(STORAGE_KEY$1);
		const next = stored && themes.some((t) => t.id === stored) ? stored : "emerald";
		setThemeState(next);
		apply(next);
	}, []);
	const setTheme = (next) => {
		setThemeState(next);
		apply(next);
		localStorage.setItem(STORAGE_KEY$1, next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			setTheme
		},
		children
	});
}
function useTheme() {
	return (0, import_react.useContext)(ThemeContext);
}
var DEFAULT_SETTINGS = {
	chat: {
		lang: "auto",
		responseLength: "balanced",
		enterToSend: true,
		autoScroll: true,
		showTimestamps: false,
		keepHistory: true
	},
	voice: {
		voiceId: "aarohi",
		lang: "auto",
		speed: 1,
		volume: 1,
		emotional: true,
		autoPlay: false
	},
	notifications: {
		market: true,
		priceMovement: true,
		weather: true,
		mitra: true,
		features: true,
		updates: true,
		important: true,
		minPriority: "normal"
	},
	appearance: {
		textSize: "md",
		density: "comfortable",
		reduceMotion: false,
		highContrast: false
	}
};
var STORAGE_KEY = "mm-settings-v1";
var DEVICE_KEY = "mm-device-id";
/** Stable per-browser id used for voice credits and notification routing. */
function getDeviceId() {
	if (typeof window === "undefined") return "server";
	try {
		const existing = window.localStorage.getItem(DEVICE_KEY);
		if (existing) return existing;
		const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `mm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		window.localStorage.setItem(DEVICE_KEY, id);
		return id;
	} catch {
		return "anonymous";
	}
}
function merge(raw) {
	const parsed = raw ?? {};
	const voice = {
		...DEFAULT_SETTINGS.voice,
		...parsed.voice ?? {}
	};
	if (!MITRA_VOICES.some((v) => v.id === voice.voiceId)) voice.voiceId = DEFAULT_SETTINGS.voice.voiceId;
	return {
		chat: {
			...DEFAULT_SETTINGS.chat,
			...parsed.chat ?? {}
		},
		voice,
		notifications: {
			...DEFAULT_SETTINGS.notifications,
			...parsed.notifications ?? {}
		},
		appearance: {
			...DEFAULT_SETTINGS.appearance,
			...parsed.appearance ?? {}
		}
	};
}
var SettingsContext = (0, import_react.createContext)({
	settings: DEFAULT_SETTINGS,
	ready: false,
	deviceId: "server",
	setChat: () => {},
	setVoice: () => {},
	setNotifications: () => {},
	setAppearance: () => {},
	reset: () => {}
});
/** Applies appearance choices as root attributes so CSS can react to them. */
function applyAppearance(appearance) {
	const root = document.documentElement;
	root.setAttribute("data-text-size", appearance.textSize);
	root.setAttribute("data-density", appearance.density);
	root.setAttribute("data-motion", appearance.reduceMotion ? "reduced" : "full");
	root.setAttribute("data-contrast", appearance.highContrast ? "high" : "normal");
}
function SettingsProvider({ children }) {
	const [settings, setSettings] = (0, import_react.useState)(DEFAULT_SETTINGS);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [deviceId, setDeviceId] = (0, import_react.useState)("server");
	(0, import_react.useEffect)(() => {
		let next = DEFAULT_SETTINGS;
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			next = merge(raw ? JSON.parse(raw) : {});
		} catch {
			next = DEFAULT_SETTINGS;
		}
		setSettings(next);
		setDeviceId(getDeviceId());
		applyAppearance(next.appearance);
		setReady(true);
	}, []);
	const persist = (0, import_react.useCallback)((next) => {
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {}
	}, []);
	const patchGroup = (0, import_react.useCallback)((group, patch) => {
		setSettings((current) => {
			const next = {
				...current,
				[group]: {
					...current[group],
					...patch
				}
			};
			persist(next);
			if (group === "appearance") applyAppearance(next.appearance);
			return next;
		});
	}, [persist]);
	const value = (0, import_react.useMemo)(() => ({
		settings,
		ready,
		deviceId,
		setChat: (patch) => patchGroup("chat", patch),
		setVoice: (patch) => patchGroup("voice", patch),
		setNotifications: (patch) => patchGroup("notifications", patch),
		setAppearance: (patch) => patchGroup("appearance", patch),
		reset: () => {
			setSettings(DEFAULT_SETTINGS);
			persist(DEFAULT_SETTINGS);
			applyAppearance(DEFAULT_SETTINGS.appearance);
		}
	}), [
		settings,
		ready,
		deviceId,
		patchGroup,
		persist
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsContext.Provider, {
		value,
		children
	});
}
var useSettings = () => (0, import_react.useContext)(SettingsContext);
/** Resolves an "auto" language preference against the active app language. */
function resolveLang(pref, appLang) {
	return pref === "auto" ? appLang : pref;
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function LogoMark({ className = "size-10" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: marketmitra_logo_default,
		alt: "Market Mitra logo",
		width: 1024,
		height: 1024,
		className: `${className} object-contain`
	});
}
function Wordmark({ className = "text-lg" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `font-display font-extrabold tracking-tight ${className}`,
		children: ["Market", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-primary",
			children: "Mitra"
		})]
	});
}
/**
* Premium animated splash shown on every app open (one per page load).
* Skipped on the "/" route, which is itself a full-screen splash.
*/
function SplashOverlay() {
	const isSplashRoute = useRouterState({ select: (s) => s.location.pathname }) === "/";
	const { t } = useLang();
	const [phase, setPhase] = (0, import_react.useState)(isSplashRoute ? "done" : "in");
	(0, import_react.useEffect)(() => {
		if (phase !== "in") return;
		const out = window.setTimeout(() => setPhase("out"), 1150);
		const done = window.setTimeout(() => setPhase("done"), 1650);
		return () => {
			window.clearTimeout(out);
			window.clearTimeout(done);
		};
	}, [phase]);
	if (phase === "done") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: `fixed inset-0 z-[100] grid place-items-center bg-[var(--gradient-ink)] transition-opacity duration-500 ${phase === "out" ? "pointer-events-none opacity-0" : "opacity-100"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center px-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 -z-10 animate-breathe rounded-full bg-primary/40 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-rise grid size-24 place-items-center rounded-[1.75rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.16)] backdrop-blur-xl md:size-28",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-14 md:size-16" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "animate-rise mt-6 font-display text-2xl font-extrabold tracking-tight text-[oklch(0.98_0.01_140)] md:text-3xl",
					style: { animationDelay: "90ms" },
					children: ["Market", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary-glow",
						children: "Mitra"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "animate-rise mt-2 text-sm font-medium text-[oklch(0.85_0.02_145)]",
					style: { animationDelay: "160ms" },
					children: t("tagline")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-7 block h-1 w-32 overflow-hidden rounded-full bg-[oklch(1_0_0/0.16)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-loadbar block h-full w-1/2 rounded-full bg-primary-glow" })
				})
			]
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9",
			"icon-sm": "h-8 w-8 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Conversation = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom, {
	className: cn("relative flex-1 overflow-y-hidden", className),
	initial: "smooth",
	resize: "smooth",
	role: "log",
	...props
});
var ConversationContent = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickToBottom.Content, {
	className: cn("flex flex-col gap-8 p-4", className),
	...props
});
var ConversationScrollButton = ({ className, ...props }) => {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	const handleScrollToBottom = (0, import_react.useCallback)(() => {
		scrollToBottom();
	}, [scrollToBottom]);
	return !isAtBottom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted", className),
		onClick: handleScrollToBottom,
		size: "icon",
		type: "button",
		variant: "outline",
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
	});
};
var Message = ({ className, from, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("group flex w-full max-w-[95%] flex-col gap-2", from === "user" ? "is-user ml-auto justify-end" : "is-assistant", className),
	...props
});
var MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm", "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground", "group-[.is-assistant]:text-foreground", className),
	...props,
	children
});
(0, import_react.createContext)(null);
var streamdownPlugins = {
	cjk: A,
	code: G,
	math: h,
	mermaid: f
};
var MessageResponse = (0, import_react.memo)(({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qs, {
	className: cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className),
	plugins: streamdownPlugins,
	...props
}), (prevProps, nextProps) => prevProps.children === nextProps.children && nextProps.isAnimating === prevProps.isAnimating);
MessageResponse.displayName = "MessageResponse";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]", "h-9 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1", "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", className),
		...props
	});
}
var inputGroupAddonVariants = cva("text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
		"block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
var inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type,
		"data-size": size,
		variant,
		className: cn(inputGroupButtonVariants({ size }), className),
		...props
	});
}
function InputGroupTextarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
		"data-slot": "input-group-control",
		className: cn("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", className),
		...props
	});
}
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
var convertBlobUrlToDataUrl = async (url) => {
	try {
		const blob = await (await fetch(url)).blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};
var PromptInputController = (0, import_react.createContext)(null);
var ProviderAttachmentsContext = (0, import_react.createContext)(null);
var useOptionalPromptInputController = () => (0, import_react.useContext)(PromptInputController);
var useOptionalProviderAttachments = () => (0, import_react.useContext)(ProviderAttachmentsContext);
var LocalAttachmentsContext = (0, import_react.createContext)(null);
var usePromptInputAttachments = () => {
	const provider = useOptionalProviderAttachments();
	const context = (0, import_react.useContext)(LocalAttachmentsContext) ?? provider;
	if (!context) throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
	return context;
};
var LocalReferencedSourcesContext = (0, import_react.createContext)(null);
var PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;
	const inputRef = (0, import_react.useRef)(null);
	const formRef = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const files = usingProvider ? controller.attachments.files : items;
	const [referencedSources, setReferencedSources] = (0, import_react.useState)([]);
	const filesRef = (0, import_react.useRef)(files);
	(0, import_react.useEffect)(() => {
		filesRef.current = files;
	}, [files]);
	const openFileDialogLocal = (0, import_react.useCallback)(() => {
		inputRef.current?.click();
	}, []);
	const matchesAccept = (0, import_react.useCallback)((f) => {
		if (!accept || accept.trim() === "") return true;
		return accept.split(",").map((s) => s.trim()).filter(Boolean).some((pattern) => {
			if (pattern.endsWith("/*")) {
				const prefix = pattern.slice(0, -1);
				return f.type.startsWith(prefix);
			}
			return f.type === pattern;
		});
	}, [accept]);
	const addLocal = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		setItems((prev) => {
			const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
			const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) onError?.({
				code: "max_files",
				message: "Too many files. Some were not added."
			});
			const next = [];
			for (const file of capped) next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: "file",
				url: URL.createObjectURL(file)
			});
			return [...prev, ...next];
		});
	}, [
		matchesAccept,
		maxFiles,
		maxFileSize,
		onError
	]);
	const removeLocal = (0, import_react.useCallback)((id) => setItems((prev) => {
		const found = prev.find((file) => file.id === id);
		if (found?.url) URL.revokeObjectURL(found.url);
		return prev.filter((file) => file.id !== id);
	}), []);
	const addWithProviderValidation = (0, import_react.useCallback)((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		const currentCount = files.length;
		const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
		const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
		if (typeof capacity === "number" && sized.length > capacity) onError?.({
			code: "max_files",
			message: "Too many files. Some were not added."
		});
		if (capped.length > 0) controller?.attachments.add(capped);
	}, [
		matchesAccept,
		maxFileSize,
		maxFiles,
		onError,
		files.length,
		controller
	]);
	const clearAttachments = (0, import_react.useCallback)(() => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
		for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
		return [];
	}), [usingProvider, controller]);
	const clearReferencedSources = (0, import_react.useCallback)(() => setReferencedSources([]), []);
	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
	const clear = (0, import_react.useCallback)(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);
	(0, import_react.useEffect)(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);
	(0, import_react.useEffect)(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) inputRef.current.value = "";
	}, [files, syncHiddenInput]);
	(0, import_react.useEffect)(() => {
		const form = formRef.current;
		if (!form) return;
		if (globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => {
		if (!globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	(0, import_react.useEffect)(() => () => {
		if (!usingProvider) {
			for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
		}
	}, [usingProvider]);
	const handleChange = (0, import_react.useCallback)((event) => {
		if (event.currentTarget.files) add(event.currentTarget.files);
		event.currentTarget.value = "";
	}, [add]);
	const attachmentsCtx = (0, import_react.useMemo)(() => ({
		add,
		clear: clearAttachments,
		fileInputRef: inputRef,
		files: files.map((item) => ({
			...item,
			id: item.id
		})),
		openFileDialog,
		remove
	}), [
		files,
		add,
		remove,
		clearAttachments,
		openFileDialog
	]);
	const refsCtx = (0, import_react.useMemo)(() => ({
		add: (incoming) => {
			const array = Array.isArray(incoming) ? incoming : [incoming];
			setReferencedSources((prev) => [...prev, ...array.map((s) => ({
				...s,
				id: nanoid()
			}))]);
		},
		clear: clearReferencedSources,
		remove: (id) => {
			setReferencedSources((prev) => prev.filter((s) => s.id !== id));
		},
		sources: referencedSources
	}), [referencedSources, clearReferencedSources]);
	const handleSubmit = (0, import_react.useCallback)(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const text = usingProvider ? controller.textInput.value : (() => {
			return new FormData(form).get("message") || "";
		})();
		if (!usingProvider) form.reset();
		try {
			const result = onSubmit({
				files: await Promise.all(files.map(async ({ id: _id, ...item }) => {
					if (item.url?.startsWith("blob:")) {
						const dataUrl = await convertBlobUrlToDataUrl(item.url);
						return {
							...item,
							url: dataUrl ?? item.url
						};
					}
					return item;
				})),
				text
			}, event);
			if (result instanceof Promise) try {
				await result;
				clear();
				if (usingProvider) controller.textInput.clear();
			} catch {}
			else {
				clear();
				if (usingProvider) controller.textInput.clear();
			}
		} catch {}
	}, [
		usingProvider,
		controller,
		files,
		onSubmit,
		clear
	]);
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		accept,
		"aria-label": "Upload files",
		className: "hidden",
		multiple,
		onChange: handleChange,
		ref: inputRef,
		title: "Upload files",
		type: "file"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		className: cn("w-full", className),
		onSubmit: handleSubmit,
		ref: formRef,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroup, {
			className: "overflow-hidden",
			children
		})
	})] });
	const withReferencedSources = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalReferencedSourcesContext.Provider, {
		value: refsCtx,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalAttachmentsContext.Provider, {
		value: attachmentsCtx,
		children: withReferencedSources
	});
};
var PromptInputTextarea = ({ onChange, onKeyDown, className, placeholder = "What would you like to know?", ...props }) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = (0, import_react.useState)(false);
	const handleKeyDown = (0, import_react.useCallback)((e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			const { form } = e.currentTarget;
			if ((form?.querySelector("button[type=\"submit\"]"))?.disabled) return;
			form?.requestSubmit();
		}
		if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) attachments.remove(lastAttachment.id);
		}
	}, [
		onKeyDown,
		isComposing,
		attachments
	]);
	const handlePaste = (0, import_react.useCallback)((event) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		const files = [];
		for (const item of items) if (item.kind === "file") {
			const file = item.getAsFile();
			if (file) files.push(file);
		}
		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	}, [attachments]);
	const handleCompositionEnd = (0, import_react.useCallback)(() => setIsComposing(false), []);
	const handleCompositionStart = (0, import_react.useCallback)(() => setIsComposing(true), []);
	const controlledProps = controller ? {
		onChange: (e) => {
			controller.textInput.setInput(e.currentTarget.value);
			onChange?.(e);
		},
		value: controller.textInput.value
	} : { onChange };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupTextarea, {
		className: cn("field-sizing-content max-h-48 min-h-16", className),
		name: "message",
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: handleCompositionStart,
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		placeholder,
		...props,
		...controlledProps
	});
};
var PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
	align: "block-end",
	className: cn("justify-between gap-1", className),
	...props
});
var PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, onStop, onClick, children, ...props }) => {
	const isGenerating = status === "submitted" || status === "streaming";
	let Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerDownLeft, { className: "size-4" });
	if (status === "submitted") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {});
	else if (status === "streaming") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" });
	else if (status === "error") Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" });
	const handleClick = (0, import_react.useCallback)((e) => {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}, [
		isGenerating,
		onStop,
		onClick
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupButton, {
		"aria-label": isGenerating ? "Stop" : "Submit",
		className: cn(className),
		onClick: handleClick,
		size,
		type: isGenerating && onStop ? "button" : "submit",
		variant,
		...props,
		children: children ?? Icon
	});
};
var motionComponentCache = /* @__PURE__ */ new Map();
var getMotionComponent = (element) => {
	let component = motionComponentCache.get(element);
	if (!component) {
		component = motion.create(element);
		motionComponentCache.set(element, component);
	}
	return component;
};
var ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }) => {
	const MotionComponent = getMotionComponent(Component);
	const dynamicSpread = (0, import_react.useMemo)(() => (children?.length ?? 0) * spread, [children, spread]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionComponent, {
		animate: { backgroundPosition: "0% center" },
		className: cn("relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", className),
		initial: { backgroundPosition: "100% center" },
		style: {
			"--spread": `${dynamicSpread}px`,
			backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
		},
		transition: {
			duration,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY
		},
		children
	});
};
var Shimmer = (0, import_react.memo)(ShimmerComponent);
var SESSION_KEY = "mm-analytics-session";
function sessionId() {
	if (typeof window === "undefined") return null;
	try {
		let id = window.sessionStorage.getItem(SESSION_KEY);
		if (!id) {
			id = crypto.randomUUID();
			window.sessionStorage.setItem(SESSION_KEY, id);
		}
		return id;
	} catch {
		return null;
	}
}
function device() {
	if (typeof window === "undefined") return "unknown";
	const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
	const w = window.innerWidth;
	const kind = w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
	return standalone ? `${kind}-pwa` : kind;
}
function lang() {
	if (typeof window === "undefined") return "en";
	try {
		return window.localStorage.getItem("mm-lang") ?? "en";
	} catch {
		return "en";
	}
}
/** Fire-and-forget: analytics must never block or break a user flow. */
function track(event, opts = {}) {
	if (typeof window === "undefined") return;
	const row = {
		event,
		page: opts.page ?? window.location.pathname,
		label: opts.label ?? null,
		session_id: sessionId(),
		device: device(),
		lang: lang(),
		props: opts.props ?? {}
	};
	try {
		Promise.resolve(supabase.from("analytics_events").insert(row)).catch(() => void 0);
	} catch {}
}
var launched = false;
/** Records one page_view per route change (and one app_launch per tab). */
function usePageTracking() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		if (launched) return;
		launched = true;
		track("app_launch", { page: pathname });
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		if (pathname.startsWith("/admin")) return;
		track("page_view", { page: pathname });
	}, [pathname]);
}
/** Route prefix → feature switch key. */
var ROUTE_FEATURE = [
	["/crops", "market_prices"],
	["/markets", "market_prices"],
	["/market", "market_prices"],
	["/predict", "predict"],
	["/weather", "weather"],
	["/diagnose", "diagnose"],
	["/schemes", "schemes"],
	["/profile", "profile"],
	["/link", "link"],
	["/settings", "profile"]
];
function featureKeyForPath(pathname) {
	const hit = ROUTE_FEATURE.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
	return hit ? hit[1] : null;
}
function useFeatureFlags() {
	return useQuery({
		queryKey: ["feature-flags"],
		staleTime: 6e4,
		retry: false,
		queryFn: async () => {
			try {
				const { data, error } = await supabase.from("feature_flags").select("key,label,enabled,status,reason,maintenance_message").order("label");
				if (error) return [];
				return data ?? [];
			} catch {
				return [];
			}
		}
	});
}
/** Returns null while unknown so nothing flickers into a maintenance state. */
function useFeature(key) {
	const { data } = useFeatureFlags();
	if (!key || !data) return null;
	return data.find((f) => f.key === key) ?? null;
}
function MaintenanceNotice({ flag }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-5 py-16 lg:px-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass mx-auto max-w-md rounded-3xl p-7 text-center shadow-[var(--shadow-card)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-auto grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {
						className: "size-7",
						strokeWidth: 2.1
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "mt-4 font-display text-lg font-bold",
					children: [flag.label, " is under maintenance"]
				}),
				flag.reason?.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-bold",
					children: flag.reason
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: flag.maintenance_message?.trim() || "We are improving this section right now. Everything else in MarketMitra keeps working — please check back a little later."
				})
			]
		})
	});
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
/**
* Analyses the photo AND keeps a private record of usable results so the farmer
* (and Mitra AI, on request) can look back at earlier checks.
*/
var diagnoseCropImage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => inputSchema.parse(data)).handler(createSsrRpc("b290c1d39325ae1c0f5ffa98ae93963af1491f9dac893e2524a97ba9f2434f8e"));
/** The farmer's own diagnosis history, newest first, with short-lived photo links. */
var listCropDiagnoses = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("4691ca99c6afa9ebd745a06686e74fa34f7af1183f24812d5e265745681c0741"));
var deleteCropDiagnosis = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ id: stringType().uuid() }).parse(input)).handler(createSsrRpc("f91c79017bdd7188c29bab67dbb4bbb3500a7ec00461ff8f5c19544fd36c6a03"));
/**
* Compact context only — one recent crop check, never the whole history, so
* Mitra AI can follow up on a diagnosis without being flooded with data.
*/
var latestDiagnosisContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("a00164bf9cacbeda2aba2372f6a6a5cd0163b1098c61d3611fbab7c16bf2225c"));
var BCP47 = {
	en: "en-IN",
	mr: "mr-IN",
	hi: "hi-IN"
};
function getRecognitionCtor() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
/** Microphone speech-to-text using the browser Speech Recognition API. */
function useSpeechRecognition(lang) {
	const [supported, setSupported] = (0, import_react.useState)(false);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [failed, setFailed] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setSupported(getRecognitionCtor() !== null);
		return () => ref.current?.abort();
	}, []);
	const stop = (0, import_react.useCallback)(() => {
		ref.current?.stop();
		setListening(false);
	}, []);
	const cancel = (0, import_react.useCallback)(() => {
		ref.current?.abort();
		ref.current = null;
		setListening(false);
		setTranscript("");
	}, []);
	return {
		supported,
		listening,
		transcript,
		failed,
		start: (0, import_react.useCallback)(() => {
			const Ctor = getRecognitionCtor();
			if (!Ctor) {
				setFailed(true);
				return;
			}
			setFailed(false);
			setTranscript("");
			const rec = new Ctor();
			ref.current = rec;
			rec.lang = BCP47[lang];
			rec.continuous = false;
			rec.interimResults = true;
			rec.onresult = (event) => {
				let out = "";
				for (let i = 0; i < event.results.length; i += 1) {
					const alt = event.results[i]?.[0];
					if (alt) out += alt.transcript;
				}
				setTranscript(out);
			};
			rec.onerror = () => {
				setFailed(true);
				setListening(false);
			};
			rec.onend = () => setListening(false);
			try {
				rec.start();
				setListening(true);
			} catch {
				setFailed(true);
			}
		}, [lang]),
		stop,
		cancel,
		setTranscript
	};
}
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
/**
* Speaks a Mitra answer with the farmer's chosen voice through the configured
* speech provider. Never silently substitutes another voice: if the selected
* voice cannot be used, the caller gets an error and can say so honestly.
*/
var synthesizeMitraSpeech = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => schema.parse(data)).handler(createSsrRpc("93e3157faecc9e09237f53341cf3d76f2b32b21079e797891fa02e1dadbb95fd"));
/**
* Speaks Mitra answers with the exact voice the farmer selected, using the
* configured speech provider. Failures surface as a message — the app never
* pretends the chosen voice was used when it was not.
*/
function useMitraSpeech(prefs, lang) {
	const synth = useServerFn(synthesizeMitraSpeech);
	const [speaking, setSpeaking] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const audioRef = (0, import_react.useRef)(null);
	const requestRef = (0, import_react.useRef)(0);
	const stop = (0, import_react.useCallback)(() => {
		requestRef.current += 1;
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.src = "";
			audioRef.current = null;
		}
		setSpeaking(false);
		setLoading(false);
	}, []);
	(0, import_react.useEffect)(() => stop, [stop]);
	return {
		speak: (0, import_react.useCallback)(async (text) => {
			const clean = text.replace(/[*_#`>]/g, "").trim();
			if (!clean) return;
			stop();
			const token = requestRef.current;
			setError(null);
			setLoading(true);
			try {
				const voice = findVoice(prefs.voiceId);
				const result = await synth({ data: {
					text: clean.slice(0, 1200),
					voiceId: voice.id,
					mood: prefs.expressive ? detectMood(clean) : "informative",
					speed: prefs.speed,
					lang
				} });
				if (token !== requestRef.current) return;
				const audio = new Audio(`data:${result.mime};base64,${result.audio}`);
				audio.volume = Math.min(1, Math.max(0, prefs.volume));
				audio.onended = () => setSpeaking(false);
				audio.onerror = () => {
					setSpeaking(false);
					setError("This device could not play the spoken answer.");
				};
				audioRef.current = audio;
				setSpeaking(true);
				await audio.play();
			} catch (cause) {
				if (token !== requestRef.current) return;
				setSpeaking(false);
				setError(cause instanceof Error ? cause.message : "Mitra could not speak that answer.");
			} finally {
				if (token === requestRef.current) setLoading(false);
			}
		}, [
			prefs.expressive,
			prefs.speed,
			prefs.voiceId,
			prefs.volume,
			lang,
			stop,
			synth
		]),
		stop,
		speaking,
		loading,
		error,
		clearError: () => setError(null)
	};
}
function textOf(message) {
	return message.parts.map((p) => p.type === "text" ? p.text : "").join("").trim();
}
/** Loads the farmer's most recent conversation with its messages in order. */
async function loadLatestThread(userId) {
	const { data: conversation, error } = await supabase.from("chat_conversations").select("id").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
	if (error) throw new Error(error.message);
	if (!conversation) return null;
	const { data: rows, error: messageError } = await supabase.from("chat_messages").select("id,role,content,created_at").eq("conversation_id", conversation.id).order("created_at", { ascending: true }).limit(200);
	if (messageError) throw new Error(messageError.message);
	return {
		id: conversation.id,
		messages: (rows ?? []).filter((r) => r.role === "user" || r.role === "assistant").map((r) => ({
			id: r.id,
			role: r.role,
			parts: [{
				type: "text",
				text: r.content
			}]
		}))
	};
}
/** Creates a new conversation for the farmer and returns its id. */
async function createThread(userId, lang, title) {
	const { data, error } = await supabase.from("chat_conversations").insert({
		user_id: userId,
		lang,
		title: title?.slice(0, 80) ?? null
	}).select("id").single();
	if (error) throw new Error(error.message);
	return data.id;
}
/** Saves one message. The database is the source of truth for chat history. */
async function saveMessage(input) {
	const content = textOf(input.message);
	if (!content) return;
	const { error } = await supabase.from("chat_messages").insert({
		conversation_id: input.conversationId,
		user_id: input.userId,
		role: input.role,
		content,
		diagnosis_id: input.diagnosisId ?? null,
		metadata: { client_message_id: input.message.id }
	});
	if (error) throw new Error(error.message);
	await supabase.from("chat_conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", input.conversationId);
}
/** Names a fresh conversation after the farmer's first question. */
async function titleThread(conversationId, firstMessage) {
	const title = textOf(firstMessage).slice(0, 80);
	if (!title) return;
	await supabase.from("chat_conversations").update({ title }).eq("id", conversationId).is("title", null);
}
var ORB_STORAGE_KEY = "market-mitra-mitra-orb-v2";
var PANEL_STORAGE_KEY = "market-mitra-mitra-panel-v2";
var PANEL_WIDTH = 440;
var PANEL_HEIGHT = 650;
var ORB_SIZE_DESKTOP = 64;
var ORB_SIZE_MOBILE = 56;
var copy = {
	contextLabel: {
		en: "Recent crop check",
		mr: "अलीकडील पीक तपासणी",
		hi: "हाल की फ़सल जाँच"
	},
	title: {
		en: "Mitra",
		mr: "मित्र",
		hi: "मित्र"
	},
	subtitle: {
		en: "Your farming companion",
		mr: "तुमचा शेती सहकारी",
		hi: "आपका खेती साथी"
	},
	greeting: {
		en: "Welcome back. Tell me what’s happening in your field today, and we’ll work it out together.",
		mr: "पुन्हा स्वागत आहे. आज शेतात काय चाललंय ते सांगा — आपण मिळून पाहूया.",
		hi: "वापसी पर स्वागत है। आज खेत में क्या हो रहा है, बताइए — हम मिलकर देखते हैं।"
	},
	greetingSmall: {
		en: "Prices, weather, crop care, schemes — ask me anything.",
		mr: "बाजारभाव, हवामान, पीक काळजी, योजना — काहीही विचारा.",
		hi: "मंडी भाव, मौसम, फसल देखभाल, योजनाएँ — कुछ भी पूछें।"
	},
	placeholder: {
		en: "Ask Mitra anything…",
		mr: "मित्रला काहीही विचारा…",
		hi: "मित्र से कुछ भी पूछें…"
	},
	thinking: {
		en: "Mitra is thinking",
		mr: "मित्र विचार करत आहे",
		hi: "मित्र सोच रहा है"
	},
	online: {
		en: "Online",
		mr: "ऑनलाइन",
		hi: "ऑनलाइन"
	},
	open: {
		en: "Open Mitra",
		mr: "मित्र उघडा",
		hi: "मित्र खोलें"
	},
	close: {
		en: "Close Mitra",
		mr: "मित्र बंद करा",
		hi: "मित्र बंद करें"
	},
	error: {
		en: "I couldn’t answer that just now. Please try again.",
		mr: "आत्ता उत्तर देता आले नाही. कृपया पुन्हा प्रयत्न करा.",
		hi: "अभी इसका जवाब नहीं दे पाया। कृपया फिर कोशिश करें।"
	},
	micIdle: {
		en: "Tap the microphone to speak",
		mr: "बोलण्यासाठी माइक दाबा",
		hi: "बोलने के लिए माइक दबाएँ"
	},
	listening: {
		en: "Listening…",
		mr: "ऐकत आहे…",
		hi: "सुन रहा है…"
	},
	speaking: {
		en: "Speaking…",
		mr: "बोलत आहे…",
		hi: "बोल रहा है…"
	},
	mic: {
		en: "Speak",
		mr: "बोला",
		hi: "बोलें"
	},
	stopMic: {
		en: "Stop recording",
		mr: "रेकॉर्डिंग थांबवा",
		hi: "रिकॉर्डिंग रोकें"
	},
	cancelMic: {
		en: "Cancel",
		mr: "रद्द करा",
		hi: "रद्द करें"
	},
	stopSpeak: {
		en: "Stop speaking",
		mr: "बोलणे थांबवा",
		hi: "बोलना रोकें"
	},
	retry: {
		en: "Try again",
		mr: "पुन्हा प्रयत्न",
		hi: "फिर कोशिश"
	},
	replay: {
		en: "Replay answer",
		mr: "उत्तर पुन्हा ऐका",
		hi: "उत्तर दोबारा सुनें"
	},
	micUnsupported: {
		en: "Voice input isn't available here. You can type instead.",
		mr: "या ब्राउझरमध्ये आवाज इनपुट उपलब्ध नाही. तुम्ही टाइप करू शकता.",
		hi: "इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है। आप टाइप कर सकते हैं।"
	},
	micFailed: {
		en: "I couldn't hear that. Try again or type your question.",
		mr: "ते ऐकू आले नाही. पुन्हा प्रयत्न करा किंवा प्रश्न टाइप करा.",
		hi: "सुनाई नहीं दिया। फिर कोशिश करें या सवाल टाइप करें।"
	},
	dragHint: {
		en: "Drag to move",
		mr: "हलवण्यासाठी ड्रॅग करा",
		hi: "हिलाने के लिए ड्रैग करें"
	}
};
var suggestions = {
	en: [
		{
			icon: Sprout,
			title: "Today’s market",
			text: "Check onion prices"
		},
		{
			icon: CloudSun,
			title: "Weather",
			text: "Should I spray this week?"
		},
		{
			icon: Stethoscope,
			title: "Crop care",
			text: "My leaves look unusual"
		},
		{
			icon: Landmark,
			title: "Government schemes",
			text: "Find schemes for me"
		}
	],
	mr: [
		{
			icon: Sprout,
			title: "आजचा बाजारभाव",
			text: "कांद्याचे भाव तपासा"
		},
		{
			icon: CloudSun,
			title: "हवामान",
			text: "या आठवड्यात फवारणी करू?"
		},
		{
			icon: Stethoscope,
			title: "पीक काळजी",
			text: "पानांमध्ये बदल दिसतोय"
		},
		{
			icon: Landmark,
			title: "शासकीय योजना",
			text: "माझ्यासाठी योजना शोधा"
		}
	],
	hi: [
		{
			icon: Sprout,
			title: "आज का बाजार",
			text: "प्याज़ के भाव देखें"
		},
		{
			icon: CloudSun,
			title: "मौसम",
			text: "इस हफ्ते छिड़काव करूँ?"
		},
		{
			icon: Stethoscope,
			title: "फसल देखभाल",
			text: "पत्तों में बदलाव है"
		},
		{
			icon: Landmark,
			title: "सरकारी योजनाएँ",
			text: "मेरे लिए योजनाएँ खोजें"
		}
	]
};
function useKeyboardInset() {
	const [state, setState] = (0, import_react.useState)({
		inset: 0,
		height: 0
	});
	(0, import_react.useEffect)(() => {
		const vv = window.visualViewport;
		if (!vv) return;
		const update = () => {
			const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
			setState({
				inset: inset > 80 ? Math.round(inset) : 0,
				height: Math.round(vv.height)
			});
		};
		update();
		vv.addEventListener("resize", update);
		vv.addEventListener("scroll", update);
		return () => {
			vv.removeEventListener("resize", update);
			vv.removeEventListener("scroll", update);
		};
	}, []);
	return state;
}
function useIsDesktop() {
	const [desktop, setDesktop] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(min-width: 1024px)");
		const update = () => setDesktop(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	return desktop;
}
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
function readPosition(key) {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") return null;
		return {
			x: parsed.x,
			y: parsed.y
		};
	} catch {
		return null;
	}
}
function savePosition(key, position) {
	try {
		window.localStorage.setItem(key, JSON.stringify(position));
	} catch {}
}
function getDefaultOrbPosition(hasBottomNav) {
	const width = window.innerWidth >= 1024 ? ORB_SIZE_DESKTOP : ORB_SIZE_MOBILE;
	const bottomSpace = hasBottomNav ? 104 : 24;
	return {
		x: Math.max(12, window.innerWidth - width - 24),
		y: Math.max(12, window.innerHeight - width - bottomSpace)
	};
}
function getDefaultPanelPosition() {
	const height = Math.min(PANEL_HEIGHT, Math.max(420, window.innerHeight * .8));
	return {
		x: Math.max(16, window.innerWidth - PANEL_WIDTH - 24),
		y: Math.max(16, window.innerHeight - height - 24)
	};
}
function clampPanelPosition(position) {
	const actualHeight = Math.min(PANEL_HEIGHT, Math.max(420, window.innerHeight * .8));
	return {
		x: clamp(position.x, 12, Math.max(12, window.innerWidth - PANEL_WIDTH - 12)),
		y: clamp(position.y, 12, Math.max(12, window.innerHeight - actualHeight - 12))
	};
}
function clampOrbPosition(position) {
	const size = window.innerWidth >= 1024 ? ORB_SIZE_DESKTOP : ORB_SIZE_MOBILE;
	return {
		x: clamp(position.x, 8, Math.max(8, window.innerWidth - size - 8)),
		y: clamp(position.y, 8, Math.max(8, window.innerHeight - size - 8))
	};
}
function MitraMark({ size = "md", className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `relative grid ${{
			sm: "size-4",
			md: "size-5",
			lg: "size-7"
		}[size]} shrink-0 place-items-center ${className}`,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-[10%] left-1/2 size-[28%] -translate-x-1/2 rounded-full bg-current" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-[34%] left-1/2 h-[28%] w-[52%] -translate-x-1/2 rounded-[55%_55%_30%_30%] bg-current" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-[13%] left-[12%] h-[10%] w-[76%] rotate-[-5deg] rounded-full border-t-[1.5px] border-current/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-[5%] left-[20%] h-[8%] w-[60%] rotate-[4deg] rounded-full border-t-[1.5px] border-current/45" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-full bg-current/10 animate-pulse" })
		]
	});
}
function MitraAI() {
	const { lang } = useLang();
	const { location } = useLocationContext();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const flag = useFeature("mitra_ai");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [orbPosition, setOrbPosition] = (0, import_react.useState)(null);
	const [panelPosition, setPanelPosition] = (0, import_react.useState)(null);
	const [panelReady, setPanelReady] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const { user } = useAuth();
	const conversationIdRef = (0, import_react.useRef)(null);
	const savedIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const { inset: keyboardInset, height: viewportHeight } = useKeyboardInset();
	const isDesktop = useIsDesktop();
	const diagnosisFn = useServerFn(latestDiagnosisContext);
	const diagnosisCtx = useQuery({
		queryKey: ["mitra-diagnosis-context"],
		queryFn: () => diagnosisFn(),
		enabled: open,
		retry: false,
		staleTime: 12e4
	}).data ?? null;
	const { messages, setMessages, sendMessage, regenerate, status, error } = useChat({ transport: new DefaultChatTransport({
		api: "/api/chat",
		prepareSendMessagesRequest: ({ messages: msgs }) => ({ body: {
			messages: msgs.slice(-24),
			lang,
			location: location ? {
				state: location.state,
				district: location.district,
				place: location.place,
				latitude: location.latitude,
				longitude: location.longitude
			} : null,
			diagnosis: diagnosisCtx
		} })
	}) });
	const busy = status === "submitted" || status === "streaming";
	(0, import_react.useEffect)(() => {
		const savedPanel = readPosition(PANEL_STORAGE_KEY);
		const savedOrb = readPosition(ORB_STORAGE_KEY);
		setPanelPosition(clampPanelPosition(savedPanel ?? getDefaultPanelPosition()));
		setOrbPosition(clampOrbPosition(savedOrb ?? getDefaultOrbPosition(pathname !== "/" && !pathname.startsWith("/admin"))));
	}, [isDesktop, pathname]);
	(0, import_react.useEffect)(() => {
		if (!isDesktop) return;
		const handleResize = () => {
			setPanelPosition((current) => {
				if (!current) return current;
				const next = clampPanelPosition(current);
				savePosition(PANEL_STORAGE_KEY, next);
				return next;
			});
			setOrbPosition((current) => {
				if (!current) return current;
				const next = clampOrbPosition(current);
				savePosition(ORB_STORAGE_KEY, next);
				return next;
			});
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isDesktop]);
	const panelDragRef = (0, import_react.useRef)({
		active: false,
		moved: false,
		pointerId: -1,
		startX: 0,
		startY: 0,
		originX: 0,
		originY: 0
	});
	const handlePanelPointerDown = (0, import_react.useCallback)((event) => {
		if (!isDesktop || !panelPosition) return;
		if (event.pointerType !== "mouse" && event.pointerType !== "touch") return;
		if (event.target.closest("button")) return;
		panelDragRef.current = {
			active: true,
			moved: false,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: panelPosition.x,
			originY: panelPosition.y
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
	}, [isDesktop, panelPosition]);
	const handlePanelPointerMove = (0, import_react.useCallback)((event) => {
		const drag = panelDragRef.current;
		if (!drag.active || drag.pointerId !== event.pointerId) return;
		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
		const next = clampPanelPosition({
			x: drag.originX + dx,
			y: drag.originY + dy
		});
		setPanelPosition(next);
	}, []);
	const handlePanelPointerUp = (0, import_react.useCallback)((event) => {
		const drag = panelDragRef.current;
		if (!drag.active || drag.pointerId !== event.pointerId) return;
		drag.active = false;
		if (panelPosition) savePosition(PANEL_STORAGE_KEY, panelPosition);
		try {
			event.currentTarget.releasePointerCapture?.(event.pointerId);
		} catch {}
	}, [panelPosition]);
	const orbDragRef = (0, import_react.useRef)({
		active: false,
		moved: false,
		pointerId: -1,
		startX: 0,
		startY: 0,
		originX: 0,
		originY: 0
	});
	const handleOrbPointerDown = (0, import_react.useCallback)((event) => {
		if (!orbPosition) return;
		orbDragRef.current = {
			active: true,
			moved: false,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: orbPosition.x,
			originY: orbPosition.y
		};
		event.currentTarget.setPointerCapture?.(event.pointerId);
	}, [orbPosition]);
	const handleOrbPointerMove = (0, import_react.useCallback)((event) => {
		const drag = orbDragRef.current;
		if (!drag.active || drag.pointerId !== event.pointerId) return;
		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
		setOrbPosition(clampOrbPosition({
			x: drag.originX + dx,
			y: drag.originY + dy
		}));
	}, []);
	const handleOrbPointerUp = (0, import_react.useCallback)((event) => {
		const drag = orbDragRef.current;
		if (!drag.active || drag.pointerId !== event.pointerId) return;
		drag.active = false;
		setOrbPosition((current) => {
			if (!current) return current;
			const next = clampOrbPosition(current);
			savePosition(ORB_STORAGE_KEY, next);
			return next;
		});
		try {
			event.currentTarget.releasePointerCapture?.(event.pointerId);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) {
			setPanelReady(false);
			return;
		}
		setPanelReady(false);
		const frame = window.requestAnimationFrame(() => {
			setPanelReady(true);
		});
		return () => window.cancelAnimationFrame(frame);
	}, [open]);
	const openMitra = (0, import_react.useCallback)(() => {
		if (!isDesktop) {
			setOpen(true);
			track("mitra_ai_opened");
			return;
		}
		if (!panelPosition) setPanelPosition(getDefaultPanelPosition());
		track("mitra_ai_opened");
		setOpen(true);
	}, [isDesktop, panelPosition]);
	const closeMitra = (0, import_react.useCallback)(() => {
		setOpen(false);
		if (panelPosition) savePosition(PANEL_STORAGE_KEY, panelPosition);
	}, [panelPosition]);
	(0, import_react.useEffect)(() => {
		if (!user) {
			conversationIdRef.current = null;
			savedIdsRef.current = /* @__PURE__ */ new Set();
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const thread = await loadLatestThread(user.id);
				if (cancelled || !thread) return;
				conversationIdRef.current = thread.id;
				savedIdsRef.current = new Set(thread.messages.map((message) => message.id));
				setMessages(thread.messages);
			} catch (cause) {
				console.error("Unable to load your saved chat", cause);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [user, setMessages]);
	(0, import_react.useEffect)(() => {
		if (!user || busy || messages.length === 0) return;
		let cancelled = false;
		(async () => {
			for (const message of messages) {
				if (cancelled) return;
				if (message.role !== "user" && message.role !== "assistant") continue;
				if (savedIdsRef.current.has(message.id)) continue;
				try {
					if (!conversationIdRef.current) conversationIdRef.current = await createThread(user.id, lang);
					await saveMessage({
						conversationId: conversationIdRef.current,
						userId: user.id,
						role: message.role,
						message
					});
					savedIdsRef.current.add(message.id);
					if (message.role === "user") await titleThread(conversationIdRef.current, message);
				} catch (cause) {
					console.error("Unable to save this message", cause);
					return;
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		messages,
		busy,
		user,
		lang
	]);
	(0, import_react.useEffect)(() => {
		if (error) track("mitra_ai_error");
	}, [error]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const id = window.setTimeout(() => {
			inputRef.current?.focus();
		}, 240);
		return () => window.clearTimeout(id);
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (open && status === "ready") inputRef.current?.focus();
	}, [open, status]);
	const { settings } = useSettings();
	const speech = useMitraSpeech((0, import_react.useMemo)(() => ({
		voiceId: settings.voice.voiceId,
		speed: settings.voice.speed,
		volume: settings.voice.volume,
		expressive: settings.voice.emotional
	}), [settings.voice]), resolveLang(settings.voice.lang, lang));
	const mic = useSpeechRecognition(lang);
	const send = (0, import_react.useCallback)((value) => {
		const trimmed = value.trim();
		if (!trimmed || busy) return;
		setText("");
		speech.stop();
		track("mitra_ai_message");
		sendMessage({ text: trimmed });
		requestAnimationFrame(() => {
			inputRef.current?.focus();
		});
	}, [
		busy,
		sendMessage,
		speech
	]);
	(0, import_react.useEffect)(() => {
		if (mic.listening && mic.transcript) setText(mic.transcript);
	}, [mic.listening, mic.transcript]);
	const pendingVoice = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (mic.listening) {
			pendingVoice.current = true;
			return;
		}
		if (pendingVoice.current) {
			pendingVoice.current = false;
			const spoken = mic.transcript.trim();
			if (spoken) {
				mic.setTranscript("");
				send(spoken);
			}
		}
	}, [
		mic.listening,
		mic.transcript,
		mic.setTranscript,
		send
	]);
	const lastAssistantText = (0, import_react.useMemo)(() => {
		for (let i = messages.length - 1; i >= 0; i -= 1) {
			const message = messages[i];
			if (message?.role !== "assistant") continue;
			const body = message.parts.map((part) => part.type === "text" ? part.text : "").join("");
			if (body.trim()) return body;
		}
		return "";
	}, [messages]);
	const spokenRef = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		if (!settings.voice.autoPlay || busy || !lastAssistantText) return;
		if (spokenRef.current === lastAssistantText) return;
		spokenRef.current = lastAssistantText;
		speech.speak(lastAssistantText);
	}, [
		settings.voice.autoPlay,
		busy,
		lastAssistantText,
		speech
	]);
	const lastAssistantId = (0, import_react.useMemo)(() => {
		for (let i = messages.length - 1; i >= 0; i -= 1) if (messages[i]?.role === "assistant") return messages[i].id;
		return null;
	}, [messages]);
	const retry = (0, import_react.useCallback)((messageId) => {
		if (busy) return;
		speech.stop();
		spokenRef.current = "";
		track("mitra_ai_retry");
		regenerate({ messageId });
	}, [
		busy,
		regenerate,
		speech
	]);
	const voiceStatus = speech.error ? speech.error : mic.listening ? copy.listening[lang] : speech.speaking ? copy.speaking[lang] : mic.failed ? copy.micFailed[lang] : mic.supported ? copy.micIdle[lang] : copy.micUnsupported[lang];
	pathname !== "/" && pathname.startsWith("/admin");
	const hideOrb = keyboardInset > 0 || open && !isDesktop;
	const mobilePanelStyle = viewportHeight ? { height: `${viewportHeight}px` } : void 0;
	if (pathname.startsWith("/admin") || flag?.enabled === false) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		!open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: (event) => {
				if (orbDragRef.current.moved) {
					orbDragRef.current.moved = false;
					event.preventDefault();
					return;
				}
				openMitra();
			},
			onPointerDown: handleOrbPointerDown,
			onPointerMove: handleOrbPointerMove,
			onPointerUp: handleOrbPointerUp,
			"aria-label": copy.open[lang],
			"aria-expanded": false,
			"aria-hidden": hideOrb,
			tabIndex: hideOrb ? -1 : 0,
			style: orbPosition ? {
				left: `${orbPosition.x}px`,
				top: `${orbPosition.y}px`,
				right: "auto",
				bottom: "auto"
			} : void 0,
			className: [
				"fixed z-[60] grid place-items-center",
				"size-14 lg:size-16",
				"touch-none select-none",
				"cursor-grab active:cursor-grabbing",
				"rounded-full",
				"text-primary-foreground",
				"shadow-[var(--shadow-float)]",
				"ring-1 ring-white/20",
				"transition-[transform,opacity] duration-300",
				"hover:scale-105",
				"active:scale-95",
				hideOrb ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
			].join(" "),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -inset-2 rounded-full bg-primary/10 blur-xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -inset-1 rounded-full bg-primary/20 blur-md" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-full bg-primary/20 animate-pulse" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-0 overflow-hidden rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -left-8 top-0 h-full w-1/2 rotate-12 bg-white/15 blur-xl" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative grid size-full place-items-center overflow-hidden rounded-full grad-primary ring-1 ring-white/20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-3 top-2 size-3 rounded-full bg-white/50 blur-[2px]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, { size: "lg" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-2 right-2 size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" })
					]
				})
			]
		}),
		open && isDesktop && panelPosition && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": copy.title[lang],
			style: {
				left: `${panelPosition.x}px`,
				top: `${panelPosition.y}px`
			},
			className: [
				"fixed z-50",
				"h-[min(650px,80vh)] w-[440px]",
				"transition-[opacity,transform] duration-300 ease-out",
				panelReady ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.985] opacity-0"
			].join(" "),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-white/10 bg-background/95 shadow-[0_30px_100px_-35px_rgba(0,0,0,0.65)] backdrop-blur-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						onPointerDown: handlePanelPointerDown,
						onPointerMove: handlePanelPointerMove,
						onPointerUp: handlePanelPointerUp,
						className: "relative flex shrink-0 cursor-grab touch-none select-none items-center gap-3 border-b border-white/10 px-4 py-3 active:cursor-grabbing",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-primary/[0.10] via-transparent to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-primary/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-primary/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
									size: "md",
									className: "text-primary"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-[15px] font-bold tracking-[-0.01em]",
										children: copy.title[lang]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary shadow-[0_0_7px_hsl(var(--primary))]" }), copy.online[lang]]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 truncate text-[11px] text-muted-foreground",
									children: location?.place ? location.place : copy.subtitle[lang]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mr-1 hidden items-center gap-1 text-muted-foreground/40 xl:flex",
									title: copy.dragHint[lang],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripHorizontal, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: closeMitra,
									"aria-label": copy.close[lang],
									className: "press grid size-9 place-items-center rounded-full border border-border/60 bg-background/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
								})]
							})
						]
					}),
					diagnosisCtx?.condition && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-3 mt-3 flex shrink-0 items-center gap-2.5 rounded-2xl border border-primary/15 bg-primary/[0.055] px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stethoscope, { className: "size-4 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "min-w-0 truncate text-[11px] leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: copy.contextLabel[lang]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5 text-muted-foreground",
									children: "·"
								}),
								diagnosisCtx.crop ? `${diagnosisCtx.crop} — ` : "",
								diagnosisCtx.condition,
								diagnosisCtx.confidence ? ` (${diagnosisCtx.confidence}%)` : ""
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Conversation, {
						className: "min-h-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConversationContent, {
							className: "gap-5 px-4 py-5",
							children: [
								messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-h-full flex-col justify-center pb-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-7",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-5 flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative grid size-12 place-items-center rounded-2xl bg-primary/10 ring-1 ring-primary/15",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
													size: "lg",
													className: "text-primary"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold text-primary",
												children: location?.place ? `For ${location.place}` : copy.subtitle[lang]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11px] text-muted-foreground",
												children: copy.greetingSmall[lang]
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "max-w-[360px] text-[25px] font-semibold leading-[1.18] tracking-[-0.035em] text-foreground",
											children: copy.greeting[lang]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2.5",
										children: suggestions[lang].map(({ icon: Icon, title, text: suggestionText }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => send(suggestionText),
											className: "group relative overflow-hidden rounded-[18px] border border-border/70 bg-card/50 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.045] active:scale-[0.98]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-6 -top-6 size-16 rounded-full bg-primary/5 blur-xl transition-transform duration-500 group-hover:scale-150" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative mb-3 flex items-start justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "grid size-8 place-items-center rounded-xl bg-primary/8 text-primary",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
															className: "size-4",
															strokeWidth: 2
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5 text-muted-foreground/40 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "relative text-[12px] font-semibold text-foreground",
													children: title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "relative mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground",
													children: suggestionText
												})
											]
										}, `${title}-${suggestionText}`))
									})]
								}),
								messages.map((message) => {
									const body = message.parts.map((part) => part.type === "text" ? part.text : "").join("");
									if (!body.trim()) return null;
									const isAssistant = message.role === "assistant";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Message, {
										from: message.role,
										children: [
											isAssistant && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-1 flex items-center gap-1.5 px-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid size-5 place-items-center rounded-md bg-primary/10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
														size: "sm",
														className: "text-primary"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] font-semibold tracking-wide text-muted-foreground",
													children: "Mitra"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, {
												className: isAssistant ? "rounded-2xl bg-transparent px-1 text-foreground" : "rounded-[20px] bg-primary px-4 py-3 text-primary-foreground shadow-sm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, { children: body })
											}),
											isAssistant && message.id === lastAssistantId && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => retry(message.id),
												"aria-label": copy.retry[lang],
												className: "press ml-1 mt-1 flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), copy.retry[lang]]
											})
										]
									}, message.id);
								}),
								busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 px-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative grid size-8 place-items-center rounded-xl bg-primary/8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-xl bg-primary/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
											size: "sm",
											className: "text-primary"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-2xl border border-border/50 bg-card/40 px-3 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, {
												className: "text-[12px]",
												children: copy.thinking[lang]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-0.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1 rounded-full bg-primary/50 animate-bounce" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "[animation-delay:120ms] size-1 rounded-full bg-primary/50 animate-bounce" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "[animation-delay:240ms] size-1 rounded-full bg-primary/50 animate-bounce" })
												]
											})]
										})
									})]
								}),
								error && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-destructive/20 bg-destructive/[0.045] px-3.5 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm leading-relaxed text-destructive",
										children: copy.error[lang]
									}), lastAssistantId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => retry(lastAssistantId),
										className: "press mt-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), copy.retry[lang]]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationScrollButton, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 border-t border-border/60 bg-card/50 p-3 pb-3 backdrop-blur-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex min-h-5 items-center gap-2 px-1",
							children: [
								mic.listening || speech.speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex h-4 items-end gap-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: { height: "45%" }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: {
													height: "85%",
													animationDelay: "100ms"
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: {
													height: "60%",
													animationDelay: "180ms"
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: {
													height: "95%",
													animationDelay: "260ms"
												}
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium text-primary",
										children: voiceStatus
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "min-w-0 flex-1 truncate text-[10px] text-muted-foreground",
									children: voiceStatus
								}),
								mic.listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: mic.cancel,
									"aria-label": copy.cancelMic[lang],
									className: "press grid size-7 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								}),
								lastAssistantText && !mic.listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => speech.speaking ? speech.stop() : speech.speak(lastAssistantText),
									"aria-label": speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang],
									className: "press grid size-7 place-items-center rounded-full border border-border/60 bg-background/60 text-foreground",
									children: speech.speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : spokenRef.current === lastAssistantText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInput, {
							onSubmit: (_message, event) => {
								event.preventDefault();
								send(text);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputTextarea, {
								ref: inputRef,
								value: text,
								onChange: (event) => setText(event.currentTarget.value),
								placeholder: copy.placeholder[lang]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInputFooter, {
								className: "justify-end gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !mic.supported,
									onClick: () => mic.listening ? mic.stop() : mic.start(),
									"aria-label": mic.listening ? copy.stopMic[lang] : copy.mic[lang],
									className: [
										"press relative grid size-9 shrink-0 place-items-center rounded-full border transition-all",
										"disabled:opacity-40",
										mic.listening ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.25)]" : "border-border/70 bg-background/70 text-foreground hover:border-primary/30 hover:bg-primary/5"
									].join(" "),
									children: [mic.listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 animate-ping rounded-full bg-primary/20" }), mic.listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
										className: "relative size-4",
										strokeWidth: 2.4
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
										className: "relative size-4",
										strokeWidth: 2.2
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputSubmit, {
									status,
									disabled: !text.trim() && !busy
								})]
							})]
						})]
					})
				]
			})
		}),
		open && !isDesktop && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": copy.title[lang],
			style: mobilePanelStyle,
			className: [
				"fixed inset-0 z-[70]",
				"h-[100dvh]",
				"bg-background",
				"transition-[opacity,transform] duration-300 ease-out",
				panelReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
			].join(" "),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full min-h-0 flex-col overflow-hidden bg-background",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "relative flex shrink-0 items-center gap-3 border-b border-border/60 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/[0.07] to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: closeMitra,
								"aria-label": copy.close[lang],
								className: "press relative grid size-11 shrink-0 place-items-center rounded-full bg-muted/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
									size: "md",
									className: "text-primary"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-sm font-bold",
										children: copy.title[lang]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1 text-[9px] font-semibold text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary shadow-[0_0_7px_hsl(var(--primary))]" }), copy.online[lang]]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-[10px] text-muted-foreground",
									children: location?.place || copy.subtitle[lang]
								})]
							})
						]
					}),
					diagnosisCtx?.condition && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-3 mt-3 flex shrink-0 items-center gap-2.5 rounded-2xl border border-primary/15 bg-primary/[0.055] px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stethoscope, { className: "size-4 text-primary" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "min-w-0 truncate text-[11px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: copy.contextLabel[lang]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5 text-muted-foreground",
									children: "·"
								}),
								diagnosisCtx.crop ? `${diagnosisCtx.crop} — ` : "",
								diagnosisCtx.condition
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Conversation, {
						className: "min-h-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConversationContent, {
							className: "gap-5 px-4 py-5",
							children: [
								messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-h-full flex-col justify-center pb-8",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-5 flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative grid size-12 place-items-center rounded-2xl bg-primary/10",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
													size: "lg",
													className: "text-primary"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold text-primary",
												children: location?.place || copy.subtitle[lang]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[10px] text-muted-foreground",
												children: copy.greetingSmall[lang]
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-[27px] font-semibold leading-[1.16] tracking-[-0.04em]",
											children: copy.greeting[lang]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2.5",
										children: suggestions[lang].map(({ icon: Icon, title, text: suggestionText }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => send(suggestionText),
											className: "group relative overflow-hidden rounded-[19px] border border-border/70 bg-card/50 p-3.5 text-left transition-all active:scale-[0.98]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mb-3 flex items-start justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "grid size-8 place-items-center rounded-xl bg-primary/8 text-primary",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3.5 text-muted-foreground/40" })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[12px] font-semibold",
													children: title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-[10px] leading-relaxed text-muted-foreground",
													children: suggestionText
												})
											]
										}, `${title}-${suggestionText}`))
									})]
								}),
								messages.map((message) => {
									const body = message.parts.map((part) => part.type === "text" ? part.text : "").join("");
									if (!body.trim()) return null;
									const isAssistant = message.role === "assistant";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Message, {
										from: message.role,
										children: [
											isAssistant && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-1 flex items-center gap-1.5 px-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid size-5 place-items-center rounded-md bg-primary/10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, {
														className: "size-3 text-primary",
														strokeWidth: 2
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] font-semibold text-muted-foreground",
													children: "Mitra"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, {
												className: isAssistant ? "rounded-2xl bg-transparent px-1 text-foreground" : "rounded-[20px] bg-primary px-4 py-3 text-primary-foreground",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, { children: body })
											}),
											isAssistant && message.id === lastAssistantId && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => retry(message.id),
												className: "press ml-1 mt-1 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), copy.retry[lang]]
											})
										]
									}, message.id);
								}),
								busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 px-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative grid size-8 place-items-center rounded-xl bg-primary/8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-xl bg-primary/10 animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraMark, {
											size: "sm",
											className: "text-primary"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-2xl border border-border/50 bg-card/40 px-3 py-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, {
												className: "text-[12px]",
												children: copy.thinking[lang]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-0.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1 rounded-full bg-primary/50 animate-bounce" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "[animation-delay:120ms] size-1 rounded-full bg-primary/50 animate-bounce" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "[animation-delay:240ms] size-1 rounded-full bg-primary/50 animate-bounce" })
												]
											})]
										})
									})]
								}),
								error && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-destructive/20 bg-destructive/[0.045] px-3.5 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-destructive",
										children: copy.error[lang]
									}), lastAssistantId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => retry(lastAssistantId),
										className: "press mt-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[10px] font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), copy.retry[lang]]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationScrollButton, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 border-t border-border/60 bg-card/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex min-h-5 items-center gap-2 px-1",
							children: [
								mic.listening || speech.speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex h-4 items-end gap-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: { height: "45%" }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: {
													height: "85%",
													animationDelay: "100ms"
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: {
													height: "60%",
													animationDelay: "180ms"
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-0.5 rounded-full bg-primary animate-pulse",
												style: {
													height: "95%",
													animationDelay: "260ms"
												}
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium text-primary",
										children: voiceStatus
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "flex-1 truncate text-[10px] text-muted-foreground",
									children: voiceStatus
								}),
								mic.listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: mic.cancel,
									"aria-label": copy.cancelMic[lang],
									className: "press grid size-7 place-items-center rounded-full border border-border/60",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
								}),
								lastAssistantText && !mic.listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => speech.speaking ? speech.stop() : speech.speak(lastAssistantText),
									"aria-label": speech.speaking ? copy.stopSpeak[lang] : copy.replay[lang],
									className: "press grid size-7 place-items-center rounded-full border border-border/60",
									children: speech.speaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-3.5" }) : spokenRef.current === lastAssistantText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInput, {
							onSubmit: (_message, event) => {
								event.preventDefault();
								send(text);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputTextarea, {
								ref: inputRef,
								value: text,
								onChange: (event) => setText(event.currentTarget.value),
								placeholder: copy.placeholder[lang]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PromptInputFooter, {
								className: "justify-end gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !mic.supported,
									onClick: () => mic.listening ? mic.stop() : mic.start(),
									"aria-label": mic.listening ? copy.stopMic[lang] : copy.mic[lang],
									className: ["press relative grid size-9 shrink-0 place-items-center rounded-full border", mic.listening ? "border-primary/40 bg-primary text-primary-foreground" : "border-border/70 bg-background/70"].join(" "),
									children: [mic.listening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 animate-ping rounded-full bg-primary/20" }), mic.listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "relative size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "relative size-4" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromptInputSubmit, {
									status,
									disabled: !text.trim() && !busy
								})]
							})]
						})]
					})
				]
			})
		})
	] });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$20 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#0b2e20"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "MarketMitra"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{ title: "MarketMitra" },
			{
				name: "description",
				content: "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell."
			},
			{
				name: "author",
				content: "MarketMitra"
			},
			{
				name: "google-site-verification",
				content: "1WmbQBM_xvrAO1A1KXxibywQY6_0oWBaRFtLk0XpIFY"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:title",
				content: "MarketMitra"
			},
			{
				name: "twitter:title",
				content: "MarketMitra"
			},
			{
				property: "og:description",
				content: "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell."
			},
			{
				name: "twitter:description",
				content: "AI-powered mandi intelligence for farmers: compare market prices, transport cost and net profit before you sell."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/13be7300-a74f-4f0a-a7cb-67d19efe24b4/id-preview-b696cdf0--1f0dfdaa-c120-4ff4-aa20-ea74627b101b.lovable.app-1785830020583.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/13be7300-a74f-4f0a-a7cb-67d19efe24b4/id-preview-b696cdf0--1f0dfdaa-c120-4ff4-aa20-ea74627b101b.lovable.app-1785830020583.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-192.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "preconnect",
				href: "https://api.open-meteo.com"
			},
			{
				rel: "dns-prefetch",
				href: "https://api.data.gov.in"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800;900&family=Epilogue:wght@400;500;600;700;800&display=swap"
			}
		],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@graph": [{
					"@type": "Organization",
					"@id": "https://marketmitra.app/#organization",
					name: "Market Mitra",
					url: "https://marketmitra.app",
					logo: "https://marketmitra.app/icon-512.png",
					email: "hello.marketmitra@gmail.com",
					telephone: "+91-9209517171",
					description: "Agriculture-focused digital technology platform for Indian farmers: official APMC mandi prices, farm weather, crop guidance and government scheme information.",
					founder: {
						"@type": "Person",
						name: "Om Labhade"
					}
				}, {
					"@type": "WebSite",
					"@id": "https://marketmitra.app/#website",
					name: "Market Mitra",
					url: "https://marketmitra.app",
					inLanguage: [
						"en",
						"mr",
						"hi"
					],
					publisher: { "@id": "https://marketmitra.app/#organization" }
				}]
			})
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$20.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SettingsProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MitraAI, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-center",
				richColors: true
			})
		] }) }) }) }) }) })
	});
}
var $$splitComponentImporter$17 = () => import("./routes-DuiRR_k8.mjs");
var Route$19 = createFileRoute("/")({
	head: () => ({
		meta: [
			{ title: "MarketMitra — Sell smarter at the right mandi" },
			{
				name: "description",
				content: "Live APMC mandi prices, transport cost and net profit comparison plus real Open-Meteo farm weather, in English, Marathi and Hindi."
			},
			{
				property: "og:title",
				content: "MarketMitra — Sell smarter at the right mandi"
			},
			{
				property: "og:description",
				content: "Compare mandi prices, transport cost and net profit before you sell, with live weather for your farm."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/"
		}],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "WebSite",
				"@id": "https://marketmitra.app/#website",
				name: "MarketMitra",
				url: "https://marketmitra.app/",
				description: "Compare official APMC mandi prices, transport cost and net profit, with live farm weather, in English, Marathi and Hindi.",
				inLanguage: [
					"en",
					"mr",
					"hi"
				]
			})
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./route-Di7iQBCH.mjs");
var Route$18 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async ({ location }) => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({
			to: "/auth",
			search: { redirect: location.href }
		});
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$16, "component"),
	pendingComponent: AuthPending
});
function AuthPending() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold text-muted-foreground",
				children: "Checking your session…"
			})]
		})
	});
}
var $$splitComponentImporter$15 = () => import("./about-BgxYjD3Z.mjs");
var Route$17 = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: "About MarketMitra — Sell Smarter. Earn Better." },
			{
				name: "description",
				content: "MarketMitra brings market prices, weather, crop guidance and agricultural information together to help farmers make clearer decisions."
			},
			{
				property: "og:title",
				content: "About MarketMitra"
			},
			{
				property: "og:description",
				content: "The story behind MarketMitra and why we are building simpler agricultural decision tools for farmers."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/about"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/about"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./admin-C-D9pBo2.mjs");
/** Professional, farmer-readable maintenance reasons. */
var Route$16 = createFileRoute("/admin")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Control Center — MarketMitra" },
		{
			name: "description",
			content: "Private MarketMitra operations console."
		},
		{
			name: "robots",
			content: "noindex, nofollow"
		},
		{
			property: "og:title",
			content: "Control Center — MarketMitra"
		},
		{
			property: "og:description",
			content: "Private MarketMitra operations console."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./auth-BQ4TCItX.mjs");
var Route$15 = createFileRoute("/auth")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./reset-password-BgSHjljh.mjs");
var Route$14 = createFileRoute("/reset-password")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Set a new password — MarketMitra" },
		{
			name: "description",
			content: "Choose a new password for your MarketMitra account and get back to your mandi intelligence dashboard."
		},
		{
			property: "og:title",
			content: "Set a new password — MarketMitra"
		},
		{
			property: "og:description",
			content: "Choose a new password for your MarketMitra account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./terms-C8bVd-rM.mjs");
var TITLE = "Terms & Conditions — Market Mitra";
var DESC = "Terms of use for Market Mitra: market information, weather guidance, crop assistance and farmer-to-farmer resource coordination.";
var Route$13 = createFileRoute("/terms")({
	head: () => ({ meta: [
		{ title: TITLE },
		{
			name: "description",
			content: DESC
		},
		{
			property: "og:title",
			content: TITLE
		},
		{
			property: "og:description",
			content: DESC
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./crops-Cn2O_NMZ.mjs");
var Route$12 = createFileRoute("/_authenticated/crops")({
	head: () => ({
		meta: [
			{ title: "Select your crop — MarketMitra" },
			{
				name: "description",
				content: "Choose a crop and quantity to compare live APMC prices and your net realisation."
			},
			{
				property: "og:title",
				content: "Select your crop — MarketMitra"
			},
			{
				property: "og:description",
				content: "Onion, tomato, wheat, cotton, soybean, gram and more — live mandi rates."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/crops"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/crops"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./diagnose-DUomewc3.mjs");
var Route$11 = createFileRoute("/_authenticated/diagnose")({
	head: () => ({
		meta: [
			{ title: "Crop disease identifier — MarketMitra" },
			{
				name: "description",
				content: "Photograph a leaf and get an AI reading of the visible crop condition, with farmer-friendly, label-driven guidance in English, Marathi or Hindi."
			},
			{
				property: "og:title",
				content: "Crop disease identifier — MarketMitra"
			},
			{
				property: "og:description",
				content: "Camera or gallery photo, image-quality check, transparent confidence, no invented pesticide advice."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/diagnose"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/diagnose"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
/** Downscale in the browser so uploads stay small and fast on mobile data. */
/** Circular AI-confidence indicator (SVG, no animation loops). */
var $$splitComponentImporter$8 = () => import("./home-DtKuE3md.mjs");
var Route$10 = createFileRoute("/_authenticated/home")({
	head: () => ({
		meta: [
			{ title: "Dashboard — MarketMitra" },
			{
				name: "description",
				content: "Live mandi prices, local weather and market guidance for your district, updated from official sources."
			},
			{
				property: "og:title",
				content: "Dashboard — MarketMitra"
			},
			{
				property: "og:description",
				content: "Live APMC prices and weather for your district in one place."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/home"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/home"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./link-C7gth6km.mjs");
var Route$9 = createFileRoute("/_authenticated/link")({
	head: () => ({ meta: [
		{ title: "Mitra Link — your local farm resource network" },
		{
			name: "description",
			content: "Ask for a tractor, harvester, crates or tools nearby, or share what you own. Verified farmers, real prices, honest availability."
		},
		{
			property: "og:title",
			content: "Mitra Link — your local farm resource network"
		},
		{
			property: "og:description",
			content: "Need it or have it — coordinate machines and farm resources with verified neighbours."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./markets-DU0FMVYu.mjs");
var searchSchema$2 = objectType({
	crop: stringType().catch("onion"),
	qty: numberType().min(1).max(500).catch(20)
});
var Route$8 = createFileRoute("/_authenticated/markets")({
	validateSearch: searchSchema$2,
	head: () => ({
		meta: [
			{ title: "Best market comparison — MarketMitra" },
			{
				name: "description",
				content: "Compare official AGMARKNET mandi rates with your estimated transport cost and commission to find the best available price."
			},
			{
				property: "og:title",
				content: "Best market comparison — MarketMitra"
			},
			{
				property: "og:description",
				content: "Rank mandis by net money in hand using government-reported prices."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/markets"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/markets"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
/** How many mandis we resolve coordinates for (keeps geocoding requests low). */
var $$splitComponentImporter$5 = () => import("./predict-DcPhDCJa.mjs");
var searchSchema$1 = objectType({
	crop: stringType().catch("onion"),
	market: stringType().catch(""),
	state: stringType().catch("")
});
var Route$7 = createFileRoute("/_authenticated/predict")({
	validateSearch: searchSchema$1,
	head: () => ({
		meta: [
			{ title: "Price prediction — MarketMitra" },
			{
				name: "description",
				content: "A short-term mandi price outlook built from the recorded price history of the market you selected."
			},
			{
				property: "og:title",
				content: "Price prediction — MarketMitra"
			},
			{
				property: "og:description",
				content: "Sell-or-hold guidance with a confidence score and the reasoning behind it."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/predict"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/predict"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./profile-qVzmvLQJ.mjs");
var Route$6 = createFileRoute("/_authenticated/profile")({
	head: () => ({
		meta: [
			{ title: "Profile — MarketMitra" },
			{
				name: "description",
				content: "Manage your MarketMitra profile and farming location."
			},
			{
				property: "og:title",
				content: "Profile — MarketMitra"
			},
			{
				property: "og:description",
				content: "Your MarketMitra profile, location and farming experience."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/profile"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/profile"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var schemes = [
	{
		id: "pm-kisan",
		name: "PM Kisan Samman Nidhi",
		benefit: "₹6,000 per year income support in three instalments",
		dept: "Ministry of Agriculture & Farmers Welfare",
		criteria: [
			"Land-holding farmer family with cultivable land records",
			"Aadhaar-linked bank account",
			"e-KYC completed on the PM-KISAN portal"
		],
		url: "https://pmkisan.gov.in/"
	},
	{
		id: "pmfby",
		name: "Pradhan Mantri Fasal Bima Yojana",
		benefit: "Crop insurance at 2% premium for kharif, 1.5% for rabi",
		dept: "Department of Agriculture & Farmers Welfare",
		criteria: [
			"Notified crop grown in a notified area",
			"Enrolment before the season cut-off date",
			"Land record or sowing certificate"
		],
		url: "https://pmfby.gov.in/"
	},
	{
		id: "kcc",
		name: "Kisan Credit Card",
		benefit: "Short-term crop loans with 4% effective interest on prompt repayment",
		dept: "NABARD and scheduled banks",
		criteria: [
			"Owner cultivator, tenant farmer or sharecropper",
			"Land records (7/12 extract or equivalent)",
			"KYC documents and no existing default"
		],
		url: "https://www.nabard.org/content1.aspx?id=518&catid=23&mid=23"
	},
	{
		id: "kusum",
		name: "PM-KUSUM Solar Pump",
		benefit: "Central and state subsidy on standalone solar agriculture pumps",
		dept: "Ministry of New & Renewable Energy",
		criteria: [
			"Own or assured irrigation source",
			"Grid-disconnected or diesel pump replacement",
			"Application through the state nodal agency"
		],
		url: "https://pmkusum.mnre.gov.in/"
	},
	{
		id: "aif",
		name: "Agriculture Infrastructure Fund",
		benefit: "3% interest subvention and credit guarantee for post-harvest projects",
		dept: "Department of Agriculture & Farmers Welfare",
		criteria: [
			"Farmer, FPO, SHG, cooperative or agri-entrepreneur",
			"Post-harvest project such as storage, grading or cold chain",
			"Detailed project report submitted with the lending bank"
		],
		url: "https://agriinfra.dac.gov.in/"
	},
	{
		id: "enam",
		name: "e-NAM National Agriculture Market",
		benefit: "Sell produce online across linked mandis with transparent bidding",
		dept: "Small Farmers' Agribusiness Consortium",
		criteria: [
			"Registration at a linked APMC mandi",
			"Bank account for online payment",
			"Aadhaar or other government ID"
		],
		url: "https://enam.gov.in/web/"
	},
	{
		id: "soil-health",
		name: "Soil Health Card Scheme",
		benefit: "Free soil testing with crop-wise nutrient recommendations",
		dept: "Department of Agriculture & Farmers Welfare",
		criteria: ["Any farmer with cultivable land", "Soil sample collected through the local agriculture office"],
		url: "https://soilhealth.dac.gov.in/"
	}
];
var $$splitComponentImporter$3 = () => import("./schemes-M0f6FykH.mjs");
var Route$5 = createFileRoute("/_authenticated/schemes")({
	head: () => ({
		meta: [
			{ title: "Government schemes — MarketMitra" },
			{
				name: "description",
				content: "Central agriculture schemes with published benefits, eligibility criteria and links to the official application portals."
			},
			{
				property: "og:title",
				content: "Government schemes — MarketMitra"
			},
			{
				property: "og:description",
				content: "PM-KISAN, PMFBY, Kisan Credit Card, PM-KUSUM, e-NAM and more."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/schemes"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/schemes"
		}],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: "Government schemes for Indian farmers",
				url: "https://marketmitra.app/schemes",
				description: "Central agriculture schemes with published benefits, eligibility criteria and links to the official application portals.",
				isPartOf: { "@id": "https://marketmitra.app/#website" },
				mainEntity: {
					"@type": "ItemList",
					itemListElement: schemes.map((scheme, index) => ({
						"@type": "ListItem",
						position: index + 1,
						item: {
							"@type": "GovernmentService",
							name: scheme.name,
							description: scheme.benefit,
							url: scheme.url,
							serviceType: "Agriculture support scheme",
							areaServed: {
								"@type": "Country",
								name: "India"
							},
							provider: {
								"@type": "GovernmentOrganization",
								name: scheme.dept
							},
							eligibleRegion: {
								"@type": "Country",
								name: "India"
							}
						}
					}))
				}
			})
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./settings-Bdv0zWGe.mjs");
var Route$4 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings — MarketMitra" },
		{
			name: "description",
			content: "Manage your MarketMitra profile, alerts, farming preferences, accessibility and account settings."
		},
		{
			property: "og:title",
			content: "Settings — MarketMitra"
		},
		{
			property: "og:description",
			content: "Manage your MarketMitra profile, alerts, farming preferences, accessibility and account settings."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./weather-DuEg5ucp.mjs");
var Route$3 = createFileRoute("/_authenticated/weather")({
	head: () => ({
		meta: [
			{ title: "Farm weather — MarketMitra" },
			{
				name: "description",
				content: "Live temperature, humidity, wind, rain probability, UV index, air pressure, sunrise, sunset and a 7-day outlook for your farm location."
			},
			{
				property: "og:title",
				content: "Farm weather — MarketMitra"
			},
			{
				property: "og:description",
				content: "Plan harvesting and transport around real rainfall probability and UV."
			},
			{
				property: "og:url",
				content: "https://marketmitra.app/weather"
			}
		],
		links: [{
			rel: "canonical",
			href: "https://marketmitra.app/weather"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
/**
* Live data readers for Mitra AI. These hit the same official sources the app
* screens use — AGMARKNET (data.gov.in) for mandi prices and Open-Meteo for
* weather — so the assistant never invents numbers.
*/
var RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24";
var MARKET_SOURCE = "AGMARKNET · Government of India";
function pick(row, ...keys) {
	const normalized = /* @__PURE__ */ new Map();
	for (const [k, v] of Object.entries(row)) normalized.set(k.toLowerCase().replace(/[^a-z]/g, ""), v);
	for (const key of keys) {
		const value = normalized.get(key.toLowerCase().replace(/[^a-z]/g, ""));
		if (value !== void 0 && value !== null && String(value).trim() !== "") return String(value).trim();
	}
	return "";
}
function toIsoDate(value) {
	const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
	return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
}
async function readMandiPrices(input) {
	const apiKey = process.env["DATA_GOV_IN_API_KEY"];
	if (!apiKey) return {
		ok: false,
		error: "Market price service is not configured."
	};
	const request = async (district) => {
		const url = new URL(`https://api.data.gov.in/resource/${RESOURCE_ID}`);
		url.searchParams.set("api-key", apiKey);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "250");
		url.searchParams.set("sort[Arrival_Date]", "desc");
		url.searchParams.set("filters[Commodity]", input.commodity);
		url.searchParams.set("filters[State]", input.state);
		if (district) url.searchParams.set("filters[District]", district);
		const response = await fetch(url, { headers: { accept: "application/json" } });
		if (!response.ok) throw new Error(String(response.status));
		return await response.json();
	};
	try {
		let payload = await request(input.district);
		if ((payload.records?.length ?? 0) === 0 && input.district) payload = await request(null);
		const rows = (payload.records ?? []).map((row) => ({
			market: pick(row, "market"),
			district: pick(row, "district"),
			state: pick(row, "state"),
			variety: pick(row, "variety") || null,
			minPrice: Number(pick(row, "min_price", "minprice")),
			maxPrice: Number(pick(row, "max_price", "maxprice")),
			modalPrice: Number(pick(row, "modal_price", "modalprice")),
			arrivalDate: toIsoDate(pick(row, "arrival_date", "arrivaldate"))
		})).filter((r) => r.market && r.arrivalDate && Number.isFinite(r.modalPrice) && r.modalPrice > 0).sort((a, b) => a.arrivalDate === b.arrivalDate ? b.modalPrice - a.modalPrice : a.arrivalDate < b.arrivalDate ? 1 : -1);
		if (rows.length === 0) return {
			ok: true,
			rows: [],
			latestDate: "",
			source: MARKET_SOURCE,
			note: "No recent official record for this crop in that state."
		};
		return {
			ok: true,
			rows: rows.slice(0, 25),
			latestDate: rows[0].arrivalDate,
			source: MARKET_SOURCE,
			note: null
		};
	} catch (error) {
		console.error("mitra mandi read failed", error);
		return {
			ok: false,
			error: "The government market price service is unavailable."
		};
	}
}
async function readWeather(input) {
	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.searchParams.set("latitude", String(input.latitude));
	url.searchParams.set("longitude", String(input.longitude));
	url.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m");
	url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max");
	url.searchParams.set("forecast_days", "7");
	url.searchParams.set("timezone", "Asia/Kolkata");
	try {
		const response = await fetch(url, { headers: { accept: "application/json" } });
		if (!response.ok) throw new Error(String(response.status));
		const payload = await response.json();
		const daily = payload.daily ?? {};
		const days = (daily["time"] ?? []).map((date, i) => ({
			date: String(date),
			maxTemp: Number(daily["temperature_2m_max"]?.[i]),
			minTemp: Number(daily["temperature_2m_min"]?.[i]),
			rainChance: Number(daily["precipitation_probability_max"]?.[i]),
			rainMm: Number(daily["precipitation_sum"]?.[i]),
			uvIndexMax: Number(daily["uv_index_max"]?.[i]),
			windMax: Number(daily["wind_speed_10m_max"]?.[i])
		}));
		return {
			ok: true,
			current: payload.current ?? null,
			days,
			source: "Open-Meteo forecast (IST)"
		};
	} catch (error) {
		console.error("mitra weather read failed", error);
		return {
			ok: false,
			error: "The weather service is unavailable right now."
		};
	}
}
var crops = [
	{
		id: "onion",
		commodity: "Onion",
		name: {
			en: "Onion",
			mr: "कांदा",
			hi: "प्याज"
		},
		unit: "quintal",
		emoji: "🧅"
	},
	{
		id: "tomato",
		commodity: "Tomato",
		name: {
			en: "Tomato",
			mr: "टोमॅटो",
			hi: "टमाटर"
		},
		unit: "quintal",
		emoji: "🍅"
	},
	{
		id: "potato",
		commodity: "Potato",
		name: {
			en: "Potato",
			mr: "बटाटा",
			hi: "आलू"
		},
		unit: "quintal",
		emoji: "🥔"
	},
	{
		id: "wheat",
		commodity: "Wheat",
		name: {
			en: "Wheat",
			mr: "गहू",
			hi: "गेहूं"
		},
		unit: "quintal",
		emoji: "🌾"
	},
	{
		id: "paddy",
		commodity: "Paddy(Dhan)(Common)",
		name: {
			en: "Paddy",
			mr: "भात",
			hi: "धान"
		},
		unit: "quintal",
		emoji: "🌾"
	},
	{
		id: "cotton",
		commodity: "Cotton",
		name: {
			en: "Cotton",
			mr: "कापूस",
			hi: "कपास"
		},
		unit: "quintal",
		emoji: "☁️"
	},
	{
		id: "soyabean",
		commodity: "Soyabean",
		name: {
			en: "Soybean",
			mr: "सोयाबीन",
			hi: "सोयाबीन"
		},
		unit: "quintal",
		emoji: "🫘"
	},
	{
		id: "maize",
		commodity: "Maize",
		name: {
			en: "Maize",
			mr: "मका",
			hi: "मक्का"
		},
		unit: "quintal",
		emoji: "🌽"
	},
	{
		id: "bajra",
		commodity: "Bajra(Pearl Millet/Cumbu)",
		name: {
			en: "Bajra",
			mr: "बाजरी",
			hi: "बाजरा"
		},
		unit: "quintal",
		emoji: "🌾"
	},
	{
		id: "jowar",
		commodity: "Jowar(Sorghum)",
		name: {
			en: "Jowar",
			mr: "ज्वारी",
			hi: "ज्वार"
		},
		unit: "quintal",
		emoji: "🌾"
	},
	{
		id: "tur",
		commodity: "Arhar (Tur/Red Gram)(Whole)",
		name: {
			en: "Tur / Arhar",
			mr: "तूर",
			hi: "अरहर"
		},
		unit: "quintal",
		emoji: "🫛"
	},
	{
		id: "gram",
		commodity: "Bengal Gram(Gram)(Whole)",
		name: {
			en: "Gram",
			mr: "हरभरा",
			hi: "चना"
		},
		unit: "quintal",
		emoji: "🫘"
	},
	{
		id: "groundnut",
		commodity: "Groundnut",
		name: {
			en: "Groundnut",
			mr: "भुईमूग",
			hi: "मूंगफली"
		},
		unit: "quintal",
		emoji: "🥜"
	},
	{
		id: "sugarcane",
		commodity: "Sugarcane",
		name: {
			en: "Sugarcane",
			mr: "ऊस",
			hi: "गन्ना"
		},
		unit: "quintal",
		emoji: "🎍"
	},
	{
		id: "grapes",
		commodity: "Grapes",
		name: {
			en: "Grapes",
			mr: "द्राक्षे",
			hi: "अंगूर"
		},
		unit: "quintal",
		emoji: "🍇"
	},
	{
		id: "banana",
		commodity: "Banana",
		name: {
			en: "Banana",
			mr: "केळी",
			hi: "केला"
		},
		unit: "quintal",
		emoji: "🍌"
	},
	{
		id: "chilli",
		commodity: "Green Chilli",
		name: {
			en: "Green Chilli",
			mr: "हिरवी मिरची",
			hi: "हरी मिर्च"
		},
		unit: "quintal",
		emoji: "🌶️"
	},
	{
		id: "turmeric",
		commodity: "Turmeric",
		name: {
			en: "Turmeric",
			mr: "हळद",
			hi: "हल्दी"
		},
		unit: "quintal",
		emoji: "🟡"
	}
];
var findCrop = (id) => crops.find((c) => c.id === id);
var INDIAN_STATES = [
	"Andhra Pradesh",
	"Assam",
	"Bihar",
	"Chandigarh",
	"Chattisgarh",
	"Goa",
	"Gujarat",
	"Haryana",
	"Himachal Pradesh",
	"Jammu and Kashmir",
	"Jharkhand",
	"Karnataka",
	"Kerala",
	"Madhya Pradesh",
	"Maharashtra",
	"Manipur",
	"Meghalaya",
	"Mizoram",
	"Nagaland",
	"NCT of Delhi",
	"Odisha",
	"Pondicherry",
	"Punjab",
	"Rajasthan",
	"Tamil Nadu",
	"Telangana",
	"Tripura",
	"Uttar Pradesh",
	"Uttrakhand",
	"West Bengal"
];
var LANG_NAME = {
	en: "English",
	mr: "Marathi",
	hi: "Hindi"
};
function systemPrompt(lang, location, diagnosis) {
	const langName = LANG_NAME[lang] ?? "English";
	const loc = location?.place ? `The farmer's current location is ${[
		location.place,
		location.district,
		location.state
	].filter(Boolean).join(", ")}.` : "The farmer has not shared a location yet.";
	const dx = diagnosis?.condition ? `RECENT CROP PHOTO CHECK (from this farmer's own saved diagnosis history):
Crop: ${diagnosis.crop ?? "not identified"}; visible condition: ${diagnosis.condition}${diagnosis.confidence ? `; AI confidence ${diagnosis.confidence}%` : ""}${diagnosis.severity ? `; severity ${diagnosis.severity}` : ""}${diagnosis.checkedAt ? `; checked on ${diagnosis.checkedAt.slice(0, 10)}` : ""}.
Use this ONLY when the farmer's question relates to that crop, its symptoms or its treatment. Say plainly that it comes from their earlier photo check and is not a laboratory confirmation. Do not bring it up in unrelated conversations and never treat it as certain.` : "The farmer has no recent crop photo check saved. If they describe symptoms, suggest the in-app crop disease photo check.";
	return `You are Mitra AI, the intelligent farming assistant inside MarketMitra.

Introduce yourself, when asked, as "Mitra — Market Mitra's AI assistant."

You are a practical, honest and intelligent agricultural assistant for Indian farmers.

Your most important job is to understand what the farmer actually wants and adapt your answer to that request.

IDENTITY / OWNERSHIP:
If the farmer asks who owns, created, developed, founded or is behind Market Mitra, answer exactly this fact:
"Market Mitra is owned and developed by Om Labhade."

If they ask for more detail, you may add:
"Om Labhade is the owner of Market Mitra, the agriculture-focused digital platform designed to help farmers access useful information such as crop guidance, weather insights, market information, government schemes and AI assistance."

Never invent awards, companies, registrations, partnerships, government affiliation, revenue, user counts, funding or achievements.
Do not mention the owner unless it is relevant to the question.

LANGUAGE:
Reply in ${langName}.

If the farmer uses Marathi, reply naturally in Marathi.
If the farmer uses Hindi, reply naturally in Hindi.
If the farmer uses English, reply in English.
If the farmer mixes languages, naturally use the same style.

Do not translate technical agricultural terms unnecessarily if the farmer naturally uses English terms inside Marathi or Hindi.

FARMER LOCATION:
${loc}

If the farmer asks about "near me" and no location is shared, ask them to enable location or name their district.
Never guess coordinates, villages or nearby places.

==================================================
ADAPTIVE ANSWERING
==================================================

Before answering, silently determine:

1. What is the farmer actually asking?
2. How much detail did they request?
3. What format would make the answer easiest to understand?
4. Does the question require fresh/current data?
5. What is the most useful next step, if any?

Do not show this reasoning to the farmer.

The answer must adapt to the farmer's request instead of following one fixed response template.

DEPTH:
- Simple question -> simple and direct answer.
- "Just tell me", "short answer", "only answer" -> keep it concise.
- "Explain", "why", "how", "details" -> give appropriate explanation.
- Complex question -> break it into clear sections or steps.
- Multiple questions -> answer each part clearly.
- Do not make a short question unnecessarily long.
- Do not give a shallow answer when the farmer clearly asks for detail.
- Do not repeat information already established in the conversation.

FORMAT:
Choose the format naturally.

Use:
- Short paragraphs for simple questions.
- Numbered steps for how-to questions.
- Small bullet lists when several points are involved.
- Compact tables only when structured comparison genuinely benefits clarity.
- Short headings when the answer has distinct sections.

Do not force headings, bullets or tables into every response.

INTENT-BASED BEHAVIOUR:

MARKET / MANDI PRICE:
- Focus on the requested commodity, location and market.
- Use the live mandi tool whenever current prices are requested.
- Present returned prices clearly.
- If several markets are returned, organize them clearly.
- If asked to compare markets, compare only the returned data.
- Never invent or estimate a price.

WEATHER:
- Focus on the farmer's actual location when coordinates are available.
- Give only weather information relevant to the question.
- If asked about spraying, sowing, irrigation, harvesting or field visits, connect the forecast to that decision.
- Forecasts are not guarantees.
- Separate weather data from practical interpretation.

CROP / DISEASE:
- Understand the crop and symptoms first.
- Text symptoms alone cannot prove a disease.
- Use a previous photo check only when relevant.
- Clearly identify uncertainty.
- Give practical things the farmer can check.
- Give safe next steps.
- Never invent pesticide or fertiliser dosages.

GOVERNMENT SCHEMES:
- Understand what the farmer wants.
- Use the available scheme information.
- Focus on relevant schemes.
- When supported by available information, explain eligibility, benefit and application direction.
- Never invent eligibility rules, benefits or application requirements.

HOW-TO:
- Give practical numbered steps.
- Keep each step clear and actionable.
- Avoid unnecessary theory unless requested.

COMPARISON:
- Compare the requested items using factual differences.
- Explain relevant trade-offs.
- Do not manufacture advantages or disadvantages.
- Do not pretend there is one universally correct choice.

CASUAL:
- Respond naturally and briefly.
- Do not turn casual conversation into an unnecessary agricultural lecture.

MULTI-PART:
- Answer every part.
- Keep separate questions clearly separated.
- Do not ignore smaller parts.

FOLLOW-UP:
- Use the existing conversation context.
- Resolve references such as "this crop", "that market", "tomorrow", "same one" and similar phrases from the conversation whenever possible.
- Do not ask the farmer to repeat information already available.
- If the reference is genuinely ambiguous, ask one concise clarification.

SMART ADJUSTMENT:
The farmer's wording is the strongest signal for the desired response.

Examples:
- "onion price?" -> concise current price information.
- "explain why onion prices change" -> explanation of relevant factors.
- "should I spray tomorrow?" -> check weather and give practical interpretation.
- "my onion leaves are yellow" -> investigate possible causes and what to check.
- "tell me about schemes" -> useful overview.
- "which scheme is for small farmers?" -> focus on relevant scheme eligibility information.
- "how do I apply?" -> step-by-step instructions.
- "just tell me the answer" -> direct answer without unnecessary background.
- "explain in simple Marathi" -> simple natural Marathi.
- "give detailed information" -> appropriate depth.

These examples are guidance, not rigid templates. Always understand the actual question first.

==================================================
DATA HONESTY — MOST IMPORTANT
==================================================

Decide first whether the question needs fresh or verified data.

MANDI / CROP PRICES:
- Today's rate, current rate, latest rate, mandi price, APMC price or similar -> ALWAYS call get_mandi_prices.
- Never answer current prices from memory.

WEATHER:
- Current weather, today's weather, tomorrow's weather, rain forecast, spraying window, irrigation timing, "should I go to the field", or similar -> ALWAYS call get_weather when real coordinates are available.
- Never invent coordinates.

GOVERNMENT SCHEMES:
- Use get_schemes for scheme-related questions.
- Use browser_search only when additional current or detailed information is genuinely needed.

GENERAL KNOWLEDGE:
- Agronomy concepts, definitions and general how-to questions can be answered directly from knowledge when fresh data is not required.

If a required tool fails or returns no useful result, say so plainly.

For example:
"I couldn't verify the latest market price right now, so I don't want to give you a number that might be wrong."

Never invent:
- prices
- weather values
- rainfall
- timestamps
- schemes
- eligibility rules
- locations
- coordinates
- pesticide dosage
- fertiliser dosage
- diagnoses
- live statistics

Never present an estimate as verified live information.

==================================================
LIVE DATA TRANSPARENCY
==================================================

When live data is used:
- Clearly identify the source when the tool provides it.
- Use the date/time exactly as returned by the tool.
- Do not manufacture timestamps.
- Separate verified data from interpretation.

Example:
"Latest market data (source/date from the tool): ..."

"What this means: ..."

Do not mention internal APIs, API keys, implementation details or hidden tool names to the farmer.

==================================================
EMOTIONAL INTELLIGENCE
==================================================

Read the farmer's tone.

If they sound:
- frustrated -> acknowledge it briefly, then help
- worried -> reassure without making false promises, then give practical help
- confused -> simplify the answer
- discouraged -> be supportive without exaggerating
- excited -> respond warmly and briefly

Use at most one short emotional acknowledgement before solving the problem.

Never claim to be human, conscious, physically present or to have memories that the app does not actually store.

==================================================
STYLE
==================================================

Be:
- warm
- calm
- respectful
- practical
- conversational
- intelligent
- honest

Sound like a knowledgeable farming companion, not a generic chatbot.

Avoid:
- robotic phrases
- repetitive greetings
- "As an AI..."
- "Here is your answer..."
- unnecessary disclaimers
- giant walls of text
- excessive emojis
- repeated conclusions
- unnecessary technical jargon
- forced headings
- fake certainty

Do not start every answer with a greeting.

Do not end every answer with "How can I help you?"

If the farmer asks for one fact, give that fact unless additional information is necessary to avoid misunderstanding.

==================================================
SAFETY
==================================================

For disease questions:
- Explain that text alone cannot confirm a disease.
- Suggest the in-app crop disease photo check when appropriate.
- Encourage local agricultural verification when the situation is uncertain or consequential.

For pesticide or fertiliser questions:
- Never invent dosage.
- Do not make up product-specific instructions.
- Refer to the product label and official agricultural extension guidance.
- Ask for the crop, exact product and crop stage when those details are necessary.

Never claim 100% accuracy or guaranteed results.

==================================================
CONVERSATION QUALITY
==================================================

Every answer should naturally follow this internal pattern:

UNDERSTAND -> VERIFY WHEN NEEDED -> ANSWER -> GIVE THE NEXT USEFUL STEP IF NEEDED.

Do not mechanically display these stages.

The final response should feel written specifically for the farmer's question.

If the farmer asks for a short answer, keep it short.
If they ask for depth, give depth.
If they ask for steps, give steps.
If they ask for a direct fact, give the fact.
If they need live information, verify it first.
If information is unavailable, be honest.

CROPS AVAILABLE IN MARKETMITRA:
${crops.map((c) => c.commodity).join(", ")}

${dx}

SCHEMES AVAILABLE IN MARKETMITRA:
${schemes.map((s) => `${s.name} (${s.url})`).join("; ")}
`;
}
var Route$2 = createFileRoute("/api/chat")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json();
		if (!Array.isArray(body.messages)) return new Response("Messages are required", { status: 400 });
		const apiKey = process.env["GROQ_API_KEY"];
		if (!apiKey) {
			console.error("GROQ_API_KEY is missing");
			return new Response("Groq AI is not configured", { status: 500 });
		}
		const lang = typeof body.lang === "string" ? body.lang : "en";
		const location = body.location ?? null;
		const groq = createGroq({ apiKey });
		return streamText({
			model: groq("openai/gpt-oss-120b"),
			system: systemPrompt(lang, location, body.diagnosis ?? null),
			messages: await convertToModelMessages(body.messages),
			stopWhen: isStepCount(20),
			abortSignal: request.signal,
			tools: {
				browser_search: groq.tools.browserSearch({}),
				get_mandi_prices: tool({
					description: "Get current APMC mandi prices from AGMARKNET/data.gov.in. Use this for mandi price questions. Never guess prices.",
					inputSchema: objectType({
						commodity: stringType(),
						state: stringType(),
						district: stringType().nullable()
					}),
					execute: async ({ commodity, state, district }) => {
						try {
							return await readMandiPrices({
								commodity,
								state,
								district
							});
						} catch (error) {
							console.error("Mandi tool error:", error);
							return { error: "Live mandi data is unavailable right now." };
						}
					}
				}),
				get_weather: tool({
					description: "Get current weather and forecast from Open-Meteo using coordinates.",
					inputSchema: objectType({
						latitude: numberType(),
						longitude: numberType()
					}),
					execute: async ({ latitude, longitude }) => {
						try {
							return await readWeather({
								latitude,
								longitude
							});
						} catch (error) {
							console.error("Weather tool error:", error);
							return { error: "Live weather data is unavailable right now." };
						}
					}
				}),
				get_schemes: tool({
					description: "Search government schemes available in MarketMitra.",
					inputSchema: objectType({ query: stringType().nullable() }),
					execute: async ({ query }) => {
						const q = query?.trim().toLowerCase();
						const list = q ? schemes.filter((scheme) => `${scheme.name} ${scheme.benefit} ${scheme.dept}`.toLowerCase().includes(q)) : schemes;
						return { schemes: list.length > 0 ? list : schemes };
					}
				})
			},
			providerOptions: { groq: {
				reasoningFormat: "hidden",
				reasoningEffort: "medium",
				parallelToolCalls: true
			} }
		}).toUIMessageStreamResponse({ originalMessages: body.messages });
	} catch (error) {
		console.error("Mitra AI request error:", error);
		return new Response("Mitra AI could not process the request.", { status: 500 });
	}
} } } });
var $$splitComponentImporter = () => import("./market._marketId-B72T1_oP.mjs");
var searchSchema = objectType({
	crop: stringType().catch("onion"),
	state: stringType().catch("Maharashtra"),
	district: stringType().catch("")
});
var Route$1 = createFileRoute("/_authenticated/market/$marketId")({
	validateSearch: searchSchema,
	head: ({ params }) => ({
		meta: [
			{ title: `${params.marketId} mandi prices — MarketMitra` },
			{
				name: "description",
				content: "Recorded price range, price history and reporting dates for this APMC mandi."
			},
			{
				property: "og:title",
				content: `${params.marketId} mandi prices — MarketMitra`
			},
			{
				property: "og:description",
				content: "Track how this mandi has been trading day by day."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:url",
				content: `https://marketmitra.app/market/${params.marketId}`
			}
		],
		links: [{
			rel: "canonical",
			href: `https://marketmitra.app/market/${params.marketId}`
		}],
		scripts: [{
			type: "application/ld+json",
			children: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "Dataset",
				name: `${params.marketId} APMC mandi price records`,
				description: `Daily minimum, maximum and modal price records reported by the ${params.marketId} APMC mandi.`,
				url: `https://marketmitra.app/market/${params.marketId}`,
				license: "https://data.gov.in/government-open-data-license-india",
				isAccessibleForFree: true,
				creator: {
					"@type": "GovernmentOrganization",
					name: "Directorate of Marketing & Inspection (Agmarknet)"
				},
				publisher: { "@id": "https://marketmitra.app/#organization" },
				spatialCoverage: {
					"@type": "Place",
					name: `${params.marketId}, India`
				}
			})
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route = createFileRoute("/lovable/email/transactional/preview")({ server: { handlers: { POST: async ({ request }) => {
	const apiKey = process.env["LOVABLE_API_KEY"];
	if (!apiKey) return Response.json({ error: "Server configuration error" }, { status: 500 });
	if (request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") !== apiKey) return Response.json({ error: "Unauthorized" }, { status: 401 });
	const templateNames = Object.keys(TEMPLATES);
	const results = [];
	for (const name of templateNames) {
		const entry = TEMPLATES[name];
		if (!entry) continue;
		const displayName = entry.displayName || name;
		if (!entry.previewData) {
			results.push({
				templateName: name,
				displayName,
				subject: "",
				html: "",
				status: "preview_data_required"
			});
			continue;
		}
		try {
			const html = await render(import_react.createElement(entry.component, entry.previewData));
			const resolvedSubject = typeof entry.subject === "function" ? entry.subject(entry.previewData) : entry.subject;
			results.push({
				templateName: name,
				displayName,
				subject: resolvedSubject,
				html,
				status: "ready"
			});
		} catch (err) {
			console.error("Failed to render template for preview", {
				template: name,
				error: err
			});
			results.push({
				templateName: name,
				displayName,
				subject: "",
				html: "",
				status: "render_failed",
				errorMessage: err instanceof Error ? err.message : String(err)
			});
		}
	}
	return Response.json({ templates: results });
} } } });
var IndexRoute = Route$19.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$20
});
var AuthenticatedRouteRoute = Route$18.update({
	id: "/_authenticated",
	getParentRoute: () => Route$20
});
var AboutRoute = Route$17.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$20
});
var AdminRoute = Route$16.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$20
});
var AuthRoute = Route$15.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$20
});
var ResetPasswordRoute = Route$14.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$20
});
var TermsRoute = Route$13.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$20
});
var AuthenticatedCropsRoute = Route$12.update({
	id: "/crops",
	path: "/crops",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDiagnoseRoute = Route$11.update({
	id: "/diagnose",
	path: "/diagnose",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHomeRoute = Route$10.update({
	id: "/home",
	path: "/home",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedLinkRoute = Route$9.update({
	id: "/link",
	path: "/link",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedMarketsRoute = Route$8.update({
	id: "/markets",
	path: "/markets",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPredictRoute = Route$7.update({
	id: "/predict",
	path: "/predict",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$6.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSchemesRoute = Route$5.update({
	id: "/schemes",
	path: "/schemes",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$4.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWeatherRoute = Route$3.update({
	id: "/weather",
	path: "/weather",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiChatRoute = Route$2.update({
	id: "/api/chat",
	path: "/api/chat",
	getParentRoute: () => Route$20
});
var AuthenticatedMarketMarketIdRoute = Route$1.update({
	id: "/market/$marketId",
	path: "/market/$marketId",
	getParentRoute: () => AuthenticatedRouteRoute
});
var LovableEmailTransactionalPreviewRoute = Route.update({
	id: "/lovable/email/transactional/preview",
	path: "/lovable/email/transactional/preview",
	getParentRoute: () => Route$20
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedCropsRoute,
	AuthenticatedDiagnoseRoute,
	AuthenticatedHomeRoute,
	AuthenticatedLinkRoute,
	AuthenticatedMarketsRoute,
	AuthenticatedPredictRoute,
	AuthenticatedProfileRoute,
	AuthenticatedSchemesRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedWeatherRoute,
	AuthenticatedMarketMarketIdRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AboutRoute,
	AdminRoute,
	AuthRoute,
	ResetPasswordRoute,
	TermsRoute,
	ApiChatRoute,
	LovableEmailTransactionalPreviewRoute
};
var routeTree = Route$20._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll$1({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: {
		staleTime: 3e5,
		gcTime: 18e5,
		refetchOnWindowFocus: false,
		retry: 1
	} } });
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadDelay: 40,
		defaultPreloadStaleTime: 3e4
	});
};
//#endregion
export { useAuth as A, useLocationContext as C, useTheme as D, useSettings as E, useServerFn as M, cn as O, useLang as S, usePageTracking as T, router_5yV9beqj_exports as _, Route$1 as a, track as b, Wordmark as c, diagnoseCropImage as d, featureKeyForPath as f, listCropDiagnoses as g, langNames as h, MaintenanceNotice as i, useSession as j, createSsrRpc as k, crops as l, findCrop as m, INDIAN_STATES as n, Route$7 as o, fetchWeather as p, LogoMark as r, Route$8 as s, Button as t, deleteCropDiagnosis as u, schemes as v, useMitraSpeech as w, useFeature as x, themes as y };
