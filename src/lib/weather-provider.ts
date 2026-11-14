const RETRYABLE_STATUSES = new Set([502, 503, 504]);

export async function fetchWeatherResponse(
  url: URL,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (attempt === 1 || !RETRYABLE_STATUSES.has(response.status)) return response;

    await response.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  throw new Error("Weather provider retry exhausted without a response.");
}
