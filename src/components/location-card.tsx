import { useState } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import { INDIAN_STATES } from "@/lib/crops";
import { useLocationContext } from "@/lib/location";
import { useLang } from "@/lib/i18n";

export function LocationCard() {
  const { t } = useLang();
  const { location, status, error, detect, setManual } = useLocationContext();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(location?.state ?? "Maharashtra");
  const [district, setDistrict] = useState(location?.district ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    await setManual({ state, district: district.trim() });
    setSaving(false);
    setOpen(false);
  };

  return (
    <div className="card-surface hover-lift p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10">
            <MapPin className="size-4.5 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("yourLocation")}
            </p>
            <p className="truncate text-sm font-bold">
              {location?.state
                ? [location.place || location.district, location.state].filter(Boolean).join(", ")
                : t("locationNeeded")}
            </p>
          </div>
        </div>
        <button
          onClick={() => void detect()}
          disabled={status === "locating"}
          className="press grid size-9 shrink-0 place-items-center rounded-full bg-muted disabled:opacity-60"
          aria-label={t("useMyLocation")}
        >
          {status === "locating" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Crosshair className="size-4" />
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-[11px] font-semibold text-destructive">{error}</p>}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="press mt-3 w-full rounded-2xl border border-dashed border-primary/40 py-2.5 text-xs font-bold text-primary"
        >
          {t("chooseDistrict")}
        </button>
      ) : (
        <div className="mt-3 space-y-2.5">
          <label className="block">
            <span className="text-[11px] font-semibold text-muted-foreground">{t("state")}</span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-semibold"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold text-muted-foreground">{t("district")}</span>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              maxLength={60}
              placeholder="Nashik"
              className="mt-1 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm font-semibold"
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="press h-11 flex-1 rounded-2xl border border-border text-sm font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => void submit()}
              disabled={saving || !state}
              className="press grad-primary h-11 flex-1 rounded-2xl text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="mx-auto size-4 animate-spin" /> : t("save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
