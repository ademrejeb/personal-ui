/** A key used to identify a selected item. */
export type SelectionKey = string | number;

/**
 * Membership test for a single key.
 *
 * O(n) over the list; callers that test many keys build a `Set` once. Kept
 * tiny on purpose so DataTable rows, MultiSelect chips, and future surfaces all
 * share one implementation instead of drifting.
 */
export function isKeySelected<T extends SelectionKey>(selected: readonly T[], key: T): boolean {
  return selected.includes(key);
}

/**
 * Toggle one key: remove it when present, add it when absent.
 *
 * Returns the original array unchanged when nothing happened (including when
 * `max` is reached), so callers driving `useControllableState` do not emit a
 * change for a no-op.
 */
export function toggleKey<T extends SelectionKey>(
  selected: readonly T[],
  key: T,
  max?: number,
): T[] {
  if (selected.includes(key)) return selected.filter((value) => value !== key);
  if (max != null && selected.length >= max) return selected as T[];
  return [...selected, key];
}

/**
 * Turn many keys on or off at once, preserving the existing order and appending
 * newly selected keys in the order given. Respects `max` when turning on.
 */
export function setKeys<T extends SelectionKey>(
  selected: readonly T[],
  keys: readonly T[],
  on: boolean,
  max?: number,
): T[] {
  const keySet = new Set(keys);
  if (!on) {
    const next = selected.filter((value) => !keySet.has(value));
    return next.length === selected.length ? (selected as T[]) : next;
  }
  const next = [...selected];
  for (const key of keys) {
    if (next.includes(key)) continue;
    if (max != null && next.length >= max) break;
    next.push(key);
  }
  return next.length === selected.length ? (selected as T[]) : next;
}

/** Add keys (see `setKeys`). */
export function selectKeys<T extends SelectionKey>(
  selected: readonly T[],
  keys: readonly T[],
  max?: number,
): T[] {
  return setKeys(selected, keys, true, max);
}

/** Remove keys (see `setKeys`). */
export function deselectKeys<T extends SelectionKey>(
  selected: readonly T[],
  keys: readonly T[],
): T[] {
  return setKeys(selected, keys, false);
}

/** True when every key is selected (and `keys` is non-empty). */
export function areAllSelected<T extends SelectionKey>(
  selected: readonly T[],
  keys: readonly T[],
): boolean {
  return keys.length > 0 && keys.every((key) => selected.includes(key));
}

/** True when at least one key is selected. */
export function areSomeSelected<T extends SelectionKey>(
  selected: readonly T[],
  keys: readonly T[],
): boolean {
  return keys.some((key) => selected.includes(key));
}
