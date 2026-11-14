import assert from "node:assert/strict";
import test from "node:test";

import { shouldShowAndroidAppDownload } from "./android-app-download-policy.ts";

test("shows the prompt in a mobile browser", () => {
  assert.equal(
    shouldShowAndroidAppDownload({
      isMobileViewport: true,
      hasNativeBridge: false,
      referrer: "",
    }),
    true,
  );
});

test("hides the prompt on desktop", () => {
  assert.equal(
    shouldShowAndroidAppDownload({
      isMobileViewport: false,
      hasNativeBridge: false,
      referrer: "",
    }),
    false,
  );
});

test("hides the prompt in the installed native app regardless of viewport", () => {
  assert.equal(
    shouldShowAndroidAppDownload({
      isMobileViewport: true,
      hasNativeBridge: true,
      referrer: "",
    }),
    false,
  );
  assert.equal(
    shouldShowAndroidAppDownload({
      isMobileViewport: false,
      hasNativeBridge: true,
      referrer: "",
    }),
    false,
  );
});

test("hides the prompt when launched from the Market Mitra TWA package", () => {
  assert.equal(
    shouldShowAndroidAppDownload({
      isMobileViewport: true,
      hasNativeBridge: false,
      referrer: "android-app://app.marketmitra.android/",
    }),
    false,
  );
});
