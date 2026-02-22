/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");
const { getDragAutoScrollDelta } = require("../src/utility/dragAutoScroll.ts");

test("getDragAutoScrollDelta returns 0 in neutral viewport zone", () => {
  assert.equal(getDragAutoScrollDelta(300, 900), 0);
});

test("getDragAutoScrollDelta returns negative values near top edge", () => {
  const nearTop = getDragAutoScrollDelta(10, 900);
  const lessNearTop = getDragAutoScrollDelta(100, 900);

  assert.ok(nearTop < 0);
  assert.ok(lessNearTop < 0);
  assert.ok(Math.abs(nearTop) > Math.abs(lessNearTop));
});

test("getDragAutoScrollDelta returns positive values near bottom edge", () => {
  const nearBottom = getDragAutoScrollDelta(895, 900);
  const lessNearBottom = getDragAutoScrollDelta(850, 900);

  assert.ok(nearBottom > 0);
  assert.ok(lessNearBottom > 0);
  assert.ok(nearBottom > lessNearBottom);
});
