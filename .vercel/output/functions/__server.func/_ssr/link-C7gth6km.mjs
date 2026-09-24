import { i as __toESM } from "../_runtime.mjs";
import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { A as useAuth, C as useLocationContext, k as createSsrRpc } from "./router-5yV9beqj.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { t as supabase } from "./client-CoPqTDtD.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as Sparkles, B as Plus, F as Search, H as Phone, It as CircleCheck, K as Package, Kt as BadgeCheck, Nt as Clock3, Q as MapPin, Ut as CalendarDays, V as Play, W as Pause, Zt as Activity, _ as Trash2, dt as ImageOff, f as Upload, mt as Handshake, n as X, rt as LoaderCircle, u as Users, v as Tractor } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { t as Reveal } from "./reveal-D72UnnwF.mjs";
import { a as inr } from "./format-BFmz3HAI.mjs";
import { a as approxDistance, c as shareCost, i as RESOURCE_TYPES, l as typeLabel, n as PRICING_LABELS, r as PRICING_MODELS, t as MACHINE_TYPES } from "./link-types-BaOqjWyg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/link-C7gth6km.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var resourceTypes = [...MACHINE_TYPES, ...RESOURCE_TYPES];
var requestSchema = objectType({
	category: enumType(["machine", "resource"]),
	resource_type: enumType(resourceTypes),
	needed_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
	time_from: stringType().max(10).optional().nullable(),
	time_to: stringType().max(10).optional().nullable(),
	quantity: numberType().int().positive().max(1e4).optional().nullable(),
	note: stringType().trim().max(400).optional().nullable(),
	state: stringType().trim().max(80).optional().nullable(),
	district: stringType().trim().max(80).optional().nullable(),
	latitude: numberType().min(-90).max(90).optional().nullable(),
	longitude: numberType().min(-180).max(180).optional().nullable(),
	budget_mode: enumType([
		"none",
		"max",
		"range",
		"negotiable"
	]),
	budget_min: numberType().nonnegative().max(1e7).optional().nullable(),
	budget_max: numberType().nonnegative().max(1e7).optional().nullable(),
	budget_unit: stringType().trim().max(30).optional().nullable()
});
var listingSchema = objectType({
	category: enumType(["machine", "resource"]),
	resource_type: enumType(resourceTypes),
	name: stringType().trim().min(2).max(90),
	description: stringType().trim().max(600).optional().nullable(),
	condition: stringType().trim().max(40).optional().nullable(),
	pricing_model: enumType([
		"free",
		"per_hour",
		"per_day",
		"per_acre",
		"per_unit",
		"fixed",
		"negotiable"
	]),
	price: numberType().nonnegative().max(1e7).optional().nullable(),
	negotiable: booleanType(),
	quantity: numberType().int().positive().max(1e4).optional().nullable(),
	unit: stringType().trim().max(30).optional().nullable(),
	service_area: stringType().trim().max(120).optional().nullable(),
	state: stringType().trim().max(80).optional().nullable(),
	district: stringType().trim().max(80).optional().nullable(),
	latitude: numberType().min(-90).max(90).optional().nullable(),
	longitude: numberType().min(-180).max(180).optional().nullable(),
	available_from: stringType().min(8),
	available_to: stringType().min(8),
	photos: arrayType(stringType().trim().max(300)).max(5),
	terms: stringType().trim().max(400).optional().nullable()
});
var listingUpdateSchema = listingSchema.extend({ listingId: stringType().uuid() });
var getLinkOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("c45e6ed75be31648e54a049265a21e9f5c669bd4db409bf3767bafe2c01fc260"));
var createLinkRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => requestSchema.parse(data)).handler(createSsrRpc("1b42b974abb54823260e44cf11b26c2085725a075acea360a61587f71aa7f7fb"));
var createLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => listingSchema.parse(data)).handler(createSsrRpc("39d007e917b979ad787a71814df1e9d3a04bc28877736210a52ab8a3a42ce355"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => listingUpdateSchema.parse(data)).handler(createSsrRpc("668f1ff35780c62c5f8c185b6ff6fa8c1dab63120f65c982101efa8a165c7cea"));
/**
* Pause a listing.
*
* Pausing keeps the listing and its history but removes it
* from active matching until the owner resumes it.
*/
var pauseLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ listingId: stringType().uuid() }).parse(data)).handler(createSsrRpc("df47e3d1ccd479e0a8800fcdf421fefadc9aeb8a979dde83224edf1730f37edd"));
/**
* Resume a paused listing.
*/
var resumeLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ listingId: stringType().uuid() }).parse(data)).handler(createSsrRpc("682e0127481828476c12268680374680d367d77812cfa78e5154857c451f23a7"));
/**
* Extend the availability period of a listing.
*
* This is intentionally separate from the full edit function
* so the UI can offer a quick "Extend" action.
*/
var extendLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	listingId: stringType().uuid(),
	availableTo: stringType().min(8)
}).parse(data)).handler(createSsrRpc("4e0b533579d031eccd94150ea3e6c2fba22e43344cbc3405d26a6d943b891c34"));
/**
* Remove a listing from Mitra Link.
*
* This is intentionally implemented as a soft removal instead
* of physically deleting the row. That protects match/request
* history and avoids breaking foreign-key relationships.
*/
var removeLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ listingId: stringType().uuid() }).parse(data)).handler(createSsrRpc("2b744278e04f0b8069d0c1bba4cd2a1bb6b429ef989a21b36d48db8f714fff1d"));
var getRequestMatches = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ requestId: stringType().uuid() }).parse(data)).handler(createSsrRpc("e5fd3882f9433f6a48cc6f9803436985d23c761dcc6fd4c177ea4ef7a0c3abe9"));
var createMatchRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	requestId: stringType().uuid(),
	listingId: stringType().uuid()
}).parse(data)).handler(createSsrRpc("67e445e6abed89745f6cc1db1d45cfce0c549adbbfb6806c7d4fb46e2b32a358"));
var updateMatchStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	matchId: stringType().uuid(),
	status: enumType([
		"accepted",
		"rejected",
		"scheduled",
		"in_progress",
		"completed",
		"cancelled"
	])
}).parse(data)).handler(createSsrRpc("2647dff3691409ae64e7655ebcc19f75f1819deaf9edea6a811345a32d8ffefd"));
/**
* Reveals the provider's verified mobile number only
* inside an accepted match.
*/
var getMatchContact = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ matchId: stringType().uuid() }).parse(data)).handler(createSsrRpc("97d2830899ba42f8e882f2623b0e3616dc41a1c9a7ff03bcd6d32bf0e8c99bcc"));
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5",
			children
		})]
	});
}
var inputClass = "h-12 w-full rounded-2xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary";
function Chips({ options, value, onChange, labelFor }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(option),
			className: `press rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors ${value === option ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`,
			children: labelFor ? labelFor(option) : typeLabel(option)
		}, option))
	});
}
function Empty({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs font-semibold text-muted-foreground",
		children: text
	});
}
function Photo({ url, className = "" }) {
	if (!url) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `grid place-items-center rounded-2xl bg-muted text-[10px] font-bold text-muted-foreground ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, { className: "size-4" }), "Photo not provided"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: url,
		alt: "Listed farm resource",
		loading: "lazy",
		className: `rounded-2xl object-cover ${className}`
	});
}
function priceLine(pricing, price) {
	if (pricing === "free") return "Free";
	if (price == null) return pricing === "negotiable" ? "Negotiable" : "Price not stated";
	const suffix = pricing === "per_hour" ? "/hour" : pricing === "per_day" ? "/day" : pricing === "per_acre" ? "/acre" : pricing === "per_unit" ? "/unit" : "";
	return `${inr(price)}${suffix}`;
}
function LinkPage() {
	const queryClient = useQueryClient();
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [openRequest, setOpenRequest] = (0, import_react.useState)(null);
	const [manageListing, setManageListing] = (0, import_react.useState)(null);
	const overview = useQuery({
		queryKey: ["link-overview"],
		queryFn: () => getLinkOverview(),
		staleTime: 6e4
	});
	const refresh = () => void queryClient.invalidateQueries({ queryKey: ["link-overview"] });
	const data = overview.data;
	const verified = Boolean(data?.profile?.phone_verified);
	const activeListings = data?.listings.filter((listing) => listing.status === "active").length ?? 0;
	const pausedListings = data?.listings.filter((listing) => listing.status === "paused").length ?? 0;
	const providerMatches = data?.matches.filter((match) => match.role === "provider").length ?? 0;
	const activeClusters = data?.clusters?.length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: "Mitra Link",
		subtitle: "Your local farm resource network",
		back: "/home"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-7 px-5 pb-12 pt-5 lg:mx-auto lg:max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-surface relative overflow-hidden p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-widest text-primary",
							children: "Mitra Link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-xl font-extrabold leading-tight lg:text-2xl",
							children: "Share machines and farm resources with verified neighbours"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-6" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: "Every listing, price and availability window here is entered by a real farmer. Nothing is estimated on your behalf."
					})]
				})]
			}) }),
			!overview.isPending && !overview.isError && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveNetwork, {
				activeClusters,
				activeListings,
				pausedListings,
				myRequests: data.requests.length,
				myMatches: data.matches.length,
				providerMatches,
				farmerCount: data.clusters.reduce((sum, cluster) => sum + cluster.farmer_count, 0)
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSheet(sheet === "need" ? null : "need"),
					className: "press card-surface hover-lift flex items-center gap-3 p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-extrabold",
							children: "I NEED"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[11px] text-muted-foreground",
							children: "Find what you need nearby"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSheet(sheet === "have" ? null : "have"),
					className: "press card-surface hover-lift flex items-center gap-3 p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handshake, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-extrabold",
							children: "I HAVE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[11px] text-muted-foreground",
							children: "Share a resource"
						})]
					})]
				})]
			}),
			sheet === "need" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeedForm, {
				onDone: (requestId) => {
					setSheet(null);
					setOpenRequest(requestId);
					refresh();
				},
				onClose: () => setSheet(null)
			}),
			sheet === "have" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HaveForm, {
				verified,
				onDone: () => {
					setSheet(null);
					refresh();
				},
				onClose: () => setSheet(null)
			}),
			openRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchPanel, {
				requestId: openRequest,
				onClose: () => setOpenRequest(null),
				onChanged: refresh
			}),
			manageListing && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingManager, {
				listing: data.listings.find((listing) => listing.id === manageListing) ?? null,
				onClose: () => setManageListing(null),
				onChanged: refresh
			}),
			overview.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Loading your network…"]
			}) : overview.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Mitra Link could not load right now. Please try again." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Live opportunities",
					icon: Users,
					children: data?.clusters?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: data.clusters.map((cluster) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClusterCard, { cluster }, `${cluster.resource_type}-${cluster.window_date}-${cluster.district}`))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No verified opportunities nearby right now." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "My requests",
					icon: Search,
					children: data?.requests.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2.5",
						children: data.requests.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setOpenRequest(request.id),
							className: "press card-surface hover-lift flex w-full items-center gap-3 p-4 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 shrink-0 place-items-center rounded-2xl bg-muted text-primary",
									children: request.category === "machine" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tractor, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-bold",
										children: typeLabel(request.resource_type)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-[11px] text-muted-foreground",
										children: [
											request.needed_date,
											" ·",
											" ",
											request.district ?? "Location not set"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: request.status })
							]
						}, request.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "You have not created a request yet." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "My resources",
					icon: Handshake,
					children: data?.listings.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: data.listings.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceCard, {
							listing,
							onManage: () => setManageListing(listing.id)
						}, listing.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "You have not shared a machine or resource yet." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "My matches",
					icon: Sparkles,
					children: data?.matches.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2.5",
						children: data.matches.map((match) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchRow, {
							match,
							onChanged: refresh
						}, match.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No matches yet. Create a request to start." })
				})
			] })
		]
	})] });
}
function LiveNetwork({ activeClusters, activeListings, pausedListings, myRequests, myMatches, providerMatches, farmerCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface relative overflow-hidden p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-bold uppercase tracking-[0.18em] text-primary",
						children: "Network pulse"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-1 text-sm font-extrabold",
						children: "Your Mitra Link activity"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 animate-pulse rounded-full bg-primary" }), "LIVE"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-4 sm:grid-cols-[150px_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative grid min-h-36 place-items-center overflow-hidden rounded-3xl border border-border bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute size-28 animate-pulse rounded-full border border-primary/10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute size-20 rounded-full border border-primary/20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute size-12 rounded-full border border-primary/30" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "relative grid size-10 place-items-center rounded-full bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-5" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStat, {
								label: "Active resources",
								value: activeListings
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStat, {
								label: "Opportunities",
								value: activeClusters
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStat, {
								label: "My requests",
								value: myRequests
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStat, {
								label: "My matches",
								value: myMatches
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStat, {
								label: "Provider matches",
								value: providerMatches
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkStat, {
								label: "Paused resources",
								value: pausedListings
							})
						]
					})]
				}),
				farmerCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-2 rounded-2xl bg-muted/40 px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] font-semibold text-muted-foreground",
						children: [
							"Current opportunity clusters represent",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-extrabold text-foreground",
								children: farmerCount
							}),
							" ",
							"farmer requests."
						]
					})]
				})
			]
		})]
	});
}
function NetworkStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-extrabold leading-none",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground",
			children: label
		})]
	});
}
function ResourceCard({ listing, onManage }) {
	const availability = getAvailabilityState(listing.available_from, listing.available_to, listing.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface hover-lift overflow-hidden p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Photo, {
				url: listing.photoUrls[0],
				className: "h-36 w-full"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-2.5 top-2.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: listing.status })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-extrabold",
							children: listing.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: typeLabel(listing.resource_type)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onManage,
						className: "press grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary",
						"aria-label": `Manage ${listing.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-extrabold text-primary",
						children: priceLine(listing.pricing_model, listing.price)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold text-muted-foreground",
						children: availability.label
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 h-1.5 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `h-full rounded-full transition-all ${availability.progress === 100 ? "bg-muted-foreground" : "bg-primary"}`,
						style: { width: `${availability.progress}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] text-muted-foreground",
						children: [
							new Date(listing.available_from).toLocaleDateString("en-IN"),
							" –",
							" ",
							new Date(listing.available_to).toLocaleDateString("en-IN")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onManage,
						className: "press text-[10px] font-extrabold text-primary",
						children: "Manage"
					})]
				})
			]
		})]
	});
}
function getAvailabilityState(from, to, status) {
	const now = Date.now();
	const start = new Date(from).getTime();
	const end = new Date(to).getTime();
	if (status === "removed") return {
		label: "Removed",
		progress: 100
	};
	if (status === "paused") return {
		label: "Paused",
		progress: 50
	};
	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return {
		label: "Availability set",
		progress: 0
	};
	if (now < start) {
		const days = Math.ceil((start - now) / 864e5);
		return {
			label: days <= 1 ? "Starts tomorrow" : `Starts in ${days}d`,
			progress: 0
		};
	}
	if (now >= end) return {
		label: "Expired",
		progress: 100
	};
	const progress = Math.min(100, Math.max(0, (now - start) / (end - start) * 100));
	return {
		label: `${Math.max(1, Math.ceil((end - now) / 864e5))}d remaining`,
		progress
	};
}
function ListingManager({ listing, onClose, onChanged }) {
	const [newDate, setNewDate] = (0, import_react.useState)("");
	const [confirmRemove, setConfirmRemove] = (0, import_react.useState)(false);
	const pause = useMutation({
		mutationFn: () => pauseLinkListing({ data: { listingId: listing?.id ?? "" } }),
		onSuccess: () => {
			toast.success("Listing paused. It is no longer available for matching.");
			onChanged();
			onClose();
		},
		onError: (error) => toast.error(error.message)
	});
	const resume = useMutation({
		mutationFn: () => resumeLinkListing({ data: { listingId: listing?.id ?? "" } }),
		onSuccess: () => {
			toast.success("Listing is live again.");
			onChanged();
			onClose();
		},
		onError: (error) => toast.error(error.message)
	});
	const extend = useMutation({
		mutationFn: () => extendLinkListing({ data: {
			listingId: listing?.id ?? "",
			availableTo: newDate
		} }),
		onSuccess: () => {
			toast.success("Availability extended and listing is live.");
			onChanged();
			onClose();
		},
		onError: (error) => toast.error(error.message)
	});
	const remove = useMutation({
		mutationFn: () => removeLinkListing({ data: { listingId: listing?.id ?? "" } }),
		onSuccess: () => {
			toast.success("Resource removed from Mitra Link.");
			onChanged();
			onClose();
		},
		onError: (error) => toast.error(error.message)
	});
	if (!listing) return null;
	const availability = getAvailabilityState(listing.available_from, listing.available_to, listing.status);
	const isBusy = pause.isPending || resume.isPending || extend.isPending || remove.isPending;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface animate-page space-y-5 border-t-4 border-t-primary p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-bold uppercase tracking-widest text-primary",
							children: "Resource management"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-1 truncate text-lg font-extrabold",
							children: listing.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: typeLabel(listing.resource_type)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Close",
					className: "press grid size-8 shrink-0 place-items-center rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-[120px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Photo, {
					url: listing.photoUrls[0],
					className: "h-28 w-full sm:h-28"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold",
							children: priceLine(listing.pricing_model, listing.price)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: listing.status })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl bg-muted/50 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5 text-primary" }), "Availability"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-extrabold text-primary",
									children: availability.label
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 h-2 overflow-hidden rounded-full bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-primary transition-all",
									style: { width: `${availability.progress}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-[10px] text-muted-foreground",
								children: [
									new Date(listing.available_from).toLocaleDateString("en-IN"),
									" ",
									"→",
									" ",
									new Date(listing.available_to).toLocaleDateString("en-IN")
								]
							})
						]
					})]
				})]
			}),
			listing.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-relaxed text-muted-foreground",
					children: listing.description
				})]
			}),
			listing.service_area && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 rounded-2xl bg-muted/40 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
					children: "Service area"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold",
					children: listing.service_area
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
						children: "Quick actions"
					}),
					listing.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: isBusy,
						onClick: () => pause.mutate(),
						className: "press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-xl bg-muted text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-extrabold",
							children: "Pause listing"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] text-muted-foreground",
							children: "Temporarily stop new matches without deleting your resource"
						})] })]
					}),
					listing.status === "paused" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: isBusy,
						onClick: () => resume.mutate(),
						className: "press flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-left disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-extrabold",
							children: "Resume listing"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] text-muted-foreground",
							children: "Make this resource available for matching again"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-xl bg-muted text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-extrabold",
									children: "Extend availability"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Choose a new availability end date"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: newDate,
								min: listing.available_to.slice(0, 10),
								onChange: (event) => setNewDate(event.target.value),
								className: `${inputClass} flex-1`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !newDate || isBusy,
								onClick: () => extend.mutate(),
								className: "press rounded-2xl bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50",
								children: "Extend"
							})]
						})]
					}),
					!confirmRemove ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: isBusy,
						onClick: () => setConfirmRemove(true),
						className: "press flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-left disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-xl bg-destructive/10 text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-extrabold text-destructive",
							children: "Remove from listing"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] text-muted-foreground",
							children: "Hide this resource from Mitra Link permanently"
						})] })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-destructive/30 bg-destructive/5 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-extrabold text-destructive",
									children: "Remove this resource?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] leading-relaxed text-muted-foreground",
									children: "The listing will no longer appear as an available resource. Your existing match history remains protected."
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setConfirmRemove(false),
								className: "press flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold",
								children: "Keep listing"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: remove.isPending,
								onClick: () => remove.mutate(),
								className: "press flex-1 rounded-2xl bg-destructive py-2.5 text-xs font-bold text-destructive-foreground disabled:opacity-60",
								children: remove.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-4 animate-spin" }) : "Remove"
							})]
						})]
					})
				]
			}),
			isBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center justify-center gap-2 text-[10px] font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), "Updating your resource…"]
			})
		]
	});
}
function Section({ title, icon: Icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "flex items-center gap-2 text-sm font-bold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }), title]
		}), children]
	});
}
function StatusPill({ status }) {
	const normalized = status.toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${normalized === "active" || normalized === "accepted" ? "bg-primary/10 text-primary" : normalized === "paused" ? "bg-earthy/10 text-earthy" : normalized === "removed" || normalized === "rejected" || normalized === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`,
		children: status.replace(/\_/g, " ")
	});
}
function ClusterCard({ cluster }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface hover-lift relative overflow-hidden p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-6 -top-6 size-20 rounded-full bg-primary/5 blur-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-bold uppercase tracking-widest text-primary",
						children: "Cluster opportunity found"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-extrabold",
						children: typeLabel(cluster.resource_type)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 place-items-center rounded-xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[11px] text-muted-foreground",
					children: [
						cluster.farmer_count,
						" farmers need this on",
						" ",
						cluster.window_date,
						cluster.district ? ` · ${cluster.district}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[11px] leading-relaxed text-muted-foreground",
					children: "If a provider states a price, the cost can be split equally between the farmers who confirm. MarketMitra does not promise a discount."
				})
			]
		})]
	});
}
function NeedForm({ onDone, onClose }) {
	const { location } = useLocationContext();
	const [category, setCategory] = (0, import_react.useState)("machine");
	const [resourceType, setResourceType] = (0, import_react.useState)(MACHINE_TYPES[0]);
	const [neededDate, setNeededDate] = (0, import_react.useState)("");
	const [timeFrom, setTimeFrom] = (0, import_react.useState)("");
	const [timeTo, setTimeTo] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [budgetMode, setBudgetMode] = (0, import_react.useState)("none");
	const [budgetMin, setBudgetMin] = (0, import_react.useState)("");
	const [budgetMax, setBudgetMax] = (0, import_react.useState)("");
	const types = category === "machine" ? MACHINE_TYPES : RESOURCE_TYPES;
	const mutation = useMutation({
		mutationFn: () => createLinkRequest({ data: {
			category,
			resource_type: resourceType,
			needed_date: neededDate,
			time_from: timeFrom || null,
			time_to: timeTo || null,
			quantity: quantity ? Number(quantity) : null,
			note: note.trim() || null,
			state: location?.state ?? null,
			district: location?.district ?? null,
			latitude: location?.latitude ?? null,
			longitude: location?.longitude ?? null,
			budget_mode: budgetMode,
			budget_min: budgetMode === "range" && budgetMin ? Number(budgetMin) : null,
			budget_max: (budgetMode === "range" || budgetMode === "max") && budgetMax ? Number(budgetMax) : null,
			budget_unit: null
		} }),
		onSuccess: (result) => {
			toast.success("Request created — MarketMitra is looking for compatible matches.");
			onDone(result.id);
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface animate-page space-y-4 border-t-4 border-t-earthy p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-extrabold",
					children: "I NEED"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Tell us what you need and when."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Close",
					className: "press grid size-8 place-items-center rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Category",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					options: ["machine", "resource"],
					value: category,
					onChange: (next) => {
						setCategory(next);
						setResourceType(next === "machine" ? MACHINE_TYPES[0] : RESOURCE_TYPES[0]);
					},
					labelFor: (v) => v === "machine" ? "Machine" : "Resource"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Type",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					options: types,
					value: resourceType,
					onChange: (next) => setResourceType(next)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Required date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: neededDate,
							onChange: (e) => setNeededDate(e.target.value),
							className: inputClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "From (optional)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "time",
							value: timeFrom,
							onChange: (e) => setTimeFrom(e.target.value),
							className: inputClass
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "To (optional)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "time",
							value: timeTo,
							onChange: (e) => setTimeTo(e.target.value),
							className: inputClass
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Quantity (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "numeric",
						value: quantity,
						onChange: (e) => setQuantity(e.target.value.replace(/\D/g, "")),
						className: inputClass
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Approximate location",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-xs font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4 text-primary" }), location ? `${location.district || location.city}, ${location.state}` : "Set your location first"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Budget",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					options: [
						"none",
						"max",
						"range",
						"negotiable"
					],
					value: budgetMode,
					onChange: setBudgetMode,
					labelFor: (v) => v === "none" ? "No fixed budget" : v === "max" ? "Maximum budget" : v === "range" ? "Budget range" : "Negotiable"
				})
			}),
			(budgetMode === "max" || budgetMode === "range") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [budgetMode === "range" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Minimum ₹",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "numeric",
						value: budgetMin,
						onChange: (e) => setBudgetMin(e.target.value.replace(/\D/g, "")),
						className: inputClass
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Maximum ₹",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "numeric",
						value: budgetMax,
						onChange: (e) => setBudgetMax(e.target.value.replace(/\D/g, "")),
						className: inputClass
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Note (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: note,
					maxLength: 400,
					onChange: (e) => setNote(e.target.value),
					className: "min-h-20 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => mutation.mutate(),
				disabled: !neededDate || mutation.isPending,
				className: "press grad-primary flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground disabled:opacity-60",
				children: [mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Create request"]
			})
		]
	});
}
function HaveForm({ verified, onDone, onClose }) {
	const { user } = useAuth();
	const { location } = useLocationContext();
	const [category, setCategory] = (0, import_react.useState)("machine");
	const [resourceType, setResourceType] = (0, import_react.useState)(MACHINE_TYPES[0]);
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [condition, setCondition] = (0, import_react.useState)("");
	const [pricingModel, setPricingModel] = (0, import_react.useState)("per_hour");
	const [price, setPrice] = (0, import_react.useState)("");
	const [negotiable, setNegotiable] = (0, import_react.useState)(false);
	const [quantity, setQuantity] = (0, import_react.useState)("");
	const [unit, setUnit] = (0, import_react.useState)("");
	const [serviceArea, setServiceArea] = (0, import_react.useState)("");
	const [availableFrom, setAvailableFrom] = (0, import_react.useState)("");
	const [availableTo, setAvailableTo] = (0, import_react.useState)("");
	const [terms, setTerms] = (0, import_react.useState)("");
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const types = category === "machine" ? MACHINE_TYPES : RESOURCE_TYPES;
	const upload = async (files) => {
		if (!files?.length || !user) return;
		setUploading(true);
		try {
			for (const file of Array.from(files).slice(0, 5 - photos.length)) {
				if (!file.type.startsWith("image/")) continue;
				const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
				const { error } = await supabase.storage.from("link-photos").upload(path, file, { contentType: file.type });
				if (error) throw new Error(error.message);
				setPhotos((prev) => [...prev, {
					path,
					preview: URL.createObjectURL(file)
				}]);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Photo upload failed");
		} finally {
			setUploading(false);
		}
	};
	const removePhoto = async (path) => {
		await supabase.storage.from("link-photos").remove([path]);
		setPhotos((prev) => prev.filter((photo) => photo.path !== path));
	};
	const mutation = useMutation({
		mutationFn: () => createLinkListing({ data: {
			category,
			resource_type: resourceType,
			name: name.trim(),
			description: description.trim() || null,
			condition: condition.trim() || null,
			pricing_model: pricingModel,
			price: price ? Number(price) : null,
			negotiable,
			quantity: quantity ? Number(quantity) : null,
			unit: unit.trim() || null,
			service_area: serviceArea.trim() || null,
			state: location?.state ?? null,
			district: location?.district ?? null,
			latitude: location?.latitude ?? null,
			longitude: location?.longitude ?? null,
			available_from: availableFrom,
			available_to: availableTo,
			photos: photos.map((photo) => photo.path),
			terms: terms.trim() || null
		} }),
		onSuccess: () => {
			toast.success("Your resource is live for nearby farmers.");
			onDone();
		},
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface animate-page space-y-4 border-t-4 border-t-primary p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-extrabold",
					children: "I HAVE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "You decide the price and availability."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Close",
					className: "press grid size-8 place-items-center rounded-full bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			!verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-[11px] font-semibold text-destructive",
				children: "Verify your mobile number in Settings before sharing a machine or resource. Farmers only see verified providers."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Category",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					options: ["machine", "resource"],
					value: category,
					onChange: (next) => {
						setCategory(next);
						setResourceType(next === "machine" ? MACHINE_TYPES[0] : RESOURCE_TYPES[0]);
					},
					labelFor: (v) => v === "machine" ? "Machine" : "Resource"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Type",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					options: types,
					value: resourceType,
					onChange: (next) => setResourceType(next)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (e) => setName(e.target.value),
						className: inputClass
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Condition (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: condition,
						onChange: (e) => setCondition(e.target.value),
						className: inputClass
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Description (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: description,
					maxLength: 600,
					onChange: (e) => setDescription(e.target.value),
					className: "min-h-20 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Available from",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: availableFrom,
						onChange: (e) => setAvailableFrom(e.target.value),
						className: inputClass
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Available to",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						value: availableTo,
						min: availableFrom || void 0,
						onChange: (e) => setAvailableTo(e.target.value),
						className: inputClass
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Service area (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: serviceArea,
					onChange: (e) => setServiceArea(e.target.value),
					placeholder: "Villages or talukas you can reach",
					className: inputClass
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Pricing model",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chips, {
					options: PRICING_MODELS,
					value: pricingModel,
					onChange: setPricingModel,
					labelFor: (v) => PRICING_LABELS[v]
				})
			}),
			pricingModel !== "free" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Price ₹",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "numeric",
						value: price,
						onChange: (e) => setPrice(e.target.value.replace(/\D/g, "")),
						className: inputClass
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Negotiable",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setNegotiable((v) => !v),
						className: `press h-12 w-full rounded-2xl border text-xs font-bold ${negotiable ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`,
						children: negotiable ? "Open to negotiation" : "Fixed as stated"
					})
				})]
			}),
			category === "resource" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Quantity (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "numeric",
						value: quantity,
						onChange: (e) => setQuantity(e.target.value.replace(/\D/g, "")),
						className: inputClass
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Unit (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: unit,
						onChange: (e) => setUnit(e.target.value),
						placeholder: "crates, pipes…",
						className: inputClass
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Photos (your own photos only, up to 5)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [photos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: photo.preview,
							alt: "Uploaded resource",
							className: "size-20 rounded-2xl object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void removePhoto(photo.path),
							"aria-label": "Remove photo",
							className: "press absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
						})]
					}, photo.path)), photos.length < 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "press grid size-20 cursor-pointer place-items-center rounded-2xl border border-dashed border-border text-[10px] font-bold text-muted-foreground",
						children: [
							uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }),
							uploading ? "Uploading" : "Add photo",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								multiple: true,
								className: "hidden",
								onChange: (e) => void upload(e.target.files)
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Terms (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: terms,
					maxLength: 400,
					onChange: (e) => setTerms(e.target.value),
					className: "min-h-16 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => mutation.mutate(),
				disabled: !verified || !name.trim() || !availableFrom || !availableTo || mutation.isPending,
				className: "press grad-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground disabled:opacity-60",
				children: [mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Share this resource"]
			})
		]
	});
}
function MatchPanel({ requestId, onClose, onChanged }) {
	const matches = useQuery({
		queryKey: ["link-matches", requestId],
		queryFn: () => getRequestMatches({ data: { requestId } })
	});
	const send = useMutation({
		mutationFn: (listingId) => createMatchRequest({ data: {
			requestId,
			listingId
		} }),
		onSuccess: () => {
			toast.success("Match request sent to the provider.");
			matches.refetch();
			onChanged();
		},
		onError: (error) => toast.error(error.message)
	});
	const request = matches.data?.request;
	const budgetLine = (0, import_react.useMemo)(() => {
		if (!request) return null;
		if (request.budget_mode === "max" && request.budget_max != null) return `Up to ${inr(request.budget_max)}`;
		if (request.budget_mode === "range" && request.budget_min != null && request.budget_max != null) return `${inr(request.budget_min)} – ${inr(request.budget_max)}`;
		if (request.budget_mode === "negotiable") return "Negotiable";
		return "No fixed budget";
	}, [request]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface animate-page space-y-4 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-extrabold",
				children: "Match suggestions"
			}), request && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: [
					typeLabel(request.resource_type),
					" ",
					"· ",
					request.needed_date,
					" · Your budget: ",
					budgetLine
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onClose,
				"aria-label": "Close",
				className: "press grid size-8 place-items-center rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}), matches.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-center gap-2 text-xs font-semibold text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Looking for compatible providers…"]
		}) : !matches.data?.candidates.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No verified opportunities nearby right now." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: matches.data.candidates.map((candidate) => {
				const { listing } = candidate;
				const clusterShare = shareCost(listing.price, 2);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-muted/20 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-widest text-primary",
							children: "Mitra match found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Photo, {
								url: listing.photoUrls[0],
								className: "size-24 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-extrabold",
										children: listing.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: typeLabel(listing.resource_type)
									}),
									candidate.providerVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "size-3.5" }), "Verified provider"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 flex items-center gap-1 text-[11px] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), approxDistance(candidate.distanceKm) ?? listing.district ?? "Distance unknown"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-1 text-[11px] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5" }), candidate.availability === "available" ? "Available for your date" : "Needs owner confirmation"]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-2xl bg-muted/60 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
									children: "Price match"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-extrabold",
									children: priceLine(listing.pricing_model, listing.price)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground",
									children: [candidate.priceFit === "within_budget" ? "Within your budget" : candidate.priceFit === "above_budget" ? "Above your stated budget" : candidate.priceFit === "unpriced" ? "Provider has not stated a price" : "You did not set a budget", listing.negotiable ? " · Provider is open to negotiation" : ""]
								}),
								clusterShare != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-[11px] text-muted-foreground",
									children: [
										"Split with one more farmer:",
										" ",
										inr(clusterShare),
										" ",
										"each at the provider's stated price."
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
								children: "Why this match?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-1 space-y-1",
								children: candidate.reasons.map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "text-[11px] text-muted-foreground",
									children: ["· ", reason]
								}, reason))
							})]
						}),
						listing.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[11px] leading-relaxed text-muted-foreground",
							children: listing.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex gap-2",
							children: candidate.existingMatch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex-1 rounded-2xl border border-border py-3 text-center text-xs font-bold text-muted-foreground",
								children: [
									"Match",
									" ",
									candidate.existingMatch.status.replace(/\_/g, " ")
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => send.mutate(listing.id),
								disabled: send.isPending,
								className: "press grad-primary flex-1 rounded-2xl py-3 text-xs font-bold text-primary-foreground disabled:opacity-60",
								children: send.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-4 animate-spin" }) : "Request match"
							})
						})
					]
				}, listing.id);
			})
		})]
	});
}
function MatchRow({ match, onChanged }) {
	const [contact, setContact] = (0, import_react.useState)(null);
	const update = useMutation({
		mutationFn: (status) => updateMatchStatus({ data: {
			matchId: match.id,
			status
		} }),
		onSuccess: () => {
			toast.success("Match updated");
			onChanged();
		},
		onError: (error) => toast.error(error.message)
	});
	const reveal = useMutation({
		mutationFn: () => getMatchContact({ data: { matchId: match.id } }),
		onSuccess: (result) => {
			if (!result?.phone) {
				toast.info("The provider's verified number is not available for this match yet.");
				return;
			}
			setContact(result);
		},
		onError: (error) => toast.error(error.message)
	});
	const canContact = match.status === "accepted" || match.status === "scheduled" || match.status === "in_progress";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface hover-lift min-w-0 border-l-4 border-l-earthy p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm font-bold",
						children: match.listing_name ?? typeLabel(match.resource_type)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-[11px] text-muted-foreground",
						children: [match.role === "provider" ? "You are the provider" : "You requested this", match.needed_date ? ` · ${match.needed_date}` : ""]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: match.status })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					match.role === "provider" && match.status === "requested" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => update.mutate("accepted"),
						disabled: update.isPending,
						className: "press grad-primary rounded-2xl px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "Accept"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => update.mutate("rejected"),
						disabled: update.isPending,
						className: "press rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60",
						children: "Decline"
					})] }),
					canContact && !contact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => reveal.mutate(),
						disabled: reveal.isPending,
						className: "press inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60",
						children: [reveal.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-3.5 text-primary" }), "Contact provider"]
					}),
					canContact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => update.mutate("completed"),
						disabled: update.isPending,
						className: "press rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60",
						children: "Mark completed"
					})
				]
			}),
			contact?.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 rounded-2xl bg-primary/10 p-3 text-xs font-bold text-primary",
				children: [
					contact.full_name ?? "Verified provider",
					" ",
					"·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `tel:${contact.phone}`,
						className: "underline",
						children: contact.phone
					})
				]
			})
		]
	});
}
//#endregion
export { LinkPage as component };
