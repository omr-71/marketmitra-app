import assert from "node:assert/strict";
import test from "node:test";

import {
  adminFeedbackListInputSchema,
  assertFeedbackAdmin,
  buildUserFeedbackInsert,
  submitUserFeedbackInputSchema,
  updateAdminFeedbackNotesInputSchema,
  updateAdminFeedbackStatusInputSchema,
  updateFeedbackNotes,
  updateFeedbackStatus,
} from "./feedback-centre.server.ts";
import type { FeedbackMutationStore } from "./feedback-centre.server.ts";

const feedbackId = "d2cc2af2-f829-4f4b-aac3-f2857ea56a19";
const adminId = "13968471-57f2-4f34-9517-4e8d2b88a3db";

function createAuthClient(data: unknown = true, error: { message: string } | null = null) {
  const calls: { functionName: string; args: Record<string, unknown> }[] = [];
  return {
    calls,
    rpc: async (functionName: string, args: Record<string, unknown>) => {
      calls.push({ functionName, args });
      return { data, error };
    },
  };
}

function createMutationStore(error: string | null = null): FeedbackMutationStore & {
  mutations: Parameters<FeedbackMutationStore["applyMutation"]>[0][];
} {
  const mutations: Parameters<FeedbackMutationStore["applyMutation"]>[0][] = [];
  return {
    mutations,
    applyMutation: async (mutation) => {
      mutations.push(mutation);
      return { error };
    },
  };
}

test("admin authorization denies non-admins and role-check failures", async () => {
  const nonAdmin = createAuthClient(false);
  await assert.rejects(() => assertFeedbackAdmin(nonAdmin, adminId), /Forbidden/);

  const failedRoleCheck = createAuthClient(null, { message: "role lookup failed" });
  await assert.rejects(() => assertFeedbackAdmin(failedRoleCheck, adminId), /Forbidden/);
  assert.equal(failedRoleCheck.calls[0]?.functionName, "has_role");
  assert.deepEqual(failedRoleCheck.calls[0]?.args, { _user_id: adminId, _role: "admin" });
});

test("list, status, note, and submission validators reject invalid inputs", () => {
  assert.throws(() => adminFeedbackListInputSchema.parse({ page: 0 }));
  assert.throws(() => adminFeedbackListInputSchema.parse({ pageSize: 51 }));
  assert.throws(() => updateAdminFeedbackStatusInputSchema.parse({ id: "invalid", status: "new" }));
  assert.throws(() =>
    updateAdminFeedbackStatusInputSchema.parse({ id: feedbackId, status: "closed" }),
  );
  assert.throws(() =>
    updateAdminFeedbackNotesInputSchema.parse({ id: feedbackId, notes: "n".repeat(4001) }),
  );
  assert.throws(() =>
    submitUserFeedbackInputSchema.parse({
      category: "Custom Category",
      subject: "Subject",
      message: "Message",
    }),
  );
  assert.throws(() =>
    submitUserFeedbackInputSchema.parse({
      feedbackType: "share_feedback",
      category: "Other",
      customCategory: "not allowed",
      subject: "Subject",
      message: "Message",
    }),
  );
});

test("feedback inserts bind ownership to the authenticated user and exclude admin fields", () => {
  const input = submitUserFeedbackInputSchema.parse({
    feedbackType: "report_problem",
    category: "Custom Category",
    customCategory: "Map issue",
    subject: "Map is blank",
    message: "The map does not load.",
    pageContext: "/profile",
  });
  const insert = buildUserFeedbackInsert(adminId, input);

  assert.deepEqual(insert, {
    user_id: adminId,
    feedback_type: "report_problem",
    category: "Custom Category",
    custom_category: "Map issue",
    subject: "Map is blank",
    message: "The map does not load.",
    page_context: "/profile",
    status: "new",
  });
  assert.equal("admin_notes" in insert, false);
});

test("legacy submissions map to supported feedback types and categories", () => {
  const input = submitUserFeedbackInputSchema.parse({
    category: "bug_report",
    subject: "Old form",
    message: "Legacy submission",
  });
  assert.deepEqual(buildUserFeedbackInsert(adminId, input), {
    user_id: adminId,
    feedback_type: "report_problem",
    category: "Bug Report",
    custom_category: null,
    subject: "Old form",
    message: "Legacy submission",
    page_context: null,
    status: "new",
  });
});

test("status updates authorize first and submit one atomic status-and-audit mutation", async () => {
  const auth = createAuthClient();
  const store = createMutationStore();
  const result = await updateFeedbackStatus(
    { id: feedbackId, status: "in_review" },
    { supabase: auth, supabaseAdmin: store, userId: adminId },
  );

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(store.mutations, [
    { operation: "status", feedbackId, adminId, status: "in_review" },
  ]);
});

test("status updates do not touch storage for unauthorized users", async () => {
  const auth = createAuthClient(false);
  const store = createMutationStore();
  await assert.rejects(
    () =>
      updateFeedbackStatus(
        { id: feedbackId, status: "resolved" },
        { supabase: auth, supabaseAdmin: store, userId: adminId },
      ),
    /Forbidden/,
  );
  assert.deepEqual(store.mutations, []);
});

test("private notes are trimmed, blank notes clear the value, and each save is atomic", async () => {
  const auth = createAuthClient();
  const store = createMutationStore();

  await updateFeedbackNotes(
    updateAdminFeedbackNotesInputSchema.parse({ id: feedbackId, notes: "  Internal note  " }),
    { supabase: auth, supabaseAdmin: store, userId: adminId },
  );
  await updateFeedbackNotes(
    updateAdminFeedbackNotesInputSchema.parse({ id: feedbackId, notes: "   " }),
    { supabase: auth, supabaseAdmin: store, userId: adminId },
  );

  assert.deepEqual(store.mutations, [
    { operation: "notes", feedbackId, adminId, notes: "Internal note" },
    { operation: "notes", feedbackId, adminId, notes: null },
  ]);
});

test("failed, missing-row, and audit errors reject the atomic mutation", async () => {
  const auth = createAuthClient();
  const failedUpdate = createMutationStore("database unavailable");
  await assert.rejects(
    () =>
      updateFeedbackStatus(
        { id: feedbackId, status: "rejected" },
        { supabase: auth, supabaseAdmin: failedUpdate, userId: adminId },
      ),
    /database unavailable/,
  );
  assert.equal(failedUpdate.mutations.length, 1);

  const missingRow = createMutationStore("feedback not found");
  await assert.rejects(
    () =>
      updateFeedbackNotes(
        { id: feedbackId, notes: "Note" },
        { supabase: auth, supabaseAdmin: missingRow, userId: adminId },
      ),
    /feedback not found/,
  );

  const auditFailure = createMutationStore("audit write failed; mutation rolled back");
  await assert.rejects(
    () =>
      updateFeedbackNotes(
        { id: feedbackId, notes: "Note" },
        { supabase: auth, supabaseAdmin: auditFailure, userId: adminId },
      ),
    /mutation rolled back/,
  );
});
