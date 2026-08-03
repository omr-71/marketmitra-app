import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FarmerProfile = {
  id: string;
  phone: string;
  full_name: string;
  village: string | null;
  language: string;
  state: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  saved_crops: string[] | null;
};

type SessionCtx = {
  userId: string | null;
  profile: FarmerProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionCtx>({
  userId: null,
  profile: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.auth.getUser();
    const id = data.user?.id ?? null;
    setUserId(id);
    if (!id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data: row } = await supabase
      .from("profiles")
      .select("id, phone, full_name, village, language, state, district, latitude, longitude, saved_crops")
      .eq("id", id)
      .maybeSingle();
    setProfile((row as FarmerProfile | null) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setProfile(null);
  };

  return (
    <SessionContext.Provider value={{ userId, profile, loading, refresh: load, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
