import { ipcMain } from "electron";

type OnHandler = (event: Electron.IpcMainEvent, ...args: any[]) => void;
type HandleHandler = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any;

export type PackListenerHandlers = {
  onGetPackData: OnHandler;
  onGetPackDataWithLocs: OnHandler;
  onReadMods: OnHandler;
  onSearchInsidePacks: OnHandler;
  onGetTableReferences: OnHandler;
  onStartGame: OnHandler;
  handleExecuteDBDuplication: HandleHandler;
  handleBuildDBReferenceTree: HandleHandler;
  handleGetDBNameToDBVersions: HandleHandler;
  handleGetDefaultTableVersions: HandleHandler;
  handleSelectDirectory: HandleHandler;
  handleCreateNewPack: HandleHandler;
};

export const registerPackListeners = (handlers: PackListenerHandlers) => {
  ipcMain.on("getPackData", handlers.onGetPackData);
  ipcMain.on("getPackDataWithLocs", handlers.onGetPackDataWithLocs);
  ipcMain.on("readMods", handlers.onReadMods);
  ipcMain.on("searchInsidePacks", handlers.onSearchInsidePacks);
  ipcMain.on("getTableReferences", handlers.onGetTableReferences);
  ipcMain.on("startGame", handlers.onStartGame);
  ipcMain.handle("executeDBDuplication", handlers.handleExecuteDBDuplication);
  ipcMain.handle("buildDBReferenceTree", handlers.handleBuildDBReferenceTree);
  ipcMain.handle("getDBNameToDBVersions", handlers.handleGetDBNameToDBVersions);
  ipcMain.handle("getDefaultTableVersions", handlers.handleGetDefaultTableVersions);
  ipcMain.handle("selectDirectory", handlers.handleSelectDirectory);
  ipcMain.handle("createNewPack", handlers.handleCreateNewPack);
};
