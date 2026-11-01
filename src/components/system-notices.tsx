import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info, Wrench, X } from "lucide-react";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type Notice = {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "maintenance";
  starts_at: string | null;
  ends_at: string | null;
};

const styles: Record<Notice["severity"], { className: string; Icon: typeof Info }> = {
  info: {
    className: "border-sky-500/25 bg-sky-500/10 text-sky-950 dark:text-sky-100",
    Icon: Info,
  },
  warning: {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
    Icon: AlertTriangle,
  },
  error: {
    className: "border-red-500/30 bg-red-500/10 text-red-950 dark:text-red-100",
    Icon: AlertTriangle,
  },
  maintenance: {
    className: "border-indigo-500/25 bg-indigo-500/10 text-indigo-950 dark:text-indigo-100",
    Icon: Wrench,
  },
};

export function SystemNotices() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const notices = useQuery({
    queryKey: ["system-notices"],
    queryFn: async (): Promise<Notice[]> => {
      const db = supabase as unknown as { from: (table: string) => any };
      const { data, error } = await db
        .from("system_notices")
        .select("id,title,message,severity,starts_at,ends_at")
        .eq("enabled", true)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Could not load system notices: ${error.message}`);
      }

      const now = Date.now();
      return (data ?? []).filter(
        (notice: { starts_at?: string | null; ends_at?: string | null }) =>
          (!notice.starts_at || new Date(notice.starts_at).getTime() <= now) &&
          (!notice.ends_at || new Date(notice.ends_at).getTime() > now),
      );
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  });

  if (!notices.data?.length) return null;

  return (
    <div className="space-y-2 px-4 pt-4 lg:px-0" aria-label="System notices">
      {notices.data
        .filter((notice) => !dismissed.includes(notice.id))
        .map((notice) => {
          const { className, Icon } = styles[notice.severity];
          return (
            <aside
              key={notice.id}
              role={notice.severity === "error" ? "alert" : "status"}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${className}`}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{notice.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed opacity-90">{notice.message}</p>
              </div>
              <button
                type="button"
                aria-label="Dismiss notice"
                onClick={() => setDismissed((items) => [...items, notice.id])}
                className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </aside>
          );
        })}
    </div>
  );
}
