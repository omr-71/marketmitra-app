import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

test("PKCE callback exchanges its code and restores the initial session", async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const storageValues = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => storageValues.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      storageValues.set(key, value);
    },
    removeItem: async (key: string) => {
      storageValues.delete(key);
    },
  };
  const user = {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: "oauth-test@example.invalid",
    app_metadata: { provider: "google", providers: ["google"] },
    user_metadata: { full_name: "OAuth Test" },
    created_at: "2026-01-01T00:00:00.000Z",
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      aud: "authenticated",
      exp: now + 3600,
      iat: now,
      role: "authenticated",
      email: user.email,
    }),
  ).toString("base64url");
  const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.mock-signature`;
  const callbackUrl = new URL("https://www.marketmitra.app/auth?code=mock-pkce-code");
  const requests: string[] = [];
  let subscription: { unsubscribe: () => void } | undefined;
  let client: ReturnType<typeof createClient> | undefined;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: callbackUrl,
      history: {
        state: null,
        replaceState: (_state: unknown, _title: string, url: string) => {
          callbackUrl.href = url;
        },
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {},
  });

  try {
    storageValues.set(
      "sb-bulpboucdnkvepxabyuy-auth-token-code-verifier",
      JSON.stringify("mock-verifier-string-with-enough-length/"),
    );

    client = createClient("https://bulpboucdnkvepxabyuy.supabase.co", "sb_publishable_test_key", {
      auth: {
        storage,
        storageKey: "sb-bulpboucdnkvepxabyuy-auth-token",
        flowType: "pkce",
        detectSessionInUrl: true,
        autoRefreshToken: false,
      },
      global: {
        fetch: async (input) => {
          const url = new URL(input instanceof Request ? input.url : String(input));
          requests.push(url.pathname);

          if (url.pathname !== "/auth/v1/token") {
            throw new Error("Unexpected request in the PKCE callback test");
          }

          return new Response(
            JSON.stringify({
              access_token: accessToken,
              token_type: "bearer",
              expires_in: 3600,
              refresh_token: "mock-refresh-token",
              user,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        },
      },
    });

    const events: Array<{ event: string; hasSession: boolean }> = [];
    let resolveInitialSession: ((hasUser: boolean) => void) | undefined;
    const initialSession = new Promise<boolean>((resolve) => {
      resolveInitialSession = resolve;
    });

    const { data } = client.auth.onAuthStateChange((event, session) => {
      events.push({ event, hasSession: Boolean(session?.user) });
      if (event === "INITIAL_SESSION") {
        resolveInitialSession?.(Boolean(session?.user));
      }
    });
    subscription = data.subscription;

    assert.equal(await initialSession, true);
    const { data: sessionData, error } = await client.auth.getSession();

    assert.equal(error, null);
    assert.equal(sessionData.session?.user.id, user.id);
    assert.deepEqual(requests, ["/auth/v1/token"]);
    assert.deepEqual(events, [
      { event: "SIGNED_IN", hasSession: true },
      { event: "INITIAL_SESSION", hasSession: true },
    ]);
    assert.equal(callbackUrl.searchParams.has("code"), false);
  } finally {
    subscription?.unsubscribe();
    await client?.auth.dispose();

    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }

    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  }
});
