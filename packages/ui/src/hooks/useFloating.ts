import { useRef, useState, type CSSProperties, type RefObject } from "react";
import { computePosition, type Coords, type Placement } from "../utilities/position";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export interface UseFloatingOptions {
  open: boolean;
  placement?: Placement;
  offset?: number;
  /** Match the floating element's width to the anchor's width. */
  matchTriggerWidth?: boolean;
  /**
   * Anchor element to position against. Provide the ref that is attached to the
   * trigger; an internal ref is used when omitted.
   */
  anchorRef?: RefObject<HTMLElement | null>;
}

export interface UseFloatingResult {
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  style: CSSProperties;
}

/**
 * Computes and maintains the fixed position of a floating element relative to
 * an anchor, updating on scroll and resize. Intentionally dependency-free.
 */
export function useFloating({
  open,
  placement = "bottom-start",
  offset = 8,
  matchTriggerWidth = false,
  anchorRef: externalAnchorRef,
}: UseFloatingOptions): UseFloatingResult {
  const internalAnchorRef = useRef<HTMLElement | null>(null);
  const anchorRef = externalAnchorRef ?? internalAnchorRef;
  const floatingRef = useRef<HTMLElement | null>(null);
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
  const [width, setWidth] = useState<number | undefined>(undefined);

  // Position synchronously during commit to avoid a visible jump.
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const anchor = anchorRef.current;
      const floating = floatingRef.current;
      if (!anchor || !floating) return;
      const anchorRect = anchor.getBoundingClientRect();
      const floatingRect = floating.getBoundingClientRect();
      setCoords(
        computePosition(anchorRect, floatingRect, placement, {
          offset,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        }),
      );
      setWidth(matchTriggerWidth ? anchorRect.width : undefined);
    };

    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, placement, offset, matchTriggerWidth]);

  return {
    anchorRef,
    floatingRef,
    style: { position: "fixed", top: coords.top, left: coords.left, width },
  };
}
