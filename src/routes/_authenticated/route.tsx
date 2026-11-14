import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { BrandLoader } from "@/components/brand-loader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
  pendingComponent: AuthPending,
});

function AuthPending() {
  return <BrandLoader message="Verifying your secure connection" />;
}
