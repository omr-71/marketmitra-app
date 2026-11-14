import { z } from "zod";

export const ADMIN_FEEDBACK_CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "General Suggestion",
  "Incorrect Market Prices",
  "Weather Information Issue",
  "Crop Diagnosis Issue",
  "Location or Data Issue",
  "Account or Login Issue",
  "Other",
  "Custom Category",
] as const;

const ADMIN_FEEDBACK_FILTER_CATEGORIES = [
  ...ADMIN_FEEDBACK_CATEGORIES,
  "feedback",
  "bug_report",
] as const;

export const adminFeedbackListInputSchema = z.object({
  search: z.string().trim().max(120).default(""),
  feedbackType: z.enum(["share_feedback", "report_problem"]).optional(),
  category: z.enum(ADMIN_FEEDBACK_FILTER_CATEGORIES).optional(),
  status: z.enum(["new", "in_review", "resolved", "rejected"]).optional(),
  page: z.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.number().int().min(10).max(50).default(25),
});

export const updateAdminFeedbackStatusInputSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "in_review", "resolved", "rejected"]),
});

export const updateAdminFeedbackNotesInputSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().trim().max(4000),
});

export const submitUserFeedbackInputSchema = z
  .object({
    feedbackType: z.enum(["share_feedback", "report_problem"]).optional(),
    category: z.enum([...ADMIN_FEEDBACK_CATEGORIES, "feedback", "bug_report"]),
    customCategory: z.string().trim().max(80).optional(),
    subject: z.string().trim().min(1).max(160),
    message: z.string().trim().min(1).max(4000),
    pageContext: z.string().trim().max(160).optional(),
  })
  .superRefine((feedback, ctx) => {
    const isLegacyCategory = feedback.category === "feedback" || feedback.category === "bug_report";
    if (!feedback.feedbackType && !isLegacyCategory) {
      ctx.addIssue({
        code: "custom",
        message: "Feedback type is required.",
        path: ["feedbackType"],
      });
    }
    if (feedback.category === "Custom Category" && !feedback.customCategory?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Custom category is required.",
        path: ["customCategory"],
      });
    }
    if (feedback.category !== "Custom Category" && feedback.customCategory?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Custom category is only valid for a custom category.",
        path: ["customCategory"],
      });
    }
  });

export type AdminFeedbackStatus = z.infer<typeof updateAdminFeedbackStatusInputSchema>["status"];
export type AdminFeedbackNoteInput = z.infer<typeof updateAdminFeedbackNotesInputSchema>;
export type UserFeedbackInput = z.infer<typeof submitUserFeedbackInputSchema>;

export type UserFeedbackInsert = {
  user_id: string;
  feedback_type: "share_feedback" | "report_problem";
  category: string;
  custom_category: string | null;
  subject: string;
  message: string;
  page_context: string | null;
  status: "new";
};

export function buildUserFeedbackInsert(
  userId: string,
  input: UserFeedbackInput,
): UserFeedbackInsert {
  const category =
    input.category === "feedback"
      ? "General Suggestion"
      : input.category === "bug_report"
        ? "Bug Report"
        : input.category;
  const feedbackType =
    input.feedbackType ?? (input.category === "bug_report" ? "report_problem" : "share_feedback");

  return {
    user_id: userId,
    feedback_type: feedbackType,
    category,
    custom_category: category === "Custom Category" ? (input.customCategory?.trim() ?? null) : null,
    subject: input.subject,
    message: input.message,
    page_context: input.pageContext || null,
    status: "new",
  };
}

type FeedbackAuthClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export async function assertFeedbackAdmin(supabase: FeedbackAuthClient, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

export type FeedbackMutation =
  | {
      operation: "status";
      feedbackId: string;
      adminId: string;
      status: AdminFeedbackStatus;
    }
  | {
      operation: "notes";
      feedbackId: string;
      adminId: string;
      notes: string | null;
    };

export type FeedbackMutationStore = {
  applyMutation: (mutation: FeedbackMutation) => Promise<{ error: string | null }>;
};

type FeedbackMutationContext = {
  supabase: FeedbackAuthClient;
  supabaseAdmin: FeedbackMutationStore;
  userId: string;
};

export async function updateFeedbackStatus(
  input: z.infer<typeof updateAdminFeedbackStatusInputSchema>,
  context: FeedbackMutationContext,
) {
  await assertFeedbackAdmin(context.supabase, context.userId);
  const result = await context.supabaseAdmin.applyMutation({
    operation: "status",
    feedbackId: input.id,
    adminId: context.userId,
    status: input.status,
  });
  if (result.error) throw new Error(`Could not update feedback status: ${result.error}`);
  return { ok: true };
}

export async function updateFeedbackNotes(
  input: AdminFeedbackNoteInput,
  context: FeedbackMutationContext,
) {
  await assertFeedbackAdmin(context.supabase, context.userId);
  const result = await context.supabaseAdmin.applyMutation({
    operation: "notes",
    feedbackId: input.id,
    adminId: context.userId,
    notes: input.notes || null,
  });
  if (result.error) throw new Error(`Could not save feedback notes: ${result.error}`);
  return { ok: true };
}
