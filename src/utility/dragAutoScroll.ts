const TOP_SCROLL_ZONE_PX = 150;
const BOTTOM_SCROLL_ZONE_PX = 75;

export const getDragAutoScrollDelta = (clientY: number, viewportHeight: number): number => {
  if (clientY < TOP_SCROLL_ZONE_PX) {
    const yRatio = clientY / TOP_SCROLL_ZONE_PX;
    return -(20 * yRatio + 60 * (1 - yRatio));
  }

  if (clientY > viewportHeight - BOTTOM_SCROLL_ZONE_PX) {
    const yRatio = (clientY - (viewportHeight - BOTTOM_SCROLL_ZONE_PX)) / BOTTOM_SCROLL_ZONE_PX;
    return 60 * yRatio + 20 * (1 - yRatio);
  }

  return 0;
};
