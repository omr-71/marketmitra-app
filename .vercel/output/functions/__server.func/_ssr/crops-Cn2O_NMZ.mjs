import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as useLocationContext, S as useLang, b as track, l as crops } from "./router-5yV9beqj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { B as Plus, Bt as Check, Y as Minus, Yt as ArrowRight, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { t as LocationCard } from "./location-card-BYGTE1YF.mjs";
import { a as inr } from "./format-BFmz3HAI.mjs";
import { a as marketPricesQuery, t as DataProvenance } from "./market-queries-CvzWOkUR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crops-Cn2O_NMZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CropsPage() {
	const { t, lang } = useLang();
	const navigate = useNavigate();
	const { location } = useLocationContext();
	const [selected, setSelected] = (0, import_react.useState)("onion");
	const [qty, setQty] = (0, import_react.useState)(20);
	const crop = crops.find((c) => c.id === selected) ?? crops[0];
	const priceQuery = useQuery(marketPricesQuery({
		commodity: crop.commodity,
		...location?.state ? { state: location.state } : {},
		...location?.district ? { district: location.district } : {}
	}));
	const best = priceQuery.data?.records[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: t("selectCrop"),
		subtitle: "Step 1 of 2",
		back: "/home"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-3 gap-2.5",
				children: crops.map((c) => {
					const active = c.id === selected;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setSelected(c.id);
							track("crop_selected", { label: c.commodity });
						},
						className: `press relative flex flex-col items-center gap-2 rounded-3xl border px-2 py-4 ${active ? "border-primary bg-primary/8 shadow-[var(--shadow-card)]" : "border-border bg-card"}`,
						children: [
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute right-2 top-2 grid size-4.5 place-items-center rounded-full bg-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "size-3 text-primary-foreground",
									strokeWidth: 3
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-2xl",
								children: c.emoji
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "line-clamp-1 text-xs font-bold",
								children: c.name[lang]
							})
						]
					}, c.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-surface hover-lift mt-6 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold",
								children: t("quantity")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									crop.name[lang],
									" · ",
									crop.unit
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setQty((q) => Math.max(1, q - 5)),
									className: "press grid size-10 place-items-center rounded-full bg-muted",
									"aria-label": "Decrease",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-12 text-center text-xl font-extrabold",
									children: qty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setQty((q) => Math.min(500, q + 5)),
									className: "press grid size-10 place-items-center rounded-full bg-primary text-primary-foreground",
									"aria-label": "Increase",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 1,
						max: 200,
						value: qty,
						onChange: (e) => setQty(Number(e.target.value)),
						className: "mt-5 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary",
						"aria-label": t("quantity")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [!location?.district ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Select your district to see matching prices."
						}) : priceQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
								" ",
								t("loading")
							]
						}) : best ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground",
								children: [
									t("modalPrice"),
									" · ",
									best.market
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-extrabold",
								children: inr(best.modalPrice)
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Gross value"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base font-extrabold text-primary",
									children: inr(best.modalPrice * qty)
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: priceQuery.isError ? "The latest official prices could not be loaded." : t("noPrices")
						}), priceQuery.data && best && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataProvenance, {
							result: priceQuery.data,
							priceDate: best.date,
							className: "mt-2"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => navigate({
					to: "/markets",
					search: {
						crop: selected,
						qty
					}
				}),
				disabled: !location?.district,
				className: "press grad-primary mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground shadow-[var(--shadow-float)] disabled:opacity-60",
				children: [t("compareMarkets"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5" })]
			})
		]
	})] });
}
//#endregion
export { CropsPage as component };
