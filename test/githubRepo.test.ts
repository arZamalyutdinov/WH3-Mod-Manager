/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DEFAULT_RELEASE_REPOSITORY,
  getReleaseRepository,
  getLatestReleaseApiUrl,
  getGithubRepositoryUrl,
  isZipReleaseAsset,
  isWindowsInstallerReleaseAsset,
  pickPreferredReleaseAsset,
} = require("../src/utility/githubRepo.ts");

test("getReleaseRepository returns default when env is unset", () => {
  const previous = process.env.WH3MM_RELEASE_REPOSITORY;
  delete process.env.WH3MM_RELEASE_REPOSITORY;

  assert.equal(getReleaseRepository(), DEFAULT_RELEASE_REPOSITORY);

  if (previous === undefined) delete process.env.WH3MM_RELEASE_REPOSITORY;
  else process.env.WH3MM_RELEASE_REPOSITORY = previous;
});

test("getReleaseRepository uses env override when valid", () => {
  const previous = process.env.WH3MM_RELEASE_REPOSITORY;
  process.env.WH3MM_RELEASE_REPOSITORY = "owner-name/repo-name";

  assert.equal(getReleaseRepository(), "owner-name/repo-name");

  if (previous === undefined) delete process.env.WH3MM_RELEASE_REPOSITORY;
  else process.env.WH3MM_RELEASE_REPOSITORY = previous;
});

test("getReleaseRepository falls back to default for invalid env", () => {
  const previous = process.env.WH3MM_RELEASE_REPOSITORY;
  process.env.WH3MM_RELEASE_REPOSITORY = "not-a-valid-slug";

  assert.equal(getReleaseRepository(), DEFAULT_RELEASE_REPOSITORY);

  if (previous === undefined) delete process.env.WH3MM_RELEASE_REPOSITORY;
  else process.env.WH3MM_RELEASE_REPOSITORY = previous;
});

test("URL helpers use the repository value", () => {
  assert.equal(getGithubRepositoryUrl("a/b"), "https://github.com/a/b");
  assert.equal(getLatestReleaseApiUrl("a/b"), "https://api.github.com/repos/a/b/releases/latest");
});

test("isZipReleaseAsset accepts zip content types and fallback extensions", () => {
  assert.equal(isZipReleaseAsset({ content_type: "application/zip" }), true);
  assert.equal(isZipReleaseAsset({ content_type: "application/x-zip-compressed" }), true);
  assert.equal(isZipReleaseAsset({ browser_download_url: "https://example.com/release.zip" }), true);
  assert.equal(isZipReleaseAsset({ name: "WH3MM-Windows.zip" }), true);
  assert.equal(isZipReleaseAsset({ content_type: "application/octet-stream", name: "release.bin" }), false);
});

test("isWindowsInstallerReleaseAsset detects installer executables", () => {
  assert.equal(
    isWindowsInstallerReleaseAsset({ name: "WH3MM-Installer-v2.17.8.exe", content_type: "application/octet-stream" }),
    true
  );
  assert.equal(
    isWindowsInstallerReleaseAsset({
      browser_download_url: "https://github.com/example/repo/releases/download/v1/wh3mm-setup.exe",
    }),
    true
  );
  assert.equal(
    isWindowsInstallerReleaseAsset({ content_type: "application/vnd.microsoft.portable-executable" }),
    true
  );
  assert.equal(isWindowsInstallerReleaseAsset({ name: "wh3mm-win32-x64.zip" }), false);
  assert.equal(isWindowsInstallerReleaseAsset({ name: "portable.exe" }), false);
});

test("pickPreferredReleaseAsset prioritizes installer over zip and falls back to zip", () => {
  const zipAsset = {
    name: "wh3mm-win32-x64-2.17.8.zip",
    browser_download_url: "https://example.com/wh3mm-win32-x64-2.17.8.zip",
  };
  const installerAsset = {
    name: "WH3MM-Installer-v2.17.8.exe",
    browser_download_url: "https://example.com/WH3MM-Installer-v2.17.8.exe",
  };

  assert.deepEqual(pickPreferredReleaseAsset([zipAsset, installerAsset]), installerAsset);
  assert.deepEqual(pickPreferredReleaseAsset([zipAsset]), zipAsset);
  assert.equal(pickPreferredReleaseAsset([]), undefined);
});
