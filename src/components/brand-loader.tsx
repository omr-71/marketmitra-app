import { LogoMark, Wordmark } from "@/components/brand";

type BrandLoaderProps = {
  message: string;
  variant?: "screen" | "inline";
};

export function BrandLoader({ message, variant = "screen" }: BrandLoaderProps) {
  return (
    <div
      className={`mm-loading mm-loading-${variant}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="mm-loading-content">
        <div className="mm-loading-lockup">
          <div className="mm-loading-mark" aria-hidden="true">
            <LogoMark className="mm-loading-logo" />
            <span className="mm-loading-leaf" />
          </div>
          {variant === "screen" && (
            <span aria-hidden="true">
              <Wordmark className="mm-loading-wordmark" />
            </span>
          )}
        </div>
        <p className="mm-loading-message">{message}</p>
        <span className="mm-loading-track" aria-hidden="true">
          <span className="mm-loading-sweep" />
        </span>
      </div>
    </div>
  );
}
