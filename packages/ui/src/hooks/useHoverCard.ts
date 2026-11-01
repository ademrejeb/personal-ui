import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { useControllableState } from "./useControllableState";
import type { HTMLAttributes } from "react";

export interface UseHoverCardOptions {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Delay before an idle hover/focus opens the card (ms). */
  openDelay?: number;
  /** Grace period before leaving the trigger/card closes it (ms). */
  closeDelay?: number;
  disabled?: boolean;
}

export interface HoverCardApi {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Open once `openDelay` has elapsed. */
  openDelayed: () => void;
  /** Close once `closeDelay` has elapsed. */
  closeDelayed: () => void;
  /** Cancel any pending open/close. */
  cancel: () => void;
  triggerId: string;
  contentId: string;
  /** Hover/focus/Escape wiring for a custom trigger wrapper. */
  getTriggerProps: (props?: HTMLAttributes<HTMLElement>) => HTMLAttributes<HTMLElement>;
  /** Pointer/focus wiring for a custom card element. */
  getContentProps: (props?: HTMLAttributes<HTMLElement>) => HTMLAttributes<HTMLElement>;
}

/**
 * Headless hover-card behaviour: delayed open on hover/focus, delayed close
 * with hoverable content (moving from the trigger into the card keeps it open),
 * and Escape to dismiss. Used by `<HoverCard>`; export your own markup with it.
 */
export function useHoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 200,
  closeDelay = 150,
  disabled = false,
}: UseHoverCardOptions = {}): HoverCardApi {
  const [open, setOpenState] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) return;
      setOpenState(next);
    },
    [disabled, setOpenState],
  );

  const openDelayed = useCallback(() => {
    if (disabled) return;
    cancel();
    if (openDelay <= 0) {
      setOpenState(true);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setOpenState(true);
    }, openDelay);
  }, [cancel, disabled, openDelay, setOpenState]);

  const closeDelayed = useCallback(() => {
    cancel();
    if (closeDelay <= 0) {
      setOpenState(false);
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setOpenState(false);
    }, closeDelay);
  }, [cancel, closeDelay, setOpenState]);

  return useMemo<HoverCardApi>(
    () => ({
      open,
      setOpen,
      openDelayed,
      closeDelayed,
      cancel,
      triggerId,
      contentId,
      getTriggerProps: (props) => ({
        ...props,
        id: props?.id ?? triggerId,
        "data-state": open ? "open" : "closed",
        onMouseEnter: (event) => {
          props?.onMouseEnter?.(event);
          openDelayed();
        },
        onMouseLeave: (event) => {
          props?.onMouseLeave?.(event);
          closeDelayed();
        },
        onFocus: (event) => {
          props?.onFocus?.(event);
          openDelayed();
        },
        onBlur: (event) => {
          props?.onBlur?.(event);
          closeDelayed();
        },
        onKeyDown: (event) => {
          props?.onKeyDown?.(event);
          if (event.key === "Escape") {
            cancel();
            setOpen(false);
          }
        },
      }),
      getContentProps: (props) => ({
        ...props,
        id: props?.id ?? contentId,
        "data-state": open ? "open" : "closed",
        onMouseEnter: (event) => {
          props?.onMouseEnter?.(event);
          cancel();
        },
        onMouseLeave: (event) => {
          props?.onMouseLeave?.(event);
          closeDelayed();
        },
        onFocusCapture: (event) => {
          props?.onFocusCapture?.(event);
          cancel();
        },
        onBlurCapture: (event) => {
          props?.onBlurCapture?.(event);
          closeDelayed();
        },
      }),
    }),
    [open, setOpen, openDelayed, closeDelayed, cancel, triggerId, contentId],
  );
}
