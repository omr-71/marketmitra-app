import type { MandiPricesResult } from "@/lib/market.functions";
import { formatIstDate, formatIstDateTime } from "@/lib/format";

/**
 * One clean update line. The price date always comes from the official
 * record's reporting date — MarketMitra's own fetch time is never shown as the
 * price date. Provider/source names are intentionally not shown to farmers.
 */
export function SourceNote({
  result,
  priceDate,
  className = "",
}: {
  result: Extract<MandiPricesResult, { ok: true }>;
  priceDate?: string;
  className?: string;
}) {
  const date = priceDate || result.latestDate;
  if (!date) return null;
  return (
    <p className={`text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      Updated: {formatIstDate(date)}
    </p>
  );
}

