import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as useLocationContext, S as useLang, b as track, l as crops, m as findCrop, s as Route$8 } from "./router-5yV9beqj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { F as Search, Q as MapPin, R as RefreshCw, j as SlidersHorizontal, p as Truck, qt as Award, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { t as Reveal } from "./reveal-D72UnnwF.mjs";
import { a as inr, t as formatIstDate } from "./format-BFmz3HAI.mjs";
import { t as computeFreshness } from "./market-freshness-C3Wz6gg0.mjs";
import { a as marketPricesQuery, i as latestPerMarket, n as FreshnessBadge, r as UnavailableState, t as DataProvenance } from "./market-queries-CvzWOkUR.mjs";
import { n as StaggerItem, t as StaggerContainer } from "./stagger-DsVjBe0i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/markets-DU0FMVYu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CACHE_KEY = "mm-market-geo";
var MISS = "none";
function readCache() {
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function writeCache(cache) {
	try {
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
	} catch {}
}
/** "Pune(Moshi) APMC" -> "Pune", "AGRICULTURE PRODUCE MARKET COMITEE CHANDWAD" -> "Chandwad" */
function marketPlaceName(market) {
	let name = market.replace(/\bAPMC\b/gi, "").replace(/AGRICULTURE PRODUCE MARKET (COMITEE|COMMITTEE)/gi, "").replace(/\b(Frui|Fruit|Veg\.?|Vegetable|Market|Mandi|RBZ)\b/gi, "").replace(/\(([^)]*)\)/g, " $1 ").replace(/[,&]/g, " ").replace(/\s+/g, " ").trim();
	if (!name) name = market.trim();
	return name;
}
async function geocode(query, state) {
	const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
	url.searchParams.set("name", query);
	url.searchParams.set("count", "10");
	url.searchParams.set("language", "en");
	url.searchParams.set("countryCode", "IN");
	url.searchParams.set("format", "json");
	const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
	if (!response.ok) return null;
	const hits = (await response.json()).results ?? [];
	if (hits.length === 0) return null;
	const hit = (state ? hits.filter((h) => (h.admin1 ?? "").toLowerCase().includes(state.toLowerCase().slice(0, 6))) : hits)[0] ?? hits[0];
	return {
		latitude: hit.latitude,
		longitude: hit.longitude
	};
}
/**
* Look up coordinates for a mandi. Tries the cleaned market name, then the
* district — returns null when neither resolves, so the UI can simply omit
* transport instead of inventing a distance.
*/
async function locateMarket(market, district, state) {
	const key = `${market}|${district}|${state}`.toLowerCase();
	const cache = readCache();
	const cached = cache[key];
	if (cached === MISS) return null;
	if (cached) return {
		latitude: cached.lat,
		longitude: cached.lon
	};
	const attempts = [marketPlaceName(market), district].filter(Boolean);
	for (const attempt of attempts) try {
		const hit = await geocode(attempt, state);
		if (hit) {
			cache[key] = {
				lat: hit.latitude,
				lon: hit.longitude
			};
			writeCache(cache);
			return hit;
		}
	} catch {
		return null;
	}
	cache[key] = MISS;
	writeCache(cache);
	return null;
}
/** Straight-line km inflated to approximate road distance. */
var ROAD_FACTOR = 1.3;
function haversineKm(a, b) {
	const R = 6371;
	const toRad = (d) => d * Math.PI / 180;
	const dLat = toRad(b.latitude - a.latitude);
	const dLon = toRad(b.longitude - a.longitude);
	const lat1 = toRad(a.latitude);
	const lat2 = toRad(b.latitude);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** Approximate road distance in km, rounded to the nearest km. */
function roadDistanceKm(from, to) {
	return Math.max(1, Math.round(haversineKm(from, to) * ROAD_FACTOR));
}
function estimateTransport(distanceKm, quintals, ratePerKm = 35) {
	const totalCost = Math.round(distanceKm * 2 * ratePerKm);
	return {
		distanceKm,
		ratePerKm,
		totalCost,
		perQuintal: quintals > 0 ? Math.round(totalCost / quintals) : totalCost
	};
}
/** How many mandis we resolve coordinates for (keeps geocoding requests low). */
var GEO_LIMIT = 12;
function MarketsPage() {
	const { t, lang } = useLang();
	const { crop: cropId, qty } = Route$8.useSearch();
	const { location } = useLocationContext();
	const crop = findCrop(cropId) ?? crops[0];
	const [query, setQuery] = (0, import_react.useState)("");
	const [ratePerKm, setRatePerKm] = (0, import_react.useState)(35);
	const [commission, setCommission] = (0, import_react.useState)(2);
	const [showFilters, setShowFilters] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (location?.state) track("market_search", { label: crop.commodity });
	}, [crop.commodity, location?.state]);
	const priceQuery = useQuery(marketPricesQuery({
		commodity: crop.commodity,
		...location?.state ? { state: location.state } : {},
		...location?.district ? { district: location.district } : {}
	}));
	const result = priceQuery.data ?? null;
	/** Latest official record per mandi, newest reporting date first. */
	const latestPerMarket$1 = (0, import_react.useMemo)(() => result ? latestPerMarket(result.records) : [], [result]);
	const visible = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return latestPerMarket$1.filter((r) => !q || r.market.toLowerCase().includes(q) || r.district.toLowerCase().includes(q));
	}, [latestPerMarket$1, query]);
	const origin = location?.latitude != null && location?.longitude != null ? {
		latitude: location.latitude,
		longitude: location.longitude
	} : null;
	const [distances, setDistances] = (0, import_react.useState)({});
	const geoTargets = visible.slice(0, GEO_LIMIT);
	const geoKey = origin ? geoTargets.map((r) => r.market).join("|") : "";
	(0, import_react.useEffect)(() => {
		if (!origin || geoTargets.length === 0) return;
		let cancelled = false;
		(async () => {
			for (const record of geoTargets) {
				if (cancelled) return;
				const coords = await locateMarket(record.market, record.district, record.state);
				if (cancelled || !coords) continue;
				const km = roadDistanceKm(origin, coords);
				setDistances((prev) => prev[record.market] === km ? prev : {
					...prev,
					[record.market]: km
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		geoKey,
		origin?.latitude,
		origin?.longitude
	]);
	const rows = (0, import_react.useMemo)(() => visible.map((record) => {
		const gross = record.modalPrice * qty;
		const km = distances[record.market];
		const transport = km != null ? estimateTransport(km, qty, ratePerKm) : null;
		const commissionCost = Math.round(gross * commission / 100);
		return {
			record,
			gross,
			transport,
			commissionCost,
			net: gross - (transport?.totalCost ?? 0) - commissionCost
		};
	}), [
		visible,
		qty,
		distances,
		ratePerKm,
		commission
	]);
	/**
	* Best choice is only compared inside the newest reporting date group — never
	* across different dates, which would compare last week against today.
	*/
	const comparableDate = visible[0]?.date ?? "";
	const sameDay = rows.filter((r) => r.record.date === comparableDate);
	const bestPrice = [...sameDay].sort((a, b) => b.record.modalPrice - a.record.modalPrice)[0];
	const withTransport = sameDay.filter((r) => r.transport);
	const bestPractical = withTransport.length > 1 ? [...withTransport].sort((a, b) => b.net - a.net)[0] : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mm-market-page relative isolate min-h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mm-market-world pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-market-world-grid" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-market-orb mm-market-orb-one" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-market-orb mm-market-orb-two" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-market-orb mm-market-orb-three" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-market-scan" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mm-market-particle mm-market-particle-one" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mm-market-particle mm-market-particle-two" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mm-market-particle mm-market-particle-three" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mm-market-particle mm-market-particle-four" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				title: t("compareMarkets"),
				subtitle: `${crop.name[lang]} · ${qty} ${crop.unit}`,
				back: "/crops",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => void priceQuery.refetch(),
					className: "press grid size-9 place-items-center rounded-full bg-muted",
					"aria-label": t("retry"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${priceQuery.isFetching ? "animate-spin" : ""}` })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative px-4 pt-4 sm:px-5 lg:px-0 lg:pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
						className: "mb-4 min-w-0",
						y: 18,
						duration: 600,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-extrabold uppercase tracking-wide text-primary",
								children: "Selected district"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "truncate font-display text-xl font-extrabold",
								children: location?.district || "Choose your district"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"Latest official ",
									crop.name[lang],
									" prices reported today or yesterday."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						className: "flex gap-2",
						initial: {
							opacity: 0,
							y: 14
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .55,
							delay: .08,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "card-surface hover-lift flex h-12 flex-1 items-center gap-2 px-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: query,
								onChange: (e) => setQuery(e.target.value),
								placeholder: t("searchMarket"),
								maxLength: 60,
								className: "w-full bg-transparent text-sm font-semibold outline-none"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowFilters((s) => !s),
							className: `press grid size-12 shrink-0 place-items-center rounded-2xl ${showFilters ? "bg-primary text-primary-foreground" : "bg-muted"}`,
							"aria-label": "Filters",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" })
						})]
					}),
					showFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						className: "card-surface mt-3 space-y-4 border-t-2 border-t-sky p-4",
						initial: {
							opacity: 0,
							height: 0,
							y: -8
						},
						animate: {
							opacity: 1,
							height: "auto",
							y: 0
						},
						exit: {
							opacity: 0,
							height: 0,
							y: -8
						},
						transition: {
							duration: .28,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Transport rate (₹ per km)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-primary",
									children: [inr(ratePerKm), "/km"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 5,
								max: 120,
								step: 1,
								value: ratePerKm,
								onChange: (e) => setRatePerKm(Number(e.target.value)),
								className: "mt-2 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary",
								"aria-label": "Transport rate per km"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[10px] text-muted-foreground",
								children: "Set your own vehicle hire rate. Cost is estimated for the round trip."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("commissionRate") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-primary",
								children: [commission, "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 10,
							step: .5,
							value: commission,
							onChange: (e) => setCommission(Number(e.target.value)),
							className: "mt-2 h-1.5 w-full appearance-none rounded-full bg-muted accent-primary",
							"aria-label": t("commissionRate")
						})] })]
					}),
					!location?.district ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						className: "mt-5",
						y: 20,
						duration: 550,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "card-surface hover-lift p-5 text-sm text-muted-foreground",
							children: "Select your district to compare matching markets."
						})
					}) : priceQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 space-y-3",
						children: [[
							0,
							1,
							2
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card-surface hover-lift h-28 animate-pulse" }, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center justify-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), t("loading")]
						})]
					}) : priceQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						className: "mt-5",
						y: 18,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnavailableState, {
							onRetry: () => void priceQuery.refetch(),
							message: "The official market price service could not be reached."
						})
					}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						className: "mt-5",
						y: 18,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnavailableState, { onRetry: () => void priceQuery.refetch() })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [bestPrice && result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
						className: "mm-best-market card-surface relative mt-5 overflow-hidden border-t-4 border-t-gold p-4 sm:p-5",
						initial: {
							opacity: 0,
							y: 24,
							scale: .985
						},
						animate: {
							opacity: 1,
							y: 0,
							scale: 1
						},
						transition: {
							duration: .65,
							delay: .12,
							ease: [
								.22,
								1,
								.36,
								1
							]
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-best-glow pointer-events-none" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-best-grid pointer-events-none" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-best-scan pointer-events-none" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative z-10",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "eyebrow flex items-center gap-1.5 text-gold-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "size-3.5" }),
											t("bestChoice"),
											" · best available price"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-lg font-extrabold",
										children: bestPrice.record.market
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
										className: "font-display text-3xl font-extrabold",
										initial: {
											opacity: 0,
											y: 8
										},
										animate: {
											opacity: 1,
											y: 0
										},
										transition: {
											duration: .5,
											delay: .28,
											ease: [
												.22,
												1,
												.36,
												1
											]
										},
										children: inr(bestPrice.record.modalPrice)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: [
											t("perQuintal"),
											" · ",
											t("modalPrice"),
											bestPrice.record.variety ? ` · ${bestPrice.record.variety}` : "",
											bestPrice.record.grade ? ` · ${bestPrice.record.grade}` : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessBadge, { freshness: result.freshness }),
											"Market data date:",
											" ",
											formatIstDate(bestPrice.record.date),
											" ·",
											" ",
											bestPrice.record.district
										]
									}),
									bestPractical && bestPractical.record.market !== bestPrice.record.market && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 border-t border-primary/20 pt-3 text-[12px] font-semibold leading-snug",
										children: [
											"Best practical choice after estimated transport:",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: bestPractical.record.market }),
											" —",
											" ",
											inr(bestPractical.net),
											" net for ",
											qty,
											" ",
											crop.unit,
											" (",
											bestPractical.transport.distanceKm,
											" km)."
										]
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaggerContainer, {
						className: "mt-4 space-y-3",
						delay: .04,
						staggerDelay: .055,
						children: rows.map((row) => {
							const isBest = row.record.market === bestPrice?.record.market;
							const rowFreshness = computeFreshness({ dataDate: row.record.date });
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaggerItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/market/$marketId",
								params: { marketId: row.record.market },
								search: {
									crop: crop.id,
									state: row.record.state,
									district: row.record.district
								},
								className: `mm-market-card press card-surface hover-lift relative block min-w-0 overflow-hidden p-4 ${isBest ? "border-gold/60 ring-2 ring-gold/25" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-card-sweep pointer-events-none absolute inset-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative z-10",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "truncate text-sm font-extrabold",
													children: [row.record.market, row.record.variety ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground",
														children: [row.record.variety, row.record.grade ? ` · ${row.record.grade}` : ""]
													}) : null]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessBadge, { freshness: rowFreshness }),
														row.record.district,
														" ·",
														" ",
														formatIstDate(row.record.date)
													]
												})]
											}), isBest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
												className: "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground",
												animate: { boxShadow: [
													"0 0 0 0 hsl(var(--primary) / 0)",
													"0 0 0 5px hsl(var(--primary) / 0.08)",
													"0 0 0 0 hsl(var(--primary) / 0)"
												] },
												transition: {
													duration: 2.6,
													repeat: Infinity,
													ease: "easeInOut"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "size-3" }), t("bestChoice")]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid min-w-0 grid-cols-3 gap-1 rounded-xl bg-muted/60 p-2.5 text-center sm:gap-2 sm:p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
													label: t("minPrice"),
													value: inr(row.record.minPrice)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
													label: t("modalPrice"),
													value: inr(row.record.modalPrice)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
													label: t("maxPrice"),
													value: inr(row.record.maxPrice)
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid min-w-0 grid-cols-3 gap-1 border-t border-border pt-3 text-center sm:gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
													label: "Gross",
													value: inr(row.gross)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
													label: row.transport ? `${t("transport")} (est.)` : t("transport"),
													value: row.transport ? `- ${inr(row.transport.totalCost)}` : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
													label: t("netProfit"),
													value: inr(row.net),
													accent: true
												})
											]
										}),
										row.transport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 flex flex-wrap items-center gap-x-1.5 text-[10px] font-semibold text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "size-3" }),
												location?.place || location?.district || "Your location",
												" ",
												"→ ",
												row.record.market,
												" · ~",
												row.transport.distanceKm,
												" km ·",
												" ",
												inr(row.transport.ratePerKm),
												"/km round trip ·",
												" ",
												inr(row.transport.perQuintal),
												"/",
												crop.unit,
												" (estimated)"
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3" }), "Distance not available for this mandi — transport not included."]
										})
									]
								})]
							}) }, row.record.market);
						})
					})] }),
					result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Reveal, {
						className: "mt-4",
						y: 16,
						duration: 600,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataProvenance, { result }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: "Transport is an estimate from road distance × your ₹/km rate, not an official freight rate. Commission is the % you set."
						})]
					})
				]
			})
		]
	}) });
}
function Cell({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `truncate text-xs font-extrabold sm:text-sm ${accent ? "text-primary" : ""}`,
		children: value
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "line-clamp-2 text-[9px] leading-tight text-muted-foreground sm:text-[10px]",
		children: label
	})] });
}
//#endregion
export { MarketsPage as component };
