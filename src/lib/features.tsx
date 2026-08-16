import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export type FeatureFlag = {
  key: string;
  label: string;
  enabled: boolean;
  maintenance_message: string | null;
};

/** Route prefix → feature switch key. */
const ROUTE_FEATURE: Array<[string, string]> = [
  ["/crops", "market_prices"],
  ["/markets", "market_prices"],
  ["/market", "market_prices"],
  ["/predict", "predict"],
  ["/weather", "weather"],
  ["/diagnose", "diagnose"],
  ["/schemes", "schemes"],
  ["/profile", "profile"],
];

export function featureKeyForPath(pathname: string): string | null {
  const hit = ROUTE_FEATURE.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return hit ? hit[1] : null;
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["feature-flags"],
    staleTime: 60_000,
    retry: false,
    queryFn: async (): Promise<FeatureFlag[]> => {
      // Missing/unavailable backend must never blank the app: fall back to "all enabled".
      try {
        const { data, error } = await supabase
          .from("feature_flags")
          .select("key,label,enabled,maintenance_message")
          .order("label");
        if (error) return [];
        return data ?? [];
      } catch {
        return [];
      }
    },
  });
}

/** Returns null while unknown so nothing flickers into a maintenance state. */
export function useFeature(key: string | null) {
  const { data } = useFeatureFlags();
  if (!key || !data) return null;
  return data.find((f) => f.key === key) ?? null;
}

export function MaintenanceNotice({ flag }: { flag: FeatureFlag }) {
  return (
    <div className="px-5 py-16 lg:px-0">
      <div className="glass mx-auto max-w-md rounded-3xl p-7 text-center shadow-[var(--shadow-card)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
          <Wrench className="size-7" strokeWidth={2.1} />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold">{flag.label} is under maintenance</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {flag.maintenance_message?.trim() ||
            "We are improving this section right now. Everything else in MarketMitra keeps working — please check back a little later."}
        </p>
      </div>
    </div>
  );
}
