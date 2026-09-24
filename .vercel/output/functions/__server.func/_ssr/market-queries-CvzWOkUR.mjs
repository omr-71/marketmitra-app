import { o as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { n as getMarketStatus, t as getMarketPrices } from "./market-prices.functions-DrkprgBp.mjs";
import { t as formatIstDate } from "./format-BFmz3HAI.mjs";
import { n as freshnessTone } from "./market-freshness-C3Wz6gg0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-queries-CvzWOkUR.js
var import_jsx_runtime = require_jsx_runtime();
/** Trust badge — always derived from the real reporting date, never guessed. */
function FreshnessBadge({ freshness, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${freshnessTone[freshness.level]} ${className}`,
		children: freshness.label
	});
}
/**
* Farmer-facing update line for an aggregated result. Shows the official
* reporting date only — provider/source names stay internal.
*/
function DataProvenance({ result, priceDate, className = "" }) {
	const date = priceDate || result.latestDate;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `space-y-1 text-[11px] leading-relaxed text-muted-foreground ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: date ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Market data date: ", formatIstDate(date)] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "No market data date available" }) }), result.archive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-semibold text-amber-600 dark:text-amber-400",
			children: "Last stored official record — this is not today's price."
		})]
	});
}
function UnavailableState({ onRetry, message = "No official market record is available for this crop and location right now." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-bold",
				children: "Market data unavailable"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted-foreground",
				children: [message, " MarketMitra never shows an estimated or generated price."]
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onRetry,
				className: "press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold",
				children: "Try again"
			})
		]
	});
}
/**
* One shared query definition so Home, Markets, Market details and any other
* consumer of the same crop/state hit a single in-flight request instead of
* duplicating calls to the government API.
*/
function marketPricesQuery(filters) {
	const enabled = Boolean(filters.commodity && filters.state && filters.district);
	return queryOptions({
		queryKey: [
			"market-prices",
			filters.commodity ?? "",
			filters.state ?? "",
			filters.district ?? "",
			filters.market ?? ""
		],
		enabled,
		staleTime: 9e5,
		gcTime: 36e5,
		retry: 1,
		queryFn: () => getMarketPrices({ data: {
			commodity: filters.commodity ?? "",
			state: filters.state ?? "",
			...filters.district ? { district: filters.district } : {},
			...filters.market ? { market: filters.market } : {}
		} })
	});
}
queryOptions({
	queryKey: ["market-status"],
	staleTime: 3e5,
	retry: false,
	queryFn: () => getMarketStatus()
});
/** Latest official record per mandi, newest reporting date first. */
function latestPerMarket(records) {
	const byMarket = /* @__PURE__ */ new Map();
	for (const record of records) {
		const existing = byMarket.get(record.market);
		if (!existing || existing.date < record.date) byMarket.set(record.market, record);
	}
	return [...byMarket.values()].sort((a, b) => a.date === b.date ? b.modalPrice - a.modalPrice : a.date < b.date ? 1 : -1);
}
//#endregion
export { marketPricesQuery as a, latestPerMarket as i, FreshnessBadge as n, UnavailableState as r, DataProvenance as t };
