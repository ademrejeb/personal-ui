import { useCallback, useRef, useState } from "react";
import { useEventCallback } from "./useEventCallback";

export interface UseControllableStateParams<T> {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export type SetStateAction<T> = T | ((prev: T) => T);

/**
 * Unifies controlled and uncontrolled state.
 *
 * - When `value` is provided the hook is controlled; internal state is ignored.
 * - `onChange` fires only when the resolved value actually changes.
 * - The setter accepts functional updates and reads fresh state via a ref,
 *   so rapid consecutive updates never use stale values.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: SetStateAction<T>) => void] {
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : uncontrolled;

  const currentRef = useRef(current);
  currentRef.current = current;

  const onChangeStable = useEventCallback((next: T) => onChange?.(next));

  const setValue = useCallback(
    (next: SetStateAction<T>) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(currentRef.current, resolved)) return;
      if (!isControlled) setUncontrolled(resolved);
      onChangeStable(resolved);
    },
    [isControlled, onChangeStable],
  );

  return [current, setValue];
}
