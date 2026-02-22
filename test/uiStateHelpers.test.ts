/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getVisibleMainWindowTabs,
  getMainWindowTabFromHotkey,
  getPresetSelectOperation,
} = require("../src/utility/uiStateHelpers.ts");

test("getVisibleMainWindowTabs omits node editor when modder features are disabled", () => {
  const tabs = getVisibleMainWindowTabs(false);
  assert.deepEqual(tabs, ["mods", "enabledMods", "categories"]);
});

test("getVisibleMainWindowTabs includes node editor when modder features are enabled", () => {
  const tabs = getVisibleMainWindowTabs(true);
  assert.deepEqual(tabs, ["mods", "enabledMods", "categories", "nodeEditor"]);
});

test("getMainWindowTabFromHotkey resolves valid ctrl-number mappings", () => {
  assert.equal(getMainWindowTabFromHotkey("1", false), "mods");
  assert.equal(getMainWindowTabFromHotkey("2", false), "enabledMods");
  assert.equal(getMainWindowTabFromHotkey("3", false), "categories");
  assert.equal(getMainWindowTabFromHotkey("4", false), undefined);
  assert.equal(getMainWindowTabFromHotkey("4", true), "nodeEditor");
});

test("getPresetSelectOperation prioritizes control over shift and defaults to unary", () => {
  assert.equal(getPresetSelectOperation(false, false), "unary");
  assert.equal(getPresetSelectOperation(false, true), "addition");
  assert.equal(getPresetSelectOperation(true, false), "subtraction");
  assert.equal(getPresetSelectOperation(true, true), "subtraction");
});
