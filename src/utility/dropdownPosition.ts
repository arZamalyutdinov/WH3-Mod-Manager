export const DEFAULT_DROPDOWN_VIEWPORT_PADDING = 8;

type DropdownPositionInput = {
  clickX: number;
  clickY: number;
  menuWidth: number;
  menuHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  padding?: number;
};

export const getClampedDropdownPosition = ({
  clickX,
  clickY,
  menuWidth,
  menuHeight,
  viewportWidth,
  viewportHeight,
  padding = DEFAULT_DROPDOWN_VIEWPORT_PADDING,
}: DropdownPositionInput): { x: number; y: number } => {
  let x = clickX;
  let y = clickY;

  // If it overflows below, try opening upward first.
  if (y + menuHeight > viewportHeight - padding) {
    const aboveY = clickY - menuHeight;
    y = aboveY >= padding ? aboveY : viewportHeight - menuHeight - padding;
  }

  // Clamp right overflow.
  if (x + menuWidth > viewportWidth - padding) {
    x = viewportWidth - menuWidth - padding;
  }

  return {
    x: Math.max(padding, x),
    y: Math.max(padding, y),
  };
};

