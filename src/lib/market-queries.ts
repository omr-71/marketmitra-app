import { queryOptions } from "@tanstack/react-query";

import { getMarketPrices, getMarketStatus } from "./market-prices.functions";
import type { AggregateResult, MarketFilters, PriceRecord } from "./market-types";

/**
 * One shared query definition so Home, Markets, Market details and any other
 * consumer of the same crop/state hit a single in-flight request instead of
 * duplicating calls to the government API.
 */
export function marketPricesQuery(filters: Partial<MarketFilters>) {
  const enabled = Boolean(filters.commodity && filters.state && filters.district);
  return queryOptions({
    queryKey: [
      "market-prices",
      filters.commodity ?? "",
      filters.state ?? "",
      filters.district ?? "",
      filters.market ?? "",
    ],
    enabled,
    // AGMARKNET publishes once a day — refresh on mount, never on every render.
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: (): Promise<AggregateResult> =>
      getMarketPrices({
        data: {
          commodity: filters.commodity ?? "",
          state: filters.state ?? "",
          ...(filters.district ? { district: filters.district } : {}),
          ...(filters.market ? { market: filters.market } : {}),
        },
      }),
  });
}

export const marketStatusQuery = queryOptions({
  queryKey: ["market-status"],
  staleTime: 5 * 60 * 1000,
  retry: false,
  queryFn: () => getMarketStatus(),
});

/** Latest official record per mandi, newest reporting date first. */
export function latestPerMarket(records: PriceRecord[]): PriceRecord[] {
  const byMarket = new Map<string, PriceRecord>();
  for (const record of records) {
    const existing = byMarket.get(record.market);
    if (!existing || existing.date < record.date) byMarket.set(record.market, record);
  }
  return [...byMarket.values()].sort((a, b) =>
    a.date === b.date ? b.modalPrice - a.modalPrice : a.date < b.date ? 1 : -1,
  );
}
