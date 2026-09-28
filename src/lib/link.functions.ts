import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { buildMatches, ownerPhotoPaths, signPhotos } from "./link.server";
import {
  isUnsafeResourceText,
  MACHINE_TYPES,
  RESOURCE_TYPES,
  type LinkCategory,
  type LinkListing,
  type LinkMatchCandidate,
  type LinkRequest,
  type MatchStatus,
} from "./link-types";

const resourceTypes = [...MACHINE_TYPES, ...RESOURCE_TYPES] as [
  string,
  ...string[],
];

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
}).superRefine((data, ctx) => {
  const date = new Date(`${data.needed_date}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== data.needed_date
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["needed_date"],
      message: "Enter a valid required date.",
    });
  }
  const validTypes = data.category === "machine" ? MACHINE_TYPES : RESOURCE_TYPES;
  if (!validTypes.includes(data.resource_type as never)) {
    ctx.addIssue({
      code: "custom",
      path: ["resource_type"],
      message: "Choose a resource type that matches the selected category.",
    });
  }
});

const listingSchema = z.object({
  category: z.enum(["machine", "resource"]),
  resource_type: z.enum(resourceTypes),
  name: z.string().trim().min(2).max(90),
  description: z.string().trim().max(600).optional().nullable(),
  condition: z.string().trim().max(40).optional().nullable(),
  pricing_model: z.enum([
    "free",
    "per_hour",
    "per_day",
    "per_acre",
    "per_unit",
    "fixed",
    "negotiable",
  ]),
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

const listingUpdateSchema = listingSchema.extend({
  listingId: z.string().uuid(),
});

function validateCategoryType(category: LinkCategory, resourceType: string) {
  const validTypes = category === "machine" ? MACHINE_TYPES : RESOURCE_TYPES;
  if (!validTypes.includes(resourceType as never)) {
    throw new Error("Choose a resource type that matches the selected category.");
  }
}

function normalizeListingDate(value: string, endOfDay: boolean) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (dateOnly) {
    const calendarDate = new Date(`${value}T00:00:00.000Z`);
    if (
      !Number.isFinite(calendarDate.getTime()) ||
      calendarDate.toISOString().slice(0, 10) !== value
    ) {
      throw new Error("Enter a valid availability date.");
    }
  }
  const timestamp = dateOnly
    ? new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+05:30`)
    : new Date(value);
  if (!Number.isFinite(timestamp.getTime())) {
    throw new Error("Enter a valid availability date.");
  }
  return timestamp.toISOString();
}

function listingWindow(availableFrom: string, availableTo: string) {
  const from = normalizeListingDate(availableFrom, false);
  const to = normalizeListingDate(availableTo, true);
  if (new Date(to).getTime() <= new Date(from).getTime()) {
    throw new Error("Availability end date must be on or after the start date.");
  }
  return { available_from: from, available_to: to };
}

async function validateListingPhotos(
  supabase: SupabaseClient<Database>,
  userId: string,
  paths: string[],
) {
  if (new Set(paths).size !== paths.length) {
    throw new Error("A resource photo was selected more than once.");
  }

  const ownerPrefix = `${userId}/`;
  if (
    paths.some(
      (path) =>
        !path.startsWith(ownerPrefix) ||
        path.slice(ownerPrefix.length).includes("/") ||
        !/^[0-9a-f-]+\.(jpg|jpeg|png|webp)$/i.test(path.slice(ownerPrefix.length)),
    )
  ) {
    throw new Error("Each photo must be uploaded by you before it can be shared.");
  }

  if (!paths.length) return;
  const { data, error } = await supabase.storage
    .from("link-photos")
    .list(userId, { limit: 1000 });
  if (error) throw new Error(`Could not verify uploaded resource photos: ${error.message}`);

  const uploadedPaths = new Set((data ?? []).map((file) => `${ownerPrefix}${file.name}`));
  if (paths.some((path) => !uploadedPaths.has(path))) {
    throw new Error("One or more selected photos are missing. Upload them again before sharing.");
  }
}

type OwnerListing = Omit<LinkListing, "photos"> & {
  photoUrls: string[];
};

type LinkDiscoveryListing = Omit<
  LinkListing,
  | "owner_id"
  | "latitude"
  | "longitude"
  | "terms"
  | "photos"
  | "last_confirmed_at"
  | "created_at"
  | "updated_at"
> & {
  providerName: string | null;
  providerVerified: true;
  photoUrls: string[];
};

export type LinkOverview = {
  profile: {
    full_name: string | null;
    phone: string | null;
    phone_verified: boolean;
    state: string | null;
    district: string | null;
  } | null;

  requests: LinkRequest[];

  listings: OwnerListing[];

  discoverListings: LinkDiscoveryListing[];

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      profileRes,
      requestsRes,
      listingsRes,
      discoverListingsRes,
      matchesRes,
      clustersRes,
    ] = await Promise.all([
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

      supabaseAdmin
        .from("link_listings")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),

      supabaseAdmin
        .from("link_listings")
        .select(
          "id, owner_id, category, resource_type, name, description, condition, pricing_model, price, negotiable, quantity, unit, service_area, state, district, available_from, available_to, photos, status, last_confirmed_at, created_at, updated_at",
        )
        .neq("owner_id", userId)
        .in("status", ["available", "reserved", "needs_confirmation"])
        .order("created_at", { ascending: false })
        .limit(50),

      supabase
        .from("link_matches")
        .select(
          "id, status, requester_id, provider_id, created_at, link_listings(name, resource_type), link_requests(needed_date)",
        )
        .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(20),

      supabase.rpc("link_cluster_opportunities", {}),
    ]);

    if (profileRes.error) {
      throw new Error(`Could not load your Mitra Link profile: ${profileRes.error.message}`);
    }

    if (requestsRes.error) {
      throw new Error(`Could not load your Mitra Link requests: ${requestsRes.error.message}`);
    }

    if (listingsRes.error) {
      throw new Error(`Could not load your Mitra Link listings: ${listingsRes.error.message}`);
    }

    if (discoverListingsRes.error) {
      throw new Error(`Could not load shared resources: ${discoverListingsRes.error.message}`);
    }

    if (matchesRes.error) {
      throw new Error(`Could not load your Mitra Link matches: ${matchesRes.error.message}`);
    }

    if (clustersRes.error) {
      throw new Error(`Could not load Mitra Link opportunities: ${clustersRes.error.message}`);
    }

    const listings = (listingsRes.data ?? []) as unknown as LinkListing[];
    const discoverListings = (discoverListingsRes.data ?? []) as unknown as LinkListing[];
    const providerIds = [...new Set(discoverListings.map((listing) => listing.owner_id))];
    const { data: providerRows, error: providerError } =
      providerIds.length > 0
        ? await supabase.rpc("link_verified_provider_profiles", { _user_ids: providerIds })
        : { data: [], error: null };
    if (providerError) {
      throw new Error(`Could not load verified provider details: ${providerError.message}`);
    }

    const providers = new Map(
      (providerRows ?? []).map((provider) => [provider.id, provider.full_name]),
    );

    const withPhotos: OwnerListing[] = await Promise.all(
      listings.map(async (listing) => {
        const { photos, ...ownerListing } = listing;
        return {
          ...ownerListing,
          photoUrls: await signPhotos(
            supabaseAdmin,
            ownerPhotoPaths(listing.owner_id, photos ?? []),
          ),
        };
      }),
    );
    const sharedListings = await Promise.all(
      discoverListings
        .filter((listing) => providers.has(listing.owner_id))
        .map(async (listing) => {
          const {
            owner_id,
            latitude: _latitude,
            longitude: _longitude,
            terms: _terms,
            photos,
            last_confirmed_at: _lastConfirmedAt,
            created_at: _createdAt,
            updated_at: _updatedAt,
            ...safeListing
          } = listing;
          return {
            ...safeListing,
            providerName: providers.get(owner_id) ?? null,
            providerVerified: true as const,
            photoUrls: await signPhotos(
              supabaseAdmin,
              ownerPhotoPaths(owner_id, photos ?? []),
            ),
          };
        }),
    );

    return {
      profile:
        (profileRes.data as LinkOverview["profile"]) ?? null,

      requests:
        (requestsRes.data ?? []) as unknown as LinkRequest[],

      listings: withPhotos,

      discoverListings: sharedListings,

      matches: ((matchesRes.data ?? []) as unknown as {
        id: string;
        status: string;
        requester_id: string;
        created_at: string;
        link_listings: { name: string; resource_type: string } | null;
        link_requests: { needed_date: string } | null;
      }[]).map((row) => ({
        id: row.id,
        status: row.status as MatchStatus,
        role:
          row.requester_id === userId
            ? ("requester" as const)
            : ("provider" as const),
        listing_name:
          row.link_listings?.name ?? null,
        resource_type:
          row.link_listings?.resource_type ?? "",
        needed_date:
          row.link_requests?.needed_date ?? null,
        created_at: row.created_at,
      })),

      clusters:
        (clustersRes.data ?? []) as LinkOverview["clusters"],
    };
  });

