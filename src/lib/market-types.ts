/**
 * Shared, client-safe market data contracts.
 *
 * These live outside the `.server` module so route components, the aggregator
 * server functions and the admin console can all speak the same shape without
 * pulling server-only code into the browser bundle.
 */

import type { Freshness } from "./market-freshness";

export type PriceRecord = {
  providerId: string;
  source: string;
  commodity: string;
  variety: string | null;
  grade: string | null;
  state: string;
  district: string;
  market: string;
  /** Official reporting date, yyyy-MM-dd. */
  date: string;
  arrival: number | null;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  currency: "INR";
  fetchedAt: string;
  sourceUpdatedAt: string | null;
};

export type ProviderAttempt = {
  providerId: string;
  provider: string;
  ok: boolean;
  statusCode: number | null;
  recordCount: number;
  latestDataDate: string | null;
  durationMs: number;
  error: string | null;
};

export type MarketFilters = {
  commodity: string;
  state: string;
  district?: string | undefined;
  market?: string | undefined;
};

export type AggregateResult = {
  records: PriceRecord[];
  attempts: ProviderAttempt[];
  providerId: string | null;
  source: string | null;
  archive: boolean;
  latestDate: string;
  sourceUpdatedAt: string | null;
  fetchedAt: string;
  freshness: Freshness;
  /** Other sources that also reported the same latest date, for transparency. */
  corroboratedBy: string[];
};

export type ProviderStatus = "healthy" | "degraded" | "down" | "not_configured" | "unknown";

export type ProviderDiagnostic = {
  id: string;
  name: string;
  priority: number;
  coverage: string;
  archive: boolean;
  requiresKey: boolean;
  /** True when the provider's credential (if any) is present. Never the key itself. */
  configured: boolean;
  status: ProviderStatus;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  lastRecordCount: number | null;
  latestDataDate: string | null;
  lastDurationMs: number | null;
  attempts24h: number;
  successes24h: number;
};

export type MarketServiceStatus = {
  generatedAt: string;
  /** Overall roll-up across non-archive providers. */
  overall: ProviderStatus;
  providers: ProviderDiagnostic[];
  lastSuccessAt: string | null;
  latestDataDate: string | null;
  freshness: Freshness;
};
