import type { MandiPricesResult } from "@/lib/market.functions";
import { formatIstDate, formatIstDateTime } from "@/lib/format";

/**
 * One clean provenance line. The price date always comes from the official
 * record's reporting date and the publish time from the data.gov.in dataset —
 * MarketMitra's own fetch time is never shown as the price date.
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
  return (
    <p className={`text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      {date ? <>Updated: {formatIstDate(date)}</> : null}
      {result.sourceUpdatedAt ? (
        <> · Source published {formatIstDateTime(result.sourceUpdatedAt)} IST</>
      ) : null}
      <br />
      Source: {result.source}
    </p>
  );
}
