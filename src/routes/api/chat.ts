import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

import { readMandiPrices, readWeather } from "@/lib/mitra-tools.server";
import { schemes } from "@/lib/schemes";
import { crops } from "@/lib/crops";

type ChatBody = {
  messages?: unknown;
  lang?: unknown;
  location?: {
    state?: string;
    district?: string;
    place?: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
};

const LANG_NAME: Record<string, string> = {
  en: "English",
  mr: "Marathi",
  hi: "Hindi",
};

function systemPrompt(
  lang: string,
  location: ChatBody["location"],
) {
  const langName = LANG_NAME[lang] ?? "English";

  const loc = location?.place
    ? `The farmer's current location is ${[
        location.place,
        location.district,
        location.state,
      ]
        .filter(Boolean)
        .join(", ")}.`
    : "The farmer has not shared a location yet.";

  return `You are Mitra AI, the intelligent farming assistant inside MarketMitra.

You are a practical, honest agricultural assistant for Indian farmers.

LANGUAGE:
Reply in ${langName}.

If the farmer uses Marathi, reply naturally in Marathi.
If the farmer uses Hindi, reply naturally in Hindi.
If the farmer uses English, reply in English.
If the farmer mixes languages, naturally use the same style.

FARMER LOCATION:
${loc}

IMPORTANT:
Never invent prices, weather, government schemes, disease diagnoses, pesticide doses, or other factual information.

For mandi prices, use get_mandi_prices.

For weather questions, use get_weather.

For government schemes, use get_schemes.

For current information, use browser search when appropriate.

For disease questions, explain that text alone cannot confirm a disease.

For pesticide recommendations, be careful and recommend following official product labels.

Keep answers practical, clear and easy for farmers to understand.

Never claim 100% accuracy or guaranteed results.

CROPS AVAILABLE IN MARKETMITRA:
${crops.map((c) => c.commodity).join(", ")}

SCHEMES AVAILABLE IN MARKETMITRA:
${schemes.map((s) => `${s.name} (${s.url})`).join("; ")}
`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ChatBody;

          if (!Array.isArray(body.messages)) {
            return new Response("Messages are required", {
              status: 400,
            });
          }

          const apiKey = process.env["GROQ_API_KEY"];

          if (!apiKey) {
            console.error("GROQ_API_KEY is missing");

            return new Response(
              "Groq AI is not configured",
              { status: 500 },
            );
          }

          const lang =
            typeof body.lang === "string"
              ? body.lang
              : "en";

          const location = body.location ?? null;

          const groq = createGroq({
            apiKey,
          });

          const result = streamText({
            model: groq("openai/gpt-oss-120b"),

            system: systemPrompt(
              lang,
              location,
            ),

            messages:
              await convertToModelMessages(
                body.messages as UIMessage[],
              ),

            stopWhen: stepCountIs(20),

            abortSignal: request.signal,

            tools: {
              browser_search: groq.tools.browserSearch(
                {},
              ) as never,

              get_mandi_prices: tool({
                description:
                  "Get current APMC mandi prices from AGMARKNET/data.gov.in. Use this for mandi price questions. Never guess prices.",

                inputSchema: z.object({
                  commodity: z.string(),
                  state: z.string(),
                  district: z.string().nullable(),
                }),

                execute: async ({
                  commodity,
                  state,
                  district,
                }) => {
                  try {
                    return await readMandiPrices({
                      commodity,
                      state,
                      district,
                    });
                  } catch (error) {
                    console.error(
                      "Mandi tool error:",
                      error,
                    );

                    return {
                      error:
                        "Live mandi data is unavailable right now.",
                    };
                  }
                },
              }),

              get_weather: tool({
                description:
                  "Get current weather and forecast from Open-Meteo using coordinates.",

                inputSchema: z.object({
                  latitude: z.number(),
                  longitude: z.number(),
                }),

                execute: async ({
                  latitude,
                  longitude,
                }) => {
                  try {
                    return await readWeather({
                      latitude,
                      longitude,
                    });
                  } catch (error) {
                    console.error(
                      "Weather tool error:",
                      error,
                    );

                    return {
                      error:
                        "Live weather data is unavailable right now.",
                    };
                  }
                },
              }),

              get_schemes: tool({
                description:
                  "Search government schemes available in MarketMitra.",

                inputSchema: z.object({
                  query: z.string().nullable(),
                }),

                execute: async ({ query }) => {
                  const q =
                    query?.trim().toLowerCase();

                  const list = q
                    ? schemes.filter((scheme) =>
                        `${scheme.name} ${scheme.benefit} ${scheme.dept}`
                          .toLowerCase()
                          .includes(q),
                      )
                    : schemes;

                  return {
                    schemes:
                      list.length > 0
                        ? list
                        : schemes,
                  };
                },
              }),
            },

            providerOptions: {
              groq: {
                reasoningFormat: "hidden",
                reasoningEffort: "medium",
                parallelToolCalls: true,
              },
            },
          });

          return result.toUIMessageStreamResponse({
            originalMessages:
              body.messages as UIMessage[],
          });
        } catch (error) {
          console.error(
            "Mitra AI request error:",
            error,
          );

          return new Response(
            "Mitra AI could not process the request.",
            { status: 500 },
          );
        }
      },
    },
  },
});