import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { schemes } from "@/lib/schemes";

export type AdminSeries = { day: string; count: number }[];
export type AdminCount = { key: string; count: number }[];

export type AdminOperations = {
  generatedAt: string;
  mitraAi: {
    conversations: number;
    messages: number;
    userMessages: number;
    uniqueUsers: number;
    errors: number;
    averageMessagesPerConversation: number | null;
    categories: { key: string; count: number }[];
  };
  diagnose: {
    total: number;
    recent: { id: string; createdAt: string; status: string | null }[];
  };
  mitraLink: {
    listings: number;
    requests: number;
    matches: number;
  };
};

export type AdminScheme = {
  id: string;
  name: string;
  description: string;
  benefit: string;
  eligibility: string[];
  applicationUrl: string | null;
  source: string | null;
  lastUpdated: string | null;
  status: "active";
  level: "Central" | "State";
  category: string;
};

export type AdminFeedback = {
  id: string;
  userId: string | null;
  category: "feedback" | "bug_report";
  subject: string;
  message: string;
  status: "new" | "in_review" | "resolved";
  createdAt: string;
};

export type ServiceHealth = {
  name: string;
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  detail: string;
};

export type AdminOverview = {
  generatedAt: string;
  tracking: {
    since: string;
    totalEvents: number;
    sessions: number;
    sessions24h: number;
    pageViews: number;
    eventsByType: AdminCount;
    topPages: AdminCount;
    topCrops: AdminCount;
    devices: AdminCount;
    languages: AdminCount;
    daily: AdminSeries;
    recent: {
      event: string;
      page: string | null;
      label: string | null;
      at: string;
    }[];
    features: {
      marketSearches: number;
      weatherLookups: number;
      diagnoseStarted: number;
      diagnoseCompleted: number;
      diagnoseFailed: number;
      mitraConversations: number;
      mitraMessages: number;
      mitraErrors: number;
      schemeViews: number;
    };

  };
  users: {
    registered: number;
    activeToday: number;
    activeWeek: number;
    newToday: number;
    newWeek: number;
    conversations: number;
    conversationsToday: number;
    messages: number;
    messagesToday: number;
    diagnoses: number;
    diagnosesToday: number;
  };
};

export type AdminMarketData = {
  source: string;
  ok: boolean;
  statusCode: number | null;
  records: number | null;
  latestArrivalDate: string | null;
  sourceUpdatedAt: string | null;
  detail: string;
};

export type AdminHealth = {
  generatedAt: string;
  services: ServiceHealth[];
  marketData: AdminMarketData;
};

export type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string;
  district: string | null;
  state: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  profile_complete: boolean;
  conversation_count: number;
  diagnosis_count: number;
};

export type AdminUserPage = {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminRegistrationDay = { day: string; count: number };

export const getAdminRegistrationTrend = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ days: z.number().int().min(7).max(365).default(30) }).parse(input))
  .handler(async ({ data, context }): Promise<{ trend: AdminRegistrationDay[]; source: "auth.users" }> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const users: { created_at: string }[] = [];
    let page = 1;

    while (page <= 100) {
      const result = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (result.error) throw new Error(`Could not load registration history: ${result.error.message}`);
      users.push(...result.data.users.map((user) => ({ created_at: user.created_at })));
      const received = result.data.users.length;
      const lastPage = result.data.lastPage ?? (received === 1000 ? page + 1 : page);
      if (page >= lastPage || received === 0) break;
      page += 1;
    }

    const cutoff = new Date();
    cutoff.setUTCHours(0, 0, 0, 0);
    cutoff.setUTCDate(cutoff.getUTCDate() - (data.days - 1));
    const counts = new Map<string, number>();
    for (const user of users) {
      const created = new Date(user.created_at);
      if (created < cutoff) continue;
      const day = created.toISOString().slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    const trend: AdminRegistrationDay[] = [];
    for (let offset = 0; offset < data.days; offset += 1) {
      const dayDate = new Date(cutoff);
      dayDate.setUTCDate(dayDate.getUTCDate() + offset);
      const day = dayDate.toISOString().slice(0, 10);
      trend.push({ day, count: counts.get(day) ?? 0 });
    }
    return { trend, source: "auth.users" };
  });

