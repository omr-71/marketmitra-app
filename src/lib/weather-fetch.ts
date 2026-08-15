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
    "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,is_day,surface_pressure",
  );

  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max",
  );

  url.searchParams.set("timezone", "Asia/Kolkata");
  url.searchParams.set("forecast_days", "7");

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`open-meteo ${response.status}`);
    }

    const json = (await response.json()) as {
      current: Record<string, number | string>;
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
        wind_speed_10m_max: (number | null)[];
      };
    };

    const num = (key: string) => Number(json.current[key] ?? 0);

    const days: WeatherDay[] = json.daily.time.map((date, i) => ({
      date,
      max: Math.round(json.daily.temperature_2m_max[i] ?? 0),
      min: Math.round(json.daily.temperature_2m_min[i] ?? 0),
      rainChance: Math.round(
        json.daily.precipitation_probability_max[i] ?? 0,
      ),
      rainMm: Number(
        (json.daily.precipitation_sum[i] ?? 0).toFixed(1),
      ),
      code: json.daily.weather_code[i] ?? 0,
      uvIndex: Number(
        (json.daily.uv_index_max[i] ?? 0).toFixed(1),
      ),
      windMax: Math.round(
        json.daily.wind_speed_10m_max[i] ?? 0,
      ),
    }));

    return {
      ok: true,
      updatedAt: new Date().toISOString(),

      current: {
        temperature: Math.round(num("temperature_2m")),
        apparent: Math.round(num("apparent_temperature")),
        humidity: Math.round(num("relative_humidity_2m")),
        wind: Math.round(num("wind_speed_10m")),
        rainChance: Math.round(num("precipitation_probability")),
        code: num("weather_code"),
        isDay: num("is_day") === 1,
        pressure: Math.round(num("surface_pressure")),
        uvIndex: days[0]?.uvIndex ?? 0,
        precipitation: Number(num("precipitation").toFixed(1)),
        windGust: Math.round(num("wind_gusts_10m")),
      },

      observedAt:
        typeof json.current["time"] === "string"
          ? json.current["time"]
          : "",

      sunrise: json.daily.sunrise[0] ?? "",
      sunset: json.daily.sunset[0] ?? "",
      days,
      source: "Open-Meteo",
    };
  } catch (error) {
    console.warn(
      "browser weather fetch failed, retrying on the server",
      error,
    );

    try {
      return await fetchWeather({
        data: { latitude, longitude },
      });
    } catch {
      return {
        ok: false,
        error: "Could not reach the weather service. Please try again.",
      };
    }
  }
}