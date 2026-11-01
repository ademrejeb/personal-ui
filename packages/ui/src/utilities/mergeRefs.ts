import type { Ref, RefCallback } from "react";

/**
 * Composes multiple refs (object or callback) into a single callback ref.
 * Returns undefined when there are no refs to merge, so React does not attach
 * an unnecessary ref.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") {
        ref(value);
      } else {
        (ref as { current: T | null }).current = value;
      }
    }
  };
}
