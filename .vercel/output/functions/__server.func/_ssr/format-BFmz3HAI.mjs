import { i as __toESM } from "../_runtime.mjs";
import { s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-BFmz3HAI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var IST_TIME_ZONE = "Asia/Kolkata";
var inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
/** dd MMM yyyy, hh:mm am/pm in IST */
function formatIstDateTime(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-IN", {
		timeZone: IST_TIME_ZONE,
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true
	}).format(date);
}
/** dd MMM yyyy in IST */
function formatIstDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-IN", {
		timeZone: IST_TIME_ZONE,
		day: "2-digit",
		month: "short",
		year: "numeric"
	}).format(date);
}
/**
* Open-Meteo returns local (IST) wall-clock strings without an offset, e.g.
* "2026-08-05T06:11". Anchor those to IST so they don't get read as UTC.
*/
function istDate(value) {
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return /* @__PURE__ */ new Date(`${value}+05:30`);
	return new Date(value);
}
/** hh:mm am/pm in IST */
function formatIstTime(value) {
	const date = istDate(value);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-IN", {
		timeZone: IST_TIME_ZONE,
		hour: "2-digit",
		minute: "2-digit",
		hour12: true
	}).format(date);
}
function formatIstWeekday(value) {
	const date = istDate(value);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-IN", {
		timeZone: IST_TIME_ZONE,
		weekday: "short"
	}).format(date);
}
/** dd MMM yyyy, weekday + live clock in IST, refreshed every second */
function useIstNow() {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	return {
		date: now,
		dateLabel: new Intl.DateTimeFormat("en-IN", {
			timeZone: IST_TIME_ZONE,
			weekday: "short",
			day: "2-digit",
			month: "short",
			year: "numeric"
		}).format(now),
		timeLabel: new Intl.DateTimeFormat("en-IN", {
			timeZone: IST_TIME_ZONE,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true
		}).format(now)
	};
}
//#endregion
export { inr as a, formatIstWeekday as i, formatIstDateTime as n, istDate as o, formatIstTime as r, useIstNow as s, formatIstDate as t };
