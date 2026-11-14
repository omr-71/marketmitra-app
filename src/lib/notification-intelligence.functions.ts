import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const intelligencePreferencesSchema = z.object({
  enabled: z.boolean().default(true),
  marketUpdates: z.boolean().default(true),
  weatherAlerts: z.boolean().default(true),
  dailySummary: z.boolean().default(false),
  cropAlerts: z.boolean().default(true),
  summaryTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("07:00"),
  priceThreshold: z.number().int().min(1).max(100).default(10),
  selectedCrops: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  preferredState: z.string().trim().max(80).optional().nullable(),
  preferredDistrict: z.string().trim().max(80).optional().nullable(),
  preferredMarket: z.string().trim().max(80).optional().nullable(),
  quietHours: z.boolean().default(false),
  quietFrom: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("22:00"),
  quietTo: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("06:00"),
});

export const saveNotificationIntelligencePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => intelligencePreferencesSchema.parse(value))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("notification_preferences").upsert({
      user_id: context.userId,
      enabled: data.enabled,
      market_updates: data.marketUpdates,
      weather_alerts: data.weatherAlerts,
      daily_summary_enabled: data.dailySummary,
      crop_alerts_enabled: data.cropAlerts,
      weather_intelligence_enabled: data.weatherAlerts,
      summary_time: data.summaryTime,
      price_threshold_percent: data.priceThreshold,
      selected_crops: data.selectedCrops,
      preferred_state: data.preferredState ?? null,
      preferred_district: data.preferredDistrict ?? null,
      preferred_market: data.preferredMarket ?? null,
      quiet_hours_enabled: data.quietHours,
      quiet_from: data.quietFrom,
      quiet_to: data.quietTo,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw new Error("Notification preferences could not be saved.");
    return { saved: true };
  });