export type AdminUserDetail = {
  profile: {
    userId: string;
    email: string | null;
    fullName: string;
    district: string | null;
    state: string | null;
    language: string | null;
    role: string;
    createdAt: string;
    lastSignInAt: string | null;
    updatedAt: string | null;
  };
  conversations: { id: string; createdAt: string; updatedAt: string }[];
  diagnoses: {
    id: string;
    crop: string | null;
    condition: string | null;
    provider: string | null;
    usable: boolean;
    createdAt: string;
  }[];
  errors: {
    id: string;
    service: string;
    severity: string;
    errorType: string;
    message: string;
    resolvedAt: string | null;
    createdAt: string;
  }[];
};

export type AdminNotice = {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "maintenance";
  enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

async function assertAdmin(
  supabase: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  },
  userId: string,
) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (error || data !== true) {
    throw new Error("Forbidden");
  }
}

function bucket(rows: { key: string | null }[], limit = 8): AdminCount {
  const map = new Map<string, number>();

  for (const row of rows) {
    const key = row.key?.trim();

    if (!key) continue;

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function probe(
  name: string,
  url: string,
  detailOk: string,
  headers?: HeadersInit,
): Promise<ServiceHealth> {
  const started = Date.now();

  try {
    const res = await fetch(url, {
      ...(headers ? { headers } : {}),
      signal: AbortSignal.timeout(8000),
    });

    return {
      name,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      detail: res.ok ? detailOk : `Upstream responded ${res.status}`,
    };
  } catch {
    return {
      name,
      ok: false,
      status: null,
      latencyMs: Date.now() - started,
      detail: "Request failed or timed out",
    };
  }
}

async function checkMarketData(): Promise<{ service: ServiceHealth; data: AdminMarketData }> {
  const { probeAgmarknet } = await import("./market-providers.server");
  const result = await probeAgmarknet();
  return {
    service: {
      name: "AGMARKNET market data",
      ok: result.ok,
      status: result.statusCode,
      latencyMs: result.latencyMs,
      detail: result.ok ? "Government market data reachable" : result.detail,
    },
    data: {
      source: "AGMARKNET · data.gov.in",
      ok: result.ok,
      statusCode: result.statusCode,
      records: result.records,
      latestArrivalDate: result.latestArrivalDate,
      sourceUpdatedAt: result.sourceUpdatedAt,
      detail: result.detail,
    },
  };
}

/**
 * Check whether the signed-in user is an administrator.
 */
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    return {
      admin: data === true,
    };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context.supabase as never, context.userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const [{ data: events, error: eventsError }, { data: userMetrics, error: usersError }] =
      await Promise.all([
        supabaseAdmin
          .from("analytics_events")
          .select("event,page,label,device,lang,session_id,created_at")
          .gte("created_at", since.toISOString())
          .order("created_at", {
            ascending: false,
          })
          .limit(20000),

        (
          context.supabase.rpc as unknown as (
            name: string,
          ) => Promise<{ data: Array<Record<string, number>> | null; error: { message: string } | null }>
        )("admin_user_metrics"),
      ]);

    if (eventsError) {
      throw new Error(`Failed to load analytics events: ${eventsError.message}`);
    }
    if (usersError) {
      throw new Error(`Failed to load registered user metrics: ${usersError.message}`);
    }
    const metrics = userMetrics?.[0];
    if (!metrics) {
      throw new Error("Failed to load registered user metrics: no result returned.");
    }

    const rows = events ?? [];

    const dayMap = new Map<string, number>();

    for (const r of rows) {
      const day = (r.created_at ?? "").slice(0, 10);

      if (day) {
        dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      }
    }

    const daily = [...dayMap.entries()]
      .map(([day, count]) => ({
        day,
        count,
      }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const cutoff = Date.now() - 24 * 3600 * 1000;

    const countOf = (event: string) => rows.filter((r) => r.event === event).length;

    /*
     * Upstream health probes intentionally live in getAdminHealth() so this
     * dashboard query paints instantly instead of waiting on third parties.
     */

    /*
     * ---------------------------------------------------------
     * FINAL ADMIN OVERVIEW
     * ---------------------------------------------------------
     */

    return {
      generatedAt: new Date().toISOString(),

      tracking: {
        since: since.toISOString(),

        totalEvents: rows.length,

        sessions: new Set(rows.map((r) => r.session_id).filter(Boolean)).size,

        sessions24h: new Set(
          rows
            .filter((r) => new Date(r.created_at ?? 0).getTime() >= cutoff)
            .map((r) => r.session_id)
            .filter(Boolean),
        ).size,

        pageViews: countOf("page_view"),

        eventsByType: bucket(
          rows.map((r) => ({
            key: r.event,
          })),
          14,
        ),

        topPages: bucket(
          rows
            .filter((r) => r.event === "page_view")
            .map((r) => ({
              key: r.page,
            })),
        ),

        topCrops: bucket(
          rows
            .filter((r) => r.event === "crop_selected")
            .map((r) => ({
              key: r.label,
            })),
        ),

        devices: bucket(
          rows.map((r) => ({
            key: r.device,
          })),
          6,
        ),

        languages: bucket(
          rows.map((r) => ({
            key: r.lang,
          })),
          6,
        ),

        daily,

        recent: rows.slice(0, 25).map((r) => ({
          event: r.event,
          page: r.page ?? null,
          label: r.label ?? null,
          at: r.created_at,
        })),

        features: {
          marketSearches: countOf("market_search"),

          weatherLookups: countOf("weather_lookup"),

          diagnoseStarted: countOf("diagnose_started"),

          diagnoseCompleted: countOf("diagnose_completed"),

          diagnoseFailed: countOf("diagnose_failed"),

          mitraConversations: countOf("mitra_ai_opened"),

          mitraMessages: countOf("mitra_ai_message"),

          mitraErrors: countOf("mitra_ai_error"),

          schemeViews: countOf("scheme_viewed"),
        },
      },

      users: {
        registered: metrics["registered"] ?? 0,
        activeToday: metrics["active_today"] ?? 0,
        activeWeek: metrics["active_week"] ?? 0,
        newToday: metrics["new_today"] ?? 0,
        newWeek: metrics["new_week"] ?? 0,
        conversations: metrics["conversations_total"] ?? 0,
        conversationsToday: metrics["conversations_today"] ?? 0,
        messages: metrics["messages_total"] ?? 0,
        messagesToday: metrics["messages_today"] ?? 0,
        diagnoses: metrics["diagnoses_total"] ?? 0,
        diagnosesToday: metrics["diagnoses_today"] ?? 0,
      },
    };
  });

export const getAdminOperations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOperations> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [
      { data: conversations, count: conversationCountResult, error: conversationsError },
      { data: messages, count: messageCountResult, error: messagesError },
      { data: diagnoses, count: diagnosesCount, error: diagnosesError },
      { count: listingsCount, error: listingsError },
      { count: requestsCount, error: requestsError },
      { count: matchesCount, error: matchesError },
    ] = await Promise.all([
      supabaseAdmin
        .from("chat_conversations")
        .select("id,user_id,created_at", { count: "exact" }),
      supabaseAdmin
        .from("chat_messages")
        .select("conversation_id,role,content,metadata,created_at", { count: "exact" }),
      supabaseAdmin
        .from("crop_diagnoses")
        .select("id,usable,provider,created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(25),
      supabaseAdmin.from("link_listings").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("link_requests").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("link_matches").select("id", { count: "exact", head: true }),
    ]);

    const firstError = [
      conversationsError,
      messagesError,
      diagnosesError,
      listingsError,
      requestsError,
      matchesError,
    ].find(Boolean);
    if (firstError) {
      throw new Error(`Could not load operational records: ${firstError.message}`);
    }

    const chatMessages = messages ?? [];
    const userMessages = chatMessages.filter((message) => message.role === "user");
    const conversationCount = conversationCountResult ?? conversations?.length ?? 0;
    const messageCount = messageCountResult ?? chatMessages.length;
    const categoryCounts = new Map<string, number>();

    for (const message of userMessages) {
      const category = classifyMitraQuestion(message.content ?? "");
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }

    const categories = [...categoryCounts.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
    const uniqueConversationCount = new Set(chatMessages.map((message) => message.conversation_id).filter(Boolean)).size;

    return {
      generatedAt: new Date().toISOString(),
      mitraAi: {
        conversations: conversationCount,
        messages: messageCount,
        userMessages: userMessages.length,
        uniqueUsers: new Set((conversations ?? []).map((conversation) => conversation.user_id).filter(Boolean)).size,
        errors: chatMessages.filter((message) => {
          const metadata = message.metadata as { status?: string; error?: boolean } | null;
          return metadata?.status === "error" || metadata?.error === true;
        }).length,
        averageMessagesPerConversation:
          uniqueConversationCount > 0 ? Number((messageCount / uniqueConversationCount).toFixed(2)) : null,
        categories,
      },
      diagnose: {
        total: diagnosesCount ?? 0,
        recent: (diagnoses ?? []).map((diagnosis) => ({
          id: diagnosis.id,
          createdAt: diagnosis.created_at,
          status: diagnosis.usable === true ? "usable" : diagnosis.usable === false ? "unusable" : "unknown",
        })),
      },
      mitraLink: {
        listings: listingsCount ?? 0,
        requests: requestsCount ?? 0,
        matches: matchesCount ?? 0,
      },
    };
  });

function classifyMitraQuestion(content: string): string {
  const text = content.toLowerCase();
  if (/disease|diseased|fungus|blight|leaf spot|yellow|spots?/i.test(text)) return "Crop disease";
  if (/fertiliz|urea|npk|manure|nutrient/i.test(text)) return "Fertilizer";
  if (/irrigat|water|drip|rainfall/i.test(text)) return "Irrigation";
  if (/weather|temperature|humidity|forecast/i.test(text)) return "Weather";
  if (/market|price|mandi|sell/i.test(text)) return "Market prices";
  if (/scheme|subsidy|government|grant/i.test(text)) return "Government schemes";
  return "General farming";
}

export const getAdminSchemes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ source: string; schemes: AdminScheme[] }> => {
    await assertAdmin(context.supabase as never, context.userId);

    return {
      source: "Verified static catalogue used by the farmer-facing Government Schemes page",
      schemes: schemes.map((scheme) => ({
        id: scheme.id,
        name: scheme.name,
        description: scheme.overview ?? scheme.benefit,
        benefit: scheme.benefit,
        eligibility: scheme.criteria,
        applicationUrl: scheme.url ?? scheme.sourceUrl ?? null,
        source: scheme.sourceName ?? scheme.dept,
        lastUpdated: scheme.lastVerified ?? null,
        status: "active",
        level: scheme.level,
        category: scheme.category,
      })),
    };
  });

