import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bot,
  ChevronRight,
  Info,
  Languages,
  LogOut,
  MessageCircle,
  Palette,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { Screen, TopBar } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { langNames, useLang } from "@/lib/i18n";
import { DEFAULT_SETTINGS, useSettings } from "@/lib/settings";
import type { Lang } from "@/lib/crops";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MarketMitra" },
      { name: "description", content: "Manage your MarketMitra language, assistant, notification and privacy preferences." },
      { property: "og:title", content: "Settings — MarketMitra" },
      { property: "og:description", content: "Manage your MarketMitra preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang, setLang } = useLang();
  const { settings, setChat, setVoice, setNotifications, reset } = useSettings();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <Screen>
      <TopBar title="Settings" subtitle="Your MarketMitra experience" back="/profile" />
      <main className="space-y-6 px-5 pt-5 lg:px-0 lg:pt-8">
        <SettingSection icon={<Languages />} title="Language" description="Used throughout the app">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(langNames) as Lang[]).map((item) => (
              <Button
                key={item}
                type="button"
                variant={lang === item ? "default" : "outline"}
                className="h-11 rounded-xl"
                onClick={() => setLang(item)}
              >
                {langNames[item]}
              </Button>
            ))}
          </div>
        </SettingSection>

        <SettingSection icon={<Bot />} title="Mitra AI" description="Conversation and voice preferences">
          <ToggleRow
            icon={<MessageCircle />}
            title="Keep chat history"
            description="Remember conversations on this device"
            checked={settings.chat.keepHistory}
            onChange={(checked) => setChat({ keepHistory: checked })}
          />
          <ToggleRow
            icon={<Volume2 />}
            title="Read replies aloud"
            description="Automatically play Mitra voice responses"
            checked={settings.voice.autoPlay}
            onChange={(checked) => setVoice({ autoPlay: checked })}
          />
        </SettingSection>

        <SettingSection icon={<Bell />} title="Notifications" description="Choose useful alerts">
          <ToggleRow
            icon={<SlidersHorizontal />}
            title="Market movements"
            description="Important changes in crop prices"
            checked={settings.notifications.priceMovement}
            onChange={(checked) => setNotifications({ priceMovement: checked })}
          />
          <ToggleRow
            icon={<Bell />}
            title="Weather alerts"
            description="Rain and severe farm-weather updates"
            checked={settings.notifications.weather}
            onChange={(checked) => setNotifications({ weather: checked })}
          />
        </SettingSection>

        <SettingSection icon={<ShieldCheck />} title="Privacy & account" description="Account and local preferences">
          <button
            type="button"
            onClick={() => {
              reset();
              toast.success("Settings restored");
            }}
            className="flex w-full items-center gap-3 py-3 text-left"
          >
            <RotateCcw className="size-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-semibold">Restore default settings</span>
          </button>
          <Button type="button" variant="outline" className="mt-2 h-11 w-full rounded-xl" onClick={() => void signOut()}>
            <LogOut /> Sign out
          </Button>
        </SettingSection>

        <Link
          to="/about"
          className="card-surface hover-lift flex items-center gap-4 p-5"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Info className="size-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">About Market Mitra</span>
            <span className="block text-xs text-muted-foreground">Story, mission, data sources and contact</span>
          </span>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>

        <p className="pb-3 text-center text-[11px] text-muted-foreground">
          MarketMitra · Secure account authentication
        </p>
      </main>
    </Screen>
  );
}

function SettingSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="card-surface p-5">
      <header className="mb-3 flex items-center gap-3 border-b border-border pb-4">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">{icon}</span>
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function ToggleRow({ icon, title, description, checked, onChange }: { icon: React.ReactNode; title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-3">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-primary"
      />
    </label>
  );
}