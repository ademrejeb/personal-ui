import { useEffect, type RefObject } from "react";
import { useEventCallback } from "./useEventCallback";

type MaybeRefs<T> = RefObject<T | null> | RefObject<T | null>[];

export interface UseOutsideInteractionOptions {
  enabled?: boolean;
  /** Also treat keyboard focus moving outside as an outside interaction. */
  includeFocus?: boolean;
  /** Pointer events to observe. Defaults to `pointerdown`. */
  pointerEvents?: readonly string[];
}

/**
 * Invokes `onOutside` when a pointer/focus interaction occurs outside every
 * provided ref. Handles nested portaled content by checking event targets,
 * not just DOM containment.
 */
export function useOutsideInteraction<T extends HTMLElement>(
  refs: MaybeRefs<T>,
  onOutside: (event: Event) => void,
  { enabled = true, includeFocus = false, pointerEvents = ["pointerdown"] }: UseOutsideInteractionOptions = {},
): void {
  const handler = useEventCallback(onOutside);

  useEffect(() => {
    if (!enabled) return;
    const targets = Array.isArray(refs) ? refs : [refs];

    const listener = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;
      for (const ref of targets) {
        const el = ref.current;
        if (el && el.contains(target)) return;
      }
      handler(event);
    };

    for (const type of pointerEvents) document.addEventListener(type, listener, true);
    if (includeFocus) document.addEventListener("focusin", listener, true);

    return () => {
      for (const type of pointerEvents) document.removeEventListener(type, listener, true);
      if (includeFocus) document.removeEventListener("focusin", listener, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, includeFocus, handler, ...(Array.isArray(refs) ? refs : [refs])]);
}

/** Convenience wrapper for the common "click outside to dismiss" case. */
export function useClickOutside<T extends HTMLElement>(
  ref: MaybeRefs<T>,
  onOutside: (event: Event) => void,
  enabled = true,
): void {
  useOutsideInteraction(ref, onOutside, { enabled });
}
