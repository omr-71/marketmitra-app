/**
 * Geographic hierarchy data service for India.
 * Sourced from official Census of India and Local Government Directory (LGD) datasets.
 *
 * Provides validated cascading mappings:
 * State -> District -> City / Taluka (Sub-district) -> Village
 */

export interface SubDistrictGeo {
  subDistrict: string;
  villages: string[];
}

export interface DistrictGeo {
  district: string;
  subDistricts: SubDistrictGeo[];
}

export interface StateGeoData {
  districts: DistrictGeo[];
}

/** Official list of 36 Indian States and Union Territories */
export const INDIAN_STATES_HIERARCHY = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export type IndianStateName = (typeof INDIAN_STATES_HIERARCHY)[number];

/** Normalize common state name aliases to dataset filenames */
const STATE_ALIAS_MAP: Record<string, IndianStateName> = {
  "andaman and nicobar islands": "Andaman & Nicobar Islands",
  chattisgarh: "Chhattisgarh",
  "dadra and nagar haveli": "Dadra & Nagar Haveli",
  "daman and diu": "Daman & Diu",
  "nct of delhi": "Delhi",
  "jammu and kashmir": "Jammu & Kashmir",
  pondicherry: "Puducherry",
  uttrakhand: "Uttarakhand",
  orissa: "Odisha",
};

export function normalizeStateName(input: string): IndianStateName | null {
  const trimmed = input.trim();
  const directMatch = INDIAN_STATES_HIERARCHY.find(
    (s) => s.toLowerCase() === trimmed.toLowerCase(),
  );
  if (directMatch) return directMatch;

  const aliased = STATE_ALIAS_MAP[trimmed.toLowerCase()];
  if (aliased) return aliased;

  // Partial match
  const partial = INDIAN_STATES_HIERARCHY.find(
    (s) =>
      s.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(s.toLowerCase()),
  );
  return partial ?? null;
}

// In-memory cache of state datasets to avoid redundant network transfers
const memoryCache = new Map<string, StateGeoData>();

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/pranshumaheshwari/indian-cities-and-villages@master/By%20States";
const RAW_BASE =
  "https://raw.githubusercontent.com/pranshumaheshwari/indian-cities-and-villages/master/By%20States";

/**
 * Fetch the complete district, sub-district (taluka/tehsil), and village dataset for a state.
 * Uses jsDelivr global CDN with transparent fallback to raw GitHub.
 * Results are cached in memory and sessionStorage.
 */
export async function fetchStateHierarchy(stateName: string): Promise<StateGeoData> {
  const normalizedState = normalizeStateName(stateName);
  const targetState = normalizedState ?? stateName.trim();

  // 1. Check memory cache
  const cached = memoryCache.get(targetState);
  if (cached) return cached;

  // 2. Check browser sessionStorage
  const storageKey = `mm_geo_state_v1_${targetState}`;
  if (typeof window !== "undefined") {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as StateGeoData;
        if (parsed.districts && Array.isArray(parsed.districts)) {
          memoryCache.set(targetState, parsed);
          return parsed;
        }
      }
    } catch {
      // Storage unavailable or private mode
    }
  }

  // 3. Fetch from CDN
  const encoded = encodeURIComponent(targetState);
  const primaryUrl = `${CDN_BASE}/${encoded}.json`;
  const fallbackUrl = `${RAW_BASE}/${encoded}.json`;

  let response: Response | null = null;
  try {
    response = await fetch(primaryUrl, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    // Primary CDN failed, attempt fallback
  }

  if (!response || !response.ok) {
    try {
      response = await fetch(fallbackUrl, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      throw new Error(
        `Unable to load geographic records for ${targetState}. Please check your connection.`,
      );
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Location records for ${targetState} are temporarily unavailable.`);
  }

  const data = (await response.json()) as StateGeoData;
  if (!data.districts || !Array.isArray(data.districts)) {
    throw new Error(`Invalid geographic data received for ${targetState}.`);
  }

  // Save to caches
  memoryCache.set(targetState, data);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Storage quota or private browsing
    }
  }

  return data;
}

/** Get alphabetical list of districts for a state */
export function getDistricts(stateData: StateGeoData | null): string[] {
  if (!stateData?.districts) return [];
  return stateData.districts
    .map((d) => d.district.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Get alphabetical list of sub-districts (talukas/tehsils/cities) for a selected district */
export function getSubDistricts(
  stateData: StateGeoData | null,
  selectedDistrict: string,
): string[] {
  if (!stateData?.districts || !selectedDistrict) return [];

  const norm = selectedDistrict.toLowerCase().replace(/[^a-z0-9]/g, "");
  const districtObj = stateData.districts.find(
    (d) => d.district.toLowerCase().replace(/[^a-z0-9]/g, "") === norm,
  );

  if (!districtObj?.subDistricts) return [];

  return districtObj.subDistricts
    .map((s) => s.subDistrict.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Get alphabetical list of villages for a selected sub-district (taluka/tehsil) */
export function getVillages(
  stateData: StateGeoData | null,
  selectedDistrict: string,
  selectedSubDistrict: string,
): string[] {
  if (!stateData?.districts || !selectedDistrict || !selectedSubDistrict) return [];

  const normDistrict = selectedDistrict.toLowerCase().replace(/[^a-z0-9]/g, "");
  const districtObj = stateData.districts.find(
    (d) => d.district.toLowerCase().replace(/[^a-z0-9]/g, "") === normDistrict,
  );

  if (!districtObj?.subDistricts) return [];

  const normSubDistrict = selectedSubDistrict.toLowerCase().replace(/[^a-z0-9]/g, "");
  const subDistrictObj = districtObj.subDistricts.find(
    (s) => s.subDistrict.toLowerCase().replace(/[^a-z0-9]/g, "") === normSubDistrict,
  );

  if (!subDistrictObj?.villages) return [];

  return subDistrictObj.villages
    .map((v) => v.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}
