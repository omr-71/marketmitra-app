import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, ChevronRight, Trash2 } from "lucide-react";
import { Screen, TopBar } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NotificationItem = {
  id: string;
  category: "market" | "weather" | "scheme" | "updates" | "general";
  title: string;
  body: string;
  url: string;
  is_read: boolean;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

const categoryLabels: Record<NotificationItem["category"], string> = {
  market: "Market",
  weather: "Weather",
  scheme: "Schemes",
  updates: "Updates",
  general: "General",
};

function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("notification_history")
      .select("id,category,title,body,url,is_read,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load notifications.");
    else setItems((data ?? []) as NotificationItem[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const visible = items.filter((item) =>
    (filter === "all" || !item.is_read) &&
    (category === "all" || item.category === category),
  );

  async function markRead(id: string) {
    await supabase.from("notification_history").update({ is_read: true }).eq("id", id);
    setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
  }

  async function remove(id: string) {
    await supabase.from("notification_history").delete().eq("id", id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function markAllRead() {
    await supabase.from("notification_history").update({ is_read: true }).eq("is_read", false);
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    toast.success("All notifications marked as read.");
  }

  async function clearAll() {
    if (!window.confirm("Clear all notification history?")) return;
    await supabase.from("notification_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setItems([]);
    toast.success("Notification history cleared.");
  }

  return (
    <Screen>
      <TopBar title="Notifications" back="/home" />
      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-24 pt-4">
        <div className="card-surface flex items-center justify-between p-4">
          <div>
            <p className="text-lg font-extrabold">Your updates</p>
            <p className="text-xs text-muted-foreground">{items.filter((item) => !item.is_read).length} unread</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void markAllRead()} className="press rounded-xl border px-3 py-2 text-xs font-bold" aria-label="Mark all as read">
              <CheckCheck className="size-4" />
            </button>
            <button type="button" onClick={() => void clearAll()} className="press rounded-xl border px-3 py-2 text-xs font-bold text-destructive" aria-label="Clear all">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {(["all", "unread"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`press shrink-0 rounded-full px-4 py-2 text-xs font-bold ${filter === value ? "bg-primary text-primary-foreground" : "border bg-card"}`}>
              {value === "all" ? "All" : "Unread"}
            </button>
          ))}
          {["market", "weather", "scheme", "updates"].map((value) => (
            <button key={value} type="button" onClick={() => setCategory(category === value ? "all" : value)} className={`press shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category === value ? "bg-primary text-primary-foreground" : "border bg-card"}`}>
              {categoryLabels[value as NotificationItem["category"]]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="card-surface grid place-items-center py-16"><span className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : visible.length === 0 ? (
          <div className="card-surface py-16 text-center">
            <Bell className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-bold">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Verified updates will appear here.</p>
          </div>
        ) : visible.map((item) => (
          <article key={item.id} className={`card-surface flex items-start gap-3 p-4 ${item.is_read ? "" : "border-primary/30 bg-primary/[0.025]"}`}>
            <div className="min-w-0 flex-1" onClick={() => void markRead(item.id)}>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{categoryLabels[item.category]}</span>
                {!item.is_read && <span className="size-2 rounded-full bg-primary" />}
              </div>
              <p className="mt-2 font-bold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => { void markRead(item.id); window.location.href = item.url; }} className="press rounded-xl border p-2" aria-label="Open notification"><ChevronRight className="size-4" /></button>
            <button type="button" onClick={() => void remove(item.id)} className="press rounded-xl border p-2 text-destructive" aria-label="Delete notification"><Trash2 className="size-4" /></button>
          </article>
        ))}
      </main>
    </Screen>
  );
}
