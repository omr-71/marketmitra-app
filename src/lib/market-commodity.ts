import { crops } from "./crops.ts";

const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

function cropForCommodity(commodity: string) {
  const normalized = normalizeName(commodity);
  return crops.find(
    (crop) =>
      normalizeName(crop.commodity) === normalized ||
      crop.commodityAliases?.some((alias) => normalizeName(alias) === normalized),
  );
}

/** Official names and known source spellings for the selected catalog crop. */
export function marketCommodityVariants(commodity: string): string[] {
  const crop = cropForCommodity(commodity);
  const candidates = crop
    ? [commodity, crop.commodity, ...(crop.commodityAliases ?? [])]
    : [commodity];
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const normalized = normalizeName(candidate);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

/** Matches only the same catalog commodity, including its explicit aliases. */
export function marketCommodityMatches(left: string, right: string): boolean {
  const rightName = normalizeName(right);
  return marketCommodityVariants(left).some((candidate) => normalizeName(candidate) === rightName);
}

/** Preserve source spelling, but reject a reported commodity from another crop. */
export function normalizeMarketCommodity(
  sourceCommodity: string,
  requestedCommodity: string,
): string | null {
  const sourceName = sourceCommodity.trim();
  if (!sourceName) return requestedCommodity;
  return marketCommodityMatches(requestedCommodity, sourceName) ? sourceName : null;
}
