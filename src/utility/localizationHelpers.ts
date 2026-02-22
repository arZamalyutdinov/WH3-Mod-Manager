export const humanizeLocalizationKey = (key: string) => {
  const trimmed = key.trim();
  if (!trimmed) return "";

  const spaced = trimmed
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const resolveLocalizedValue = (
  key: string,
  translatedValue: unknown,
  fallbackValue?: unknown
): string => {
  if (typeof translatedValue === "string") {
    const normalizedTranslatedValue = translatedValue.trim();
    if (normalizedTranslatedValue && normalizedTranslatedValue !== key) {
      return normalizedTranslatedValue;
    }
  }

  if (typeof fallbackValue === "string") {
    const normalizedFallbackValue = fallbackValue.trim();
    if (normalizedFallbackValue) return normalizedFallbackValue;
  }

  return humanizeLocalizationKey(key);
};

export const buildLocalizationMap = (
  translatedValues: Record<string, string> | null | undefined,
  fallbackValues: Record<string, string | number>
): Record<string, string> => {
  const translated = translatedValues ?? {};
  const localization: Record<string, string> = {};

  for (const key of Object.keys(fallbackValues)) {
    localization[key] = resolveLocalizedValue(key, translated[key], fallbackValues[key]);
  }

  for (const [key, value] of Object.entries(translated)) {
    if (!(key in localization)) {
      localization[key] = resolveLocalizedValue(key, value);
    }
  }

  return localization;
};
