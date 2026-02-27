import test from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as nodePath from "node:path";
import * as os from "node:os";
import { searchPackFiles } from "../src/utility/packSearch";

const createTempDir = async () => {
  return await fs.mkdtemp(nodePath.join(os.tmpdir(), "wh3mm-pack-search-"));
};

test("searchPackFiles finds matches in utf8 and utf16le pack data and strips .pack extension", async () => {
  const tempDir = await createTempDir();
  try {
    const utf8PackPath = nodePath.join(tempDir, "utf8-mod.pack");
    const utf16PackPath = nodePath.join(tempDir, "utf16-mod.pack");
    const noMatchPackPath = nodePath.join(tempDir, "nomatch.pack");

    await fs.writeFile(utf8PackPath, Buffer.from("lorem target_phrase ipsum", "utf8"));
    await fs.writeFile(utf16PackPath, Buffer.from("foo target_phrase bar", "utf16le"));
    await fs.writeFile(noMatchPackPath, Buffer.from("completely different", "utf8"));

    const result = await searchPackFiles([utf8PackPath, utf16PackPath, noMatchPackPath], "target_phrase");

    assert.deepEqual(
      new Set(result),
      new Set([utf8PackPath.replace(/\.pack$/i, ""), utf16PackPath.replace(/\.pack$/i, "")]),
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("searchPackFiles returns unique results even when duplicate pack paths are provided", async () => {
  const tempDir = await createTempDir();
  try {
    const packPath = nodePath.join(tempDir, "duplicate.pack");
    await fs.writeFile(packPath, Buffer.from("needle appears once", "utf8"));

    const result = await searchPackFiles([packPath, packPath, packPath], "needle");

    assert.deepEqual(result, [packPath.replace(/\.pack$/i, "")]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("searchPackFiles returns an empty list when search term is empty", async () => {
  const tempDir = await createTempDir();
  try {
    const packPath = nodePath.join(tempDir, "any.pack");
    await fs.writeFile(packPath, Buffer.from("content", "utf8"));

    const result = await searchPackFiles([packPath], "   ");

    assert.deepEqual(result, []);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("searchPackFiles matches terms split across read-stream chunk boundaries", async () => {
  const tempDir = await createTempDir();
  try {
    const packPath = nodePath.join(tempDir, "chunked.pack");
    await fs.writeFile(packPath, Buffer.from("xxchunk_boundary_matchyy", "utf8"));

    const result = await searchPackFiles([packPath], "chunk_boundary_match", { highWaterMark: 3 });

    assert.deepEqual(result, [packPath.replace(/\.pack$/i, "")]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
