import { useRef, type RefObject } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { focusFirst, restoreFocus, trapTabKey } from "../utilities/focus";

/**
 * Traps Tab focus inside `ref` while `active`, focuses the first focusable
 * element on activation, and restores focus to the previously focused element
 * on deactivation.
 */
export function useFocusTrap<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
): void {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Only grab focus if focus is not already inside the container.
    if (!container.contains(document.activeElement)) {
      focusFirst(container);
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") trapTabKey(container, event);
    };
    container.addEventListener("keydown", onKeyDown);

    return () => {
      container.removeEventListener("keydown", onKeyDown);
      restoreFocus(previouslyFocused.current);
    };
  }, [active, ref]);
}
