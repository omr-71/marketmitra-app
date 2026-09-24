import { i as __toESM } from "../_runtime.mjs";
import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { S as useLang, b as track, k as createSsrRpc, l as crops, m as findCrop, o as Route$7 } from "./router-5yV9beqj.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as Sparkles, N as ShieldCheck, Vt as ChartColumn, g as TrendingDown, h as TrendingUp, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { a as inr, n as formatIstDateTime, t as formatIstDate } from "./format-BFmz3HAI.mjs";
import { t as fetchPriceHistory } from "./market.functions-CoEK8MS1.mjs";
import { a as Area, c as Tooltip, i as XAxis, r as YAxis, s as ResponsiveContainer, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/predict-DcPhDCJa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	commodity: stringType().trim().min(1).max(80),
	state: stringType().trim().min(1).max(60),
	market: stringType().trim().min(1).max(80)
});
var predictPrice = createServerFn({ method: "POST" }).inputValidator((data) => schema.parse(data)).handler(createSsrRpc("5e965d3fe93837ee0c049963c6772e00347a3129526e08e5b1b24594989b641b"));
function PredictPage() {
	const { t, lang } = useLang();
	const { crop: cropId, market, state } = Route$7.useSearch();
	const crop = findCrop(cropId) ?? crops[0];
	const ready = Boolean(market && state);
	(0, import_react.useEffect)(() => {
		if (ready) track("prediction_viewed", { label: crop.commodity });
	}, [ready, crop.commodity]);
	const historyQuery = useQuery({
		queryKey: [
			"history",
			crop.commodity,
			state,
			market
		],
		enabled: ready,
		queryFn: () => fetchPriceHistory({ data: {
			commodity: crop.commodity,
			state,
			market
		} }),
		staleTime: 6e5
	});
	const predictionQuery = useQuery({
		queryKey: [
			"prediction",
			crop.commodity,
			state,
			market
		],
		enabled: ready,
		queryFn: () => predictPrice({ data: {
			commodity: crop.commodity,
			state,
			market
		} }),
		staleTime: 18e5,
		retry: false
	});
	const points = historyQuery.data?.points ?? [];
	const chart = points.slice(-21).map((p) => ({
		label: formatIstDate(p.date).slice(0, 6),
		price: p.modal
	}));
	const prediction = predictionQuery.data;
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: t("pricePrediction"),
		back: "/home"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-5 pt-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "card-surface hover-lift p-5 text-sm text-muted-foreground",
			children: "Open a market from the comparison list to see its price outlook."
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: t("pricePrediction"),
		subtitle: `${crop.name[lang]} · ${market}`,
		back: "/markets"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "card-surface hover-lift p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-7 place-items-center rounded-full bg-primary/12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wide text-primary",
					children: "3-day outlook"
				})]
			}), predictionQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center gap-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
					" ",
					t("loading")
				]
			}) : prediction?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-end gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-3xl font-extrabold",
						children: inr(prediction.expectedPrice)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${prediction.changePercent >= 0 ? "bg-primary/12 text-primary" : "bg-destructive/12 text-destructive"}`,
						children: [
							prediction.changePercent >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3.5" }),
							prediction.changePercent > 0 ? "+" : "",
							prediction.changePercent,
							"%"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						t("confidence"),
						" ",
						prediction.confidence,
						"% · built on ",
						prediction.basedOnDays,
						" recorded days ·",
						" ",
						formatIstDateTime(prediction.generatedAt),
						" IST"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-3xl bg-primary/8 p-4 ring-1 ring-primary/25",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-sm font-extrabold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), prediction.recommendation === "sell_now" ? t("sellNow") : t("hold")]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[15px] font-semibold leading-snug",
						children: prediction.explanation
					})]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold",
						children: t("forecastUnavailable")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: prediction?.message ?? "The forecast service could not be reached."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => void predictionQuery.refetch(),
						className: "press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold",
						children: t("retry")
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "card-surface hover-lift mt-4 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold",
					children: t("priceHistory")
				})]
			}), historyQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 flex items-center gap-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
					" ",
					t("loading")
				]
			}) : chart.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					points.length,
					" day",
					points.length === 1 ? "" : "s",
					" of prices recorded for this market so far."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-2 mt-4 h-48",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
						data: chart,
						margin: {
							top: 8,
							right: 12,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: "gp",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: "var(--color-primary)",
									stopOpacity: .45
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: "var(--color-primary)",
									stopOpacity: .02
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "label",
								tickLine: false,
								axisLine: false,
								tick: {
									fontSize: 10,
									fill: "var(--color-muted-foreground)"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								domain: ["dataMin - 80", "dataMax + 80"],
								hide: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									borderRadius: 14,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								},
								formatter: (v) => [inr(v), t("modalPrice")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								type: "monotone",
								dataKey: "price",
								stroke: "var(--color-primary)",
								strokeWidth: 3,
								fill: "url(#gp)"
							})
						]
					})
				})
			})]
		})]
	})] });
}
//#endregion
export { PredictPage as component };