export const getAdminFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminFeedback[]> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const untypedAdminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const { data, error } = await adminDb
      .from("user_feedback" as never)
      .select("id,user_id,category,subject,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(`Could not load feedback: ${error.message}`);
    return ((data ?? []) as unknown as Array<{ id: string; user_id: string | null; category: "feedback" | "bug_report"; subject: string; message: string; status: "new" | "in_review" | "resolved"; created_at: string }>).map((item) => ({
      id: item.id,
      userId: item.user_id,
      category: item.category,
      subject: item.subject,
      message: item.message,
      status: item.status,
      createdAt: item.created_at,
    }));
  });

export const updateAdminFeedbackStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "in_review", "resolved"]),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_feedback" as never)
      .update({ status: data.status, updated_at: new Date().toISOString() } as never)
      .eq("id", data.id);
    if (error) throw new Error(`Could not update feedback: ${error.message}`);
    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: context.userId,
      action: "feedback_status_updated",
      detail: {
      feedbackId: data.id,
      status: data.status,
      },
    });
    return { ok: true };
  });

export const submitUserFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({
      category: z.enum(["feedback", "bug_report"]),
      subject: z.string().trim().min(1).max(160),
      message: z.string().trim().min(1).max(4000),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("user_feedback" as never).insert({
      user_id: context.userId,
      category: data.category,
      subject: data.subject,
      message: data.message,
      status: "new",
    } as never);
    if (error) throw new Error("Could not submit feedback.");
    return { ok: true };
  });

