import { useState } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { useLocationContext } from "@/lib/location";
import { useLang } from "@/lib/i18n";
import { LocationDialog } from "./location-dialog";
import { Button } from "@/components/ui/button";

export function LocationCard({ className = "" }: { className?: string }) {
  const { t } = useLang();
  const { location, status, error, detect, setManual } = useLocationContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Format primary place (city / village / place) and secondary line (district, state)
  const primaryPlace =
    location?.city || location?.place || location?.district || t("locationNeeded");
  const subPlace =
    location?.district && location?.state
      ? `${location.district}, ${location.state}`
      : location?.state || location?.district || "";

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07),0_2px_4px_-1px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <div>
        {/* Top Header Row: Label & Source Badge + Dedicated GPS Refresh Icon */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {t("yourLocation")}
            </span>
            {location && (
              <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                {location.source === "gps" ? t("autoLocation") : t("manualLocation")}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => void detect()}
            disabled={status === "locating"}
            className="press grid size-8 shrink-0 place-items-center rounded-xl border border-border/70 bg-background text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-muted disabled:opacity-60 shadow-sm"
            aria-label={t("useMyLocation")}
            title="Auto-detect current GPS location"
          >
            {status === "locating" ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Crosshair className="size-4 text-primary" />
            )}
          </button>
        </div>

        {/* Middle Row: Prominent, comfortable location text */}
        <div className="mt-4 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary mt-0.5 shadow-sm">
            <MapPin className="size-5" />
          </span>

          <div className="min-w-0 flex-1">
            <p
              className="text-base font-black tracking-tight text-foreground line-clamp-1 sm:text-lg"
              title={primaryPlace}
            >
              {primaryPlace}
            </p>
            {subPlace ? (
              <p
                className="mt-0.5 text-xs font-semibold text-muted-foreground line-clamp-1"
                title={subPlace}
              >
                {subPlace}
              </p>
            ) : !location ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Tap below to choose your state, district and taluka.
              </p>
            ) : null}
          </div>
        </div>

        {error && (
          <p className="mt-3 text-[11px] font-medium text-destructive leading-tight">{error}</p>
        )}
      </div>

      {/* Bottom Row: Clear, properly sized action button */}
      <div className="mt-5 border-t border-border/60 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="w-full h-9 rounded-xl text-xs font-bold gap-1.5 border-border bg-background hover:bg-muted hover:border-primary/40 transition-all shadow-sm"
        >
          <MapPin className="size-3.5 text-primary" />
          <span>{location ? "Change location" : "Enter location"}</span>
        </Button>
      </div>

      {/* Cascading Hierarchical Selection Modal */}
      <LocationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentLocation={location}
        onSave={async (sel) => {
          await setManual({
            state: sel.state,
            district: sel.district,
            city: sel.village || sel.taluka,
            taluka: sel.taluka,
            village: sel.village,
          });
        }}
      />
    </div>
  );
}
