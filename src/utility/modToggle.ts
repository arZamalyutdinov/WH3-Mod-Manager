export const findModForToggle = (mods: Mod[], inputMod: Mod): Mod | undefined => {
  return (
    mods.find((mod) => mod.path === inputMod.path) ||
    mods.find((mod) => mod.workshopId !== "" && mod.workshopId === inputMod.workshopId) ||
    mods.find((mod) => mod.name === inputMod.name)
  );
};
