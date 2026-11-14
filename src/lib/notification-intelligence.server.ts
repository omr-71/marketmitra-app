import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { crops } from "@/lib/crops";
import { aggregateMarketPrices, fetchAgmarknetHistory } from "@/lib/market-providers.server";
import { dispatchNotificationUnchecked, type DispatchData } from "@/lib/notification.server";
import {
  collectKeysetPages,
  comparableMarketMovements,
  fetchValidatedWeatherForecast,
  forEachIsolatedUser,
  isDailySummaryWindow,
} from "@/lib/notification-intelligence-policy";

type IntelligenceJob = "daily_summary" | "market_monitor" | "weather_monitor";
type JobOptions = { testUserId?: string };
type IntelligencePreference = {
  user_id: string;
  daily_summary_enabled: boolean;
  crop_alerts_enabled: boolean;
  weather_alerts: boolean;
  weather_intelligence_enabled: boolean;
  market_updates: boolean;
  selected_crops: string[];
  preferred_state: string | null;
  preferred_district: string | null;
  preferred_market: string | null;
  price_threshold_percent: number;
  quiet_hours_enabled: boolean;
  quiet_from: string;
  quiet_to: string;
};
type IntelligenceProfile = {
  id: string;
  state: string | null;
  district: string | null;
  saved_crops: string[];
  latitude: number | null;
  longitude: number | null;
};
type IntelligenceUser = {
  id: string;
  profile: IntelligenceProfile;
  preference: IntelligencePreference;
};
type IntelligenceJobResult = {
  generated: number;
  accepted: number;
  freshness: Array<string | null>;
  skippedQuietHours?: number;
  providerFailures?: Record<string, number>;
  processingFailures?: Record<string, number>;
  usersMissingProfile?: number;
};

const PREFERENCES_PAGE_SIZE = 500;

function istDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function istMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function withinQuietHours(now: string, from?: string, to?: string) {
  if (!from || !to) return false;
  const [hour = 0, minute = 0] = now.split(":").map(Number);
  const value = hour * 60 + minute;
  const [fromHour = 0, fromMinute = 0] = from.split(":").map(Number);
  const [toHour = 0, toMinute = 0] = to.split(":").map(Number);
  const start = fromHour * 60 + fromMinute;
  const end = toHour * 60 + toMinute;
  return start <= end ? value >= start && value < end : value >= start || value < end;
}

