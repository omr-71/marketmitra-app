import assert from "node:assert/strict";
import test from "node:test";

import { crops } from "./crops.ts";
import {
  marketCommodityMatches,
  marketCommodityVariants,
  normalizeMarketCommodity,
} from "./market-commodity.ts";

test("every catalog crop has a stable commodity mapping", () => {
  assert.equal(crops.length, 18);
  for (const crop of crops) {
    assert.ok(marketCommodityVariants(crop.commodity).includes(crop.commodity), crop.id);
  }
});

test("maps source spellings to the selected catalog commodity", () => {
  const cases = [
    ["Soyabean", "Soybean"],
    ["Paddy(Dhan)(Common)", "Dhan"],
    ["Bajra(Pearl Millet/Cumbu)", "Pearl Millet"],
    ["Jowar(Sorghum)", "Sorghum"],
    ["Arhar (Tur/Red Gram)(Whole)", "Tur"],
    ["Bengal Gram(Gram)(Whole)", "Chana"],
    ["Green Chilli", "Chilli Green"],
  ] as const;

  for (const [selected, reported] of cases) {
    assert.equal(marketCommodityMatches(selected, reported), true);
    assert.equal(normalizeMarketCommodity(reported, selected), reported);
  }
});

test("does not normalize a different crop as the selected commodity", () => {
  assert.equal(marketCommodityMatches("Onion", "Tomato"), false);
  assert.equal(normalizeMarketCommodity("Onion", "Tomato"), null);
});

test("unknown commodities retain exact-match behavior", () => {
  assert.deepEqual(marketCommodityVariants("Unlisted Crop"), ["Unlisted Crop"]);
  assert.equal(marketCommodityMatches("Unlisted Crop", "unlisted-crop"), true);
  assert.equal(marketCommodityMatches("Unlisted Crop", "Another Crop"), false);
});
