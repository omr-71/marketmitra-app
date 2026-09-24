import { n as createServerFn } from "./server-Cjo4Sjkk.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-BwRSdtYk.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DeLRg3G3.mjs";
import { i as RESOURCE_TYPES, o as haversineKm, s as isUnsafeResourceText, t as MACHINE_TYPES } from "./link-types-BaOqjWyg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/link.functions-6LdB8GVK.js
var PHOTO_BUCKET = "link-photos";
/** Signed URLs for the private photo bucket. Missing photos stay missing. */
async function signPhotos(supabase, paths) {
	if (!paths.length) return [];
	const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600);
	if (error || !data) return [];
	return data.map((row) => row.signedUrl).filter((url) => Boolean(url));
}
function priceFit(listing, request) {
	if (listing.pricing_model === "free") return "within_budget";
	if (listing.price == null) return "unpriced";
	if (request.budget_mode === "none" || request.budget_mode === "negotiable") return "no_budget";
	const ceiling = request.budget_mode === "range" ? request.budget_max : request.budget_max ?? request.budget_min;
	if (ceiling == null) return "no_budget";
	return listing.price <= ceiling ? "within_budget" : "above_budget";
}
function overlapsWindow(listing, neededDate) {
	const from = new Date(listing.available_from).getTime();
	const to = new Date(listing.available_to).getTime();
	const day = (/* @__PURE__ */ new Date(`${neededDate}T00:00:00+05:30`)).getTime();
	return from <= day + 864e5 - 1 && to >= day;
}
/** Ranks real listings against a real request. Reasons are facts, not marketing. */
async function buildMatches(supabase, requestId) {
	const { data: requestRow } = await supabase.from("link_requests").select("*").eq("id", requestId).maybeSingle();
	if (!requestRow) return null;
	const request = requestRow;
	const { data: listingRows } = await supabase.from("link_listings").select("*").eq("resource_type", request.resource_type).in("status", [
		"available",
		"needs_confirmation",
		"reserved"
	]);
	const { data: matchRows } = await supabase.from("link_matches").select("id, listing_id, status").eq("request_id", requestId);
	const existing = /* @__PURE__ */ new Map();
	for (const row of matchRows ?? []) existing.set(row.listing_id, {
		id: row.id,
		status: row.status
	});
	const listings = (listingRows ?? []).filter((listing) => listing.owner_id !== request.requester_id && overlapsWindow(listing, request.needed_date));
	const ownerIds = [...new Set(listings.map((listing) => listing.owner_id))];
	const providers = /* @__PURE__ */ new Map();
	if (ownerIds.length) {
		const { data: profileRows } = await supabase.from("profiles").select("id, full_name, phone_verified").in("id", ownerIds);
		for (const row of profileRows ?? []) providers.set(row.id, {
			name: row.full_name,
			verified: Boolean(row.phone_verified)
		});
	}
	const candidates = [];
	for (const listing of listings) {
		const provider = providers.get(listing.owner_id) ?? {
			name: null,
			verified: false
		};
		const distanceKm = haversineKm(request, listing);
		const fit = priceFit(listing, request);
		const reasons = [];
		let score = 0;
		if (distanceKm != null) {
			if (distanceKm <= 10) score += 40;
			else if (distanceKm <= 25) score += 28;
			else if (distanceKm <= 60) score += 16;
			reasons.push(`${distanceKm} km away`);
		} else if (listing.district && request.district && listing.district.toLowerCase() === request.district.toLowerCase()) {
			score += 20;
			reasons.push(`Same district (${listing.district})`);
		}
		if (listing.status === "available") {
			score += 25;
			reasons.push("Marked available for your date");
		} else if (listing.status === "needs_confirmation") {
			score += 10;
			reasons.push("Availability needs owner confirmation");
		}
		if (provider.verified) {
			score += 20;
			reasons.push("Owner's mobile number is verified");
		}
		if (fit === "within_budget") {
			score += 15;
			reasons.push(listing.pricing_model === "free" ? "Shared free of cost" : "Within your budget");
		} else if (fit === "above_budget") reasons.push("Above your stated budget");
		else if (fit === "unpriced") reasons.push("Owner has not stated a price");
		if (request.quantity && listing.quantity && listing.quantity >= request.quantity) {
			score += 5;
			reasons.push(`${listing.quantity} ${listing.unit ?? "units"} available`);
		}
		candidates.push({
			listing: {
				...listing,
				photoUrls: await signPhotos(supabase, listing.photos ?? [])
			},
			providerVerified: provider.verified,
			providerName: provider.name,
			distanceKm,
			priceFit: fit,
			availability: listing.status === "available" ? "available" : "needs_confirmation",
			score,
			reasons,
			existingMatch: existing.get(listing.id) ?? null
		});
	}
	candidates.sort((a, b) => b.score - a.score);
	return {
		request,
		candidates: candidates.slice(0, 12)
	};
}
var resourceTypes = [...MACHINE_TYPES, ...RESOURCE_TYPES];
var requestSchema = objectType({
	category: enumType(["machine", "resource"]),
	resource_type: enumType(resourceTypes),
	needed_date: stringType().regex(/^\d{4}-\d{2}-\d{2}$/),
	time_from: stringType().max(10).optional().nullable(),
	time_to: stringType().max(10).optional().nullable(),
	quantity: numberType().int().positive().max(1e4).optional().nullable(),
	note: stringType().trim().max(400).optional().nullable(),
	state: stringType().trim().max(80).optional().nullable(),
	district: stringType().trim().max(80).optional().nullable(),
	latitude: numberType().min(-90).max(90).optional().nullable(),
	longitude: numberType().min(-180).max(180).optional().nullable(),
	budget_mode: enumType([
		"none",
		"max",
		"range",
		"negotiable"
	]),
	budget_min: numberType().nonnegative().max(1e7).optional().nullable(),
	budget_max: numberType().nonnegative().max(1e7).optional().nullable(),
	budget_unit: stringType().trim().max(30).optional().nullable()
});
var listingSchema = objectType({
	category: enumType(["machine", "resource"]),
	resource_type: enumType(resourceTypes),
	name: stringType().trim().min(2).max(90),
	description: stringType().trim().max(600).optional().nullable(),
	condition: stringType().trim().max(40).optional().nullable(),
	pricing_model: enumType([
		"free",
		"per_hour",
		"per_day",
		"per_acre",
		"per_unit",
		"fixed",
		"negotiable"
	]),
	price: numberType().nonnegative().max(1e7).optional().nullable(),
	negotiable: booleanType(),
	quantity: numberType().int().positive().max(1e4).optional().nullable(),
	unit: stringType().trim().max(30).optional().nullable(),
	service_area: stringType().trim().max(120).optional().nullable(),
	state: stringType().trim().max(80).optional().nullable(),
	district: stringType().trim().max(80).optional().nullable(),
	latitude: numberType().min(-90).max(90).optional().nullable(),
	longitude: numberType().min(-180).max(180).optional().nullable(),
	available_from: stringType().min(8),
	available_to: stringType().min(8),
	photos: arrayType(stringType().trim().max(300)).max(5),
	terms: stringType().trim().max(400).optional().nullable()
});
var listingUpdateSchema = listingSchema.extend({ listingId: stringType().uuid() });
var getLinkOverview_createServerFn_handler = createServerRpc({
	id: "c45e6ed75be31648e54a049265a21e9f5c669bd4db409bf3767bafe2c01fc260",
	name: "getLinkOverview",
	filename: "src/lib/link.functions.ts"
}, (opts) => getLinkOverview.__executeServer(opts));
var getLinkOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getLinkOverview_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const [profileRes, requestsRes, listingsRes, matchesRes, clustersRes] = await Promise.all([
		supabase.from("profiles").select("full_name, phone, phone_verified, state, district").eq("id", userId).maybeSingle(),
		supabase.from("link_requests").select("*").eq("requester_id", userId).order("created_at", { ascending: false }).limit(20),
		supabase.from("link_listings").select("*").eq("owner_id", userId).order("created_at", { ascending: false }).limit(20),
		supabase.from("link_matches").select("id, status, requester_id, provider_id, created_at, link_listings(name, resource_type), link_requests(needed_date)").or(`requester_id.eq.${userId},provider_id.eq.${userId}`).order("created_at", { ascending: false }).limit(20),
		supabase.rpc("link_cluster_opportunities", {})
	]);
	if (profileRes.error) throw new Error(profileRes.error.message);
	if (requestsRes.error) throw new Error(requestsRes.error.message);
	if (listingsRes.error) throw new Error(listingsRes.error.message);
	if (matchesRes.error) throw new Error(matchesRes.error.message);
	const listings = listingsRes.data ?? [];
	const withPhotos = await Promise.all(listings.map(async (listing) => ({
		...listing,
		photoUrls: await signPhotos(supabase, listing.photos ?? [])
	})));
	return {
		profile: profileRes.data ?? null,
		requests: requestsRes.data ?? [],
		listings: withPhotos,
		matches: (matchesRes.data ?? []).map((row) => ({
			id: row.id,
			status: row.status,
			role: row.requester_id === userId ? "requester" : "provider",
			listing_name: row.link_listings?.name ?? null,
			resource_type: row.link_listings?.resource_type ?? "",
			needed_date: row.link_requests?.needed_date ?? null,
			created_at: row.created_at
		})),
		clusters: clustersRes.data ?? []
	};
});
var createLinkRequest_createServerFn_handler = createServerRpc({
	id: "1b42b974abb54823260e44cf11b26c2085725a075acea360a61587f71aa7f7fb",
	name: "createLinkRequest",
	filename: "src/lib/link.functions.ts"
}, (opts) => createLinkRequest.__executeServer(opts));
var createLinkRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => requestSchema.parse(data)).handler(createLinkRequest_createServerFn_handler, async ({ data, context }) => {
	if (isUnsafeResourceText(data.resource_type, data.note)) throw new Error("Mitra Link cannot coordinate chemicals, fuel or medicines.");
	const { data: row, error } = await context.supabase.from("link_requests").insert({
		...data,
		requester_id: context.userId
	}).select("id").single();
	if (error) throw new Error(error.message);
	return { id: row.id };
});
var createLinkListing_createServerFn_handler = createServerRpc({
	id: "39d007e917b979ad787a71814df1e9d3a04bc28877736210a52ab8a3a42ce355",
	name: "createLinkListing",
	filename: "src/lib/link.functions.ts"
}, (opts) => createLinkListing.__executeServer(opts));
var createLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => listingSchema.parse(data)).handler(createLinkListing_createServerFn_handler, async ({ data, context }) => {
	if (isUnsafeResourceText(data.resource_type, data.name, data.description, data.terms)) throw new Error("Mitra Link cannot coordinate chemicals, fuel or medicines.");
	const { data: profile } = await context.supabase.from("profiles").select("phone_verified").eq("id", context.userId).maybeSingle();
	if (!profile?.phone_verified) throw new Error("Verify your mobile number before listing a machine or resource.");
	if (data.pricing_model !== "free" && data.pricing_model !== "negotiable" && data.price == null) throw new Error("State the price you charge, or choose Free / Negotiable.");
	const { data: row, error } = await context.supabase.from("link_listings").insert({
		...data,
		owner_id: context.userId
	}).select("id").single();
	if (error) throw new Error(error.message);
	return { id: row.id };
});
var updateLinkListing_createServerFn_handler = createServerRpc({
	id: "668f1ff35780c62c5f8c185b6ff6fa8c1dab63120f65c982101efa8a165c7cea",
	name: "updateLinkListing",
	filename: "src/lib/link.functions.ts"
}, (opts) => updateLinkListing.__executeServer(opts));
var updateLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => listingUpdateSchema.parse(data)).handler(updateLinkListing_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	if (isUnsafeResourceText(data.resource_type, data.name, data.description, data.terms)) throw new Error("Mitra Link cannot coordinate chemicals, fuel or medicines.");
	if (data.pricing_model !== "free" && data.pricing_model !== "negotiable" && data.price == null) throw new Error("State the price you charge, or choose Free / Negotiable.");
	const { data: existing, error: existingError } = await supabase.from("link_listings").select("id, owner_id").eq("id", data.listingId).maybeSingle();
	if (existingError) throw new Error(existingError.message);
	if (!existing) throw new Error("This listing no longer exists.");
	if (existing.owner_id !== userId) throw new Error("You can only edit your own Mitra Link listings.");
	const { listingId, ...updateData } = data;
	const { error } = await supabase.from("link_listings").update(updateData).eq("id", listingId).eq("owner_id", userId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		id: listingId
	};
});
var pauseLinkListing_createServerFn_handler = createServerRpc({
	id: "df47e3d1ccd479e0a8800fcdf421fefadc9aeb8a979dde83224edf1730f37edd",
	name: "pauseLinkListing",
	filename: "src/lib/link.functions.ts"
}, (opts) => pauseLinkListing.__executeServer(opts));
var pauseLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ listingId: stringType().uuid() }).parse(data)).handler(pauseLinkListing_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: listing, error: lookupError } = await supabase.from("link_listings").select("id, owner_id, status").eq("id", data.listingId).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (!listing) throw new Error("This listing no longer exists.");
	if (listing.owner_id !== userId) throw new Error("You can only manage your own listings.");
	const { error } = await supabase.from("link_listings").update({ status: "paused" }).eq("id", data.listingId).eq("owner_id", userId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		id: data.listingId,
		status: "paused"
	};
});
var resumeLinkListing_createServerFn_handler = createServerRpc({
	id: "682e0127481828476c12268680374680d367d77812cfa78e5154857c451f23a7",
	name: "resumeLinkListing",
	filename: "src/lib/link.functions.ts"
}, (opts) => resumeLinkListing.__executeServer(opts));
var resumeLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ listingId: stringType().uuid() }).parse(data)).handler(resumeLinkListing_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: listing, error: lookupError } = await supabase.from("link_listings").select("id, owner_id, status, available_from, available_to").eq("id", data.listingId).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (!listing) throw new Error("This listing no longer exists.");
	if (listing.owner_id !== userId) throw new Error("You can only manage your own listings.");
	const listingData = listing;
	if (listingData.available_to && new Date(listingData.available_to).getTime() < Date.now()) throw new Error("This listing has expired. Extend its availability before resuming it.");
	const { error } = await supabase.from("link_listings").update({ status: "active" }).eq("id", data.listingId).eq("owner_id", userId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		id: data.listingId,
		status: "active"
	};
});
var extendLinkListing_createServerFn_handler = createServerRpc({
	id: "4e0b533579d031eccd94150ea3e6c2fba22e43344cbc3405d26a6d943b891c34",
	name: "extendLinkListing",
	filename: "src/lib/link.functions.ts"
}, (opts) => extendLinkListing.__executeServer(opts));
var extendLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	listingId: stringType().uuid(),
	availableTo: stringType().min(8)
}).parse(data)).handler(extendLinkListing_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: listing, error: lookupError } = await supabase.from("link_listings").select("id, owner_id, available_from, available_to").eq("id", data.listingId).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (!listing) throw new Error("This listing no longer exists.");
	if (listing.owner_id !== userId) throw new Error("You can only manage your own listings.");
	const current = listing;
	const newEnd = new Date(data.availableTo).getTime();
	const start = new Date(current.available_from).getTime();
	if (!Number.isFinite(newEnd)) throw new Error("Enter a valid availability end date.");
	if (newEnd < start) throw new Error("Availability end date cannot be before the start date.");
	const { error } = await supabase.from("link_listings").update({
		available_to: data.availableTo,
		status: "active"
	}).eq("id", data.listingId).eq("owner_id", userId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		id: data.listingId,
		available_to: data.availableTo,
		status: "active"
	};
});
var removeLinkListing_createServerFn_handler = createServerRpc({
	id: "2b744278e04f0b8069d0c1bba4cd2a1bb6b429ef989a21b36d48db8f714fff1d",
	name: "removeLinkListing",
	filename: "src/lib/link.functions.ts"
}, (opts) => removeLinkListing.__executeServer(opts));
var removeLinkListing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ listingId: stringType().uuid() }).parse(data)).handler(removeLinkListing_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: listing, error: lookupError } = await supabase.from("link_listings").select("id, owner_id").eq("id", data.listingId).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (!listing) throw new Error("This listing has already been removed.");
	if (listing.owner_id !== userId) throw new Error("You can only remove your own listings.");
	const { error } = await supabase.from("link_listings").update({ status: "removed" }).eq("id", data.listingId).eq("owner_id", userId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		id: data.listingId,
		status: "removed"
	};
});
var getRequestMatches_createServerFn_handler = createServerRpc({
	id: "e5fd3882f9433f6a48cc6f9803436985d23c761dcc6fd4c177ea4ef7a0c3abe9",
	name: "getRequestMatches",
	filename: "src/lib/link.functions.ts"
}, (opts) => getRequestMatches.__executeServer(opts));
var getRequestMatches = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ requestId: stringType().uuid() }).parse(data)).handler(getRequestMatches_createServerFn_handler, async ({ data, context }) => buildMatches(context.supabase, data.requestId));
var createMatchRequest_createServerFn_handler = createServerRpc({
	id: "67e445e6abed89745f6cc1db1d45cfce0c549adbbfb6806c7d4fb46e2b32a358",
	name: "createMatchRequest",
	filename: "src/lib/link.functions.ts"
}, (opts) => createMatchRequest.__executeServer(opts));
var createMatchRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	requestId: stringType().uuid(),
	listingId: stringType().uuid()
}).parse(data)).handler(createMatchRequest_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: listing } = await supabase.from("link_listings").select("owner_id, status").eq("id", data.listingId).maybeSingle();
	if (!listing) throw new Error("This listing is no longer available.");
	const listingData = listing;
	if (listingData.status !== "active") throw new Error("This listing is not currently available.");
	const { data: row, error } = await supabase.from("link_matches").insert({
		request_id: data.requestId,
		listing_id: data.listingId,
		requester_id: userId,
		provider_id: listingData.owner_id,
		status: "requested"
	}).select("id").single();
	if (error) throw new Error(error.message);
	await supabase.from("link_requests").update({ status: "provider_contacted" }).eq("id", data.requestId);
	return { id: row.id };
});
var updateMatchStatus_createServerFn_handler = createServerRpc({
	id: "2647dff3691409ae64e7655ebcc19f75f1819deaf9edea6a811345a32d8ffefd",
	name: "updateMatchStatus",
	filename: "src/lib/link.functions.ts"
}, (opts) => updateMatchStatus.__executeServer(opts));
var updateMatchStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({
	matchId: stringType().uuid(),
	status: enumType([
		"accepted",
		"rejected",
		"scheduled",
		"in_progress",
		"completed",
		"cancelled"
	])
}).parse(data)).handler(updateMatchStatus_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: match, error: lookupError } = await supabase.from("link_matches").select("id, requester_id, provider_id, status").eq("id", data.matchId).maybeSingle();
	if (lookupError) throw new Error(lookupError.message);
	if (!match) throw new Error("This match no longer exists.");
	const matchData = match;
	if (matchData.requester_id !== userId && matchData.provider_id !== userId) throw new Error("You are not allowed to update this match.");
	const { error } = await supabase.from("link_matches").update({ status: data.status }).eq("id", data.matchId);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		id: data.matchId,
		status: data.status
	};
});
var getMatchContact_createServerFn_handler = createServerRpc({
	id: "97d2830899ba42f8e882f2623b0e3616dc41a1c9a7ff03bcd6d32bf0e8c99bcc",
	name: "getMatchContact",
	filename: "src/lib/link.functions.ts"
}, (opts) => getMatchContact.__executeServer(opts));
var getMatchContact = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => objectType({ matchId: stringType().uuid() }).parse(data)).handler(getMatchContact_createServerFn_handler, async ({ data, context }) => {
	const { data: rows, error } = await context.supabase.rpc("link_provider_contact", { _match_id: data.matchId });
	if (error) throw new Error(error.message);
	const row = (rows ?? [])[0];
	if (!row) return null;
	return row;
});
//#endregion
export { createLinkListing_createServerFn_handler, createLinkRequest_createServerFn_handler, createMatchRequest_createServerFn_handler, extendLinkListing_createServerFn_handler, getLinkOverview_createServerFn_handler, getMatchContact_createServerFn_handler, getRequestMatches_createServerFn_handler, pauseLinkListing_createServerFn_handler, removeLinkListing_createServerFn_handler, resumeLinkListing_createServerFn_handler, updateLinkListing_createServerFn_handler, updateMatchStatus_createServerFn_handler };
