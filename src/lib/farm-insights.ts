import type { WeatherDay, WeatherResult } from "./weather.functions";
import { formatIstWeekday, istDate } from "./format";

type Ok = Extract<WeatherResult, { ok: true }>;

export function conditionLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Mainly clear";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

export function uvLabel(uv: number) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

/** Which part of today suits field work, derived from real sunrise/sunset and conditions. */
export function bestFarmingWindow(data: Ok) {
  const sunrise = istDate(data.sunrise);
  const sunset = istDate(data.sunset);
  const fmt = (d: Date, addHours: number) =>
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(d.getTime() + addHours * 3600_000));

  const today = data.days[0];
  const hot = (today?.max ?? 0) >= 36;
  const wet = (today?.rainChance ?? 0) >= 60;

  if (wet) {
    return {
      window: `${fmt(sunrise, 0)} – ${fmt(sunrise, 3)}`,
      reason: "Rain is likely later today, so finish field work in the early morning window.",
    };
  }
  if (hot || data.current.uvIndex >= 8) {
    return {
      window: `${fmt(sunrise, 0)} – ${fmt(sunrise, 3.5)} · ${fmt(sunset, -2.5)} – ${fmt(sunset, 0)}`,
      reason: "Strong midday heat and UV — work early morning and late afternoon.",
    };
  }
  return {
    window: `${fmt(sunrise, 0.5)} – ${fmt(sunrise, 5)}`,
    reason: "Mild conditions with low rain risk — a long, comfortable working window.",
  };
}

/** One-line insight about today's weather, always from live values. */
export function todayInsight(data: Ok) {
  const today = data.days[0];
  if (!today) return conditionLabel(data.current.code);
  if (today.rainChance >= 60) {
    return `${today.rainChance}% chance of rain with up to ${today.rainMm} mm — keep harvested stock covered and delay spraying.`;
  }
  if (today.max >= 38) {
    return `Peaking at ${today.max}° — irrigate before sunrise to cut evaporation loss.`;
  }
  if (data.current.humidity >= 80) {
    return `Humidity at ${data.current.humidity}% slows drying and raises fungal risk — improve airflow in storage.`;
  }
  if (data.current.wind >= 25) {
    return `Winds around ${data.current.wind} km/h — postpone spraying to avoid drift.`;
  }
  return `${conditionLabel(data.current.code)} at ${data.current.temperature}° with ${today.rainChance}% rain chance — good conditions for harvesting and transport.`;
}

export function farmingTips(data: Ok) {
  const tips: string[] = [];
  const today = data.days[0];
  const wind = Math.max(data.current.wind, data.current.windGust);

  if (today && today.rainMm >= 10)
    tips.push(
      `About ${today.rainMm} mm rain expected today — hold back irrigation and let the field drain before working it.`,
    );
  else if (today && today.rainChance >= 50)
    tips.push(
      `${today.rainChance}% rain chance — cover drying yards and bagged produce, and finish field work early.`,
    );

  if (wind >= 20)
    tips.push(
      `Wind up to ${wind} km/h can carry spray off target — postpone spraying and follow the product label for wind limits.`,
    );
  if (data.current.humidity >= 80)
    tips.push(
      `Humidity ${data.current.humidity}% with slow drying favours fungal disease — improve airflow, scout the crop, and confirm any diagnosis before treating.`,
    );
  if (data.current.uvIndex >= 8)
    tips.push(`UV index ${data.current.uvIndex} — schedule labour work outside 11am–3pm.`);
  if (today && today.max >= 38)
    tips.push(`Peak ${today.max}° — irrigate before sunrise or after sunset to cut evaporation loss.`);
  if (data.current.pressure && data.current.pressure < 1000)
    tips.push("Air pressure is low, which often precedes unsettled weather — plan mandi trips earlier.");

  if (tips.length === 0)
    tips.push(
      `${conditionLabel(data.current.code)} at ${data.current.temperature}° with ${today?.rainChance ?? 0}% rain chance — normal field work, spraying and mandi transport are all workable today.`,
    );
  return tips.slice(0, 4);
}


export function harvestAdvice(days: WeatherDay[]) {
  const advice: string[] = [];
  const dry = days.filter((d) => d.rainChance < 25);
  const wet = days.filter((d) => d.rainChance >= 60);
  const hot = days.filter((d) => d.max >= 38);

  if (dry.length > 0) {
    advice.push(
      `Dry window on ${dry.slice(0, 3).map((d) => formatIstWeekday(d.date)).join(", ")} — best for harvesting and drying.`,
    );
  }
  if (wet.length > 0) {
    advice.push(
      `Avoid open-yard drying on ${wet.map((d) => formatIstWeekday(d.date)).join(", ")}; rainfall up to ${Math.max(
        ...wet.map((d) => d.rainMm),
      )} mm expected.`,
    );
  }
  if (hot.length > 0) {
    advice.push(
      `Heat above 38° on ${hot.map((d) => formatIstWeekday(d.date)).join(", ")} — irrigate early morning.`,
    );
  }
  if (advice.length === 0) {
    advice.push("Conditions are stable through the week — normal field operations can continue.");
  }
  return advice;
}
