import { type HTMLAttributes } from "react";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface MitraAiLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: LogoSize;
  active?: boolean;
  pulse?: boolean;
  withOrb?: boolean;
}

const sizeConfig: Record<LogoSize, { container: string; svgSize: number }> = {
  xs: { container: "size-6", svgSize: 14 },
  sm: { container: "size-8", svgSize: 18 },
  md: { container: "size-11", svgSize: 24 },
  lg: { container: "size-14 lg:size-16", svgSize: 30 },
  xl: { container: "size-18 lg:size-20", svgSize: 38 },
};

/**
 * Minimalist, Modern 3D Floating White Mitra AI Logo
 * Features a pure white circular button with a clean 3D drop shadow,
 * a crisp border, and an elegant MarketMitra dark green spark / neural leaf icon.
 */
export function MitraAiLogo({
  size = "md",
  active = false,
  pulse = true,
  withOrb = true,
  className = "",
  ...props
}: MitraAiLogoProps) {
  const { container, svgSize } = sizeConfig[size];

  return (
    <div
      className={`group relative grid place-items-center select-none ${container} ${className}`}
      {...props}
    >
      {withOrb && (
        <>
          {/* Subtle Periodic Ping for ambient life */}
          {pulse && (
            <span className="pointer-events-none absolute inset-0 -z-20 animate-ping rounded-full bg-emerald-600/15 duration-1000" />
          )}

          {/* Crisp, Pure White 3D Floating Button Shell */}
          <div className="absolute inset-0 rounded-full border border-slate-200/90 bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)] transition-all duration-300 group-hover:border-emerald-600/30 group-hover:shadow-[0_16px_24px_-4px_rgba(0,0,0,0.12),0_6px_10px_-3px_rgba(0,0,0,0.06)]" />
        </>
      )}

      {/* Clean, Modern Geometric AI Spark & Node in MarketMitra Brand Dark Green (#0b2e20 / #10432c) */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
          active ? "scale-105" : ""
        }`}
      >
        <defs>
          {/* MarketMitra Primary Dark Green Gradient */}
          <linearGradient id="mitraGreenGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10432c" />
            <stop offset="60%" stopColor="#0b2e20" />
            <stop offset="100%" stopColor="#051f15" />
          </linearGradient>

          {/* Secondary Emerald Accent */}
          <linearGradient id="mitraAccentGrad" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Primary 4-Point Geometric AI Spark Core */}
        <path
          d="M16 2 C16 10.5 19.5 14 28 16 C19.5 18 16 21.5 16 30 C16 21.5 12.5 18 4 16 C12.5 14 16 10.5 16 2 Z"
          fill="url(#mitraGreenGrad)"
        />

        {/* Upper-Right Secondary Spark (Dynamic Intelligence Satellite) */}
        <path
          d="M24 4 C24 6.8 25.2 8 28 8.8 C25.2 9.6 24 10.8 24 13.6 C24 10.8 22.8 9.6 20 8.8 C22.8 8 24 6.8 24 4 Z"
          fill="url(#mitraAccentGrad)"
        />

        {/* Inner Luminous Core Jewel */}
        <circle cx="16" cy="16" r="2.2" fill="#ffffff" />
        <circle cx="16" cy="16" r="1.2" fill="#10b981" />
      </svg>
    </div>
  );
}
