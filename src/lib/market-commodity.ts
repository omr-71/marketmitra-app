import { crops, findCrop } from "./crops.ts";

const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

export function cropForCommodity(commodity: string) {
  if (!commodity) return undefined;
  const normalized = normalizeName(commodity);
  const byFind = findCrop(commodity);
  if (byFind) return byFind;
  return crops.find(
    (crop) =>
      crop.id.toLowerCase() === normalized ||
      normalizeName(crop.commodity) === normalized ||
      crop.commodityAliases?.some((alias) => normalizeName(alias) === normalized) ||
      normalizeName(crop.name.en) === normalized ||
      normalizeName(crop.name.mr) === normalized ||
      normalizeName(crop.name.hi) === normalized,
  );
}

/** Official names and known source spellings for the selected catalog crop. */
export function marketCommodityVariants(commodity: string): string[] {
  const crop = cropForCommodity(commodity);
  const candidates = crop
    ? [crop.commodity, commodity, ...(crop.commodityAliases ?? [])]
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
