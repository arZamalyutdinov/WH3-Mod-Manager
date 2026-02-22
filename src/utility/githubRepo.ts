export const DEFAULT_RELEASE_REPOSITORY = "arZamalyutdinov/WH3-Mod-Manager";

const isValidRepositorySlug = (repository: string) => {
  // expected format: owner/repo
  return repository.split("/").filter(Boolean).length === 2;
};

export const getReleaseRepository = () => {
  const configuredRepository = process.env.WH3MM_RELEASE_REPOSITORY?.trim();
  if (!configuredRepository) return DEFAULT_RELEASE_REPOSITORY;

  return isValidRepositorySlug(configuredRepository) ? configuredRepository : DEFAULT_RELEASE_REPOSITORY;
};

export const getGithubRepositoryUrl = (repository = getReleaseRepository()) => {
  return `https://github.com/${repository}`;
};

export const getLatestReleaseApiUrl = (repository = getReleaseRepository()) => {
  return `https://api.github.com/repos/${repository}/releases/latest`;
};

export const isZipReleaseAsset = (asset: {
  content_type?: string;
  browser_download_url?: string;
  name?: string;
}) => {
  const contentType = asset.content_type?.toLowerCase() ?? "";
  if (contentType === "application/zip" || contentType === "application/x-zip-compressed") {
    return true;
  }

  const downloadUrl = asset.browser_download_url?.toLowerCase() ?? "";
  if (downloadUrl.endsWith(".zip")) return true;

  const name = asset.name?.toLowerCase() ?? "";
  return name.endsWith(".zip");
};
