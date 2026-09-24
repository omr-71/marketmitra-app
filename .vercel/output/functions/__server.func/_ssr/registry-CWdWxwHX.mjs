import "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Body } from "../_libs/react-email__body.mjs";
import { t as Container } from "../_libs/react-email__container.mjs";
import { t as Head } from "../_libs/react-email__head.mjs";
import { t as Heading } from "../_libs/react-email__heading.mjs";
import { t as Html } from "../_libs/react-email__html.mjs";
import { t as Preview } from "../_libs/react-email__preview.mjs";
import { t as Section } from "../_libs/react-email__section.mjs";
import { t as Text } from "../_libs/react-email__text.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function PhoneCodeEmail({ code = "000000", phone = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Html, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Head, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Preview, { children: ["MarketMitra verification code ", code] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, {
			style: {
				backgroundColor: "#f6f7f5",
				fontFamily: "Segoe UI, Arial, sans-serif"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, {
				style: {
					padding: "32px",
					backgroundColor: "#ffffff",
					borderRadius: "16px",
					margin: "24px auto",
					maxWidth: "480px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heading, {
						style: {
							fontSize: "20px",
							color: "#14532d"
						},
						children: "Verify your mobile number"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text, {
						style: {
							fontSize: "14px",
							color: "#3f3f46"
						},
						children: [
							"Enter this code in MarketMitra to confirm ",
							phone ? phone : "your mobile number",
							" for Mitra Link."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						style: {
							margin: "24px 0",
							textAlign: "center"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
							style: {
								fontSize: "32px",
								letterSpacing: "8px",
								fontWeight: 700,
								color: "#166534"
							},
							children: code
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text, {
						style: {
							fontSize: "12px",
							color: "#71717a"
						},
						children: "The code expires in 10 minutes. If you did not request it, ignore this email — your number stays unverified."
					})
				]
			})
		})
	] });
}
/**
* Template registry — maps template names to their React Email components.
* Import and register new templates here after creating them in this directory.
*
* Example:
*   import { template as welcomeTemplate } from './welcome'
*   // then add to TEMPLATES: 'welcome': welcomeTemplate
*/
var TEMPLATES = { "phone-code": {
	component: PhoneCodeEmail,
	subject: "Your MarketMitra verification code",
	displayName: "Phone verification code",
	previewData: {
		code: "482913",
		phone: "+91 90000 00000"
	}
} };
//#endregion
export { TEMPLATES as t };
