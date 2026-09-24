import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { p as fetchWeather } from "./router-5yV9beqj.mjs";
import { a as useReducedMotion } from "./app-shell-Cbiru3-8.mjs";
import { i as formatIstWeekday, o as istDate } from "./format-BFmz3HAI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/farm-insights-4cRAiZpl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Market Mitra animated numeric display.
*
* - Animates once when entering the viewport
* - Smoothly transitions when live data changes
* - Cancels previous animation frames
* - Respects reduced-motion preferences
* - Keeps the existing component API
*/
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, duration = 800, className = "", formatIndian = true }) {
	const [displayValue, setDisplayValue] = (0, import_react.useState)(value);
	const elementRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(null);
	const hasEnteredRef = (0, import_react.useRef)(false);
	const currentValueRef = (0, import_react.useRef)(value);
	const reducedMotion = useReducedMotion();
	const animateTo = (target, animationDuration, from) => {
		if (frameRef.current !== null) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}
		if (reducedMotion || animationDuration <= 0) {
			currentValueRef.current = target;
			setDisplayValue(target);
			return;
		}
		const start = from ?? currentValueRef.current;
		const difference = target - start;
		if (Math.abs(difference) < 1e-4) {
			currentValueRef.current = target;
			setDisplayValue(target);
			return;
		}
		const startTime = performance.now();
		const tick = (now) => {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / animationDuration, 1);
			const eased = 1 - Math.pow(1 - progress, 4);
			const nextValue = start + difference * eased;
			currentValueRef.current = nextValue;
			setDisplayValue(nextValue);
			if (progress < 1) frameRef.current = requestAnimationFrame(tick);
			else {
				currentValueRef.current = target;
				setDisplayValue(target);
				frameRef.current = null;
			}
		};
		frameRef.current = requestAnimationFrame(tick);
	};
	(0, import_react.useEffect)(() => {
		const node = elementRef.current;
		if (!node) return;
		if (reducedMotion) {
			currentValueRef.current = value;
			setDisplayValue(value);
			hasEnteredRef.current = true;
			return;
		}
		if (!("IntersectionObserver" in window)) {
			currentValueRef.current = value;
			setDisplayValue(value);
			hasEnteredRef.current = true;
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting || hasEnteredRef.current) return;
			hasEnteredRef.current = true;
			currentValueRef.current = 0;
			setDisplayValue(0);
			animateTo(value, duration, 0);
			observer.unobserve(node);
		}, { threshold: .1 });
		observer.observe(node);
		return () => {
			observer.disconnect();
		};
	}, [duration, reducedMotion]);
	(0, import_react.useEffect)(() => {
		if (!hasEnteredRef.current) return;
		if (reducedMotion) {
			currentValueRef.current = value;
			setDisplayValue(value);
			return;
		}
		if (Math.abs(currentValueRef.current - value) < 1e-4) return;
		animateTo(value, 380);
	}, [value, reducedMotion]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		};
	}, []);
	const formattedNumber = () => {
		if (decimals > 0) return displayValue.toFixed(decimals).toLocaleString("en-IN");
		return Math.round(displayValue).toLocaleString(formatIndian ? "en-IN" : void 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		ref: elementRef,
		className: `inline-block tabular-nums ${className}`,
		"aria-label": `${prefix}${value}${suffix}`,
		children: [
			prefix,
			formattedNumber(),
			suffix
		]
	});
}
function Shimmer({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `shimmer block rounded-xl ${className}` });
}
function CardSkeleton({ lines = 3 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface space-y-3 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "h-4 w-1/3" }), Array.from({ length: lines }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: `h-3 ${i % 2 ? "w-2/3" : "w-full"}` }, i))]
	});
}
function StatSkeleton({ count = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface space-y-2.5 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "h-3 w-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "h-6 w-3/4" })]
		}, i))
	});
}
function RowSkeleton({ rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2.5",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "size-10 rounded-2xl" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "h-3.5 w-2/5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "h-2.5 w-3/5" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shimmer, { className: "h-5 w-16" })
			]
		}, i))
	});
}
/**
* Open-Meteo is CORS-enabled and needs no key, so the request is made from the
* user's own browser. That keeps every farmer on their own rate-limit bucket
* instead of sharing one server IP (which returns HTTP 429 under load).
* If the browser request fails, we fall back to the server function.
*/
async function getWeather(latitude, longitude) {
	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.searchParams.set("latitude", String(latitude));
	url.searchParams.set("longitude", String(longitude));
	url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,is_day,surface_pressure");
	url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max");
	url.searchParams.set("timezone", "Asia/Kolkata");
	url.searchParams.set("forecast_days", "7");
	try {
		const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
		if (!response.ok) throw new Error(`open-meteo ${response.status}`);
		const json = await response.json();
		const num = (key) => Number(json.current[key] ?? 0);
		const days = json.daily.time.map((date, i) => ({
			date,
			max: Math.round(json.daily.temperature_2m_max[i] ?? 0),
			min: Math.round(json.daily.temperature_2m_min[i] ?? 0),
			rainChance: Math.round(json.daily.precipitation_probability_max[i] ?? 0),
			rainMm: Number((json.daily.precipitation_sum[i] ?? 0).toFixed(1)),
			code: json.daily.weather_code[i] ?? 0,
			uvIndex: Number((json.daily.uv_index_max[i] ?? 0).toFixed(1)),
			windMax: Math.round(json.daily.wind_speed_10m_max[i] ?? 0)
		}));
		return {
			ok: true,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			current: {
				temperature: Math.round(num("temperature_2m")),
				apparent: Math.round(num("apparent_temperature")),
				humidity: Math.round(num("relative_humidity_2m")),
				wind: Math.round(num("wind_speed_10m")),
				rainChance: Math.round(num("precipitation_probability")),
				code: num("weather_code"),
				isDay: num("is_day") === 1,
				pressure: Math.round(num("surface_pressure")),
				uvIndex: days[0]?.uvIndex ?? 0,
				precipitation: Number(num("precipitation").toFixed(1)),
				windGust: Math.round(num("wind_gusts_10m"))
			},
			observedAt: typeof json.current["time"] === "string" ? json.current["time"] : "",
			sunrise: json.daily.sunrise[0] ?? "",
			sunset: json.daily.sunset[0] ?? "",
			days,
			source: "Open-Meteo"
		};
	} catch (error) {
		console.warn("browser weather fetch failed, retrying on the server", error);
		try {
			return await fetchWeather({ data: {
				latitude,
				longitude
			} });
		} catch {
			return {
				ok: false,
				error: "Could not reach the weather service. Please try again."
			};
		}
	}
}
function conditionLabel(code) {
	if (code === 0) return "Clear sky";
	if (code <= 2) return "Mainly clear";
	if (code === 3) return "Overcast";
	if (code <= 48) return "Fog";
	if (code <= 57) return "Drizzle";
	if (code <= 67) return "Rain";
	if (code <= 77) return "Snow";
	if (code <= 82) return "Rain showers";
	if (code <= 86) return "Snow showers";
	return "Thunderstorm";
}
function uvLabel(uv) {
	if (uv < 3) return "Low";
	if (uv < 6) return "Moderate";
	if (uv < 8) return "High";
	if (uv < 11) return "Very high";
	return "Extreme";
}
/** Which part of today suits field work, derived from real sunrise/sunset and conditions. */
function bestFarmingWindow(data) {
	const sunrise = istDate(data.sunrise);
	const sunset = istDate(data.sunset);
	const fmt = (d, addHours) => new Intl.DateTimeFormat("en-IN", {
		timeZone: "Asia/Kolkata",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true
	}).format(new Date(d.getTime() + addHours * 36e5));
	const today = data.days[0];
	const hot = (today?.max ?? 0) >= 36;
	if ((today?.rainChance ?? 0) >= 60) return {
		window: `${fmt(sunrise, 0)} – ${fmt(sunrise, 3)}`,
		reason: "Rain is likely later today, so finish field work in the early morning window."
	};
	if (hot || data.current.uvIndex >= 8) return {
		window: `${fmt(sunrise, 0)} – ${fmt(sunrise, 3.5)} · ${fmt(sunset, -2.5)} – ${fmt(sunset, 0)}`,
		reason: "Strong midday heat and UV — work early morning and late afternoon."
	};
	return {
		window: `${fmt(sunrise, .5)} – ${fmt(sunrise, 5)}`,
		reason: "Mild conditions with low rain risk — a long, comfortable working window."
	};
}
/** One-line insight about today's weather, always from live values. */
function todayInsight(data) {
	const today = data.days[0];
	if (!today) return conditionLabel(data.current.code);
	if (today.rainChance >= 60) return `${today.rainChance}% chance of rain with up to ${today.rainMm} mm — keep harvested stock covered and delay spraying.`;
	if (today.max >= 38) return `Peaking at ${today.max}° — irrigate before sunrise to cut evaporation loss.`;
	if (data.current.humidity >= 80) return `Humidity at ${data.current.humidity}% slows drying and raises fungal risk — improve airflow in storage.`;
	if (data.current.wind >= 25) return `Winds around ${data.current.wind} km/h — postpone spraying to avoid drift.`;
	return `${conditionLabel(data.current.code)} at ${data.current.temperature}° with ${today.rainChance}% rain chance — good conditions for harvesting and transport.`;
}
function farmingTips(data) {
	const tips = [];
	const today = data.days[0];
	const wind = Math.max(data.current.wind, data.current.windGust);
	if (today && today.rainMm >= 10) tips.push(`About ${today.rainMm} mm rain expected today — hold back irrigation and let the field drain before working it.`);
	else if (today && today.rainChance >= 50) tips.push(`${today.rainChance}% rain chance — cover drying yards and bagged produce, and finish field work early.`);
	if (wind >= 20) tips.push(`Wind up to ${wind} km/h can carry spray off target — postpone spraying and follow the product label for wind limits.`);
	if (data.current.humidity >= 80) tips.push(`Humidity ${data.current.humidity}% with slow drying favours fungal disease — improve airflow, scout the crop, and confirm any diagnosis before treating.`);
	if (data.current.uvIndex >= 8) tips.push(`UV index ${data.current.uvIndex} — schedule labour work outside 11am–3pm.`);
	if (today && today.max >= 38) tips.push(`Peak ${today.max}° — irrigate before sunrise or after sunset to cut evaporation loss.`);
	if (data.current.pressure && data.current.pressure < 1e3) tips.push("Air pressure is low, which often precedes unsettled weather — plan mandi trips earlier.");
	if (tips.length === 0) tips.push(`${conditionLabel(data.current.code)} at ${data.current.temperature}° with ${today?.rainChance ?? 0}% rain chance — normal field work, spraying and mandi transport are all workable today.`);
	return tips.slice(0, 4);
}
function harvestAdvice(days) {
	const advice = [];
	const dry = days.filter((d) => d.rainChance < 25);
	const wet = days.filter((d) => d.rainChance >= 60);
	const hot = days.filter((d) => d.max >= 38);
	if (dry.length > 0) advice.push(`Dry window on ${dry.slice(0, 3).map((d) => formatIstWeekday(d.date)).join(", ")} — best for harvesting and drying.`);
	if (wet.length > 0) advice.push(`Avoid open-yard drying on ${wet.map((d) => formatIstWeekday(d.date)).join(", ")}; rainfall up to ${Math.max(...wet.map((d) => d.rainMm))} mm expected.`);
	if (hot.length > 0) advice.push(`Heat above 38° on ${hot.map((d) => formatIstWeekday(d.date)).join(", ")} — irrigate early morning.`);
	if (advice.length === 0) advice.push("Conditions are stable through the week — normal field operations can continue.");
	return advice;
}
//#endregion
export { bestFarmingWindow as a, getWeather as c, uvLabel as d, StatSkeleton as i, harvestAdvice as l, CardSkeleton as n, conditionLabel as o, RowSkeleton as r, farmingTips as s, AnimatedNumber as t, todayInsight as u };
