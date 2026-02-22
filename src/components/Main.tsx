import React, { RefObject } from "react";
import { useAppSelector } from "../hooks";
import Sidebar from "./Sidebar";
import ModRows from "./ModRows";
import Categories from "./Categories";
import ModTagPicker from "./ModTagPicker";
import NodeEditor from "./NodeEditor";
import { gameToPackWithDBTablesName } from "../supportedGames";

type MainProps = {
  scrollElement: RefObject<HTMLDivElement>;
};
const Main = (props: MainProps) => {
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
          <div className="mx-auto grid max-w-[110rem] grid-cols-1 gap-4 text-white xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              <ModRows scrollElement={props.scrollElement} />
            </div>
            <div className="min-w-0 xl:self-start">
              <Sidebar />
            </div>
            <ModTagPicker></ModTagPicker>
          </div>
        )}
    </>
  );
};

export default Main;
