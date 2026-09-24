//#region node_modules/.nitro/vite/services/ssr/assets/market-freshness-C3Wz6gg0.js
/** Today's date in Indian Standard Time as yyyy-MM-dd. */
function istToday(now = /* @__PURE__ */ new Date()) {
	return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}
function daysBetween(fromIso, toIso) {
	const a = Date.parse(`${fromIso}T00:00:00Z`);
	const b = Date.parse(`${toIso}T00:00:00Z`);
	if (Number.isNaN(a) || Number.isNaN(b)) return null;
	return Math.round((b - a) / 864e5);
}
/** True only for an official report dated today or yesterday in India time. */
function isCurrentMarketDate(dataDate, now = /* @__PURE__ */ new Date()) {
	const ageDays = daysBetween(dataDate, istToday(now));
	return ageDays === 0 || ageDays === 1;
}
function computeFreshness(input) {
	const today = istToday(input.now);
	if (!input.dataDate) return {
		level: "unavailable",
		label: "UNAVAILABLE",
		ageDays: null
	};
	const ageDays = daysBetween(input.dataDate, today);
	if (ageDays == null) return {
		level: "unavailable",
		label: "UNAVAILABLE",
		ageDays: null
	};
	if (ageDays === 0) return {
		level: "today",
		label: "UPDATED TODAY",
		ageDays: 0
	};
	if (ageDays === 1) return {
		level: "yesterday",
		label: "YESTERDAY'S DATA",
		ageDays: 1
	};
	return {
		level: "unavailable",
		label: "UNAVAILABLE",
		ageDays
	};
}
var freshnessTone = {
	today: "bg-primary/10 text-primary ring-primary/20",
	yesterday: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
	unavailable: "bg-muted text-muted-foreground ring-border"
};
//#endregion
export { istToday as i, freshnessTone as n, isCurrentMarketDate as r, computeFreshness as t };
