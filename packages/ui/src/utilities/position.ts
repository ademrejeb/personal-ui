export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface RectLike {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Coords {
  top: number;
  left: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ComputePointOptions {
  /** Minimum distance kept from the viewport edges. */
  padding?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface ComputePositionOptions {
  offset?: number;
  /** Minimum distance kept from the viewport edges. */
  padding?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

/**
 * Pure placement math for floating elements. Returns viewport-clamped fixed
 * coordinates given an anchor rect and a floating rect.
 */
export function computePosition(
  anchor: RectLike,
  floating: RectLike,
  placement: Placement,
  options: ComputePositionOptions = {},
): Coords {
  const { offset = 8, padding = 8, viewportWidth = 0, viewportHeight = 0 } = options;
  const [side, align] = placement.split("-") as [string, string | undefined];
  let top = 0;
  let left = 0;

  switch (side) {
    case "top":
      top = anchor.top - floating.height - offset;
      break;
    case "bottom":
      top = anchor.bottom + offset;
      break;
    case "left":
      left = anchor.left - floating.width - offset;
      break;
    case "right":
      left = anchor.right + offset;
      break;
  }

  if (side === "top" || side === "bottom") {
    if (align === "start") left = anchor.left;
    else if (align === "end") left = anchor.right - floating.width;
    else left = anchor.left + anchor.width / 2 - floating.width / 2;
  } else {
    if (align === "start") top = anchor.top;
    else if (align === "end") top = anchor.bottom - floating.height;
    else top = anchor.top + anchor.height / 2 - floating.height / 2;
  }

  if (viewportWidth > 0) {
    left = Math.min(Math.max(padding, left), Math.max(padding, viewportWidth - floating.width - padding));
  }
  if (viewportHeight > 0) {
    top = Math.min(Math.max(padding, top), Math.max(padding, viewportHeight - floating.height - padding));
  }

  return { top, left };
}

/**
 * Placement for pointer-anchored floating elements (context menus). The element
 * is placed with its corner at the pointer and clamped inside the viewport.
 */
export function computePositionAtPoint(
  point: Point,
  floating: { width: number; height: number },
  { padding = 8, viewportWidth = 0, viewportHeight = 0 }: ComputePointOptions = {},
): Coords {
  let top = point.y;
  let left = point.x;

  if (viewportWidth > 0) {
    left = Math.min(Math.max(padding, left), Math.max(padding, viewportWidth - floating.width - padding));
  }
  if (viewportHeight > 0) {
    top = Math.min(Math.max(padding, top), Math.max(padding, viewportHeight - floating.height - padding));
  }

  return { top, left };
}
