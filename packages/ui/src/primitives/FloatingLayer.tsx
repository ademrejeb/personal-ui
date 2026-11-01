import { forwardRef, type HTMLAttributes, type RefObject } from "react";
import { cx } from "../utilities/cx";
import { getFocusableElements } from "../utilities/dom";
import { focusFirst, restoreFocus } from "../utilities/focus";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useFloating } from "../hooks/useFloating";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { useOutsideInteraction } from "../hooks/useOutsideInteraction";
import { Portal } from "./Portal";
import type { Placement } from "../utilities/position";

export interface FloatingLayerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  /** Element the layer is positioned against. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Optional external handle to the layer element. */
  floatingRef?: RefObject<HTMLElement | null>;
  placement?: Placement;
  offset?: number;
  /** Match the layer's width to the anchor's width. */
  matchTriggerWidth?: boolean;
  /** Extra refs treated as "inside" so interacting with them does not dismiss. */
  keepOpenRefs?: RefObject<HTMLElement | null>[];
  /** Called when the layer should close (outside click or Escape). */
  onDismiss?: () => void;
  dismissOnOutside?: boolean;
  dismissOnEscape?: boolean;
  /** Element to restore focus to after an Escape dismissal (usually the trigger). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Move focus into the layer when it opens. */
  focusOnOpen?: boolean;
  /**
   * When focusing on open, skip it if the first focusable child opts in with a
   * `data-autofocus` attribute (used by menus to focus a specific item).
   */
  respectAutoFocusAttr?: boolean;
  container?: HTMLElement | null;
}

/**
 * The single implementation of "a portaled, positioned, dismissible layer"
 * shared by Popover, DropdownMenu, Tooltip, the select controls, and the date
 * pickers. Owns anchoring/positioning, outside-interaction and Escape
 * dismissal, focus return, and auto-focus so each component only describes what
 * its surface looks like.
 */
export const FloatingLayer = forwardRef<HTMLDivElement, FloatingLayerProps>(function FloatingLayer(
  {
    open,
    anchorRef,
    floatingRef: externalRef,
    placement = "bottom-start",
    offset = 8,
    matchTriggerWidth = false,
    keepOpenRefs,
    onDismiss,
    dismissOnOutside = true,
    dismissOnEscape = true,
    returnFocusRef,
    focusOnOpen = false,
    respectAutoFocusAttr = false,
    container,
    className,
    style,
    children,
    ...rest
  },
  forwardedRef,
) {
  const { floatingRef, style: position } = useFloating({
    open,
    placement,
    offset,
    matchTriggerWidth,
    anchorRef,
  });

  useOutsideInteraction([floatingRef, ...(keepOpenRefs ?? [])], () => onDismiss?.(), {
    enabled: open && dismissOnOutside,
  });

  useEscapeKey(
    () => {
      onDismiss?.();
      restoreFocus(returnFocusRef?.current);
    },
    open && dismissOnEscape,
  );

  useIsomorphicLayoutEffect(() => {
    if (!open || !focusOnOpen) return;
    const node = floatingRef.current;
    if (!node) return;
    if (respectAutoFocusAttr) {
      const [first] = getFocusableElements(node);
      if (first?.hasAttribute("data-autofocus")) return;
    }
    focusFirst(node);
  }, [open, focusOnOpen, respectAutoFocusAttr, floatingRef]);

  const mergedRef = useMergedRefs<HTMLDivElement>(
    floatingRef as RefObject<HTMLDivElement | null>,
    externalRef as RefObject<HTMLDivElement | null>,
    forwardedRef,
  );

  if (!open) return null;

  return (
    <Portal container={container} forceMount>
      <div
        ref={mergedRef}
        data-side={placement.split("-")[0]}
        className={cx("ui-floating", className)}
        style={{ ...position, ...style }}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
});
FloatingLayer.displayName = "FloatingLayer";
