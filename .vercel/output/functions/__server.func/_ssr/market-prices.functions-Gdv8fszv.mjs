import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-prices.functions-Gdv8fszv.js
var filtersSchema = objectType({
	commodity: stringType().trim().min(1).max(80),
	state: stringType().trim().min(1).max(60),
	district: stringType().trim().max(60).optional(),
	market: stringType().trim().max(80).optional()
});
/** Multi-source, validated, deduped official mandi prices + freshness. */
var getMarketPrices_createServerFn_handler = createServerRpc({
	id: "4e74d109c0d111164e730cbc5177b7adf53eeaeb1f2942eb486dafc230a9fabf",
	name: "getMarketPrices",
	filename: "src/lib/market-prices.functions.ts"
}, (opts) => getMarketPrices.__executeServer(opts));
var getMarketPrices = createServerFn({ method: "POST" }).inputValidator((data) => filtersSchema.parse(data)).handler(getMarketPrices_createServerFn_handler, async ({ data }) => {
	const { aggregateMarketPrices } = await import("./market-providers.server-B2CX61LM.mjs");
	return aggregateMarketPrices(data);
});
var getMarketStatus_createServerFn_handler = createServerRpc({
	id: "51e5cd67293edbf5ecf04c5c5d1fe7b7b2ef780e5e9e96c40efe11db916adcfc",
	name: "getMarketStatus",
	filename: "src/lib/market-prices.functions.ts"
}, (opts) => getMarketStatus.__executeServer(opts));
var getMarketStatus = createServerFn({ method: "GET" }).handler(getMarketStatus_createServerFn_handler, async () => {
	const { readMarketServiceStatus } = await import("./market-status.server-DqJt0xP9.mjs");
	return readMarketServiceStatus();
});
var getProviderDiagnostics_createServerFn_handler = createServerRpc({
	id: "48762c045535912b5d0286dc1df0d5d12a5fe4d242d98e0d9a65f058cb2b4092",
	name: "getProviderDiagnostics",
	filename: "src/lib/market-prices.functions.ts"
}, (opts) => getProviderDiagnostics.__executeServer(opts));
var getProviderDiagnostics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getProviderDiagnostics_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (data !== true) throw new Error("Forbidden");
	const { readMarketServiceStatus } = await import("./market-status.server-DqJt0xP9.mjs");
	return readMarketServiceStatus();
});
//#endregion
export { getMarketPrices_createServerFn_handler, getMarketStatus_createServerFn_handler, getProviderDiagnostics_createServerFn_handler };
