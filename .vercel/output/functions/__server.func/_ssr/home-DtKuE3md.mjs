import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as useLocationContext, S as useLang, j as useSession, l as crops, m as findCrop, t as Button } from "./router-5yV9beqj.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as Sparkles, At as CloudSun, Q as MapPin, R as RefreshCw, T as Sun, Tt as Droplets, Yt as ArrowRight, at as Lightbulb, i as Wind, jt as CloudRain, ot as Leaf, q as Navigation } from "../_libs/lucide-react.mjs";
import { n as useTransform, r as useMotionValue, t as useSpring } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Screen } from "./app-shell-Cbiru3-8.mjs";
import { t as Reveal } from "./reveal-D72UnnwF.mjs";
import { t as LocationCard } from "./location-card-BYGTE1YF.mjs";
import { a as inr, s as useIstNow } from "./format-BFmz3HAI.mjs";
import { a as marketPricesQuery, i as latestPerMarket, n as FreshnessBadge, r as UnavailableState, t as DataProvenance } from "./market-queries-CvzWOkUR.mjs";
import { a as bestFarmingWindow, c as getWeather, d as uvLabel, n as CardSkeleton, o as conditionLabel, r as RowSkeleton, t as AnimatedNumber, u as todayInsight } from "./farm-insights-4cRAiZpl.mjs";
import { n as StaggerItem, t as StaggerContainer } from "./stagger-DsVjBe0i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-DtKuE3md.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HomePage() {
	const { t, lang } = useLang();
	const { profile } = useSession();
	const { location } = useLocationContext();
	const now = useIstNow();
	const savedIds = profile?.saved_crops?.length ? profile.saved_crops : ["onion"];
	const primary = findCrop(savedIds[0]) ?? crops[0];
	const priceQuery = useQuery(marketPricesQuery({
		commodity: primary.commodity,
		...location?.state ? { state: location.state } : {},
		...location?.district ? { district: location.district } : {}
	}));
	const weatherQuery = useQuery({
		queryKey: [
			"weather",
			location?.latitude,
			location?.longitude
		],
		enabled: Boolean(location?.latitude != null && location?.longitude != null),
		queryFn: () => getWeather(location.latitude, location.longitude),
		staleTime: 9e5,
		refetchInterval: 9e5
	});
	const records = latestPerMarket(priceQuery.data?.records ?? []);
	const best = records[0];
	const weather = weatherQuery.data?.ok ? weatherQuery.data : null;
	const marketCount = new Set(records.map((record) => record.market)).size;
	const avgModal = records.length ? Math.round(records.reduce((sum, record) => sum + record.modalPrice, 0) / records.length) : 0;
	const spread = best ? best.maxPrice - best.minPrice : 0;
	const farmingWindow = weather ? bestFarmingWindow(weather) : null;
	const WeatherIcon = weather ? weather.current.code <= 1 ? Sun : weather.current.code >= 51 ? CloudRain : CloudSun : CloudSun;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative isolate min-h-screen overflow-hidden pb-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeAtmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 space-y-7 sm:space-y-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveWeatherHero, {
					profileName: profile?.full_name || "MarketMitra",
					locationLabel: location?.place || location?.district || t("locationNeeded"),
					timeLabel: now.timeLabel,
					weather,
					weatherIcon: WeatherIcon,
					farmingWindow,
					weatherPending: weatherQuery.isPending,
					weatherLinkLabel: t("weather"),
					insight: weather ? todayInsight(weather) : null,
					t
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: 80,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MagneticCard, {
						className: "relative z-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: 120,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketCommandCenter, {
						primary,
						lang,
						location,
						priceQuery,
						records,
						best,
						marketCount,
						avgModal,
						spread,
						t
					})
				}),
				weather && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: 160,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSignal, { weather })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: 200,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketActivity, {
						records,
						primary,
						lang,
						priceQuery,
						location,
						t
					})
				}),
				!weather && location?.latitude != null && weatherQuery.data && !weatherQuery.data.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: 240,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.07)] backdrop-blur-xl sm:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-20 -top-20 size-48 rounded-full bg-primary/8 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-500",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow",
									children: t("weather")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs font-bold",
									children: "Weather couldn't be refreshed."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									size: "sm",
									className: "ml-auto",
									onClick: () => void weatherQuery.refetch(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-1.5 size-3.5" }), t("retry")]
								})
							]
						})]
					})
				}),
				!weather && location?.latitude != null && weatherQuery.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					delay: 240,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardSkeleton, { lines: 3 })
				})
			]
		})]
	}) });
}
function HomeAtmosphere() {
	const ref = (0, import_react.useRef)(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const springX = useSpring(x, {
		stiffness: 45,
		damping: 24,
		mass: .8
	});
	const springY = useSpring(y, {
		stiffness: 45,
		damping: 24,
		mass: .8
	});
	const glowX = useTransform(springX, [-1, 1], ["15%", "85%"]);
	const glowY = useTransform(springY, [-1, 1], ["20%", "70%"]);
	const handleMove = (event) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const nx = ((event.clientX - rect.left) / rect.width - .5) * 2;
		const ny = ((event.clientY - rect.top) / rect.height - .5) * 2;
		x.set(Math.max(-1, Math.min(1, nx)));
		y.set(Math.max(-1, Math.min(1, ny)));
	};
	const handleLeave = () => {
		x.set(0);
		y.set(0);
	};
	const particles = Array.from({ length: 34 }, (_, index) => ({
		left: `${index * 37 % 100}%`,
		top: `${index * 61 % 100}%`,
		size: index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
		duration: 5 + index % 7,
		delay: index % 9 * .35
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		onPointerMove: handleMove,
		onPointerLeave: handleLeave,
		className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_34%),radial-gradient(circle_at_100%_30%,hsl(205_90%_60%/0.07),transparent_30%),radial-gradient(circle_at_0%_75%,hsl(150_80%_45%/0.055),transparent_30%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				style: {
					left: glowX,
					top: glowY
				},
				className: "absolute size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.045] blur-[110px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					x: [
						"-8%",
						"8%",
						"-8%"
					],
					y: [
						"-4%",
						"5%",
						"-4%"
					],
					rotate: [
						-2,
						2,
						-2
					]
				},
				transition: {
					duration: 24,
					repeat: Infinity,
					ease: "easeInOut"
				},
				className: "absolute -left-[15%] top-[8%] h-[30rem] w-[75%] rounded-full bg-primary/[0.035] blur-[100px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					x: [
						"8%",
						"-7%",
						"8%"
					],
					y: [
						"5%",
						"-4%",
						"5%"
					],
					rotate: [
						2,
						-2,
						2
					]
				},
				transition: {
					duration: 30,
					repeat: Infinity,
					ease: "easeInOut"
				},
				className: "absolute -right-[20%] top-[38%] h-[34rem] w-[70%] rounded-full bg-sky-500/[0.025] blur-[110px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 top-[28%] h-[70%] opacity-[0.045]",
				style: {
					backgroundImage: "linear-gradient(hsl(var(--foreground)/0.45) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.45) 1px, transparent 1px)",
					backgroundSize: "58px 58px",
					maskImage: "linear-gradient(to bottom, transparent, black 22%, black 72%, transparent)",
					transform: "perspective(900px) rotateX(58deg) scale(1.6)",
					transformOrigin: "top center"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					y: ["-10vh", "110vh"],
					opacity: [
						0,
						.5,
						0
					]
				},
				transition: {
					duration: 14,
					repeat: Infinity,
					ease: "linear",
					repeatDelay: 5
				},
				className: "absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
			}),
			particles.map((particle, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				animate: {
					y: [
						0,
						-18,
						0
					],
					x: [
						0,
						index % 2 ? 5 : -5,
						0
					],
					opacity: [
						.08,
						.35,
						.08
					],
					scale: [
						.7,
						1,
						.7
					]
				},
				transition: {
					duration: particle.duration,
					delay: particle.delay,
					repeat: Infinity,
					ease: "easeInOut"
				},
				style: {
					left: particle.left,
					top: particle.top,
					width: particle.size,
					height: particle.size
				},
				className: "absolute rounded-full bg-primary"
			}, index))
		]
	});
}
function LiveWeatherHero({ profileName, locationLabel, timeLabel, weather, weatherIcon: WeatherIcon, farmingWindow, weatherPending, weatherLinkLabel, insight, t }) {
	const ref = (0, import_react.useRef)(null);
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const springX = useSpring(mouseX, {
		stiffness: 48,
		damping: 18,
		mass: .7
	});
	const springY = useSpring(mouseY, {
		stiffness: 48,
		damping: 18,
		mass: .7
	});
	const contentX = useTransform(springX, [-1, 1], [-7, 7]);
	const contentY = useTransform(springY, [-1, 1], [-5, 5]);
	const orbX = useTransform(springX, [-1, 1], [-42, 42]);
	const orbY = useTransform(springY, [-1, 1], [-28, 28]);
	const orb2X = useTransform(springX, [-1, 1], [32, -32]);
	const orb2Y = useTransform(springY, [-1, 1], [20, -20]);
	const ringX = useTransform(springX, [-1, 1], [15, -15]);
	const ringY = useTransform(springY, [-1, 1], [12, -12]);
	const handlePointerMove = (event) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		const nx = ((event.clientX - rect.left) / rect.width - .5) * 2;
		const ny = ((event.clientY - rect.top) / rect.height - .5) * 2;
		mouseX.set(Math.max(-1, Math.min(1, nx)));
		mouseY.set(Math.max(-1, Math.min(1, ny)));
	};
	const handlePointerLeave = () => {
		mouseX.set(0);
		mouseY.set(0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
		ref,
		onPointerMove: handlePointerMove,
		onPointerLeave: handlePointerLeave,
		className: "relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[#071b16] px-5 pb-6 pt-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.20)] sm:px-7 sm:pb-8 sm:pt-7 lg:min-h-[34rem] lg:px-10 lg:pb-9 lg:pt-8",
		initial: {
			opacity: 0,
			y: 28,
			scale: .975
		},
		animate: {
			opacity: 1,
			y: 0,
			scale: 1
		},
		transition: {
			duration: .9,
			ease: [
				.22,
				1,
				.36,
				1
			]
		},
		style: { transformStyle: "preserve-3d" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(77,255,178,0.18),transparent_28%),radial-gradient(circle_at_12%_90%,rgba(36,145,255,0.14),transparent_32%),linear-gradient(135deg,#071b16_0%,#08241b_45%,#06151a_100%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					x: [
						"-15%",
						"12%",
						"-15%"
					],
					y: [
						"-10%",
						"8%",
						"-10%"
					],
					rotate: [
						-4,
						3,
						-4
					]
				},
				transition: {
					duration: 22,
					repeat: Infinity,
					ease: "easeInOut"
				},
				className: "absolute -left-[20%] top-[2%] h-40 w-[80%] rounded-full bg-emerald-300/[0.08] blur-[65px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					x: [
						"12%",
						"-10%",
						"12%"
					],
					y: [
						"5%",
						"-8%",
						"5%"
					]
				},
				transition: {
					duration: 27,
					repeat: Infinity,
					ease: "easeInOut"
				},
				className: "absolute -right-[20%] bottom-[12%] h-52 w-[70%] rounded-full bg-cyan-300/[0.07] blur-[80px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				style: {
					x: orbX,
					y: orbY
				},
				className: "absolute right-[4%] top-[12%] size-56 rounded-full bg-emerald-300/[0.06] blur-3xl sm:size-72"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				style: {
					x: orb2X,
					y: orb2Y
				},
				className: "absolute bottom-[8%] left-[22%] size-40 rounded-full bg-cyan-300/[0.055] blur-3xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				style: {
					x: ringX,
					y: ringY
				},
				animate: { rotate: 360 },
				transition: {
					duration: 70,
					repeat: Infinity,
					ease: "linear"
				},
				className: "absolute -right-16 top-8 size-64 rounded-full border border-white/[0.07] sm:size-80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-[15%] top-[11%] size-2 rounded-full bg-emerald-200/70 shadow-[0_0_20px_rgba(110,255,190,0.8)]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				style: {
					x: ringX,
					y: ringY
				},
				animate: { rotate: -360 },
				transition: {
					duration: 44,
					repeat: Infinity,
					ease: "linear"
				},
				className: "absolute -right-5 top-20 size-48 rounded-full border border-white/[0.055] sm:size-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-[7%] top-[42%] size-1.5 rounded-full bg-cyan-200/70 shadow-[0_0_16px_rgba(100,220,255,0.8)]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_70%,transparent)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					x: ["-120%", "150%"],
					opacity: [
						0,
						.25,
						0
					]
				},
				transition: {
					duration: 8,
					repeat: Infinity,
					repeatDelay: 5,
					ease: "easeInOut"
				},
				className: "absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-[0.035] mix-blend-overlay",
				style: {
					backgroundImage: "radial-gradient(rgba(255,255,255,.8) .5px,transparent .5px)",
					backgroundSize: "5px 5px"
				}
			}),
			Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				animate: {
					y: [
						0,
						-16,
						0
					],
					x: [
						0,
						index % 2 ? 8 : -8,
						0
					],
					opacity: [
						.08,
						.35,
						.08
					]
				},
				transition: {
					duration: 4 + index % 5,
					delay: index * .3,
					repeat: Infinity,
					ease: "easeInOut"
				},
				style: {
					left: `${8 + index * 17 % 85}%`,
					top: `${15 + index * 29 % 70}%`
				},
				className: "absolute size-1 rounded-full bg-white"
			}, index)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				style: {
					x: contentX,
					y: contentY
				},
				className: "relative z-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								initial: {
									opacity: 0,
									y: 10
								},
								animate: {
									opacity: .55,
									y: 0
								},
								transition: {
									duration: .5,
									delay: .12
								},
								className: "text-[9px] font-bold uppercase tracking-[0.25em]",
								children: t("welcome")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h1, {
								initial: {
									opacity: 0,
									y: 18,
									filter: "blur(10px)"
								},
								animate: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)"
								},
								transition: {
									duration: .85,
									delay: .16,
									ease: [
										.22,
										1,
										.36,
										1
									]
								},
								className: "mt-1 truncate font-display text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl lg:text-[2.35rem]",
								children: profileName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								initial: {
									opacity: 0,
									y: 7
								},
								animate: {
									opacity: .68,
									y: 0
								},
								transition: {
									duration: .55,
									delay: .3
								},
								className: "mt-2 flex min-w-0 items-center gap-1.5 text-[10px] font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3 shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: locationLabel
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "shrink-0 tabular-nums",
										children: [timeLabel, " IST"]
									})
								]
							})
						]
					}), weather && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							scale: .5,
							rotate: -20
						},
						animate: {
							opacity: 1,
							scale: 1,
							rotate: 0
						},
						transition: {
							duration: .8,
							delay: .35,
							type: "spring",
							stiffness: 160,
							damping: 16
						},
						whileHover: {
							scale: 1.08,
							rotate: 4
						},
						className: "relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-[1.25rem] border border-white/[0.14] bg-white/[0.075] shadow-[0_15px_45px_rgba(0,0,0,0.15)] backdrop-blur-xl sm:size-16",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							animate: {
								scale: [
									1,
									1.08,
									1
								],
								opacity: [
									.7,
									1,
									.7
								]
							},
							transition: {
								duration: 3.5,
								repeat: Infinity,
								ease: "easeInOut"
							},
							className: "absolute size-10 rounded-full bg-emerald-300/10 blur-xl"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							animate: { y: [
								0,
								-4,
								0
							] },
							transition: {
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherIcon, {
								className: "relative size-7",
								strokeWidth: 1.4
							})
						})]
					})]
				}), weather ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 grid gap-9 lg:grid-cols-[1fr_430px] lg:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
							initial: {
								opacity: 0,
								y: 45,
								scale: .82
							},
							animate: {
								opacity: 1,
								y: 0,
								scale: 1
							},
							transition: {
								duration: 1,
								delay: .2,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							className: "font-display text-[5.8rem] font-extrabold leading-[0.72] tracking-[-0.09em] drop-shadow-[0_14px_40px_rgba(0,0,0,0.2)] sm:text-[7.4rem] lg:text-[8rem]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, {
								value: weather.current.temperature,
								suffix: "°"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								initial: {
									opacity: 0,
									x: 15
								},
								animate: {
									opacity: 1,
									x: 0
								},
								transition: {
									duration: .55,
									delay: .48
								},
								className: "text-sm font-extrabold sm:text-base",
								children: conditionLabel(weather.current.code)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.p, {
								initial: { opacity: 0 },
								animate: { opacity: .55 },
								transition: {
									duration: .5,
									delay: .58
								},
								className: "mt-1 text-[10px] font-semibold",
								children: [
									"Feels like",
									" ",
									weather.current.apparent,
									"°"
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						initial: {
							opacity: 0,
							y: 15
						},
						animate: {
							opacity: .78,
							y: 0
						},
						transition: {
							duration: .6,
							delay: .55
						},
						className: "mt-7 max-w-xl text-xs font-medium leading-relaxed sm:text-sm",
						children: insight
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherMetric, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "size-4" }),
								label: t("humidity"),
								value: `${weather.current.humidity}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherMetric, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "size-4" }),
								label: t("wind"),
								value: `${weather.current.wind} km/h`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherMetric, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudRain, { className: "size-4" }),
								label: t("rainChance"),
								value: `${weather.current.rainChance}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherMetric, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }),
								label: "UV",
								value: uvLabel(weather.current.uvIndex)
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					transition: {
						duration: .6,
						delay: .72
					},
					className: "mt-9 border-t border-white/[0.09] pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
						children: [farmingWindow ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								animate: { boxShadow: [
									"0 0 0 rgba(255,255,255,0)",
									"0 0 25px rgba(140,255,200,0.12)",
									"0 0 0 rgba(255,255,255,0)"
								] },
								transition: {
									duration: 3,
									repeat: Infinity
								},
								className: "grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.07]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[9px] font-bold uppercase tracking-[0.12em] opacity-45",
									children: "Best field window"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 truncate text-xs font-extrabold",
									children: farmingWindow.window
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/weather",
							className: "group flex w-fit items-center gap-1.5 text-xs font-extrabold opacity-65 transition-all duration-300 hover:gap-2.5 hover:opacity-100",
							children: [weatherLinkLabel, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 transition-transform duration-300 group-hover:translate-x-1" })]
						})]
					})
				})] }) : weatherPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						animate: { opacity: [
							.18,
							.4,
							.18
						] },
						transition: {
							duration: 1.8,
							repeat: Infinity
						},
						className: "h-28 w-60 rounded-[2rem] bg-white/[0.07]"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .6,
						delay: .3
					},
					className: "mt-12 max-w-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold opacity-75",
						children: "Turn on your location to see live local weather and field conditions."
					})
				})]
			})
		]
	});
}
function WeatherMetric({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		whileHover: {
			y: -5,
			scale: 1.025
		},
		whileTap: { scale: .985 },
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 22
		},
		className: "group relative overflow-hidden rounded-[1.15rem] border border-white/[0.10] bg-white/[0.065] px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				className: "absolute -right-5 -top-5 size-14 rounded-full bg-emerald-300/[0.08] blur-xl",
				animate: {
					scale: [
						1,
						1.2,
						1
					],
					opacity: [
						.5,
						.9,
						.5
					]
				},
				transition: {
					duration: 4,
					repeat: Infinity,
					ease: "easeInOut"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] opacity-55 transition-opacity group-hover:opacity-90",
				children: [icon, label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative mt-1.5 truncate text-xs font-extrabold sm:text-sm",
				children: value
			})
		]
	});
}
function MagneticCard({ children, className = "" }) {
	const ref = (0, import_react.useRef)(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotateX = useTransform(y, [-1, 1], [1.5, -1.5]);
	const rotateY = useTransform(x, [-1, 1], [-1.5, 1.5]);
	const sx = useSpring(rotateX, {
		stiffness: 250,
		damping: 25
	});
	const sy = useSpring(rotateY, {
		stiffness: 250,
		damping: 25
	});
	const move = (event) => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		x.set(Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2)));
		y.set(Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2)));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		ref,
		onPointerMove: move,
		onPointerLeave: () => {
			x.set(0);
			y.set(0);
		},
		style: {
			rotateX: sx,
			rotateY: sy,
			transformPerspective: 1200
		},
		className,
		children
	});
}
function MarketCommandCenter({ primary, lang, location, priceQuery, records, best, marketCount, avgModal, spread, t }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MagneticCard, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "group/market relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/80 shadow-[0_30px_100px_rgba(0,0,0,0.08)] backdrop-blur-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: {
					x: [
						"-10%",
						"80%",
						"-10%"
					],
					opacity: [
						.15,
						.28,
						.15
					]
				},
				transition: {
					duration: 16,
					repeat: Infinity,
					ease: "easeInOut"
				},
				className: "pointer-events-none absolute -top-32 h-64 w-[45%] rounded-full bg-primary/10 blur-[80px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: { x: ["-120%", "300%"] },
				transition: {
					duration: 9,
					repeat: Infinity,
					repeatDelay: 7,
					ease: "easeInOut"
				},
				className: "pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-primary/[0.07] to-transparent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 border-b border-border/70 px-5 py-5 sm:px-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "Market intelligence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl font-extrabold tracking-tight sm:text-2xl",
								children: primary.name[lang]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
								animate: {
									y: [
										0,
										-3,
										0
									],
									rotate: [
										0,
										3,
										-3,
										0
									]
								},
								transition: {
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut"
								},
								whileHover: { scale: 1.12 },
								className: "grid size-8 place-items-center rounded-xl bg-primary/10 text-base shadow-sm",
								children: primary.emoji
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] font-semibold text-muted-foreground",
							children: "Official mandi reports from your selected district"
						})
					] }), priceQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessBadge, { freshness: priceQuery.data.freshness })]
				})
			}),
			!location?.district ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 px-5 py-9 sm:px-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMarketState, {})
			}) : priceQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 space-y-4 px-5 py-8 sm:px-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-40 animate-pulse rounded-full bg-muted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-14 w-48 animate-pulse rounded-2xl bg-muted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-full animate-pulse rounded-full bg-muted" })
				]
			}) : priceQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 px-5 py-8 sm:px-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnavailableState, {
					onRetry: () => void priceQuery.refetch(),
					message: "The latest official market prices could not be loaded."
				})
			}) : best ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 grid lg:grid-cols-[0.82fr_1.18fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden border-b border-border/70 px-5 py-8 sm:px-7 lg:border-b-0 lg:border-r",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/[0.06] blur-[70px]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground",
								children: "Highest modal rate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
									initial: {
										opacity: 0,
										y: 25,
										scale: .9
									},
									whileInView: {
										opacity: 1,
										y: 0,
										scale: 1
									},
									viewport: { once: true },
									transition: {
										duration: .8,
										ease: [
											.22,
											1,
											.36,
											1
										]
									},
									className: "font-display text-5xl font-extrabold tracking-[-0.06em] sm:text-6xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, {
										value: best.modalPrice,
										prefix: "₹",
										formatIndian: true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mb-2 text-[10px] font-bold text-muted-foreground",
									children: "/ quintal"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-2 text-xs font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-3.5 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: best.market }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
										animate: {
											scale: [
												1,
												1.7,
												1
											],
											opacity: [
												1,
												.4,
												1
											]
										},
										transition: {
											duration: 2,
											repeat: Infinity
										},
										className: "size-1.5 rounded-full bg-primary"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-7",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceRange, {
									min: best.minPrice,
									modal: best.modalPrice,
									max: best.maxPrice
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 grid grid-cols-3 border-y border-border/70 py-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: t("minPrice"),
										value: inr(best.minPrice)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: t("modalPrice"),
										value: inr(best.modalPrice)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
										label: t("maxPrice"),
										value: inr(best.maxPrice)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/markets",
								search: {
									crop: primary.id,
									qty: 20
								},
								className: "group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-[0_10px_35px_hsl(var(--primary)/0.2)] transition-shadow duration-500 hover:shadow-[0_15px_50px_hsl(var(--primary)/0.32)]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
										animate: { x: ["-120%", "250%"] },
										transition: {
											duration: 3.8,
											repeat: Infinity,
											repeatDelay: 4,
											ease: "easeInOut"
										},
										className: "absolute inset-y-0 w-1/3 -skew-x-12 bg-white/15"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "relative z-10",
										children: "Compare all markets"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-1.5" })
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 px-5 py-8 sm:px-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-extrabold",
								children: "District market pulse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[10px] font-semibold text-muted-foreground",
								children: "Modal rates across reported markets"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
									animate: { scale: [
										1,
										1.8,
										1
									] },
									transition: {
										duration: 2,
										repeat: Infinity
									},
									className: "size-1.5 rounded-full bg-primary"
								}), "Live"]
							})]
						}),
						records.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketPulse, { records }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 flex h-44 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-xs px-5 text-center text-xs font-semibold text-muted-foreground",
								children: "Market movement will appear when multiple official reports are available."
							})
						}),
						records.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuietMetric, {
									label: "Markets",
									value: marketCount.toLocaleString("en-IN")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuietMetric, {
									label: "Average",
									value: inr(avgModal)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuietMetric, {
									label: "Spread",
									value: inr(spread)
								})
							]
						})
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 px-5 py-8 sm:px-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnavailableState, { onRetry: () => void priceQuery.refetch() })
			})
		]
	}) });
}
function PriceRange({ min, modal, max }) {
	const range = Math.max(max - min, 1);
	const position = Math.min(100, Math.max(0, (modal - min) / range * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-2 rounded-full bg-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: { width: 0 },
			whileInView: { width: `${position}%` },
			viewport: { once: true },
			transition: {
				duration: 1.1,
				ease: [
					.22,
					1,
					.36,
					1
				]
			},
			className: "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
			initial: {
				left: "0%",
				scale: 0
			},
			whileInView: {
				left: `${position}%`,
				scale: 1
			},
			viewport: { once: true },
			transition: {
				duration: 1,
				delay: .15,
				type: "spring",
				stiffness: 180,
				damping: 20
			},
			className: "absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.08),0_4px_16px_hsl(var(--primary)/0.3)]"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex items-center justify-between text-[9px] font-bold text-muted-foreground tabular-nums",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(min) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(max) })]
	})] });
}
function MarketPulse({ records }) {
	const values = records.slice(0, 8).map((record) => Number(record.modalPrice)).filter((value) => Number.isFinite(value));
	if (values.length < 2) return null;
	const width = 720;
	const height = 230;
	const paddingX = 12;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = Math.max(max - min, 1);
	const points = values.map((value, index) => {
		return {
			x: paddingX + index / Math.max(values.length - 1, 1) * 696,
			y: 206 - (value - min) / range * 182,
			value
		};
	});
	const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
	const areaPoints = [
		`${points[0].x},206`,
		...points.map((point) => `${point.x},${point.y}`),
		`${points[points.length - 1].x},206`
	].join(" ");
	const last = points[points.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-6 overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/[0.18] shadow-inner",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: { x: ["-100%", "500%"] },
				transition: {
					duration: 7,
					repeat: Infinity,
					repeatDelay: 4,
					ease: "linear"
				},
				className: "pointer-events-none absolute inset-y-0 z-10 w-24 bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: `0 0 ${width} ${height}`,
				preserveAspectRatio: "none",
				className: "relative z-0 h-48 w-full",
				role: "img",
				"aria-label": "Market modal price pulse",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "marketPulseFillV2",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "currentColor",
							stopOpacity: "0.22"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "currentColor",
							stopOpacity: "0"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
						id: "marketPulseGlowV2",
						x: "-50%",
						y: "-50%",
						width: "200%",
						height: "200%",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", {
							stdDeviation: "5",
							result: "blur"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("feMerge", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feMergeNode", { in: "blur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feMergeNode", { in: "SourceGraphic" })] })]
					})] }),
					[
						.2,
						.4,
						.6,
						.8
					].map((ratio) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "0",
						x2: width,
						y1: height * ratio,
						y2: height * ratio,
						stroke: "currentColor",
						strokeOpacity: "0.06",
						strokeWidth: "1"
					}, ratio)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.polygon, {
						points: areaPoints,
						fill: "url(#marketPulseFillV2)",
						initial: { opacity: 0 },
						whileInView: { opacity: 1 },
						viewport: { once: true },
						transition: { duration: 1 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.polyline, {
						points: linePoints,
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "3",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						className: "text-primary",
						pathLength: 1,
						initial: {
							pathLength: 0,
							opacity: 0
						},
						whileInView: {
							pathLength: 1,
							opacity: 1
						},
						viewport: { once: true },
						transition: {
							pathLength: {
								duration: 1.5,
								ease: [
									.22,
									1,
									.36,
									1
								]
							},
							opacity: { duration: .3 }
						},
						filter: "url(#marketPulseGlowV2)"
					}),
					points.map((point, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.circle, {
						cx: point.x,
						cy: point.y,
						r: index === points.length - 1 ? 5 : 3,
						className: "fill-primary",
						initial: {
							opacity: 0,
							scale: 0
						},
						whileInView: {
							opacity: index === points.length - 1 ? 1 : .35,
							scale: 1
						},
						viewport: { once: true },
						transition: {
							delay: .7 + index * .08,
							duration: .35,
							type: "spring",
							stiffness: 300,
							damping: 20
						}
					}, `${point.x}-${point.y}-${index}`)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.circle, {
						cx: last.x,
						cy: last.y,
						r: "12",
						className: "fill-primary",
						animate: {
							r: [
								8,
								22,
								8
							],
							opacity: [
								.18,
								0,
								.18
							]
						},
						transition: {
							duration: 2.2,
							repeat: Infinity,
							ease: "easeOut"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.circle, {
						cx: last.x,
						cy: last.y,
						r: "5",
						className: "fill-primary",
						animate: { scale: [
							1,
							1.25,
							1
						] },
						transition: {
							duration: 1.8,
							repeat: Infinity,
							ease: "easeInOut"
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-t border-border/60 px-3 py-2.5 text-[9px] font-bold text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(Math.round(min)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [values.length, " market reports"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: inr(Math.round(max)) })
				]
			})
		]
	});
}
function FieldSignal({ weather }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/weather",
		className: "group relative block overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 shadow-[0_20px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				animate: { x: ["-100%", "250%"] },
				transition: {
					duration: 8,
					repeat: Infinity,
					repeatDelay: 5,
					ease: "easeInOut"
				},
				className: "absolute inset-y-0 z-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-20 -top-24 size-56 rounded-full bg-sky-500/[0.06] blur-[65px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center gap-4 px-5 py-5 sm:px-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						animate: {
							y: [
								0,
								-4,
								0
							],
							rotate: [
								0,
								-3,
								0
							]
						},
						transition: {
							duration: 4,
							repeat: Infinity,
							ease: "easeInOut"
						},
						className: "relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sky-500/10 text-sky-500",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
							animate: {
								scale: [
									.8,
									1.3,
									.8
								],
								opacity: [
									.25,
									0,
									.25
								]
							},
							transition: {
								duration: 2.5,
								repeat: Infinity
							},
							className: "absolute size-8 rounded-full bg-sky-400/30"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "relative size-5" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Field signal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-sm font-extrabold",
								children: todayInsight(weather)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [weather.current.temperature, "°"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [weather.current.humidity, "% humidity"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [weather.current.wind, " km/h wind"] })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						animate: { x: [
							0,
							4,
							0
						] },
						transition: {
							duration: 2.8,
							repeat: Infinity,
							ease: "easeInOut"
						},
						whileHover: { scale: 1.15 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" })
					})
				]
			})
		]
	});
}
function MarketActivity({ records, primary, lang, priceQuery, location, t }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4 px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Market activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-xl font-extrabold tracking-tight",
				children: t("todayPrices")
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/crops",
				className: "group flex items-center gap-1 text-xs font-extrabold text-primary",
				children: [t("viewAll"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 transition-transform duration-300 group-hover:translate-x-1" })]
			})]
		}),
		priceQuery.isPending && location?.district ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSkeleton, { rows: 3 })
		}) : records.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-4 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 px-5 py-7 shadow-[0_20px_70px_rgba(0,0,0,0.05)] backdrop-blur-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "absolute right-6 top-6 size-5 text-primary/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold text-muted-foreground",
				children: location?.district ? t("noPrices") : "Select your district to see prices."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaggerContainer, {
			className: "relative mt-4 overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/75 shadow-[0_25px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl",
			staggerDelay: .055,
			children: records.slice(0, 4).map((record, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaggerItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/market/$marketId",
				params: { marketId: record.market },
				search: {
					crop: primary.id,
					state: record.state,
					district: record.district
				},
				className: "group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden border-b border-border/70 px-4 py-4 last:border-b-0 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pointer-events-none absolute inset-y-0 left-0 w-0 bg-primary/[0.035] transition-all duration-500 group-hover:w-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						whileHover: {
							scale: 1.1,
							rotate: 4
						},
						transition: {
							type: "spring",
							stiffness: 350,
							damping: 22
						},
						className: "relative z-10 grid size-10 place-items-center rounded-xl bg-muted/60 text-base shadow-inner",
						children: [primary.emoji, index === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-primary text-[7px] font-black text-primary-foreground shadow-sm",
							children: "1"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-extrabold",
								children: record.market
							}), index === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden shrink-0 text-[8px] font-bold uppercase tracking-wide text-primary sm:block",
								children: "Highest"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 truncate text-[10px] font-semibold text-muted-foreground",
							children: [
								record.district,
								" ·",
								" ",
								record.variety ?? primary.name[lang]
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 shrink-0 text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm font-extrabold tabular-nums",
							children: inr(record.modalPrice)
						}), priceQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreshnessBadge, {
							freshness: priceQuery.data.freshness,
							className: "mt-1"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "relative z-10 hidden size-3.5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary sm:block" })
				]
			}) }, `${record.market}-${record.variety}-${record.date}`))
		}),
		priceQuery.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataProvenance, {
			result: priceQuery.data,
			className: "mt-3"
		})
	] });
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		whileHover: {
			y: -3,
			scale: 1.02
		},
		transition: {
			type: "spring",
			stiffness: 320,
			damping: 22
		},
		className: "min-w-0 text-center first:text-left last:text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate font-display text-sm font-extrabold tabular-nums",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[9px] font-semibold text-muted-foreground",
			children: label
		})]
	});
}
function QuietMetric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		whileHover: {
			y: -3,
			scale: 1.02
		},
		transition: {
			type: "spring",
			stiffness: 320,
			damping: 22
		},
		className: "group relative overflow-hidden rounded-xl border border-border/60 bg-background/30 px-3 py-2.5 transition-colors duration-300 hover:border-primary/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -right-5 -top-5 size-10 rounded-full bg-primary/[0.05] blur-lg transition-all duration-500 group-hover:bg-primary/[0.12]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative mt-1 truncate font-display text-sm font-extrabold tabular-nums",
				children: value
			})
		]
	});
}
function EmptyMarketState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/[0.12] p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
			animate: {
				y: [
					0,
					-4,
					0
				],
				scale: [
					1,
					1.05,
					1
				]
			},
			transition: {
				duration: 3.8,
				repeat: Infinity,
				ease: "easeInOut"
			},
			className: "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-extrabold",
			children: "Select your district"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs font-semibold leading-relaxed text-muted-foreground",
			children: "We'll show matching official mandi prices here."
		})] })]
	});
}
//#endregion
export { HomePage as component };
