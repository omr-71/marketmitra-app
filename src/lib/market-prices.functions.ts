import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AggregateResult, MarketServiceStatus } from "./market-types";

const filtersSchema = z.object({
  commodity: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(60),
  district: z.string().trim().max(60).optional(),
  market: z.string().trim().max(80).optional(),
});

/** Multi-source, validated, deduped official mandi prices + freshness. */
export const getMarketPrices = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => filtersSchema.parse(data))
  .handler(async ({ data }): Promise<AggregateResult> => {
    const { aggregateMarketPrices } = await import("./market-providers.server");
    return aggregateMarketPrices(data);
  });

/** Non-secret service health for the Settings → Data & API status section. */
export const getMarketStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<MarketServiceStatus> => {
    const { readMarketServiceStatus } = await import("./market-status.server");
    return readMarketServiceStatus();
  },
);

/** Same diagnostics, admin-gated, for the admin control centre. */
export const getProviderDiagnostics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MarketServiceStatus> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (data !== true) throw new Error("Forbidden");
    const { readMarketServiceStatus } = await import("./market-status.server");
    return readMarketServiceStatus();
  });
