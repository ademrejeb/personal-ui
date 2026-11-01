import { useMemo, type Ref } from "react";
import { mergeRefs } from "../utilities/mergeRefs";

/** Stable composition of multiple refs into one callback ref. */
export function useMergedRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> {
  // The deps array is the refs list itself; changes in identity are intentional.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => mergeRefs<T>(...refs), refs);
}
