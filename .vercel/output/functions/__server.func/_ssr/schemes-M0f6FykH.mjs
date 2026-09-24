import { o as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { S as useLang, b as track, v as schemes } from "./router-5yV9beqj.mjs";
import { Ct as ExternalLink, ct as Landmark } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schemes-M0f6FykH.js
var import_jsx_runtime = require_jsx_runtime();
function SchemesPage() {
	const { t } = useLang();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: t("schemes"),
		back: "/home"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-4 pt-4 sm:px-5 lg:px-0 lg:pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-2xl text-xs leading-relaxed text-muted-foreground",
			children: "Benefits and criteria as published by the implementing department. Apply on the official portal — MarketMitra does not process applications."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-3 lg:grid-cols-2",
			children: schemes.map((scheme) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "card-surface hover-lift flex min-w-0 flex-col border-t-4 border-t-gold p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tint-gold grid size-10 shrink-0 place-items-center rounded-xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-extrabold leading-snug",
								children: scheme.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[11px] text-muted-foreground",
								children: scheme.dept
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[13px] font-semibold leading-snug text-gold-foreground",
						children: scheme.benefit
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1.5",
						children: scheme.criteria.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2 text-[12px] leading-snug text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" }), c]
						}, c))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: scheme.url,
						onClick: () => track("scheme_viewed", { label: scheme.name }),
						target: "_blank",
						rel: "noreferrer noopener",
						className: "press mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gold/45 pt-0 text-xs font-bold text-gold-foreground",
						children: ["Open official portal ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
					})
				]
			}, scheme.id))
		})]
	})] });
}
//#endregion
export { SchemesPage as component };
