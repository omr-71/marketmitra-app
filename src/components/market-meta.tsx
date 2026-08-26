import { formatIstDate, formatIstDateTime } from "@/lib/format";
import { freshnessTone, type Freshness } from "@/lib/market-freshness";
import type { AggregateResult } from "@/lib/market-types";

/** Trust badge — always derived from the real reporting date, never guessed. */
export function FreshnessBadge({
  freshness,
  className = "",
}: {
  freshness: Freshness;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
        freshnessTone[freshness.level]
      } ${className}`}
    >
      {freshness.label}
    </span>
  );
}

/**
 * One provenance line for an aggregated result: data date, source, fetch time
 * and, when relevant, an explicit archive warning.
 */
export function DataProvenance({
  result,
  priceDate,
  className = "",
}: {
  result: AggregateResult;
  priceDate?: string;
  className?: string;
}) {
  const date = priceDate || result.latestDate;
  return (
    <div className={`space-y-1 text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      <p>
        {date ? <>Market data date: {formatIstDate(date)}</> : <>No market data date available</>}
        {result.sourceUpdatedAt ? (
          <> · Source published {formatIstDateTime(result.sourceUpdatedAt)} IST</>
        ) : null}
      </p>
      <p>
        Source: {result.source ?? "—"} · Fetched {formatIstDateTime(result.fetchedAt)} IST
      </p>
      {result.corroboratedBy.length > 0 && (
        <p>Also reported the same date: {result.corroboratedBy.join(", ")}</p>
      )}
      {result.archive && (
        <p className="font-semibold text-amber-600 dark:text-amber-400">
          Last stored official record — this is not today&apos;s price.
        </p>
      )}
    </div>
  );
}

export function UnavailableState({
  onRetry,
  message = "No official market record is available for this crop and location right now.",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="card-surface p-5">
      <p className="text-sm font-bold">Market data unavailable</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {message} MarketMitra never shows an estimated or generated price.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="press mt-3 rounded-full bg-muted px-4 py-2 text-xs font-bold"
        >
          Try again
        </button>
      )}
    </div>
  );
}
