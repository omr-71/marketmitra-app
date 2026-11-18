import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";

import { MitraAILauncher } from "@/components/mitra-ai-launcher";
import { SideNav, BottomNav, ShellContext } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

let cachedUser: User | null = null;

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUser = session?.user ?? null;
  });
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // 1. In-memory fast path: instant return with zero network roundtrip
    if (cachedUser) {
      return { user: cachedUser };
    }

    // 2. Client-side local session check: reads token from local storage (0ms, no network call)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        cachedUser = sessionData.session.user;
        return { user: cachedUser };
      }
    } catch {
      // Fall through to remote check on unexpected storage error
    }

    // 3. Fallback: remote network verification only when initial session is unverified
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    cachedUser = data.user;
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <ShellContext.Provider value={{ hasOuterShell: true }}>
      <div className="app-canvas min-h-screen bg-[#f9fafb]">
        <SideNav />

        <div className="min-w-0 flex-1 bg-transparent lg:pl-[18rem] lg:py-4 lg:pr-4">
          <Outlet />
        </div>

        <div aria-hidden="true" className="bottom-nav-scroll-glass" />
        <BottomNav />
      </div>
      <MitraAILauncher />
    </ShellContext.Provider>
  );
}
