import { useEffect, useLayoutEffect } from "react";
import { canUseDOM } from "../utilities/dom";

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server, to avoid the
 * SSR warning without introducing conditional hook calls.
 */
export const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;
