/**
 * Transport estimation.
 *
 * There is no public live truck-freight rate API for Indian mandi trips, so the
 * cost here is an **estimate**: a real road distance approximation between the
 * farmer's saved location and the mandi, multiplied by a per-kilometre rate the
 * farmer can change. It is always labelled as an estimate in the UI — never
 * presented as an official live freight rate.
 */

/** Default hire rate for a small goods vehicle, one-way ₹ per km. Farmer-editable. */
export const DEFAULT_RATE_PER_KM = 35;

/** Straight-line km inflated to approximate road distance. */
const ROAD_FACTOR = 1.3;

export type Coords = { latitude: number; longitude: number };

export function haversineKm(a: Coords, b: Coords) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Approximate road distance in km, rounded to the nearest km. */
export function roadDistanceKm(from: Coords, to: Coords) {
  return Math.max(1, Math.round(haversineKm(from, to) * ROAD_FACTOR));
}

export type TransportEstimate = {
  distanceKm: number;
  ratePerKm: number;
  /** Round trip: the vehicle has to come back. */
  totalCost: number;
  perQuintal: number;
};

export function estimateTransport(
  distanceKm: number,
  quintals: number,
  ratePerKm = DEFAULT_RATE_PER_KM,
): TransportEstimate {
  const totalCost = Math.round(distanceKm * 2 * ratePerKm);
  return {
    distanceKm,
    ratePerKm,
    totalCost,
    perQuintal: quintals > 0 ? Math.round(totalCost / quintals) : totalCost,
  };
}
