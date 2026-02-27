import React, {
  CSSProperties,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../index.css";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  toggleMod,
  enableAll,
  disableAllMods,
  resetModLoadOrder,
  setModRowsSortingType,
  setModLoadOrderRelativeTo,
  resetModLoadOrderAll,
  setModBeingCustomized,
  removeAllPackDataOverwrites,
} from "../appSlice";
import { Tooltip } from "flowbite-react";
import { getFilteredMods, sortByNameAndLoadOrder } from "../modSortingHelpers";
import { FloatingOverlay } from "@floating-ui/react";
import ModDropdown from "./ModDropdown";
import { isModAlwaysEnabled } from "../modsHelpers";
import * as modRowSorting from "../utility/modRowSorting";
import { SortingType } from "../utility/modRowSorting";
import ModRow from "./ModRow";
import localizationContext from "../localizationContext";
import { GoGear } from "react-icons/go";
import ModCustomization from "./ModCustomization";
import UserFlowOptionsModal from "./UserFlowOptionsModal";
import { WindowScroller, AutoSizer, List, CellMeasurerCache, CellMeasurer } from "react-virtualized";
import { MeasuredCellParent } from "react-virtualized/dist/es/CellMeasurer";
import { GridCoreProps } from "react-virtualized/dist/es/Grid";
import { buildCustomizableModsSignature } from "../utility/signatureHelpers";
import { getDragAutoScrollDelta } from "../utility/dragAutoScroll";

const MemoizedFloatingOverlay = memo(FloatingOverlay);

type ModRowsProps = {
  scrollElement: HTMLDivElement | null;
};

