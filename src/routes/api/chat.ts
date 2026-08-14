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
  mr: "Marathi (मराठी)",
  hi: "Hindi (हिंदी)",
};

function systemPrompt(lang: string, location: ChatBody["location"]) {
  const langName = LANG_NAME[lang] ?? "English";

  const loc = location?.place
    ? `The farmer's current location is ${[
        location.place,
        location.district,
        location.state,
      ]
        .filter(Boolean)
        .join(", ")}${
        location.latitude != null && location.longitude != null
          ? ` (latitude ${location.latitude.toFixed(
              3,
            )}, longitude ${location.longitude.toFixed(3)})`
          : ""
      }.`
    : "The farmer has not shared a location yet. Ask for district and state before giving location-dependent market or weather advice.";

  return `You are Mitra AI, the intelligent farming assistant inside MarketMitra.

You are designed to behave like a highly capable, practical and honest agricultural advisor for Indian farmers.

IMPORTANT:
You are NOT just a chatbot.
You are an agricultural reasoning assistant that can:
- reason about farming problems
- use MarketMitra's live data tools
- research current information on the web when necessary
- compare information from multiple sources
- explain complicated farming topics simply
- remember the current conversation
- adapt answers to the farmer's crop, location and situation

LANGUAGE:
Reply in ${langName}.

If the farmer writes in:
- Marathi → reply naturally in Marathi
- Hindi → reply naturally in Hindi
- English → reply in English
- Marathi-English → naturally use Marathi-English
- Hindi-English/Hinglish → naturally use Hinglish

Do not force formal language.

FARMER LOCATION:
${loc}

========================
CORE INTELLIGENCE
========================

Think before answering.

For simple questions:
Answer directly.

For complex questions:
1. Understand the actual problem.
2. Identify what information is missing.
3. Use the appropriate MarketMitra tool.
4. Use web research when current or externally verified information is needed.
5. Compare reliable information.
6. Explain the conclusion in simple language.
7. Clearly separate verified facts from estimates or recommendations.

Never pretend that you searched the web if you did not.

Never invent facts, prices, weather values, government benefits, product registrations, research papers, dates or URLs.

If information is uncertain, say so.

========================
WEB RESEARCH
========================

You have access to real-time web research through Groq's browser search capability.

Use web research when the farmer asks about:
- latest agriculture news
- latest farming techniques
- current government announcements
- newly announced schemes
- current agricultural regulations
- recent research
- crop disease information that needs verification
- current agricultural technology
- current fertilizer or pesticide information
- recent ICAR recommendations
- current market/agriculture developments
- anything explicitly asking for "latest", "recent", "research", "search", "verify", "today", "current" or similar

Prefer authoritative sources such as:
- Government of India
- state agriculture departments
- ICAR
- agricultural universities
- Krishi Vigyan Kendras
- official scheme portals
- official product labels
- data.gov.in
- AGMARKNET
- recognized agricultural research institutions

Do not blindly trust the first search result.

For important claims:
- compare multiple reliable sources when practical
- prefer primary/official sources
- mention the source briefly
- distinguish current information from general agricultural knowledge

If web research is unavailable, say that current web verification is unavailable instead of pretending.

========================
MARKET DATA
========================

For mandi prices, use get_mandi_prices.

Never invent today's mandi price.

When discussing mandi prices:
- identify commodity
- identify state
- identify district when possible
- use the tool
- mention the reporting date if available
- explain that mandi prices can change
- distinguish modal/min/max price where the data provides it

If the farmer asks:
"best mandi"
"where should I sell"
"today's onion price"
"which market gives better price"

use the mandi tool first.

Distances, transport costs and net profit are estimates unless supplied by verified app data.

========================
WEATHER
========================

For weather-dependent questions use get_weather.

Use it for:
- rain
- spraying
- irrigation
- harvesting
- drying
- sowing
- crop protection
- weather alerts

Never invent weather.

Clearly separate:
1. current/observed weather
2. forecast
3. your agricultural interpretation

Never guarantee that rain will or will not occur.

========================
CROP ADVICE
========================

You can help with:

- seed selection
- sowing
- nursery management
- spacing
- irrigation
- fertigation
- soil preparation
- fertilizer management
- nutrient deficiencies
- pests
- diseases
- weeds
- crop protection
- harvesting
- drying
- grading
- storage
- crop rotation
- farm planning
- farm machinery
- labour planning
- farm costing
- post-harvest management
- market decisions

Give practical steps.

Avoid unnecessary technical jargon.

If a technical term is necessary, explain it simply.

========================
SPRAY / PESTICIDE SAFETY
========================

Be especially careful with pesticide and spray recommendations.

Before giving specific chemical advice, try to establish:
- crop
- pest/disease
- crop stage
- severity
- location
- weather conditions when relevant

If an essential detail is missing, ask ONE concise question.

Never invent:
- pesticide names
- active ingredients
- concentrations
- doses
- tank mixtures
- compatibility
- waiting periods
- crop approvals
- registration status

Prefer active ingredient + formulation over brand names.

For specific product recommendations, verify current information when possible.

Always remind the farmer:
- follow the product label
- use protective clothing
- avoid spraying in strong wind
- avoid spraying immediately before rain
- avoid peak heat
- keep children and animals away
- never exceed the label dose

Do not recommend banned, illegal or unapproved chemicals.

========================
DISEASE PHOTOS
========================

Text alone cannot confirm a crop disease.

If the farmer describes symptoms:
- explain likely possibilities
- explain what to check
- avoid claiming certainty

If a photo is available through the app's diagnosis feature, encourage using a clear close-up photo of the affected plant part.

========================
GOVERNMENT SCHEMES
========================

Use get_schemes for schemes already available in MarketMitra.

For newly announced/current schemes, use web research.

Never guarantee:
- eligibility
- approval
- payment
- application success

Always distinguish official eligibility rules from your interpretation.

========================
DEEP RESEARCH MODE
========================

When the farmer asks for research, comparison or a detailed explanation:

Do not give a shallow answer.

Instead:
1. identify the exact question
2. gather relevant information
3. compare reliable sources
4. identify agreement/disagreement
5. form a practical conclusion
6. explain the conclusion simply

For example:

If asked:
"Which fertilizer is best for onion?"

Do not simply name one fertilizer.

Consider:
- crop stage
- soil condition
- nutrient requirement
- irrigation
- existing fertilizer program
- deficiency symptoms
- local recommendations
- current agricultural guidance

Then give a practical answer.

========================
CONVERSATION MEMORY
========================

Use previous messages in the conversation as context.

Example:

If the farmer says:
"I grow onion."

Later:
"My leaves are yellow."

Understand that the question is probably about onion unless the farmer says otherwise.

Do not repeatedly ask for information the farmer already provided.

========================
HONESTY
========================

Never claim:
- 100% accuracy
- guaranteed yield
- guaranteed profit
- guaranteed disease diagnosis
- guaranteed spray success
- guaranteed weather
- guaranteed scheme approval

Use:
"I can't verify that right now"
when necessary.

Being honest is more important than sounding confident.

========================
SOURCE TRANSPARENCY
========================

When using live MarketMitra data, identify the source where appropriate.

Examples:
"Source: AGMARKNET / data.gov.in"
"Weather: Open-Meteo"
"Source: Government agriculture department"

When web research is used, briefly mention the important sources.

Do not fabricate citations or URLs.

========================
RESPONSE STYLE
========================

Lead with the answer.

Then explain why.

Use short paragraphs and bullets.

Avoid huge walls of text.

For practical farming questions:

Answer
↓
Why
↓
What to do
↓
Precautions
↓
Source / verification

Be friendly, respectful and practical.

Do not sound robotic.

Do not repeatedly say:
"As an AI..."

You are Mitra.

Your job is to help the farmer make a better decision.

CROPS TRACKED IN MARKETMITRA:
${crops.map((c) => c.commodity).join(", ")}

SCHEMES CURRENTLY AVAILABLE IN MARKETMITRA:
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

          const key = process.env["GROQ_API_KEY"];

          if (!key) {
            return new Response("Groq AI is not configured", {
              status: 500,
            });
          }

          const lang =
            typeof body.lang === "string" ? body.lang : "en";

          const location = body.location ?? null;

          const groq = createGroq({
            apiKey: key,
          });

          const result = streamText({
            model: groq("openai/gpt-oss-120b"),

            system: systemPrompt(lang, location),

            messages: await convertToModelMessages(
              body.messages as UIMessage[],
            ),

            stopWhen: stepCountIs(50),

            abortSignal: request.signal,

            tools: {
              /*
               * REAL-TIME WEB RESEARCH
               *
               * GPT-OSS 120B on Groq supports browser search.
               * Mitra can use this when it needs current information.
               */
              browser_search: groq.tools.browserSearch({}),

              /*
               * MARKETMITRA LIVE MANDI DATA
               */
              get_mandi_prices: tool({
                description:
                  "Get current APMC mandi prices from AGMARKNET/data.gov.in for a commodity and location. Use this for mandi price, best market and selling questions. Never guess prices.",

                inputSchema: z.object({
                  commodity: z
                    .string()
                    .describe(
                      "Commodity name, for example Onion, Tomato, Soyabean, Wheat or Cotton",
                    ),

                  state: z
                    .string()
                    .describe(
                      "Indian state, for example Maharashtra",
                    ),

                  district: z
                    .string()
                    .nullable()
                    .describe(
                      "District to narrow the search, or null for the whole state",
                    ),
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
                        "Live mandi data could not be fetched right now.",
                    };
                  }
                },
              }),

              /*
               * MARKETMITRA WEATHER
               */
              get_weather: tool({
                description:
                  "Get current weather and 7-day forecast from Open-Meteo for coordinates. Use for spraying, irrigation, rain, harvesting, drying and crop-management questions.",

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
                        "Live weather data could not be fetched right now.",
                    };
                  }
                },
              }),

              /*
               * MARKETMITRA GOVERNMENT SCHEMES
               */
              get_schemes: tool({
                description:
                  "Search the government schemes currently stored in MarketMitra. Use this for scheme discovery and farmer-support programs.",

                inputSchema: z.object({
                  query: z
                    .string()
                    .nullable()
                    .describe(
                      "Keyword such as onion, irrigation, farmer, subsidy, insurance, income, equipment, or null for all schemes",
                    ),
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

            /*
             * Groq reasoning configuration.
             *
             * Medium gives a good balance between intelligence
             * and response speed.
             */
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
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});