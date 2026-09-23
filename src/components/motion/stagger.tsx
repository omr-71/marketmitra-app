import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  staggerContainerVariants,
  staggerItemVariants,
  useReducedMotion,
} from "@/lib/motion";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

/**
 * Market Mitra stagger system.
 *
 * The goal is progressive movement rather than
 * every element appearing at exactly the same time.
 */
export function StaggerContainer({
  children,
  className = "",
  delay = 0.045,
  staggerDelay = 0.075,
}: StaggerProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.08,
        margin: "0px 0px -70px 0px",
      }}
      variants={{
        ...staggerContainerVariants,

        hidden: {
          opacity: 0,
        },

        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual item.
 *
 * Slight blur + depth + upward movement gives the
 * interface a smoother physical feel without
 * looking like a preset animation.
 */
export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      style={{
        willChange: "transform, opacity, filter",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}