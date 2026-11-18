import assert from "node:assert/strict";
import test from "node:test";

import { crops, getDefaultCropPrice, UNLISTED_CROP_DEFAULT_PRICE } from "./crops";
import { cropForCommodity, marketCommodityVariants } from "./market-commodity";
import { aggregateMarketPrices } from "./market-providers.server";
import { inr } from "./format";

test("every catalog crop has a valid default price structure", () => {
  assert.equal(crops.length, 18);
  for (const crop of crops) {
    assert.ok(crop.defaultPrice, `Missing defaultPrice for ${crop.id}`);
    assert.ok(crop.defaultPrice.minPrice > 0, `minPrice <= 0 for ${crop.id}`);
    assert.ok(crop.defaultPrice.modalPrice >= crop.defaultPrice.minPrice, `modalPrice < minPrice for ${crop.id}`);
    assert.ok(crop.defaultPrice.maxPrice >= crop.defaultPrice.modalPrice, `maxPrice < modalPrice for ${crop.id}`);
  }
});

test("getDefaultCropPrice returns crop-specific price or unlisted fallback", () => {
  const onionPrice = getDefaultCropPrice("onion");
  assert.equal(onionPrice.modalPrice, 2400);

  const bajraPrice = getDefaultCropPrice("Bajra(Pearl Millet/Cumbu)");
  assert.equal(bajraPrice.modalPrice, 2625);

  const unlistedPrice = getDefaultCropPrice("Dragonfruit");
  assert.deepEqual(unlistedPrice, UNLISTED_CROP_DEFAULT_PRICE);
});

test("cropForCommodity finds crop by id, commodity, aliases, or multilingual names", () => {
  assert.equal(cropForCommodity("onion")?.id, "onion");
  assert.equal(cropForCommodity("कांदा")?.id, "onion");
  assert.equal(cropForCommodity("प्याज")?.id, "onion");
  assert.equal(cropForCommodity("tur")?.id, "tur");
  assert.equal(cropForCommodity("Arhar")?.id, "tur");
  assert.equal(cropForCommodity("Chana")?.id, "gram");
  assert.equal(cropForCommodity("bajra")?.id, "bajra");
  assert.equal(cropForCommodity("Pearl Millet")?.id, "bajra");
});

test("marketCommodityVariants places the official commodity name first", () => {
  const turVariants = marketCommodityVariants("tur");
  assert.equal(turVariants[0], "Arhar (Tur/Red Gram)(Whole)");

  const bajraVariants = marketCommodityVariants("bajra");
  assert.equal(bajraVariants[0], "Bajra(Pearl Millet/Cumbu)");
});

test("inr formatter safely handles null, undefined, and valid numbers without breaking", () => {
  assert.equal(inr(null), "—");
  assert.equal(inr(undefined), "—");
  assert.equal(inr(NaN), "—");
  assert.equal(inr(2400), "₹2,400");
  assert.equal(inr(13500), "₹13,500");
});

test("aggregateMarketPrices guarantees valid non-empty records for unlisted and listed crops", async () => {
  // Test with unlisted crop that will trigger fallback
  const result = await aggregateMarketPrices({
    commodity: "Exotic Unlisted Crop",
    state: "Maharashtra",
    district: "Nashik",
  });

  assert.ok(result.records.length > 0, "Expected at least 1 record");
  const record = result.records[0]!;
  assert.ok(record.modalPrice > 0, "Expected positive modalPrice");
  assert.ok(record.minPrice > 0, "Expected positive minPrice");
  assert.ok(record.maxPrice >= record.modalPrice, "Expected maxPrice >= modalPrice");
  assert.ok(record.date, "Expected date");
  assert.ok(record.market, "Expected market name");
  assert.equal(record.commodity, "Exotic Unlisted Crop");
});
