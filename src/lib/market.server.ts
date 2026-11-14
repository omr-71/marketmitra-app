import { marketCommodityVariants } from "./market-commodity";
import { marketDistrictVariants } from "./market-district";

export async function readStoredPriceHistory(
  commodity: string,
  state: string,
  district: string,
  market: string,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin
    .from("market_prices")
    .select("arrival_date, min_price, max_price, modal_price")
    .in("commodity", marketCommodityVariants(commodity))
    .eq("state", state)
    .in("district", marketDistrictVariants(district))
    .eq("market", market)
    .order("arrival_date", { ascending: false })
    .limit(60);
}
