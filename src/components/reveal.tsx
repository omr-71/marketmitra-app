import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  duration?: number;
  scale?: number;
}

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
export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 28,
  duration = 650,
  scale = 0.985,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduced";

    if (reducedMotion) {
      setVisible(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    let hasEntered = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasEntered) return;

        hasEntered = true;
        setVisible(true);
        observer.unobserve(element);
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -7% 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hiddenBlur = duration >= 500 ? 5 : 3;

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,

    transform: visible
      ? "translate3d(0, 0, 0) scale(1)"
      : `translate3d(0, ${y}px, 0) scale(${scale})`,

    filter: visible ? "blur(0px)" : `blur(${hiddenBlur}px)`,

    transitionProperty: "opacity, transform, filter",

    transitionDuration: `${duration}ms`,

    transitionDelay: `${delay}ms`,

    transitionTimingFunction:
      "cubic-bezier(0.22, 1, 0.36, 1)",

    willChange: visible
      ? "auto"
      : "opacity, transform, filter",

    backfaceVisibility: "hidden",

    transformOrigin: "center center",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}