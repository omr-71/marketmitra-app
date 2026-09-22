import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Handshake,
  ImageOff,
  Loader2,
  MapPin,
  Package,
  Pause,
  Phone,
  Play,
  Plus,
  Search,
  Sparkles,
  Tractor,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Screen, TopBar } from "@/components/app-shell";
import { Reveal } from "@/components/reveal";
import { useAuth } from "@/lib/auth";
import { useLocationContext } from "@/lib/location";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import {
  approxDistance,
  MACHINE_TYPES,
  PRICING_LABELS,
  PRICING_MODELS,
  RESOURCE_TYPES,
  shareCost,
  typeLabel,
  type BudgetMode,
  type LinkCategory,
  type PricingModel,
} from "@/lib/link-types";
import {
  createLinkListing,
  createLinkRequest,
  createMatchRequest,
  extendLinkListing,
  getLinkOverview,
  getMatchContact,
  getRequestMatches,
  pauseLinkListing,
  removeLinkListing,
  resumeLinkListing,
  updateMatchStatus,
} from "@/lib/link.functions";

export const Route = createFileRoute("/_authenticated/link")({
  head: () => ({
    meta: [
      { title: "Mitra Link — your local farm resource network" },
      {
        name: "description",
        content:
          "Ask for a tractor, harvester, crates or tools nearby, or share what you own. Verified farmers, real prices, honest availability.",
      },
      {
        property: "og:title",
        content: "Mitra Link — your local farm resource network",
      },
      {
        property: "og:description",
        content:
          "Need it or have it — coordinate machines and farm resources with verified neighbours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LinkPage,
});

/* ------------------------------- small parts ------------------------------ */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary";

function Chips<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  labelFor?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`press rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors ${
            value === option
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card"
          }`}
        >
          {labelFor ? labelFor(option) : typeLabel(option)}
        </button>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs font-semibold text-muted-foreground">
      {text}
    </p>
  );
}

function Photo({
  url,
  className = "",
}: {
  url?: string | undefined;
  className?: string;
}) {
  if (!url) {
    return (
      <div
        className={`grid place-items-center rounded-2xl bg-muted text-[10px] font-bold text-muted-foreground ${className}`}
      >
        <ImageOff className="size-4" />
        Photo not provided
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Listed farm resource"
      loading="lazy"
      className={`rounded-2xl object-cover ${className}`}
    />
  );
}

function priceLine(pricing: PricingModel, price: number | null) {
  if (pricing === "free") return "Free";

  if (price == null) {
    return pricing === "negotiable" ? "Negotiable" : "Price not stated";
  }

  const suffix =
    pricing === "per_hour"
      ? "/hour"
      : pricing === "per_day"
        ? "/day"
        : pricing === "per_acre"
          ? "/acre"
          : pricing === "per_unit"
            ? "/unit"
            : "";

  return `${inr(price)}${suffix}`;
}

/* --------------------------------- page ---------------------------------- */

function LinkPage() {
  const queryClient = useQueryClient();

  const [sheet, setSheet] = useState<null | "need" | "have">(null);
  const [openRequest, setOpenRequest] = useState<string | null>(null);
  const [manageListing, setManageListing] = useState<string | null>(null);

  const overview = useQuery({
    queryKey: ["link-overview"],
    queryFn: () => getLinkOverview(),
    staleTime: 60 * 1000,
  });

  const refresh = () =>
    void queryClient.invalidateQueries({
      queryKey: ["link-overview"],
    });

  const data = overview.data;
  const verified = Boolean(data?.profile?.phone_verified);

  const activeListings =
    data?.listings.filter((listing) => listing.status === "active").length ?? 0;

  const pausedListings =
    data?.listings.filter((listing) => listing.status === "paused").length ?? 0;

  const providerMatches =
    data?.matches.filter((match) => match.role === "provider").length ?? 0;

  const activeClusters = data?.clusters?.length ?? 0;

  return (
    <Screen>
      <TopBar
        title="Mitra Link"
        subtitle="Your local farm resource network"
        back="/home"
      />

      <div className="space-y-7 px-5 pb-12 pt-5 lg:mx-auto lg:max-w-4xl">
        {/* HERO */}
        <Reveal>
          <div className="card-surface relative overflow-hidden p-5">
            <span className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    Mitra Link
                  </p>

                  <h2 className="mt-1 font-display text-xl font-extrabold leading-tight lg:text-2xl">
                    Share machines and farm resources with verified neighbours
                  </h2>
                </div>

                <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                  <Activity className="size-6" />
                </div>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Every listing, price and availability window here is entered by
                a real farmer. Nothing is estimated on your behalf.
              </p>
            </div>
          </div>
        </Reveal>

        {/* LIVE NETWORK */}
        {!overview.isPending && !overview.isError && data && (
          <Reveal>
            <LiveNetwork
              activeClusters={activeClusters}
              activeListings={activeListings}
              pausedListings={pausedListings}
              myRequests={data.requests.length}
              myMatches={data.matches.length}
              providerMatches={providerMatches}
              farmerCount={data.clusters.reduce(
                (sum, cluster) => sum + cluster.farmer_count,
                0,
              )}
            />
          </Reveal>
        )}

        {/* PRIMARY ACTIONS */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setSheet(sheet === "need" ? null : "need")}
            className="press card-surface hover-lift flex items-center gap-3 p-4 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Search className="size-5" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-extrabold">I NEED</span>
              <span className="block text-[11px] text-muted-foreground">
                Find what you need nearby
              </span>
            </span>
          </button>

          <button
            onClick={() => setSheet(sheet === "have" ? null : "have")}
            className="press card-surface hover-lift flex items-center gap-3 p-4 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Handshake className="size-5" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-extrabold">I HAVE</span>
              <span className="block text-[11px] text-muted-foreground">
                Share a resource
              </span>
            </span>
          </button>
        </div>

        {/* FORMS */}
        {sheet === "need" && (
          <NeedForm
            onDone={(requestId) => {
              setSheet(null);
              setOpenRequest(requestId);
              refresh();
            }}
            onClose={() => setSheet(null)}
          />
        )}

        {sheet === "have" && (
          <HaveForm
            verified={verified}
            onDone={() => {
              setSheet(null);
              refresh();
            }}
            onClose={() => setSheet(null)}
          />
        )}

        {/* MATCH PANEL */}
        {openRequest && (
          <MatchPanel
            requestId={openRequest}
            onClose={() => setOpenRequest(null)}
            onChanged={refresh}
          />
        )}

        {/* MANAGEMENT PANEL */}
        {manageListing && data && (
          <ListingManager
            listing={
              data.listings.find(
                (listing) => listing.id === manageListing,
              ) ?? null
            }
            onClose={() => setManageListing(null)}
            onChanged={refresh}
          />
        )}

        {overview.isPending ? (
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading your network…
          </p>
        ) : overview.isError ? (
          <Empty text="Mitra Link could not load right now. Please try again." />
        ) : (
          <>
            {/* LIVE OPPORTUNITIES */}
            <Section title="Live opportunities" icon={Users}>
              {data?.clusters?.length ? (
                <div className="space-y-3">
                  {data.clusters.map((cluster) => (
                    <ClusterCard
                      key={`${cluster.resource_type}-${cluster.window_date}-${cluster.district}`}
                      cluster={cluster}
                    />
                  ))}
                </div>
              ) : (
                <Empty text="No verified opportunities nearby right now." />
              )}
            </Section>

            {/* MY REQUESTS */}
            <Section title="My requests" icon={Search}>
              {data?.requests.length ? (
                <div className="space-y-2.5">
                  {data.requests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => setOpenRequest(request.id)}
                      className="press card-surface hover-lift flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-muted text-primary">
                        {request.category === "machine" ? (
                          <Tractor className="size-5" />
                        ) : (
                          <Package className="size-5" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {typeLabel(request.resource_type)}
                        </span>

                        <span className="block truncate text-[11px] text-muted-foreground">
                          {request.needed_date} ·{" "}
                          {request.district ?? "Location not set"}
                        </span>
                      </span>

                      <StatusPill status={request.status} />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty text="You have not created a request yet." />
              )}
            </Section>

            {/* MY RESOURCES */}
            <Section title="My resources" icon={Handshake}>
              {data?.listings.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.listings.map((listing) => (
                    <ResourceCard
                      key={listing.id}
                      listing={listing}
                      onManage={() => setManageListing(listing.id)}
                    />
                  ))}
                </div>
              ) : (
                <Empty text="You have not shared a machine or resource yet." />
              )}
            </Section>

            {/* MY MATCHES */}
            <Section title="My matches" icon={Sparkles}>
              {data?.matches.length ? (
                <div className="space-y-2.5">
                  {data.matches.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      onChanged={refresh}
                    />
                  ))}
                </div>
              ) : (
                <Empty text="No matches yet. Create a request to start." />
              )}
            </Section>
          </>
        )}
      </div>
    </Screen>
  );
}

