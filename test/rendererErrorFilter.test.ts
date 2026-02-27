/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");
const { shouldIgnoreWindowError } = require("../src/rendererErrorFilter.ts");

test("shouldIgnoreWindowError ignores known ResizeObserver browser warnings", () => {
  assert.equal(shouldIgnoreWindowError("ResizeObserver loop completed with undelivered notifications"), true);
  assert.equal(shouldIgnoreWindowError("ResizeObserver loop limit exceeded"), true);
});

test("shouldIgnoreWindowError does not ignore unrelated errors", () => {
  assert.equal(shouldIgnoreWindowError("ReferenceError: foo is not defined"), false);
  assert.equal(shouldIgnoreWindowError(""), false);
});

