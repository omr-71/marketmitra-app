import { i as __toESM } from "../_runtime.mjs";
import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Root } from "../_libs/@radix-ui/react-label+[...].mjs";
import { A as useAuth, D as useTheme, E as useSettings, M as useServerFn, O as cn, S as useLang, h as langNames, j as useSession, k as createSsrRpc, l as crops, w as useMitraSpeech, y as themes } from "./router-5yV9beqj.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { t as MITRA_VOICES } from "./voices-0m0VMK20.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bt as Check, G as Palette, Gt as Bell, H as Phone, Kt as BadgeCheck, L as RotateCcw, M as Shield, N as ShieldCheck, Nt as Clock3, Q as MapPin, Qt as Accessibility, Rt as ChevronRight, d as User, et as LogOut, gt as Globe, h as TrendingUp, it as Link2, jt as CloudRain, k as Sprout, l as Volume2, lt as Info, ot as Leaf, rt as LoaderCircle, t as Zap } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Bdv0zWGe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var phoneSchema = stringType().trim().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");
/** Emails a 6-digit code to the signed-in account so the owner proves the number is theirs. */
var sendPhoneVerificationCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ phone: phoneSchema }).parse(data)).handler(createSsrRpc("80b31d19c27865ea3f97e22cf27d3d380870a61fbbe408ee609f5af17b365c76"));
var confirmPhoneVerificationCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ code: stringType().trim().regex(/^\d{6}$/) }).parse(data)).handler(createSsrRpc("e318e963b07351c1f79099faa0dbe8c029475b5b85c75484f9496ced89957b8a"));
var copy = {
	title: {
		en: "Mobile number",
		mr: "मोबाइल नंबर",
		hi: "मोबाइल नंबर"
	},
	hint: {
		en: "Verify your number so other farmers can reach you on Mitra Link.",
		mr: "मित्र लिंकवर इतर शेतकरी संपर्क करू शकतील म्हणून नंबर पडताळा.",
		hi: "मित्र लिंक पर दूसरे किसान संपर्क कर सकें, इसलिए नंबर सत्यापित करें."
	},
	verified: {
		en: "Verified",
		mr: "पडताळलेले",
		hi: "सत्यापित"
	},
	notVerified: {
		en: "Not verified yet",
		mr: "अजून पडताळलेले नाही",
		hi: "अभी सत्यापित नहीं"
	},
	send: {
		en: "Send code",
		mr: "कोड पाठवा",
		hi: "कोड भेजें"
	},
	resend: {
		en: "Send a new code",
		mr: "नवीन कोड पाठवा",
		hi: "नया कोड भेजें"
	},
	codeLabel: {
		en: "6-digit code",
		mr: "६ अंकी कोड",
		hi: "6 अंकों का कोड"
	},
	confirm: {
		en: "Confirm",
		mr: "निश्चित करा",
		hi: "पुष्टि करें"
	},
	invalid: {
		en: "Enter a valid 10-digit mobile number.",
		mr: "वैध १० अंकी मोबाइल नंबर टाका.",
		hi: "मान्य 10 अंकों का मोबाइल नंबर डालें."
	},
	sentTo: {
		en: "We sent a code to",
		mr: "आम्ही कोड पाठवला आहे",
		hi: "हमने कोड भेजा है"
	},
	done: {
		en: "Mobile number verified",
		mr: "मोबाइल नंबर पडताळला",
		hi: "मोबाइल नंबर सत्यापित"
	},
	wait: {
		en: "Wait",
		mr: "थांबा",
		hi: "रुकें"
	},
	seconds: {
		en: "s",
		mr: "से",
		hi: "से"
	}
};
function PhoneVerifyCard() {
	const { lang } = useLang();
	const { profile, refresh } = useSession();
	const send = useServerFn(sendPhoneVerificationCode);
	const confirm = useServerFn(confirmPhoneVerificationCode);
	const savedDigits = (profile.phone ?? "").replace(/\D/g, "").slice(-10);
	const [phone, setPhone] = (0, import_react.useState)(savedDigits);
	const [code, setCode] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)("idle");
	const [maskedEmail, setMasked] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [cooldown, setCooldown] = (0, import_react.useState)(0);
	const timer = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setPhone((current) => current ? current : savedDigits);
	}, [savedDigits]);
	(0, import_react.useEffect)(() => {
		if (cooldown <= 0) return;
		timer.current = setInterval(() => setCooldown((s) => s <= 1 ? 0 : s - 1), 1e3);
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, [cooldown]);
	const numberChanged = savedDigits !== "" && phone !== savedDigits;
	const verified = profile.phone_verified && !numberChanged;
	const requestCode = async () => {
		if (!/^[6-9]\d{9}$/.test(phone)) {
			setError(copy.invalid[lang]);
			return;
		}
		setError(null);
		setBusy(true);
		try {
			const result = await send({ data: { phone } });
			setMasked(result.maskedEmail);
			setStage("code");
			setCode("");
			setCooldown(45);
			try {
				await refresh();
			} catch {}
			toast.success(`${copy.sentTo[lang]} ${result.maskedEmail}`);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Could not send the code just now.");
		} finally {
			setBusy(false);
		}
	};
	const submitCode = async () => {
		if (!/^\d{6}$/.test(code)) {
			setError(copy.codeLabel[lang]);
			return;
		}
		setError(null);
		setBusy(true);
		try {
			await confirm({ data: { code } });
			await refresh();
			setStage("idle");
			setCode("");
			toast.success(copy.done[lang]);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "That code could not be checked.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface hover-lift space-y-3 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
					children: copy.title[lang]
				}), verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3" }),
						" ",
						copy.verified[lang]
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground",
					children: copy.notVerified[lang]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-2xl border border-border bg-card px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold text-muted-foreground",
						children: "+91"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: phone,
						inputMode: "numeric",
						maxLength: 10,
						autoComplete: "tel-national",
						"aria-label": copy.title[lang],
						onChange: (e) => {
							setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
							setStage("idle");
							setError(null);
						},
						className: "h-12 w-full bg-transparent text-sm font-semibold outline-none"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: copy.hint[lang]
			}),
			stage === "code" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] font-semibold text-muted-foreground",
					children: [
						copy.sentTo[lang],
						" ",
						maskedEmail
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: code,
						inputMode: "numeric",
						maxLength: 6,
						autoComplete: "one-time-code",
						"aria-label": copy.codeLabel[lang],
						placeholder: "------",
						onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
						className: "h-12 w-32 rounded-2xl border border-border bg-card text-center text-base font-bold tracking-[0.35em] outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void submitCode(),
						disabled: busy || code.length !== 6,
						className: "press grad-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60",
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), copy.confirm[lang]]
					})]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-semibold text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => void requestCode(),
				disabled: busy || cooldown > 0 || verified && stage === "idle" && !numberChanged,
				className: "press flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm font-bold disabled:opacity-60",
				children: [busy && stage === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, cooldown > 0 ? `${copy.wait[lang]} ${cooldown}${copy.seconds[lang]}` : stage === "code" ? copy.resend[lang] : copy.send[lang]]
			})
		]
	});
}
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var previewLine = {
	en: "Namaste, I am Mitra. I can read your answers aloud like this.",
	mr: "नमस्ते, मी मित्र. मी तुमची उत्तरे अशी वाचून दाखवू शकतो.",
	hi: "नमस्ते, मैं मित्र हूँ। मैं आपके उत्तर इस तरह पढ़कर सुना सकता हूँ।"
};
var previewCopy = {
	play: {
		en: "Hear this voice",
		mr: "हा आवाज ऐका",
		hi: "यह आवाज़ सुनें"
	},
	loading: {
		en: "Preparing…",
		mr: "तयार करत आहे…",
		hi: "तैयार हो रहा है…"
	},
	playing: {
		en: "Speaking…",
		mr: "बोलत आहे…",
		hi: "बोल रहा है…"
	}
};
var DEFAULT_ALERTS = {
	priceRise: true,
	priceFall: true,
	dailyMarket: false,
	heavyRain: true,
	extremeTemperature: true,
	strongWind: false,
	mitraLink: true,
	quietHours: true,
	dailyBrief: false,
	quietFrom: "22:00",
	quietTo: "06:00",
	priceRiseThreshold: 10,
	priceFallThreshold: 10,
	rainThreshold: 30,
	temperatureHigh: 38,
	temperatureLow: 10,
	briefTime: "07:00"
};
var ALERT_STORAGE_KEY = "marketmitra-alert-preferences";
function Section({ icon: Icon, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "flex items-center gap-2 text-sm font-bold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }), title]
		}), children]
	});
}
function Toggle({ label, hint, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 space-y-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-sm font-bold",
				children: label
			}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] leading-relaxed text-muted-foreground",
				children: hint
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange: onChange
		})]
	});
}
function NumberSetting({ label, value, min, max, suffix, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-semibold",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "number",
				min,
				max,
				value,
				onChange: (e) => onChange(Number(e.currentTarget.value)),
				className: "h-9 w-20 rounded-xl border border-border bg-background px-2 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold text-muted-foreground",
				children: suffix
			})]
		})]
	});
}
function SettingsPage() {
	const { signOut } = useAuth();
	const { t, lang, setLang } = useLang();
	const { theme, setTheme } = useTheme();
	const { settings, setNotifications, setAppearance, setVoice, reset } = useSettings();
	const { profile, updateProfile } = useSession();
	const preview = useMitraSpeech({
		voiceId: settings.voice.voiceId,
		speed: settings.voice.speed,
		volume: settings.voice.volume,
		expressive: settings.voice.emotional
	}, lang);
	const [name, setName] = (0, import_react.useState)("");
	const [village, setVillage] = (0, import_react.useState)("");
	const [errors, setErrors] = (0, import_react.useState)({});
	const [permission, setPermission] = (0, import_react.useState)("default");
	const [alerts, setAlerts] = (0, import_react.useState)(DEFAULT_ALERTS);
	const [showAdvancedAlerts, setShowAdvancedAlerts] = (0, import_react.useState)(false);
	const saved = profile.saved_crops ?? [];
	(0, import_react.useEffect)(() => {
		setName(profile.full_name ?? "");
		setVillage(profile.village ?? "");
	}, [profile.full_name, profile.village]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const stored = window.localStorage.getItem(ALERT_STORAGE_KEY);
		if (!stored) return;
		try {
			const parsed = JSON.parse(stored);
			setAlerts({
				...DEFAULT_ALERTS,
				...parsed
			});
		} catch {
			window.localStorage.removeItem(ALERT_STORAGE_KEY);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
	}, []);
	const saveAlerts = (next) => {
		setAlerts(next);
		if (typeof window !== "undefined") window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(next));
	};
	const updateAlert = (key, value) => {
		saveAlerts({
			...alerts,
			[key]: value
		});
	};
	const msg = { nameRequired: {
		en: "Full name is required.",
		mr: "पूर्ण नाव आवश्यक आहे.",
		hi: "पूरा नाम आवश्यक है."
	} };
	const saveProfile = async () => {
		const next = {};
		if (!name.trim()) next.name = msg.nameRequired[lang];
		setErrors(next);
		if (next.name) return;
		try {
			await updateProfile({
				full_name: name.trim(),
				village: village.trim() || null
			});
			toast.success(t("save"));
		} catch {
			toast.error("Could not save your profile.");
		}
	};
	const changeLanguage = async (next) => {
		setLang(next);
		try {
			await updateProfile({ language: next });
			toast.success(langNames[next]);
		} catch {
			toast.error("Language preference could not be saved.");
		}
	};
	const requestNotificationPermission = async () => {
		if (typeof Notification === "undefined") {
			setPermission("unsupported");
			toast.info("Your browser does not support notifications.");
			return;
		}
		if (Notification.permission === "denied") {
			toast.info("Notifications are blocked in your browser settings.");
			return;
		}
		if (Notification.permission === "granted") {
			setPermission("granted");
			toast.success("Notifications are already enabled.");
			return;
		}
		const result = await Notification.requestPermission();
		setPermission(result);
		if (result === "granted") toast.success("Notifications enabled on this device.");
	};
	const enableAlerts = async (key, value) => {
		setNotifications({ [key]: value });
		if (!value) return;
		if (permission === "unsupported") {
			toast.info("This browser does not support browser notifications.");
			return;
		}
		if (permission === "granted") return;
		if (permission === "denied") {
			toast.info("Notifications are blocked in your browser settings.");
			return;
		}
		const result = await Notification.requestPermission();
		setPermission(result);
		if (result === "granted") toast.success("Notifications enabled on this device.");
		else toast.info("Notifications were not enabled.");
	};
	const previewNotification = async () => {
		if (permission !== "granted") {
			await requestNotificationPermission();
			if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
		}
		new Notification("MarketMitra", {
			body: "Your MarketMitra alerts will appear here when enabled.",
			icon: "/icon-192.png",
			tag: "marketmitra-preview"
		});
	};
	const savedCropNames = (0, import_react.useMemo)(() => {
		return crops.filter((crop) => saved.includes(crop.id)).map((crop) => crop.name[lang]);
	}, [saved, lang]);
	const toggleCrop = (id) => {
		const next = saved.includes(id) ? saved.filter((c) => c !== id) : [...saved, id];
		updateProfile({ saved_crops: next });
	};
	const handleReset = () => {
		if (!window.confirm("Reset MarketMitra settings to their defaults? Your profile data will be kept.")) return;
		reset();
		setTheme("emerald");
		saveAlerts(DEFAULT_ALERTS);
		toast.success("Settings reset.");
	};
	const handleSignOut = async () => {
		await signOut();
		toast.success("Signed out successfully");
	};
	const notificationStatus = permission === "granted" ? "Enabled on this device" : permission === "denied" ? "Blocked by browser" : permission === "unsupported" ? "Not supported" : "Not enabled";
	const notificationStatusClass = permission === "granted" ? "text-primary" : permission === "denied" ? "text-destructive" : "text-muted-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: t("settings"),
		back: "/profile",
		settings: false
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl space-y-7 px-5 pb-12 pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-[2rem] bg-[#101820] p-6 text-white shadow-[var(--shadow-float)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/20 blur-[80px]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold uppercase tracking-[0.2em] text-primary-glow",
							children: "MarketMitra control center"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-3xl font-extrabold text-white",
							children: "Settings"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-white/65",
							children: "Control how MarketMitra tracks your crops, alerts you, speaks to you and adapts to your farming needs."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white",
								children: [
									saved.length,
									" saved crop",
									saved.length === 1 ? "" : "s"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold ${permission === "granted" ? "text-primary-glow" : "text-white/60"}`,
								children: notificationStatus
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				icon: User,
				title: "Personal information",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface hover-lift space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
									children: [t("fullName"), " *"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: name,
										onChange: (e) => setName(e.target.value),
										"aria-invalid": !!errors.name,
										className: "h-12 w-full bg-transparent text-sm font-semibold outline-none"
									})]
								}),
								errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] font-semibold text-destructive",
									children: errors.name
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
								children: t("village")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: village,
									onChange: (e) => setVillage(e.target.value),
									className: "h-12 w-full bg-transparent text-sm font-semibold outline-none"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => void saveProfile(),
							className: "press grad-primary flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground",
							children: t("save")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneVerifyCard, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Palette,
				title: "Appearance",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface hover-lift space-y-4 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Theme"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2 lg:grid-cols-3",
						children: themes.map((th) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTheme(th.id),
							className: `press flex items-center gap-2 rounded-xl border p-3 text-left transition-all duration-300 ${theme === th.id ? "border-primary bg-primary/10 shadow-[var(--shadow-card)]" : "border-border bg-card"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex shrink-0 gap-0.5",
									children: th.swatch.slice(0, 2).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-3 rounded-full ring-1 ring-border",
										style: { backgroundColor: c }
									}, c))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate text-xs font-bold",
									children: th.label
								}),
								theme === th.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "size-3.5 shrink-0 text-primary",
									strokeWidth: 3
								})
							]
						}, th.id))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Accessibility,
				title: "Accessibility",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface hover-lift space-y-5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Compact Mode",
							hint: "Tighter spacing so more information fits on screen.",
							checked: settings.appearance.density === "compact",
							onChange: (v) => setAppearance({ density: v ? "compact" : "comfortable" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Larger Text",
							hint: "Increase text size across the app.",
							checked: settings.appearance.textSize === "lg",
							onChange: (v) => setAppearance({ textSize: v ? "lg" : "md" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Reduce Motion",
							hint: "Minimise animations and transitions.",
							checked: settings.appearance.reduceMotion,
							onChange: (v) => setAppearance({ reduceMotion: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "High Contrast",
							hint: "Use stronger borders and text contrast.",
							checked: settings.appearance.highContrast,
							onChange: (v) => setAppearance({ highContrast: v })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Globe,
				title: t("language"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "card-surface p-2",
					children: Object.keys(langNames).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void changeLanguage(l),
						className: `press flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold transition-colors duration-300 ${lang === l ? "bg-primary/10 text-primary" : "text-foreground"}`,
						children: [langNames[l], lang === l && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-4",
							strokeWidth: 3
						})]
					}, l))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Volume2,
				title: "Mitra voice",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface hover-lift space-y-5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
									children: "Voice personality"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: MITRA_VOICES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setVoice({ voiceId: v.id }),
										className: `press rounded-xl border px-3 py-3 text-left transition-colors ${settings.voice.voiceId === v.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border/70 text-foreground"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[13px] font-bold",
											children: v.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 block text-[11px] font-semibold text-muted-foreground",
											children: v.style[lang]
										})]
									}, v.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => preview.speak(previewLine[lang]),
									disabled: preview.loading || preview.speaking,
									className: "press rounded-xl border border-border/70 px-3 py-2.5 text-[13px] font-bold disabled:opacity-60",
									children: preview.loading ? previewCopy.loading[lang] : preview.speaking ? previewCopy.playing[lang] : previewCopy.play[lang]
								}),
								preview.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[12px] font-semibold text-destructive",
									children: preview.error
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Speaking speed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: .7,
								max: 1.4,
								step: .1,
								value: settings.voice.speed,
								onChange: (e) => setVoice({ speed: Number(e.currentTarget.value) }),
								className: "w-36 accent-[var(--color-primary)]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Volume" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: .2,
								max: 1,
								step: .1,
								value: settings.voice.volume,
								onChange: (e) => setVoice({ volume: Number(e.currentTarget.value) }),
								className: "w-36 accent-[var(--color-primary)]"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Expressive delivery",
							hint: "Mitra matches the tone of the answer.",
							checked: settings.voice.emotional,
							onChange: (v) => setVoice({ emotional: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Speak answers aloud",
							hint: "Mitra reads every reply automatically.",
							checked: settings.voice.autoPlay,
							onChange: (v) => setVoice({ autoPlay: v })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Bell,
				title: "Notifications",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface hover-lift space-y-5 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-primary/20 bg-primary/5 p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5 text-primary" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-extrabold",
												children: "Device notifications"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: `mt-1 text-[11px] font-semibold ${notificationStatusClass}`,
												children: notificationStatus
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
												children: "Allow MarketMitra to notify you about enabled farming alerts."
											})
										]
									}),
									permission !== "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void requestNotificationPermission(),
										className: "press shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground",
										children: "Enable"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Market Updates",
									hint: "New official mandi prices for your saved crops.",
									checked: settings.notifications.market,
									onChange: (v) => void enableAlerts("market", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Price Rise Alerts",
									hint: `Notify when a saved crop rises by ${alerts.priceRiseThreshold}% or more.`,
									checked: alerts.priceRise,
									onChange: (v) => updateAlert("priceRise", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Price Drop Alerts",
									hint: `Notify when a saved crop falls by ${alerts.priceFallThreshold}% or more.`,
									checked: alerts.priceFall,
									onChange: (v) => updateAlert("priceFall", v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									label: "Daily Market Update",
									hint: "A daily summary for your saved crops.",
									checked: alerts.dailyMarket,
									onChange: (v) => updateAlert("dailyMarket", v)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-primary",
								children: "Weather"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Weather Alerts",
										hint: "Important weather warnings for your farm location.",
										checked: settings.notifications.weather,
										onChange: (v) => void enableAlerts("weather", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Heavy Rain",
										hint: `Alert when rainfall reaches ${alerts.rainThreshold} mm or more.`,
										checked: alerts.heavyRain,
										onChange: (v) => updateAlert("heavyRain", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Extreme Temperature",
										hint: `Alert below ${alerts.temperatureLow}°C or above ${alerts.temperatureHigh}°C.`,
										checked: alerts.extremeTemperature,
										onChange: (v) => updateAlert("extremeTemperature", v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										label: "Strong Wind",
										hint: "Notify about significant wind conditions.",
										checked: alerts.strongWind,
										onChange: (v) => updateAlert("strongWind", v)
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-primary",
								children: "Mitra Link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "Mitra Link Activity",
								hint: "Requests, accepted matches and important listing activity.",
								checked: alerts.mitraLink,
								onChange: (v) => updateAlert("mitraLink", v)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-border pt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								label: "System Notifications",
								hint: "Important MarketMitra announcements and service updates.",
								checked: settings.notifications.updates,
								onChange: (v) => void enableAlerts("updates", v)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowAdvancedAlerts(!showAdvancedAlerts),
							className: "press flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-primary" }), "Advanced alert controls"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: `size-4 text-muted-foreground transition-transform ${showAdvancedAlerts ? "rotate-90" : ""}` })]
						}),
						showAdvancedAlerts && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5 rounded-2xl border border-border bg-muted/20 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-extrabold",
										children: "Market thresholds"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
										children: "Choose how large a price movement should be before a market alert is generated."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberSetting, {
											label: "Price rise",
											value: alerts.priceRiseThreshold,
											min: 1,
											max: 100,
											suffix: "%",
											onChange: (value) => updateAlert("priceRiseThreshold", value)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberSetting, {
											label: "Price fall",
											value: alerts.priceFallThreshold,
											min: 1,
											max: 100,
											suffix: "%",
											onChange: (value) => updateAlert("priceFallThreshold", value)
										})]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-extrabold",
										children: "Weather thresholds"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberSetting, {
												label: "Rainfall",
												value: alerts.rainThreshold,
												min: 1,
												max: 300,
												suffix: "mm",
												onChange: (value) => updateAlert("rainThreshold", value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberSetting, {
												label: "High temperature",
												value: alerts.temperatureHigh,
												min: 20,
												max: 60,
												suffix: "°C",
												onChange: (value) => updateAlert("temperatureHigh", value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberSetting, {
												label: "Low temperature",
												value: alerts.temperatureLow,
												min: -10,
												max: 30,
												suffix: "°C",
												onChange: (value) => updateAlert("temperatureLow", value)
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-extrabold",
												children: "Quiet hours"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: "Non-critical alerts can be held during this period."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
												label: "Enable quiet hours",
												checked: alerts.quietHours,
												onChange: (v) => updateAlert("quietHours", v)
											})
										}),
										alerts.quietHours && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
												children: "From"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												value: alerts.quietFrom,
												onChange: (e) => updateAlert("quietFrom", e.currentTarget.value),
												className: "mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
												children: "To"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												value: alerts.quietTo,
												onChange: (e) => updateAlert("quietTo", e.currentTarget.value),
												className: "mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none"
											})] })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border pt-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-extrabold",
												children: "Daily Farming Brief"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
											children: "One morning summary can combine your saved crop markets, weather and important activity."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
												label: "Morning brief",
												checked: alerts.dailyBrief,
												onChange: (v) => updateAlert("dailyBrief", v)
											})
										}),
										alerts.dailyBrief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "mt-4 block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
												children: "Delivery time"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												value: alerts.briefTime,
												onChange: (e) => updateAlert("briefTime", e.currentTarget.value),
												className: "mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold outline-none"
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 border-t border-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-xs font-bold ${notificationStatusClass}`,
									children: notificationStatus
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] text-muted-foreground",
									children: "Browser permission controls device notifications."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void previewNotification(),
								className: "press shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold",
								children: "Preview"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Sprout,
				title: "Farming preferences",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface space-y-4 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-bold",
							children: t("savedCrops")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] leading-relaxed text-muted-foreground",
							children: "Your saved crops control which crops MarketMitra prioritises for market information and future alerts."
						})] }),
						savedCropNames.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-primary/5 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.14em] text-primary",
								children: "Currently tracking"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-bold",
								children: savedCropNames.join(" · ")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: crops.map((c) => {
								const active = saved.includes(c.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => toggleCrop(c.id),
									className: `press inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors duration-300 ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-base",
											children: c.emoji
										}),
										c.name[lang],
										active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											className: "size-3.5",
											strokeWidth: 3
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, { className: "size-3.5" })
									]
								}, c.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/weather",
							className: "press flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-primary" }), "Farm location & weather"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Zap,
				title: "Quick controls",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/crops",
							className: "card-surface hover-lift group flex items-center gap-4 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-extrabold",
										children: "Market prices"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] text-muted-foreground",
										children: "Check your saved crop markets."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/diagnose",
							className: "card-surface hover-lift group flex items-center gap-4 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, { className: "size-5 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-extrabold",
										children: "Crop diagnosis"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] text-muted-foreground",
										children: "Check a crop when something looks wrong."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/link",
							className: "card-surface hover-lift group flex items-center gap-4 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-5 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-extrabold",
										children: "Mitra Link"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] text-muted-foreground",
										children: "Manage sharing and matching activity."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/weather",
							className: "card-surface hover-lift group flex items-center gap-4 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "size-5 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-extrabold",
										children: "Weather"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-[11px] text-muted-foreground",
										children: "Check conditions around your location."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground transition-transform group-hover:translate-x-1" })
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Shield,
				title: "Privacy & account",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface overflow-hidden p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleReset,
						className: "press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left",
								children: "Reset app settings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							if (!window.confirm("Sign out of MarketMitra?")) return;
							handleSignOut();
						},
						className: "press flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-destructive hover:bg-destructive/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-left",
								children: "Sign Out"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				icon: Info,
				title: "About",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface overflow-hidden p-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/about",
						className: "press flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "About MarketMitra" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/terms",
						className: "press flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Terms & Conditions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground" })]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "border-t border-border pt-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground",
						children: "MarketMitra v1.0.0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-muted-foreground",
						children: "Developed by Om Labhade"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-[10px] text-muted-foreground/70",
						children: "© 2026 MarketMitra. All rights reserved."
					})
				]
			})
		]
	})] });
}
//#endregion
export { SettingsPage as component };
