import logo from "@/assets/marketmitra-logo-256.png";

export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Market Mitra logo"
      width={256}
      height={256}
      decoding="async"
      className={`${className} object-contain`}
    />
  );
}

export function Wordmark({ className = "text-lg" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      Market<span className="text-primary">Mitra</span>
    </span>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={compact ? "size-8" : "size-10"} />
      {!compact && <Wordmark />}
    </span>
  );
}
