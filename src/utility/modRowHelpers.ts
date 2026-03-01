type ModEnableState = {
  isEnabled: boolean;
};

type ModIdentity = {
  workshopId?: string | null;
  path: string;
  name: string;
};

export const isModEffectivelyEnabled = (
  mod: ModEnableState,
  isAlwaysEnabled: boolean
): boolean => mod.isEnabled || isAlwaysEnabled;

export const getModCheckboxId = (mod: ModIdentity): string => {
  const rawId = mod.workshopId?.trim() || mod.path || mod.name;
  const normalizedId = rawId.replace(/[^A-Za-z0-9_:-]/g, "_");
  return `${normalizedId}_enabled`;
};
