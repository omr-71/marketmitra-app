import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Notice = {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "maintenance";
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

const styles: Record<Notice["severity"], { className: string }> = {
  info: { className: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-200" },
  warning: { className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200" },
  error: { className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200" },
  maintenance: { className: "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200" },
};

export function SystemNotices() {
  const { user, loading: authLoading } = useAuth();
  const [queue, setQueue] = useState<Notice[]>([]);
  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledgementError, setAcknowledgementError] = useState(false);
  const acknowledgedRef = useRef(new Set<string>());
  const acknowledgementInFlightRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const scheduledRefreshRef = useRef<number | null>(null);
  const current = queue[0] ?? null;
  currentUserIdRef.current = user?.id ?? null;

  const loadUnread = useCallback(async () => {
    if (!user?.id) return;
    const db = supabase as unknown as { from: (table: string) => any };
    const [noticesResult, readsResult] = await Promise.all([
      db.from("system_notices")
        .select("id,title,message,severity,starts_at,ends_at,created_at")
        .eq("enabled", true)
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
      db.from("notice_reads").select("notice_id").eq("user_id", user.id),
    ]);

    if (noticesResult.error) throw noticesResult.error;
    if (readsResult.error) throw readsResult.error;

    const now = Date.now();
    const readIds = new Set((readsResult.data ?? []).map((row: { notice_id: string }) => row.notice_id));
    const unread = ((noticesResult.data ?? []) as Notice[]).filter((notice) => {
      const startsAt = notice.starts_at ? new Date(notice.starts_at).getTime() : -Infinity;
      const endsAt = notice.ends_at ? new Date(notice.ends_at).getTime() : Infinity;
      return !readIds.has(notice.id) && !acknowledgedRef.current.has(notice.id) &&
        startsAt <= now && endsAt > now;
    }).sort((left, right) => left.created_at.localeCompare(right.created_at));
    const nextStart = ((noticesResult.data ?? []) as Notice[])
      .filter((notice) => {
        if (!notice.starts_at) return false;
        const start = new Date(notice.starts_at).getTime();
        return Number.isFinite(start) && start > now;
      })
      .map((notice) => new Date(notice.starts_at as string).getTime())
      .sort((left, right) => left - right)[0];
    if (scheduledRefreshRef.current !== null) {
      window.clearTimeout(scheduledRefreshRef.current);
      scheduledRefreshRef.current = null;
    }
    if (nextStart !== undefined) {
      scheduledRefreshRef.current = window.setTimeout(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      }, Math.min(Math.max(nextStart - now + 250, 250), 2_147_483_647));
    }

    setQueue((previous) => {
      const visibleId = previous[0]?.id;
      if (visibleId && unread.some((notice) => notice.id === visibleId)) {
        return unread.filter((notice) => notice.id === visibleId)
          .concat(unread.filter((notice) => notice.id !== visibleId));
      }
      return unread;
    });
  }, [user?.id]);

  const acknowledge = useCallback(async () => {
    if (!current || acknowledgementInFlightRef.current) return;
    acknowledgementInFlightRef.current = true;
    setAcknowledging(true);
    setAcknowledgementError(false);
    acknowledgedRef.current.add(current.id);
    try {
      const { data, error } = await (supabase as unknown as {
        rpc: (name: string, args?: Record<string, unknown>) => Promise<{
          data: boolean | null;
          error: { message: string } | null;
        }>;
      }).rpc("acknowledge_system_notice", { _notice_id: current.id });
      if (error) throw error;
      if (data !== true) throw new Error("The notice is no longer active.");
      acknowledgedRef.current.delete(current.id);
      if (currentUserIdRef.current === user?.id) {
        setQueue((items) => items.slice(1));
      }
    } catch (error) {
      acknowledgedRef.current.delete(current.id);
      setAcknowledgementError(true);
      console.error("Unable to save notice acknowledgement", error);
    } finally {
      acknowledgementInFlightRef.current = false;
      setAcknowledging(false);
    }
  }, [current, user?.id]);

  useEffect(() => {
    if (authLoading || !user?.id) {
      setQueue([]);
      acknowledgedRef.current.clear();
      return;
    }
    const refresh = () => void loadUnread().catch((error) =>
      console.error("Unable to load announcements", error));
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    const channel = supabase
      .channel(`market-mitra-notices-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "system_notices" }, refresh)
      .subscribe();

    return () => {
      window.clearInterval(interval);
      if (scheduledRefreshRef.current !== null) {
        window.clearTimeout(scheduledRefreshRef.current);
        scheduledRefreshRef.current = null;
      }
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [authLoading, loadUnread, user?.id]);

  if (!current) return null;

  const { className: severityClassName } = styles[current.severity];
  const publishedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(current.created_at));

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) void acknowledge(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-slate-950/55 backdrop-blur-[5px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[101] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none dark:border-white/10 dark:bg-slate-950"
        >
          <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-7 sm:pt-7">
              <div className="flex items-center gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full border ${severityClassName}`}>
                  <BellRing className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    MARKET MITRA ANNOUNCEMENT
                  </p>
                  <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                    {current.severity} notice · {publishedAt}
                  </p>
                </div>
              </div>
              <DialogPrimitive.Close
                aria-label="Dismiss announcement"
                disabled={acknowledging}
                className="grid size-8 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
            <div className="min-h-0 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
              <DialogPrimitive.Title className="text-xl font-semibold leading-snug tracking-[-0.02em] text-slate-950 dark:text-white sm:text-2xl">
                {current.title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                {current.message}
              </DialogPrimitive.Description>
              <button
                type="button"
                onClick={() => void acknowledge()}
                disabled={acknowledging}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
              >
                {acknowledging ? "Saving…" : "Got it"}
              </button>
              {acknowledgementError && (
                <p role="alert" className="mt-3 text-center text-xs leading-5 text-red-600 dark:text-red-300">
                  We could not save your acknowledgement. Please try again.
                </p>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
