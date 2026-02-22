/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DEFAULT_RELEASE_REPOSITORY,
  getReleaseRepository,
  getLatestReleaseApiUrl,
  getGithubRepositoryUrl,
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
