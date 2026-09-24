import { i as __toESM } from "../_runtime.mjs";
import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { M as useServerFn, k as createSsrRpc, r as LogoMark } from "./router-5yV9beqj.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { t as supabase } from "./client-CoPqTDtD.mjs";
import { a as objectType, n as booleanType, o as stringType } from "../_libs/zod.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as Sparkles, Et as Database, It as CircleCheck, N as ShieldCheck, Pt as CircleX, R as RefreshCw, St as EyeOff, Vt as ChartColumn, Zt as Activity, b as ToggleLeft, et as LogOut, m as TriangleAlert, nt as LockKeyhole, rt as LoaderCircle, u as Users, xt as Eye, y as ToggleRight } from "../_libs/lucide-react.mjs";
import { r as getProviderDiagnostics } from "./market-prices.functions-DrkprgBp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-C-D9pBo2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("2b97112c91f9366ddeba9c0a0772794613596207065806955c5ef8594bbf3232"));
var getAdminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01"));
/**
* Upstream service + government dataset health.
* Kept separate from the overview so slow third parties never block the
* admin dashboard from rendering its own data.
*/
var getAdminHealth = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5944aa3e3ccb9ff594d941b2448e1a2ecafc905fe7a309b706c082e8fea6a10a"));
/**
* Get admin feature switches.
*/
var getAdminFeatureFlags = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("f8e1cf338e299e7cb3e0fa5203215998dd49c1493c730b6db12ac7c8129cb95a"));
/**
* Enable / disable a feature.
*/
var setFeatureFlag = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	key: stringType().min(1).max(64),
	enabled: booleanType(),
	message: stringType().max(400).nullable().optional(),
	reason: stringType().max(120).nullable().optional()
}).parse(input)).handler(createSsrRpc("cd91837fdccd103768260bacbee75de8f2fa6250ae92bb672362a19dc52557d1"));
/**
* Get recent admin activity.
*/
var getAdminAuditLog = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("506b7d621d4a698462a6f4bd14ccd5e34ad849c50db6ac21d4d807f9b9861a2a"));
/** Professional, farmer-readable maintenance reasons. */
var MAINTENANCE_REASONS = [
	"Scheduled maintenance",
	"Upstream data source unavailable",
	"Performance issue under investigation",
	"Accuracy verification in progress"
];
function useAdminAuth() {
	const [state, setState] = (0, import_react.useState)({
		ready: false,
		email: null,
		isAdmin: false
	});
	(0, import_react.useEffect)(() => {
		let alive = true;
		const checkAdmin = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user) {
				if (alive) setState({
					ready: true,
					email: null,
					isAdmin: false
				});
				return;
			}
			const { data: role, error } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
			if (!alive) return;
			setState({
				ready: true,
				email: session.user.email ?? null,
				isAdmin: !error && role?.role === "admin"
			});
		};
		checkAdmin();
		const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
			checkAdmin();
		});
		return () => {
			alive = false;
			subscription.unsubscribe();
		};
	}, []);
	return state;
}
function AdminPage() {
	const { ready, email, isAdmin } = useAdminAuth();
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-[oklch(0.15_0.02_160)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-[oklch(0.85_0.02_150)]" })
	});
	if (!email) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLogin, {});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unauthorized, { email });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminConsole, { email });
}
function AdminLogin() {
	const [emailValue, setEmailValue] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [show, setShow] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: emailValue.trim(),
			password
		});
		if (signInError) {
			setBusy(false);
			setError("Those credentials were not accepted.");
			return;
		}
		setBusy(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative grid min-h-screen place-items-center overflow-hidden bg-[oklch(0.14_0.02_160)] px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -top-32 left-1/2 size-[420px] -translate-x-1/2 animate-breathe rounded-full bg-[oklch(0.7_0.16_150/0.18)] blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute bottom-[-140px] right-[-80px] size-[360px] animate-breathe rounded-full bg-[oklch(0.6_0.12_200/0.14)] blur-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "animate-rise relative w-full max-w-sm rounded-3xl border border-[oklch(1_0_0/0.12)] bg-[oklch(1_0_0/0.05)] p-7 backdrop-blur-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 place-items-center rounded-2xl bg-[oklch(1_0_0/0.08)] ring-1 ring-[oklch(1_0_0/0.14)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-7" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-base font-extrabold text-[oklch(0.98_0.01_140)]",
							children: ["Market", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[oklch(0.8_0.17_150)]",
								children: "Mitra"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.75_0.03_150)]",
							children: "Control Center"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-7 font-display text-xl font-bold text-[oklch(0.98_0.01_140)]",
						children: "Private access"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-[oklch(0.78_0.02_150)]",
						children: "Authorised operators only. Every action is logged."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-6 block text-[11px] font-bold uppercase tracking-wider text-[oklch(0.75_0.03_150)]",
						children: "Email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						required: true,
						autoComplete: "username",
						value: emailValue,
						onChange: (e) => setEmailValue(e.target.value),
						className: "mt-1.5 h-12 w-full rounded-2xl border border-[oklch(1_0_0/0.14)] bg-[oklch(1_0_0/0.06)] px-4 text-sm text-[oklch(0.98_0.01_140)] outline-none placeholder:text-[oklch(0.68_0.02_150)] focus:border-[oklch(0.7_0.16_150/0.6)]",
						placeholder: "you@example.com"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-[11px] font-bold uppercase tracking-wider text-[oklch(0.75_0.03_150)]",
						children: "Password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: show ? "text" : "password",
							required: true,
							autoComplete: "current-password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "h-12 w-full rounded-2xl border border-[oklch(1_0_0/0.14)] bg-[oklch(1_0_0/0.06)] px-4 pr-12 text-sm text-[oklch(0.98_0.01_140)] outline-none focus:border-[oklch(0.7_0.16_150/0.6)]",
							placeholder: "••••••••"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShow((v) => !v),
							"aria-label": show ? "Hide password" : "Show password",
							className: "absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.75_0.03_150)]",
							children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 flex items-center gap-2 rounded-2xl bg-[oklch(0.55_0.18_25/0.16)] px-3 py-2 text-xs font-semibold text-[oklch(0.9_0.06_30)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 shrink-0" }), error]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						disabled: busy,
						className: "press mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.62_0.15_150)] text-sm font-bold text-[oklch(0.13_0.02_160)] disabled:opacity-60",
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "size-4" }), busy ? "Verifying…" : "Sign in"]
					})
				]
			})
		]
	});
}
function Unauthorized({ email }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-[oklch(0.14_0.02_160)] px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-[oklch(1_0_0/0.1)] bg-[oklch(1_0_0/0.05)] p-7 text-center backdrop-blur-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid size-14 place-items-center rounded-2xl bg-[oklch(0.55_0.18_25/0.14)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-7 text-[oklch(0.8_0.08_25)]" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 font-display text-xl font-bold text-[oklch(0.98_0.01_140)]",
					children: "Not authorised"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-relaxed text-[oklch(0.78_0.02_150)]",
					children: [
						"The account",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-1 font-semibold text-[oklch(0.9_0.02_150)]",
							children: email
						}),
						"is signed in, but it does not have administrator access."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void supabase.auth.signOut(),
					className: "press mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(1_0_0/0.08)] text-sm font-bold text-[oklch(0.95_0.01_145)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
				})
			]
		})
	});
}
function AdminConsole({ email }) {
	const overviewFn = useServerFn(getAdminOverview);
	const flagsFn = useServerFn(getAdminFeatureFlags);
	const auditFn = useServerFn(getAdminAuditLog);
	const healthFn = useServerFn(getAdminHealth);
	const diagnosticsFn = useServerFn(getProviderDiagnostics);
	const updateFlag = useServerFn(setFeatureFlag);
	const qc = useQueryClient();
	const overview = useQuery({
		queryKey: ["admin", "overview"],
		queryFn: () => overviewFn(),
		retry: false,
		refetchInterval: 6e4
	});
	const flags = useQuery({
		queryKey: ["admin", "flags"],
		queryFn: () => flagsFn(),
		retry: false
	});
	const audit = useQuery({
		queryKey: ["admin", "audit"],
		queryFn: () => auditFn(),
		retry: false
	});
	const health = useQuery({
		queryKey: ["admin", "health"],
		queryFn: () => healthFn(),
		retry: false,
		refetchInterval: 12e4
	});
	const diagnostics = useQuery({
		queryKey: ["admin", "provider-diagnostics"],
		queryFn: () => diagnosticsFn(),
		retry: false,
		refetchInterval: 12e4
	});
	const toggle = useMutation({
		mutationFn: (vars) => updateFlag({ data: vars }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin", "flags"] });
			qc.invalidateQueries({ queryKey: ["admin", "audit"] });
			qc.invalidateQueries({ queryKey: ["feature-flags"] });
		}
	});
	const forbidden = overview.isError && /forbidden/i.test(String(overview.error?.message ?? ""));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[oklch(0.14_0.02_160)] text-[oklch(0.95_0.01_145)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-20 flex items-center gap-3 border-b border-[oklch(1_0_0/0.08)] bg-[oklch(0.14_0.02_160/0.86)] px-4 py-3 backdrop-blur-xl lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-8" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm font-extrabold",
						children: "Control Center"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] text-[oklch(0.75_0.02_150)]",
						children: email
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void overview.refetch(),
						className: "press grid size-9 place-items-center rounded-full bg-[oklch(1_0_0/0.07)]",
						"aria-label": "Refresh",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${overview.isFetching ? "animate-spin" : ""}` })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void supabase.auth.signOut(),
						className: "press flex h-9 items-center gap-2 rounded-full bg-[oklch(1_0_0/0.07)] px-3 text-xs font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-6xl px-4 py-6 lg:px-8",
			children: forbidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Not authorised",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-[oklch(0.8_0.02_150)]",
					children: "This account is signed in but does not hold the administrator role, so no operational data is available."
				})
			}) : overview.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-64 place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-[oklch(0.8_0.02_150)]" })
			}) : overview.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Data unavailable",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-[oklch(0.8_0.02_150)]",
					children: "The console could not load operational data just now. Try refreshing."
				})
			}) : overview.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Farmer profiles",
								value: overview.data.users.profiles,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Sessions · 30 days",
								value: overview.data.tracking.sessions,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Sessions · 24 hours",
								value: overview.data.tracking.sessions24h,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Page views · 30 days",
								value: overview.data.tracking.pageViews,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-5 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Feature usage · last 30 days",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsageList, { features: overview.data.tracking.features })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Usage per day",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyChart, { series: overview.data.tracking.daily })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-5 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Popular pages",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows: overview.data.tracking.topPages })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Popular crops",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows: overview.data.tracking.topCrops })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								title: "Devices & languages",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows: overview.data.tracking.devices }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 border-t border-[oklch(1_0_0/0.08)] pt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows: overview.data.tracking.languages })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-5 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Service health",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }),
							children: health.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonLines, { rows: 3 }) : health.isError || !health.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-[oklch(0.8_0.02_150)]",
								children: "Unable to check upstream services right now."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2.5",
								children: health.data.services.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-3 text-sm",
									children: [s.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-4 shrink-0 text-[oklch(0.75_0.16_150)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mt-0.5 size-4 shrink-0 text-[oklch(0.68_0.18_25)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: s.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-[oklch(0.75_0.02_150)]",
											children: [s.detail, s.latencyMs != null ? ` · ${s.latencyMs} ms` : ""]
										})]
									})]
								}, s.name))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-[11px] text-[oklch(0.68_0.02_150)]",
								children: [
									"Checked live at",
									" ",
									new Date(health.data.generatedAt).toLocaleString("en-IN")
								]
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Market data source",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-4" }),
							children: health.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonLines, { rows: 5 }) : health.isError || !health.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-[oklch(0.8_0.02_150)]",
								children: "Unable to read the government dataset status right now."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "space-y-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Source",
										v: health.data.marketData.source
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Reachable",
										v: health.data.marketData.ok ? "Yes" : "No"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Records in dataset",
										v: health.data.marketData.records?.toLocaleString("en-IN") ?? "No data available yet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Latest arrival date",
										v: health.data.marketData.latestArrivalDate ?? "No data available yet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										k: "Source updated",
										v: health.data.marketData.sourceUpdatedAt ?? "Not published"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-[11px] leading-relaxed text-[oklch(0.68_0.02_150)]",
								children: [health.data.marketData.detail, ". Prices are read live from the government dataset and can never be edited from this console."]
							})] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Feature control",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRight, { className: "size-4" }),
						children: flags.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : flags.data && flags.data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-[oklch(1_0_0/0.08)]",
							children: flags.data.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: f.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-[oklch(0.72_0.02_150)]",
										children: f.enabled ? "Live for all farmers" : `Maintenance${f.reason ? ` — ${f.reason}` : ""}`
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: toggle.isPending,
									onClick: () => {
										if (f.enabled) {
											const reason = window.prompt(`Why is ${f.label} going into maintenance? (shown to farmers)`, MAINTENANCE_REASONS[0]);
											if (reason === null) return;
											toggle.mutate({
												key: f.key,
												enabled: false,
												reason: reason.trim() || MAINTENANCE_REASONS[0],
												message: "We are improving this section right now. Everything else in MarketMitra keeps working — please check back a little later."
											});
											return;
										}
										toggle.mutate({
											key: f.key,
											enabled: true,
											reason: null,
											message: null
										});
									},
									className: "press ml-auto shrink-0",
									"aria-label": `${f.enabled ? "Disable" : "Enable"} ${f.label}`,
									children: f.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRight, { className: "size-9 text-[oklch(0.75_0.16_150)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "size-9 text-[oklch(0.6_0.02_150)]" })
								})]
							}, f.key))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-[oklch(0.78_0.02_150)]",
							children: "No feature switches found."
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Market data providers",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "size-4" }),
						children: diagnostics.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonLines, { rows: 3 }) : diagnostics.isError || !diagnostics.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-[oklch(0.8_0.02_150)]",
							children: "Provider diagnostics are unavailable right now."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-3 text-[11px] text-[oklch(0.72_0.02_150)]",
							children: [
								"Overall ",
								diagnostics.data.overall.replace("_", " "),
								" ·",
								" ",
								diagnostics.data.latestDataDate ? `latest official data date ${diagnostics.data.latestDataDate}` : "no official data date recorded"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2.5",
							children: diagnostics.data.providers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-[oklch(1_0_0/0.05)] p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-xs font-bold",
											children: p.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto shrink-0 rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 text-[10px] font-bold uppercase",
											children: p.status.replace("_", " ")
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-[11px] text-[oklch(0.72_0.02_150)]",
										children: [
											"priority ",
											p.priority,
											" · ",
											p.coverage,
											p.requiresKey ? p.configured ? " · key configured" : " · key missing" : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-[11px] text-[oklch(0.72_0.02_150)]",
										children: [
											p.successes24h,
											"/",
											p.attempts24h,
											" calls ok · 24h ·",
											" ",
											p.lastDurationMs === null ? "no latency yet" : `${p.lastDurationMs} ms last call`,
											p.lastRecordCount === null ? "" : ` · ${p.lastRecordCount} rows`
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-[11px] text-[oklch(0.65_0.02_150)]",
										children: [
											"last success ",
											p.lastSuccessAt ?? "—",
											p.lastError ? ` · last error: ${p.lastError}` : ""
										]
									})
								]
							}, p.id))
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-5 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							title: "Recent activity",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" }),
							children: [overview.data.tracking.recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-xs",
								children: overview.data.tracking.recent.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 font-semibold",
											children: r.event.replace(/_/g, " ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-[oklch(0.75_0.02_150)]",
											children: r.label ?? r.page ?? ""
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto shrink-0 text-[oklch(0.65_0.02_150)]",
											children: new Date(r.at).toLocaleTimeString("en-IN", { hour12: false })
										})
									]
								}, `${r.at}-${i}`))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-[11px] leading-relaxed text-[oklch(0.68_0.02_150)]",
								children: "Aggregate, anonymous events only — no names, contacts, coordinates or Mitra AI message contents are recorded."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Admin audit log",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }),
							children: audit.data && audit.data.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-xs",
								children: audit.data.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-[oklch(1_0_0/0.08)] px-2 py-0.5 font-semibold",
											children: a.action.replace(/_/g, " ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-[oklch(0.75_0.02_150)]",
											children: JSON.stringify(a.detail)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto shrink-0 text-[oklch(0.65_0.02_150)]",
											children: new Date(a.created_at).toLocaleString("en-IN")
										})
									]
								}, a.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {})
						})]
					})
				]
			})
		})]
	});
}
function Panel({ title, icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-5 backdrop-blur-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[oklch(0.76_0.03_150)]",
			children: [icon, title]
		}), children]
	});
}
function Stat({ label, value, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[oklch(0.74_0.03_150)]",
			children: [icon, label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-2xl font-extrabold",
			children: value.toLocaleString("en-IN")
		})]
	});
}
function Empty() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-[oklch(0.75_0.02_150)]",
		children: "No data available yet."
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[oklch(0.74_0.02_150)]",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-right font-semibold",
			children: v
		})]
	});
}
function Bars({ rows }) {
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {});
	const max = Math.max(...rows.map((r) => r.count));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate font-semibold",
				children: r.key
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[oklch(0.74_0.02_150)]",
				children: r.count.toLocaleString("en-IN")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 h-1.5 rounded-full bg-[oklch(1_0_0/0.08)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full bg-[oklch(0.7_0.16_150)]",
				style: { width: `${Math.max(4, r.count / max * 100)}%` }
			})
		})] }, r.key))
	});
}
function DailyChart({ series }) {
	if (series.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {});
	const max = Math.max(...series.map((s) => s.count));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-32 items-end gap-1",
		children: series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "group flex-1",
			title: `${s.day}: ${s.count}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full rounded-t bg-[oklch(0.7_0.16_150)] transition-all group-hover:bg-[oklch(0.8_0.17_150)]",
				style: { height: `${Math.max(3, s.count / max * 120)}px` }
			})
		}, s.day))
	});
}
function UsageList({ features }) {
	const rows = [
		{
			key: "Market searches",
			count: features.marketSearches
		},
		{
			key: "Weather lookups",
			count: features.weatherLookups
		},
		{
			key: "Diagnoses started",
			count: features.diagnoseStarted
		},
		{
			key: "Diagnoses completed",
			count: features.diagnoseCompleted
		},
		{
			key: "Diagnosis failures",
			count: features.diagnoseFailed
		},
		{
			key: "Mitra AI conversations",
			count: features.mitraConversations
		},
		{
			key: "Mitra AI questions",
			count: features.mitraMessages
		},
		{
			key: "Mitra AI errors",
			count: features.mitraErrors
		},
		{
			key: "Scheme views",
			count: features.schemeViews
		}
	];
	if (rows.every((r) => r.count === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, { rows });
}
function SkeletonLines({ rows = 3 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 animate-pulse rounded-lg bg-[oklch(1_0_0/0.07)]" }, i))
	});
}
//#endregion
export { AdminPage as component };
