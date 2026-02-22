import React, { memo, useEffect, useRef, useState, useLayoutEffect } from "react";
import ModDropdownOptions from "./ModDropdownOptions";
import { getClampedDropdownPosition } from "../utility/dropdownPosition";

type ModDropdownProps = {
  isOpen: boolean;
  positionX: number;
  positionY: number;
  mod?: Mod;
  referenceElement: HTMLElement | undefined;
  mods: Mod[];
  visibleMods: Mod[];
};

const ModDropdown = memo((props: ModDropdownProps) => {
  const modDropdownRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: props.positionX, y: props.positionY });
  const [delta, setDelta] = useState({ x: 0, y: 0 });

  // Calculate adjusted position based on actual menu dimensions
  useLayoutEffect(() => {
    if (!props.isOpen || !modDropdownRef.current) return;

    const menu = modDropdownRef.current;
    const menuRect = menu.getBoundingClientRect();
    const menuHeight = menuRect.height;
    const menuWidth = menuRect.width;

    const { x: newX, y: newY } = getClampedDropdownPosition({
      clickX: props.positionX,
      clickY: props.positionY,
      menuWidth,
      menuHeight,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    setAdjustedPosition({ x: newX, y: newY });

    // Calculate delta from reference element for scroll tracking
    if (props.referenceElement) {
      const refRect = props.referenceElement.getBoundingClientRect();
      setDelta({
        x: refRect.left - newX,
        y: refRect.top - newY,
      });
    }
  }, [props.isOpen, props.positionX, props.positionY, props.mod, props.referenceElement]);

  // Track reference element position during scroll/resize without a polling interval
  useEffect(() => {
    if (!props.isOpen || !props.referenceElement) return;

    let rafId: number | null = null;
    const updatePosition = () => {
      if (modDropdownRef.current && props.referenceElement) {
        const refRect = props.referenceElement.getBoundingClientRect();
        modDropdownRef.current.style.top = `${refRect.top - delta.y}px`;
        modDropdownRef.current.style.left = `${refRect.left - delta.x}px`;
      }
    };

    const scheduleUpdate = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updatePosition();
      });
    };

    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [props.isOpen, props.referenceElement, delta]);

  return (
    (props.mod == null && <></>) || (
      <>
        <div
          id="modDropdown"
          className={
            `${props.isOpen ? "" : "hidden"}` +
            ` fixed z-[320] w-56 overflow-hidden rounded-xl border border-gray-600/70 bg-gray-800/95 shadow-2xl backdrop-blur-sm`
          }
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
          }}
          ref={modDropdownRef}
        >
          <ModDropdownOptions
            mod={props.mod}
            mods={props.mods}
            visibleMods={props.visibleMods}
          ></ModDropdownOptions>
        </div>
      </>
    )
  );
});
export default ModDropdown;
