import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runNotificationIntelligence } from "@/lib/notification-intelligence.server";
import { isAuthorizedCronRequest } from "@/lib/notification-cron-policy";

const JOB_TYPES = ["daily_summary", "market_monitor", "weather_monitor"] as const;
type JobType = (typeof JOB_TYPES)[number];

async function recordJobStart(jobType: JobType) {
  const { data, error } = await supabaseAdmin
    .from("notification_intelligence_runs")
    .insert({ job_type: jobType, started_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error || !data) return { error: "Run start could not be recorded" };
  return { run: data };
}

async function executeJob(jobType: JobType, testUserId?: string) {
  let runId: string | undefined;
  try {
    const start = await recordJobStart(jobType);
    if ("error" in start) {
      return { jobType, status: "failed", error: start.error };
    }
    runId = start.run.id;

    const result = await runNotificationIntelligence(jobType, testUserId ? { testUserId } : undefined);
    const { error: finishError } = await supabaseAdmin.from("notification_intelligence_runs").update({
      completed_at: new Date().toISOString(),
      users_evaluated: result.usersEvaluated,
      alerts_generated: result.generated,
      notifications_accepted: result.accepted,
      provider_freshness: {
        observation_dates: result.freshness.filter(Boolean),
        failures: result.providerFailures ?? {},
      },
      details: {
        users_missing_profile: result.usersMissingProfile ?? 0,
        users_skipped_quiet_hours: result.skippedQuietHours ?? 0,
        provider_failures: result.providerFailures ?? {},
        processing_failures: result.processingFailures ?? {},
      },
    }).eq("id", runId);
    if (finishError) {
      return { jobType, status: "failed", error: "Run completion could not be recorded" };
    }
    return { status: "completed", ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown job error";
    let finishError = false;
    if (runId) {
      try {
        const finish = await supabaseAdmin.from("notification_intelligence_runs").update({
          completed_at: new Date().toISOString(),
          failed_deliveries: 1,
          error: message.slice(0, 500),
        }).eq("id", runId);
        finishError = Boolean(finish.error);
      } catch {
        finishError = true;
      }
    }
    return {
      jobType,
      status: "failed",
      error: finishError || !runId
        ? "Notification intelligence job failed and run failure could not be recorded"
        : "Notification intelligence job failed",
    };
  }
}

async function handleCron(request: Request) {
  const cronSecret = process.env["CRON_SECRET"];
  if (!isAuthorizedCronRequest(request.headers.get("authorization"), cronSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobType = new URL(request.url).searchParams.get("job");
  if (jobType !== "all" && !JOB_TYPES.includes(jobType as JobType)) {
    return Response.json({ error: "Invalid job" }, { status: 400 });
  }

  const url = new URL(request.url);
  const isControlledTest = url.searchParams.get("test") === "1";
  const configuredTestUserId = process.env["NOTIFICATION_CRON_TEST_USER_ID"];
  const requestedTestUserId = url.searchParams.get("test_user_id");
  if (isControlledTest && (!configuredTestUserId || requestedTestUserId !== configuredTestUserId)) {
    return Response.json({ error: "Controlled test is not configured" }, { status: 403 });
  }

  const requestedJobs = jobType === "all"
    ? JOB_TYPES
    : [jobType as JobType];
  const results = await Promise.all(requestedJobs.map((job) =>
    executeJob(job, isControlledTest ? configuredTestUserId : undefined),
  ));
  return Response.json({ status: results.every((result) => result.status === "completed") ? "completed" : "partial", jobs: results });
}

export const Route = createFileRoute("/api/notifications/run")({
  server: {
    handlers: {
      GET: ({ request }) => handleCron(request),
      POST: ({ request }) => handleCron(request),
    },
  },
});
