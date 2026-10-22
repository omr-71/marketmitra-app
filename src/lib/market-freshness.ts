/**
 * Freshness rules for mandi price data. Client-safe (no server imports).
 *
 * The whole point of this module is trust: a record is only ever labelled
 * "LIVE" when the official source published today AND the record itself is
 * dated today. Anything older is labelled by its real age, never as current.
 */

export type FreshnessLevel = "today" | "yesterday" | "recent" | "unavailable";

export type Freshness = {
  level: FreshnessLevel;
  label: string;
  /** Whole days between the market record date and today (IST). */
  ageDays: number | null;
};

/** Today's date in Indian Standard Time as yyyy-MM-dd. */
export function istToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

function daysBetween(fromIso: string, toIso: string) {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

/** Only today's and yesterday's official mandi reports are eligible. */
export const MAX_FRESHNESS_DAYS = 1;

/** True for an official report dated within the accepted freshness window in India time. */
export function isCurrentMarketDate(dataDate: string, now: Date = new Date()): boolean {
  const ageDays = daysBetween(dataDate, istToday(now));
  return ageDays !== null && ageDays >= 0 && ageDays <= MAX_FRESHNESS_DAYS;
}

export function computeFreshness(input: {
  /** Official reporting date of the record (yyyy-MM-dd). */
  dataDate: string | null | undefined;
  /** When the upstream dataset was last published (ISO), if known. */
  sourceUpdatedAt?: string | null;
  now?: Date;
}): Freshness {
  const today = istToday(input.now);
  if (!input.dataDate) return { level: "unavailable", label: "UNAVAILABLE", ageDays: null };

  const ageDays = daysBetween(input.dataDate, today);
  if (ageDays == null || ageDays < 0)
    return { level: "unavailable", label: "UNAVAILABLE", ageDays: null };

  if (ageDays === 0) return { level: "today", label: "UPDATED TODAY", ageDays: 0 };
  if (ageDays === 1) return { level: "yesterday", label: "YESTERDAY'S DATA", ageDays: 1 };
  if (ageDays <= MAX_FRESHNESS_DAYS) {
    return {
      level: "recent",
      label: `${ageDays} DAYS AGO`,
      ageDays,
    };
  }
  return { level: "unavailable", label: "UNAVAILABLE", ageDays };
}

export const freshnessTone: Record<FreshnessLevel, string> = {
  today: "bg-primary/10 text-primary ring-primary/20",
  yesterday: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
  recent: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
  unavailable: "bg-muted text-muted-foreground ring-border",
};
