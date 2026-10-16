export async function readStoredPriceHistory(commodity: string, state: string, market: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin
    .from("market_prices")
    .select("arrival_date, min_price, max_price, modal_price")
    .eq("commodity", commodity)
    .eq("state", state)
    .eq("market", market)
    .order("arrival_date", { ascending: false })
    .limit(60);
}
