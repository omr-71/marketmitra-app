import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  duration?: number;
  scale?: number;
}

/**
 * Instant Reveal wrapper (0ms delay, no transition lag upon route change).
 */
export function Reveal({
  children,
  className = "",
}: RevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