export const createLinkRequest = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    requestSchema.parse(data),
  )
  .handler(async ({ data, context }) => {
    validateCategoryType(data.category, data.resource_type);
    if (
      isUnsafeResourceText(
        data.resource_type,
        data.note,
      )
    ) {
      throw new Error(
        "Mitra Link cannot coordinate chemicals, fuel or medicines.",
      );
    }

    const { data: row, error } = await context.supabase
      .from("link_requests")
      .insert({
        ...data,
        requester_id: context.userId,
      } as never)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: (row as { id: string }).id,
    };
  });

export const createLinkListing = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    listingSchema.parse(data),
  )
  .handler(async ({ data, context }) => {
    validateCategoryType(data.category, data.resource_type);
    if (
      isUnsafeResourceText(
        data.resource_type,
        data.name,
        data.description,
        data.terms,
      )
    ) {
      throw new Error(
        "Mitra Link cannot coordinate chemicals, fuel or medicines.",
      );
    }

    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("phone_verified")
      .eq("id", context.userId)
      .maybeSingle();

    if (profileError) throw new Error(`Could not verify your profile: ${profileError.message}`);
    if (!profile?.phone_verified) {
      throw new Error(
        "Verify your mobile number before listing a machine or resource.",
      );
    }

    if (
      data.pricing_model !== "free" &&
      data.pricing_model !== "negotiable" &&
      data.price == null
    ) {
      throw new Error(
        "State the price you charge, or choose Free / Negotiable.",
      );
    }

    await validateListingPhotos(context.supabase, context.userId, data.photos);
    const window = listingWindow(data.available_from, data.available_to);

    const { data: row, error } = await context.supabase
      .from("link_listings")
      .insert({
        ...data,
        ...window,
        owner_id: context.userId,
      } as never)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: (row as { id: string }).id,
    };
  });

