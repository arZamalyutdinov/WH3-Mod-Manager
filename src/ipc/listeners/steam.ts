import { ipcMain } from "electron";

type OnHandler = (event: Electron.IpcMainEvent, ...args: any[]) => void;

export type SteamListenerHandlers = {
  onUploadMod: OnHandler;
  onUpdateMod: OnHandler;
  onFakeUpdatePack: OnHandler;
  onMakePackBackup: OnHandler;
  onImportSteamCollection: OnHandler;
  onForceModDownload: OnHandler;
  onReMerge: OnHandler;
  onDeletePack: OnHandler;
  onForceDownloadMods: OnHandler;
  onForceResubscribeMods: OnHandler;
  onUnsubscribeToMod: OnHandler;
  onMergeMods: OnHandler;
  onSubscribeToMods: OnHandler;
  onExportModsToClipboard: OnHandler;
  onExportModNamesToClipboard: OnHandler;
  onCreateSteamCollection: OnHandler;
};

export const registerSteamListeners = (handlers: SteamListenerHandlers) => {
  ipcMain.on("uploadMod", handlers.onUploadMod);
  ipcMain.on("updateMod", handlers.onUpdateMod);
  ipcMain.on("fakeUpdatePack", handlers.onFakeUpdatePack);
  ipcMain.on("makePackBackup", handlers.onMakePackBackup);
  ipcMain.on("importSteamCollection", handlers.onImportSteamCollection);
  ipcMain.on("forceModDownload", handlers.onForceModDownload);
  ipcMain.on("reMerge", handlers.onReMerge);
  ipcMain.on("deletePack", handlers.onDeletePack);
  ipcMain.on("forceDownloadMods", handlers.onForceDownloadMods);
  ipcMain.on("forceResubscribeMods", handlers.onForceResubscribeMods);
  ipcMain.on("unsubscribeToMod", handlers.onUnsubscribeToMod);
  ipcMain.on("mergeMods", handlers.onMergeMods);
  ipcMain.on("subscribeToMods", handlers.onSubscribeToMods);
  ipcMain.on("exportModsToClipboard", handlers.onExportModsToClipboard);
  ipcMain.on("exportModNamesToClipboard", handlers.onExportModNamesToClipboard);
  ipcMain.on("createSteamCollection", handlers.onCreateSteamCollection);
};
