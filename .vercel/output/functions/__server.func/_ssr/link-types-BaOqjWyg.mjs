//#region node_modules/.nitro/vite/services/ssr/assets/link-types-BaOqjWyg.js
/** V1 machine vocabulary (no transport pooling, no produce handling). */
var MACHINE_TYPES = [
	"tractor",
	"harvester",
	"rotavator",
	"sprayer",
	"seed_drill",
	"thresher",
	"plough",
	"water_pump",
	"other_machine"
];
/** V1 safe farm-resource vocabulary. */
var RESOURCE_TYPES = [
	"crates",
	"tarpaulin",
	"hand_tools",
	"implements",
	"weighing_equipment",
	"irrigation_pipes",
	"storage_bags",
	"other_resource"
];
var PRICING_MODELS = [
	"free",
	"per_hour",
	"per_day",
	"per_acre",
	"per_unit",
	"fixed",
	"negotiable"
];
/** Resource kinds Mitra Link refuses to coordinate. */
var BLOCKED_TERMS = [
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
	"urea",
	"किटकनाशक",
	"कीटनाशक",
	"रसायन",
	"डिझेल",
	"डीजल",
	"औषध",
	"दवा"
];
function isUnsafeResourceText(...parts) {
	const haystack = parts.filter(Boolean).join(" ").toLowerCase();
	return BLOCKED_TERMS.some((term) => haystack.includes(term));
}
function haversineKm(a, b) {
	if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return null;
	const R = 6371;
	const dLat = (b.latitude - a.latitude) * Math.PI / 180;
	const dLon = (b.longitude - a.longitude) * Math.PI / 180;
	const lat1 = a.latitude * Math.PI / 180;
	const lat2 = b.latitude * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))) * 10) / 10;
}
/** Approximate distance wording — exact coordinates are never exposed. */
function approxDistance(km) {
	if (km == null) return null;
	if (km < 1) return "< 1 km";
	return `~ ${km.toFixed(km < 10 ? 1 : 0)} km`;
}
/** Human labels for the V1 vocabulary — no invented catalogue entries. */
var TYPE_LABELS = {
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
	other_resource: "Other resource"
};
var PRICING_LABELS = {
	free: "Free",
	per_hour: "Per hour",
	per_day: "Per day",
	per_acre: "Per acre",
	per_unit: "Per unit",
	fixed: "Fixed total",
	negotiable: "Negotiable"
};
function typeLabel(type) {
	return TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}
/** Transparent equal split of a provider-stated price among cluster members. */
function shareCost(price, farmers) {
	if (price == null || farmers < 2) return null;
	return Math.round(price / farmers * 100) / 100;
}
//#endregion
export { approxDistance as a, shareCost as c, RESOURCE_TYPES as i, typeLabel as l, PRICING_LABELS as n, haversineKm as o, PRICING_MODELS as r, isUnsafeResourceText as s, MACHINE_TYPES as t };
