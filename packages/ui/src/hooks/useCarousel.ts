import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { useControllableState } from "./useControllableState";
import { useReducedMotion } from "./useMediaQuery";

export type CarouselOrientation = "horizontal" | "vertical";

export interface UseCarouselOptions {
  /** Number of slides. Required — the hook does not read the DOM. */
  count: number;
  /** Controlled active index. */
  index?: number;
  /** Initial index when uncontrolled. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Scrolling axis. Defaults to `"horizontal"`. */
  orientation?: CarouselOrientation;
  /** Wrap around at either end. Defaults to `true`. */
  loop?: boolean;
  /** Slides visible at once; also the page size used by the dots. Defaults to `1`. */
  slidesPerView?: number;
  /** Autoplay interval in ms. `0`/`undefined` disables it. */
  autoplay?: number;
  /** Pause autoplay while the pointer or focus is inside. Defaults to `true`. */
  pauseOnHover?: boolean;
  /** Accessible name. Providing one makes the root a `region` landmark. */
  label?: string;
}

export interface CarouselApi {
  index: number;
  count: number;
  /** Number of pages implied by `slidesPerView`. */
  pages: number;
  page: number;
  orientation: CarouselOrientation;
  loop: boolean;
  slidesPerView: number;
  autoplay: boolean;
  paused: boolean;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  /** Programmatic pause/resume for autoplay (e.g. from a Pause button). */
  setPaused: (paused: boolean) => void;
  scrollTo: (index: number, options?: { align?: "start" | "center" | "end" }) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  /** Slide index owning the current page. */
  pageIndex: (page: number) => number;
  /** Text mirrored into the polite live region. */
  liveMessage: string;
  getRootProps: (props?: HTMLAttributes<HTMLDivElement>) => HTMLAttributes<HTMLDivElement>;
  getViewportProps: (props?: HTMLAttributes<HTMLDivElement>) => HTMLAttributes<HTMLDivElement>;
  getTrackProps: (props?: HTMLAttributes<HTMLDivElement>) => HTMLAttributes<HTMLDivElement>;
  getSlideProps: (
    index: number,
    props?: HTMLAttributes<HTMLDivElement>,
  ) => HTMLAttributes<HTMLDivElement>;
  getPrevProps: (
    props?: ButtonHTMLAttributes<HTMLButtonElement>,
  ) => ButtonHTMLAttributes<HTMLButtonElement>;
  getNextProps: (
    props?: ButtonHTMLAttributes<HTMLButtonElement>,
  ) => ButtonHTMLAttributes<HTMLButtonElement>;
  getDotProps: (
    page: number,
    props?: ButtonHTMLAttributes<HTMLButtonElement>,
  ) => ButtonHTMLAttributes<HTMLButtonElement>;
}

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

/**
 * Headless carousel: index maths, wraparound, keyboard, swipe, autoplay and the
 * ARIA wiring for a region/slide carousel. Drives `<Carousel>`; use it directly
 * when you want to own the markup.
 *
 * The hook deliberately does not measure anything — pass `count` yourself.
 */
