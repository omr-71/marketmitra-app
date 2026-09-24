import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/predict.functions-bTYyIwPN.js
var schema = objectType({
	commodity: stringType().trim().min(1).max(80),
	state: stringType().trim().min(1).max(60),
	market: stringType().trim().min(1).max(80)
});
var MIN_DAYS = 7;
var predictPrice_createServerFn_handler = createServerRpc({
	id: "5e965d3fe93837ee0c049963c6772e00347a3129526e08e5b1b24594989b641b",
	name: "predictPrice",
	filename: "src/lib/predict.functions.ts"
}, (opts) => predictPrice.__executeServer(opts));
var predictPrice = createServerFn({ method: "POST" }).inputValidator((data) => schema.parse(data)).handler(predictPrice_createServerFn_handler, async ({ data }) => {
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: rows, error } = await supabaseAdmin.from("market_prices").select("arrival_date, min_price, max_price, modal_price").eq("commodity", data.commodity).eq("state", data.state).eq("market", data.market).order("arrival_date", { ascending: false }).limit(45);
	if (error) {
		console.error("prediction history read failed", error.message);
		return {
			ok: false,
			reason: "unavailable",
			message: "Price history could not be read.",
			basedOnDays: 0
		};
	}
	const seen = /* @__PURE__ */ new Set();
	const history = (rows ?? []).filter((r) => seen.has(r.arrival_date) ? false : seen.add(r.arrival_date)).map((r) => ({
		date: r.arrival_date,
		modal: Number(r.modal_price),
		min: Number(r.min_price),
		max: Number(r.max_price)
	})).sort((a, b) => a.date < b.date ? -1 : 1);
	if (history.length < MIN_DAYS) return {
		ok: false,
		reason: "insufficient_history",
		message: `A forecast needs at least ${MIN_DAYS} days of recorded prices for this market. ${history.length} recorded so far.`,
		basedOnDays: history.length
	};
	const apiKey = process.env["LOVABLE_API_KEY"];
	if (!apiKey) return {
		ok: false,
		reason: "unavailable",
		message: "Prediction service is not configured.",
		basedOnDays: history.length
	};
	const latest = history[history.length - 1];
	try {
		const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Lovable-API-Key": apiKey
			},
			body: JSON.stringify({
				model: "google/gemini-3.6-flash",
				messages: [{
					role: "system",
					content: "You are an agricultural commodity price analyst for Indian APMC mandis. You forecast the modal price 3 days ahead using only the supplied daily price series. Be conservative: never predict a move larger than the series volatility supports, and lower the confidence when the series is short or noisy. Respond with JSON only."
				}, {
					role: "user",
					content: `Commodity: ${data.commodity}\nMarket: ${data.market}, ${data.state}\nUnit: INR per quintal\nDaily series (date, min, modal, max):\n${history.map((h) => `${h.date}, ${h.min}, ${h.modal}, ${h.max}`).join("\n")}\n\nReturn JSON with keys: direction ("up"|"down"|"flat"), expectedPrice (number, INR/quintal in 3 days), changePercent (number), confidence (0-100 integer), recommendation ("sell_now"|"hold"), explanation (max 240 chars, plain language for a farmer, cite the trend you observed).`
				}],
				response_format: { type: "json_object" }
			})
		});
		if (!response.ok) {
			const body = await response.text();
			console.error(`AI gateway failed [${response.status}]: ${body.slice(0, 400)}`);
			return {
				ok: false,
				reason: "unavailable",
				message: response.status === 429 ? "Forecast service is busy. Please try again in a minute." : response.status === 402 ? "Forecast service is out of credits." : "Forecast service is temporarily unavailable.",
				basedOnDays: history.length
			};
		}
		const content = (await response.json()).choices?.[0]?.message?.content;
		if (!content) throw new Error("empty completion");
		const parsed = objectType({
			direction: enumType([
				"up",
				"down",
				"flat"
			]),
			expectedPrice: numberType().positive(),
			changePercent: numberType(),
			confidence: numberType(),
			recommendation: enumType(["sell_now", "hold"]),
			explanation: stringType().min(1).max(400)
		}).parse(JSON.parse(content));
		return {
			ok: true,
			direction: parsed.direction,
			expectedPrice: Math.round(parsed.expectedPrice),
			changePercent: Number((parsed.changePercent || (parsed.expectedPrice - latest.modal) / latest.modal * 100).toFixed(1)),
			confidence: Math.max(1, Math.min(99, Math.round(parsed.confidence))),
			horizonDays: 3,
			recommendation: parsed.recommendation,
			explanation: parsed.explanation,
			basedOnDays: history.length,
			generatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch (err) {
		console.error("prediction failed", err);
		return {
			ok: false,
			reason: "unavailable",
			message: "The forecast could not be generated right now.",
			basedOnDays: history.length
		};
	}
});
//#endregion
export { predictPrice_createServerFn_handler };
