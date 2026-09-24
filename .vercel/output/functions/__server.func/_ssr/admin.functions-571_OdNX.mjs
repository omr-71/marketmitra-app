import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { a as objectType, n as booleanType, o as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-571_OdNX.js
async function assertAdmin(supabase, userId) {
	const { data, error } = await supabase.rpc("has_role", {
		_user_id: userId,
		_role: "admin"
	});
	if (error || data !== true) throw new Error("Forbidden");
}
function bucket(rows, limit = 8) {
	const map = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const key = row.key?.trim();
		if (!key) continue;
		map.set(key, (map.get(key) ?? 0) + 1);
	}
	return [...map.entries()].map(([key, count]) => ({
		key,
		count
	})).sort((a, b) => b.count - a.count).slice(0, limit);
}
async function probe(name, url, detailOk) {
	const started = Date.now();
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(8e3) });
		return {
			name,
			ok: res.ok,
			status: res.status,
			latencyMs: Date.now() - started,
			detail: res.ok ? detailOk : `Upstream responded ${res.status}`
		};
	} catch {
		return {
			name,
			ok: false,
			status: null,
			latencyMs: Date.now() - started,
			detail: "Request failed or timed out"
		};
	}
}
/**
* Check whether the signed-in user is an administrator.
*/
var amIAdmin_createServerFn_handler = createServerRpc({
	id: "2b97112c91f9366ddeba9c0a0772794613596207065806955c5ef8594bbf3232",
	name: "amIAdmin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => amIAdmin.__executeServer(opts));
var amIAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(amIAdmin_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	return { admin: data === true };
});
var getAdminOverview_createServerFn_handler = createServerRpc({
	id: "98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01",
	name: "getAdminOverview",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
var getAdminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminOverview_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.supabase, context.userId);
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const since = /* @__PURE__ */ new Date(Date.now() - 2592e6);
	const [{ data: events }, { count: profiles }] = await Promise.all([supabaseAdmin.from("analytics_events").select("event,page,label,device,lang,session_id,created_at").gte("created_at", since.toISOString()).order("created_at", { ascending: false }).limit(2e4), supabaseAdmin.from("profiles").select("id", {
		count: "exact",
		head: true
	})]);
	const rows = events ?? [];
	const dayMap = /* @__PURE__ */ new Map();
	for (const r of rows) {
		const day = (r.created_at ?? "").slice(0, 10);
		if (day) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
	}
	const daily = [...dayMap.entries()].map(([day, count]) => ({
		day,
		count
	})).sort((a, b) => a.day.localeCompare(b.day));
	const cutoff = Date.now() - 864e5;
	const countOf = (event) => rows.filter((r) => r.event === event).length;
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		tracking: {
			since: since.toISOString(),
			totalEvents: rows.length,
			sessions: new Set(rows.map((r) => r.session_id).filter(Boolean)).size,
			sessions24h: new Set(rows.filter((r) => new Date(r.created_at ?? 0).getTime() >= cutoff).map((r) => r.session_id).filter(Boolean)).size,
			pageViews: countOf("page_view"),
			eventsByType: bucket(rows.map((r) => ({ key: r.event })), 14),
			topPages: bucket(rows.filter((r) => r.event === "page_view").map((r) => ({ key: r.page }))),
			topCrops: bucket(rows.filter((r) => r.event === "crop_selected").map((r) => ({ key: r.label }))),
			devices: bucket(rows.map((r) => ({ key: r.device })), 6),
			languages: bucket(rows.map((r) => ({ key: r.lang })), 6),
			daily,
			recent: rows.slice(0, 25).map((r) => ({
				event: r.event,
				page: r.page ?? null,
				label: r.label ?? null,
				at: r.created_at
			})),
			features: {
				marketSearches: countOf("market_search"),
				weatherLookups: countOf("weather_lookup"),
				diagnoseStarted: countOf("diagnose_started"),
				diagnoseCompleted: countOf("diagnose_completed"),
				diagnoseFailed: countOf("diagnose_failed"),
				mitraConversations: countOf("mitra_ai_opened"),
				mitraMessages: countOf("mitra_ai_message"),
				mitraErrors: countOf("mitra_ai_error"),
				schemeViews: countOf("scheme_viewed")
			}
		},
		users: { profiles: profiles ?? 0 }
	};
});
var getAdminHealth_createServerFn_handler = createServerRpc({
	id: "5944aa3e3ccb9ff594d941b2448e1a2ecafc905fe7a309b706c082e8fea6a10a",
	name: "getAdminHealth",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminHealth.__executeServer(opts));
var getAdminHealth = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminHealth_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.supabase, context.userId);
	const weatherApiKey = process.env["WEATHERAPI_KEY"];
	const weatherUrl = weatherApiKey ? `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(weatherApiKey)}&q=19.99,73.79&aqi=no` : null;
	const dataGovKey = process.env["DATA_GOV_IN_API_KEY"];
	const marketUrl = dataGovKey ? `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${encodeURIComponent(dataGovKey)}&format=json&limit=1&sort%5BArrival_Date%5D=desc` : null;
	const [weather, aiGateway, marketProbe] = await Promise.all([
		weatherUrl ? probe("WeatherAPI.com weather", weatherUrl, "Live WeatherAPI.com weather reachable") : Promise.resolve({
			name: "WeatherAPI.com weather",
			ok: false,
			status: null,
			latencyMs: null,
			detail: "WeatherAPI key is not configured"
		}),
		probe("Lovable AI gateway", "https://ai.gateway.lovable.dev/v1/models", "Gateway reachable"),
		marketUrl ? probe("AGMARKNET market data", marketUrl, "Government market data reachable") : Promise.resolve({
			name: "AGMARKNET market data",
			ok: false,
			status: null,
			latencyMs: null,
			detail: "Market data key is not configured"
		})
	]);
	let marketData = {
		source: "AGMARKNET · data.gov.in",
		ok: false,
		records: null,
		latestArrivalDate: null,
		sourceUpdatedAt: null,
		detail: marketUrl ? "Could not read the latest record" : "Market data key is not configured"
	};
	if (marketUrl && marketProbe.ok) try {
		const json = await (await fetch(marketUrl, { signal: AbortSignal.timeout(8e3) })).json();
		const rec = json.records?.[0];
		marketData = {
			source: "AGMARKNET · data.gov.in",
			ok: true,
			records: typeof json.total === "number" ? json.total : null,
			latestArrivalDate: rec?.arrival_date ?? rec?.Arrival_Date ?? null,
			sourceUpdatedAt: json.updated_date ?? null,
			detail: "Latest record read directly from the government dataset"
		};
	} catch {}
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		services: [
			weather,
			aiGateway,
			marketProbe
		],
		marketData
	};
});
var getAdminFeatureFlags_createServerFn_handler = createServerRpc({
	id: "f8e1cf338e299e7cb3e0fa5203215998dd49c1493c730b6db12ac7c8129cb95a",
	name: "getAdminFeatureFlags",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminFeatureFlags.__executeServer(opts));
var getAdminFeatureFlags = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminFeatureFlags_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.supabase, context.userId);
	const { data, error } = await context.supabase.from("feature_flags").select("key,label,enabled,status,reason,maintenance_message,updated_at").order("label");
	if (error) throw new Error("Could not load feature switches");
	return data ?? [];
});
var setFeatureFlag_createServerFn_handler = createServerRpc({
	id: "cd91837fdccd103768260bacbee75de8f2fa6250ae92bb672362a19dc52557d1",
	name: "setFeatureFlag",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setFeatureFlag.__executeServer(opts));
var setFeatureFlag = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	key: stringType().min(1).max(64),
	enabled: booleanType(),
	message: stringType().max(400).nullable().optional(),
	reason: stringType().max(120).nullable().optional()
}).parse(input)).handler(setFeatureFlag_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.supabase, context.userId);
	const { error } = await context.supabase.from("feature_flags").update({
		enabled: data.enabled,
		status: data.enabled ? "operational" : "maintenance",
		reason: data.enabled ? null : data.reason ?? null,
		maintenance_message: data.enabled ? null : data.message ?? null,
		updated_by: context.userId
	}).eq("key", data.key);
	if (error) throw new Error("Could not update the feature switch");
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	await supabaseAdmin.from("admin_audit_log").insert({
		admin_id: context.userId,
		action: data.enabled ? "feature_enabled" : "feature_disabled",
		detail: {
			key: data.key,
			reason: data.reason ?? null,
			message: data.message ?? null
		}
	});
	return { ok: true };
});
var getAdminAuditLog_createServerFn_handler = createServerRpc({
	id: "506b7d621d4a698462a6f4bd14ccd5e34ad849c50db6ac21d4d807f9b9861a2a",
	name: "getAdminAuditLog",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminAuditLog.__executeServer(opts));
var getAdminAuditLog = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminAuditLog_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.supabase, context.userId);
	const { data } = await context.supabase.from("admin_audit_log").select("id,action,detail,created_at").order("created_at", { ascending: false }).limit(30);
	return data ?? [];
});
//#endregion
export { amIAdmin_createServerFn_handler, getAdminAuditLog_createServerFn_handler, getAdminFeatureFlags_createServerFn_handler, getAdminHealth_createServerFn_handler, getAdminOverview_createServerFn_handler, setFeatureFlag_createServerFn_handler };
