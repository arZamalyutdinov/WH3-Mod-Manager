const tabsWithoutModderFeatures: MainWindowTab[] = ["mods", "enabledMods", "categories"];
const tabsWithModderFeatures: MainWindowTab[] = [...tabsWithoutModderFeatures, "nodeEditor"];

export const getVisibleMainWindowTabs = (isFeaturesForModdersEnabled: boolean): MainWindowTab[] => {
  return isFeaturesForModdersEnabled ? tabsWithModderFeatures : tabsWithoutModderFeatures;
};

export const getMainWindowTabFromHotkey = (
  key: string,
  isFeaturesForModdersEnabled: boolean
): MainWindowTab | undefined => {
  switch (key) {
    case "1":
      return "mods";
    case "2":
      return "enabledMods";
    case "3":
      return "categories";
    case "4":
      return isFeaturesForModdersEnabled ? "nodeEditor" : undefined;
    default:
      return undefined;
  }
};

export const getPresetSelectOperation = (
  isControlDown: boolean,
  isShiftDown: boolean
): SelectOperation => {
  if (isControlDown) return "subtraction";
  if (isShiftDown) return "addition";
  return "unary";
};
