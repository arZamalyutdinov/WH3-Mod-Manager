/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");
const { findModForToggle } = require("../src/utility/modToggle.ts");

const createMod = (overrides = {}) => ({
  humanName: "Test Mod",
  name: "test_mod",
  path: "/mods/test_mod.pack",
  imgPath: "",
  workshopId: "123",
  isEnabled: false,
  modDirectory: "",
  isInData: false,
  loadOrder: 0,
  author: "author",
  isDeleted: false,
  isMovie: false,
  size: 1,
  isSymbolicLink: false,
  categories: [],
  tags: [],
  ...overrides,
});

test("findModForToggle matches by path first", () => {
  const firstMod = createMod({ name: "dup_a", path: "/mods/dup_a.pack", workshopId: "same-id" });
  const secondMod = createMod({ name: "dup_b", path: "/mods/dup_b.pack", workshopId: "same-id" });
  const mods = [firstMod, secondMod];

  const target = findModForToggle(mods, {
    ...secondMod,
    name: "changed_name_does_not_matter",
  });

  assert.equal(target?.path, "/mods/dup_b.pack");
});

test("findModForToggle falls back to workshopId when path is unavailable", () => {
  const firstMod = createMod({ name: "a", path: "/mods/a.pack", workshopId: "111" });
  const secondMod = createMod({ name: "b", path: "/mods/b.pack", workshopId: "222" });

  const target = findModForToggle([firstMod, secondMod], {
    ...secondMod,
    path: "",
  });

  assert.equal(target?.workshopId, "222");
});

test("findModForToggle falls back to name when both path and workshopId are unavailable", () => {
  const firstMod = createMod({ name: "named_target", path: "/mods/named_target.pack", workshopId: "" });
  const secondMod = createMod({ name: "other", path: "/mods/other.pack", workshopId: "" });

  const target = findModForToggle([firstMod, secondMod], {
    ...firstMod,
    path: "",
    workshopId: "",
  });

  assert.equal(target?.name, "named_target");
});
