import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FarmerProfile = {
  full_name: string | null;
  phone: string | null;
  village: string | null;
  language: string;
  state: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  saved_crops: string[] | null;
};

const EMPTY: FarmerProfile = {
  full_name: null,
  phone: null,
  village: null,
  language: "en",
  state: null,
  district: null,
  latitude: null,
  longitude: null,
  saved_crops: null,
};

const STORAGE_KEY = "mm-profile";

type SessionCtx = {
  profile: FarmerProfile;
  loading: boolean;
  updateProfile: (patch: Partial<FarmerProfile>) => void;
  clearProfile: () => void;
};

const SessionContext = createContext<SessionCtx>({
  profile: EMPTY,
  loading: true,
  updateProfile: () => {},
  clearProfile: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<FarmerProfile>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...EMPTY, ...(JSON.parse(raw) as Partial<FarmerProfile>) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const updateProfile = useCallback((patch: Partial<FarmerProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setProfile(EMPTY);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, updateProfile, clearProfile }),
    [profile, loading, updateProfile, clearProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
