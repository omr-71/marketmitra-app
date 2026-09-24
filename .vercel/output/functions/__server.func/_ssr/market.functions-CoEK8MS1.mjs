import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { k as createSsrRpc } from "./router-5yV9beqj.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market.functions-CoEK8MS1.js
var inputSchema = objectType({
	commodity: stringType().trim().min(1).max(80),
	state: stringType().trim().min(1).max(60),
	district: stringType().trim().max(60).optional(),
	market: stringType().trim().max(80).optional()
});
createServerFn({ method: "POST" }).inputValidator((data) => inputSchema.parse(data)).handler(createSsrRpc("d24d4e79f2e6556f3cbd2ef8eedc8294e00d00d17c591bfff6add608f94b8704"));
var historySchema = objectType({
	commodity: stringType().trim().min(1).max(80),
	state: stringType().trim().min(1).max(60),
	market: stringType().trim().min(1).max(80)
});
/**
* Real reported history for one mandi, straight from AGMARKNET (newest first,
* returned oldest-first for charting). Falls back to previously stored official
* records if the API is unreachable — never to generated values.
*/
var fetchPriceHistory = createServerFn({ method: "POST" }).inputValidator((data) => historySchema.parse(data)).handler(createSsrRpc("d67cff4daabe01eb79b365148dcef640a7678106d592b2b931a5758f813353e6"));
//#endregion
export { fetchPriceHistory as t };
