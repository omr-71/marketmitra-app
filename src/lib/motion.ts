import { useEffect, useState } from "react";
import type { Transition, Variants } from "motion/react";

/**
 * Market Mitra Motion System
 *
 * Motion should feel:
 * - fluid, not bouncy
 * - fast, not rushed
 * - dimensional, not flashy
 * - alive, not constantly moving
 */

export const EASING = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.45, 0, 0.55, 1] as const,
  snappy: [0.16, 1, 0.3, 1] as const,
  soft: [0.25, 0.1, 0.25, 1] as const,
};

export const DURATION = {
  instant: 0.12,
  micro: 0.18,
  card: 0.28,
  reveal: 0.52,
  section: 0.68,
  page: 0.32,
  ambient: 8,
};

/**
 * Physical-feeling springs.
 * Low bounce = premium instead of playful.
 */
export const SPRINGS = {
  tactile: {
    type: "spring",
    stiffness: 500,
    damping: 34,
    mass: 0.75,
  } as Transition,

  navPill: {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.75,
  } as Transition,

  gentle: {
    type: "spring",
    stiffness: 240,
    damping: 30,
    mass: 0.9,
  } as Transition,

  magnetic: {
    type: "spring",
    stiffness: 180,
    damping: 22,
    mass: 0.65,
  } as Transition,
};

/**
 * Detect system-level reduced motion and
 * Market Mitra's own motion preference.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => {
      const mediaMatch = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const dataAttr =
        document.documentElement.dataset["motion"] === "reduced";

      setPrefersReduced(mediaMatch || dataAttr);
    };

    check();

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    mediaQuery.addEventListener("change", check);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-motion"
        ) {
          check();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });

    return () => {
      mediaQuery.removeEventListener("change", check);
      observer.disconnect();
    };
  }, []);

  return prefersReduced;
}

/* -------------------------------------------------------
   REVEALS
------------------------------------------------------- */

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.reveal,
      ease: EASING.out,
    },
  },
};

export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.985,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATION.reveal,
      ease: EASING.out,
    },
  },
};

/**
 * Slightly deeper reveal for important sections.
 * The blur is deliberately tiny — it should be felt,
 * not noticed.
 */
export const depthRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.975,
    filter: "blur(6px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATION.section,
      ease: EASING.out,
    },
  },
};

/* -------------------------------------------------------
   STAGGER
------------------------------------------------------- */

export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.045,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    filter: "blur(3px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATION.card,
      ease: EASING.out,
    },
  },
};

/* -------------------------------------------------------
   CARD / INTERACTION VARIANTS
------------------------------------------------------- */

export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
  },

  hover: {
    y: -4,
    scale: 1.008,
    transition: SPRINGS.gentle,
  },

  tap: {
    scale: 0.985,
    transition: SPRINGS.tactile,
  },
};

/**
 * Used for buttons / icons where we want
 * physical feedback without exaggerated movement.
 */
export const tactileVariants: Variants = {
  rest: {
    scale: 1,
  },

  hover: {
    scale: 1.035,
    transition: SPRINGS.tactile,
  },

  tap: {
    scale: 0.94,
    transition: SPRINGS.tactile,
  },
};

/* -------------------------------------------------------
   PAGE TRANSITIONS
------------------------------------------------------- */

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.995,
    filter: "blur(2px)",
  },

  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATION.page,
      ease: EASING.out,
    },
  },

  exit: {
    opacity: 0,
    y: -5,
    scale: 0.998,
    filter: "blur(1px)",
    transition: {
      duration: 0.18,
      ease: [0.32, 0, 0.67, 0],
    },
  },
};

/* -------------------------------------------------------
   AMBIENT MOTION
------------------------------------------------------- */

/**
 * Slow floating movement for atmospheric elements.
 * Keep these subtle — background motion should never
 * compete with farmer data.
 */
export const ambientFloatVariants: Variants = {
  initial: {
    y: 0,
    x: 0,
  },

  animate: {
    y: [-5, 5, -3, 0],
    x: [0, 3, -2, 0],
    transition: {
      duration: 8,
      ease: EASING.inOut,
      repeat: Infinity,
    },
  },
};

export const ambientDriftVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
    rotate: 0,
  },

  animate: {
    x: [0, 18, -10, 0],
    y: [0, -12, 8, 0],
    rotate: [0, 1.5, -1, 0],
    transition: {
      duration: 14,
      ease: EASING.inOut,
      repeat: Infinity,
    },
  },
};

/* -------------------------------------------------------
   LIVE INDICATORS
------------------------------------------------------- */

export const livePulseVariants: Variants = {
  initial: {
    opacity: 0.55,
    scale: 0.9,
  },

  animate: {
    opacity: [0.55, 1, 0.55],
    scale: [0.9, 1.12, 0.9],
    transition: {
      duration: 2.4,
      ease: EASING.inOut,
      repeat: Infinity,
    },
  },
};