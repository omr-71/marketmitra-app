import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createUserSupabaseClient(accessToken: string) {
  const url =
    process.env["SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"] ||
    "https://bulpboucdnkvepxabyuy.supabase.co";
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_ANON_KEY"];

  if (!publishableKey) {
    throw new Error(
      "Missing Supabase environment variable(s): SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createClient<Database>(url, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
