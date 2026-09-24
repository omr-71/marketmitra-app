import { i as istToday, r as isCurrentMarketDate, t as computeFreshness } from "./market-freshness-C3Wz6gg0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-providers.server-B2CX61LM.js
/**
* Market price provider abstraction.
*
* Every provider returns the SAME normalized record shape, so the frontend and
* Mitra AI never care which source answered. Providers are tried in priority
* order; each attempt is logged for admin diagnostics. Nothing here ever
* invents, averages across dates, or synthesises a price.
*/
function pick(row, ...keys) {
	const normalized = /* @__PURE__ */ new Map();
	for (const [k, v] of Object.entries(row)) normalized.set(k.toLowerCase().replace(/[^a-z]/g, ""), v);
	for (const key of keys) {
		const value = normalized.get(key.toLowerCase().replace(/[^a-z]/g, ""));
		if (value !== void 0 && value !== null && String(value).trim() !== "") return String(value).trim();
	}
	return "";
}
/** data.gov.in returns dd/MM/yyyy for arrival dates. */
function toIsoDate(value) {
	const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
	return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
}
function datasetUpdatedAt(payload) {
	if (payload.updated_date) {
		const parsed = new Date(payload.updated_date);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
	}
	if (typeof payload.updated === "number") return (/* @__PURE__ */ new Date(payload.updated * 1e3)).toISOString();
	return null;
}
var normalizedName = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
var DISTRICT_ALIASES = [
	["Nashik", "Nasik"],
	[
		"Chhatrapati Sambhajinagar",
		"Chattrapati Sambhajinagar",
		"Aurangabad"
	],
	["Ahilyanagar", "Ahmednagar"],
	["Dharashiv", "Osmanabad"],
	["Gurugram", "Gurgaon"],
	["Prayagraj", "Allahabad"],
	["Ayodhya", "Faizabad"],
	[
		"Bengaluru Urban",
		"Bangalore Urban",
		"Bangalore"
	],
	["Mysuru", "Mysore"],
	["Belagavi", "Belgaum"],
	["Kalaburagi", "Gulbarga"],
	["Vijayapura", "Bijapur"],
	["Ballari", "Bellary"],
	["Shivamogga", "Shimoga"],
	["Tumakuru", "Tumkur"]
];
function titleCase(value) {
	return value.trim().toLowerCase().replace(/(^|[\s()-])\p{L}/gu, (letter) => letter.toUpperCase());
}
function districtVariants(value) {
	const normalized = normalizedName(value);
	const aliases = DISTRICT_ALIASES.find((group) => group.some((candidate) => normalizedName(candidate) === normalized));
	return [.../* @__PURE__ */ new Set([titleCase(value), ...aliases ?? []])];
}
var looseEq = (a, b) => normalizedName(a) === normalizedName(b);
function districtEq(a, b) {
	return districtVariants(b).map(normalizedName).includes(normalizedName(a));
}
/** Rejects malformed / impossible rows so bad upstream data can never render. */
function isValid(record) {
	return Boolean(record.market) && Boolean(record.date) && Number.isFinite(record.minPrice) && Number.isFinite(record.maxPrice) && Number.isFinite(record.modalPrice) && record.modalPrice > 0 && record.minPrice >= 0 && record.maxPrice >= record.minPrice && record.modalPrice <= record.maxPrice * 1.5;
}
/** Re-check every normalized row, even when an upstream API claims it applied filters. */
function matchesMarketFilters(record, filters) {
	return looseEq(record.commodity, filters.commodity) && looseEq(record.state, filters.state) && (!filters.district || districtEq(record.district, filters.district)) && (!filters.market || looseEq(record.market, filters.market));
}
function currentMarketRecords(records, filters, now = /* @__PURE__ */ new Date()) {
	return dedupe(sortRecords(records.filter((record) => isValid(record) && matchesMarketFilters(record, filters) && isCurrentMarketDate(record.date, now))));
}
/** Newest reporting date first, then highest modal price. */
function sortRecords(records) {
	return [...records].sort((a, b) => a.date === b.date ? b.modalPrice - a.modalPrice : a.date < b.date ? 1 : -1);
}
/** Drops exact duplicates reported by the same source for the same day. */
function dedupe(records) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const r of records) {
		const key = [
			r.providerId,
			r.market,
			r.district,
			r.variety,
			r.grade,
			r.date,
			r.modalPrice
		].join("|");
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(r);
	}
	return out;
}
function normalizeRows(rows, meta) {
	return dedupe(sortRecords(rows.map((row) => {
		const arrival = Number(pick(row, "arrivals", "arrival", "tonnes"));
		return {
			providerId: meta.providerId,
			source: meta.source,
			commodity: pick(row, "commodity"),
			variety: pick(row, "variety") || null,
			grade: pick(row, "grade") || null,
			state: pick(row, "state"),
			district: pick(row, "district"),
			market: pick(row, "market"),
			date: toIsoDate(pick(row, "arrival_date", "arrivaldate", "date")),
			arrival: Number.isFinite(arrival) && arrival > 0 ? arrival : null,
			minPrice: Number(pick(row, "min_price", "minprice")),
			maxPrice: Number(pick(row, "max_price", "maxprice")),
			modalPrice: Number(pick(row, "modal_price", "modalprice")),
			currency: "INR",
			fetchedAt: meta.fetchedAt,
			sourceUpdatedAt: meta.sourceUpdatedAt
		};
	}).filter(isValid)));
}
async function getJson(url) {
	const response = await fetch(url, {
		headers: { accept: "application/json" },
		signal: AbortSignal.timeout(9e3)
	});
	if (!response.ok) {
		const body = await response.text().catch(() => "");
		const error = /* @__PURE__ */ new Error(`HTTP ${response.status}`);
		error.statusCode = response.status;
		console.error(`[market] ${url.host} failed ${response.status}: ${body.slice(0, 300)}`);
		throw error;
	}
	return {
		payload: await response.json(),
		statusCode: response.status
	};
}
/**
* PRIMARY — "Variety-wise Daily Market Prices Data of Commodity" (AGMARKNET).
* The dataset is the full archive and its natural order is by market, NOT by
* date, so `sort[Arrival_Date]=desc` is mandatory or years-old rows come back.
*/
var AGMARKNET_VARIETY = "35985678-0d79-46b4-9ed6-6f13308a1d24";
/** SECONDARY — "Current Daily Price of Various Commodities from Various Markets". */
var AGMARKNET_DAILY = "9ef84268-d588-465a-a308-a864a43d0070";
var agmarknetVariety = {
	id: "agmarknet_variety",
	name: "AGMARKNET · Variety-wise daily prices (data.gov.in)",
	priority: 1,
	envKey: "DATA_GOV_IN_API_KEY",
	coverage: "All states · full mandi archive · daily",
	archive: false,
	async fetch(filters) {
		const apiKey = process.env["DATA_GOV_IN_API_KEY"];
		if (!apiKey) throw new Error("missing_api_key");
		const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
		const request = async (f, arrivalDate, limit = 250) => {
			const url = new URL(`https://api.data.gov.in/resource/${AGMARKNET_VARIETY}`);
			url.searchParams.set("api-key", apiKey);
			url.searchParams.set("format", "json");
			url.searchParams.set("limit", String(limit));
			url.searchParams.set("sort[Arrival_Date]", "desc");
			url.searchParams.set("filters[Commodity]", titleCase(f.commodity));
			url.searchParams.set("filters[State]", titleCase(f.state));
			if (f.district) url.searchParams.set("filters[District]", titleCase(f.district));
			if (f.market) url.searchParams.set("filters[Market]", titleCase(f.market));
			if (arrivalDate) url.searchParams.set("filters[Arrival_Date]", arrivalDate);
			return getJson(url);
		};
		const districtAttempts = filters.district ? districtVariants(filters.district) : [void 0];
		let payload = null;
		let statusCode = null;
		let rows = [];
		for (const district of districtAttempts) {
			const response = await request({
				...filters,
				...district ? { district } : {}
			});
			payload = response.payload;
			statusCode = response.statusCode;
			rows = payload.records ?? [];
			if (rows.length > 0) break;
		}
		if (rows.length === 0 && filters.district) {
			const today = istToday();
			const yesterdayDate = /* @__PURE__ */ new Date(`${today}T00:00:00Z`);
			yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
			const toDmy = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
			const fallbackFilters = {
				commodity: filters.commodity,
				state: filters.state
			};
			const fallback = await Promise.all([request(fallbackFilters, toDmy(today), 5e3), request(fallbackFilters, toDmy(yesterdayDate.toISOString().slice(0, 10)), 5e3)]);
			payload = fallback[0]?.payload ?? fallback[1]?.payload ?? null;
			statusCode = fallback.find((response) => response.statusCode)?.statusCode ?? statusCode;
			rows = fallback.flatMap((response) => response.payload.records ?? []);
		}
		const sourceUpdatedAt = datasetUpdatedAt(payload ?? {});
		return {
			records: normalizeRows(rows, {
				providerId: this.id,
				source: "AGMARKNET · Government of India",
				sourceUpdatedAt,
				fetchedAt
			}),
			sourceUpdatedAt,
			statusCode
		};
	}
};
var agmarknetDaily = {
	id: "agmarknet_daily",
	name: "AGMARKNET · Current daily mandi prices (data.gov.in)",
	priority: 2,
	envKey: "DATA_GOV_IN_API_KEY",
	coverage: "Today's published snapshot · matched in memory",
	archive: false,
	async fetch(filters) {
		const apiKey = process.env["DATA_GOV_IN_API_KEY"];
		if (!apiKey) throw new Error("missing_api_key");
		const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
		const url = new URL(`https://api.data.gov.in/resource/${AGMARKNET_DAILY}`);
		url.searchParams.set("api-key", apiKey);
		url.searchParams.set("format", "json");
		url.searchParams.set("limit", "5000");
		const { payload, statusCode } = await getJson(url);
		const rows = (payload.records ?? []).filter((row) => looseEq(pick(row, "commodity"), filters.commodity) && looseEq(pick(row, "state"), filters.state) && (!filters.district || districtEq(pick(row, "district"), filters.district)) && (!filters.market || looseEq(pick(row, "market"), filters.market)));
		const sourceUpdatedAt = datasetUpdatedAt(payload);
		return {
			records: normalizeRows(rows, {
				providerId: this.id,
				source: "AGMARKNET daily snapshot · Government of India",
				sourceUpdatedAt,
				fetchedAt
			}),
			sourceUpdatedAt,
			statusCode
		};
	}
};
/**
* LAST RESORT — officially reported records MarketMitra already stored. Flagged
* as an archive so the UI always labels it "last available data", never today's.
*/
var storedArchive = {
	id: "marketmitra_archive",
	name: "MarketMitra archive of official AGMARKNET records",
	priority: 9,
	envKey: null,
	coverage: "Previously fetched official records only",
	archive: true,
	async fetch(filters) {
		const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
		const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
		let query = supabaseAdmin.from("market_prices").select("commodity, variety, state, district, market, min_price, max_price, modal_price, arrival_date").eq("commodity", filters.commodity).eq("state", filters.state).gte("arrival_date", (() => {
			const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(/* @__PURE__ */ new Date());
			const yesterday = /* @__PURE__ */ new Date(`${today}T00:00:00Z`);
			yesterday.setUTCDate(yesterday.getUTCDate() - 1);
			return yesterday.toISOString().slice(0, 10);
		})()).lte("arrival_date", new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(/* @__PURE__ */ new Date())).order("arrival_date", { ascending: false }).limit(250);
		if (filters.district) query = query.eq("district", filters.district);
		if (filters.market) query = query.eq("market", filters.market);
		const { data, error } = await query;
		if (error) throw new Error(error.message);
		return {
			records: normalizeRows(data ?? [], {
				providerId: this.id,
				source: "AGMARKNET (last stored official record)",
				sourceUpdatedAt: null,
				fetchedAt
			}),
			sourceUpdatedAt: null,
			statusCode: null
		};
	}
};
var providers = [
	agmarknetVariety,
	agmarknetDaily,
	storedArchive
].sort((a, b) => a.priority - b.priority);
function providerCatalogue() {
	return [...providers.map((p) => ({
		id: p.id,
		name: p.name,
		priority: p.priority,
		coverage: p.coverage,
		archive: p.archive,
		requiresKey: Boolean(p.envKey),
		configured: p.envKey ? Boolean(process.env[p.envKey]) : true
	})), {
		id: CEDA_ID,
		name: "CEDA Agmarknet open research API (state-level cross-check)",
		priority: 5,
		coverage: "State-level daily averages · used only to cross-check prices",
		archive: true,
		requiresKey: false,
		configured: true
	}];
}
/**
* CEDA (Centre for Economic Data & Analysis, Ashoka University) publishes an
* open, keyless API over the same official AGMARKNET reporting, aggregated to
* state-level daily averages. It is NOT per-mandi and it lags the portal, so it
* is never shown as a price — it is used purely to sanity-check the mandi
* numbers we do show and to flag source disagreement.
*/
var CEDA_ID = "ceda_agmarknet";
var CEDA_BASE = "https://agmarknet.ceda.ashoka.edu.in/api";
var cedaLookup = null;
async function loadCedaLookup() {
	if (cedaLookup && Date.now() - cedaLookup.at < 216e5) return cedaLookup.value;
	const [statesRes, commoditiesRes] = await Promise.all([fetch(`${CEDA_BASE}/states`, { headers: { accept: "application/json" } }), fetch(`${CEDA_BASE}/commodities`, { headers: { accept: "application/json" } })]);
	if (!statesRes.ok || !commoditiesRes.ok) throw new Error("ceda_lookup_failed");
	const states = await statesRes.json();
	const commodities = await commoditiesRes.json();
	const value = {
		states: (states.data ?? []).map((s) => ({
			id: s.census_state_id,
			name: s.census_state_name
		})),
		commodities: (commodities.data ?? []).map((c) => ({
			id: c.commodity_id,
			name: c.commodity_disp_name
		}))
	};
	cedaLookup = {
		at: Date.now(),
		value
	};
	return value;
}
/** Latest state-level daily average for this commodity, or null. Never a price shown as current. */
async function fetchStateBenchmark(filters) {
	const lookup = await loadCedaLookup();
	const state = lookup.states.find((s) => looseEq(s.name, filters.state));
	const commodity = lookup.commodities.find((c) => looseEq(c.name, filters.commodity));
	if (!state || !commodity) return null;
	const end = /* @__PURE__ */ new Date();
	const start = /* @__PURE__ */ new Date(end.getTime() - 3456e7);
	const response = await fetch(`${CEDA_BASE}/prices`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			accept: "application/json"
		},
		body: JSON.stringify({
			state_id: state.id,
			commodity_id: commodity.id,
			district_id: null,
			calculation_type: "d",
			start_date: start.toISOString().slice(0, 10),
			end_date: end.toISOString().slice(0, 10)
		})
	});
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const newest = ((await response.json()).data ?? []).filter((r) => typeof r.t === "string" && Number.isFinite(r.p_modal) && r.p_modal > 0).sort((a, b) => a.t < b.t ? 1 : -1)[0];
	if (!newest) return null;
	return {
		date: newest.t.slice(0, 10),
		minPrice: Math.round(newest.p_min),
		maxPrice: Math.round(newest.p_max),
		modalPrice: Math.round(newest.p_modal)
	};
}
async function logAttempts(attempts, filters) {
	try {
		const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
		await supabaseAdmin.from("api_fetch_logs").insert(attempts.map((a) => ({
			provider: a.providerId,
			ok: a.ok,
			status_code: a.statusCode,
			record_count: a.recordCount,
			latest_data_date: a.latestDataDate,
			duration_ms: a.durationMs,
			commodity: filters.commodity,
			state: filters.state,
			error: a.error
		})));
	} catch (error) {
		console.error("[market] diagnostics log failed", error);
	}
}
async function persist(records) {
	const live = records.filter((r) => r.providerId !== storedArchive.id);
	if (live.length === 0) return;
	try {
		const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
		const { error } = await supabaseAdmin.from("market_prices").upsert(live.map((r) => ({
			commodity: r.commodity,
			variety: r.variety,
			state: r.state,
			district: r.district,
			market: r.market,
			min_price: r.minPrice,
			max_price: r.maxPrice,
			modal_price: r.modalPrice,
			arrival_date: r.date,
			fetched_at: r.fetchedAt
		})), { onConflict: "commodity,state,district,market,variety,arrival_date" });
		if (error) console.error("[market] upsert failed", error.message);
	} catch (error) {
		console.error("[market] upsert threw", error);
	}
}
var marketKey = (r) => `${r.market}|${r.district}|${r.variety ?? ""}`.toLowerCase().replace(/[^a-z0-9|]/g, "");
/**
* Merges records from several sources that all report the same reporting date.
* Same mandi + variety reported twice: keep the record from the higher-priority
* source, and flag a conflict when the two modal prices differ materially
* (>12%) instead of averaging unrelated numbers.
*/
function mergeSameDate(groups) {
	const chosen = /* @__PURE__ */ new Map();
	let conflict = false;
	for (const group of [...groups].sort((a, b) => a.priority - b.priority)) for (const record of group.records) {
		const key = marketKey(record);
		const existing = chosen.get(key);
		if (!existing) {
			chosen.set(key, record);
			continue;
		}
		if (Math.abs(existing.modalPrice - record.modalPrice) / Math.max(existing.modalPrice, record.modalPrice) > .12) conflict = true;
	}
	return {
		records: sortRecords([...chosen.values()]),
		conflict
	};
}
/**
* Queries every configured provider in PARALLEL and returns the set whose
* underlying MARKET DATA DATE is newest — not whichever API answered first.
* Records are normalized, validated, deduped across sources and cross-checked
* against the state-level benchmark. Nothing is ever fabricated or averaged.
*/
async function aggregateMarketPrices(filters) {
	const attempts = [];
	const successes = [];
	const runnable = providers.filter((p) => !p.envKey || Boolean(process.env[p.envKey]));
	for (const provider of providers) if (provider.envKey && !process.env[provider.envKey]) attempts.push({
		providerId: provider.id,
		provider: provider.name,
		ok: false,
		statusCode: null,
		recordCount: 0,
		latestDataDate: null,
		durationMs: 0,
		error: "API key not configured"
	});
	const benchmarkStarted = Date.now();
	const settled = await Promise.allSettled([...runnable.map(async (provider) => {
		const started = Date.now();
		try {
			const rawResult = await provider.fetch(filters);
			const result = {
				...rawResult,
				records: currentMarketRecords(rawResult.records, filters)
			};
			attempts.push({
				providerId: provider.id,
				provider: provider.name,
				ok: result.records.length > 0,
				statusCode: result.statusCode,
				recordCount: result.records.length,
				latestDataDate: result.records[0]?.date ?? null,
				durationMs: Date.now() - started,
				error: result.records.length === 0 ? "No records returned" : null
			});
			if (result.records.length > 0) successes.push({
				provider,
				result
			});
		} catch (error) {
			const err = error;
			attempts.push({
				providerId: provider.id,
				provider: provider.name,
				ok: false,
				statusCode: err.statusCode ?? null,
				recordCount: 0,
				latestDataDate: null,
				durationMs: Date.now() - started,
				error: err.message.slice(0, 300)
			});
		}
	}), (async () => {
		try {
			const benchmark = await fetchStateBenchmark(filters);
			attempts.push({
				providerId: CEDA_ID,
				provider: "CEDA Agmarknet open research API",
				ok: Boolean(benchmark),
				statusCode: 200,
				recordCount: benchmark ? 1 : 0,
				latestDataDate: benchmark?.date ?? null,
				durationMs: Date.now() - benchmarkStarted,
				error: benchmark ? null : "No benchmark rows"
			});
			return benchmark;
		} catch (error) {
			attempts.push({
				providerId: CEDA_ID,
				provider: "CEDA Agmarknet open research API",
				ok: false,
				statusCode: null,
				recordCount: 0,
				latestDataDate: null,
				durationMs: Date.now() - benchmarkStarted,
				error: error.message.slice(0, 300)
			});
			return null;
		}
	})()]);
	const benchmark = settled[settled.length - 1]?.status === "fulfilled" ? settled[settled.length - 1].value ?? null : null;
	logAttempts(attempts, filters);
	const live = successes.filter((s) => !s.provider.archive);
	const pool = live.length > 0 ? live : successes;
	if (pool.length === 0) return {
		records: [],
		todayRecords: [],
		yesterdayRecords: [],
		todayAvailable: false,
		attempts,
		providerId: null,
		source: null,
		archive: false,
		latestDate: "",
		sourceUpdatedAt: null,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		freshness: {
			level: "unavailable",
			label: "UNAVAILABLE",
			ageDays: null
		},
		corroboratedBy: [],
		consensus: "single"
	};
	const today = istToday();
	const yesterdayDate = /* @__PURE__ */ new Date(`${today}T00:00:00Z`);
	yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
	const yesterday = yesterdayDate.toISOString().slice(0, 10);
	const mergeDate = (date) => mergeSameDate(pool.map((s) => ({
		priority: s.provider.priority,
		records: s.result.records.filter((record) => record.date === date)
	})).filter((group) => group.records.length > 0));
	const todayMerged = mergeDate(today);
	const yesterdayMerged = mergeDate(yesterday);
	const todayRecords = todayMerged.records;
	const yesterdayRecords = yesterdayMerged.records;
	const todayAvailable = todayRecords.length > 0;
	const records = todayAvailable ? [...todayRecords, ...yesterdayRecords] : yesterdayRecords;
	const latestDate = todayAvailable ? today : yesterday;
	const onLatest = pool.filter((s) => s.result.records.some((record) => record.date === latestDate));
	const primary = [...onLatest].sort((a, b) => a.provider.priority - b.provider.priority)[0];
	await persist(records);
	let conflict = todayMerged.conflict || yesterdayMerged.conflict;
	if (benchmark && benchmark.date === latestDate && records[0]) {
		if (Math.abs(benchmark.modalPrice - records[0].modalPrice) / Math.max(benchmark.modalPrice, records[0].modalPrice) > .4) conflict = true;
	}
	const corroboratedBy = onLatest.filter((s) => s.provider.id !== primary.provider.id).map((s) => s.provider.name);
	if (benchmark && benchmark.date === latestDate) corroboratedBy.push("CEDA Agmarknet open research API");
	return {
		records,
		todayRecords,
		yesterdayRecords,
		todayAvailable,
		attempts,
		providerId: primary.provider.id,
		source: records[0]?.source ?? primary.provider.name,
		archive: primary.provider.archive,
		latestDate,
		sourceUpdatedAt: primary.result.sourceUpdatedAt,
		fetchedAt: records[0]?.fetchedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
		freshness: computeFreshness({
			dataDate: latestDate,
			sourceUpdatedAt: primary.provider.archive ? null : primary.result.sourceUpdatedAt
		}),
		corroboratedBy,
		consensus: conflict ? "conflict" : corroboratedBy.length > 0 ? "corroborated" : "single"
	};
}
//#endregion
export { aggregateMarketPrices, providerCatalogue };
