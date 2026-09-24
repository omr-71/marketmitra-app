import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Wordmark, r as LogoMark } from "./router-5yV9beqj.mjs";
import { t as supabase } from "./client-CoPqTDtD.mjs";
import { It as CircleCheck, Lt as CircleAlert, Yt as ArrowRight, rt as LoaderCircle, tt as Lock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-BgSHjljh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const isRecovery = (window.location.hash ?? "").includes("type=recovery");
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
		});
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session || isRecovery) setReady(true);
			else setError("This reset link is invalid or has expired. Request a new one from the sign-in page.");
		});
		return () => data.subscription.unsubscribe();
	}, []);
	const submit = async (event) => {
		event.preventDefault();
		setError(null);
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		if (password !== confirm) {
			setError("Passwords don't match.");
			return;
		}
		setBusy(true);
		const { error: updateError } = await supabase.auth.updateUser({ password });
		setBusy(false);
		if (updateError) {
			setError(updateError.message);
			return;
		}
		setDone(true);
		setTimeout(() => void navigate({
			to: "/home",
			replace: true
		}), 1200);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid min-h-screen place-items-center overflow-hidden bg-[oklch(0.14_0.022_162)] px-5 py-12 text-[oklch(0.97_0.01_140)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -left-32 top-[-10%] size-[40rem] rounded-full bg-[radial-gradient(circle,oklch(0.5_0.15_152/0.45),transparent_65%)] blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -right-24 bottom-[-20%] size-[32rem] rounded-full bg-[radial-gradient(circle,oklch(0.45_0.09_205/0.35),transparent_65%)] blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-[26rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-16 place-items-center rounded-[1.4rem] bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.14)] backdrop-blur-xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-9" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { className: "text-xl" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 rounded-[1.75rem] border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.055)] p-6 shadow-[0_30px_70px_-40px_oklch(0_0_0/0.9)] backdrop-blur-2xl sm:p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl font-bold tracking-tight",
							children: "Set a new password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-[13px] text-[oklch(0.78_0.02_148)]",
							children: "Choose a strong password you haven't used before."
						}),
						done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-6 flex items-start gap-2 rounded-xl bg-[oklch(0.72_0.17_148/0.14)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.9_0.1_150)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-3.5 shrink-0" }), "Password updated. Taking you to your dashboard…"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submit,
							className: "mt-6 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "New password",
									value: password,
									onChange: setPassword
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Confirm password",
									value: confirm,
									onChange: setConfirm
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									role: "alert",
									className: "flex items-start gap-2 rounded-xl bg-[oklch(0.55_0.19_25/0.16)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.9_0.08_30)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-3.5 shrink-0" }), error]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: busy || !ready,
									className: "press grad-primary flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60",
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Update password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })] })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void navigate({
								to: "/auth",
								search: { redirect: void 0 }
							}),
							className: "mt-5 text-xs font-semibold text-primary-glow underline-offset-4 hover:underline",
							children: "← Back to sign in"
						})
					]
				})]
			})
		]
	});
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-bold uppercase tracking-[0.16em] text-[oklch(0.7_0.02_148)]",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1.5 flex items-center gap-2.5 rounded-2xl border border-[oklch(1_0_0/0.12)] bg-[oklch(0_0_0/0.18)] px-3.5 transition-colors focus-within:border-primary-glow/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[oklch(0.7_0.02_148)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "password",
				value,
				onChange: (e) => onChange(e.target.value),
				autoComplete: "new-password",
				placeholder: "••••••••",
				className: "h-12 w-full bg-transparent text-sm font-semibold text-[oklch(0.97_0.01_140)] outline-none placeholder:text-[oklch(0.55_0.02_148)]"
			})]
		})]
	});
}
//#endregion
export { ResetPasswordPage as component };
