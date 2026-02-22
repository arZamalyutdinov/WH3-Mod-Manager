/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  humanizeLocalizationKey,
  resolveLocalizedValue,
  buildLocalizationMap,
} = require("../src/utility/localizationHelpers.ts");

test("humanizeLocalizationKey splits camel case and underscores", () => {
  assert.equal(humanizeLocalizationKey("selectOrCreatePreset"), "Select Or Create Preset");
  assert.equal(humanizeLocalizationKey("faq_first_header"), "Faq first header");
});

test("resolveLocalizedValue prefers translated values and falls back to readable labels", () => {
  assert.equal(resolveLocalizedValue("checkCompat", "Check Compatibility", "Check Compat"), "Check Compatibility");
  assert.equal(resolveLocalizedValue("checkCompat", "checkCompat", "Check Compat"), "Check Compat");
  assert.equal(resolveLocalizedValue("modCompatibility", "modCompatibility"), "Mod Compatibility");
});

test("buildLocalizationMap merges translated values with fallback defaults", () => {
  const fallback = {
    checkCompat: "Check Compat",
    modCompatibility: "Mod Compatibility",
    faqAbbreviated: "FAQ",
  };
  const translated = {
    checkCompat: "checkCompat",
    modCompatibility: "Mod Compatibility",
    extraUnknownLabel: "extraUnknownLabel",
  };

  const result = buildLocalizationMap(translated, fallback);

  assert.equal(result.checkCompat, "Check Compat");
  assert.equal(result.modCompatibility, "Mod Compatibility");
  assert.equal(result.faqAbbreviated, "FAQ");
  assert.equal(result.extraUnknownLabel, "Extra Unknown Label");
});
