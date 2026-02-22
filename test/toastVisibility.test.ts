/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");
const { getVisibleToastsAt, hasVisibleToastsAt, isToastVisibleAt } = require("../src/utility/toastVisibility.ts");

const createToast = (startTime: number, duration?: number) => ({
  type: "info",
  messages: ["msg"],
  startTime,
  duration,
});

test("isToastVisibleAt respects custom duration", () => {
  const toast = createToast(1_000, 2_000);
  assert.equal(isToastVisibleAt(toast, 2_500), true);
  assert.equal(isToastVisibleAt(toast, 3_001), false);
});

test("isToastVisibleAt falls back to default duration", () => {
  const toast = createToast(5_000);
  assert.equal(isToastVisibleAt(toast, 9_999), true);
  assert.equal(isToastVisibleAt(toast, 10_001), false);
});

test("getVisibleToastsAt filters out expired toasts", () => {
  const toasts = [
    createToast(10_000, 500),
    createToast(10_000, 5_000),
    createToast(8_000, 500),
  ];

  const visible = getVisibleToastsAt(toasts, 10_400);
  assert.equal(visible.length, 2);
});

test("hasVisibleToastsAt returns false when all toasts are expired", () => {
  const toasts = [createToast(10_000, 500), createToast(9_000, 500)];
  assert.equal(hasVisibleToastsAt(toasts, 10_600), false);
});