/**
 * Upstream service + government dataset health.
 * Kept separate from the overview so slow third parties never block the
 * admin dashboard from rendering its own data.
 */
export const getAdminHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminHealth> => {
    await assertAdmin(context.supabase as never, context.userId);

    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=19.99&longitude=73.79&current=temperature_2m&timezone=Asia%2FKolkata";

    const groqApiKey = process.env["GROQ_API_KEY"];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [weather, aiProvider, marketCheck, database] = await Promise.all([
      probe("Open-Meteo weather", weatherUrl, "Weather provider reachable"),

      groqApiKey
        ? probe("Groq AI provider", "https://api.groq.com/openai/v1/models", "Groq API reachable", {
            authorization: `Bearer ${groqApiKey}`,
          })
        : Promise.resolve<ServiceHealth>({
            name: "Groq AI provider",
            ok: false,
            status: null,
            latencyMs: null,
            detail: "GROQ_API_KEY is not configured",
          }),

      checkMarketData(),

      (async (): Promise<ServiceHealth> => {
        const started = Date.now();
        try {
          const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
          return {
            name: "Supabase database",
            ok: !error,
            status: error ? null : 200,
            latencyMs: Date.now() - started,
            detail: error
              ? `Database read failed: ${error.message}`
              : "Read-only database check succeeded",
          };
        } catch {
          return {
            name: "Supabase database",
            ok: false,
            status: null,
            latencyMs: Date.now() - started,
            detail: "Database check failed",
          };
        }
      })(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      services: [
        weather,
        aiProvider,
        database,
        {
          name: "Supabase authentication",
          ok: true,
          status: 200,
          latencyMs: null,
          detail: "The signed-in administrator token was validated for this request",
        },
        marketCheck.service,
      ],
      marketData: marketCheck.data,
    };
  });

/**
 * Get admin feature switches.
 */
export const getAdminFeatureFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);

    const { data, error } = await context.supabase
      .from("feature_flags")
      .select("key,label,enabled,status,reason,maintenance_message,updated_at,updated_by")
      .order("label");

    if (error) {
      throw new Error(`Could not load feature switches: ${error.message}`);
    }

    return data ?? [];
  });

