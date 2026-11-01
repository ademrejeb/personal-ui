import { useEffect } from "react";
import { useEventCallback } from "./useEventCallback";

/**
 * Calls `handler` when Escape is pressed. Registers on the document in the
 * capture phase so the topmost overlay reliably receives the event first.
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true): void {
  const onKey = useEventCallback(handler);

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onKey(event);
    };
    document.addEventListener("keydown", listener, true);
    return () => document.removeEventListener("keydown", listener, true);
  }, [enabled, onKey]);
}
