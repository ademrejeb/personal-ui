import { useCallback, useMemo, useState, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export type VirtualizerAlign = "auto" | "start" | "center" | "end";

export interface UseVirtualizerOptions {
  /** Total number of rows/items. */
  count: number;
  /** Fixed row height in px. Virtualization assumes uniform rows. */
  itemSize: number;
  /** Extra rows rendered above and below the viewport. Defaults to 3. */
  overscan?: number;
  /** The scroll container. */
  scrollRef: RefObject<HTMLElement | null>;
  /** Space before the first item (e.g. a sticky header inside the scroller). */
  paddingStart?: number;
  /** Space after the last item. */
  paddingEnd?: number;
  /**
   * Viewport height used before the element has been measured (SSR, first
   * paint, jsdom). Without it the hook renders every item until it can measure.
   */
  initialViewportSize?: number;
  /** Turn windowing off while keeping the same return shape. */
  enabled?: boolean;
}

export interface VirtualItem {
  index: number;
  /** Offset from the top of the scroll content. */
  start: number;
  size: number;
  end: number;
}

export interface UseVirtualizerResult {
  virtualItems: VirtualItem[];
  /** Height of the full scroll content, including padding. */
  totalSize: number;
  startIndex: number;
  endIndex: number;
  viewportSize: number;
  scrollOffset: number;
  scrollToIndex: (index: number, align?: VirtualizerAlign) => void;
  scrollToOffset: (offset: number) => void;
  /** Re-read scrollTop/clientHeight after layout changes. */
  measure: () => void;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Fixed-height windowing for long lists, tables, and pickers.
 *
 * The hook owns only measurement and index math; the caller renders the
 * returned window. Because row heights are fixed, the total scroll height is
 * known before measuring, so there is no layout thrash or second pass.
 */
export function useVirtualizer({
  count,
  itemSize,
  overscan = 3,
  scrollRef,
  paddingStart = 0,
  paddingEnd = 0,
  initialViewportSize = 0,
  enabled = true,
}: UseVirtualizerOptions): UseVirtualizerResult {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [measuredSize, setMeasuredSize] = useState(0);
  const viewportSize = measuredSize || initialViewportSize;

  const measure = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setScrollOffset(element.scrollTop);
    setMeasuredSize(element.clientHeight);
  }, [scrollRef]);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    const element = scrollRef.current;
    if (!element) return;
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(element);
    }
    return () => {
      element.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [enabled, measure, scrollRef, count, itemSize]);

  const window = useMemo(() => {
    const totalSize = paddingStart + count * itemSize + paddingEnd;
    if (!enabled || count === 0) {
      return { virtualItems: [] as VirtualItem[], startIndex: 0, endIndex: -1, totalSize };
    }

    // Before measurement, render everything so SSR and jsdom keep full content.
    if (viewportSize <= 0) {
      const virtualItems: VirtualItem[] = Array.from({ length: count }, (_, index) => {
        const start = paddingStart + index * itemSize;
        return { index, start, size: itemSize, end: start + itemSize };
      });
      return { virtualItems, startIndex: 0, endIndex: count - 1, totalSize };
    }

    const maxOffset = Math.max(0, totalSize - viewportSize);
    const offset = clamp(scrollOffset, 0, maxOffset);
    const first = Math.floor(Math.max(0, offset - paddingStart) / itemSize);
    const startIndex = clamp(first - overscan, 0, Math.max(0, count - 1));
    const visibleCount = Math.ceil(viewportSize / itemSize) + overscan * 2 + 1;
    const endIndex = clamp(startIndex + visibleCount - 1, 0, count - 1);

    const virtualItems: VirtualItem[] = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
      const start = paddingStart + index * itemSize;
      virtualItems.push({ index, start, size: itemSize, end: start + itemSize });
    }
    return { virtualItems, startIndex, endIndex, totalSize };
  }, [
    count,
    enabled,
    itemSize,
    overscan,
    paddingEnd,
    paddingStart,
    scrollOffset,
    viewportSize,
  ]);

  const scrollToOffset = useCallback(
    (offset: number) => {
      const element = scrollRef.current;
      if (!element) return;
      const next = Math.max(0, offset);
      element.scrollTop = next;
      setScrollOffset(next);
    },
    [scrollRef],
  );

  const scrollToIndex = useCallback(
    (index: number, align: VirtualizerAlign = "auto") => {
      if (count === 0) return;
      const element = scrollRef.current;
      if (!element) return;
      const itemStart = paddingStart + clamp(index, 0, count - 1) * itemSize;
      const itemEnd = itemStart + itemSize;
      const current = element.scrollTop;
      const viewport = element.clientHeight || viewportSize;
      let next = current;

      if (align === "start") next = itemStart;
      else if (align === "center") next = itemStart - (viewport - itemSize) / 2;
      else if (align === "end") next = itemEnd - viewport;
      else if (itemStart < current) next = itemStart;
      else if (itemEnd > current + viewport) next = itemEnd - viewport;

      scrollToOffset(next);
    },
    [count, itemSize, paddingStart, scrollRef, scrollToOffset, viewportSize],
  );

  return {
    ...window,
    viewportSize,
    scrollOffset,
    scrollToIndex,
    scrollToOffset,
    measure,
  };
}
