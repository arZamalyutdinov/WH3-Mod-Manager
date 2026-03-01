export async function resolve(specifier, context, defaultResolve) {
  try {
    return await defaultResolve(specifier, context, defaultResolve);
  } catch (error) {
    const isRelativeSpecifier = specifier.startsWith("./") || specifier.startsWith("../");
    if (isRelativeSpecifier && error && error.code === "ERR_MODULE_NOT_FOUND") {
      const hasTypeScriptExtension = specifier.endsWith(".ts") || specifier.endsWith(".tsx");
      const specifiersToTry = hasTypeScriptExtension
        ? [specifier.endsWith(".ts") ? specifier.slice(0, -3) + ".tsx" : ""]
        : [`${specifier}.ts`, `${specifier}.tsx`];

      for (const nextSpecifier of specifiersToTry) {
        if (!nextSpecifier) continue;
        try {
          return await defaultResolve(nextSpecifier, context, defaultResolve);
        } catch {
          // try the next extension candidate
        }
      }
    }

    throw error;
  }
}
