import { getFocusableElements, isHTMLElement } from "./dom";

/** Moves focus to the first tabbable element inside `container`, if any. */
export function focusFirst(container: HTMLElement, opts?: { preventScroll?: boolean }): void {
  const [first] = getFocusableElements(container);
  const target = first ?? container;
  focusElement(target, opts);
}

export function focusElement(
  element: HTMLElement | null | undefined,
  opts?: { preventScroll?: boolean },
): void {
  if (!element) return;
  element.focus({ preventScroll: opts?.preventScroll ?? true });
}

/**
 * Restores focus to a previously captured element, verifying it is still
 * connected to the document before focusing.
 */
export function restoreFocus(element: HTMLElement | null | undefined): void {
  if (!element || !element.isConnected) return;
  focusElement(element);
}

/** Cycles Tab focus within `container` and returns whether the event was handled. */
export function trapTabKey(container: HTMLElement, event: KeyboardEvent): void {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    focusElement(last);
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    focusElement(first);
  }
}

/**
 * Elements outside the given container (e.g. app roots) that should be made
 * inert/hidden while a modal is open.
 */
export function getOutsideElements(container: HTMLElement): HTMLElement[] {
  const result: HTMLElement[] = [];
  let node: HTMLElement | null = container.parentElement;
  while (node) {
    for (const child of Array.from(node.children)) {
      if (isHTMLElement(child) && child !== container && !child.contains(container)) {
        result.push(child);
      }
    }
    node = node.parentElement;
  }
  return result;
}
