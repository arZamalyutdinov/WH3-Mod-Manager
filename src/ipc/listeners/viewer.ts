import { ipcMain } from "electron";

type OnHandler = (event: Electron.IpcMainEvent, ...args: any[]) => void;

export type ViewerListenerHandlers = {
  onRequestOpenModInViewer: OnHandler;
  onRequestOpenSkillsWindow: OnHandler;
  onViewerIsReady: OnHandler;
  onSkillsAreReady: OnHandler;
};

export const registerViewerListeners = (handlers: ViewerListenerHandlers) => {
  ipcMain.on("requestOpenModInViewer", handlers.onRequestOpenModInViewer);
  ipcMain.on("requestOpenSkillsWindow", handlers.onRequestOpenSkillsWindow);
  ipcMain.on("viewerIsReady", handlers.onViewerIsReady);
  ipcMain.on("skillsAreReady", handlers.onSkillsAreReady);
};
