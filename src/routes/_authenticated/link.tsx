import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarDays,
  Handshake,
  ImageOff,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  Sparkles,
  Tractor,
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
  getLinkOverview,
  getMatchContact,
  getRequestMatches,
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
      { property: "og:title", content: "Mitra Link — your local farm resource network" },
      {
        property: "og:description",
        content: "Need it or have it — coordinate machines and farm resources with verified neighbours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LinkPage,
});

/* ------------------------------- small parts ------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
            value === option ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
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

function Photo({ url, className = "" }: { url?: string; className?: string }) {
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
  return <img src={url} alt="Listed farm resource" loading="lazy" className={`rounded-2xl object-cover ${className}`} />;
}

function priceLine(pricing: PricingModel, price: number | null) {
  if (pricing === "free") return "Free";
  if (price == null) return pricing === "negotiable" ? "Negotiable" : "Price not stated";
  const suffix =
    pricing === "per_hour" ? "/hour" : pricing === "per_day" ? "/day" : pricing === "per_acre" ? "/acre" : pricing === "per_unit" ? "/unit" : "";
  return `${inr(price)}${suffix}`;
}

/* --------------------------------- page ---------------------------------- */

function LinkPage() {
  const queryClient = useQueryClient();
  const [sheet, setSheet] = useState<null | "need" | "have">(null);
  const [openRequest, setOpenRequest] = useState<string | null>(null);

  const overview = useQuery({
    queryKey: ["link-overview"],
    queryFn: () => getLinkOverview(),
    staleTime: 60 * 1000,
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["link-overview"] });
  const data = overview.data;
  const verified = Boolean(data?.profile?.phone_verified);

  return (
    <Screen>
      <TopBar title="Mitra Link" subtitle="Your local farm resource network" back="/home" />

      <div className="space-y-7 px-5 pb-12 pt-5 lg:mx-auto lg:max-w-4xl">
        <Reveal>
          <div className="card-surface relative overflow-hidden p-5">
            <span className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Mitra Link</p>
            <h2 className="mt-1 font-display text-xl font-extrabold leading-tight lg:text-2xl">
              Share machines and farm resources with verified neighbours
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Every listing, price and availability window here is entered by a real farmer. Nothing
              is estimated on your behalf.
            </p>
          </div>
        </Reveal>

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
              <span className="block text-[11px] text-muted-foreground">Find what you need nearby</span>
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
              <span className="block text-[11px] text-muted-foreground">Share a resource</span>
            </span>
          </button>
        </div>

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

        {openRequest && <MatchPanel requestId={openRequest} onClose={() => setOpenRequest(null)} onChanged={refresh} />}

        {overview.isPending ? (
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading your network…
          </p>
        ) : overview.isError ? (
          <Empty text="Mitra Link could not load right now. Please try again." />
        ) : (
          <>
            <Section title="Live opportunities" icon={Users}>
              {data?.clusters?.length ? (
                <div className="space-y-3">
                  {data.clusters.map((cluster) => (
                    <ClusterCard key={`${cluster.resource_type}-${cluster.window_date}-${cluster.district}`} cluster={cluster} />
                  ))}
                </div>
              ) : (
                <Empty text="No verified opportunities nearby right now." />
              )}
            </Section>

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
                        {request.category === "machine" ? <Tractor className="size-5" /> : <Package className="size-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{typeLabel(request.resource_type)}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {request.needed_date} · {request.district ?? "Location not set"}
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

            <Section title="My resources" icon={Handshake}>
              {data?.listings.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.listings.map((listing) => (
                    <div key={listing.id} className="card-surface hover-lift overflow-hidden p-4">
                      <Photo url={listing.photoUrls[0]} className="h-32 w-full" />
                      <p className="mt-3 truncate text-sm font-bold">{listing.name}</p>
                      <p className="text-[11px] text-muted-foreground">{typeLabel(listing.resource_type)}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-extrabold text-primary">
                          {priceLine(listing.pricing_model, listing.price)}
                        </p>
                        <StatusPill status={listing.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(listing.available_from).toLocaleDateString("en-IN")} –{" "}
                        {new Date(listing.available_to).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty text="You have not shared a machine or resource yet." />
              )}
            </Section>

            <Section title="My matches" icon={Sparkles}>
              {data?.matches.length ? (
                <div className="space-y-2.5">
                  {data.matches.map((match) => (
                    <MatchRow key={match.id} match={match} onChanged={refresh} />
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
        <Icon className="size-4 text-primary" /> {title}
      </h3>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ------------------------------ cluster card ----------------------------- */

function ClusterCard({
  cluster,
}: {
  cluster: { resource_type: string; district: string | null; window_date: string; farmer_count: number };
}) {
  return (
    <div className="card-surface hover-lift p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Cluster opportunity found</p>
      <p className="mt-1 text-sm font-extrabold">{typeLabel(cluster.resource_type)}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {cluster.farmer_count} farmers need this on {cluster.window_date}
        {cluster.district ? ` · ${cluster.district}` : ""}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        If a provider states a price, the cost can be split equally between the farmers who confirm.
        MarketMitra does not promise a discount.
      </p>
    </div>
  );
}

/* -------------------------------- I NEED --------------------------------- */

function NeedForm({ onDone, onClose }: { onDone: (requestId: string) => void; onClose: () => void }) {
  const { location } = useLocationContext();
  const [category, setCategory] = useState<LinkCategory>("machine");
  const [resourceType, setResourceType] = useState<string>(MACHINE_TYPES[0]);
  const [neededDate, setNeededDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("none");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const types = category === "machine" ? MACHINE_TYPES : RESOURCE_TYPES;

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
          budget_min: budgetMode === "range" && budgetMin ? Number(budgetMin) : null,
          budget_max: (budgetMode === "range" || budgetMode === "max") && budgetMax ? Number(budgetMax) : null,
          budget_unit: null,
        },
      }),
    onSuccess: (result) => {
      toast.success("Request created — MarketMitra is looking for compatible matches.");
      onDone(result.id);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="card-surface animate-page space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">I NEED</p>
          <p className="text-[11px] text-muted-foreground">Tell us what you need and when.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="press grid size-8 place-items-center rounded-full bg-muted">
          <X className="size-4" />
        </button>
      </div>

      <Field label="Category">
        <Chips
          options={["machine", "resource"] as const}
          value={category}
          onChange={(next) => {
            setCategory(next);
            setResourceType(next === "machine" ? MACHINE_TYPES[0] : RESOURCE_TYPES[0]);
          }}
          labelFor={(v) => (v === "machine" ? "Machine" : "Resource")}
        />
      </Field>

      <Field label="Type">
        <Chips options={types} value={resourceType as never} onChange={(next) => setResourceType(next)} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Required date">
          <input type="date" value={neededDate} onChange={(e) => setNeededDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="From (optional)">
          <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className={inputClass} />
        </Field>
        <Field label="To (optional)">
          <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Quantity (optional)">
          <input
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
          />
        </Field>
        <Field label="Approximate location">
          <p className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-card px-3 text-xs font-semibold">
            <MapPin className="size-4 text-primary" />
            {location ? `${location.district || location.city}, ${location.state}` : "Set your location first"}
          </p>
        </Field>
      </div>

      <Field label="Budget">
        <Chips
          options={["none", "max", "range", "negotiable"] as const}
          value={budgetMode}
          onChange={setBudgetMode}
          labelFor={(v) =>
            v === "none" ? "No fixed budget" : v === "max" ? "Maximum budget" : v === "range" ? "Budget range" : "Negotiable"
          }
        />
      </Field>

      {(budgetMode === "max" || budgetMode === "range") && (
        <div className="grid gap-3 sm:grid-cols-2">
          {budgetMode === "range" && (
            <Field label="Minimum ₹">
              <input
                inputMode="numeric"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
              />
            </Field>
          )}
          <Field label="Maximum ₹">
            <input
              inputMode="numeric"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      <Field label="Note (optional)">
        <textarea
          value={note}
          maxLength={400}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-20 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>

      <button
        onClick={() => mutation.mutate()}
        disabled={!neededDate || mutation.isPending}
        className="press grad-primary flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
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
  const [category, setCategory] = useState<LinkCategory>("machine");
  const [resourceType, setResourceType] = useState<string>(MACHINE_TYPES[0]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("");
  const [pricingModel, setPricingModel] = useState<PricingModel>("per_hour");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [terms, setTerms] = useState("");
  const [photos, setPhotos] = useState<{ path: string; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const types = category === "machine" ? MACHINE_TYPES : RESOURCE_TYPES;

  const upload = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5 - photos.length)) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("link-photos").upload(path, file, {
          contentType: file.type,
        });
        if (error) throw new Error(error.message);
        setPhotos((prev) => [...prev, { path, preview: URL.createObjectURL(file) }]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (path: string) => {
    await supabase.storage.from("link-photos").remove([path]);
    setPhotos((prev) => prev.filter((photo) => photo.path !== path));
  };

  const mutation = useMutation({
    mutationFn: () =>
      createLinkListing({
        data: {
          category,
          resource_type: resourceType,
          name: name.trim(),
          description: description.trim() || null,
          condition: condition.trim() || null,
          pricing_model: pricingModel,
          price: price ? Number(price) : null,
          negotiable,
          quantity: quantity ? Number(quantity) : null,
          unit: unit.trim() || null,
          service_area: serviceArea.trim() || null,
          state: location?.state ?? null,
          district: location?.district ?? null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          available_from: availableFrom,
          available_to: availableTo,
          photos: photos.map((photo) => photo.path),
          terms: terms.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Your resource is live for nearby farmers.");
      onDone();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="card-surface animate-page space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">I HAVE</p>
          <p className="text-[11px] text-muted-foreground">You decide the price and availability.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="press grid size-8 place-items-center rounded-full bg-muted">
          <X className="size-4" />
        </button>
      </div>

      {!verified && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-[11px] font-semibold text-destructive">
          Verify your mobile number in Settings before sharing a machine or resource. Farmers only see
          verified providers.
        </p>
      )}

      <Field label="Category">
        <Chips
          options={["machine", "resource"] as const}
          value={category}
          onChange={(next) => {
            setCategory(next);
            setResourceType(next === "machine" ? MACHINE_TYPES[0] : RESOURCE_TYPES[0]);
          }}
          labelFor={(v) => (v === "machine" ? "Machine" : "Resource")}
        />
      </Field>

      <Field label="Type">
        <Chips options={types} value={resourceType as never} onChange={(next) => setResourceType(next)} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Condition (optional)">
          <input value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Description (optional)">
        <textarea
          value={description}
          maxLength={600}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-20 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Available from">
          <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Available to">
          <input type="date" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Service area (optional)">
        <input
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          placeholder="Villages or talukas you can reach"
          className={inputClass}
        />
      </Field>

      <Field label="Pricing model">
        <Chips options={PRICING_MODELS} value={pricingModel} onChange={setPricingModel} labelFor={(v) => PRICING_LABELS[v]} />
      </Field>

      {pricingModel !== "free" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Price ₹">
            <input
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          </Field>
          <Field label="Negotiable">
            <button
              type="button"
              onClick={() => setNegotiable((v) => !v)}
              className={`press h-12 w-full rounded-2xl border text-xs font-bold ${
                negotiable ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
              }`}
            >
              {negotiable ? "Open to negotiation" : "Fixed as stated"}
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
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          </Field>
          <Field label="Unit (optional)">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="crates, pipes…" className={inputClass} />
          </Field>
        </div>
      )}

      <Field label="Photos (your own photos only, up to 5)">
        <div className="flex flex-wrap items-center gap-3">
          {photos.map((photo) => (
            <div key={photo.path} className="relative">
              <img src={photo.preview} alt="Uploaded resource" className="size-20 rounded-2xl object-cover" />
              <button
                type="button"
                onClick={() => void removePhoto(photo.path)}
                aria-label="Remove photo"
                className="press absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="press grid size-20 cursor-pointer place-items-center rounded-2xl border border-dashed border-border text-[10px] font-bold text-muted-foreground">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "Uploading" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void upload(e.target.files)}
              />
            </label>
          )}
        </div>
      </Field>

      <Field label="Terms (optional)">
        <textarea
          value={terms}
          maxLength={400}
          onChange={(e) => setTerms(e.target.value)}
          className="min-h-16 w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold outline-none focus:border-primary"
        />
      </Field>

      <button
        onClick={() => mutation.mutate()}
        disabled={!verified || !name.trim() || !availableFrom || !availableTo || mutation.isPending}
        className="press grad-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
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
    queryFn: () => getRequestMatches({ data: { requestId } }),
  });

  const send = useMutation({
    mutationFn: (listingId: string) => createMatchRequest({ data: { requestId, listingId } }),
    onSuccess: () => {
      toast.success("Match request sent to the provider.");
      void matches.refetch();
      onChanged();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const request = matches.data?.request;
  const budgetLine = useMemo(() => {
    if (!request) return null;
    if (request.budget_mode === "max" && request.budget_max != null) return `Up to ${inr(request.budget_max)}`;
    if (request.budget_mode === "range" && request.budget_min != null && request.budget_max != null)
      return `${inr(request.budget_min)} – ${inr(request.budget_max)}`;
    if (request.budget_mode === "negotiable") return "Negotiable";
    return "No fixed budget";
  }, [request]);

  return (
    <div className="card-surface animate-page space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold">Match suggestions</p>
          {request && (
            <p className="text-[11px] text-muted-foreground">
              {typeLabel(request.resource_type)} · {request.needed_date} · Your budget: {budgetLine}
            </p>
          )}
        </div>
        <button onClick={onClose} aria-label="Close" className="press grid size-8 place-items-center rounded-full bg-muted">
          <X className="size-4" />
        </button>
      </div>

      {matches.isPending ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Looking for compatible providers…
        </p>
      ) : !matches.data?.candidates.length ? (
        <Empty text="No verified opportunities nearby right now." />
      ) : (
        <div className="space-y-3">
          {matches.data.candidates.map((candidate) => {
            const { listing } = candidate;
            const clusterShare = shareCost(listing.price, 2);
            return (
              <div key={listing.id} className="rounded-3xl border border-border p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Mitra match found</p>
                <div className="mt-3 flex gap-3">
                  <Photo url={listing.photoUrls[0]} className="size-24 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{listing.name}</p>
                    <p className="text-[11px] text-muted-foreground">{typeLabel(listing.resource_type)}</p>
                    {candidate.providerVerified && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <BadgeCheck className="size-3.5" /> Verified provider
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {approxDistance(candidate.distanceKm) ?? listing.district ?? "Distance unknown"}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {candidate.availability === "available" ? "Available for your date" : "Needs owner confirmation"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-muted/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price match</p>
                  <p className="text-sm font-extrabold">{priceLine(listing.pricing_model, listing.price)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {candidate.priceFit === "within_budget"
                      ? "Within your budget"
                      : candidate.priceFit === "above_budget"
                        ? "Above your stated budget"
                        : candidate.priceFit === "unpriced"
                          ? "Provider has not stated a price"
                          : "You did not set a budget"}
                    {listing.negotiable ? " · Provider is open to negotiation" : ""}
                  </p>
                  {clusterShare != null && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Split with one more farmer: {inr(clusterShare)} each at the provider's stated price.
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Why this match?</p>
                  <ul className="mt-1 space-y-1">
                    {candidate.reasons.map((reason) => (
                      <li key={reason} className="text-[11px] text-muted-foreground">
                        · {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {listing.description && (
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{listing.description}</p>
                )}

                <div className="mt-3 flex gap-2">
                  {candidate.existingMatch ? (
                    <span className="flex-1 rounded-2xl border border-border py-3 text-center text-xs font-bold text-muted-foreground">
                      Match {candidate.existingMatch.status.replace(/_/g, " ")}
                    </span>
                  ) : (
                    <button
                      onClick={() => send.mutate(listing.id)}
                      disabled={send.isPending}
                      className="press grad-primary flex-1 rounded-2xl py-3 text-xs font-bold text-primary-foreground disabled:opacity-60"
                    >
                      Request match
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
  const [contact, setContact] = useState<{ full_name: string | null; phone: string | null } | null>(null);

  const update = useMutation({
    mutationFn: (status: "accepted" | "rejected" | "completed") =>
      updateMatchStatus({ data: { matchId: match.id, status } }),
    onSuccess: () => {
      toast.success("Match updated");
      onChanged();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reveal = useMutation({
    mutationFn: () => getMatchContact({ data: { matchId: match.id } }),
    onSuccess: (result) => {
      if (!result?.phone) {
        toast.info("The provider's verified number is not available for this match yet.");
        return;
      }
      setContact(result);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const canContact = match.status === "accepted" || match.status === "scheduled" || match.status === "in_progress";

  return (
    <div className="card-surface hover-lift p-4">
      <div className="flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">
            {match.listing_name ?? typeLabel(match.resource_type)}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {match.role === "provider" ? "You are the provider" : "You requested this"}
            {match.needed_date ? ` · ${match.needed_date}` : ""}
          </span>
        </span>
        <StatusPill status={match.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {match.role === "provider" && match.status === "requested" && (
          <>
            <button
              onClick={() => update.mutate("accepted")}
              className="press grad-primary rounded-2xl px-4 py-2.5 text-xs font-bold text-primary-foreground"
            >
              Accept
            </button>
            <button
              onClick={() => update.mutate("rejected")}
              className="press rounded-2xl border border-border px-4 py-2.5 text-xs font-bold"
            >
              Decline
            </button>
          </>
        )}
        {canContact && !contact && (
          <button
            onClick={() => reveal.mutate()}
            disabled={reveal.isPending}
            className="press inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-xs font-bold disabled:opacity-60"
          >
            <Phone className="size-3.5 text-primary" /> Contact provider
          </button>
        )}
        {canContact && (
          <button
            onClick={() => update.mutate("completed")}
            className="press rounded-2xl border border-border px-4 py-2.5 text-xs font-bold"
          >
            Mark completed
          </button>
        )}
      </div>

      {contact?.phone && (
        <p className="mt-3 rounded-2xl bg-primary/10 p-3 text-xs font-bold text-primary">
          {contact.full_name ?? "Verified provider"} ·{" "}
          <a href={`tel:${contact.phone}`} className="underline">
            {contact.phone}
          </a>
        </p>
      )}
    </div>
  );
}
