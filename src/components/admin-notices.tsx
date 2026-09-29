import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, Plus, Save } from "lucide-react";
import { useState } from "react";

import {
  archiveAdminNotice,
  getAdminNotices,
  saveAdminNotice,
  type AdminNotice,
} from "@/lib/admin.functions";
import { toast } from "sonner";

type Severity = AdminNotice["severity"];
type NoticeDraft = {
  id?: string;
  title: string;
  message: string;
  severity: Severity;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyDraft: NoticeDraft = {
  title: "",
  message: "",
  severity: "info",
  enabled: false,
  startsAt: "",
  endsAt: "",
};

const panelClass = "rounded-3xl border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.04)] p-5";

export function AdminNotices() {
  const queryClient = useQueryClient();
  const loadNotices = useServerFn(getAdminNotices);
  const saveNotice = useServerFn(saveAdminNotice);
  const archiveNotice = useServerFn(archiveAdminNotice);
  const [draft, setDraft] = useState<NoticeDraft>(emptyDraft);

  const notices = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: () => loadNotices(),
    retry: false,
  });
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    void queryClient.invalidateQueries({ queryKey: ["system-notices"] });
  };

  const save = useMutation({
    mutationFn: saveNotice,
    onSuccess: () => {
      toast.success("System notice saved.");
      setDraft(emptyDraft);
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const archive = useMutation({
    mutationFn: archiveNotice,
    onSuccess: () => {
      toast.success("System notice archived.");
      if (draft.id) setDraft(emptyDraft);
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save.mutate({
      data: {
        id: draft.id,
        title: draft.title,
        message: draft.message,
        severity: draft.severity,
        enabled: draft.enabled,
        startsAt: toIso(draft.startsAt),
        endsAt: toIso(draft.endsAt),
      },
    });
  };

  const edit = (notice: AdminNotice) => {
    setDraft({
      id: notice.id,
      title: notice.title,
      message: notice.message,
      severity: notice.severity,
      enabled: notice.enabled,
      startsAt: toLocalInput(notice.starts_at),
      endsAt: toLocalInput(notice.ends_at),
    });
  };

  return (
    <section id="admin-notices" className={`${panelClass} scroll-mt-20`}>
      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[oklch(0.84_0.02_150)]">
          System notices
        </h2>
        <p className="mt-1 text-xs text-[oklch(0.72_0.02_150)]">
          Published notices are read from Supabase and shown in the signed-in app.
        </p>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="text-xs font-semibold">
          Title
          <input
            required
            maxLength={120}
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            className="mt-1 block h-10 w-full rounded-xl border border-[oklch(1_0_0/0.1)] bg-black/15 px-3 text-sm outline-none focus:border-[oklch(0.7_0.16_150)]"
          />
        </label>
        <label className="text-xs font-semibold">
          Severity
          <select
            value={draft.severity}
            onChange={(event) => setDraft({ ...draft, severity: event.target.value as Severity })}
            className="mt-1 block h-10 w-full rounded-xl border border-[oklch(1_0_0/0.1)] bg-[oklch(0.18_0.02_160)] px-3 text-sm"
          >
            <option value="info">INFO</option>
            <option value="warning">WARNING</option>
            <option value="error">ERROR</option>
            <option value="maintenance">MAINTENANCE</option>
          </select>
        </label>
        <label className="text-xs font-semibold lg:col-span-2">
          Message
          <textarea
            required
            maxLength={1000}
            rows={3}
            value={draft.message}
            onChange={(event) => setDraft({ ...draft, message: event.target.value })}
            className="mt-1 block w-full resize-y rounded-xl border border-[oklch(1_0_0/0.1)] bg-black/15 p-3 text-sm outline-none focus:border-[oklch(0.7_0.16_150)]"
          />
        </label>
        <label className="text-xs font-semibold">
          Starts at (optional)
          <input
            type="datetime-local"
            value={draft.startsAt}
            onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })}
            className="mt-1 block h-10 w-full rounded-xl border border-[oklch(1_0_0/0.1)] bg-black/15 px-3 text-sm"
          />
        </label>
        <label className="text-xs font-semibold">
          Ends at (optional)
          <input
            type="datetime-local"
            value={draft.endsAt}
            onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })}
            className="mt-1 block h-10 w-full rounded-xl border border-[oklch(1_0_0/0.1)] bg-black/15 px-3 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
          />
          Publish this notice when its schedule is active
        </label>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[oklch(0.7_0.16_150)] px-4 text-xs font-bold text-[oklch(0.14_0.02_160)] disabled:opacity-50"
          >
            {draft.id ? <Save className="size-4" /> : <Plus className="size-4" />}
            {save.isPending ? "Saving…" : draft.id ? "Save changes" : "Create notice"}
          </button>
          {draft.id && (
            <button
              type="button"
              onClick={() => setDraft(emptyDraft)}
              className="h-10 rounded-xl bg-white/10 px-4 text-xs font-semibold"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {(draft.title || draft.message) && (
        <div className="mt-4 rounded-2xl border border-dashed border-[oklch(1_0_0/0.16)] p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.68_0.02_150)]">
            Preview · {draft.severity}
          </p>
          <p className="text-sm font-bold">{draft.title || "Notice title"}</p>
          <p className="mt-1 whitespace-pre-wrap text-xs text-[oklch(0.78_0.02_150)]">
            {draft.message || "Notice message"}
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-[oklch(1_0_0/0.08)] pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[oklch(0.8_0.02_150)]">
          Current and scheduled notices
        </h3>
        {notices.isLoading ? (
          <div className="mt-3 h-16 animate-pulse rounded-xl bg-white/5" />
        ) : notices.isError ? (
          <p role="alert" className="mt-3 text-sm text-[oklch(0.9_0.06_30)]">
            Failed to load notices: {notices.error.message}
          </p>
        ) : !notices.data?.length ? (
          <p className="mt-3 text-sm text-[oklch(0.72_0.02_150)]">No notices have been created.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[oklch(1_0_0/0.07)]">
            {notices.data.map((notice) => (
              <li key={notice.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{notice.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[oklch(0.72_0.02_150)]">
                    {notice.message}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[oklch(0.68_0.02_150)]">
                    {notice.severity} · {notice.enabled ? "enabled" : "disabled"} · starts{" "}
                    {notice.starts_at
                      ? new Date(notice.starts_at).toLocaleString("en-IN")
                      : "immediately"}{" "}
                    · ends{" "}
                    {notice.ends_at ? new Date(notice.ends_at).toLocaleString("en-IN") : "never"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => edit(notice)}
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={archive.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Archive "${notice.title}"? This removes it from the user-facing app.`,
                      )
                    ) {
                      archive.mutate({ data: { id: notice.id } });
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[oklch(0.55_0.18_25/0.18)] px-3 py-2 text-xs font-semibold text-[oklch(0.9_0.06_30)] disabled:opacity-50"
                >
                  <Archive className="size-3.5" />
                  Archive
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function toIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
