import React, { memo, useCallback, useContext, useEffect, useMemo } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "../styles/LeftSidebar.css";
import { IoIosList, IoMdCheckboxOutline } from "react-icons/io";
import { MdCategory } from "react-icons/md";
import { FaProjectDiagram } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setCurrentTab } from "../appSlice";
import localizationContext from "../localizationContext";
import { getMainWindowTabFromHotkey, getVisibleMainWindowTabs } from "../utility/uiStateHelpers";

const LeftSidebar = memo(() => {
  const dispatch = useAppDispatch();
  const currentTab = useAppSelector((state) => state.app.currentTab);
  const isFeaturesForModdersEnabled = useAppSelector((state) => state.app.isFeaturesForModdersEnabled);

  const visibleTabs = useMemo(
    () => getVisibleMainWindowTabs(isFeaturesForModdersEnabled),
    [isFeaturesForModdersEnabled]
  );

  const onTabSelected = useCallback(
    (index: number) => {
      const tabType = visibleTabs[index];
      if (!tabType) return;
      dispatch(setCurrentTab(tabType));
    },
    [dispatch, visibleTabs]
  );

  const localized: Record<string, string> = useContext(localizationContext);

  useEffect(() => {
    if (!isFeaturesForModdersEnabled && currentTab === "nodeEditor") {
      dispatch(setCurrentTab("mods"));
    }
  }, [currentTab, dispatch, isFeaturesForModdersEnabled]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      const tab = getMainWindowTabFromHotkey(e.key, isFeaturesForModdersEnabled);
      if (!tab) return;

      const selectedIndex = visibleTabs.findIndex((tabType) => tabType === tab);
      if (selectedIndex >= 0) onTabSelected(selectedIndex);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFeaturesForModdersEnabled, onTabSelected, visibleTabs]);

  const selectedIndex = visibleTabs.findIndex((tabType) => tabType == currentTab);

  return (
    <>
      <Tabs
        id="left-sidebar"
        className="fixed top-10 z-[260] left-2 outline-transparent parent-unhide-child select-none"
        onSelect={(index) => onTabSelected(index)}
        selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
      >
        <TabList>
          <Tab>
            <div className="flex items-center h-full relative">
              <IoIosList size="1.5rem" />
              <span className="ml-2 mr-2 hidden-child">{localized.allMods}</span>
              <span className="text-xs absolute hidden-child -right-0 -bottom-2 opacity-60">Ctrl+1</span>
            </div>
          </Tab>
          <Tab>
            <div className="flex items-center h-full parent-unhide-child relative">
              <IoMdCheckboxOutline size="1.5rem" />
              <span className="ml-2 mr-2 hidden-child">{localized.enabledModsCapitalized}</span>
              <span className="text-xs absolute hidden-child -right-0 -bottom-2 opacity-60">Ctrl+2</span>
            </div>
          </Tab>
          <Tab>
            <div className="flex items-center h-full parent-unhide-child relative">
              <MdCategory size="1.5rem" />
              <span className="ml-2 mr-2 hidden-child">{localized.categories}</span>
              <span className="text-xs absolute hidden-child -right-0 -bottom-2 opacity-60">Ctrl+3</span>
            </div>
          </Tab>
          {isFeaturesForModdersEnabled && (
            <Tab>
              <div className="flex items-center h-full parent-unhide-child relative">
                <FaProjectDiagram size="1.5rem" />
                <span className="ml-2 mr-2 hidden-child">Node Editor</span>
                <span className="text-xs absolute hidden-child -right-0 -bottom-2 opacity-60">Ctrl+4</span>
              </div>
            </Tab>
          )}
        </TabList>
        <TabPanel></TabPanel>
        <TabPanel></TabPanel>
        <TabPanel></TabPanel>
        {isFeaturesForModdersEnabled && <TabPanel></TabPanel>}
      </Tabs>
    </>
  );
});
export default LeftSidebar;
