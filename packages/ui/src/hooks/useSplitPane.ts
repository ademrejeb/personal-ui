import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { useControllableState } from "./useControllableState";

export type SplitOrientation = "horizontal" | "vertical";

export interface UseSplitPaneOptions {
  /** Controlled first-pane size, as a percentage. */
  size?: number;
  defaultSize?: number;
  onSizeChange?: (size: number) => void;
  min?: number;
  max?: number;
  /** Keyboard resize step, in percentage points. */
  step?: number;
  orientation?: SplitOrientation;
  disabled?: boolean;
}

export interface UseSplitPaneResult {
  size: number;
  setSize: (size: number) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  handleProps: {
    role: "separator";
    tabIndex: number;
    "aria-orientation": SplitOrientation;
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-valuenow": number;
    "aria-disabled": boolean | undefined;
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Headless resizable split layout: pointer drag with capture, keyboard arrows
 * (RTL-aware), Home/End, min/max clamping, and controlled/uncontrolled size.
 */
export function useSplitPane({
  size: controlledSize,
  defaultSize = 50,
  onSizeChange,
  min = 10,
  max = 90,
  step = 2,
  orientation = "horizontal",
  disabled = false,
}: UseSplitPaneOptions = {}): UseSplitPaneResult {
  const [size, setSize] = useControllableState({
    value: controlledSize,
    defaultValue: defaultSize,
    onChange: onSizeChange,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ start: number; size: number } | null>(null);

  const isRtl = useCallback(() => {
    const node = containerRef.current;
    return orientation === "horizontal" && !!node && getComputedStyle(node).direction === "rtl";
  }, [orientation]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      dragRef.current = {
        start: orientation === "horizontal" ? event.clientX : event.clientY,
        size,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [disabled, orientation, size],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const container = containerRef.current;
      if (!drag || !container) return;

      const rect = container.getBoundingClientRect();
      const total = orientation === "horizontal" ? rect.width : rect.height;
      if (!total) return;

      const current = orientation === "horizontal" ? event.clientX : event.clientY;
      const delta = ((current - drag.start) / total) * 100 * (isRtl() ? -1 : 1);
      setSize(clamp(drag.size + delta, min, max));
    },
    [isRtl, max, min, orientation, setSize],
  );

  const onPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const rtl = isRtl();
      let next: number | null = null;

      if (event.key === "Home") next = min;
      else if (event.key === "End") next = max;
      else if (orientation === "horizontal" && event.key === "ArrowLeft") {
        next = size + (rtl ? step : -step);
      } else if (orientation === "horizontal" && event.key === "ArrowRight") {
        next = size + (rtl ? -step : step);
      } else if (orientation === "vertical" && event.key === "ArrowUp") next = size - step;
      else if (orientation === "vertical" && event.key === "ArrowDown") next = size + step;

      if (next == null) return;
      event.preventDefault();
      setSize(clamp(next, min, max));
    },
    [disabled, isRtl, max, min, orientation, setSize, size, step],
  );

  return {
    size,
    setSize,
    containerRef,
    handleProps: {
      role: "separator",
      tabIndex: disabled ? -1 : 0,
      // The separator line is perpendicular to the split direction: a
      // side-by-side split has a vertical divider, a stacked split horizontal.
      "aria-orientation": orientation === "horizontal" ? "vertical" : "horizontal",
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": Math.round(size),
      "aria-disabled": disabled || undefined,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
    },
  };
}
