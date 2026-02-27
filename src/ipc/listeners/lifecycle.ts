import { ipcMain } from "electron";

type OnHandler = (event: Electron.IpcMainEvent, ...args: any[]) => void;

export type LifecycleListenerHandlers = {
  onRequestLanguageChange: OnHandler;
  onRequestGameChange: OnHandler;
  onTerminateGame: OnHandler;
  onOpenFolderInExplorer: OnHandler;
  onOpenInSteam: OnHandler;
  onOpenPack: OnHandler;
  onPutPathInClipboard: OnHandler;
  onCopyModToData: OnHandler;
  onSyncIsFeaturesForModdersEnabled: OnHandler;
};

export const registerLifecycleListeners = (handlers: LifecycleListenerHandlers) => {
  ipcMain.on("requestLanguageChange", handlers.onRequestLanguageChange);
  ipcMain.on("requestGameChange", handlers.onRequestGameChange);
  ipcMain.on("terminateGame", handlers.onTerminateGame);
  ipcMain.on("openFolderInExplorer", handlers.onOpenFolderInExplorer);
  ipcMain.on("openInSteam", handlers.onOpenInSteam);
  ipcMain.on("openPack", handlers.onOpenPack);
  ipcMain.on("putPathInClipboard", handlers.onPutPathInClipboard);
  ipcMain.on("copyModToData", handlers.onCopyModToData);
  ipcMain.on("syncIsFeaturesForModdersEnabled", handlers.onSyncIsFeaturesForModdersEnabled);
};
