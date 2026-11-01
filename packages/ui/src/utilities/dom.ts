export const canUseDOM = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

/** Returns the element's owner document, falling back to the global one. */
export function getOwnerDocument(node?: Node | null): Document {
  return (node?.ownerDocument ?? (canUseDOM() ? document : null)) as Document;
}

/** Returns the element's owner window, falling back to the global one. */
export function getOwnerWindow(node?: Node | null): Window {
  return (getOwnerDocument(node)?.defaultView ?? (canUseDOM() ? window : null)) as Window;
}

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  '[contenteditable]:not([contenteditable="false"])',
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  return nodes.filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      isVisible(el) &&
      // Exclude elements inside an inert subtree.
      !el.closest("[inert]"),
  );
}

export const isHTMLElement = (value: unknown): value is HTMLElement =>
  canUseDOM() && value instanceof HTMLElement;

/** True when the node is contained by `container`, including through shadow DOM. */
export function contains(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) return false;
  if (parent.contains(child)) return true;
  let node: Node | null = child;
  while (node) {
    if (node === parent) return true;
    node = node.parentNode ?? (node as ShadowRoot).host ?? null;
  }
  return false;
}