/**
 * Update an existing I HAVE listing.
 *
 * Only the owner of the listing can update it.
 */
export const updateLinkListing = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    listingUpdateSchema.parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (
      isUnsafeResourceText(
        data.resource_type,
        data.name,
        data.description,
        data.terms,
      )
    ) {
      throw new Error(
        "Mitra Link cannot coordinate chemicals, fuel or medicines.",
      );
    }

    if (
      data.pricing_model !== "free" &&
      data.pricing_model !== "negotiable" &&
      data.price == null
    ) {
      throw new Error(
        "State the price you charge, or choose Free / Negotiable.",
      );
    }

    const { data: existing, error: existingError } =
      await supabaseAdmin
        .from("link_listings")
        .select("id, owner_id")
        .eq("id", data.listingId)
        .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      throw new Error(
        "This listing no longer exists.",
      );
    }

    if (
      (existing as { owner_id: string }).owner_id !==
      userId
    ) {
      throw new Error(
        "You can only edit your own Mitra Link listings.",
      );
    }

    const {
      listingId,
      ...updateData
    } = data;
    await validateListingPhotos(supabase, userId, data.photos);
    const window = listingWindow(data.available_from, data.available_to);

    const { error } = await supabaseAdmin
      .from("link_listings")
      .update({ ...updateData, ...window } as never)
      .eq("id", listingId)
      .eq("owner_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      id: listingId,
    };
  });

