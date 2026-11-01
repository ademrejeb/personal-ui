import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utilities/cx";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
  /** Constrain the scroll box height. */
  maxHeight?: string | number;
  /** Hide the native scrollbar visually while preserving scroll behavior. */
  hideScrollbar?: boolean;
}

/**
 * A styled scrolling container. Scroll behaviour and keyboard scrolling are
 * native; only the scrollbar appearance is themed.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className, orientation = "vertical", maxHeight, hideScrollbar = false, style, ...rest },
  ref,
) {
  const overflow: CSSProperties["overflow"] =
    orientation === "vertical" ? "auto hidden" : orientation === "horizontal" ? "hidden auto" : "auto";
  const computed: CSSProperties = {
    overflow,
    maxHeight:
      typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
  };
  return (
    <div
      ref={ref}
      className={cx("ui-scroll-area", "ui-scrollbar", hideScrollbar && "ui-scroll-area--hidden", className)}
      style={{ ...computed, ...style }}
      {...rest}
    />
  );
});
ScrollArea.displayName = "ScrollArea";
