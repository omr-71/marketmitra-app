/**
 * Mitra Link — server-only helpers. No fabricated data: every field here is
 * either read from the database or computed from real values.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  haversineKm,
  type LinkListing,
  type LinkMatchCandidate,
  type LinkRequest,
  type MatchStatus,
} from "./link-types";

type Client = SupabaseClient<Database>;

const PHOTO_BUCKET = "link-photos";

export function ownerPhotoPaths(ownerId: string, paths: string[]) {
  const prefix = `${ownerId}/`;
  return paths.filter((path) => {
    const filename = path.slice(prefix.length);
    return (
      path.startsWith(prefix) &&
      !filename.includes("/") &&
      /^[0-9a-f-]+\.(jpg|jpeg|png|webp)$/i.test(filename)
    );
  });
}

/** Signed URLs for the private photo bucket. Missing photos stay missing. */
export async function signPhotos(supabase: Client, paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, 60 * 60);
  if (error) throw new Error(`Could not load resource photos: ${error.message}`);
  if (!data) throw new Error("Could not load resource photos.");
  const failedPhoto = data.find((row) => row.error);
  if (failedPhoto) throw new Error(`Could not load a resource photo: ${failedPhoto.error}`);
  return data.map((row) => row.signedUrl).filter((url): url is string => Boolean(url));
}

function priceFit(
  listing: LinkListing,
  request: LinkRequest,
): LinkMatchCandidate["priceFit"] {
  if (listing.pricing_model === "free") return "within_budget";
  if (listing.price == null) return "unpriced";
  if (request.budget_mode === "none" || request.budget_mode === "negotiable") return "no_budget";
  const ceiling =
    request.budget_mode === "range" ? request.budget_max : request.budget_max ?? request.budget_min;
  if (ceiling == null) return "no_budget";
  return listing.price <= ceiling ? "within_budget" : "above_budget";
}

function overlapsWindow(listing: LinkListing, neededDate: string) {
  const from = new Date(listing.available_from).getTime();
  const to = new Date(listing.available_to).getTime();
  const day = new Date(`${neededDate}T00:00:00+05:30`).getTime();
  const dayEnd = day + 24 * 60 * 60 * 1000 - 1;
  return from <= dayEnd && to >= day;
}

/** Ranks real listings against a real request. Reasons are facts, not marketing. */
export async function buildMatches(
  supabase: Client,
  requestId: string,
): Promise<{ request: LinkRequest; candidates: LinkMatchCandidate[] } | null> {
  const { data: requestRow, error: requestError } = await supabase
    .from("link_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (requestError) throw new Error(`Could not load this Mitra Link request: ${requestError.message}`);
  if (!requestRow) return null;
  const request = requestRow as unknown as LinkRequest;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: listingRows, error: listingsError } = await supabaseAdmin
    .from("link_listings")
    .select("*")
    .eq("category", request.category)
    .eq("resource_type", request.resource_type)
    .in("status", ["available", "needs_confirmation", "reserved"]);
  if (listingsError) throw new Error(`Could not load matching resources: ${listingsError.message}`);

  const { data: matchRows, error: matchesError } = await supabase
    .from("link_matches")
    .select("id, listing_id, status")
    .eq("request_id", requestId);
  if (matchesError) throw new Error(`Could not load existing matches: ${matchesError.message}`);

  const existing = new Map<string, { id: string; status: MatchStatus }>();
  for (const row of matchRows ?? []) {
    existing.set(row.listing_id, { id: row.id, status: row.status as MatchStatus });
  }

  const listings = ((listingRows ?? []) as unknown as LinkListing[]).filter(
    (listing) => listing.owner_id !== request.requester_id && overlapsWindow(listing, request.needed_date),
  );

  const ownerIds = [...new Set(listings.map((listing) => listing.owner_id))];
  const providers = new Map<string, { name: string | null; verified: boolean }>();
  if (ownerIds.length) {
    const { data: profileRows, error: profilesError } = await supabase.rpc(
      "link_verified_provider_profiles",
      { _user_ids: ownerIds },
    );
    if (profilesError) {
      throw new Error(`Could not load verified provider details: ${profilesError.message}`);
    }
    for (const row of profileRows ?? []) {
      providers.set(row.id, { name: row.full_name, verified: Boolean(row.phone_verified) });
    }
  }

  const candidates: LinkMatchCandidate[] = [];
  for (const listing of listings) {
    const provider = providers.get(listing.owner_id) ?? { name: null, verified: false };
    if (!provider.verified) continue;
    const distanceKm = haversineKm(request, listing);
    const fit = priceFit(listing, request);
    const reasons: string[] = [];

    let score = 0;
    if (distanceKm != null) {
      if (distanceKm <= 10) score += 40;
      else if (distanceKm <= 25) score += 28;
      else if (distanceKm <= 60) score += 16;
      reasons.push(`${distanceKm} km away`);
    } else if (
      listing.district &&
      request.district &&
      listing.district.toLowerCase() === request.district.toLowerCase()
    ) {
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
    } else if (fit === "above_budget") {
      reasons.push("Above your stated budget");
    } else if (fit === "unpriced") {
      reasons.push("Owner has not stated a price");
    }

    if (request.quantity && listing.quantity && listing.quantity >= request.quantity) {
      score += 5;
      reasons.push(`${listing.quantity} ${listing.unit ?? "units"} available`);
    }

    const { owner_id: _ownerId, latitude: _latitude, longitude: _longitude, terms: _terms, photos, ...safeListing } =
      listing;
    candidates.push({
      listing: {
        ...safeListing,
        photoUrls: await signPhotos(supabaseAdmin, ownerPhotoPaths(listing.owner_id, photos ?? [])),
      },
      providerVerified: provider.verified,
      providerName: provider.name,
      distanceKm,
      priceFit: fit,
      availability: listing.status === "available" ? "available" : "needs_confirmation",
      score,
      reasons,
      existingMatch: existing.get(listing.id) ?? null,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return { request, candidates: candidates.slice(0, 12) };
}