/**
 * Enable / disable a feature.
 */
export const setFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(64),
        enabled: z.boolean(),
        message: z.string().max(400).nullable().optional(),
        reason: z.string().max(120).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);

    const { data: updatedFlag, error } = await context.supabase
      .from("feature_flags")
      .update({
        enabled: data.enabled,
        status: data.enabled ? "operational" : "maintenance",
        reason: data.enabled ? null : (data.reason ?? null),
        maintenance_message: data.enabled ? null : (data.message ?? null),
        updated_by: context.userId,
      })
      .eq("key", data.key)
      .select("key")
      .maybeSingle();

    if (error) {
      throw new Error(`Could not update the feature switch: ${error.message}`);
    }
    if (!updatedFlag) {
      throw new Error("The requested feature switch does not exist.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: auditError } = await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: context.userId,
      action: data.enabled ? "feature_enabled" : "feature_disabled",
      detail: {
        key: data.key,
        reason: data.reason ?? null,
        message: data.message ?? null,
        result: "success",
      } as never,
    });

    if (auditError) {
      throw new Error(`Feature switch updated, but audit logging failed: ${auditError.message}`);
    }

    return {
      ok: true,
    };
  });

/**
 * Get recent admin activity.
 */
export const getAdminAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);

    const { data, error } = await context.supabase
      .from("admin_audit_log")
      .select("id,admin_id,action,detail,created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(30);

    if (error) {
      throw new Error(`Could not load the admin audit log: ${error.message}`);
    }

    return data ?? [];
  });

