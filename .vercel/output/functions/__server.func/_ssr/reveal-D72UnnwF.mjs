import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reveal-D72UnnwF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Market Mitra premium viewport reveal.
*
* Designed to feel like a polished product interface:
* - soft depth
* - subtle blur correction
* - smooth upward movement
* - slight scale settling
* - one-time viewport activation
* - GPU-friendly transforms
* - reduced-motion support
*
* Existing Reveal props are intentionally preserved.
*/
function Reveal({ children, delay = 0, className = "", y = 28, duration = 650, scale = .985 }) {
	const ref = (0, import_react.useRef)(null);
	const [visible, setVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const element = ref.current;
		if (!element) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced") {
			setVisible(true);
			return;
		}
		if (!("IntersectionObserver" in window)) {
			setVisible(true);
			return;
		}
		let hasEntered = false;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting || hasEntered) return;
			hasEntered = true;
			setVisible(true);
			observer.unobserve(element);
		}, {
			threshold: .06,
			rootMargin: "0px 0px -7% 0px"
		});
		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);
	const hiddenBlur = duration >= 500 ? 5 : 3;
	const style = {
		opacity: visible ? 1 : 0,
		transform: visible ? "translate3d(0, 0, 0) scale(1)" : `translate3d(0, ${y}px, 0) scale(${scale})`,
		filter: visible ? "blur(0px)" : `blur(${hiddenBlur}px)`,
		transitionProperty: "opacity, transform, filter",
		transitionDuration: `${duration}ms`,
		transitionDelay: `${delay}ms`,
		transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
		willChange: visible ? "auto" : "opacity, transform, filter",
		backfaceVisibility: "hidden",
		transformOrigin: "center center"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className,
		style,
		children
	});
}
//#endregion
export { Reveal as t };
