import { o as require_jsx_runtime } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as motion } from "../_libs/motion.mjs";
import { a as useReducedMotion, i as staggerItemVariants, r as staggerContainerVariants } from "./app-shell-Cbiru3-8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stagger-DsVjBe0i.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Market Mitra stagger system.
*
* The goal is progressive movement rather than
* every element appearing at exactly the same time.
*/
function StaggerContainer({ children, className = "", delay = .045, staggerDelay = .075 }) {
	if (useReducedMotion()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: "hidden",
		whileInView: "visible",
		viewport: {
			once: true,
			amount: .08,
			margin: "0px 0px -70px 0px"
		},
		variants: {
			...staggerContainerVariants,
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					delayChildren: delay,
					staggerChildren: staggerDelay
				}
			}
		},
		className,
		children
	});
}
/**
* Individual item.
*
* Slight blur + depth + upward movement gives the
* interface a smoother physical feel without
* looking like a preset animation.
*/
function StaggerItem({ children, className = "" }) {
	if (useReducedMotion()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		variants: staggerItemVariants,
		className,
		style: {
			willChange: "transform, opacity, filter",
			backfaceVisibility: "hidden"
		},
		children
	});
}
//#endregion
export { StaggerItem as n, StaggerContainer as t };
