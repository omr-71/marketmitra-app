import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as useLang, T as usePageTracking, c as Wordmark, f as featureKeyForPath, i as MaintenanceNotice, r as LogoMark, x as useFeature } from "./router-5yV9beqj.mjs";
import { $ as Mail, At as CloudSun, D as Stethoscope, E as Store, P as Settings, ct as Landmark, d as User, ft as House, lt as Info, mt as Handshake, zt as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-Cbiru3-8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Market Mitra Motion System
*
* Motion should feel:
* - fluid, not bouncy
* - fast, not rushed
* - dimensional, not flashy
* - alive, not constantly moving
*/
var EASING = {
	out: [
		.22,
		1,
		.36,
		1
	],
	inOut: [
		.45,
		0,
		.55,
		1
	],
	snappy: [
		.16,
		1,
		.3,
		1
	],
	soft: [
		.25,
		.1,
		.25,
		1
	]
};
var DURATION = {
	instant: .12,
	micro: .18,
	card: .28,
	reveal: .52,
	section: .68,
	page: .32,
	ambient: 8
};
/**
* Physical-feeling springs.
* Low bounce = premium instead of playful.
*/
var SPRINGS = {
	tactile: {
		type: "spring",
		stiffness: 500,
		damping: 34,
		mass: .75
	},
	navPill: {
		type: "spring",
		stiffness: 520,
		damping: 40,
		mass: .75
	},
	gentle: {
		type: "spring",
		stiffness: 240,
		damping: 30,
		mass: .9
	},
	magnetic: {
		type: "spring",
		stiffness: 180,
		damping: 22,
		mass: .65
	}
};
/**
* Detect system-level reduced motion and
* Market Mitra's own motion preference.
*/
function useReducedMotion() {
	const [prefersReduced, setPrefersReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const check = () => {
			const mediaMatch = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const dataAttr = document.documentElement.dataset.motion === "reduced";
			setPrefersReduced(mediaMatch || dataAttr);
		};
		check();
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		mediaQuery.addEventListener("change", check);
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) if (mutation.type === "attributes" && mutation.attributeName === "data-motion") check();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-motion"]
		});
		return () => {
			mediaQuery.removeEventListener("change", check);
			observer.disconnect();
		};
	}, []);
	return prefersReduced;
}
DURATION.reveal, EASING.out;
DURATION.reveal, EASING.out;
DURATION.section, EASING.out;
var staggerContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: .075,
			delayChildren: .045
		}
	}
};
var staggerItemVariants = {
	hidden: {
		opacity: 0,
		y: 18,
		scale: .985,
		filter: "blur(3px)"
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			duration: DURATION.card,
			ease: EASING.out
		}
	}
};
SPRINGS.gentle, SPRINGS.tactile;
SPRINGS.tactile, SPRINGS.tactile;
DURATION.page, EASING.out;
EASING.inOut;
EASING.inOut;
EASING.inOut;
var nav = [
	{
		to: "/home",
		icon: House,
		key: "home"
	},
	{
		to: "/crops",
		icon: Store,
		key: "markets"
	},
	{
		to: "/link",
		icon: Handshake,
		key: "mitraLink"
	},
	{
		to: "/diagnose",
		icon: Stethoscope,
		key: "diagnose"
	},
	{
		to: "/weather",
		icon: CloudSun,
		key: "weather"
	},
	{
		to: "/schemes",
		icon: Landmark,
		key: "schemes"
	},
	{
		to: "/profile",
		icon: User,
		key: "profile"
	}
];
function useActive() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return (to) => pathname === to || to !== "/home" && pathname.startsWith(to);
}
function BottomNav() {
	const { t } = useLang();
	const isActive = useActive();
	const reducedMotion = useReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex h-[72px] items-center overflow-hidden rounded-[30px] border border-white/30 bg-white/[0.68] px-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.20),0_4px_12px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.18)] backdrop-blur-[28px] backdrop-saturate-[180%] dark:border-white/[0.12] dark:bg-slate-950/[0.70] dark:shadow-[0_20px_55px_rgba(0,0,0,0.45),0_4px_14px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.10)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 dark:via-white/30" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -left-10 -top-12 h-28 w-40 rounded-full bg-white/30 blur-3xl dark:bg-white/[0.04]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -right-10 bottom-[-45px] h-28 w-40 rounded-full bg-primary/10 blur-3xl" }),
				nav.map(({ to, icon: Icon, key }) => {
					const active = isActive(to);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						className: `press group relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-center px-0.5 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
						children: [
							active && (reducedMotion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[57px] w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white/[0.58] shadow-[0_7px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.20)] backdrop-blur-xl dark:bg-white/[0.09] dark:shadow-[0_8px_25px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								layoutId: "bottomNavBubble",
								transition: SPRINGS.navPill,
								className: "pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[57px] w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white/[0.58] shadow-[0_7px_22px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.20)] backdrop-blur-xl dark:bg-white/[0.09] dark:shadow-[0_8px_25px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]"
							})),
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute left-1/2 top-[8px] h-2.5 w-7 -translate-x-1/2 rounded-full bg-white/70 blur-[2px] dark:bg-white/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-md" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `relative grid size-8 place-items-center rounded-full transition-all duration-300 ${active ? "scale-110 -translate-y-1" : "group-hover:-translate-y-0.5 group-hover:scale-105"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: `size-[19px] transition-all duration-300 ${active ? "drop-shadow-[0_2px_5px_rgba(37,99,235,0.18)]" : ""}`,
									strokeWidth: active ? 2.5 : 1.8
								}), active && (reducedMotion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_currentColor]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									layoutId: "bottomNavDot",
									transition: SPRINGS.tactile,
									className: "absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_currentColor]"
								}))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `relative mt-0.5 w-full truncate px-0.5 text-center text-[9px] font-bold leading-none transition-all duration-300 ${active ? "translate-y-[-1px]" : ""}`,
								children: t(key)
							})
						]
					}, to);
				})
			]
		})
	});
}
/** Desktop-only left rail: makes the app read like a professional web platform. */
function SideNav() {
	const { t } = useLang();
	const isActive = useActive();
	const reducedMotion = useReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card px-4 py-6 lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/home",
				className: "flex items-center gap-3 px-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { className: "text-lg" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-9 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground",
				children: "Workspace"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mt-2 space-y-1",
				children: nav.map(({ to, icon: Icon, key }) => {
					const active = isActive(to);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						className: `press relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-colors ${active ? "text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`,
						children: [
							active && (reducedMotion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 -z-10 rounded-xl bg-primary/12" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								layoutId: "sideNavActivePill",
								transition: SPRINGS.navPill,
								className: "absolute inset-0 -z-10 rounded-xl bg-primary/12"
							})),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: active ? 2.4 : 1.9
							}),
							t(key)
						]
					}, to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/about",
				className: "press mt-auto flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					className: "size-5",
					strokeWidth: 1.9
				}), "About MarketMitra"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 px-3 text-[11px] leading-relaxed text-muted-foreground",
				children: [
					"Official APMC mandi prices · Verified weather data",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"English · मराठी · हिंदी"
				]
			})
		]
	});
}
function Screen({ children, nav: withNav = true, className = "" }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	usePageTracking();
	const flag = useFeature(featureKeyForPath(pathname));
	const disabled = flag && !flag.enabled ? flag : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-canvas min-h-screen bg-background lg:flex",
		children: [
			withNav && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-route": pathname,
					className: `app-page mx-auto w-full max-w-[430px] lg:max-w-6xl lg:px-8 ${withNav ? "pb-28 lg:pb-0" : ""} ${className}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "animate-page",
						children: disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaintenanceNotice, { flag: disabled }) : children
					}, pathname), withNav && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})]
				})
			}),
			withNav && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})
		]
	});
}
function TopBar({ title, subtitle, back, action, settings = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "app-topbar sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md lg:bg-background/90 lg:px-0 lg:py-6 lg:backdrop-blur-xl",
		children: [
			back ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: back,
				className: "press group grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80",
				"aria-label": "Back",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5 transition-transform duration-200 group-hover:-translate-x-0.5" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-9 shrink-0 lg:hidden" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 text-center lg:text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate font-display text-base font-bold lg:text-2xl",
					children: title
				}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground lg:text-sm",
					children: subtitle
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-9 shrink-0 items-center justify-end gap-2",
				children: [action, settings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/settings",
					className: "press group grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80",
					"aria-label": "Settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4.5 transition-transform duration-300 group-hover:rotate-45" })
				})]
			})
		]
	});
}
/** Minimal, elegant site footer. */
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "mt-10 border-t border-border/70 px-5 pb-6 pt-6 text-center lg:mt-16 lg:px-0 lg:pb-10 lg:pt-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-2 text-[11px] font-semibold text-muted-foreground sm:flex-row sm:justify-center sm:gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "© 2026 Market Mitra.All rights reserved" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Developed by Om Labhade" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/terms",
					className: "transition-colors hover:text-primary",
					children: "Terms & Conditions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "mailto:hello.marketmitra@gmail.com",
					className: "inline-flex items-center gap-1.5 transition-colors hover:text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 text-primary" }), "hello.marketmitra@gmail.com"]
				})
			]
		})
	});
}
//#endregion
export { useReducedMotion as a, staggerItemVariants as i, TopBar as n, staggerContainerVariants as r, Screen as t };