const ModRows = memo((props: ModRowsProps) => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.app.filter);
  const hiddenMods = useAppSelector((state) => state.app.hiddenMods);
  const alwaysEnabledMods = useAppSelector((state) => state.app.alwaysEnabledMods);
  const isAuthorEnabled = useAppSelector((state) => state.app.isAuthorEnabled);
  const areThumbnailsEnabled = useAppSelector((state) => state.app.areThumbnailsEnabled);
  const currentTab = useAppSelector((state) => state.app.currentTab);
  const sortingType = useAppSelector((state) => state.app.modRowsSortingType);
  const customizableMods = useAppSelector((state) => state.app.customizableMods);
  const modBeingCustomized = useAppSelector((state) => state.app.modBeingCustomized);
  const isDev = useAppSelector((state) => state.app.isDev);
  const currentPresetMods = useAppSelector((state) => state.app.currentPreset.mods);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isFlowOptionsModalOpen, setIsFlowOptionsModalOpen] = useState<boolean>(false);
  const [flowOptionsModSelected, setFlowOptionsModSelected] = useState<Mod | undefined>();
  // const [modBeingCustomized, setModBeingCustomized] = useState<Mod>();
  const [contextMenuMod, setContextMenuMod] = useState<Mod>();
  const [dropdownReferenceElement, setDropdownReferenceElement] = useState<HTMLDivElement>();

  const isCurrentTabEnabledMods = currentTab == "enabledMods";

  const localized: Record<string, string> = useContext(localizationContext);

  const rowsParentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const draggedModIdRef = useRef<string>("");
  const dragCurrentTargetRef = useRef<Element | null>(null);
  const dragStartTopRef = useRef<number | null>(null);
  const dragScrollRafRef = useRef<number | null>(null);
  const pendingAutoScrollDeltaRef = useRef<number>(0);

  const getModRowsScrollElement = useCallback(() => document.getElementById("mod-rows-scroll"), []);

  const setDropGhostsVisible = useCallback((isVisible: boolean) => {
    const modsGrid = document.getElementById("modsGrid");
    if (!modsGrid) return;
    const ghosts = modsGrid.getElementsByClassName("drop-ghost");
    for (const ghost of ghosts) {
      ghost.classList.toggle("hidden", !isVisible);
    }
  }, []);

  const restoreDraggedModViewportOffset = useCallback(() => {
    const draggedId = draggedModIdRef.current;
    const initialTop = dragStartTopRef.current;
    if (!draggedId || initialTop == null) return;

    requestAnimationFrame(() => {
      const draggedModElement = document.getElementById(draggedId);
      if (!draggedModElement) return;
      const currentTop = draggedModElement.getBoundingClientRect().top;
      getModRowsScrollElement()?.scrollBy(0, currentTop - initialTop);
    });
  }, [getModRowsScrollElement]);

  const clearDragUiState = useCallback(() => {
    [...document.getElementsByClassName("row-bg-color-manually")].forEach((element) => {
      element.classList.remove("row-bg-color-manually");
    });
    document.getElementById("body")?.classList.remove("disable-row-hover");
    setDropGhostsVisible(false);
    dragCurrentTargetRef.current = null;
  }, [setDropGhostsVisible]);

  const finalizeDrag = useCallback(() => {
    if (dragScrollRafRef.current != null) {
      cancelAnimationFrame(dragScrollRafRef.current);
      dragScrollRafRef.current = null;
    }
    pendingAutoScrollDeltaRef.current = 0;
    clearDragUiState();
    restoreDraggedModViewportOffset();
    draggedModIdRef.current = "";
    dragStartTopRef.current = null;
  }, [clearDragUiState, restoreDraggedModViewportOffset]);

  const alwaysEnabledModNames = useMemo(
    () => new Set(alwaysEnabledMods.map((mod) => mod.name)),
    [alwaysEnabledMods]
  );
  const hiddenModNames = useMemo(() => new Set(hiddenMods.map((mod) => mod.name)), [hiddenMods]);

  const enabledMods = useMemo(
    () =>
      currentPresetMods.filter((iterMod) => iterMod.isEnabled || alwaysEnabledModNames.has(iterMod.name)),
    [currentPresetMods, alwaysEnabledModNames]
  );
  const presetMods = useMemo(
    () => (currentTab == "enabledMods" ? enabledMods : currentPresetMods),
    [currentTab, enabledMods, currentPresetMods]
  );
  const enabledMergeMods = useMemo(() => enabledMods.filter((mod) => mod.mergedModsData), [enabledMods]);
  const mergedModPaths = useMemo(() => {
    const paths = new Set<string>();
    enabledMergeMods.forEach((mergeMod) => {
      (mergeMod.mergedModsData as MergedModsData[]).forEach((mergeModData) => {
        paths.add(mergeModData.path);
      });
    });
    return paths;
  }, [enabledMergeMods]);

  const modsToOrder = useMemo(
    () =>
      presetMods.filter((iterMod) => {
        const isHidden = hiddenModNames.has(iterMod.name);
        const isAlwaysEnabled = alwaysEnabledModNames.has(iterMod.name);
        return !isHidden || (isHidden && isAlwaysEnabled);
      }),
    [presetMods, hiddenModNames, alwaysEnabledModNames]
  );
  const orderedMods = useMemo(() => sortByNameAndLoadOrder(modsToOrder), [modsToOrder]);

  const sortedMods = useMemo(() => {
    const resolvedMods = modRowSorting.getSortedMods(presetMods, orderedMods, sortingType, customizableMods);
    if (!isDev) {
      return resolvedMods;
    }

    // duplicates happen when we hot-reload in dev
    const seenModNames = new Set<string>();
    return resolvedMods.filter((mod) => {
      if (seenModNames.has(mod.name)) return false;
      seenModNames.add(mod.name);
      return true;
    });
  }, [presetMods, orderedMods, sortingType, customizableMods, isDev]);

  const unfilteredMods = sortedMods;
  const mods = useMemo(
    () =>
      filter !== "" ? getFilteredMods(sortedMods, filter.toLowerCase(), isAuthorEnabled) : sortedMods,
    [sortedMods, filter, isAuthorEnabled]
  );

  const onModToggled = useCallback((mod: Mod): void => {
    const modRowsScroll = document.getElementById("mod-rows-scroll");
    const lastScrollTop = modRowsScroll?.scrollTop;

    // if always enabled don't allow unchecking
    if (isModAlwaysEnabled(mod, alwaysEnabledMods)) {
      return;
    }

    dispatch(toggleMod(mod));

    setTimeout(() => {
      if (lastScrollTop && modRowsScroll) modRowsScroll.scrollTop = lastScrollTop;
    }, 1);
  }, [alwaysEnabledMods, dispatch]);

  const setSortingType = useCallback(
    (newSortingType: SortingType) => {
      dispatch(setModRowsSortingType(modRowSorting.getNewSortType(newSortingType, sortingType)));
    },
    [dispatch, setModRowsSortingType, sortingType]
  );

  const onEnabledRightClick = useCallback(() => {
    if (mods.some((mod) => mod.isEnabled)) {
      dispatch(disableAllMods());
    } else {
      dispatch(enableAll());
    }
  }, [dispatch, mods]);

  const onOrderRightClick = useCallback(() => {
    dispatch(resetModLoadOrderAll());
  }, [dispatch]);

  const onDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      const dragIcon = target?.closest<HTMLElement>("[id^='drag-icon-']");
      const draggedModId = dragIcon?.id.replace("drag-icon-", "");
      if (!draggedModId) return;

      draggedModIdRef.current = draggedModId;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", draggedModId);

      const draggedModElement = document.getElementById(draggedModId);
      dragStartTopRef.current = draggedModElement?.getBoundingClientRect().top ?? null;
      draggedModElement?.classList.add("row-bg-color-manually");
      document.getElementById("body")?.classList.add("disable-row-hover");

      setDropGhostsVisible(true);
      restoreDraggedModViewportOffset();
    },
    [restoreDraggedModViewportOffset, setDropGhostsVisible]
  );

  const onDragEnd = useCallback(() => {
    finalizeDrag();
  }, [finalizeDrag]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.length > 1) return;
    const row = e.currentTarget;
    if (dragCurrentTargetRef.current && row === dragCurrentTargetRef.current.parentElement) return;
    dragCurrentTargetRef.current = row.children[0] ?? null;
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback(() => {
    // no-op: retained for drag lifecycle parity with row handlers
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // console.log("onDragOver");
    // e.stopPropagation();
    e.preventDefault();
    // return false;
  }, []);

  const onDrop = useCallback(
    (visualModList: Mod[]) => {
      return (e: React.DragEvent<HTMLDivElement>, setAfterMod = false) => {
        try {
          e.preventDefault();
          const droppedId = e.dataTransfer.getData("text/plain") || draggedModIdRef.current;
          if (!droppedId) return;
          draggedModIdRef.current = droppedId;

          const target = e.currentTarget;
          if (target.classList.contains("drop-ghost")) {
            if (!target.parentElement) return;
            const modNameRelativeTo = target.parentElement.id;
            if (modNameRelativeTo) {
              e.stopPropagation();
              dispatch(
                setModLoadOrderRelativeTo({
                  modNameToChange: droppedId,
                  modNameRelativeTo,
                  visualModList,
                  setAfterMod,
                } as ModLoadOrderRelativeTo)
              );
            }
            return;
          }

          if (droppedId === target.id) return;
          dispatch(
            setModLoadOrderRelativeTo({
              modNameToChange: droppedId,
              modNameRelativeTo: target.id,
              visualModList,
              setAfterMod,
            } as ModLoadOrderRelativeTo)
          );
        } catch (e) {
          console.log(e);
        }
      };
    },
    [dispatch]
  );

  const onDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const autoScrollDelta = getDragAutoScrollDelta(e.clientY, window.innerHeight);
      pendingAutoScrollDeltaRef.current = autoScrollDelta;

      if (dragScrollRafRef.current != null) return;

      dragScrollRafRef.current = requestAnimationFrame(() => {
        dragScrollRafRef.current = null;
        const delta = pendingAutoScrollDeltaRef.current;
        if (delta === 0) return;
        getModRowsScrollElement()?.scrollBy(0, delta);
      });
    },
    [getModRowsScrollElement]
  );

  const onRowHoverStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
      if (sortingType !== SortingType.Ordered) return;

      const element = e.currentTarget as HTMLDivElement;
      const dragIcon = document.getElementById(`drag-icon-${element.id}`);
      if (dragIcon) dragIcon.classList.remove("hidden");
    },
    [sortingType]
  );

  const onRowHoverEnd = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    const element = e.currentTarget as HTMLDivElement;
    const dragIcon = document.getElementById(`drag-icon-${element.id}`);
    if (dragIcon) dragIcon.classList.add("hidden");
  }, []);

  const onRemoveModOrder = useCallback((mod: Mod) => {
    dispatch(resetModLoadOrder([mod]));
  }, [dispatch]);

  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);

  const onModRightClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, mod: Mod) => {
      if (isDropdownOpen) return;
      setContextMenuMod(mod);

      setPositionX(e.clientX);
      setPositionY(e.clientY);

      setIsDropdownOpen(true);
      setDropdownReferenceElement(e.currentTarget);

      e.defaultPrevented = true;
      e.stopPropagation();
    },
    [isDropdownOpen]
  );

  const onCustomizeModClicked = useCallback((e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>, mod: Mod) => {
    if (isDropdownOpen) return;
    console.log("onCustomizeModClicked:", mod);
    dispatch(setModBeingCustomized(mod));
    // setModBeingCustomized(mod);

    e.defaultPrevented = true;
    e.stopPropagation();
  }, [dispatch, isDropdownOpen]);

  const onFlowOptionsClicked = useCallback((e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>, mod: Mod) => {
    if (isDropdownOpen) return;
    console.log("onFlowOptionsClicked:", mod);
    setFlowOptionsModSelected(mod);
    setIsFlowOptionsModalOpen(true);

    e.defaultPrevented = true;
    e.stopPropagation();
  }, [isDropdownOpen]);

  const onCustomizeModRightClick = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>, mod: Mod) => {
      if (isDropdownOpen) return;
      console.log("onCustomizeModRightClick:", mod);
      dispatch(removeAllPackDataOverwrites(mod.path));
      // setModBeingCustomized(mod);

      e.defaultPrevented = true;
      e.stopPropagation();
    },
    [dispatch, isDropdownOpen]
  );

  const onDropdownOverlayClick = useCallback(() => {
    const modRowsScroll = document.getElementById("mod-rows-scroll");
    if (!modRowsScroll) return;
    const lastScrollTop = modRowsScroll.scrollTop;
    setIsDropdownOpen(false);

    setTimeout(() => {
      if (modRowsScroll) modRowsScroll.scrollTop = lastScrollTop;
    }, 1);
  }, []);

  const getGridClass = useCallback(() => {
    if (isAuthorEnabled && areThumbnailsEnabled) return "grid-mods-thumbs-author";
    if (isAuthorEnabled) return "grid-mods-author";
    if (areThumbnailsEnabled) return "grid-mods-thumbs";
    return "grid-mods";
  }, [isAuthorEnabled, areThumbnailsEnabled]);

  const customizableModsSignature = useMemo(
    () => buildCustomizableModsSignature(customizableMods),
    [customizableMods]
  );
  const enabledModPaths = useMemo(() => enabledMods.map((mod) => mod.path), [enabledMods]);

  useEffect(() => {
    const customizableTables = [
      "units_to_groupings_military_permissions_tables",
      // "units_to_exclusive_faction_permissions_tables",
      "building_culture_variants_tables",
      "faction_agent_permitted_subtypes_tables",
      "campaign_group_unique_agents_tables",
    ];
    console.log("window.api?.getCustomizableMods from modsrows");
    window.api?.getCustomizableMods(enabledModPaths, customizableTables, customizableModsSignature);
  }, [enabledModPaths, customizableModsSignature]);

  const applyVisibilityFilters = useCallback(
    (modsToFilter: Mod[]) => {
      const namesWithDataPack = new Set(
        modsToFilter.filter((mod) => mod.isInData).map((mod) => mod.name)
      );

      return modsToFilter
        .filter((mod) => mod.isInData || !namesWithDataPack.has(mod.name))
        .filter((mod) => !hiddenModNames.has(mod.name));
    },
    [hiddenModNames]
  );

  const visibleMods = useMemo(() => applyVisibilityFilters(mods), [mods, applyVisibilityFilters]);
  const unfilteredVisibleMods = useMemo(
    () => applyVisibilityFilters(unfilteredMods),
    [unfilteredMods, applyVisibilityFilters]
  );

  const onDropWithVisibleMods = useCallback(() => {
    return onDrop(unfilteredVisibleMods);
  }, [unfilteredVisibleMods, onDrop]);

  const onDropMemoized = useMemo(() => onDropWithVisibleMods(), [onDropWithVisibleMods]);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyFunc = useCallback(() => {}, []);

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 32,
        minHeight: 32,
      }),
    []
  );

  useEffect(() => {
    cache.clearAll();
    listRef.current?.recomputeRowHeights();
  }, [visibleMods]);

  useEffect(() => {
    return () => {
      if (dragScrollRafRef.current != null) {
        cancelAnimationFrame(dragScrollRafRef.current);
      }
      pendingAutoScrollDeltaRef.current = 0;
      clearDragUiState();
      draggedModIdRef.current = "";
      dragStartTopRef.current = null;
    };
  }, [clearDragUiState]);

  const Row = useCallback(
    ({
      index,
      key,
      parent,
      style,
    }: {
      index: number;
      parent: React.Component<GridCoreProps> & MeasuredCellParent;
      key: string;
      style: CSSProperties;
    }) => {
      const i = index;
      const mod = visibleMods[i];
      return mod ? (
        <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
          {({ registerChild }) => (
            <ModRow
              key={key}
              {...{
                style,
                index: i,
                gridClass: getGridClass(),
                mod,
                onRowHoverStart,
                onRowHoverEnd,
                onDrop: isCurrentTabEnabledMods ? onDropMemoized : emptyFunc,
                onDrag,
                onDragStart,
                onDragLeave,
                onDragEnter,
                onDragOver,
                onDragEnd,
                onModToggled,
                onModRightClick,
                onCustomizeModClicked,
                onCustomizeModRightClick,
                onFlowOptionsClicked,
                onRemoveModOrder,
                sortingType,
                currentTab,
                isLast: visibleMods.length == i + 1,
                isAlwaysEnabled: alwaysEnabledModNames.has(mod.name),
                isEnabledInMergedMod: mergedModPaths.has(mod.path),
                registerChild,
              }}
            ></ModRow>
          )}
        </CellMeasurer>
      ) : (
        <></>
      );
    },
    [
      visibleMods,
      getGridClass,
      isCurrentTabEnabledMods,
      onDropMemoized,
      emptyFunc,
      onRowHoverStart,
      onRowHoverEnd,
      onDrag,
      onDragStart,
      onDragLeave,
      onDragEnter,
      onDragOver,
      onDragEnd,
      onModToggled,
      onModRightClick,
      onCustomizeModClicked,
      onCustomizeModRightClick,
      onFlowOptionsClicked,
      onRemoveModOrder,
      sortingType,
      currentTab,
      alwaysEnabledModNames,
      mergedModPaths,
      cache
    ]
  );

  return (
    <>
      <div
        onDragEnd={onDragEnd}
        className={`dark:text-slate-100 ` + (areThumbnailsEnabled ? "text-lg" : "")}
        id="rowsParent"
        ref={rowsParentRef}
      >
        <MemoizedFloatingOverlay
          onClick={() => onDropdownOverlayClick()}
          onContextMenu={() => onDropdownOverlayClick()}
          className={`${isDropdownOpen ? "" : "hidden"} z-50 dark`}
          id="modDropdownOverlay"
        >
          <ModDropdown
            isOpen={isDropdownOpen}
            positionX={positionX}
            positionY={positionY}
            mod={contextMenuMod}
            visibleMods={unfilteredVisibleMods}
            referenceElement={dropdownReferenceElement}
            mods={mods}
          ></ModDropdown>
        </MemoizedFloatingOverlay>
        {modBeingCustomized && modBeingCustomized.path && <ModCustomization />}
        {flowOptionsModSelected && (
          <UserFlowOptionsModal
            isOpen={isFlowOptionsModalOpen}
            onClose={() => setIsFlowOptionsModalOpen(false)}
            mod={flowOptionsModSelected}
          />
        )}

        <div className={"grid pt-1.5 parent " + getGridClass()} id="modsGrid">
          <div
            id="sortHeader"
            className="flex place-items-center w-full justify-center z-[11] mod-row-header rounded-tl-xl"
            onClick={() => setSortingType(SortingType.Ordered)}
            onContextMenu={onOrderRightClick}
          >
            {modRowSorting.isOrderSort(sortingType) && modRowSorting.getSortingArrow(sortingType)}
            <span className="tooltip-width-20">
              <Tooltip
                placement="bottom"
                style="light"
                content={
                  <>
                    <div>{localized.priorityTooltipOne}</div>
                    <div>{localized.priorityTooltipTwo}</div>
                    <div className="text-red-600 font-bold">{localized.priorityTooltipThree}</div>
                  </>
                }
              >
                <span
                  className={`text-center w-full cursor-pointer ${
                    modRowSorting.isOrderSort(sortingType) && "font-semibold"
                  }`}
                >
                  {localized.order}
                </span>
              </Tooltip>
            </span>
          </div>
          <div
            className="flex place-items-center w-full justify-center z-10 mod-row-header"
            onClick={() => setSortingType(SortingType.IsEnabled)}
            onContextMenu={onEnabledRightClick}
            id="enabledHeader"
          >
            {modRowSorting.isEnabledSort(sortingType) && modRowSorting.getSortingArrow(sortingType)}
            <span className="tooltip-width-15">
              <Tooltip placement="bottom" style="light" content={localized.enableOrDisableAll}>
                <span
                  className={`text-center cursor-pointer w-full ${
                    modRowSorting.isEnabledSort(sortingType) && "font-semibold"
                  }`}
                >
                  {localized.enabled}
                </span>
              </Tooltip>
            </span>
          </div>
          <div
            className={
              "flex grid-area-autohide place-items-center pl-1 mod-row-header cursor-default " +
              (areThumbnailsEnabled ? "" : "hidden")
            }
          >
            {localized.thumbnail}
          </div>
          <div
            className="flex grid-area-packName place-items-center pl-1 mod-row-header"
            onClick={() => setSortingType(SortingType.PackName)}
            onContextMenu={() => setSortingType(SortingType.IsDataPack)}
          >
            {(modRowSorting.isPackNameSort(sortingType) || modRowSorting.isDataPackSort(sortingType)) &&
              modRowSorting.getSortingArrow(sortingType)}
            <Tooltip placement="right" style="light" content={localized.sortByDataPacks}>
              <span
                className={`cursor-pointer ${
                  (modRowSorting.isPackNameSort(sortingType) || modRowSorting.isDataPackSort(sortingType)) &&
                  "font-semibold"
                }`}
              >
                {(modRowSorting.isDataPackSort(sortingType) && localized.dataPacks) || localized.pack}
              </span>
            </Tooltip>
          </div>
          <div
            className="flex grid-area-humanName place-items-center pl-1 mod-row-header"
            onClick={() => setSortingType(SortingType.HumanName)}
          >
            {modRowSorting.isHumanNameSort(sortingType) && modRowSorting.getSortingArrow(sortingType)}
            <span
              className={`cursor-pointer ${modRowSorting.isHumanNameSort(sortingType) && "font-semibold"}`}
            >
              {localized.name}
            </span>
          </div>
          <div
            className={
              "flex grid-area-autohide place-items-center pl-1 mod-row-header " +
              (isAuthorEnabled ? "" : "hidden")
            }
            onClick={() => setSortingType(SortingType.Author)}
          >
            {modRowSorting.isAuthorSort(sortingType) && modRowSorting.getSortingArrow(sortingType)}
            <span className={`cursor-pointer ${modRowSorting.isAuthorSort(sortingType) && "font-semibold"}`}>
              {localized.author}
            </span>
          </div>
          <div
            className="flex grid-area-autohide place-items-center pl-1 mod-row-header"
            onClick={() => setSortingType(SortingType.LastUpdated)}
            onContextMenu={() => setSortingType(SortingType.SubbedTime)}
          >
            {(modRowSorting.isLastUpdatedSort(sortingType) || modRowSorting.isSubbedTimeSort(sortingType)) &&
              modRowSorting.getSortingArrow(sortingType)}
            <Tooltip placement="left" style="light" content={localized.sortBySubscribedDate}>
              <span
                className={`cursor-pointer ${
                  (modRowSorting.isLastUpdatedSort(sortingType) ||
                    modRowSorting.isSubbedTimeSort(sortingType)) &&
                  "font-semibold"
                }`}
              >
                {(modRowSorting.isSubbedTimeSort(sortingType) && localized.subscriptionTime) ||
                  localized.lastUpdated}
              </span>
            </Tooltip>
          </div>
          <div
            className="flex place-items-center pl-1 mod-row-header rounded-tr-xl justify-center"
            onClick={() => setSortingType(SortingType.IsCustomizable)}
          >
            {modRowSorting.isCustomizableSort(sortingType) && modRowSorting.getSortingArrow(sortingType)}
            <span
              className={`cursor-pointer ${modRowSorting.isCustomizableSort(sortingType) && "font-semibold"}`}
            >
              <GoGear></GoGear>
            </span>
          </div>

          {currentTab == "mods" && props.scrollElement && (
            <WindowScroller scrollElement={props.scrollElement}>
              {({ height, isScrolling, onChildScroll, scrollTop, registerChild }) => (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <div ref={registerChild} style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <List
                        ref={listRef}
                        autoHeight
                        height={height || 500}
                        width={width}
                        scrollTop={scrollTop}
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        // rowHeight={areThumbnailsEnabled ? 112 - 8 : 32}
                        rowHeight={({ index }: { index: number }) =>
                          areThumbnailsEnabled
                            ? Math.max(112 - 8, cache.rowHeight({ index }))
                            : cache.rowHeight({ index })
                        }
                        rowRenderer={Row}
                        estimatedRowSize={areThumbnailsEnabled ? 104 : 32}
                        rowCount={visibleMods.length}
                        overscanRowCount={areThumbnailsEnabled ? 4 : 8}
                        deferredMeasurementCache={cache}
                      />
                    </div>
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
          {currentTab == "enabledMods" &&
            visibleMods.map((mod, i) => (
              <ModRow
                key={mod.path}
                {...{
                  index: i,
                  mod,
                  onRowHoverStart,
                  onRowHoverEnd,
                  onDrop: isCurrentTabEnabledMods ? onDropMemoized : emptyFunc,
                  onDrag,
                  onDragStart,
                  onDragLeave,
                  onDragEnter,
                  onDragOver,
                  onDragEnd,
                  onModToggled,
                  onModRightClick,
                  onCustomizeModClicked,
                  onCustomizeModRightClick,
                  onFlowOptionsClicked,
                  onRemoveModOrder,
                  sortingType,
                  currentTab,
                  isLast: visibleMods.length == i + 1,
                  isAlwaysEnabled: alwaysEnabledModNames.has(mod.name),
                  isEnabledInMergedMod: mergedModPaths.has(mod.path),
                  style: {},
                  gridClass: "row",
                  registerChild: emptyFunc,
                }}
              ></ModRow>
            ))}
        </div>
      </div>
    </>
  );
});

export default ModRows;
