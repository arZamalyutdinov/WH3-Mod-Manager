import test from "node:test";
import assert from "node:assert/strict";
import { getModCheckboxId, isModEffectivelyEnabled } from "../src/utility/modRowHelpers";

test("isModEffectivelyEnabled keeps always-enabled mods checked", () => {
  assert.equal(isModEffectivelyEnabled({ isEnabled: true }, false), true);
  assert.equal(isModEffectivelyEnabled({ isEnabled: false }, true), true);
  assert.equal(isModEffectivelyEnabled({ isEnabled: false }, false), false);
});

test("getModCheckboxId prefers workshopId and sanitizes unsafe characters", () => {
  const id = getModCheckboxId({
    workshopId: " 12 34/56 ",
    path: "C:\\mods\\file.pack",
    name: "file.pack",
  });

  assert.equal(id, "12_34_56_enabled");
});

test("getModCheckboxId falls back to path then name", () => {
  const fromPath = getModCheckboxId({
    workshopId: "",
    path: "C:\\mods\\my file.pack",
    name: "my file.pack",
  });
  assert.equal(fromPath, "C:_mods_my_file_pack_enabled");

  const fromName = getModCheckboxId({
    workshopId: "",
    path: "",
    name: "my mod",
  });
  assert.equal(fromName, "my_mod_enabled");
});
