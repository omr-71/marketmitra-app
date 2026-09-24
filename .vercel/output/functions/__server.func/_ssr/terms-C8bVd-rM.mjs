import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Sparkles, Bt as Check, Ft as CircleDot, I as ScanLine, It as CircleCheck, J as MousePointer2, Jt as ArrowUpRight, N as ShieldCheck, Xt as ArrowDown, bt as FileText, nt as LockKeyhole, o as Waves, st as Layers, wt as Earth, yt as FingerprintPattern, z as Radar } from "../_libs/lucide-react.mjs";
import { n as useTransform, r as useMotionValue, t as useSpring } from "../_libs/framer-motion+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { n as TopBar, t as Screen } from "./app-shell-Cbiru3-8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-C8bVd-rM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		number: "01",
		label: "FOUNDATION",
		heading: "About this service",
		icon: Sparkles,
		accent: "blue",
		body: ["Market Mitra is an agriculture information and coordination platform for Indian farmers, built and operated by Om Labhade. By creating an account or using the platform, you agree to use the service responsibly and according to these terms.", "Market Mitra is designed to bring market information, agricultural guidance and farmer-to-farmer resource coordination into one place. It is an information product and coordination layer, not a guarantee of a particular agricultural or financial outcome."]
	},
	{
		number: "02",
		label: "MARKET INTELLIGENCE",
		heading: "Market price information",
		icon: FileText,
		accent: "green",
		body: [
			"Market Mitra may use public market-price datasets and market reporting sources such as AGMARKNET or government-published data where applicable. The source, reporting date and freshness status displayed with a figure are the relevant context for that information.",
			"A displayed price is a reported market figure, not an offer or guaranteed selling price. Actual rates can vary because of crop quality, variety, grade, moisture, arrivals, demand, local conditions, commissions and negotiation.",
			"Market Mitra does not promise that a displayed price will be available when you reach a market or that using the information will result in a particular income."
		]
	},
	{
		number: "03",
		label: "FIELD CONDITIONS",
		heading: "Weather and farming guidance",
		icon: Waves,
		accent: "cyan",
		body: ["Weather information is provided to help with planning. Weather conditions can change quickly and local conditions may differ from a forecast.", "Irrigation, spraying, harvesting and other farming guidance is advisory. Before taking an important farming decision, consider field conditions, crop stage, local observation and advice from an appropriately qualified agricultural professional."]
	},
	{
		number: "04",
		label: "CROP INTELLIGENCE",
		heading: "Crop diagnosis and Mitra AI",
		icon: ScanLine,
		accent: "purple",
		body: [
			"Crop diagnosis and Mitra AI provide automated assistance based on the information supplied to the platform. Results may be incomplete or incorrect and should not be treated as a confirmed agricultural diagnosis.",
			"Mitra AI means Agriculture Intelligence within Market Mitra. It is intended to help users understand agricultural information, not replace a qualified agronomist, agricultural officer or local expert.",
			"Never use an automated suggestion as permission to ignore a product label, legally required instruction or professional agricultural advice. Always follow the approved label, dose, safety instructions and applicable waiting period for agricultural products."
		]
	},
	{
		number: "05",
		label: "FARMER NETWORK",
		heading: "Mitra Link coordination",
		icon: Earth,
		accent: "green",
		body: [
			"Mitra Link is designed to connect farmers for machines and other farm resources. It is a coordination feature and does not itself create a rental contract, guarantee a transaction or guarantee the condition or availability of equipment.",
			"The farmers involved are responsible for agreeing on rental terms, timing, payment, equipment condition, operation and safety. Market Mitra is not a party to those private arrangements.",
			"Users must list resources they genuinely own or are authorised to offer, provide accurate information and keep their contact information truthful. Unsafe, restricted or prohibited listings may be removed.",
			"Contact information should only be used for the legitimate purpose for which it was shared. Harassment, spam, impersonation or misuse of another user's information is not permitted."
		]
	},
	{
		number: "06",
		label: "IDENTITY",
		heading: "Your account",
		icon: FingerprintPattern,
		accent: "blue",
		body: [
			"You are responsible for keeping your account information accurate and for protecting your login credentials. Do not knowingly allow another person to use your account in a way that misrepresents who is using the service.",
			"If you notice suspicious account activity, incorrect profile information or unauthorised use, contact Market Mitra so the issue can be reviewed.",
			"Location and device permissions are used only where a feature needs them. You can control permissions through your device or browser settings, although some location-dependent features may not work without the required permission."
		]
	},
	{
		number: "07",
		label: "PLATFORM RULES",
		heading: "Acceptable use",
		icon: ShieldCheck,
		accent: "cyan",
		body: [
			"Use Market Mitra only for legitimate agricultural information and coordination. Do not attempt to break access controls, interfere with the service, introduce malicious code or deliberately overload the platform.",
			"Do not scrape, resell or republish platform information in a way that violates applicable rights or restrictions. Do not impersonate another person, organisation, government body or Market Mitra representative.",
			"Do not upload unlawful, fraudulent, abusive or unsafe content. Listings and accounts may be restricted or removed when they violate these rules or create a meaningful risk to other users."
		]
	},
	{
		number: "08",
		label: "LIMITATIONS",
		heading: "Service availability and liability",
		icon: Layers,
		accent: "purple",
		body: [
			"Market Mitra depends on external information, connectivity, device permissions and other technical systems. Information may occasionally be delayed, unavailable, incomplete or temporarily incorrect.",
			"The service is provided on an as-is and as-available basis. To the maximum extent permitted by applicable law, Market Mitra is not responsible for losses arising from reliance on reported prices, forecasts, automated guidance, farmer-to-farmer arrangements, equipment use or service interruptions.",
			"Users remain responsible for making decisions appropriate to their own circumstances and for independently verifying information when the decision involves significant financial, agricultural or safety consequences."
		]
	},
	{
		number: "09",
		label: "KEEPING IT CURRENT",
		heading: "Changes, ownership and contact",
		icon: ArrowUpRight,
		accent: "green",
		body: [
			"Market Mitra may evolve as new features, datasets and agricultural workflows are introduced. These terms may therefore be updated to reflect changes in the product.",
			"Market Mitra, its branding, interface, original visual design, software and original content remain protected by applicable intellectual-property laws. You may use the service as intended, but you may not present the product or its original materials as your own.",
			"For questions, corrections or grievances relating to the product or these terms, contact hello.marketmitra@gmail.com. If these terms are materially changed, the updated version and effective date should be published on this page."
		]
	}
];
function TermsPage() {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const smoothX = useSpring(mouseX, {
		stiffness: 80,
		damping: 20,
		mass: .5
	});
	const smoothY = useSpring(mouseY, {
		stiffness: 80,
		damping: 20,
		mass: .5
	});
	const orbX = useTransform(smoothX, [-600, 600], [-45, 45]);
	const orbY = useTransform(smoothY, [-600, 600], [-30, 30]);
	const [activeSection, setActiveSection] = (0, import_react.useState)("01");
	(0, import_react.useEffect)(() => {
		const handlePointer = (event) => {
			mouseX.set(event.clientX - window.innerWidth / 2);
			mouseY.set(event.clientY - window.innerHeight / 2);
		};
		window.addEventListener("pointermove", handlePointer);
		return () => {
			window.removeEventListener("pointermove", handlePointer);
		};
	}, [mouseX, mouseY]);
	(0, import_react.useEffect)(() => {
		const observers = [];
		sections.forEach((section) => {
			const element = document.getElementById(`terms-${section.number}`);
			if (!element) return;
			const observer = new IntersectionObserver(([entry]) => {
				if (entry?.isIntersecting) setActiveSection(section.number);
			}, {
				threshold: .2,
				rootMargin: "-18% 0px -58% 0px"
			});
			observer.observe(element);
			observers.push(observer);
		});
		return () => {
			observers.forEach((observer) => observer.disconnect());
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Screen, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mm-terms-experience",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				title: "Terms & Conditions",
				subtitle: "Last updated 23 September 2026",
				back: "/settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mm-terms-universe",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-universe-gradient" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-universe-grid" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-universe-noise" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						className: "mm-terms-cursor-light",
						style: {
							x: orbX,
							y: orbY
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-horizon" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-beam beam-one" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-beam beam-two" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-beam beam-three" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mm-terms-orbit orbit-a",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mm-terms-orbit orbit-b",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mm-terms-orbit orbit-c",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mm-terms-field",
						children: Array.from({ length: 54 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { "--particle": index } }, index))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-data-stream stream-a" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-data-stream stream-b" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-data-stream stream-c" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "mm-terms-side-nav",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mm-terms-side-label",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DOCUMENT MAP" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mm-terms-side-track",
						children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `#terms-${section.number}`,
							className: activeSection === section.number ? "is-active" : void 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: section.number }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})]
						}, section.number))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mm-terms-side-current",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "READING" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [activeSection, "/09"] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mm-terms-main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mm-terms-hero-new",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								className: "mm-terms-hero-copy-new",
								initial: {
									opacity: 0,
									y: 45,
									filter: "blur(10px)"
								},
								animate: {
									opacity: 1,
									y: 0,
									filter: "blur(0px)"
								},
								transition: {
									duration: 1,
									ease: [
										.22,
										1,
										.36,
										1
									]
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mm-terms-live-label",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), "MARKET MITRA · TRUST LAYER"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mm-terms-hero-title-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mm-terms-hero-index",
											children: "/ TERMS · 2026"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: ["Built for the", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: " real world." })] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mm-terms-hero-description",
										children: "The rules behind Market Mitra are built around one principle: useful agricultural information should be clear about where it comes from, what it means and where its limits are."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mm-terms-hero-actions",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: "#terms-01",
											className: "mm-terms-scroll-button",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Explore the terms" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { size: 16 })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mm-terms-status",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mm-terms-status-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VERSION 01 · SEPT 2026" })]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								className: "mm-terms-hero-object",
								initial: {
									opacity: 0,
									scale: .72,
									rotate: -8
								},
								animate: {
									opacity: 1,
									scale: 1,
									rotate: 0
								},
								transition: {
									duration: 1.2,
									delay: .15,
									ease: [
										.16,
										1,
										.3,
										1
									]
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-object-shadow" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mm-terms-object-orbit orbit-object-one",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mm-terms-object-orbit orbit-object-two",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
										className: "mm-terms-core",
										animate: {
											rotateY: [
												0,
												12,
												-8,
												0
											],
											rotateX: [
												0,
												-4,
												4,
												0
											],
											y: [
												0,
												-12,
												0
											]
										},
										transition: {
											duration: 9,
											repeat: Infinity,
											ease: "easeInOut"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mm-terms-core-face",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mm-terms-core-top",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MARKET MITRA" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mm-terms-core-logo",
														children: "MM"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mm-terms-core-scan",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { size: 22 })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mm-terms-core-title",
														children: ["TRUST", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "LAYER" })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-core-line" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mm-terms-core-data",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DATA" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GUIDANCE" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PEOPLE" })
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mm-terms-core-check",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "mm-terms-core-footer",
														children: "SELL SMARTER · EARN BETTER"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-core-edge edge-one" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-core-edge edge-two" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mm-terms-object-caption",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MARKET MITRA / TRUST / 2026" })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mm-terms-hero-bottom",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "01" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Foundation" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-hero-line" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "09" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Contact" })] })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
						className: "mm-terms-trust-panel",
						initial: {
							opacity: 0,
							y: 30
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: {
							once: true,
							amount: .25
						},
						transition: { duration: .75 },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mm-terms-trust-icon",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { size: 21 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mm-terms-trust-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "WHY THIS PAGE EXISTS" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "No mystery behind the product." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Market Mitra connects information, agricultural guidance and farmer coordination. These terms explain the boundaries of each part so the product stays understandable as it grows." })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mm-terms-trust-visual",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TRACEABLE" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CLEAR" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PRODUCT-SPECIFIC" })] })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mm-terms-principles",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mm-terms-principles-head",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MARKET MITRA / PRINCIPLES" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Three things we keep clear." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mm-terms-principles-code",
								children: "MM.TRUST_03"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mm-terms-principles-grid",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-terms-principle-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mm-terms-principle-icon",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 18 })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "01 · INFORMATION" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Reported is not guaranteed." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Market figures describe reported conditions. They do not promise the price you will receive." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-principle-line" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-terms-principle-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mm-terms-principle-icon",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waves, { size: 18 })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "02 · GUIDANCE" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Advice has boundaries." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Forecasts and automated agricultural guidance should be considered together with real field conditions." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-principle-line" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-terms-principle-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mm-terms-principle-icon",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { size: 18 })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "03 · CONNECTIONS" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "A match is not a contract." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mitra Link helps farmers discover resources; the final arrangement remains between the people involved." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-principle-line" })
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mm-terms-document-section",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mm-terms-document-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TERMS / 01—09" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "How Market Mitra works with you." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mm-terms-document-hint",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SCROLL TO EXPLORE" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mm-terms-sections-new",
							children: sections.map((section, index) => {
								const Icon = section.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
									id: `terms-${section.number}`,
									className: `mm-terms-section-new accent-${section.accent}`,
									initial: {
										opacity: 0,
										y: 60,
										scale: .96
									},
									whileInView: {
										opacity: 1,
										y: 0,
										scale: 1
									},
									viewport: {
										once: true,
										amount: .16
									},
									transition: {
										duration: .75,
										delay: Math.min(index * .025, .15),
										ease: [
											.22,
											1,
											.36,
											1
										]
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mm-terms-section-bg-number",
											children: section.number
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mm-terms-section-top",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mm-terms-section-number",
													children: section.number
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mm-terms-section-icon",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 19 })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mm-terms-section-label",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: section.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: section.heading })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mm-terms-section-node",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mm-terms-section-content",
											children: section.body.map((paragraph, paragraphIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [paragraphIndex === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mm-terms-paragraph-marker",
												children: "→"
											}), paragraph] }, paragraph))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mm-terms-section-footer",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MARKET MITRA" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mm-terms-section-progress",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [section.number, " / 09"] })
											]
										})
									]
								}, section.number);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.section, {
						className: "mm-terms-final",
						initial: {
							opacity: 0,
							scale: .97
						},
						whileInView: {
							opacity: 1,
							scale: 1
						},
						viewport: {
							once: true,
							amount: .25
						},
						transition: { duration: .9 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mm-terms-final-world",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-final-glow" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-final-ring ring-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-final-ring ring-2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-terms-final-ring ring-3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
									className: "mm-terms-final-core",
									animate: { rotate: 360 },
									transition: {
										duration: 28,
										repeat: Infinity,
										ease: "linear"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mm-terms-final-content",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-terms-live-label",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), "MARKET MITRA · AGRICULTURE INTELLIGENCE"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
									"Sell smarter.",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "Earn better." })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Market information, agricultural guidance and farmer connections should stay useful, understandable and honest about their limits." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/about",
									className: "mm-terms-final-link",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Discover Market Mitra" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 18 })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "mm-terms-footer-new",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "MARKET MITRA" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AGRICULTURE INTELLIGENCE" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Questions, corrections or grievances?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "mailto:hello.marketmitra@gmail.com",
							children: "hello.marketmitra@gmail.com"
						})] })]
					})
				]
			})
		]
	}) });
}
//#endregion
export { TermsPage as component };
