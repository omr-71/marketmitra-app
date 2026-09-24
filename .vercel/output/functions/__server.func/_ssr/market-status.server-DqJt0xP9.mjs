import { t as computeFreshness } from "./market-freshness-C3Wz6gg0.mjs";
import { providerCatalogue } from "./market-providers.server-B2CX61LM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-status.server-DqJt0xP9.js
/**
* Builds the public (non-secret) health picture of the market data service from
* the diagnostics rows the aggregator already writes to `api_fetch_logs`.
* Never reads or returns API keys — only whether a credential is present.
*/
function rollUp(configured, attempts, successes) {
	if (!configured) return "not_configured";
	if (attempts === 0) return "unknown";
	if (successes === 0) return "down";
	return successes / attempts >= .6 ? "healthy" : "degraded";
}
async function readMarketServiceStatus() {
	const catalogue = providerCatalogue();
	let rows = [];
	try {
		const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
		const since = (/* @__PURE__ */ new Date(Date.now() - 864e5)).toISOString();
		const { data } = await supabaseAdmin.from("api_fetch_logs").select("provider, ok, status_code, record_count, latest_data_date, duration_ms, error, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(2e3);
		rows = data ?? [];
	} catch (error) {
		console.error("[market] status read failed", error);
	}
	const providers = catalogue.map((provider) => {
		const mine = rows.filter((r) => r.provider === provider.id);
		const ok = mine.filter((r) => r.ok);
		const failed = mine.filter((r) => !r.ok);
		const newest = mine[0];
		const latestDataDate = mine.map((r) => r.latest_data_date).filter(Boolean).sort().reverse()[0] ?? null;
		return {
			...provider,
			status: rollUp(provider.configured, mine.length, ok.length),
			lastSuccessAt: ok[0]?.created_at ?? null,
			lastFailureAt: failed[0]?.created_at ?? null,
			lastError: failed[0]?.error ?? null,
			lastRecordCount: newest?.record_count ?? null,
			latestDataDate,
			lastDurationMs: newest?.duration_ms ?? null,
			attempts24h: mine.length,
			successes24h: ok.length
		};
	});
	const live = providers.filter((p) => !p.archive);
	const lastSuccessAt = live.map((p) => p.lastSuccessAt).filter((v) => Boolean(v)).sort().reverse()[0] ?? null;
	const latestDataDate = live.map((p) => p.latestDataDate).filter((v) => Boolean(v)).sort().reverse()[0] ?? null;
	const overall = live.some((p) => p.status === "healthy") ? "healthy" : live.some((p) => p.status === "degraded") ? "degraded" : live.some((p) => p.status === "down") ? "down" : live.every((p) => p.status === "not_configured") ? "not_configured" : "unknown";
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		overall,
		providers,
		lastSuccessAt,
		latestDataDate,
		freshness: computeFreshness({ dataDate: latestDataDate })
	};
}
//#endregion
export { readMarketServiceStatus };
