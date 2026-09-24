import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-CoPqTDtD.mjs";
import { t as marketmitra_logo_default } from "./marketmitra-logo-BiTUB1il.mjs";
import { $ as Mail, Ct as ExternalLink, I as ScanLine, N as ShieldCheck, St as EyeOff, Yt as ArrowRight, Zt as Activity, a as Wheat, h as TrendingUp, tt as Lock, xt as Eye } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BQ4TCItX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const google = () => {
		setError(null);
		setNotice(null);
		setBusy("google");
		const redirectTo = `${window.location.origin}/auth`;
		const url = new URL("https://bulpboucdnkvepxabyuy.supabase.co/auth/v1/authorize");
		url.searchParams.set("provider", "google");
		url.searchParams.set("redirect_to", redirectTo);
		window.location.assign(url.toString());
	};
	const submit = async (event) => {
		event.preventDefault();
		setError(null);
		setNotice(null);
		setBusy("email");
		try {
			if (!email.trim() || !password) throw new Error("Please enter your email and password.");
			if (mode === "signup") {
				if (!fullName.trim()) throw new Error("Please enter your full name.");
				const { error: signUpError } = await supabase.auth.signUp({
					email: email.trim(),
					password,
					options: { data: { full_name: fullName.trim() } }
				});
				if (signUpError) throw signUpError;
				setNotice("Account created. Please check your email if confirmation is required.");
			} else {
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: email.trim(),
					password
				});
				if (signInError) throw signInError;
				navigate({ to: "/home" });
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
		} finally {
			setBusy(null);
		}
	};
	const isSignin = mode === "signin";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen overflow-hidden bg-[#020907] text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-56 -top-56 h-[650px] w-[650px] rounded-full bg-emerald-500/[0.08] blur-[140px]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-64 -right-48 h-[700px] w-[700px] rounded-full bg-green-500/[0.07] blur-[150px]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[42%] top-[20%] h-[320px] w-[320px] rounded-full bg-emerald-400/[0.035] blur-[110px]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 opacity-[0.025]",
					style: {
						backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
						backgroundSize: "48px 48px"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[16%] top-0 h-full w-px bg-gradient-to-b from-transparent via-emerald-400/[0.08] to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-emerald-400/[0.05] to-transparent" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid w-full overflow-hidden rounded-[30px] border border-white/[0.10] bg-white/[0.025] shadow-[0_35px_120px_rgba(0,0,0,0.62)] backdrop-blur-2xl lg:min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative hidden overflow-hidden lg:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-[#071c13] via-[#06130e] to-[#020907]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-emerald-400/[0.08]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full border border-emerald-400/[0.06]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full border border-green-400/[0.06]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[14%] top-[22%] h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-[19%] top-[32%] h-1 w-1 animate-pulse rounded-full bg-green-300 shadow-[0_0_12px_rgba(74,222,128,0.8)] [animation-delay:700ms]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[27%] left-[11%] h-1 w-1 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)] [animation-delay:1200ms]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10 flex w-full flex-col p-12",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-white/[0.045] shadow-[0_0_35px_rgba(16,185,129,0.16)]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: marketmitra_logo_default,
											alt: "Market Mitra",
											className: "h-10 w-10 object-contain"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.05]" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xl font-bold tracking-tight",
										children: "Market Mitra"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 text-[10px] font-semibold tracking-[0.20em] text-emerald-400/80",
										children: "SELL SMARTER. EARN BETTER."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-20 max-w-xl",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/[0.14] bg-emerald-500/[0.055] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-emerald-300",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wheat, { className: "h-3.5 w-3.5" }), "Agriculture Intelligence"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
											className: "text-[52px] font-bold leading-[1.04] tracking-[-0.035em]",
											children: [
												"Smarter farming.",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent",
													children: "Better decisions."
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-7 max-w-lg text-[15px] leading-7 text-slate-400",
											children: "One powerful platform for market prices, crop diagnosis, weather, government schemes and farmer-to-farmer resource connections."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-12 grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#08150f]/80 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/[0.18] hover:bg-[#0a1b13]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-400/[0.07] blur-2xl transition-all duration-500 group-hover:bg-emerald-400/[0.13]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/[0.12] bg-emerald-500/[0.08]",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5 text-emerald-400" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" }), "Live"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-sm font-semibold text-white",
														children: "Real Market Data"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mt-1 text-xs leading-5 text-slate-500",
														children: "Current mandi information for smarter selling."
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative mt-5 h-12 overflow-hidden rounded-lg border border-white/[0.04] bg-black/10",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
														viewBox: "0 0 240 48",
														preserveAspectRatio: "none",
														className: "h-full w-full",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
															d: "M0 38 C20 35 28 39 43 31 C60 22 69 29 82 25 C100 20 108 27 123 18 C140 8 150 21 165 17 C180 13 187 20 200 10 C215 2 225 8 240 4",
															fill: "none",
															stroke: "currentColor",
															strokeWidth: "1.8",
															className: "text-emerald-400/70"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
															d: "M0 48 L0 38 C20 35 28 39 43 31 C60 22 69 29 82 25 C100 20 108 27 123 18 C140 8 150 21 165 17 C180 13 187 20 200 10 C215 2 225 8 240 4 L240 48 Z",
															className: "fill-emerald-400/[0.045]"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,1)]" })]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#08150f]/80 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-green-400/[0.18] hover:bg-[#0a1b13]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-12 -top-12 h-28 w-28 rounded-full bg-green-400/[0.06] blur-2xl transition-all duration-500 group-hover:bg-green-400/[0.12]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex h-10 w-10 items-center justify-center rounded-xl border border-green-400/[0.12] bg-green-500/[0.07]",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-5 w-5 text-green-400" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-green-400/30 transition-transform duration-500 group-hover:rotate-90 group-hover:text-green-400/60" })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-sm font-semibold text-white",
														children: "Mitra Intelligence"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mt-1 text-xs leading-5 text-slate-500",
														children: "Agriculture intelligence built around farmers."
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative mt-5 h-12 overflow-hidden rounded-lg border border-white/[0.04] bg-black/10",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-4 right-4 top-1/2 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[18%] top-2 h-8 w-8 rounded-full border border-green-400/20" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-[48%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-green-300 shadow-[0_0_14px_rgba(74,222,128,0.9)]" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-[18%] top-2 h-8 w-8 rounded-full border border-green-400/10" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-1/2 w-px bg-green-400/20" })
													]
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-auto pt-10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-400/[0.12] bg-emerald-500/[0.07]",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: marketmitra_logo_default,
														alt: "Market Mitra",
														className: "h-8 w-8 object-contain"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600",
													children: "Created by"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-0.5 text-sm font-semibold text-white",
													children: "Om Labhade"
												})] })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/about",
												className: "group flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300",
												children: ["About Market Mitra", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })]
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 flex items-center justify-between border-t border-white/[0.06] pt-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-slate-600",
											children: "Built for modern Indian agriculture"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-[11px] text-slate-500",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" }), "Secure access"]
										})]
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex items-center justify-center border-white/[0.07] bg-[#030c08]/85 px-5 py-8 sm:px-10 lg:border-l lg:px-14",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-emerald-400/[0.10] to-transparent lg:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-10 flex items-center justify-center gap-3 lg:hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-white/[0.045] shadow-[0_0_30px_rgba(16,185,129,0.15)]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: marketmitra_logo_default,
										alt: "Market Mitra",
										className: "h-9 w-9 object-contain"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-lg font-bold",
									children: "Market Mitra"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-semibold tracking-[0.16em] text-emerald-400/80",
									children: "SELL SMARTER. EARN BETTER."
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" }), isSignin ? "Welcome back" : "Get started"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-3xl font-bold tracking-[-0.025em] sm:text-4xl",
										children: isSignin ? "Welcome back." : "Create your account."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm leading-6 text-slate-500",
										children: isSignin ? "Sign in to continue to your Market Mitra dashboard." : "Create your Market Mitra account and start making smarter decisions."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: google,
								disabled: busy !== null,
								className: "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.11] bg-white/[0.045] px-4 py-3.5 font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-white/[0.20] hover:bg-white/[0.075] hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
										width: "20",
										height: "20",
										viewBox: "0 0 24 24",
										"aria-hidden": "true",
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												fill: "#4285F4",
												d: "M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												fill: "#34A853",
												d: "M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.5A9.75 9.75 0 0 0 12 21.5Z"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												fill: "#FBBC05",
												d: "M6.53 13.62A5.86 5.86 0 0 1 6.22 12c0-.56.1-1.11.31-1.62v-2.5H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.12l3.25-2.5Z"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												fill: "#EA4335",
												d: "M12 6.35c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.45 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.72 5.38l3.25 2.5 3.25 2.5C7.3 8.07 9.46 6.35 12 6.35Z"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "relative",
										children: busy === "google" ? "Connecting..." : "Continue with Google"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-7 flex items-center gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-white/[0.08]" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-medium tracking-[0.18em] text-slate-600",
										children: "OR CONTINUE WITH EMAIL"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-white/[0.08]" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: submit,
								className: "space-y-4",
								children: [
									!isSignin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-2 block text-xs font-medium text-slate-400",
										children: "Full name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: fullName,
										onChange: (e) => setFullName(e.target.value),
										placeholder: "Enter your full name",
										className: "w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-emerald-500/60 focus:bg-emerald-500/[0.045] focus:ring-4 focus:ring-emerald-500/[0.06]"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-2 block text-xs font-medium text-slate-400",
										children: "Email address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "you@example.com",
											className: "w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-emerald-500/60 focus:bg-emerald-500/[0.045] focus:ring-4 focus:ring-emerald-500/[0.06]"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-2 block text-xs font-medium text-slate-400",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-600" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: showPassword ? "text" : "password",
												value: password,
												onChange: (e) => setPassword(e.target.value),
												placeholder: "Enter your password",
												className: "w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-emerald-500/60 focus:bg-emerald-500/[0.045] focus:ring-4 focus:ring-emerald-500/[0.06]"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setShowPassword((value) => !value),
												className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-300",
												"aria-label": showPassword ? "Hide password" : "Show password",
												children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-[18px] w-[18px]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-[18px] w-[18px]" })
											})
										]
									})] }),
									error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300",
										children: error
									}),
									notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm leading-5 text-emerald-300",
										children: notice
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: busy !== null,
										className: "group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(16,185,129,0.20)] transition-all duration-300 hover:from-emerald-500 hover:to-green-400 hover:shadow-[0_14px_40px_rgba(16,185,129,0.30)] disabled:cursor-not-allowed disabled:opacity-60",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "relative",
												children: busy === "email" ? isSignin ? "Signing in..." : "Creating account..." : isSignin ? "Sign in" : "Create account"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "relative h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 text-center text-sm text-slate-500",
								children: [
									isSignin ? "Don't have an account?" : "Already have an account?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setMode(isSignin ? "signup" : "signin");
											setError(null);
											setNotice(null);
										},
										className: "font-semibold text-emerald-400 transition-colors hover:text-green-300",
										children: isSignin ? "Create one" : "Sign in"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 lg:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-[0.16em] text-slate-600",
										children: "Market Mitra"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-sm font-semibold text-white",
										children: "Created by Om Labhade"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/about",
										className: "text-xs font-medium text-emerald-400",
										children: "About"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 flex items-center justify-center gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										className: "text-xs text-slate-600 transition-colors hover:text-slate-400",
										children: "Back to Market Mitra"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full bg-slate-700" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 text-xs text-slate-700",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), "Secure authentication"]
									})
								]
							})
						]
					})]
				})]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
