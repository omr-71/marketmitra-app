import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  formatIndian?: boolean;
}

/**
 * Market Mitra animated numeric display.
 *
 * - Animates once when entering the viewport
 * - Smoothly transitions when live data changes
 * - Cancels previous animation frames
 * - Respects reduced-motion preferences
 * - Keeps the existing component API
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 800,
  className = "",
  formatIndian = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);

  const elementRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const hasEnteredRef = useRef(false);
  const currentValueRef = useRef(value);
  const reducedMotion = useReducedMotion();

  const animateTo = (
    target: number,
    animationDuration: number,
    from?: number,
  ) => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (reducedMotion || animationDuration <= 0) {
      currentValueRef.current = target;
      setDisplayValue(target);
      return;
    }

    const start = from ?? currentValueRef.current;
    const difference = target - start;

    if (Math.abs(difference) < 0.0001) {
      currentValueRef.current = target;
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Smooth ease-out with a quick start and gentle landing.
      const eased = 1 - Math.pow(1 - progress, 4);

      const nextValue = start + difference * eased;

      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        currentValueRef.current = target;
        setDisplayValue(target);
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  /* Initial viewport animation */
  useEffect(() => {
    const node = elementRef.current;

    if (!node) return;

    if (reducedMotion) {
      currentValueRef.current = value;
      setDisplayValue(value);
      hasEnteredRef.current = true;
      return;
    }

    if (!("IntersectionObserver" in window)) {
      currentValueRef.current = value;
      setDisplayValue(value);
      hasEnteredRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasEnteredRef.current) {
          return;
        }

        hasEnteredRef.current = true;

        /*
         * Start from zero only for the first visual entrance.
         * After that, live changes animate from the current value.
         */
        currentValueRef.current = 0;
        setDisplayValue(0);

        animateTo(value, duration, 0);

        observer.unobserve(node);
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [duration, reducedMotion]);

  /* Live value changes after the initial entrance */
  useEffect(() => {
    if (!hasEnteredRef.current) return;

    if (reducedMotion) {
      currentValueRef.current = value;
      setDisplayValue(value);
      return;
    }

    /*
     * Don't restart the animation if the value hasn't
     * actually changed.
     */
    if (Math.abs(currentValueRef.current - value) < 0.0001) {
      return;
    }

    animateTo(value, 380);
  }, [value, reducedMotion]);

  /* Cleanup */
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const formattedNumber = () => {
    if (decimals > 0) {
      return displayValue.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    return Math.round(displayValue).toLocaleString(
      formatIndian ? "en-IN" : undefined,
    );
  };

  return (
    <span
      ref={elementRef}
      className={`inline-block tabular-nums ${className}`}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}
      {formattedNumber()}
      {suffix}
    </span>
  );
}