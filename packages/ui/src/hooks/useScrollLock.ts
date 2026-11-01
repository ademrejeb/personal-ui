import { useEffect } from "react";
import { canUseDOM } from "../utilities/dom";

let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

function lockBodyScroll(): void {
  const body = document.body;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  originalOverflow = body.style.overflow;
  originalPaddingRight = body.style.paddingRight;
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + scrollbarWidth}px`;
  }
}

function unlockBodyScroll(): void {
  const body = document.body;
  body.style.overflow = originalOverflow;
  body.style.paddingRight = originalPaddingRight;
}

/**
 * Prevents background scrolling while `enabled`. Reference-counted so nested
 * overlays release the lock only when the last one unmounts, and compensates
 * for scrollbar width to avoid layout shift.
 */
export function useScrollLock(enabled = true): void {
  useEffect(() => {
    if (!enabled || !canUseDOM()) return;
    if (lockCount === 0) lockBodyScroll();
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) unlockBodyScroll();
    };
  }, [enabled]);
}
