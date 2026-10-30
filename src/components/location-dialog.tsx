import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  INDIAN_STATES_HIERARCHY,
  fetchStateHierarchy,
  getDistricts,
  getSubDistricts,
  getVillages,
  normalizeStateName,
  type StateGeoData,
} from "@/lib/geo-hierarchy";
import { Check, ChevronDown, Loader2, MapPin, Search, X, AlertCircle, Info } from "lucide-react";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation: {
    state?: string;
    district?: string;
    city?: string;
  } | null;
  onSave: (location: {
    state: string;
    district: string;
    city: string;
    taluka: string;
    village: string;
  }) => Promise<void>;
}

export function LocationDialog({
  open,
  onOpenChange,
  currentLocation,
  onSave,
}: LocationDialogProps) {
  // Selection states
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTaluka, setSelectedTaluka] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");

  // Data loading states
  const [stateData, setStateData] = useState<StateGeoData | null>(null);
  const [loadingStateData, setLoadingStateData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize from current location when modal opens
  useEffect(() => {
    if (open) {
      const initialNormState = currentLocation?.state
        ? normalizeStateName(currentLocation.state) || currentLocation.state
        : "";
      setSelectedState(initialNormState);
      setSelectedDistrict(currentLocation?.district || "");
      setSelectedTaluka(currentLocation?.city || "");
      setSelectedVillage("");
      setLoadError(null);
    }
  }, [open, currentLocation]);

  // When state changes, fetch its geographic directory
  useEffect(() => {
    if (!selectedState) {
      setStateData(null);
      setLoadingStateData(false);
      return;
    }

    let active = true;
    setLoadingStateData(true);
    setLoadError(null);

    fetchStateHierarchy(selectedState)
      .then((data) => {
        if (!active) return;
        setStateData(data);
        setLoadingStateData(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadingStateData(false);
        setLoadError(
          err instanceof Error
            ? err.message
            : "Failed to load directory for this state. Please try again.",
        );
      });

    return () => {
      active = false;
    };
  }, [selectedState]);

  // Derived options based on strict parent-child hierarchy
  const availableDistricts = useMemo(() => {
    return getDistricts(stateData);
  }, [stateData]);

  const availableTalukas = useMemo(() => {
    return getSubDistricts(stateData, selectedDistrict);
  }, [stateData, selectedDistrict]);

  const availableVillages = useMemo(() => {
    return getVillages(stateData, selectedDistrict, selectedTaluka);
  }, [stateData, selectedDistrict, selectedTaluka]);

  // Handlers for cascading state resets
  const handleStateChange = (newState: string) => {
    if (newState === selectedState) return;
    setSelectedState(newState);
    // Reset all downstream children
    setSelectedDistrict("");
    setSelectedTaluka("");
    setSelectedVillage("");
  };

  const handleDistrictChange = (newDistrict: string) => {
    if (newDistrict === selectedDistrict) return;
    setSelectedDistrict(newDistrict);
    // Reset dependent city/taluka and village
    setSelectedTaluka("");
    setSelectedVillage("");
  };

  const handleTalukaChange = (newTaluka: string) => {
    if (newTaluka === selectedTaluka) return;
    setSelectedTaluka(newTaluka);
    // Reset dependent village
    setSelectedVillage("");
  };

  const handleVillageChange = (newVillage: string) => {
    setSelectedVillage(newVillage);
  };

  const handleConfirm = async () => {
    if (!selectedState || !selectedDistrict || !selectedTaluka) return;

    setSaving(true);
    try {
      await onSave({
        state: selectedState,
        district: selectedDistrict,
        city: selectedVillage || selectedTaluka,
        taluka: selectedTaluka,
        village: selectedVillage,
      });
      onOpenChange(false);
    } catch {
      // Error is surfaced by location context
    } finally {
      setSaving(false);
    }
  };

  const isValidSelection = Boolean(selectedState && selectedDistrict && selectedTaluka);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 sm:max-w-lg sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10">
              <MapPin className="size-4" />
            </span>
            <DialogTitle className="text-base font-extrabold sm:text-lg">
              Select Farm Location
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose your administrative location in sequence: State &rarr; District &rarr; City /
            Taluka &rarr; Village.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-4 gap-1.5 py-1 text-[10px] font-bold">
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 ${
              selectedState ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <span>1. State</span>
            {selectedState && <Check className="size-3" />}
          </div>
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 ${
              selectedDistrict
                ? "bg-primary/10 text-primary"
                : selectedState
                  ? "bg-muted text-foreground"
                  : "bg-muted/40 text-muted-foreground/60"
            }`}
          >
            <span className="truncate">2. District</span>
            {selectedDistrict && <Check className="size-3" />}
          </div>
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 ${
              selectedTaluka
                ? "bg-primary/10 text-primary"
                : selectedDistrict
                  ? "bg-muted text-foreground"
                  : "bg-muted/40 text-muted-foreground/60"
            }`}
          >
            <span className="truncate">3. Taluka</span>
            {selectedTaluka && <Check className="size-3" />}
          </div>
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 ${
              selectedVillage
                ? "bg-primary/10 text-primary"
                : selectedTaluka
                  ? "bg-muted text-foreground"
                  : "bg-muted/40 text-muted-foreground/60"
            }`}
          >
            <span className="truncate">4. Village</span>
            {selectedVillage && <Check className="size-3" />}
          </div>
        </div>

        {/* Error message */}
        {loadError && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Unable to load locations</p>
              <p className="mt-0.5 text-[11px] text-destructive/90">{loadError}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                if (selectedState) {
                  setLoadingStateData(true);
                  setLoadError(null);
                  fetchStateHierarchy(selectedState)
                    .then((data) => {
                      setStateData(data);
                      setLoadingStateData(false);
                    })
                    .catch((e: unknown) => {
                      setLoadingStateData(false);
                      setLoadError(e instanceof Error ? e.message : "Error loading data");
                    });
                }
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {/* 4 Cascading Dropdowns */}
        <div className="space-y-4 pt-1">
          {/* 1. STATE */}
          <SearchableSelect
            label="1. State / Union Territory"
            placeholder="Search & select state..."
            value={selectedState}
            options={INDIAN_STATES_HIERARCHY as unknown as string[]}
            onChange={handleStateChange}
            disabled={saving}
          />

          {/* 2. DISTRICT */}
          <SearchableSelect
            label="2. District"
            placeholder={
              !selectedState
                ? "Select a state first"
                : loadingStateData
                  ? "Loading districts..."
                  : "Search & select district..."
            }
            value={selectedDistrict}
            options={availableDistricts}
            onChange={handleDistrictChange}
            disabled={!selectedState || loadingStateData || saving}
            loading={loadingStateData}
            emptyMessage={
              !selectedState ? "Please choose a state first" : "No matching districts found"
            }
          />

          {/* 3. CITY / TALUKA */}
          <SearchableSelect
            label="3. City / Taluka"
            placeholder={
              !selectedDistrict ? "Select a district first" : "Search & select city / taluka..."
            }
            value={selectedTaluka}
            options={availableTalukas}
            onChange={handleTalukaChange}
            disabled={!selectedDistrict || saving}
            emptyMessage={
              !selectedDistrict
                ? "Please choose a district first"
                : "No sub-districts or talukas recorded for this district"
            }
          />

          {/* 4. VILLAGE */}
          <div>
            <SearchableSelect
              label="4. Village (Optional)"
              placeholder={
                !selectedTaluka
                  ? "Select city/taluka first"
                  : availableVillages.length === 0
                    ? "Village records not available"
                    : "Search village (or save at taluka level)..."
              }
              value={selectedVillage}
              options={availableVillages}
              onChange={handleVillageChange}
              disabled={!selectedTaluka || availableVillages.length === 0 || saving}
              optional
              emptyMessage={
                availableVillages.length === 0
                  ? "No village-level records for this taluka"
                  : "No matching villages found"
              }
            />

            {selectedTaluka && availableVillages.length === 0 && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground">
                <Info className="size-3.5 shrink-0 mt-0.5 text-primary" />
                <p>
                  Village-level directory is not published for {selectedTaluka}. Your location will
                  be saved at the City/Taluka level with full district market data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected hierarchy preview */}
        {selectedState && (
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Selected Hierarchy
            </p>
            <p className="mt-1 font-bold text-foreground">
              {[selectedVillage, selectedTaluka, selectedDistrict, selectedState]
                .filter(Boolean)
                .join(" \u2192 ")}
            </p>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="h-9 px-4 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={!isValidSelection || saving}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Save Location
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   SEARCHABLE SELECT / COMBOBOX COMPONENT
========================================================= */

function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  optional = false,
  emptyMessage = "No options found",
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
  loading?: boolean;
  optional?: boolean;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-bold text-foreground">{label}</label>
        {optional && (
          <span className="text-[10px] text-muted-foreground font-medium">(optional)</span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 text-left text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
          disabled
            ? "bg-muted/40 text-muted-foreground/50 border-border/50 cursor-not-allowed"
            : open
              ? "border-primary bg-background ring-1 ring-primary"
              : "border-border bg-background hover:bg-muted/40 text-foreground"
        }`}
      >
        <span className={`truncate ${!value ? "text-muted-foreground" : "font-semibold"}`}>
          {value || placeholder}
        </span>

        <div className="flex items-center gap-1 text-muted-foreground">
          {loading ? (
            <Loader2 className="size-3.5 animate-spin text-primary" />
          ) : value && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="grid size-4 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-3 text-muted-foreground hover:text-foreground" />
            </span>
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </div>
      </button>

      {/* Dropdown Panel */}
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-popover shadow-lg">
          {/* Search Input */}
          <div className="flex items-center border-b border-border/70 px-2.5 py-1.5">
            <Search className="size-3.5 text-muted-foreground mr-2 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="h-7 w-full bg-transparent text-xs text-popover-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto p-1 text-xs">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">{emptyMessage}</div>
            ) : (
              filtered.map((item) => {
                const isSelected = item === value;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted text-popover-foreground"
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
