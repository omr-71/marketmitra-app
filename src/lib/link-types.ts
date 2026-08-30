/**
 * Mitra Link — shared, client-safe types and catalogues.
 * No data is invented here: only category/type vocabularies and pure helpers.
 */

export type LinkCategory = "machine" | "resource";

export type PricingModel =
  | "free"
  | "per_hour"
  | "per_day"
  | "per_acre"
  | "per_unit"
  | "fixed"
  | "negotiable";

export type ListingStatus =
  | "available"
  | "reserved"
  | "unavailable"
  | "needs_confirmation"
  | "expired"
  | "under_review";

export type RequestStatus =
  | "searching"
  | "match_found"
  | "provider_contacted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";

export type MatchStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type BudgetMode = "none" | "max" | "range" | "negotiable";

/** V1 machine vocabulary (no transport pooling, no produce handling). */
export const MACHINE_TYPES = [
  "tractor",
  "harvester",
  "rotavator",
  "sprayer",
  "seed_drill",
  "thresher",
  "plough",
  "water_pump",
  "other_machine",
] as const;

/** V1 safe farm-resource vocabulary. */
export const RESOURCE_TYPES = [
  "crates",
  "tarpaulin",
  "hand_tools",
  "implements",
  "weighing_equipment",
  "irrigation_pipes",
  "storage_bags",
  "other_resource",
] as const;

export type MachineType = (typeof MACHINE_TYPES)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const PRICING_MODELS: PricingModel[] = [
  "free",
  "per_hour",
  "per_day",
  "per_acre",
  "per_unit",
  "fixed",
  "negotiable",
];

/** Resource kinds Mitra Link refuses to coordinate. */
const BLOCKED_TERMS = [
  "pesticide",
  "insecticide",
  "herbicide",
  "fungicide",
  "chemical",
  "diesel",
  "petrol",
  "fuel",
  "kerosene",
  "medicine",
  "drug",
  "injection",
  "acid",
  "cylinder",
  "explosive",
  "urea", // opened fertiliser/chemical containers are out of scope in V1
  "किटकनाशक",
  "कीटनाशक",
  "रसायन",
  "डिझेल",
  "डीजल",
  "औषध",
  "दवा",
];

export function isUnsafeResourceText(...parts: (string | null | undefined)[]) {
  const haystack = parts.filter(Boolean).join(" ").toLowerCase();
  return BLOCKED_TERMS.some((term) => haystack.includes(term));
}

export type LinkListing = {
  id: string;
  owner_id: string;
  category: LinkCategory;
  resource_type: string;
  name: string;
  description: string | null;
  condition: string | null;
  pricing_model: PricingModel;
  price: number | null;
  negotiable: boolean;
  quantity: number | null;
  unit: string | null;
  service_area: string | null;
  state: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  available_from: string;
  available_to: string;
  photos: string[];
  terms: string | null;
  status: ListingStatus;
  last_confirmed_at: string;
  created_at: string;
  updated_at: string;
};

export type LinkRequest = {
  id: string;
  requester_id: string;
  category: LinkCategory;
  resource_type: string;
  needed_date: string;
  time_from: string | null;
  time_to: string | null;
  quantity: number | null;
  note: string | null;
  state: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  budget_mode: BudgetMode;
  budget_min: number | null;
  budget_max: number | null;
  budget_unit: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

/** A listing enriched with real, computed match facts (never fabricated). */
export type LinkMatchCandidate = {
  listing: LinkListing & { photoUrls: string[] };
  providerVerified: boolean;
  providerName: string | null;
  distanceKm: number | null;
  priceFit: "within_budget" | "above_budget" | "no_budget" | "unpriced";
  availability: "available" | "needs_confirmation";
  score: number;
  reasons: string[];
  existingMatch: { id: string; status: MatchStatus } | null;
};

export type ClusterOpportunity = {
  resourceType: string;
  district: string | null;
  windowDate: string;
  compatibleRequests: number;
  providerCount: number;
  providerPrice: number | null;
  pricingModel: PricingModel | null;
};

export function haversineKm(
  a: { latitude: number | null; longitude: number | null },
  b: { latitude: number | null; longitude: number | null },
): number | null {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
    return null;
  }
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))) * 10) / 10;
}

/** Approximate distance wording — exact coordinates are never exposed. */
export function approxDistance(km: number | null) {
  if (km == null) return null;
  if (km < 1) return "< 1 km";
  return `~ ${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** Human labels for the V1 vocabulary — no invented catalogue entries. */
export const TYPE_LABELS: Record<string, string> = {
  tractor: "Tractor",
  harvester: "Harvester",
  rotavator: "Rotavator",
  sprayer: "Sprayer (water only)",
  seed_drill: "Seed drill",
  thresher: "Thresher",
  plough: "Plough",
  water_pump: "Water pump",
  other_machine: "Other machine",
  crates: "Crates",
  tarpaulin: "Tarpaulin",
  hand_tools: "Hand tools",
  implements: "Implements",
  weighing_equipment: "Weighing equipment",
  irrigation_pipes: "Irrigation pipes",
  storage_bags: "Storage bags",
  other_resource: "Other resource",
};

export const PRICING_LABELS: Record<PricingModel, string> = {
  free: "Free",
  per_hour: "Per hour",
  per_day: "Per day",
  per_acre: "Per acre",
  per_unit: "Per unit",
  fixed: "Fixed total",
  negotiable: "Negotiable",
};

export function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

/** Transparent equal split of a provider-stated price among cluster members. */
export function shareCost(price: number | null, farmers: number) {
  if (price == null || farmers < 2) return null;
  return Math.round((price / farmers) * 100) / 100;
}
