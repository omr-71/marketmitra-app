import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { k as createSsrRpc } from "./router-5yV9beqj.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-prices.functions-DrkprgBp.js
var filtersSchema = objectType({
	commodity: stringType().trim().min(1).max(80),
	state: stringType().trim().min(1).max(60),
	district: stringType().trim().max(60).optional(),
	market: stringType().trim().max(80).optional()
});
/** Multi-source, validated, deduped official mandi prices + freshness. */
var getMarketPrices = createServerFn({ method: "POST" }).inputValidator((data) => filtersSchema.parse(data)).handler(createSsrRpc("4e74d109c0d111164e730cbc5177b7adf53eeaeb1f2942eb486dafc230a9fabf"));
/** Non-secret service health for the Settings → Data & API status section. */
var getMarketStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("51e5cd67293edbf5ecf04c5c5d1fe7b7b2ef780e5e9e96c40efe11db916adcfc"));
/** Same diagnostics, admin-gated, for the admin control centre. */
var getProviderDiagnostics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("48762c045535912b5d0286dc1df0d5d12a5fe4d242d98e0d9a65f058cb2b4092"));
//#endregion
export { getMarketStatus as n, getProviderDiagnostics as r, getMarketPrices as t };
