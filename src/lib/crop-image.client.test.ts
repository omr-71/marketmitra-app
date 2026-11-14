import assert from "node:assert/strict";
import test from "node:test";

import { validateCropImageFile } from "./crop-image.ts";

test("accepts common browser-decodable crop photo formats", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp", "image/avif"]) {
    assert.equal(validateCropImageFile(new File(["photo"], "leaf", { type })), null);
  }
});

test("rejects unsupported formats and oversized source photos before decoding", () => {
  assert.equal(
    validateCropImageFile(new File(["photo"], "leaf.heic", { type: "image/heic" })),
    "unsupported",
  );
  assert.equal(
    validateCropImageFile(
      new File([new Uint8Array(20 * 1024 * 1024 + 1)], "leaf.jpg", { type: "image/jpeg" }),
    ),
    "too_large",
  );
});
