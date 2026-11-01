import { useCallback } from "react";
import { useControllableState, type SetStateAction } from "./useControllableState";
import {
  areAllSelected,
  areSomeSelected,
  deselectKeys,
  selectKeys,
  setKeys,
  toggleKey,
  type SelectionKey,
} from "../utilities/selection";

export interface UseSelectionOptions<T extends SelectionKey> {
  /** Controlled selection. */
  value?: T[];
  defaultValue?: T[];
  onChange?: (selected: T[]) => void;
  /** Cap on the number of selected keys; further selection is ignored. */
  max?: number;
}

export interface SelectionApi<T extends SelectionKey> {
  selected: T[];
  setSelected: (next: SetStateAction<T[]>) => void;
  isSelected: (key: T) => boolean;
  toggle: (key: T) => void;
  /** Add one or more keys. */
  select: (keys: T | T[]) => void;
  /** Remove one or more keys. */
  deselect: (keys: T | T[]) => void;
  /** Toggle a whole key group; `on` forces a direction. */
  toggleAll: (keys: T[], on?: boolean) => void;
  clear: () => void;
  allSelected: (keys: T[]) => boolean;
  someSelected: (keys: T[]) => boolean;
  /** True when `max` is reached. */
  atLimit: boolean;
}

function toArray<T extends SelectionKey>(keys: T | T[]): T[] {
  return Array.isArray(keys) ? keys : [keys];
}

/**
 * Multi-selection state shared by every surface that lets users pick many
 * items: the DataTable selection column and the MultiSelect chips today, any
 * future grouped/collection widget tomorrow. Wraps `useControllableState` so
 * controlled and uncontrolled usage behave identically, and delegates the list
 * math to `utilities/selection` so behaviour cannot drift between components.
 */
export function useSelection<T extends SelectionKey>({
  value,
  defaultValue,
  onChange,
  max,
}: UseSelectionOptions<T>): SelectionApi<T> {
  const [selected, setSelected] = useControllableState<T[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  });

  const isSelected = useCallback((key: T) => selected.includes(key), [selected]);
  const toggle = useCallback(
    (key: T) => setSelected((prev) => toggleKey(prev, key, max)),
    [setSelected, max],
  );
  const select = useCallback(
    (keys: T | T[]) => setSelected((prev) => selectKeys(prev, toArray(keys), max)),
    [setSelected, max],
  );
  const deselect = useCallback(
    (keys: T | T[]) => setSelected((prev) => deselectKeys(prev, toArray(keys))),
    [setSelected],
  );
  const toggleAll = useCallback(
    (keys: T[], on?: boolean) =>
      setSelected((prev) =>
        setKeys(
          prev,
          keys,
          on ?? !areAllSelected(prev, keys),
          max,
        ),
      ),
    [setSelected, max],
  );
  const clear = useCallback(() => setSelected([]), [setSelected]);
  const allSelected = useCallback((keys: T[]) => areAllSelected(selected, keys), [selected]);
  const someSelected = useCallback((keys: T[]) => areSomeSelected(selected, keys), [selected]);

  return {
    selected,
    setSelected,
    isSelected,
    toggle,
    select,
    deselect,
    toggleAll,
    clear,
    allSelected,
    someSelected,
    atLimit: max != null && selected.length >= max,
  };
}
