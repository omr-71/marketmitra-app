import { fetchWeather, type WeatherDay, type WeatherResult } from "./weather.functions";

/**
 * Open-Meteo is CORS-enabled and needs no key, so the request is made from the
 * user's own browser. That keeps every farmer on their own rate-limit bucket
 * instead of sharing one server IP (which returns HTTP 429 under load).
 * If the browser request fails, we fall back to the server function.
 */
export async function getWeather(latitude: number, longitude: number): Promise<WeatherResult> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
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
    const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`open-meteo ${response.status}`);
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
    console.warn("browser weather fetch failed, retrying on the server", error);
    try {
      return await fetchWeather({ data: { latitude, longitude } });
    } catch {
      return { ok: false, error: "Could not reach the weather service. Please try again." };
    }
  }
}
