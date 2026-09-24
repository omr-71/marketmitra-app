import { o as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as useLang, r as LogoMark } from "./router-5yV9beqj.mjs";
import { At as CloudSun, Vt as ChartColumn, Yt as ArrowRight, ct as Landmark } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DuiRR_k8.js
var import_jsx_runtime = require_jsx_runtime();
var field_default = "/assets/field-gXNwcyMN.jpg";
function Splash() {
	const { t } = useLang();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden bg-[oklch(0.16_0.022_160)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: field_default,
				alt: "Crop field at sunrise",
				width: 1024,
				height: 1280,
				className: "absolute inset-0 size-full object-cover opacity-40"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[linear-gradient(180deg,oklch(0.16_0.022_160/0.65)_0%,oklch(0.14_0.02_160/0.92)_60%,oklch(0.13_0.02_160)_100%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-7 text-center lg:max-w-5xl lg:items-start lg:px-10 lg:text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative animate-rise",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 -z-10 animate-breathe rounded-full bg-primary/35 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-24 place-items-center rounded-[2rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.16)] backdrop-blur-xl lg:size-28",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-14 lg:size-16" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "animate-rise mt-8 font-display text-4xl font-extrabold text-[oklch(0.98_0.01_140)] lg:text-6xl",
						style: { animationDelay: "80ms" },
						children: [
							"Market",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary-glow",
								children: "Mitra"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-2 block text-xl font-bold text-[oklch(0.9_0.02_145)] lg:text-3xl",
								children: "Compare mandi prices and sell where you earn the most"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "animate-rise mt-3 max-w-xl text-base font-medium text-[oklch(0.88_0.02_145)] lg:text-xl",
						style: { animationDelay: "160ms" },
						children: t("tagline")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "animate-rise mt-3 max-w-2xl text-sm leading-relaxed text-[oklch(0.82_0.02_145)] lg:text-base",
						style: { animationDelay: "200ms" },
						children: "MarketMitra shows the day's official APMC rates for your crop across nearby markets, subtracts the transport cost to each one, and tells you which mandi leaves the most money in your hand. Add live farm weather, government scheme details, crop disease help and farmer-to-farmer equipment sharing — all in English, मराठी and हिंदी."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-rise mt-10 w-full space-y-3 lg:max-w-xs",
						style: { animationDelay: "240ms" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/home",
							className: "press sheen-on-hover grad-primary flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)]",
							children: [t("getStarted"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5" })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "animate-rise mt-12 w-full text-left font-display text-lg font-bold text-[oklch(0.95_0.01_140)] lg:text-2xl",
						style: { animationDelay: "300ms" },
						children: "What you get with MarketMitra"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "animate-rise mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-3",
						style: { animationDelay: "320ms" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-5 text-primary-glow" }),
								title: "Official mandi prices",
								body: "Min, modal and max rates from Agmarknet APMC reporting, timestamped in IST."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, { className: "size-5 text-primary-glow" }),
								title: "Real farm weather",
								body: "GPS-based temperature, rain probability, UV and a 7-day outlook from Open-Meteo."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlight, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5 text-primary-glow" }),
								title: "Schemes & guidance",
								body: "Government scheme details and daily farming guidance in your language."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-10 text-xs text-[oklch(0.75_0.02_145)]",
						children: "Official mandi data · English · मराठी · हिंदी"
					})
				]
			})
		]
	});
}
function Highlight({ icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-dark rounded-3xl p-5 text-left",
		children: [
			icon,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm font-bold text-[oklch(0.97_0.01_140)]",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-xs leading-relaxed text-[oklch(0.82_0.02_145)]",
				children: body
			})
		]
	});
}
//#endregion
export { Splash as component };