function hhmm(minutes: number) {
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function userInQuietHours(preference: IntelligencePreference) {
  if (!preference.quiet_hours_enabled) return false;
  return withinQuietHours(
    hhmm(istMinutes()),
    preference.quiet_from.slice(0, 5),
    preference.quiet_to.slice(0, 5),
  );
}

async function recordEvent(userId: string, eventType: string, eventKey: string, observation: Json) {
  const { error } = await supabaseAdmin.from("notification_intelligence_events").upsert({
    user_id: userId,
    event_type: eventType,
    event_key: eventKey,
    observation,
  }, { onConflict: "user_id,event_type,event_key", ignoreDuplicates: true });
  if (error) throw new Error("Notification intelligence event could not be recorded.");
}

async function sendDataNotification(userId: string, data: DispatchData) {
  return dispatchNotificationUnchecked({ ...data, userId });
}

async function marketCropRecord(profile: IntelligenceProfile, preference: IntelligencePreference, cropId: string) {
  const crop = crops.find((item) => item.id === cropId);
  const state = String(preference.preferred_state || profile.state || "").trim();
  const district = String(preference.preferred_district || profile.district || "").trim();
  const market = String(preference.preferred_market || "").trim();
  if (!crop || !state) return null;
  const result = await aggregateMarketPrices({
    commodity: crop.commodity,
    state,
    district: district || undefined,
    market: market || undefined,
  });
  return { crop, records: result.records, latestDate: result.latestDate, source: result.source };
}

async function runDailySummaries(users: IntelligenceUser[]): Promise<IntelligenceJobResult> {
  let generated = 0;
  let accepted = 0;
  let skippedQuietHours = 0;
  const freshness: Array<string | null> = [];
  if (!isDailySummaryWindow()) {
    return { generated, accepted, freshness, skippedQuietHours };
  }
  for (const user of users) {
    const preference = user.preference;
    if (preference.daily_summary_enabled !== true) continue;
    if (userInQuietHours(preference)) {
      skippedQuietHours += 1;
      continue;
    }
    const selected = preference.selected_crops;
    const cropIds = selected.length ? selected : user.profile.saved_crops.slice(0, 5);
    if (!cropIds.length) continue;
    const parts: string[] = [];
    for (const cropId of cropIds.slice(0, 4)) {
      const data = await marketCropRecord(user.profile, preference, cropId);
      if (!data?.records.length) continue;
      const record = [...data.records].sort((a, b) => b.date.localeCompare(a.date))[0];
      if (!record) continue;
      freshness.push(record.date);
      parts.push(`${data.crop.commodity}: ₹${record.modalPrice}/quintal at ${record.market} (${record.date})`);
    }
    if (!parts.length) continue;
    const date = istDate();
    const eventKey = date;
    await recordEvent(user.id, "daily_summary", eventKey, { crops: parts });
    const result = await sendDataNotification(user.id, {
      category: "market",
      title: "Good morning market update",
      body: parts.join("; "),
      url: "/markets",
      dedupeKey: `daily-summary:${date}`,
      userId: user.id,
    });
    generated += 1;
    accepted += result.accepted;
  }
  return { generated, accepted, freshness, skippedQuietHours };
}

async function runMarketAlerts(users: IntelligenceUser[]): Promise<IntelligenceJobResult> {
  let generated = 0;
  let accepted = 0;
  const freshness: Array<string | null> = [];
  for (const user of users) {
    const preference = user.preference;
    if (preference.crop_alerts_enabled !== true || preference.market_updates !== true) continue;
    if (userInQuietHours(preference)) continue;
    const selected = preference.selected_crops;
    const cropIds = selected.length ? selected : user.profile.saved_crops.slice(0, 5);
    const state = String(preference.preferred_state || user.profile.state || "").trim();
    const district = String(preference.preferred_district || user.profile.district || "").trim();
    const market = String(preference.preferred_market || "").trim();
    if (!cropIds.length || !state || !district) continue;
    const threshold = Number(preference.price_threshold_percent ?? 10);
    for (const cropId of cropIds.slice(0, 5)) {
      const crop = crops.find((item) => item.id === cropId);
      if (!crop) continue;
      const history = await fetchAgmarknetHistory({
        commodity: crop.commodity,
        state,
        district,
        market: market || undefined,
      });
      for (const { current, previous } of comparableMarketMovements(history, market || undefined)) {
        freshness.push(current.date);
        const change = ((current.modalPrice - previous.modalPrice) / previous.modalPrice) * 100;
        if (Math.abs(change) < threshold) continue;
        const direction = change >= 0 ? "increased" : "decreased";
        const eventKey = [
          crop.commodity,
          current.commodity,
          current.variety ?? "",
          current.grade ?? "",
          current.state,
          current.district,
          current.market,
          previous.date,
          current.date,
          current.modalPrice,
        ].join(":");
        await recordEvent(user.id, "market_movement", eventKey, {
          crop: crop.commodity,
          commodity: current.commodity,
          variety: current.variety,
          grade: current.grade,
          market: current.market,
          previousPrice: previous.modalPrice,
          currentPrice: current.modalPrice,
          changePercent: Number(change.toFixed(2)),
          previousDate: previous.date,
          currentDate: current.date,
          source: current.source,
        });
        const result = await sendDataNotification(user.id, {
          category: "market",
          title: `Price Alert: ${crop.commodity} ${direction}`,
          body: `${crop.commodity} at ${current.market} ${direction} ${Math.abs(change).toFixed(1)}%, from ₹${previous.modalPrice} on ${previous.date} to ₹${current.modalPrice} on ${current.date}. Source: ${current.source}.`,
          url: `/markets?crop=${encodeURIComponent(cropId)}&market=${encodeURIComponent(current.market)}`,
          dedupeKey: `market-alert:${eventKey}`,
        });
        generated += 1;
        accepted += result.accepted;
      }
    }
  }
  return { generated, accepted, freshness };
}

async function runWeatherAlerts(users: IntelligenceUser[]): Promise<IntelligenceJobResult> {
  let generated = 0;
  let accepted = 0;
  const freshness: string[] = [];
  const providerFailures: Record<string, number> = {};
  const processingFailures: Record<string, number> = {};
  const addFailure = (failures: Record<string, number>, reason: string) => {
    failures[reason] = (failures[reason] ?? 0) + 1;
  };

  await forEachIsolatedUser(users, async (user) => {
    const preference = user.preference;
    if (preference.weather_alerts !== true || preference.weather_intelligence_enabled !== true) return;
    if (userInQuietHours(preference)) return;
    const latitude = user.profile.latitude ?? Number.NaN;
    const longitude = user.profile.longitude ?? Number.NaN;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("daily", "temperature_2m_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max");
    url.searchParams.set("timezone", "Asia/Kolkata");
    url.searchParams.set("forecast_days", "2");

    const parsed = await fetchValidatedWeatherForecast(url);
    if (!parsed.ok) {
      addFailure(providerFailures, parsed.reason);
      return;
    }
    const {
      date,
      precipitationProbabilityMax: rain,
      precipitationSum: rainMm,
      windSpeedMax: wind,
      temperatureMax: high,
    } = parsed.forecast;
    freshness.push(date);
    const alerts: Array<{ type: string; message: string }> = [];
    if (rain >= 70 && rainMm >= 20) {
      alerts.push({
        type: "heavy_rain",
        message: `Heavy rainfall is forecast: ${rain}% probability and ${rainMm.toFixed(1)} mm possible for ${date}.`,
      });
    }
    if (wind >= 40) {
      alerts.push({
        type: "strong_wind",
        message: `Strong winds up to ${wind.toFixed(0)} km/h are forecast for ${date}.`,
      });
    }
    if (high >= 40) {
      alerts.push({
        type: "extreme_heat",
        message: `High temperature of ${high.toFixed(0)}°C is forecast for ${date}.`,
      });
    }
    for (const alert of alerts) {
      const eventKey = `${date}:${alert.type}`;
      await recordEvent(user.id, "weather_alert", eventKey, {
        date,
        source: "Open-Meteo",
        latitude,
        longitude,
      });
      const result = await sendDataNotification(user.id, {
        category: "weather",
        title: "Weather Alert",
        body: alert.message,
        url: "/weather",
        dedupeKey: `weather-alert:${eventKey}`,
      });
      generated += 1;
      accepted += result.accepted;
    }
  }, () => addFailure(processingFailures, "user_processing_error"));
  return { generated, accepted, freshness, providerFailures, processingFailures };
}

export async function runNotificationIntelligence(jobType: IntelligenceJob, options: JobOptions = {}) {
  const preferences = await collectKeysetPages<IntelligencePreference>(async (afterUserId, pageSize) => {
    let usersQuery = supabaseAdmin
      .from("notification_preferences")
      .select("user_id,daily_summary_enabled,crop_alerts_enabled,weather_alerts,weather_intelligence_enabled,market_updates,summary_time,price_threshold_percent,selected_crops,preferred_state,preferred_district,preferred_market,quiet_hours_enabled,quiet_from,quiet_to")
      .order("user_id", { ascending: true })
      .limit(pageSize);
    if (afterUserId) usersQuery = usersQuery.gt("user_id", afterUserId);
    if (options.testUserId) usersQuery = usersQuery.eq("user_id", options.testUserId);
    const { data, error } = await usersQuery;
    if (error) throw new Error("Notification preferences could not be loaded.");
    return data ?? [];
  }, PREFERENCES_PAGE_SIZE);
  const userIds = preferences.map((item) => item.user_id);
  const profileMap = new Map<string, IntelligenceProfile>();
  for (let offset = 0; offset < userIds.length; offset += 100) {
    const profileIds = userIds.slice(offset, offset + 100);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id,state,district,saved_crops,latitude,longitude")
      .in("id", profileIds);
    if (profilesError) throw new Error("Notification profiles could not be loaded.");
    for (const profile of profiles ?? []) profileMap.set(profile.id, profile);
  }
  let usersMissingProfile = 0;
  const users = preferences.flatMap((preference) => {
    const profile = profileMap.get(preference.user_id);
    if (!profile) {
      usersMissingProfile += 1;
      return [];
    }
    return [{ id: preference.user_id, profile, preference }];
  });
  const result: IntelligenceJobResult = jobType === "daily_summary"
    ? await runDailySummaries(users)
    : jobType === "market_monitor"
      ? await runMarketAlerts(users)
      : await runWeatherAlerts(users);
  return { jobType, usersEvaluated: users.length, usersMissingProfile, ...result };
}