export function useCarousel({
  count,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  orientation = "horizontal",
  loop = true,
  slidesPerView = 1,
  autoplay = 0,
  pauseOnHover = true,
  label,
}: UseCarouselOptions): CarouselApi {
  const maxIndex = Math.max(0, count - slidesPerView);
  const [index, setIndex] = useControllableState<number>({
    value: indexProp,
    defaultValue: clamp(defaultIndex, 0, maxIndex),
    onChange: onIndexChange,
  });

  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const paused = manualPaused || (pauseOnHover && hoverPaused);

  const baseId = useId();
  const rootId = `${baseId}-carousel`;

  const safeIndex = clamp(index, 0, maxIndex);
  const canScrollPrev = loop || safeIndex > 0;
  const canScrollNext = loop || safeIndex < maxIndex;

  const scrollTo = useCallback(
    (next: number, { align = "start" }: { align?: "start" | "center" | "end" } = {}) => {
      if (count === 0) return;
      if (loop) {
        const wrapped = ((next % count) + count) % count;
        setIndex(clamp(wrapped, 0, maxIndex));
        return;
      }
      const offset = align === "end" ? slidesPerView - 1 : align === "center" ? 1 : 0;
      setIndex(clamp(next - offset, 0, maxIndex));
    },
    [count, loop, maxIndex, setIndex, slidesPerView],
  );

  const scrollPrev = useCallback(() => scrollTo(safeIndex - 1), [safeIndex, scrollTo]);
  const scrollNext = useCallback(() => scrollTo(safeIndex + 1), [safeIndex, scrollTo]);

  useEffect(() => {
    if (!autoplay || paused || reduceMotion || count <= slidesPerView) return;
    const timer = window.setInterval(() => {
      const atEnd = safeIndex >= maxIndex;
      if (!loop && atEnd) {
        setManualPaused(true);
        return;
      }
      scrollTo(safeIndex + 1);
    }, autoplay);
    return () => window.clearInterval(timer);
  }, [autoplay, paused, reduceMotion, count, slidesPerView, safeIndex, maxIndex, loop, scrollTo]);

  const dragRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  return useMemo<CarouselApi>(() => {
    const pages = Math.max(1, Math.ceil(count / Math.max(1, slidesPerView)));
    const page = clamp(Math.floor(safeIndex / Math.max(1, slidesPerView)), 0, pages - 1);

    return {
      index: safeIndex,
      count,
      pages,
      page,
      orientation,
      loop,
      slidesPerView,
      autoplay: autoplay > 0,
      paused,
      canScrollPrev,
      canScrollNext,
      setPaused: setManualPaused,
      scrollTo,
      scrollPrev,
      scrollNext,
      pageIndex: (target) =>
        clamp(target * Math.max(1, slidesPerView), 0, maxIndex),
      liveMessage: count > 0 ? `Slide ${safeIndex + 1} of ${count}` : "",
      getRootProps: (props) => ({
        ...props,
        id: props?.id ?? rootId,
        // WAI-ARIA carousel: a `region` needs a name, so only claim the landmark
        // role when the consumer supplies one; otherwise stay a plain group.
        role: props?.role ?? (label ? "region" : "group"),
        "aria-roledescription": "carousel",
        "aria-label": props?.["aria-label"] ?? label,
        "data-orientation": orientation,
        "data-loop": loop || undefined,
        onMouseEnter: (event) => {
          props?.onMouseEnter?.(event);
          if (pauseOnHover) setHoverPaused(true);
        },
        onMouseLeave: (event) => {
          props?.onMouseLeave?.(event);
          if (pauseOnHover) setHoverPaused(false);
        },
        onFocusCapture: (event) => {
          props?.onFocusCapture?.(event);
          if (pauseOnHover) setHoverPaused(true);
        },
        onBlurCapture: (event) => {
          props?.onBlurCapture?.(event);
          if (pauseOnHover) setHoverPaused(false);
        },
        onKeyDown: (event) => {
          props?.onKeyDown?.(event);
          const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
          const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
          if (event.key === prevKey) {
            event.preventDefault();
            scrollPrev();
          } else if (event.key === nextKey) {
            event.preventDefault();
            scrollNext();
          } else if (event.key === "Home") {
            event.preventDefault();
            scrollTo(0);
          } else if (event.key === "End") {
            event.preventDefault();
            scrollTo(count - 1);
          }
        },
      }),
      getViewportProps: (props) => ({
        ...props,
        "data-orientation": orientation,
        onPointerDown: (event) => {
          props?.onPointerDown?.(event);
          dragRef.current = { x: event.clientX, y: event.clientY, active: true };
        },
        onPointerUp: (event) => {
          props?.onPointerUp?.(event);
          if (!dragRef.current.active) return;
          dragRef.current.active = false;
          const dx = event.clientX - dragRef.current.x;
          const dy = event.clientY - dragRef.current.y;
          const delta = orientation === "horizontal" ? dx : dy;
          if (Math.abs(delta) < 40) return;
          if (delta < 0) scrollNext();
          else scrollPrev();
        },
        onPointerCancel: () => {
          dragRef.current.active = false;
        },
      }),
      getTrackProps: (props) => ({
        ...props,
        "data-orientation": orientation,
      }),
      getSlideProps: (slideIndex, props) => {
        const visible = slideIndex >= safeIndex && slideIndex < safeIndex + slidesPerView;
        return {
          ...props,
          role: props?.role ?? "group",
          "aria-roledescription": "slide",
          "aria-label": props?.["aria-label"] ?? `${slideIndex + 1} of ${count}`,
          // Off-screen slides leave the a11y tree *and* the tab order together,
          // so `aria-hidden` never wraps something focusable.
          "aria-hidden": visible ? undefined : true,
          inert: visible ? undefined : true,
          "data-state": slideIndex === safeIndex ? "active" : "inactive",
        };
      },
      getPrevProps: (props) => ({
        type: "button",
        ...props,
        "aria-controls": rootId,
        "aria-label": props?.["aria-label"] ?? "Previous slide",
        disabled: !canScrollPrev || props?.disabled,
        onClick: (event) => {
          props?.onClick?.(event);
          if (event.defaultPrevented) return;
          scrollPrev();
        },
      }),
      getNextProps: (props) => ({
        type: "button",
        ...props,
        "aria-controls": rootId,
        "aria-label": props?.["aria-label"] ?? "Next slide",
        disabled: !canScrollNext || props?.disabled,
        onClick: (event) => {
          props?.onClick?.(event);
          if (event.defaultPrevented) return;
          scrollNext();
        },
      }),
      getDotProps: (target, props) => ({
        type: "button",
        ...props,
        "aria-label": props?.["aria-label"] ?? `Go to page ${target + 1}`,
        "aria-current": props?.["aria-current"] ?? (target === page ? "true" : undefined),
        "data-state": target === page ? "active" : "inactive",
        onClick: (event) => {
          props?.onClick?.(event);
          if (event.defaultPrevented) return;
          scrollTo(target * Math.max(1, slidesPerView));
        },
      }),
    };
  }, [
    safeIndex,
    count,
    orientation,
    loop,
    slidesPerView,
    autoplay,
    paused,
    canScrollPrev,
    canScrollNext,
    scrollTo,
    scrollPrev,
    scrollNext,
    label,
    rootId,
    maxIndex,
    pauseOnHover,
  ]);
}
