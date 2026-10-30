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

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export type FarmerProfile = {
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  phone_verified_at: string | null;
  village: string | null;
  language: string;
  state: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  saved_crops: string[] | null;
  voice_id: string | null;
  voice_lang: string | null;
  voice_provider: string | null;
};

const EMPTY: FarmerProfile = {
  full_name: null,
  phone: null,
  phone_verified: false,
  phone_verified_at: null,
  village: null,
  language: "en",
  state: null,
  district: null,
  latitude: null,
  longitude: null,
  saved_crops: null,
  voice_id: null,
  voice_lang: null,
  voice_provider: null,
};

/** Offline mirror only — the database row is always the source of truth. */
const CACHE_KEY = "mm-profile";

const COLUMNS =
  "full_name,phone,phone_verified,phone_verified_at,village,language,state,district,latitude,longitude,saved_crops";

type SessionCtx = {
  profile: FarmerProfile;
  loading: boolean;
  /** True when the saved profile could not be read from the backend. */
  error: string | null;
  updateProfile: (patch: Partial<FarmerProfile>) => Promise<void>;
  applyPersistedProfile: (patch: Partial<FarmerProfile>) => void;
  refresh: () => Promise<void>;
  clearProfile: () => void;
};

const SessionContext = createContext<SessionCtx>({
  profile: EMPTY,
  loading: true,
  error: null,
  updateProfile: async () => {},
  applyPersistedProfile: () => {},
  refresh: async () => {},
  clearProfile: () => {},
});

function readCache(): FarmerProfile | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<FarmerProfile>) } : null;
  } catch {
    return null;
  }
}

function writeCache(profile: FarmerProfile) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    /* cache is a convenience only */
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<FarmerProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? null;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = userId;

  const load = useCallback(async () => {
    if (!userIdRef.current) {
      setProfile(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: readError } = await supabase
        .from("profiles")
        .select(COLUMNS)
        .eq("id", userIdRef.current)
        .maybeSingle();
      if (readError) throw new Error(readError.message);
      if (data) {
        const next = { ...EMPTY, ...(data as Partial<FarmerProfile>) };
        setProfile(next);
        writeCache(next);
      } else {
        // First sign-in: create the farmer's own profile row.
        const seed = { id: userIdRef.current, full_name: "", language: "en" };
        const { error: insertError } = await supabase.from("profiles").insert(seed as never);
        if (insertError) throw new Error(insertError.message);
        setProfile(EMPTY);
      }
      setError(null);
    } catch (cause) {
      console.error("Unable to load the saved profile", cause);
      const cached = readCache();
      if (cached) setProfile(cached);
      setError("We could not load your saved profile just now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, userId, load]);

  const updateProfile = useCallback(
    async (patch: Partial<FarmerProfile>) => {
      const id = userIdRef.current;
      setProfile((current) => {
        const next = { ...current, ...patch };
        writeCache(next);
        return next;
      });
      if (!id) return;
      const { error: writeError } = await supabase
        .from("profiles")
        .update(patch as never)
        .eq("id", id);
      if (writeError) {
        console.error("Unable to save the profile", writeError);
        await load();
        throw new Error("Your change could not be saved. Please try again.");
      }
    },
    [load],
  );

  const applyPersistedProfile = useCallback((patch: Partial<FarmerProfile>) => {
    setProfile((current) => {
      const next = { ...current, ...patch };
      writeCache(next);
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    try {
      window.localStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
    setProfile(EMPTY);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      loading,
      error,
      updateProfile,
      applyPersistedProfile,
      refresh: load,
      clearProfile,
    }),
    [profile, loading, error, updateProfile, applyPersistedProfile, load, clearProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
