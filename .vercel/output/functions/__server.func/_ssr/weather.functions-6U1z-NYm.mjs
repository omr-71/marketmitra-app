import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { a as objectType, i as numberType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/weather.functions-6U1z-NYm.js
var schema = objectType({
	latitude: numberType().min(-90).max(90),
	longitude: numberType().min(-180).max(180)
});
var fetchWeather_createServerFn_handler = createServerRpc({
	id: "8c27b52882c645ff85a720428c1b94a08838c748839bcadc3cbfcce72200765c",
	name: "fetchWeather",
	filename: "src/lib/weather.functions.ts"
}, (opts) => fetchWeather.__executeServer(opts));
var fetchWeather = createServerFn({ method: "POST" }).inputValidator((data) => schema.parse(data)).handler(fetchWeather_createServerFn_handler, async ({ data }) => {
	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.searchParams.set("latitude", String(data.latitude));
	url.searchParams.set("longitude", String(data.longitude));
	url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,is_day,surface_pressure");
	url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max");
	url.searchParams.set("timezone", "Asia/Kolkata");
	url.searchParams.set("forecast_days", "7");
	try {
		const response = await fetch(url, {
			headers: { accept: "application/json" },
			signal: AbortSignal.timeout(1e4)
		});
		if (!response.ok) {
			console.error(`Open-Meteo failed [${response.status}]: ${(await response.text()).slice(0, 300)}`);
			return {
				ok: false,
				error: "The weather service is temporarily unavailable."
			};
		}
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
		console.error("Open-Meteo network error", error);
		return {
			ok: false,
			error: "Could not reach the weather service."
		};
	}
});
var geoSchema = objectType({
	latitude: numberType().min(-90).max(90),
	longitude: numberType().min(-180).max(180)
});
var reverseGeocode_createServerFn_handler = createServerRpc({
	id: "e021a3df3dfa54c232d803ab6ff9226fa83ccf341145df81f04b86b0868f24ca",
	name: "reverseGeocode",
	filename: "src/lib/weather.functions.ts"
}, (opts) => reverseGeocode.__executeServer(opts));
var reverseGeocode = createServerFn({ method: "POST" }).inputValidator((data) => geoSchema.parse(data)).handler(reverseGeocode_createServerFn_handler, async ({ data }) => {
	const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
	url.searchParams.set("latitude", String(data.latitude));
	url.searchParams.set("longitude", String(data.longitude));
	url.searchParams.set("localityLanguage", "en");
	try {
		const response = await fetch(url, { headers: { accept: "application/json" } });
		if (!response.ok) return null;
		const json = await response.json();
		const admin = json.localityInfo?.administrative ?? [];
		const district = admin.find((a) => a.adminLevel === 5)?.name ?? admin.find((a) => a.adminLevel === 6)?.name ?? json.city ?? "";
		return {
			name: json.locality || json.city || district,
			district: district.replace(/\s+district$/i, ""),
			state: json.principalSubdivision ?? ""
		};
	} catch (error) {
		console.error("reverse geocode failed", error);
		return null;
	}
});
//#endregion
export { fetchWeather_createServerFn_handler, reverseGeocode_createServerFn_handler };
