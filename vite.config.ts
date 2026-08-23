// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Load all env vars (including non-VITE_ server secrets) into process.env for
// server-side code only. These are NOT exposed to the client bundle.
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

// These are public browser connection values (not secrets). Keeping the managed
// project values as a final fallback prevents an otherwise healthy deployment
// from shipping an empty auth configuration when build-time env forwarding is
// temporarily unavailable.
const managedSupabaseUrl = "https://ghzryoakvupugazhxezf.supabase.co";
const managedSupabasePublishableKey =
  "sb_publishable_F8NR-8jKb4D6x28q-ffsPw_kvv9lVX1";

// Lovable Cloud provides the canonical backend bindings as SUPABASE_*.
// The generated browser client intentionally reads VITE_SUPABASE_* instead,
// so make the URL and publishable (public) key available at bundle time even
// when a deployment only injects the canonical names.
const browserSupabaseUrl =
  process.env["VITE_SUPABASE_URL"] ??
  process.env["SUPABASE_URL"] ??
  managedSupabaseUrl;
const browserSupabasePublishableKey =
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  process.env["SUPABASE_PUBLISHABLE_KEY"] ??
  managedSupabasePublishableKey;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(browserSupabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        browserSupabasePublishableKey,
      ),
    },
    resolve: {
      alias: {
        // `entities` v4 has no ./escape or ./decode subpaths (parse5 v8 expects v6),
        // so point those bare subpaths at the real ESM files.
        "entities/lib/decode.js": path.resolve(import.meta.dirname, "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(import.meta.dirname, "node_modules/entities/lib/encode.js"),
        "entities/escape": path.resolve(import.meta.dirname, "node_modules/entities/lib/esm/escape.js"),
        "entities/decode": path.resolve(import.meta.dirname, "node_modules/entities/lib/esm/decode.js"),
        entities: path.resolve(import.meta.dirname, "node_modules/entities"),
      },
    },

  },
});
