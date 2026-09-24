import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { C as useLocationContext, S as useLang, n as INDIAN_STATES } from "./router-5yV9beqj.mjs";
import { Bt as Check, Dt as Crosshair, Q as MapPin, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/location-card-BYGTE1YF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LocationCard() {
	const { t } = useLang();
	const { location, status, error, detect, setManual } = useLocationContext();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [state, setState] = (0, import_react.useState)(location?.state ?? "Maharashtra");
	const [district, setDistrict] = (0, import_react.useState)(location?.district ?? "");
	const [city, setCity] = (0, import_react.useState)(location?.city ?? "");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const submit = async () => {
		setSaving(true);
		await setManual({
			state,
			district: district.trim(),
			city: city.trim()
		});
		setSaving(false);
		setOpen(false);
	};
	const label = location?.state || location?.city ? [
		location.city || location.place || location.district,
		location.district,
		location.state
	].filter((part, index, all) => Boolean(part) && all.indexOf(part) === index).slice(0, 3).join(", ") : t("locationNeeded");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface hover-lift p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4.5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: [t("yourLocation"), location ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal",
								children: location.source === "gps" ? t("autoLocation") : t("manualLocation")
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-bold",
							children: label
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => void detect(),
					disabled: status === "locating",
					className: "press grid size-9 shrink-0 place-items-center rounded-full bg-muted disabled:opacity-60",
					"aria-label": t("useMyLocation"),
					children: status === "locating" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-4" })
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11px] font-semibold text-destructive",
				children: error
			}),
			!open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setOpen(true),
				className: "press mt-3 w-full rounded-2xl border border-dashed border-primary/40 py-2.5 text-xs font-bold text-primary",
				children: t("enterLocation")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold text-muted-foreground",
						children: t("manualHint")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold text-muted-foreground",
							children: t("city")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: city,
							onChange: (e) => setCity(e.target.value),
							maxLength: 60,
							placeholder: "Lasalgaon",
							autoComplete: "address-level2",
							className: "mt-1 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-semibold"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold text-muted-foreground",
							children: t("district")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: district,
							onChange: (e) => setDistrict(e.target.value),
							maxLength: 60,
							placeholder: "Nashik",
							autoComplete: "address-level3",
							className: "mt-1 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-semibold"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-semibold text-muted-foreground",
							children: t("state")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: state,
							onChange: (e) => setState(e.target.value),
							className: "mt-1 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-semibold",
							children: INDIAN_STATES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								children: s
							}, s))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setOpen(false),
							className: "press h-11 flex-1 rounded-2xl border border-border text-sm font-bold",
							children: t("cancel")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => void submit(),
							disabled: saving || !state,
							className: "press grad-primary inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60",
							children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }),
								" ",
								t("save")
							] })
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { LocationCard as t };
