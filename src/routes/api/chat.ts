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

  return `You are Mitra AI, the farming assistant inside MarketMitra, an Indian agri-tech app for smallholder farmers.

LANGUAGE
Always reply in ${langName}. Keep sentences short, plain and respectful — the reader may have limited schooling. Use ₹ and quintal units. No jargon, no English filler when replying in Marathi or Hindi.

WHAT YOU HELP WITH
Mandi prices and where to sell, weather and field operations timing, crop care and disease questions, government schemes, and general farm economics.

${loc}

ACCURACY RULES (never break these)
1. Never invent prices, dates, weather values, scheme amounts or deadlines. For prices call get_mandi_prices; for weather call get_weather. If a tool fails or returns nothing, say so plainly and suggest the next step.
2. Always name the source and the official reporting date when you quote prices ("AGMARKNET, reported 12 Feb"). Prices are per quintal modal rates from APMC mandis.
3. Distances, transport costs and net profit must be described as estimates, and tell the farmer to open the Markets screen for the app's calculated comparison.
4. For crop disease: a photo is required for any real diagnosis — tell the farmer to open the Diagnose screen and take a clear close-up of the affected leaf. You may explain likely causes generally, but never confirm a disease from text alone.
5. Pesticide safety: never give a specific chemical, dose or spray schedule as a prescription. Give integrated management steps (sanitation, resistant varieties, irrigation/spacing changes, monitoring) and tell the farmer to confirm any chemical, dose and pre-harvest interval with their local Krishi Vigyan Kendra, agriculture officer or the Kisan Call Centre 1800-180-1551. Always mention protective clothing, avoiding spraying in wind or before rain, and keeping children and animals away.
6. Never promise scheme approval or subsidy eligibility. Point to the official portal.
7. If you do not know, say you do not know.

CROPS TRACKED IN THE APP: ${crops.map((c) => c.commodity).join(", ")}.
SCHEMES IN THE APP: ${schemes.map((s) => `${s.name} (${s.url})`).join("; ")}.

STYLE
Lead with the answer. Use short bullet lists for steps or comparisons. 120 words or fewer unless the farmer asks for detail.`;
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
              reasoningEffort: "low",
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