export const getAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      search: z.string().trim().max(120).default(""),
      sort: z.enum(["created_at", "name", "email"]).default("created_at"),
      ascending: z.boolean().default(false),
      role: z.enum(["all", "admin", "user"]).default("all"),
      page: z.number().int().min(1).max(1_000_000).default(1),
      pageSize: z.number().int().min(10).max(100).default(25),
    }),
  )
  .handler(async ({ data, context }): Promise<AdminUserPage> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data: rows, error } = await context.supabase.rpc("admin_list_users", {
      _search: data.search,
      _sort: data.sort,
      _ascending: data.ascending,
      _page: data.page,
      _page_size: data.pageSize,
      _role: data.role,
    });

    if (error) {
      throw new Error(`Could not load registered users: ${error.message}`);
    }

    const users = (rows ?? []).map(({ total_count: _total, ...user }) => user);
    return {
      users,
      total: rows?.[0]?.total_count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });

export const getAdminUsersExport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      search: z.string().trim().max(120).default(""),
      sort: z.enum(["created_at", "name", "email"]).default("created_at"),
      ascending: z.boolean().default(false),
      role: z.enum(["all", "admin", "user"]).default("all"),
    }),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);

    const users: AdminUser[] = [];
    let page = 1;
    let total = 0;

    while (page <= 1000) {
      const { data: rows, error } = await context.supabase.rpc("admin_list_users", {
        _search: data.search,
        _sort: data.sort,
        _ascending: data.ascending,
        _page: page,
        _page_size: 100,
        _role: data.role,
      });

      if (error) throw new Error(`Could not prepare the user export: ${error.message}`);
      if (!rows) break;
      if (page === 1) total = rows[0]?.total_count ?? 0;
      if (rows.length === 0) break;

      users.push(
        ...(rows.map(({ total_count: _total, ...user }) => user) as AdminUser[]),
      );
      if (users.length >= total || rows.length < 100) break;
      page += 1;
    }

    return {
      users: users.map((user) => ({
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        district: user.district,
        state: user.state,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        role: user.role,
      })),
      total: users.length,
    };
  });

