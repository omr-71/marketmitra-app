import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { C as useLocationContext, S as useLang, b as track } from "./router-5yV9beqj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { At as CloudSun, C as Sunset, Mt as Clock, Q as MapPin, R as RefreshCw, T as Sun, Tt as Droplets, _t as Gauge, at as Lightbulb, i as Wind, jt as CloudRain, k as Sprout, m as TriangleAlert, w as Sunrise } from "../_libs/lucide-react.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { t as LocationCard } from "./location-card-BYGTE1YF.mjs";
import { i as formatIstWeekday, n as formatIstDateTime, r as formatIstTime } from "./format-BFmz3HAI.mjs";
import { a as bestFarmingWindow, c as getWeather, d as uvLabel, i as StatSkeleton, l as harvestAdvice, n as CardSkeleton, o as conditionLabel, s as farmingTips, t as AnimatedNumber, u as todayInsight } from "./farm-insights-4cRAiZpl.mjs";
import { n as StaggerItem, t as StaggerContainer } from "./stagger-DsVjBe0i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/weather-DuEg5ucp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DayIcon({ day }) {
	if (day.rainChance >= 60) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "size-5 text-primary" });
	if (day.rainChance >= 25) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, { className: "size-5 text-primary" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-5 text-warning" });
}
function WeatherPage() {
	const { t } = useLang();
	const { location } = useLocationContext();
	(0, import_react.useEffect)(() => {
		if (!navigator.geolocation) {
			console.warn("Geolocation is not supported by this browser.");
			return;
		}
		navigator.geolocation.getCurrentPosition((position) => {
			console.log("Live GPS location:", {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
				accuracy: position.coords.accuracy
			});
		}, (error) => {
			console.warn("GPS location permission/error:", error.message);
		}, {
			enableHighAccuracy: true,
			timeout: 1e4,
			maximumAge: 0
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (location?.latitude != null) track("weather_lookup");
	}, [location?.latitude, location?.longitude]);
	const hasLocation = location?.latitude != null && location?.longitude != null;
	const query = useQuery({
		queryKey: [
			"weather",
			location?.latitude,
			location?.longitude
		],
		enabled: hasLocation,
		queryFn: () => getWeather(location.latitude, location.longitude),
		staleTime: 3e5,
		refetchInterval: 6e5,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true
	});
	const data = query.data?.ok ? query.data : null;
	const wetDays = data?.days.filter((d) => d.rainChance >= 60) ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Screen, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
		title: t("weather"),
		subtitle: location?.place || location?.district || "",
		back: "/home",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => void query.refetch(),
			className: "press grid size-9 place-items-center rounded-full bg-muted",
			"aria-label": t("retry"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${query.isFetching ? "animate-spin" : ""}` })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-5 pt-5 lg:px-0 lg:pt-7",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {}), !hasLocation ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface hover-lift flex flex-col items-center gap-3 p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-14 place-items-center rounded-3xl bg-primary/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6 text-primary" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-md text-sm text-muted-foreground",
					children: "Allow location access to get automatic live weather for your current location."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						if (!navigator.geolocation) return;
						navigator.geolocation.getCurrentPosition((position) => {
							console.log("GPS permission granted:", position.coords.latitude, position.coords.longitude);
							window.location.reload();
						}, (error) => {
							console.warn("Unable to get GPS location:", error.message);
						}, {
							enableHighAccuracy: true,
							timeout: 1e4,
							maximumAge: 0
						});
					},
					className: "press rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground",
					children: "Allow Location"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: "Your browser will ask for location permission."
				})
			]
		}) : query.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, { lines: 4 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatSkeleton, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, { lines: 6 })
			]
		}) : !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface hover-lift p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-auto grid size-14 place-items-center rounded-3xl bg-destructive/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-6 text-destructive" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm font-semibold text-destructive",
					children: query.data && !query.data.ok ? query.data.error : "Weather could not be loaded."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => void query.refetch(),
					className: "press mt-4 rounded-full bg-muted px-4 py-2 text-xs font-bold",
					children: t("retry")
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1.15fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-surface hover-lift overflow-hidden border-t-4 border-t-sky p-4 sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-6xl font-extrabold leading-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, {
										value: data.current.temperature,
										suffix: "°"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm font-bold",
									children: conditionLabel(data.current.code)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										"Feels like ",
										data.current.apparent,
										"°"
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, { className: "animate-subtle-float size-14 shrink-0 text-sky sm:size-16 lg:size-20" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "size-4 text-primary" }),
									label: t("humidity"),
									value: `${data.current.humidity}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "size-4 text-primary" }),
									label: t("wind"),
									value: `${data.current.wind} km/h`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "size-4 text-primary" }),
									label: t("rainChance"),
									value: `${data.current.rainChance}%`
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid min-w-0 grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3 text-center sm:grid-cols-4 sm:gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "size-4 text-primary" }),
									label: "Rain (1h)",
									value: `${data.current.precipitation} mm`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "size-4 text-primary" }),
									label: "Gusts",
									value: `${data.current.windGust}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunrise, { className: "size-4 text-warning" }),
									label: t("sunrise"),
									value: formatIstTime(data.sunrise)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunset, { className: "size-4 text-warning" }),
									label: t("sunset"),
									value: formatIstTime(data.sunset)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[11px] leading-relaxed text-muted-foreground",
							children: data.observedAt ? `Observed ${formatIstTime(data.observedAt)} IST · forecast to ${data.days[data.days.length - 1] ? formatIstWeekday(data.days[data.days.length - 1].date) : ""}` : `${t("lastUpdated")}: ${formatIstDateTime(data.updatedAt)} IST`
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileStat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4 text-warning" }),
								label: "UV index",
								value: String(data.current.uvIndex),
								hint: uvLabel(data.current.uvIndex)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileStat, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4 text-primary" }),
								label: "Air pressure",
								value: `${data.current.pressure}`,
								hint: "hPa"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "card-surface hover-lift border-l-4 border-l-sky p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "eyebrow flex items-center gap-2 text-sky",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" }), "Today's weather insight"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2.5 text-[15px] font-semibold leading-snug",
								children: todayInsight(data)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "card-surface hover-lift border-l-4 border-l-gold p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "eyebrow flex items-center gap-2 text-gold-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }), "Best time for farming today"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-display text-lg font-extrabold",
									children: bestFarmingWindow(data).window
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: bestFarmingWindow(data).reason
								})
							]
						})
					]
				})]
			}),
			wetDays.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-warning/30 bg-warning/10 p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-extrabold text-warning",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }), t("rainAlert")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-[15px] font-semibold leading-snug",
					children: [
						"Rain is likely on",
						" ",
						wetDays.map((d) => formatIstWeekday(d.date)).join(", "),
						" — up to ",
						Math.max(...wetDays.map((d) => d.rainMm)),
						" mm. Cover harvested stock and plan mandi trips around these days."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "card-surface hover-lift p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-bold",
						children: t("sevenDay")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaggerContainer, {
						className: "mt-3 space-y-2",
						staggerDelay: .045,
						children: data.days.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StaggerItem, {
							className: "grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayIcon, { day }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-bold",
									children: formatIstWeekday(day.date)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs font-semibold text-muted-foreground",
									children: [day.rainChance, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-extrabold",
									children: [
										day.max,
										"°",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-semibold text-muted-foreground",
											children: [day.min, "°"]
										})
									]
								})
							]
						}, day.date))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "card-surface hover-lift p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, { className: "size-4 text-primary" }), t("harvestAdvice")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 text-[13px] font-semibold leading-snug",
							children: harvestAdvice(data.days).map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" }), line]
							}, line))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "card-surface hover-lift p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4 text-primary" }), "Farming tips for these conditions"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 text-[13px] font-semibold leading-snug",
							children: farmingTips(data).map((tip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" }), tip]
							}, tip))
						})]
					})]
				})]
			})
		] })]
	})] });
}
function Metric({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto mb-1 w-fit",
			children: icon
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-sm font-extrabold",
			children: value
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] text-muted-foreground",
			children: label
		})
	] });
}
function TileStat({ icon, label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card-surface hover-lift min-w-0 border-t-2 border-t-sky p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[11px] font-bold text-muted-foreground",
				children: [icon, label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 truncate font-display text-xl font-extrabold leading-none sm:text-2xl",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] font-semibold text-muted-foreground",
				children: hint
			})
		]
	});
}
//#endregion
export { WeatherPage as component };
