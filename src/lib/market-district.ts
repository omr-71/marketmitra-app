const normalizeDistrict = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const DISTRICT_ALIASES: string[][] = [
  ["Nashik", "Nasik"],
  ["Chhatrapati Sambhajinagar", "Chattrapati Sambhajinagar", "Aurangabad"],
  ["Ahilyanagar", "Ahmednagar"],
  ["Dharashiv", "Osmanabad"],
  ["Gurugram", "Gurgaon"],
  ["Prayagraj", "Allahabad"],
  ["Ayodhya", "Faizabad"],
  ["Bengaluru Urban", "Bangalore Urban", "Bangalore"],
  ["Mysuru", "Mysore"],
  ["Belagavi", "Belgaum"],
  ["Kalaburagi", "Gulbarga"],
  ["Vijayapura", "Bijapur"],
  ["Ballari", "Bellary"],
  ["Shivamogga", "Shimoga"],
  ["Tumakuru", "Tumkur"],
];

function titleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|[\s()-])\p{L}/gu, (letter) => letter.toUpperCase());
}

export function marketDistrictVariants(value: string) {
  const normalized = normalizeDistrict(value);
  const aliases = DISTRICT_ALIASES.find((group) =>
    group.some((candidate) => normalizeDistrict(candidate) === normalized),
  );

  return [...new Set([titleCase(value), ...(aliases ?? [])])];
}

export function marketDistrictMatches(recordDistrict: string, selectedDistrict: string) {
  const selected = normalizeDistrict(selectedDistrict);
  return (
    selected.length > 0 &&
    marketDistrictVariants(selectedDistrict).some(
      (variant) => normalizeDistrict(variant) === normalizeDistrict(recordDistrict),
    )
  );
}

export function filterDistrictRecords<T extends { district?: string | null }>(
  records: T[],
  district: string,
): T[] {
  return records.filter((record) =>
    record.district ? marketDistrictMatches(record.district, district) : false,
  );
}

export function noRecentMarketPricesMessage(district: string) {
  return district
    ? `No recent verified market prices available for this crop in ${district}.`
    : "Select a district to view verified market prices.";
}
