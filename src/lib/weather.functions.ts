import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type WeatherDay = {
  date: string;
  max: number;
  min: number;
  rainChance: number;
  rainMm: number;
  code: number;
  uvIndex: number;
};

export type WeatherResult =
  | {
      ok: true;
      updatedAt: string;
      current: {
        temperature: number;
        apparent: number;
        humidity: number;
        wind: number;
        rainChance: number;
        code: number;
        isDay: boolean;
        pressure: number;
        uvIndex: number;
      };
      sunrise: string;
      sunset: string;
      days: WeatherDay[];
      source: string;
    }
  | { ok: false; error: string };

export const fetchWeather = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<WeatherResult> => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(data.latitude));
    url.searchParams.set("longitude", String(data.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,is_day,surface_pressure",
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max",
    );
    url.searchParams.set("timezone", "Asia/Kolkata");
    url.searchParams.set("forecast_days", "7");

    try {
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) {
        console.error(`open-meteo failed [${response.status}]: ${(await response.text()).slice(0, 300)}`);
        return { ok: false, error: "The weather service is temporarily unavailable." };
      }
      const json = (await response.json()) as {
        current: Record<string, number>;
        daily: {
          time: string[];
          weather_code: number[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          precipitation_probability_max: (number | null)[];
          precipitation_sum: (number | null)[];
          sunrise: string[];
          sunset: string[];
          uv_index_max: (number | null)[];
        };
      };

      const days: WeatherDay[] = json.daily.time.map((date, i) => ({
        date,
        max: Math.round(json.daily.temperature_2m_max[i] ?? 0),
        min: Math.round(json.daily.temperature_2m_min[i] ?? 0),
        rainChance: Math.round(json.daily.precipitation_probability_max[i] ?? 0),
        rainMm: Number((json.daily.precipitation_sum[i] ?? 0).toFixed(1)),
        code: json.daily.weather_code[i] ?? 0,
        uvIndex: Number((json.daily.uv_index_max[i] ?? 0).toFixed(1)),
      }));

      return {
        ok: true,
        updatedAt: new Date().toISOString(),
        current: {
          temperature: Math.round(json.current["temperature_2m"] ?? 0),
          apparent: Math.round(json.current["apparent_temperature"] ?? 0),
          humidity: Math.round(json.current["relative_humidity_2m"] ?? 0),
          wind: Math.round(json.current["wind_speed_10m"] ?? 0),
          rainChance: Math.round(json.current["precipitation_probability"] ?? 0),
          code: json.current["weather_code"] ?? 0,
          isDay: (json.current["is_day"] ?? 1) === 1,
          pressure: Math.round(json.current["surface_pressure"] ?? 0),
          uvIndex: days[0]?.uvIndex ?? 0,
        },
        sunrise: json.daily.sunrise[0] ?? "",
        sunset: json.daily.sunset[0] ?? "",
        days,
        source: "Open-Meteo",
      };
    } catch (error) {
      console.error("open-meteo network error", error);
      return { ok: false, error: "Could not reach the weather service." };
    }
  });

const geoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type PlaceResult = { name: string; district: string; state: string } | null;

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => geoSchema.parse(data))
  .handler(async ({ data }): Promise<PlaceResult> => {
    const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    url.searchParams.set("latitude", String(data.latitude));
    url.searchParams.set("longitude", String(data.longitude));
    url.searchParams.set("localityLanguage", "en");

    try {
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) return null;
      const json = (await response.json()) as {
        locality?: string;
        city?: string;
        principalSubdivision?: string;
        localityInfo?: { administrative?: { name?: string; adminLevel?: number }[] };
      };
      const admin = json.localityInfo?.administrative ?? [];
      const district =
        admin.find((a) => a.adminLevel === 5)?.name ??
        admin.find((a) => a.adminLevel === 6)?.name ??
        json.city ??
        "";
      return {
        name: json.locality || json.city || district,
        district: district.replace(/\s+district$/i, ""),
        state: json.principalSubdivision ?? "",
      };
    } catch (error) {
      console.error("reverse geocode failed", error);
      return null;
    }
  });