/**
 * Pause a listing.
 *
 * Pausing keeps the listing and its history but removes it
 * from active matching until the owner resumes it.
 */
export const pauseLinkListing = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      listingId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: listing, error: lookupError } =
      await supabaseAdmin
        .from("link_listings")
        .select("id, owner_id, status")
        .eq("id", data.listingId)
        .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (!listing) {
      throw new Error(
        "This listing no longer exists.",
      );
    }

    if (
      (listing as { owner_id: string }).owner_id !==
      userId
    ) {
      throw new Error(
        "You can only manage your own listings.",
      );
    }

    const { error } = await supabaseAdmin
      .from("link_listings")
      .update({
        status: "unavailable",
      } as never)
      .eq("id", data.listingId)
      .eq("owner_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      id: data.listingId,
      status: "unavailable" as const,
    };
  });

/**
 * Resume a paused listing.
 */
export const resumeLinkListing = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      listingId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: listing, error: lookupError } =
      await supabaseAdmin
        .from("link_listings")
        .select(
          "id, owner_id, status, available_from, available_to",
        )
        .eq("id", data.listingId)
        .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (!listing) {
      throw new Error(
        "This listing no longer exists.",
      );
    }

    if (
      (listing as { owner_id: string }).owner_id !==
      userId
    ) {
      throw new Error(
        "You can only manage your own listings.",
      );
    }

    const listingData = listing as {
      status: string;
      available_to: string;
    };

    if (
      listingData.available_to &&
      new Date(listingData.available_to).getTime() <
        Date.now()
    ) {
      throw new Error(
        "This listing has expired. Extend its availability before resuming it.",
      );
    }

    const { error } = await supabaseAdmin
      .from("link_listings")
      .update({
        status: "available",
      } as never)
      .eq("id", data.listingId)
      .eq("owner_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      id: data.listingId,
      status: "available" as const,
    };
  });

/**
 * Extend the availability period of a listing.
 *
 * This is intentionally separate from the full edit function
 * so the UI can offer a quick "Extend" action.
 */
export const extendLinkListing = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      listingId: z.string().uuid(),
      availableTo: z.string().min(8),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: listing, error: lookupError } =
      await supabaseAdmin
        .from("link_listings")
        .select(
          "id, owner_id, available_from, available_to",
        )
        .eq("id", data.listingId)
        .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (!listing) {
      throw new Error(
        "This listing no longer exists.",
      );
    }

    if (
      (listing as { owner_id: string }).owner_id !==
      userId
    ) {
      throw new Error(
        "You can only manage your own listings.",
      );
    }

    const current = listing as {
      available_from: string;
      available_to: string;
    };

    const newEnd = new Date(
      normalizeListingDate(data.availableTo, true),
    ).getTime();

    const start = new Date(
      current.available_from,
    ).getTime();

    if (!Number.isFinite(newEnd)) {
      throw new Error(
        "Enter a valid availability end date.",
      );
    }

    if (newEnd < start) {
      throw new Error(
        "Availability end date cannot be before the start date.",
      );
    }

    const { error } = await supabaseAdmin
      .from("link_listings")
      .update({
        available_to: normalizeListingDate(data.availableTo, true),
        status: "available",
      } as never)
      .eq("id", data.listingId)
      .eq("owner_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      id: data.listingId,
      available_to: normalizeListingDate(data.availableTo, true),
      status: "available" as const,
    };
  });

/**
 * Remove a listing from Mitra Link.
 *
 * This is intentionally implemented as a soft removal instead
 * of physically deleting the row. That protects match/request
 * history and avoids breaking foreign-key relationships.
 */
