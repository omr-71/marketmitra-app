import { isCurrentMarketDate } from "./market-freshness";
import type { ProviderAttempt } from "./market-types";
import { noRecentMarketPricesMessage } from "./market-district";

export type MarketAvailabilityNotice = {
  title: string;
  message: string;
};

const EMPTY_RESULT = "No current records returned";

function displayDate(value: string) {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function sourceFailure(attempt: ProviderAttempt): MarketAvailabilityNotice {
  if (attempt.error === "API key not configured") {
    return {
      title: "Market data is not configured",
      message: `${attempt.provider} needs its production API credential to be configured.`,
    };
  }

  if (
    /invalid json|unexpected response|no usable market-price records/i.test(attempt.error ?? "")
  ) {
    return {
      title: "Market data response could not be read",
      message: `${attempt.provider} returned an invalid or incomplete market-price response.`,
    };
  }

  if (attempt.statusCode === 401 || attempt.statusCode === 403) {
    return {
      title: "Market provider authentication failed",
      message: `${attempt.provider} rejected access (HTTP ${attempt.statusCode}). Verify the production AGMARKNET_API_KEY is valid and enabled.`,
    };
  }

  if (attempt.statusCode === null) {
    return {
      title: "Market data source could not be reached",
      message: `${attempt.provider} did not respond. Check the provider connection and try again.`,
    };
  }

  return {
    title: "Market data source error",
    message: `${attempt.provider} returned HTTP ${attempt.statusCode}. Try again later.`,
  };
}

function secondaryFailure(failures: ProviderAttempt[]) {
  const failure = failures[0];
  return failure ? ` ${sourceFailure(failure).message}` : "";
}

export function marketRequestFailureNotice(error: unknown): MarketAvailabilityNotice {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (/api key not configured|missing_api_key/i.test(message)) {
    return {
      title: "Market data is not configured",
      message: "The production AGMARKNET_API_KEY is not configured for this deployment.",
    };
  }

  if (/invalid json|unexpected response|no usable market-price records/i.test(message)) {
    return {
      title: "Market data response could not be read",
      message: "A market data provider returned an invalid or incomplete response.",
    };
  }

  const authStatus = message.match(/\bHTTP (401|403)\b/i);
  if (authStatus) {
    return {
      title: "Market provider authentication failed",
      message: `AGMARKNET rejected access (HTTP ${authStatus[1]}). Verify the production AGMARKNET_API_KEY is valid and enabled.`,
    };
  }

  const httpStatus = message.match(/\bHTTP (\d{3})\b/i);
  if (httpStatus) {
    return {
      title: "Market data source error",
      message: `A market data provider returned HTTP ${httpStatus[1]}. Try again later.`,
    };
  }

  if (/timeout|timed out|network|connect|reach/i.test(message)) {
    return {
      title: "Market data source could not be reached",
      message: "The market data provider did not respond. Check the connection and try again.",
    };
  }

  return {
    title: "Market data service unavailable",
    message: "The market data providers failed to return a usable response. Try again later.",
  };
}

export function marketAvailabilityNotice(
  attempts: ProviderAttempt[],
  district: string,
  now: Date = new Date(),
): MarketAvailabilityNotice {
  const failures = attempts.filter((attempt) => attempt.error && attempt.error !== EMPTY_RESULT);
  const authFailure = failures.find(
    (attempt) => attempt.statusCode === 401 || attempt.statusCode === 403,
  );
  if (authFailure) return sourceFailure(authFailure);

  const missingCredential = failures.find((attempt) => attempt.error === "API key not configured");
  if (missingCredential) return sourceFailure(missingCredential);

  const stale = attempts
    .filter(
      (attempt) => attempt.latestDataDate && !isCurrentMarketDate(attempt.latestDataDate, now),
    )
    .sort((left, right) =>
      (left.latestDataDate ?? "") < (right.latestDataDate ?? "") ? 1 : -1,
    )[0];

  if (stale?.latestDataDate) {
    const updated = stale.sourceUpdatedAt
      ? ` The source was last updated ${displayDate(stale.sourceUpdatedAt)}.`
      : "";
    return {
      title: "Market data is stale",
      message: `${noRecentMarketPricesMessage(district)} The latest verified ${stale.provider} report was dated ${displayDate(stale.latestDataDate)}.${updated}${secondaryFailure(failures)}`,
    };
  }

  if (
    failures.length > 0 &&
    !attempts.some(
      (attempt) =>
        attempt.statusCode !== null && attempt.statusCode >= 200 && attempt.statusCode < 300,
    )
  ) {
    return sourceFailure(failures[0]!);
  }

  const updatedAttempt = attempts
    .filter((attempt) => attempt.sourceUpdatedAt)
    .sort((left, right) =>
      (left.sourceUpdatedAt ?? "") < (right.sourceUpdatedAt ?? "") ? 1 : -1,
    )[0];
  const updated = updatedAttempt?.sourceUpdatedAt
    ? ` ${updatedAttempt.provider} was last updated ${displayDate(updatedAttempt.sourceUpdatedAt)}.`
    : "";

  return {
    title: "No recent verified market prices available",
    message: `${noRecentMarketPricesMessage(district)} No matching current records were returned.${updated}${secondaryFailure(failures)}`,
  };
}
