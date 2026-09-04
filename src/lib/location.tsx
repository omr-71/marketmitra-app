import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { reverseGeocode } from "./weather.functions";
import { geocodePlace } from "./geocode";
import { useSession } from "./session";

export type FarmLocation = {
  state: string;
  district: string;
  city: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  /** "gps" = detected from the device, "manual" = typed by the farmer. */
  source: "gps" | "manual";
  updatedAt: string;
};

type Ctx = {
  location: FarmLocation | null;
  status: "idle" | "locating" | "ready" | "denied" | "error";
  error: string | null;
  detect: () => Promise<void>;
  setManual: (next: { state: string; district: string; city?: string }) => Promise<void>;
};

const STORAGE_KEY = "mm-location";
/** Re-read GPS when the saved fix is older than this. */
const STALE_MS = 20 * 60 * 1000;

const LocationContext = createContext<Ctx>({
  location: null,
  status: "idle",
  error: null,
  detect: async () => {},
  setManual: async () => {},
});

function normalize(raw: unknown): FarmLocation | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<FarmLocation>;
  if (!value.state && !value.district && !value.city) return null;
  return {
    state: value.state ?? "",
    district: value.district ?? "",
    city: value.city ?? "",
    place: value.place ?? value.city ?? value.district ?? value.state ?? "",
    latitude: typeof value.latitude === "number" ? value.latitude : null,
    longitude: typeof value.longitude === "number" ? value.longitude : null,
    source: value.source === "manual" ? "manual" : "gps",
    updatedAt: value.updatedAt ?? new Date(0).toISOString(),
  };
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useSession();
  const [location, setLocation] = useState<FarmLocation | null>(null);
  const [status, setStatus] = useState<Ctx["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Restore the saved preference so the farmer never re-enters it.
  useEffect(() => {
    hydrated.current = true;
    let saved: FarmLocation | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      saved = raw ? normalize(JSON.parse(raw)) : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    if (saved) {
      setLocation(saved);
      setStatus("ready");
    }
  }, []);

  // Fall back to whatever the profile already knows.
  useEffect(() => {
    if (!profile.state) return;
    setLocation((current) => {
      if (current) return current;
      setStatus("ready");
      return {
        state: profile.state ?? "",
        district: profile.district ?? "",
        city: profile.village ?? "",
        place: profile.village || profile.district || profile.state || "",
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
        source: "manual",
        updatedAt: new Date().toISOString(),
      };
    });
  }, [profile]);

  const persist = useCallback(
    (next: FarmLocation) => {
      setLocation(next);
      setStatus("ready");
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage may be unavailable in private mode */
      }
      void updateProfile({
        state: next.state,
        district: next.district,
        village: next.city || null,
        latitude: next.latitude,
        longitude: next.longitude,
      }).catch((cause: unknown) => console.error("Unable to save the farm location", cause));

    },
    [updateProfile],
  );

  const detect = useCallback(async () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("This device cannot share its location. Enter your city and district instead.");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setStatus("error");
      setError(
        "Location needs a secure (https) connection. Open the site over https or choose your location manually.",
      );
      return;
    }
    setStatus("locating");
    setError(null);

    const getPosition = (options: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    try {
      let position: GeolocationPosition;
      try {
        // Try a precise fix first; fall back to a faster, cached, coarse fix.
        position = await getPosition({
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        });
      } catch (firstError) {
        if ((firstError as GeolocationPositionError)?.code === 1) throw firstError;
        position = await getPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        });
      }

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const place = await reverseGeocode({ data: { latitude, longitude } });

      persist({
        state: place?.state ?? "",
        district: place?.district ?? "",
        city: place?.name ?? "",
        place: place?.name || place?.district || "Current location",
        latitude,
        longitude,
        source: "gps",
        updatedAt: new Date().toISOString(),
      });
      if (!place) {
        setError(
          "We have your GPS coordinates, but could not name the place. Weather still works; add your district manually if needed.",
        );
      }
    } catch (err) {
      const code = (err as GeolocationPositionError)?.code;
      setStatus(code === 1 ? "denied" : "error");
      setError(
        code === 1
          ? "Location permission is blocked. Allow location in your browser settings, or enter your city, district and state below — it works without GPS."
          : code === 3
            ? "Location is taking too long. Move to an open area and try again, or enter your city, district and state below."
            : "Could not read your location right now. Try again, or enter your city, district and state below.",
      );
    }
  }, [persist]);


  const setManual = useCallback(
    async (next: { state: string; district: string; city?: string }) => {
      const city = next.city?.trim() ?? "";
      setStatus("locating");
      setError(null);
      const hit = await geocodePlace({ city, district: next.district, state: next.state });
      persist({
        state: next.state || hit?.state || "",
        district: next.district || hit?.district || "",
        city,
        place: city || next.district || next.state,
        latitude: hit?.latitude ?? null,
        longitude: hit?.longitude ?? null,
        source: "manual",
        updatedAt: new Date().toISOString(),
      });
      if (!hit) {
        setError(
          "Saved, but we could not pinpoint that place for weather. Try a nearby larger city name.",
        );
      }
    },
    [persist],
  );

  // First load: ask the device only when nothing is saved and permission is not blocked.
  const autoTried = useRef(false);
  useEffect(() => {
    if (!hydrated.current || autoTried.current || location || status !== "idle") return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    autoTried.current = true;
    if (!("permissions" in navigator)) {
      void detect();
      return;
    }
    void navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (result.state !== "denied") void detect();
      })
      .catch(() => {});
  }, [location, status, detect]);

  // Keep an automatic (GPS) location fresh when the farmer returns to the app.
  useEffect(() => {
    if (!location || location.source !== "gps") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - new Date(location.updatedAt).getTime() < STALE_MS) return;
      void detect();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [location, detect]);

  const value = useMemo(
    () => ({ location, status, error, detect, setManual }),
    [location, status, error, detect, setManual],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocationContext = () => useContext(LocationContext);