export const removeLinkListing = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      listingId: z.string().uuid(),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: listing, error: lookupError } =
      await supabaseAdmin
        .from("link_listings")
        .select("id, owner_id")
        .eq("id", data.listingId)
        .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (!listing) {
      throw new Error(
        "This listing has already been removed.",
      );
    }

    if (
      (listing as { owner_id: string }).owner_id !==
      userId
    ) {
      throw new Error(
        "You can only remove your own listings.",
      );
    }

    const { error } = await supabaseAdmin
      .from("link_listings")
      .update({
        status: "removed",
      } as never)
      .eq("id", data.listingId)
      .eq("owner_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      id: data.listingId,
      status: "removed" as const,
    };
  });

export const getRequestMatches = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      requestId: z.string().uuid(),
    }).parse(data),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      request: LinkRequest;
      candidates: LinkMatchCandidate[];
    } | null> =>
      buildMatches(
        context.supabase,
        data.requestId,
      ),
  );

export const createMatchRequest = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        listingId: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: request, error: requestError } = await supabase
      .from("link_requests")
      .select("id, requester_id, status")
      .eq("id", data.requestId)
      .maybeSingle();
    if (requestError) throw new Error(requestError.message);
    if (!request || request.requester_id !== userId) {
      throw new Error("You can only request a match for your own request.");
    }
    if (!["searching", "match_found", "provider_contacted"].includes(request.status)) {
      throw new Error("This request is no longer accepting match requests.");
    }

    const { data: listing, error: listingError } = await supabaseAdmin
      .from("link_listings")
      .select("owner_id, status")
      .eq("id", data.listingId)
      .maybeSingle();

    if (listingError) throw new Error(listingError.message);
    if (!listing) {
      throw new Error(
        "This listing is no longer available.",
      );
    }

    const listingData = listing as {
      owner_id: string;
      status: string;
    };

    if (listingData.owner_id === userId) {
      throw new Error("You cannot request a match for your own resource.");
    }

    if (!["available", "reserved", "needs_confirmation"].includes(listingData.status)) {
      throw new Error(
        "This listing is not currently available.",
      );
    }

    const { data: row, error } = await supabase
      .from("link_matches")
      .insert({
        request_id: data.requestId,
        listing_id: data.listingId,
        requester_id: userId,
        provider_id: listingData.owner_id,
        status: "requested",
      } as never)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const { error: requestUpdateError } = await supabase
      .from("link_requests")
      .update({
        status: "provider_contacted",
      } as never)
      .eq("id", data.requestId);
    if (requestUpdateError) throw new Error(requestUpdateError.message);

    return {
      id: (row as { id: string }).id,
    };
  });

export const updateMatchStatus = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        matchId: z.string().uuid(),
        status: z.enum([
          "accepted",
          "rejected",
          "scheduled",
          "in_progress",
          "completed",
          "cancelled",
        ]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: match, error: lookupError } =
      await supabase
        .from("link_matches")
        .select(
          "id, requester_id, provider_id, status",
        )
        .eq("id", data.matchId)
        .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (!match) {
      throw new Error(
        "This match no longer exists.",
      );
    }

    const matchData = match as {
      requester_id: string;
      provider_id: string;
    };

    if (
      matchData.requester_id !== userId &&
      matchData.provider_id !== userId
    ) {
      throw new Error(
        "You are not allowed to update this match.",
      );
    }

    const { error } = await supabase
      .from("link_matches")
      .update({
        status: data.status,
      } as never)
      .eq("id", data.matchId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      id: data.matchId,
      status: data.status,
    };
  });

/**
 * Reveals the provider's verified mobile number only
 * inside an accepted match.
 */
export const getMatchContact = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        matchId: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } =
      await context.supabase.rpc(
        "link_provider_contact",
        {
          _match_id: data.matchId,
        },
      );

    if (error) {
      throw new Error(error.message);
    }

    const row = (rows ?? [])[0] as
      | {
          full_name: string | null;
          phone: string | null;
          phone_verified: boolean;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return row;
  });