import assert from "node:assert/strict";
import test from "node:test";
import { getOAuthCallbackUrl, getPostAuthRedirect } from "./auth-redirect.ts";

test("uses the canonical production callback for both Market Mitra domains", () => {
  assert.equal(getOAuthCallbackUrl("https://marketmitra.app"), "https://www.marketmitra.app/auth");
  assert.equal(
    getOAuthCallbackUrl("https://www.marketmitra.app"),
    "https://www.marketmitra.app/auth",
  );
});

test("keeps OAuth callbacks on the current preview or local origin", () => {
  assert.equal(
    getOAuthCallbackUrl("https://marketmitra-git-feature.vercel.app"),
    "https://marketmitra-git-feature.vercel.app/auth",
  );
  assert.equal(getOAuthCallbackUrl("http://localhost:3000"), "http://localhost:3000/auth");
});

test("preserves safe internal destinations including their query and hash", () => {
  assert.equal(getPostAuthRedirect("/markets?crop=onion#nearby"), "/markets?crop=onion#nearby");
});

test("falls back to the dashboard for missing, external, and callback-loop redirects", () => {
  for (const redirect of [
    undefined,
    "https://evil.example",
    "//evil.example/path",
    "////evil.example/path",
    "/auth?redirect=%2Fhome",
    "/auth/",
  ]) {
    assert.equal(getPostAuthRedirect(redirect), "/home");
  }
});
