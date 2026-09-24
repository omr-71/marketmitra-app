import { i as __toESM } from "../_runtime.mjs";
import { s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as render } from "../_libs/@react-email/render+[...].mjs";
import { t as TEMPLATES } from "./registry-CWdWxwHX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/send-email-Daok7WEz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
async function sendTemplateEmail(templateName, to, options = {}) {
	const apiKey = process.env["BREVO_API_KEY"];
	if (!apiKey) throw new Error("BREVO_API_KEY is not configured");
	const template = TEMPLATES[templateName];
	if (!template) throw new Error(`Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`);
	const recipient = template.to || to;
	if (!recipient) throw new Error("Recipient is required");
	const templateData = options.templateData ?? {};
	const element = import_react.createElement(template.component, templateData);
	const html = await render(element);
	const text = await render(element, { plainText: true });
	const subject = typeof template.subject === "function" ? template.subject(templateData) : template.subject;
	let response;
	try {
		response = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				accept: "application/json",
				"api-key": apiKey,
				"content-type": "application/json"
			},
			body: JSON.stringify({
				sender: {
					email: "hello.marketmitra@gmail.com",
					name: "MarketMitra"
				},
				to: [{ email: recipient }],
				subject,
				htmlContent: html,
				textContent: text,
				...options.replyTo ? { replyTo: { email: options.replyTo } } : {}
			})
		});
	} catch {
		throw new Error("Unable to reach the Brevo email service.");
	}
	if (!response.ok) throw new Error(`Brevo rejected the email request (HTTP ${response.status}).`);
	return { sent: true };
}
//#endregion
export { sendTemplateEmail };