/* --------------------------- live network panel --------------------------- */

function LiveNetwork({
  activeClusters,
  activeListings,
  pausedListings,
  myRequests,
  myMatches,
  providerMatches,
  farmerCount,
}: {
  activeClusters: number;
  activeListings: number;
  pausedListings: number;
  myRequests: number;
  myMatches: number;
  providerMatches: number;
  farmerCount: number;
}) {
  return (
    <div className="card-surface relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Network pulse
            </p>

            <h3 className="mt-1 text-sm font-extrabold">
              Your Mitra Link activity
            </h3>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            LIVE
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[150px_1fr]">
          <div className="relative grid min-h-36 place-items-center overflow-hidden rounded-3xl border border-border bg-muted/30">
            <span className="absolute size-28 animate-pulse rounded-full border border-primary/10" />
            <span className="absolute size-20 rounded-full border border-primary/20" />
            <span className="absolute size-12 rounded-full border border-primary/30" />

            <span className="relative grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Activity className="size-5" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <NetworkStat
              label="Active resources"
              value={activeListings}
            />

            <NetworkStat
              label="Opportunities"
              value={activeClusters}
            />

            <NetworkStat
              label="My requests"
              value={myRequests}
            />

            <NetworkStat
              label="My matches"
              value={myMatches}
            />

            <NetworkStat
              label="Provider matches"
              value={providerMatches}
            />

            <NetworkStat
              label="Paused resources"
              value={pausedListings}
            />
          </div>
        </div>

        {farmerCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-muted/40 px-3 py-2.5">
            <Users className="size-4 text-primary" />

            <p className="text-[11px] font-semibold text-muted-foreground">
              Current opportunity clusters represent{" "}
              <span className="font-extrabold text-foreground">
                {farmerCount}
              </span>{" "}
              farmer requests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NetworkStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ----------------------------- resource card ------------------------------ */

function ResourceCard({
  listing,
  onManage,
}: {
  listing: {
    id: string;
    name: string;
    resource_type: string;
    pricing_model: PricingModel;
    price: number | null;
    status: string;
    available_from: string;
    available_to: string;
    photoUrls: string[];
  };
  onManage: () => void;
}) {
  const availability = getAvailabilityState(
    listing.available_from,
    listing.available_to,
    listing.status,
  );

  return (
    <div className="card-surface hover-lift overflow-hidden p-4">
      <div className="relative">
        <Photo
          url={listing.photoUrls[0]}
          className="h-36 w-full"
        />

        <div className="absolute left-2.5 top-2.5">
          <StatusPill status={listing.status} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">
              {listing.name}
            </p>

            <p className="text-[11px] text-muted-foreground">
              {typeLabel(listing.resource_type)}
            </p>
          </div>

          <button
            type="button"
            onClick={onManage}
            className="press grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary"
            aria-label={`Manage ${listing.name}`}
          >
            <Activity className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-primary">
            {priceLine(listing.pricing_model, listing.price)}
          </p>

          <span className="text-[10px] font-bold text-muted-foreground">
            {availability.label}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              availability.progress === 100
                ? "bg-muted-foreground"
                : "bg-primary"
            }`}
            style={{ width: `${availability.progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">
            {new Date(listing.available_from).toLocaleDateString("en-IN")} –{" "}
            {new Date(listing.available_to).toLocaleDateString("en-IN")}
          </p>

          <button
            type="button"
            onClick={onManage}
            className="press text-[10px] font-extrabold text-primary"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
}

function getAvailabilityState(
  from: string,
  to: string,
  status: string,
) {
  const now = Date.now();
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();

  if (status === "removed") {
    return {
      label: "Removed",
      progress: 100,
    };
  }

  if (status === "paused") {
    return {
      label: "Paused",
      progress: 50,
    };
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return {
      label: "Availability set",
      progress: 0,
    };
  }

  if (now < start) {
    const days = Math.ceil(
      (start - now) / (1000 * 60 * 60 * 24),
    );

    return {
      label: days <= 1 ? "Starts tomorrow" : `Starts in ${days}d`,
      progress: 0,
    };
  }

  if (now >= end) {
    return {
      label: "Expired",
      progress: 100,
    };
  }

  const progress = Math.min(
    100,
    Math.max(
      0,
      ((now - start) / (end - start)) * 100,
    ),
  );

  const daysLeft = Math.max(
    1,
    Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
  );

  return {
    label: `${daysLeft}d remaining`,
    progress,
  };
}

/* --------------------------- listing management -------------------------- */

function ListingManager({
  listing,
  onClose,
  onChanged,
}: {
  listing: {
    id: string;
    name: string;
    resource_type: string;
    pricing_model: PricingModel;
    price: number | null;
    status: string;
    available_from: string;
    available_to: string;
    photoUrls: string[];
    description?: string | null;
    condition?: string | null;
    service_area?: string | null;
  } | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [newDate, setNewDate] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  const pause = useMutation({
    mutationFn: () =>
      pauseLinkListing({
        data: {
          listingId: listing?.id ?? "",
        },
      }),
    onSuccess: () => {
      toast.success("Listing paused. It is no longer available for matching.");
      onChanged();
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resume = useMutation({
    mutationFn: () =>
      resumeLinkListing({
        data: {
          listingId: listing?.id ?? "",
        },
      }),
    onSuccess: () => {
      toast.success("Listing is live again.");
      onChanged();
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const extend = useMutation({
    mutationFn: () =>
      extendLinkListing({
        data: {
          listingId: listing?.id ?? "",
          availableTo: newDate,
        },
      }),
    onSuccess: () => {
      toast.success("Availability extended and listing is live.");
      onChanged();
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: () =>
      removeLinkListing({
        data: {
          listingId: listing?.id ?? "",
        },
      }),
    onSuccess: () => {
      toast.success("Resource removed from Mitra Link.");
      onChanged();
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!listing) {
    return null;
  }

  const availability = getAvailabilityState(
    listing.available_from,
    listing.available_to,
    listing.status,
  );

  const isBusy =
    pause.isPending ||
    resume.isPending ||
    extend.isPending ||
    remove.isPending;

  return (
    <div className="card-surface animate-page space-y-5 border-t-4 border-t-primary p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Resource management
          </p>

          <h3 className="mt-1 truncate text-lg font-extrabold">
            {listing.name}
          </h3>

          <p className="text-[11px] text-muted-foreground">
            {typeLabel(listing.resource_type)}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="press grid size-8 shrink-0 place-items-center rounded-full bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <Photo
          url={listing.photoUrls[0]}
          className="h-28 w-full sm:h-28"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold">
              {priceLine(listing.pricing_model, listing.price)}
            </span>

            <StatusPill status={listing.status} />
          </div>

          <div className="rounded-2xl bg-muted/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                <CalendarDays className="size-3.5 text-primary" />
                Availability
              </span>

              <span className="text-[10px] font-extrabold text-primary">
                {availability.label}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${availability.progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              {new Date(listing.available_from).toLocaleDateString("en-IN")}{" "}
              →{" "}
              {new Date(listing.available_to).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {listing.description && (
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </p>

          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        </div>
      )}

      {listing.service_area && (
        <div className="flex items-center gap-2 rounded-2xl bg-muted/40 p-3">
          <MapPin className="size-4 text-primary" />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Service area
            </p>

            <p className="text-xs font-semibold">
              {listing.service_area}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Quick actions
        </p>

        {listing.status === "active" && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => pause.mutate()}
            className="press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left disabled:opacity-60"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-muted text-primary">
              <Pause className="size-4" />
            </span>

            <span>
              <span className="block text-xs font-extrabold">
                Pause listing
              </span>

              <span className="block text-[10px] text-muted-foreground">
                Temporarily stop new matches without deleting your resource
              </span>
            </span>
          </button>
        )}

        {listing.status === "paused" && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => resume.mutate()}
            className="press flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-left disabled:opacity-60"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Play className="size-4" />
            </span>

            <span>
              <span className="block text-xs font-extrabold">
                Resume listing
              </span>

              <span className="block text-[10px] text-muted-foreground">
                Make this resource available for matching again
              </span>
            </span>
          </button>
        )}

        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-muted text-primary">
              <Clock3 className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold">
                Extend availability
              </p>

              <p className="text-[10px] text-muted-foreground">
                Choose a new availability end date
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="date"
              value={newDate}
              min={listing.available_to.slice(0, 10)}
              onChange={(event) => setNewDate(event.target.value)}
              className={`${inputClass} flex-1`}
            />

            <button
              type="button"
              disabled={!newDate || isBusy}
              onClick={() => extend.mutate()}
              className="press rounded-2xl bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              Extend
            </button>
          </div>
        </div>

        {!confirmRemove ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setConfirmRemove(true)}
            className="press flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-left disabled:opacity-60"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <Trash2 className="size-4" />
            </span>

            <span>
              <span className="block text-xs font-extrabold text-destructive">
                Remove from listing
              </span>

              <span className="block text-[10px] text-muted-foreground">
                Hide this resource from Mitra Link permanently
              </span>
            </span>
          </button>
        ) : (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-extrabold text-destructive">
                  Remove this resource?
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  The listing will no longer appear as an available resource.
                  Your existing match history remains protected.
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="press flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold"
              >
                Keep listing
              </button>

              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => remove.mutate()}
                className="press flex-1 rounded-2xl bg-destructive py-2.5 text-xs font-bold text-destructive-foreground disabled:opacity-60"
              >
                {remove.isPending ? (
                  <Loader2 className="mx-auto size-4 animate-spin" />
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {isBusy && (
        <p className="flex items-center justify-center gap-2 text-[10px] font-semibold text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Updating your resource…
        </p>
      )}
    </div>
  );
}

/* -------------------------------- sections -------------------------------- */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>

      {children}
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const tone =
    normalized === "active" || normalized === "accepted"
      ? "bg-primary/10 text-primary"
      : normalized === "paused"
        ? "bg-earthy/10 text-earthy"
        : normalized === "removed" ||
            normalized === "rejected" ||
            normalized === "cancelled"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tone}`}
    >
      {status.replace(/\_/g, " ")}
    </span>
  );
}

/* ------------------------------ cluster card ----------------------------- */

function ClusterCard({
  cluster,
}: {
  cluster: {
    resource_type: string;
    district: string | null;
    window_date: string;
    farmer_count: number;
  };
}) {
  return (
    <div className="card-surface hover-lift relative overflow-hidden p-4">
      <span className="absolute -right-6 -top-6 size-20 rounded-full bg-primary/5 blur-xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Cluster opportunity found
            </p>

            <p className="mt-1 text-sm font-extrabold">
              {typeLabel(cluster.resource_type)}
            </p>
          </div>

          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-4" />
          </span>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {cluster.farmer_count} farmers need this on{" "}
          {cluster.window_date}
          {cluster.district ? ` · ${cluster.district}` : ""}
        </p>

        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          If a provider states a price, the cost can be split equally between
          the farmers who confirm. MarketMitra does not promise a discount.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- I NEED --------------------------------- */

function NeedForm({
  onDone,
  onClose,
}: {
  onDone: (requestId: string) => void;
  onClose: () => void;
}) {
  const { location } = useLocationContext();

  const [category, setCategory] =
    useState<LinkCategory>("machine");

  const [resourceType, setResourceType] = useState<string>(
    MACHINE_TYPES[0],
  );

  const [neededDate, setNeededDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const [budgetMode, setBudgetMode] =
    useState<BudgetMode>("none");

  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const types =
    category === "machine"
      ? MACHINE_TYPES
      : RESOURCE_TYPES;

  const mutation = useMutation({
    mutationFn: () =>
      createLinkRequest({
        data: {
          category,
          resource_type: resourceType,
          needed_date: neededDate,
          time_from: timeFrom || null,
          time_to: timeTo || null,
          quantity: quantity ? Number(quantity) : null,
          note: note.trim() || null,
          state: location?.state ?? null,
          district: location?.district ?? null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          budget_mode: budgetMode,
          budget_min:
            budgetMode === "range" && budgetMin
              ? Number(budgetMin)
              : null,
          budget_max:
            (budgetMode === "range" ||
              budgetMode === "max") &&
            budgetMax
              ? Number(budgetMax)
              : null,
          budget_unit: null,
        },
      }),

    onSuccess: (result) => {
      toast.success(
        "Request created — MarketMitra is looking for compatible matches.",
      );

      onDone(result.id);
    },

    onError: (error: Error) =>
      toast.error(error.message),
  });

  return (
    <div className="card-surface animate-page space-y-4 border-t-4 border-t-earthy p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">I NEED</p>

          <p className="text-[11px] text-muted-foreground">
            Tell us what you need and when.
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="press grid size-8 place-items-center rounded-full bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      <Field label="Category">
        <Chips
          options={["machine", "resource"] as const}
          value={category}
          onChange={(next) => {
            setCategory(next);
            setResourceType(
              next === "machine"
                ? MACHINE_TYPES[0]
                : RESOURCE_TYPES[0],
            );
          }}
          labelFor={(v) =>
            v === "machine"
              ? "Machine"
              : "Resource"
          }
        />
      </Field>

      <Field label="Type">
        <Chips
          options={types}
          value={resourceType as never}
          onChange={(next) =>
            setResourceType(next)
          }
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Required date">
          <input
            type="date"
            value={neededDate}
            onChange={(e) =>
              setNeededDate(e.target.value)
            }
            className={inputClass}
          />
        </Field>

        <Field label="From (optional)">
          <input
            type="time"
            value={timeFrom}
            onChange={(e) =>
              setTimeFrom(e.target.value)
            }
            className={inputClass}
          />
        </Field>

        <Field label="To (optional)">
          <input
            type="time"
            value={timeTo}
            onChange={(e) =>
              setTimeTo(e.target.value)
            }
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Quantity (optional)">
          <input
            inputMode="numeric"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value.replace(/\D/g, ""),
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Approximate location">
          <p className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-xs font-semibold">
            <MapPin className="size-4 text-primary" />

            {location
              ? `${location.district || location.city}, ${location.state}`
              : "Set your location first"}
          </p>
        </Field>
      </div>

      <Field label="Budget">
        <Chips
          options={
            [
              "none",
              "max",
              "range",
              "negotiable",
            ] as const
          }
          value={budgetMode}
          onChange={setBudgetMode}
          labelFor={(v) =>
            v === "none"
              ? "No fixed budget"
              : v === "max"
                ? "Maximum budget"
                : v === "range"
                  ? "Budget range"
                  : "Negotiable"
          }
        />
      </Field>

      {(budgetMode === "max" ||
        budgetMode === "range") && (
        <div className="grid gap-3 sm:grid-cols-2">
          {budgetMode === "range" && (
            <Field label="Minimum ₹">
              <input
                inputMode="numeric"
                value={budgetMin}
                onChange={(e) =>
                  setBudgetMin(
                    e.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
                className={inputClass}
              />
            </Field>
          )}

          <Field label="Maximum ₹">
            <input
              inputMode="numeric"
              value={budgetMax}
              onChange={(e) =>
                setBudgetMax(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              className={inputClass}
            />
          </Field>
        </div>
      )}

      <Field label="Note (optional)">
        <textarea
          value={note}
          maxLength={400}
          onChange={(e) =>
            setNote(e.target.value)
          }
          className="min-h-20 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>

      <button
        onClick={() => mutation.mutate()}
        disabled={
          !neededDate ||
          mutation.isPending
        }
        className="press grad-primary flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}

        Create request
      </button>
    </div>
  );
}

/* -------------------------------- I HAVE --------------------------------- */

function HaveForm({
  verified,
  onDone,
  onClose,
}: {
  verified: boolean;
  onDone: () => void;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { location } = useLocationContext();

  const [category, setCategory] =
    useState<LinkCategory>("machine");

  const [resourceType, setResourceType] =
    useState<string>(MACHINE_TYPES[0]);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [condition, setCondition] =
    useState("");

  const [pricingModel, setPricingModel] =
    useState<PricingModel>("per_hour");

  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] =
    useState(false);

  const [quantity, setQuantity] =
    useState("");

  const [unit, setUnit] = useState("");
  const [serviceArea, setServiceArea] =
    useState("");

  const [availableFrom, setAvailableFrom] =
    useState("");

  const [availableTo, setAvailableTo] =
    useState("");

  const [terms, setTerms] = useState("");

  const [photos, setPhotos] = useState<
    { path: string; preview: string }[]
  >([]);

  const [uploading, setUploading] =
    useState(false);

  const types =
    category === "machine"
      ? MACHINE_TYPES
      : RESOURCE_TYPES;

  const upload = async (
    files: FileList | null,
  ) => {
    if (!files?.length || !user) return;

    setUploading(true);

    try {
      for (const file of Array.from(
        files,
      ).slice(0, 5 - photos.length)) {
        if (!file.type.startsWith("image/"))
          continue;

        const ext =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error } =
          await supabase.storage
            .from("link-photos")
            .upload(path, file, {
              contentType: file.type,
            });

        if (error) {
          throw new Error(error.message);
        }

        setPhotos((prev) => [
          ...prev,
          {
            path,
            preview:
              URL.createObjectURL(file),
          },
        ]);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Photo upload failed",
      );
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (
    path: string,
  ) => {
    await supabase.storage
      .from("link-photos")
      .remove([path]);

    setPhotos((prev) =>
      prev.filter(
        (photo) => photo.path !== path,
      ),
    );
  };

  const mutation = useMutation({
    mutationFn: () =>
      createLinkListing({
        data: {
          category,
          resource_type: resourceType,
          name: name.trim(),
          description:
            description.trim() || null,
          condition:
            condition.trim() || null,
          pricing_model: pricingModel,
          price: price
            ? Number(price)
            : null,
          negotiable,
          quantity: quantity
            ? Number(quantity)
            : null,
          unit:
            unit.trim() || null,
          service_area:
            serviceArea.trim() || null,
          state:
            location?.state ?? null,
          district:
            location?.district ?? null,
          latitude:
            location?.latitude ?? null,
          longitude:
            location?.longitude ?? null,
          available_from:
            availableFrom,
          available_to:
            availableTo,
          photos: photos.map(
            (photo) => photo.path,
          ),
          terms:
            terms.trim() || null,
        },
      }),

    onSuccess: () => {
      toast.success(
        "Your resource is live for nearby farmers.",
      );

      onDone();
    },

    onError: (error: Error) =>
      toast.error(error.message),
  });

  return (
    <div className="card-surface animate-page space-y-4 border-t-4 border-t-primary p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">
            I HAVE
          </p>

          <p className="text-[11px] text-muted-foreground">
            You decide the price and availability.
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="press grid size-8 place-items-center rounded-full bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      {!verified && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-[11px] font-semibold text-destructive">
          Verify your mobile number in Settings
          before sharing a machine or resource.
          Farmers only see verified providers.
        </p>
      )}

      <Field label="Category">
        <Chips
          options={
            ["machine", "resource"] as const
          }
          value={category}
          onChange={(next) => {
            setCategory(next);

            setResourceType(
              next === "machine"
                ? MACHINE_TYPES[0]
                : RESOURCE_TYPES[0],
            );
          }}
          labelFor={(v) =>
            v === "machine"
              ? "Machine"
              : "Resource"
          }
        />
      </Field>

      <Field label="Type">
        <Chips
          options={types}
          value={resourceType as never}
          onChange={(next) =>
            setResourceType(next)
          }
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className={inputClass}
          />
        </Field>

        <Field label="Condition (optional)">
          <input
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value)
            }
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description (optional)">
        <textarea
          value={description}
          maxLength={600}
          onChange={(e) =>
            setDescription(
              e.target.value,
            )
          }
          className="min-h-20 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Available from">
          <input
            type="date"
            value={availableFrom}
            onChange={(e) =>
              setAvailableFrom(
                e.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Available to">
          <input
            type="date"
            value={availableTo}
            min={availableFrom || undefined}
            onChange={(e) =>
              setAvailableTo(
                e.target.value,
              )
            }
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Service area (optional)">
        <input
          value={serviceArea}
          onChange={(e) =>
            setServiceArea(
              e.target.value,
            )
          }
          placeholder="Villages or talukas you can reach"
          className={inputClass}
        />
      </Field>

      <Field label="Pricing model">
        <Chips
          options={PRICING_MODELS}
          value={pricingModel}
          onChange={setPricingModel}
          labelFor={(v) =>
            PRICING_LABELS[v]
          }
        />
      </Field>

      {pricingModel !== "free" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Price ₹">
            <input
              inputMode="numeric"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Negotiable">
            <button
              type="button"
              onClick={() =>
                setNegotiable(
                  (v) => !v,
                )
              }
              className={`press h-12 w-full rounded-2xl border text-xs font-bold ${
                negotiable
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card"
              }`}
            >
              {negotiable
                ? "Open to negotiation"
                : "Fixed as stated"}
            </button>
          </Field>
        </div>
      )}

      {category === "resource" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Quantity (optional)">
            <input
              inputMode="numeric"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              className={inputClass}
            />
          </Field>

          <Field label="Unit (optional)">
            <input
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target.value,
                )
              }
              placeholder="crates, pipes…"
              className={inputClass}
            />
          </Field>
        </div>
      )}

      <Field label="Photos (your own photos only, up to 5)">
        <div className="flex flex-wrap items-center gap-3">
          {photos.map((photo) => (
            <div
              key={photo.path}
              className="relative"
            >
              <img
                src={photo.preview}
                alt="Uploaded resource"
                className="size-20 rounded-2xl object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  void removePhoto(
                    photo.path,
                  )
                }
                aria-label="Remove photo"
                className="press absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          {photos.length < 5 && (
            <label className="press grid size-20 cursor-pointer place-items-center rounded-2xl border border-dashed border-border text-[10px] font-bold text-muted-foreground">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}

              {uploading
                ? "Uploading"
                : "Add photo"}

              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  void upload(
                    e.target.files,
                  )
                }
              />
            </label>
          )}
        </div>
      </Field>

      <Field label="Terms (optional)">
        <textarea
          value={terms}
          maxLength={400}
          onChange={(e) =>
            setTerms(e.target.value)
          }
          className="min-h-16 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>

      <button
        onClick={() =>
          mutation.mutate()
        }
        disabled={
          !verified ||
          !name.trim() ||
          !availableFrom ||
          !availableTo ||
          mutation.isPending
        }
        className="press grad-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}

        Share this resource
      </button>
    </div>
  );
}

/* ------------------------------ match results ---------------------------- */

function MatchPanel({
  requestId,
  onClose,
  onChanged,
}: {
  requestId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const matches = useQuery({
    queryKey: ["link-matches", requestId],
    queryFn: () =>
      getRequestMatches({
        data: { requestId },
      }),
  });

  const send = useMutation({
    mutationFn: (listingId: string) =>
      createMatchRequest({
        data: {
          requestId,
          listingId,
        },
      }),

    onSuccess: () => {
      toast.success(
        "Match request sent to the provider.",
      );

      void matches.refetch();
      onChanged();
    },

    onError: (error: Error) =>
      toast.error(error.message),
  });

  const request = matches.data?.request;

  const budgetLine = useMemo(() => {
    if (!request) return null;

    if (
      request.budget_mode === "max" &&
      request.budget_max != null
    ) {
      return `Up to ${inr(
        request.budget_max,
      )}`;
    }

    if (
      request.budget_mode === "range" &&
      request.budget_min != null &&
      request.budget_max != null
    ) {
      return `${inr(
        request.budget_min,
      )} – ${inr(
        request.budget_max,
      )}`;
    }

    if (
      request.budget_mode ===
      "negotiable"
    ) {
      return "Negotiable";
    }

    return "No fixed budget";
  }, [request]);

  return (
    <div className="card-surface animate-page space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">
            Match suggestions
          </p>

          {request && (
            <p className="text-[11px] text-muted-foreground">
              {typeLabel(
                request.resource_type,
              )}{" "}
              · {request.needed_date} · Your
              budget: {budgetLine}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          className="press grid size-8 place-items-center rounded-full bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>

      {matches.isPending ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Looking for compatible providers…
        </p>
      ) : !matches.data?.candidates.length ? (
        <Empty text="No verified opportunities nearby right now." />
      ) : (
        <div className="space-y-3">
          {matches.data.candidates.map(
            (candidate) => {
              const { listing } =
                candidate;

              const clusterShare =
                shareCost(
                  listing.price,
                  2,
                );

              return (
                <div
                  key={listing.id}
                  className="rounded-xl border border-border bg-muted/20 p-4"
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    Mitra match found
                  </p>

                  <div className="mt-3 flex gap-3">
                    <Photo
                      url={
                        listing
                          .photoUrls[0]
                      }
                      className="size-24 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">
                        {listing.name}
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        {typeLabel(
                          listing.resource_type,
                        )}
                      </p>

                      {candidate.providerVerified && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                          <BadgeCheck className="size-3.5" />
                          Verified provider
                        </p>
                      )}

                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="size-3.5" />

                        {approxDistance(
                          candidate.distanceKm,
                        ) ??
                          listing.district ??
                          "Distance unknown"}
                      </p>

                      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays className="size-3.5" />

                        {candidate.availability ===
                        "available"
                          ? "Available for your date"
                          : "Needs owner confirmation"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-muted/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Price match
                    </p>

                    <p className="text-sm font-extrabold">
                      {priceLine(
                        listing.pricing_model,
                        listing.price,
                      )}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {candidate.priceFit ===
                      "within_budget"
                        ? "Within your budget"
                        : candidate.priceFit ===
                            "above_budget"
                          ? "Above your stated budget"
                          : candidate.priceFit ===
                              "unpriced"
                            ? "Provider has not stated a price"
                            : "You did not set a budget"}

                      {listing.negotiable
                        ? " · Provider is open to negotiation"
                        : ""}
                    </p>

                    {clusterShare != null && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Split with one more farmer:{" "}
                        {inr(
                          clusterShare,
                        )}{" "}
                        each at the provider's
                        stated price.
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Why this match?
                    </p>

                    <ul className="mt-1 space-y-1">
                      {candidate.reasons.map(
                        (reason) => (
                          <li
                            key={reason}
                            className="text-[11px] text-muted-foreground"
                          >
                            · {reason}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  {listing.description && (
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                      {listing.description}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    {candidate.existingMatch ? (
                      <span className="flex-1 rounded-2xl border border-border py-3 text-center text-xs font-bold text-muted-foreground">
                        Match{" "}
                        {candidate.existingMatch.status.replace(
                          /\_/g,
                          " ",
                        )}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          send.mutate(
                            listing.id,
                          )
                        }
                        disabled={
                          send.isPending
                        }
                        className="press grad-primary flex-1 rounded-2xl py-3 text-xs font-bold text-primary-foreground disabled:opacity-60"
                      >
                        {send.isPending ? (
                          <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : (
                          "Request match"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- matches -------------------------------- */

function MatchRow({
  match,
  onChanged,
}: {
  match: {
    id: string;
    status: string;
    role: "requester" | "provider";
    listing_name: string | null;
    resource_type: string;
    needed_date: string | null;
  };
  onChanged: () => void;
}) {
  const [contact, setContact] =
    useState<{
      full_name: string | null;
      phone: string | null;
    } | null>(null);

  const update = useMutation({
    mutationFn: (
      status:
        | "accepted"
        | "rejected"
        | "completed",
    ) =>
      updateMatchStatus({
        data: {
          matchId: match.id,
          status,
        },
      }),

    onSuccess: () => {
      toast.success("Match updated");
      onChanged();
    },

    onError: (error: Error) =>
      toast.error(error.message),
  });

  const reveal = useMutation({
    mutationFn: () =>
      getMatchContact({
        data: {
          matchId: match.id,
        },
      }),

    onSuccess: (result) => {
      if (!result?.phone) {
        toast.info(
          "The provider's verified number is not available for this match yet.",
        );
        return;
      }

      setContact(result);
    },

    onError: (error: Error) =>
      toast.error(error.message),
  });

  const canContact =
    match.status === "accepted" ||
    match.status === "scheduled" ||
    match.status === "in_progress";

  return (
    <div className="card-surface hover-lift min-w-0 border-l-4 border-l-earthy p-4">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">
            {match.listing_name ??
              typeLabel(
                match.resource_type,
              )}
          </span>

          <span className="block text-[11px] text-muted-foreground">
            {match.role === "provider"
              ? "You are the provider"
              : "You requested this"}

            {match.needed_date
              ? ` · ${match.needed_date}`
              : ""}
          </span>
        </span>

        <StatusPill
          status={match.status}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {match.role === "provider" &&
          match.status === "requested" && (
            <>
              <button
                onClick={() =>
                  update.mutate(
                    "accepted",
                  )
                }
                disabled={
                  update.isPending
                }
                className="press grad-primary rounded-2xl px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Accept
                </span>
              </button>

              <button
                onClick={() =>
                  update.mutate(
                    "rejected",
                  )
                }
                disabled={
                  update.isPending
                }
                className="press rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60"
              >
                Decline
              </button>
            </>
          )}

        {canContact &&
          !contact && (
            <button
              onClick={() =>
                reveal.mutate()
              }
              disabled={
                reveal.isPending
              }
              className="press inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60"
            >
              {reveal.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Phone className="size-3.5 text-primary" />
              )}

              Contact provider
            </button>
          )}

        {canContact && (
          <button
            onClick={() =>
              update.mutate(
                "completed",
              )
            }
            disabled={
              update.isPending
            }
            className="press rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60"
          >
            Mark completed
          </button>
        )}
      </div>

      {contact?.phone && (
        <p className="mt-3 rounded-2xl bg-primary/10 p-3 text-xs font-bold text-primary">
          {contact.full_name ??
            "Verified provider"}{" "}
          ·{" "}
          <a
            href={`tel:${contact.phone}`}
            className="underline"
          >
            {contact.phone}
          </a>
        </p>
      )}
    </div>
  );
}