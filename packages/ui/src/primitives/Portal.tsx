import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { canUseDOM } from "../utilities/dom";

export interface PortalProps {
  children: ReactNode;
  /** Target container. Defaults to `document.body`. */
  container?: HTMLElement | null;
  /** Render immediately (e.g. during SSR tests) instead of after mount. */
  forceMount?: boolean;
  /** Optional class applied to the portal wrapper when one is created. */
  className?: string;
}

/**
 * Renders children into a different part of the DOM. Mounts only on the client
 * to keep SSR output deterministic.
 */
export function Portal({ children, container, forceMount = false }: PortalProps): ReactNode {
  const [mounted, setMounted] = useState(forceMount);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !canUseDOM()) return null;
  const target = container ?? document.body;
  return createPortal(children, target);
}
