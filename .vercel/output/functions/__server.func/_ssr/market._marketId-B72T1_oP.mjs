import { o as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as useLang, a as Route$1, l as crops, m as findCrop } from "./router-5yV9beqj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { Vt as ChartColumn, h as TrendingUp, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { a as inr, t as formatIstDate } from "./format-BFmz3HAI.mjs";
import { a as marketPricesQuery, r as UnavailableState, t as DataProvenance } from "./market-queries-CvzWOkUR.mjs";
import { t as fetchPriceHistory } from "./market.functions-CoEK8MS1.mjs";
import { c as Tooltip, i as XAxis, n as BarChart, o as Bar, s as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market._marketId-B72T1_oP.js
var import_jsx_runtime = require_jsx_runtime();
function MarketDetailPage() {
	const { t, lang } = useLang();
	const { marketId } = Route$1.useParams();
	const { crop: cropId, state, district } = Route$1.useSearch();
	const crop = findCrop(cropId) ?? crops[0];
	const todayQuery = useQuery(marketPricesQuery({
		commodity: crop.commodity,
		state,
		district,
		market: marketId
	}));
	const historyQuery = useQuery({
		queryKey: [
			"history",
			crop.commodity,
			state,
			marketId
		],
		queryFn: () => fetchPriceHistory({ data: {
			commodity: crop.commodity,
			state,
			market: marketId
		} }),
		staleTime: 6e5
	});
	const latest = todayQuery.data?.records[0];
	const points = historyQuery.data?.points ?? [];
	const chartData = points.slice(-14).map((p) => ({
		label: formatIstDate(p.date).slice(0, 6),
		price: p.modal
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: marketId,
		subtitle: `${crop.name[lang]} · ${state}`,
		back: "/crops"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pt-5",
		children: [
			todayQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-surface hover-lift flex items-center gap-2 p-5 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }),
					" ",
					t("loading")
				]
			}) : todayQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnavailableState, {
				onRetry: () => void todayQuery.refetch(),
				message: "The latest official price could not be loaded."
			}) : latest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-surface hover-lift p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-wide text-primary",
						children: t("modalPrice")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-3xl font-extrabold",
						children: inr(latest.modalPrice)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							t("perQuintal"),
							" · ",
							latest.variety ?? crop.name[lang]
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-3 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-extrabold",
							children: inr(latest.minPrice)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: t("minPrice")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-extrabold",
							children: inr(latest.maxPrice)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: t("maxPrice")
						})] })]
					}),
					todayQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataProvenance, {
						result: todayQuery.data,
						priceDate: latest.date,
						className: "mt-3"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "card-surface hover-lift p-5 text-sm text-muted-foreground",
				children: t("noPrices")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
				}) : chartData.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: [
						"History builds up as this mandi reports prices. ",
						points.length,
						" day",
						points.length === 1 ? "" : "s",
						" recorded so far."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "-mx-2 mt-4 h-44",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chartData,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tickLine: false,
									axisLine: false,
									tick: {
										fontSize: 10,
										fill: "var(--color-muted-foreground)"
									}
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "price",
									radius: [
										8,
										8,
										0,
										0
									],
									fill: "var(--color-primary)"
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/predict",
				search: {
					crop: crop.id,
					market: marketId,
					state
				},
				className: "press grad-primary mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-primary-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5" }),
					" ",
					t("pricePrediction")
				]
			})
		]
	})] });
}
//#endregion
export { MarketDetailPage as component };
