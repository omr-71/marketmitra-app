import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildMatches, signPhotos } from "./link.server";
import {
  isUnsafeResourceText,
  MACHINE_TYPES,
  RESOURCE_TYPES,
  type LinkListing,
  type LinkMatchCandidate,
  type LinkRequest,
  type MatchStatus,
} from "./link-types";

const resourceTypes = [...MACHINE_TYPES, ...RESOURCE_TYPES] as [string, ...string[]];

const requestSchema = z.object({
  category: z.enum(["machine", "resource"]),
  resource_type: z.enum(resourceTypes),
  needed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_from: z.string().max(10).optional().nullable(),
  time_to: z.string().max(10).optional().nullable(),
  quantity: z.number().int().positive().max(10_000).optional().nullable(),
  note: z.string().trim().max(400).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
  district: z.string().trim().max(80).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  budget_mode: z.enum(["none", "max", "range", "negotiable"]),
  budget_min: z.number().nonnegative().max(10_000_000).optional().nullable(),
  budget_max: z.number().nonnegative().max(10_000_000).optional().nullable(),
  budget_unit: z.string().trim().max(30).optional().nullable(),
});

const listingSchema = z.object({
  category: z.enum(["machine", "resource"]),
  resource_type: z.enum(resourceTypes),
  name: z.string().trim().min(2).max(90),
  description: z.string().trim().max(600).optional().nullable(),
  condition: z.string().trim().max(40).optional().nullable(),
  pricing_model: z.enum(["free", "per_hour", "per_day", "per_acre", "per_unit", "fixed", "negotiable"]),
  price: z.number().nonnegative().max(10_000_000).optional().nullable(),
  negotiable: z.boolean(),
  quantity: z.number().int().positive().max(10_000).optional().nullable(),
  unit: z.string().trim().max(30).optional().nullable(),
  service_area: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
  district: z.string().trim().max(80).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  available_from: z.string().min(8),
  available_to: z.string().min(8),
  photos: z.array(z.string().trim().max(300)).max(5),
  terms: z.string().trim().max(400).optional().nullable(),
});

export type LinkOverview = {
  profile: {
    full_name: string | null;
    phone: string | null;
    phone_verified: boolean;
    state: string | null;
    district: string | null;
  } | null;
  requests: LinkRequest[];
  listings: (LinkListing & { photoUrls: string[] })[];
  matches: {
    id: string;
    status: MatchStatus;
    role: "requester" | "provider";
    listing_name: string | null;
    resource_type: string;
    needed_date: string | null;
    created_at: string;
  }[];
  clusters: {
    resource_type: string;
    district: string | null;
    state: string | null;
    window_date: string;
    farmer_count: number;
  }[];
};

export const getLinkOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LinkOverview> => {
    const { supabase, userId } = context;

    const [profileRes, requestsRes, listingsRes, matchesRes, clustersRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone, phone_verified, state, district")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("link_requests")
        .select("*")
        .eq("requester_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("link_listings")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("link_matches")
        .select("id, status, requester_id, provider_id, created_at, link_listings(name, resource_type), link_requests(needed_date)")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.rpc("link_cluster_opportunities", {}),
    ]);

    const listings = ((listingsRes.data ?? []) as unknown as LinkListing[]);
    const withPhotos = await Promise.all(
      listings.map(async (listing) => ({
        ...listing,
        photoUrls: await signPhotos(supabase, listing.photos ?? []),
      })),
    );

    return {
      profile: (profileRes.data as LinkOverview["profile"]) ?? null,
      requests: (requestsRes.data ?? []) as unknown as LinkRequest[],
      listings: withPhotos,
      matches: (matchesRes.data ?? []).map((row: any) => ({
        id: row.id,
        status: row.status as MatchStatus,
        role: row.requester_id === userId ? ("requester" as const) : ("provider" as const),
        listing_name: row.link_listings?.name ?? null,
        resource_type: row.link_listings?.resource_type ?? "",
        needed_date: row.link_requests?.needed_date ?? null,
        created_at: row.created_at,
      })),
      clusters: (clustersRes.data ?? []) as LinkOverview["clusters"],
    };
  });

export const createLinkRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (isUnsafeResourceText(data.resource_type, data.note)) {
      throw new Error("Mitra Link cannot coordinate chemicals, fuel or medicines.");
    }
    const { data: row, error } = await context.supabase
      .from("link_requests")
      .insert({ ...data, requester_id: context.userId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const createLinkListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listingSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (isUnsafeResourceText(data.resource_type, data.name, data.description, data.terms)) {
      throw new Error("Mitra Link cannot coordinate chemicals, fuel or medicines.");
    }
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("phone_verified")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.phone_verified) {
      throw new Error("Verify your mobile number before listing a machine or resource.");
    }
    if (data.pricing_model !== "free" && data.pricing_model !== "negotiable" && data.price == null) {
      throw new Error("State the price you charge, or choose Free / Negotiable.");
    }
    const { data: row, error } = await context.supabase
      .from("link_listings")
      .insert({ ...data, owner_id: context.userId } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const getRequestMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ requestId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<{ request: LinkRequest; candidates: LinkMatchCandidate[] } | null> =>
    buildMatches(context.supabase, data.requestId),
  );

export const createMatchRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ requestId: z.string().uuid(), listingId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: listing } = await supabase
      .from("link_listings")
      .select("owner_id")
      .eq("id", data.listingId)
      .maybeSingle();
    if (!listing) throw new Error("This listing is no longer available.");

    const { data: row, error } = await supabase
      .from("link_matches")
      .insert({
        request_id: data.requestId,
        listing_id: data.listingId,
        requester_id: userId,
        provider_id: (listing as { owner_id: string }).owner_id,
        status: "requested",
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from("link_requests")
      .update({ status: "provider_contacted" } as never)
      .eq("id", data.requestId);

    return { id: (row as { id: string }).id };
  });

export const updateMatchStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        matchId: z.string().uuid(),
        status: z.enum(["accepted", "rejected", "scheduled", "in_progress", "completed", "cancelled"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("link_matches")
      .update({ status: data.status } as never)
      .eq("id", data.matchId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reveals the provider's verified mobile number only inside an accepted match. */
export const getMatchContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ matchId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("link_provider_contact", {
      _match_id: data.matchId,
    });
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0] as
      | { full_name: string | null; phone: string | null; phone_verified: boolean }
      | undefined;
    if (!row) return null;
    return row;
  });
