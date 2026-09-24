import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { a as objectType, o as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/phone-verify.functions-PEbeTDkw.js
var phoneSchema = stringType().trim().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");
async function hashCode(code) {
	const pepper = process.env["OTP_PEPPER"] ?? "";
	const bytes = new TextEncoder().encode(`${code}:${pepper}`);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function normalise(phone) {
	return `+91${phone.replace(/\D/g, "").slice(-10)}`;
}
/** Emails a 6-digit code to the signed-in account so the owner proves the number is theirs. */
var sendPhoneVerificationCode_createServerFn_handler = createServerRpc({
	id: "80b31d19c27865ea3f97e22cf27d3d380870a61fbbe408ee609f5af17b365c76",
	name: "sendPhoneVerificationCode",
	filename: "src/lib/phone-verify.functions.ts"
}, (opts) => sendPhoneVerificationCode.__executeServer(opts));
var sendPhoneVerificationCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ phone: phoneSchema }).parse(data)).handler(sendPhoneVerificationCode_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId, claims } = context;
	const email = claims.email;
	if (!email) throw new Error("Your account has no email address to send the code to.");
	const phone = normalise(data.phone);
	const code = String(Math.floor(1e5 + Math.random() * 9e5));
	const { error: profileError } = await supabase.from("profiles").update({ phone }).eq("id", userId);
	if (profileError) throw new Error(profileError.message);
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { error } = await supabaseAdmin.from("phone_verification_codes").insert({
		user_id: userId,
		phone,
		code_hash: await hashCode(code),
		expires_at: new Date(Date.now() + 6e5).toISOString()
	});
	if (error) throw new Error(error.message);
	const { sendTemplateEmail } = await import("./send-email-Daok7WEz.mjs");
	return {
		sent: (await sendTemplateEmail("phone-code", email, { templateData: {
			code,
			phone
		} })).sent,
		maskedEmail: email.replace(/^(.).*(@.*)$/, "$1***$2"),
		phone
	};
});
var confirmPhoneVerificationCode_createServerFn_handler = createServerRpc({
	id: "e318e963b07351c1f79099faa0dbe8c029475b5b85c75484f9496ced89957b8a",
	name: "confirmPhoneVerificationCode",
	filename: "src/lib/phone-verify.functions.ts"
}, (opts) => confirmPhoneVerificationCode.__executeServer(opts));
var confirmPhoneVerificationCode = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ code: stringType().trim().regex(/^\d{6}$/) }).parse(data)).handler(confirmPhoneVerificationCode_createServerFn_handler, async ({ data, context }) => {
	const { userId } = context;
	const { supabaseAdmin } = await import("./client.server-KzwUIAkW.mjs");
	const { data: rows } = await supabaseAdmin.from("phone_verification_codes").select("id, code_hash, attempts, expires_at, consumed_at, phone").eq("user_id", userId).is("consumed_at", null).order("created_at", { ascending: false }).limit(1);
	const row = (rows ?? [])[0];
	if (!row) throw new Error("Request a new code first.");
	if (new Date(row.expires_at).getTime() < Date.now()) throw new Error("That code has expired.");
	if (row.attempts >= 5) throw new Error("Too many attempts. Request a new code.");
	if (await hashCode(data.code) !== row.code_hash) {
		await supabaseAdmin.from("phone_verification_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
		throw new Error("That code is incorrect.");
	}
	await supabaseAdmin.from("phone_verification_codes").update({ consumed_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", row.id);
	const { error } = await supabaseAdmin.from("profiles").update({
		phone: row.phone,
		phone_verified: true,
		phone_verified_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", userId);
	if (error) throw new Error(error.message);
	return {
		verified: true,
		phone: row.phone
	};
});
//#endregion
export { confirmPhoneVerificationCode_createServerFn_handler, sendPhoneVerificationCode_createServerFn_handler };
