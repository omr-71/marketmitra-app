import assert from "node:assert/strict";
import test from "node:test";

import {
  filterDistrictRecords,
  marketDistrictMatches,
  marketDistrictVariants,
  noRecentMarketPricesMessage,
} from "./market-district.ts";

test("district aliases isolate only records for the selected district", () => {
  assert.deepEqual(marketDistrictVariants("Nashik"), ["Nashik", "Nasik"]);
  assert.equal(marketDistrictMatches("Nashik", "Nashik"), true);
  assert.equal(marketDistrictMatches("Nasik", "Nashik"), true);
  assert.equal(marketDistrictMatches("Pune", "Nashik"), false);

  const records = [
    { district: "Nashik", modal: 4200 },
    { district: "Nasik", modal: 4100 },
    { district: "Pune", modal: 1800 },
    { district: "Jalgaon", modal: 4500 },
    { district: null, modal: 9000 },
  ];

  assert.deepEqual(filterDistrictRecords(records, "Nashik"), records.slice(0, 2));
});

test("an empty district never matches or returns districtless prices", () => {
  assert.equal(marketDistrictMatches("Nashik", ""), false);
  assert.deepEqual(filterDistrictRecords([{ district: "Nashik" }], ""), []);
});

test("empty market message names the selected district", () => {
  assert.equal(
    noRecentMarketPricesMessage("Nashik"),
    "No recent verified market prices available for this crop in Nashik.",
  );
});
