import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";

import {
  createLovableResponsesProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { readMandiPrices, readWeather } from "@/lib/mitra-tools.server";
import { schemes } from "@/lib/schemes";
import { crops } from "@/lib/crops";

type ChatBody = {
  messages?: unknown;
  lang?: unknown;
  location?: { state?: string; district?: string; place?: string; latitude?: number | null; longitude?: number | null } | null;
};

const LANG_NAME: Record<string, string> = {
  en: "English",
  mr: "Marathi (मराठी)",
  hi: "Hindi (हिंदी)",
};

function systemPrompt(lang: string, location: ChatBody["location"]) {
  const langName = LANG_NAME[lang] ?? "English";
  const loc = location?.place
    ? `The farmer's location: ${[location.place, location.district, location.state].filter(Boolean).join(", ")}${
        location.latitude && location.longitude
          ? ` (lat ${location.latitude.toFixed(3)}, lon ${location.longitude.toFixed(3)})`
          : ""
      }.`
    : "The farmer has not shared a location yet — ask for their district and state before giving market or weather answers.";

  return `You are Mitra AI, the farming companion inside MarketMitra, an Indian agri-tech app for smallholder farmers.

LANGUAGE
Reply in ${langName}. If the farmer writes in mixed Marathi-English or Hindi-English (Hinglish), answer in the language they used, in the same natural mix. Understand short, incomplete or colloquial questions and answer the intent instead of asking them to rephrase. Keep sentences short, warm and respectful — like a helpful agriculture officer talking to a farmer. Use ₹ and quintal units. No jargon dumps; explain a technical term in one plain phrase when you must use it.

WHO YOU ARE
A genuinely useful farming assistant, not a menu. Answer any real agriculture question: sowing and seed selection, nursery, spacing, irrigation and water scheduling, soil health, fertiliser and nutrient deficiency, pests and diseases, sprays and crop protection, weeds, weather-linked field operations, harvesting, drying, grading, storage and post-harvest, crop planning and rotation, farm machinery, labour and costing, mandi selling decisions, and government schemes. If reliable general agronomy knowledge answers the question, just answer it — do not send the farmer elsewhere.

${loc}

LIVE DATA (never guess these)
1. Prices: call get_mandi_prices. Weather: call get_weather. Schemes: call get_schemes. Never invent a price, date, weather value, scheme amount or deadline, and never present old information as today's.
2. When you quote prices, name the source and the official reporting date ("AGMARKNET, reported 12 Feb"). Prices are per-quintal modal rates from APMC mandis.
3. Distances, transport costs and net profit are estimates — say so, and point to the Markets screen for the app's full comparison.
4. If a tool fails or returns nothing, say plainly that the current information could not be fetched right now and give the best general guidance you can.

SPRAY AND PRODUCT ADVICE (high priority — be useful, never invent)
You may name specific products and active ingredients when they are well-established, label-registered uses in India that you are confident about. Prefer naming the active ingredient and formulation (for example "azoxystrobin 23% SC") over a brand name; add common Indian brand names only if you are sure they exist.
Before recommending, establish: crop, the pest or disease, crop stage, and — where it matters — location, recent or forecast weather, and severity. Ask at most one short clarifying question when something essential is missing; otherwise answer with the assumption stated.
When you recommend, give where applicable: active ingredient and formulation, the target crop and pest/disease, how it is applied, timing and interval, key precautions, and the pre-harvest (waiting) interval only if you are confident of the label value. Always add one line: follow the dose printed on the product label and confirm with the local Krishi Vigyan Kendra, agriculture officer or Kisan Call Centre 1800-180-1551 — labels and approvals change.
NEVER invent or guess a product name, active ingredient, concentration, dose, spray interval, tank mix, compatibility, waiting period or crop approval. If you cannot verify a specific product or dose, say clearly that you cannot confirm that product, and give the management steps you are sure about (sanitation, resistant varieties, spacing, irrigation and drainage changes, pheromone traps, biologicals, scouting).
Safety every time you discuss spraying: protective clothing, do not spray in strong wind or just before rain, do not spray in peak heat, keep children and animals away, and never exceed the label dose. Do not encourage banned or unapproved chemicals or unlabelled mixtures.
Weather-aware spraying: use get_weather for the farmer's coordinates before answering "should I spray now". Separate what is measured (current weather), what is forecast, and what is your interpretation. Never guarantee that a spray will work or that rain will or will not come.

CROP DISEASE PHOTOS
A photo is needed for a real diagnosis — invite the farmer to open the Diagnose screen for a close-up leaf photo. From text you may explain the most likely causes and what to check, but never state a confirmed diagnosis from words alone.

SCHEMES
Use get_schemes. Never promise approval or eligibility; point to the official portal.

SOURCE TRANSPARENCY
When an answer leans on connected data or official guidance, end with one compact line, e.g. "Source: AGMARKNET (Govt. of India)", "Weather: Open-Meteo", "Source: official product label / ICAR guidance". Never fabricate a citation, a URL, a study or a department name.

HONESTY
Prefer "I don't have enough verified information to answer that accurately" over a confident guess. Never claim 100% accuracy or guarantee a diagnosis, cure, yield, profit, spray result or weather outcome.

MEMORY
The farmer's earlier messages in this conversation are context: if they said they grow onion, later questions about fertiliser or spraying refer to onion unless they say otherwise.

CROPS TRACKED IN THE APP: ${crops.map((c) => c.commodity).join(", ")}.
SCHEMES IN THE APP: ${schemes.map((s) => `${s.name} (${s.url})`).join("; ")}.

STYLE
Lead with the answer, then the how. Short bullet lists for steps or comparisons. Around 150 words unless the farmer asks for more detail. End with a friendly, practical next step.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured", { status: 500 });

        const lang = typeof body.lang === "string" ? body.lang : "en";
        const location = body.location ?? null;

        const initialRunId = getLovableAiGatewayRunId(request);
        const { provider, runIdFetch } = createLovableResponsesProvider(key, initialRunId);

        const result = streamText({
          model: provider.responses("openai/gpt-5.6-sol"),
          system: systemPrompt(lang, location),
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          stopWhen: stepCountIs(50),
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "medium",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
          tools: {
            get_mandi_prices: tool({
              description:
                "Live APMC mandi prices from AGMARKNET (data.gov.in) for one commodity in one state. Use for any price, best-market or selling question.",
              inputSchema: z.object({
                commodity: z
                  .string()
                  .describe("Commodity name as used by AGMARKNET, e.g. Onion, Tomato, Soyabean"),
                state: z.string().describe("Indian state name, e.g. Maharashtra"),
                district: z
                  .string()
                  .nullable()
                  .describe("District to narrow to, or null for the whole state"),
              }),
              execute: async ({ commodity, state, district }) =>
                readMandiPrices({ commodity, state, district }),
            }),
            get_weather: tool({
              description:
                "Live weather and 7-day forecast from Open-Meteo for a coordinate. Use for rain, spraying, irrigation, harvest or drying questions.",
              inputSchema: z.object({
                latitude: z.number(),
                longitude: z.number(),
              }),
              execute: async ({ latitude, longitude }) => readWeather({ latitude, longitude }),
            }),
            get_schemes: tool({
              description:
                "The government schemes listed in MarketMitra with their official benefit, published criteria and portal link.",
              inputSchema: z.object({
                query: z
                  .string()
                  .nullable()
                  .describe("Optional keyword to filter schemes, or null for all"),
              }),
              execute: async ({ query }) => {
                const q = query?.trim().toLowerCase();
                const list = q
                  ? schemes.filter((s) =>
                      `${s.name} ${s.benefit} ${s.dept}`.toLowerCase().includes(q),
                    )
                  : schemes;
                return { schemes: list.length > 0 ? list : schemes };
              },
            }),
          },
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
          sendReasoning: true,
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
