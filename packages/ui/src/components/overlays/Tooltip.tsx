import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "../../utilities/cx";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import type { Placement } from "../../utilities/position";

type TriggerElementProps = {
  ref?: Ref<HTMLElement>;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  "aria-describedby"?: string;
};

export interface TooltipProps {
  content: ReactNode;
  /** A single element that receives the tooltip wiring. */
  children: ReactElement;
  placement?: Placement;
  /** Hover delay before showing, in ms. */
  delay?: number;
  offset?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * A short description attached to a single trigger element. Shows on hover
 * (after a delay) and immediately on keyboard focus; Escape dismisses it.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, children, placement = "top", delay = 400, offset = 6, disabled = false, className },
  forwardedRef,
) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const anchorRef = useRef<HTMLElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const show = useCallback(
    (immediate: boolean) => {
      if (disabled) return;
      clearTimer();
      if (immediate) setOpen(true);
      else timer.current = setTimeout(() => setOpen(true), delay);
    },
    [disabled, delay, clearTimer],
  );

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  const child = children as ReactElement<TriggerElementProps>;
  const childProps = child.props;
  const childRef = childProps.ref;
  const mergedTriggerRef = useMergedRefs<HTMLElement>(anchorRef, childRef);

  const trigger = cloneElement(child, {
    ref: mergedTriggerRef,
    "aria-describedby": open ? id : childProps["aria-describedby"],
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(event);
      show(false);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event);
      show(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event);
      hide();
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      childProps.onKeyDown?.(event);
      if (event.key === "Escape") hide();
    },
  } as TriggerElementProps);

  return (
    <>
      {trigger}
      <FloatingLayer
        ref={forwardedRef}
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={offset}
        dismissOnOutside={false}
        dismissOnEscape={false}
        id={id}
        role="tooltip"
        className={cx("ui-tooltip", className)}
      >
        {content}
      </FloatingLayer>
    </>
  );
});
Tooltip.displayName = "Tooltip";
