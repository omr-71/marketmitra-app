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
import { updateFarmerProfile } from "./profile.functions";
import { useSession } from "./session";

export type FarmLocation = {
  state: string;
  district: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
};

type Ctx = {
  location: FarmLocation | null;
  status: "idle" | "locating" | "ready" | "denied" | "error";
  error: string | null;
  detect: () => Promise<void>;
  setManual: (next: { state: string; district: string }) => Promise<void>;
};

const STORAGE_KEY = "mm-location";

const LocationContext = createContext<Ctx>({
  location: null,
  status: "idle",
  error: null,
  detect: async () => {},
  setManual: async () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const { profile, userId, refresh } = useSession();
  const [location, setLocation] = useState<FarmLocation | null>(null);
  const [status, setStatus] = useState<Ctx["status"]>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as FarmLocation;
      if (parsed?.state) {
        setLocation(parsed);
        setStatus("ready");
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!profile?.state) return;
    setLocation((current) => {
      if (current?.state) return current;
      const next: FarmLocation = {
        state: profile.state ?? "",
        district: profile.district ?? "",
        place: profile.village || profile.district || profile.state || "",
        latitude: profile.latitude ?? null,
        longitude: profile.longitude ?? null,
      };
      setStatus("ready");
      return next;
    });
  }, [profile]);

  const persist = useCallback(
    async (next: FarmLocation) => {
      setLocation(next);
      setStatus("ready");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!userId) return;
      await updateFarmerProfile({
        data: {
          state: next.state,
          district: next.district,
          latitude: next.latitude,
          longitude: next.longitude,
        },
      });
      await refresh();
    },
    [userId, refresh],
  );

  const detect = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("This device cannot share its location. Choose your district manually.");
      return;
    }
    setStatus("locating");
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 300000,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const place = await reverseGeocode({ data: { latitude, longitude } });

      await persist({
        state: place?.state ?? location?.state ?? "",
        district: place?.district ?? location?.district ?? "",
        place: place?.name ?? "Current location",
        latitude,
        longitude,
      });
    } catch (err) {
      const denied = (err as GeolocationPositionError)?.code === 1;
      setStatus(denied ? "denied" : "error");
      setError(
        denied
          ? "Location permission was blocked. Choose your district manually."
          : "Could not read your location. Choose your district manually.",
      );
    }
  }, [location, persist]);

  const setManual = useCallback(
    async (next: { state: string; district: string }) => {
      await persist({
        state: next.state,
        district: next.district,
        place: next.district || next.state,
        latitude: null,
        longitude: null,
      });
    },
    [persist],
  );

  // Ask for device GPS once on first load when nothing is known yet.
  const autoTried = useRef(false);
  useEffect(() => {
    if (autoTried.current || location || status !== "idle") return;
    if (!("geolocation" in navigator) || !("permissions" in navigator)) return;
    autoTried.current = true;
    void navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (result.state !== "denied") void detect();
      })
      .catch(() => {});
  }, [location, status, detect]);

  const value = useMemo(
    () => ({ location, status, error, detect, setManual }),
    [location, status, error, detect, setManual],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocationContext = () => useContext(LocationContext);
