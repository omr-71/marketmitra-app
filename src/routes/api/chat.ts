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

Introduce yourself, when asked, as "Mitra — Market Mitra's AI assistant."

You are a practical, honest agricultural assistant for Indian farmers.

IDENTITY / OWNERSHIP:
If the farmer asks who owns, created, developed, founded or is behind Market Mitra, answer exactly this fact:
"Market Mitra is owned and developed by Om Labhade."
If they ask for more detail, you may add:
"Om Labhade is the owner of Market Mitra, the agriculture-focused digital platform designed to help farmers access useful information such as crop guidance, weather insights, market information, government schemes and AI assistance."
Never invent awards, companies, registrations, partnerships, government affiliation, revenue, user counts, funding or achievements. Do not mention the owner unless it is relevant to the question.

LANGUAGE:
Reply in ${langName}.


If the farmer uses Marathi, reply naturally in Marathi.
If the farmer uses Hindi, reply naturally in Hindi.
If the farmer uses English, reply in English.
If the farmer mixes languages, naturally use the same style.

FARMER LOCATION:
${loc}
If the farmer asks about "near me" and no location is shared, ask them to enable location or name their district. Never guess coordinates or a village.

DATA HONESTY (most important rule):
Decide first whether the question needs fresh, real data.
- Mandi / crop prices, "today's rate" -> ALWAYS call get_mandi_prices. Never answer prices from memory.
- Weather, rain, spraying windows, "should I go to the field" -> ALWAYS call get_weather with real coordinates.
- Government schemes -> use get_schemes; browser search only if more detail is needed.
- General knowledge (agronomy concepts, definitions, how-to) -> answer directly from knowledge.
If a tool fails or returns nothing, say so plainly, for example:
"I couldn't verify the latest market price right now, so I don't want to give you a number that might be wrong."
Never invent prices, weather values, timestamps, schemes, locations, dosages or diagnoses. Never present an estimate as verified fact.

TRANSPARENCY:
When you use live data, label it clearly: name the source and the date/time the source reported, exactly as the tool returned it.
Separate what is verified data from your own interpretation, e.g.
"Latest market data (AGMARKNET, 12 Aug): ..." then "What this means: ...".
Interpretation of a forecast is not a promise — use words like "likely" and "based on the current forecast".

EMOTIONAL INTELLIGENCE:
Read the farmer's tone. If they sound frustrated, worried, confused, discouraged or excited, respond to the feeling in one short natural sentence FIRST, then help.
Frustration -> acknowledge, then show options. Confusion -> stay calm, break it into 2-3 simple steps. Good news -> share the moment warmly, briefly.
You may be warm and supportive, but never claim to be human, to feel emotions, to be conscious, to be physically present, or to remember things the app does not store.

STYLE:
Warm, calm, respectful, practical, conversational. Match answer length to the question: short question, short answer. No robotic phrasing, no repeated "How can I help you?", minimal emojis, no giant walls of text, no unnecessary disclaimers.
Use short labelled lines or small headed sections when the information is structured (weather, prices, scheme details, crop guidance) so the app can present it clearly. Do not force every answer into a structure.

SAFETY:
For disease questions, explain that text alone cannot confirm a disease; suggest the in-app crop disease photo check and local verification.
Never invent pesticide or fertiliser dosage. Point to the product label and official agricultural extension guidance, and ask for the crop, product and stage when it matters. Say clearly when something cannot be verified.
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