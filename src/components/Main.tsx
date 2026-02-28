import React from "react";
import { useAppSelector } from "../hooks";
import Sidebar from "./Sidebar";
import ModRows from "./ModRows";
import Categories from "./Categories";
import ModTagPicker from "./ModTagPicker";
import NodeEditor from "./NodeEditor";
import { gameToPackWithDBTablesName } from "../supportedGames";

const Main = () => {
  const currentTab = useAppSelector((state) => state.app.currentTab);
  const currentFlowFileSelection = useAppSelector((state) => state.app.currentFlowFileSelection);
  const currentFlowFilePackPath = useAppSelector((state) => state.app.currentFlowFilePackPath);
  const currentDBTableSelection = useAppSelector((state) => state.app.currentDBTableSelection);
  const currentGame = useAppSelector((state) => state.app.currentGame);

  // Determine current pack: prioritize flow file pack, then DB table pack, then default game pack
  const currentPack =
    currentFlowFilePackPath ??
    currentDBTableSelection?.packPath ??
    (gameToPackWithDBTablesName[currentGame] || "db.pack");

  return (
    <>
      {(currentTab == "nodeEditor" && (
        <NodeEditor currentFile={currentFlowFileSelection} currentPack={currentPack}></NodeEditor>
      )) ||
        (currentTab == "categories" && <Categories></Categories>) || (
          <div className="mx-auto grid h-full min-h-0 max-w-[110rem] grid-cols-1 grid-rows-[minmax(0,1fr)] gap-4 text-white md:grid-cols-[minmax(0,1fr)_clamp(15rem,30vw,22rem)]">
            <div
              id="mod-rows-scroll"
              className="min-w-0 min-h-0 h-full overflow-y-auto overflow-x-hidden pr-1 scrollbar scrollbar-track-gray-700 scrollbar-thumb-blue-700"
            >
              <ModRows />
            </div>
            <div className="min-w-0 min-h-0 h-full md:self-start">
              <Sidebar />
            </div>
            <ModTagPicker></ModTagPicker>
          </div>
        )}
    </>
  );
};

export default Main;
