import type { TreatmentGuidance } from "./treatments.schema.ts";

type CacheKey = {
  userId: string;
  diagnosisId: string;
  lang: "en" | "mr" | "hi";
};

const CACHE_TTL_MS = 60 * 60_000;
const RATE_WINDOW_MS = 60 * 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_CACHE_ENTRIES = 500;
const MAX_RATE_ENTRIES = 1_000;

const guidanceCache = new Map<string, { expiresAt: number; guidance: TreatmentGuidance }>();
const inFlightRequests = new Map<string, Promise<TreatmentGuidance>>();
const requestTimesByUser = new Map<string, { id: string; timestamp: number }[]>();

function keyOf({ userId, diagnosisId, lang }: CacheKey): string {
  return `${userId}:${diagnosisId}:${lang}`;
}

function prune(now: number): void {
  for (const [key, cached] of guidanceCache) {
    if (cached.expiresAt <= now) guidanceCache.delete(key);
  }

  for (const [userId, timestamps] of requestTimesByUser) {
    const recent = timestamps.filter((request) => request.timestamp > now - RATE_WINDOW_MS);
    if (recent.length === 0) requestTimesByUser.delete(userId);
    else requestTimesByUser.set(userId, recent);
  }

  while (guidanceCache.size > MAX_CACHE_ENTRIES) {
    const oldest = guidanceCache.keys().next().value;
    if (oldest === undefined) break;
    guidanceCache.delete(oldest);
  }

  while (requestTimesByUser.size > MAX_RATE_ENTRIES) {
    const oldest = requestTimesByUser.keys().next().value;
    if (oldest === undefined) break;
    requestTimesByUser.delete(oldest);
  }
}

export async function getCachedTreatmentGuidance(
  key: CacheKey,
  load: () => Promise<TreatmentGuidance>,
): Promise<TreatmentGuidance> {
  const now = Date.now();
  prune(now);
  const cacheKey = keyOf(key);
  const cached = guidanceCache.get(cacheKey);
  if (cached) return cached.guidance;

  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) return inFlight;

  const timestamps = requestTimesByUser.get(key.userId) ?? [];
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new Error("TREATMENT_REQUEST_RATE_LIMITED");
  }
  const reservation = { id: crypto.randomUUID(), timestamp: now };
  requestTimesByUser.set(key.userId, [...timestamps, reservation]);

  const releaseReservation = () => {
    const recent = requestTimesByUser.get(key.userId);
    if (!recent) return;
    const remaining = recent.filter((entry) => entry.id !== reservation.id);
    if (remaining.length === 0) requestTimesByUser.delete(key.userId);
    else requestTimesByUser.set(key.userId, remaining);
  };

  let loaded: Promise<TreatmentGuidance>;
  try {
    loaded = load();
  } catch (error) {
    releaseReservation();
    throw error;
  }
  const request = loaded
    .then((guidance) => {
      guidanceCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, guidance });
      prune(Date.now());
      return guidance;
    })
    .catch((error: unknown) => {
      releaseReservation();
      throw error;
    });
  inFlightRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    if (inFlightRequests.get(cacheKey) === request) inFlightRequests.delete(cacheKey);
  }
}
