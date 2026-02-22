/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DEFAULT_DROPDOWN_VIEWPORT_PADDING,
  getClampedDropdownPosition,
} = require("../src/utility/dropdownPosition.ts");

test("getClampedDropdownPosition preserves click point when menu fits in viewport", () => {
  const result = getClampedDropdownPosition({
    clickX: 200,
    clickY: 240,
    menuWidth: 180,
    menuHeight: 220,
    viewportWidth: 1400,
    viewportHeight: 900,
  });

  assert.deepEqual(result, { x: 200, y: 240 });
});

test("getClampedDropdownPosition flips upward when bottom overflow has space above", () => {
  const result = getClampedDropdownPosition({
    clickX: 320,
    clickY: 700,
    menuWidth: 220,
    menuHeight: 280,
    viewportWidth: 1280,
    viewportHeight: 900,
  });

  assert.equal(result.y, 420);
  assert.equal(result.x, 320);
});

test("getClampedDropdownPosition clamps inside viewport when overflowing both axes", () => {
  const result = getClampedDropdownPosition({
    clickX: 1200,
    clickY: 880,
    menuWidth: 260,
    menuHeight: 320,
    viewportWidth: 1280,
    viewportHeight: 900,
  });

  assert.equal(result.x, 1280 - 260 - DEFAULT_DROPDOWN_VIEWPORT_PADDING);
  assert.equal(result.y, 560);
});

test("getClampedDropdownPosition enforces minimum padding for negative click coordinates", () => {
  const result = getClampedDropdownPosition({
    clickX: -40,
    clickY: -50,
    menuWidth: 180,
    menuHeight: 220,
    viewportWidth: 1280,
    viewportHeight: 900,
  });

  assert.equal(result.x, DEFAULT_DROPDOWN_VIEWPORT_PADDING);
  assert.equal(result.y, DEFAULT_DROPDOWN_VIEWPORT_PADDING);
});