export const getAdminUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }): Promise<AdminUserDetail> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const untypedAdminDb = supabaseAdmin as unknown as { from: (table: string) => any };

    const [
      authResult,
      profileResult,
      roleResult,
      conversationsResult,
      diagnosesResult,
      errorsResult,
    ] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(data.userId),
      supabaseAdmin
        .from("profiles")
        .select("full_name,district,state,language,created_at,updated_at")
        .eq("id", data.userId)
        .maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId),
      supabaseAdmin
        .from("chat_conversations")
        .select("id,created_at,updated_at")
        .eq("user_id", data.userId)
        .order("updated_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("crop_diagnoses")
        .select("id,crop,condition,provider,usable,created_at")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(10),
      untypedAdminDb
        .from("application_error_logs")
        .select("id,service,severity,error_type,message,resolved_at,created_at")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (authResult.error) {
      throw new Error(`Could not load the account record: ${authResult.error.message}`);
    }
    if (profileResult.error) {
      throw new Error(`Could not load the user profile: ${profileResult.error.message}`);
    }
    if (roleResult.error) {
      throw new Error(`Could not load the user role: ${roleResult.error.message}`);
    }
    if (conversationsResult.error) {
      throw new Error(`Could not load conversation activity: ${conversationsResult.error.message}`);
    }
    if (diagnosesResult.error) {
      throw new Error(`Could not load diagnosis activity: ${diagnosesResult.error.message}`);
    }
    if (errorsResult.error) {
      throw new Error(`Could not load user-linked errors: ${errorsResult.error.message}`);
    }
    if (!authResult.data.user) {
      throw new Error("The selected account no longer exists.");
    }

    const authUser = authResult.data.user;
    const profile = profileResult.data;
    return {
      profile: {
        userId: data.userId,
        email: authUser.email ?? null,
        fullName: profile?.full_name ?? "",
        district: profile?.district ?? null,
        state: profile?.state ?? null,
        language: profile?.language ?? null,
        role: roleResult.data?.map((row) => row.role).join(", ") || "user",
        createdAt: authUser.created_at,
        lastSignInAt: authUser.last_sign_in_at ?? null,
        updatedAt: profile?.updated_at ?? null,
      },
      conversations: (conversationsResult.data ?? []).map((row: { id: string; created_at: string; updated_at: string }) => ({
        id: row.id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      diagnoses: (diagnosesResult.data ?? []).map((row: { id: string; crop: string | null; condition: string | null; provider: string | null; usable: boolean | null; created_at: string }) => ({
        id: row.id,
        crop: row.crop ?? "",
        condition: row.condition,
        provider: row.provider,
        usable: row.usable ?? false,
        createdAt: row.created_at,
      })),
      errors: (errorsResult.data ?? []).map((row: { id: string; service: string; severity: string; error_type: string; message: string; resolved_at: string | null; created_at: string }) => ({
        id: row.id,
        service: row.service,
        severity: row.severity,
        errorType: row.error_type,
        message: row.message,
        resolvedAt: row.resolved_at,
        createdAt: row.created_at,
      })),
    };
  });

export const getAdminNotices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminNotice[]> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const { data, error } = await supabaseAdmin
      .from("system_notices" as never)
      .select(
        "id,title,message,severity,enabled,starts_at,ends_at,created_at,updated_at,archived_at",
      )
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Could not load system notices: ${error.message}`);
    }
    return (data ?? []) as AdminNotice[];
  });

const adminErrorFiltersSchema = z.object({
  service: z
    .enum(["all", "mitra_ai", "diagnosis", "weather", "authentication", "database", "market_data"])
    .default("all"),
  severity: z.enum(["all", "warning", "error", "critical"]).default("all"),
  status: z.enum(["all", "unresolved", "resolved"]).default("unresolved"),
  since: z.string().datetime().nullable().default(null),
});

export const getAdminErrors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => adminErrorFiltersSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const includeApplicationErrors = data.service !== "market_data";
    const includeMarketErrors = data.service === "all" || data.service === "market_data";
    const applicationQuery = includeApplicationErrors
      ? (() => {
          let query = adminDb
            .from("application_error_logs")
            .select(
              "id,service,severity,user_id,request_id,provider,error_type,message,resolved_at,created_at",
            )
            .order("created_at", { ascending: false })
            .limit(100);
          if (data.service !== "all" && data.service !== "market_data") {
            query = query.eq("service", data.service);
          }
          if (data.severity !== "all") query = query.eq("severity", data.severity);
          if (data.status === "unresolved") query = query.is("resolved_at", null);
          if (data.status === "resolved") query = query.not("resolved_at", "is", null);
          if (data.since) query = query.gte("created_at", data.since);
          return query;
        })()
      : Promise.resolve({ data: [], error: null });
    const marketQuery =
      includeMarketErrors &&
      data.status !== "resolved" &&
      (data.severity === "all" || data.severity === "error" || data.severity === "critical")
        ? (() => {
            let query = supabaseAdmin
              .from("api_fetch_logs")
              .select("id,provider,status_code,error,created_at")
              .eq("ok", false)
              .order("created_at", { ascending: false })
              .limit(100);
            if (data.since) query = query.gte("created_at", data.since);
            return query;
          })()
        : Promise.resolve({ data: [], error: null });
    const [applicationResult, marketResult] = await Promise.all([applicationQuery, marketQuery]);

    if (applicationResult.error) {
      throw new Error(`Could not load application errors: ${applicationResult.error.message}`);
    }
    if (marketResult.error) {
      throw new Error(`Could not load market provider errors: ${marketResult.error.message}`);
    }

    const appErrors = (applicationResult.data ?? []).map((row: any) => ({
      ...row,
      service: row.service,
      error_type: row.error_type,
      message: row.message,
    }));
    const marketErrors = (marketResult.data ?? []).map((row: any) => ({
      id: row.id,
      service: "market_data" as const,
      severity: "error" as const,
      user_id: null,
      request_id: null,
      provider: row.provider,
      error_type: row.status_code ? `HTTP ${row.status_code}` : "Provider failure",
      message: row.error ?? "Market data provider returned an unsuccessful result.",
      resolved_at: null,
      created_at: row.created_at,
    }));

    return [...appErrors, ...marketErrors]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 100);
  });

export const resolveAdminError = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const { data: row, error } = await adminDb
      .from("application_error_logs" as never)
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("resolved_at", null)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`Could not resolve application error: ${error.message}`);
    }
    if (!row) {
      throw new Error("The application error was not found or is already resolved.");
    }
    const { error: auditError } = await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: context.userId,
      action: "application_error_resolved",
      detail: { error_id: data.id, result: "success" },
    });
    if (auditError) {
      throw new Error(`Error resolved, but audit logging failed: ${auditError.message}`);
    }
    return { ok: true };
  });

const noticeInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(1000),
    severity: z.enum(["info", "warning", "error", "maintenance"]),
    enabled: z.boolean(),
    startsAt: z.string().datetime().nullable(),
    endsAt: z.string().datetime().nullable(),
  })
  .refine(
    ({ startsAt, endsAt }) =>
      !startsAt || !endsAt || new Date(endsAt).getTime() > new Date(startsAt).getTime(),
    { message: "The end time must be after the start time.", path: ["endsAt"] },
  );

export const saveAdminNotice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => noticeInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const values = {
      title: data.title,
      message: data.message,
      severity: data.severity,
      enabled: data.enabled,
      starts_at: data.startsAt,
      ends_at: data.endsAt,
      updated_by: context.userId,
    };
    const result = data.id
      ? await adminDb
          .from("system_notices" as never)
          .update(values as never)
          .eq("id", data.id)
          .is("archived_at", null)
          .select("id")
          .maybeSingle()
      : await adminDb
          .from("system_notices" as never)
          .insert({ ...values, created_by: context.userId } as never)
          .select("id")
          .single();

    if (result.error) {
      throw new Error(`Could not save the system notice: ${result.error.message}`);
    }
    if (!result.data) {
      throw new Error("The system notice could not be found.");
    }

    const { error: auditError } = await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: context.userId,
      action: data.id ? "notice_updated" : "notice_created",
      detail: {
        notice_id: result.data.id,
        severity: data.severity,
        result: "success",
      },
    });
    if (auditError) {
      throw new Error(`Notice saved, but audit logging failed: ${auditError.message}`);
    }
    return { id: result.data.id };
  });

export const archiveAdminNotice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminDb = supabaseAdmin as unknown as { from: (table: string) => any };
    const { data: notice, error } = await adminDb
      .from("system_notices" as never)
      .update({
        enabled: false,
        archived_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`Could not archive the system notice: ${error.message}`);
    }
    if (!notice) {
      throw new Error("The system notice could not be found.");
    }
    const { error: auditError } = await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: context.userId,
      action: "notice_archived",
      detail: { notice_id: data.id, result: "success" },
    });
    if (auditError) {
      throw new Error(`Notice archived, but audit logging failed: ${auditError.message}`);
    }
    return { ok: true };
  });
