import assert from "node:assert/strict";
import test from "node:test";

import { isAuthorizedCronRequest } from "./notification-cron-policy.ts";

test("cron authorization rejects missing secrets and headers", () => {
  assert.equal(isAuthorizedCronRequest(null, "configured-secret"), false);
  assert.equal(isAuthorizedCronRequest("Bearer configured-secret", undefined), false);
  assert.equal(isAuthorizedCronRequest("Bearer configured-secret", ""), false);
});

test("cron authorization rejects invalid credentials", () => {
  assert.equal(isAuthorizedCronRequest("Bearer wrong-secret", "configured-secret"), false);
  assert.equal(isAuthorizedCronRequest("configured-secret", "configured-secret"), false);
});

test("cron authorization accepts the Vercel CRON_SECRET bearer header", () => {
  assert.equal(isAuthorizedCronRequest("Bearer configured-secret", "configured-secret"), true);
});
