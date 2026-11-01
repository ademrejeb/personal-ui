import { useCallback, useMemo, useState, type ReactNode } from "react";

/** A single selectable option shared by Combobox and MultiSelect. */
export interface SelectOption<T extends string | number = string> {
  value: T;
  /** Visible content. Defaults to `String(value)` when omitted. */
  label?: ReactNode;
  /** Secondary line rendered under the label. */
  description?: ReactNode;
  /** Leading icon. */
  icon?: ReactNode;
  /** Group heading this option belongs to. */
  group?: string;
  disabled?: boolean;
  /** Extra text considered during filtering (in addition to a string label). */
  keywords?: string[];
  /** Arbitrary metadata forwarded to custom renderers. */
  meta?: unknown;
}

export interface OptionGroup<T extends string | number = string> {
  label: string;
  options: SelectOption<T>[];
}

/** Plain-text representation of an option used for typeahead/filtering. */
export function getOptionText<T extends string | number>(option: SelectOption<T>): string {
  if (typeof option.label === "string") return option.label;
  if (option.keywords?.length) return option.keywords.join(" ");
  return String(option.value);
}

/** Default case-insensitive substring filter. */
export function defaultFilterOption<T extends string | number>(
  option: SelectOption<T>,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return getOptionText(option).toLowerCase().includes(needle);
}

/** Filter then group options, preserving first-seen group order. */
export function buildGroups<T extends string | number>(
  options: SelectOption<T>[],
  query: string,
  filterFn: (option: SelectOption<T>, query: string) => boolean = defaultFilterOption,
): OptionGroup<T>[] {
  const filtered = options.filter((option) => filterFn(option, query));
  const groups: OptionGroup<T>[] = [];
  const byLabel = new Map<string, OptionGroup<T>>();
  for (const option of filtered) {
    const label = option.group ?? "";
    let group = byLabel.get(label);
    if (!group) {
      group = { label, options: [] };
      byLabel.set(label, group);
      groups.push(group);
    }
    group.options.push(option);
  }
  return groups;
}

/** Index of the next enabled option in a direction, with optional wrapping. */
export function findNextEnabledIndex<T extends string | number>(
  options: SelectOption<T>[],
  from: number,
  direction: 1 | -1,
  loop = true,
): number {
  const count = options.length;
  if (count === 0) return -1;
  let index = from;
  for (let step = 0; step < count; step += 1) {
    index += direction;
    if (index < 0) {
      if (!loop) return from;
      index = count - 1;
    } else if (index >= count) {
      if (!loop) return from;
      index = 0;
    }
    if (!options[index].disabled) return index;
  }
  return from;
}

export function findEdgeEnabledIndex<T extends string | number>(
  options: SelectOption<T>[],
  edge: "start" | "end",
): number {
  if (edge === "start") {
    const index = options.findIndex((option) => !option.disabled);
    return index;
  }
  for (let i = options.length - 1; i >= 0; i -= 1) {
    if (!options[i].disabled) return i;
  }
  return -1;
}

export interface UseListboxOptions<T extends string | number> {
  options: SelectOption<T>[];
  idPrefix: string;
  query?: string;
  filterFn?: (option: SelectOption<T>, query: string) => boolean;
  loop?: boolean;
}

export interface UseListboxResult<T extends string | number> {
  groups: OptionGroup<T>[];
  /** Options in visual order; the index matches the flattened listbox order. */
  flat: SelectOption<T>[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  moveActive: (direction: 1 | -1) => void;
  moveToEdge: (edge: "start" | "end") => void;
  resetActive: () => void;
  getOptionId: (index: number) => string;
  isActive: (index: number) => boolean;
}

/**
 * Shared listbox state: filters + groups options, keeps a roving active index,
 * and exposes stable option ids for `aria-activedescendant`. Combobox and
 * MultiSelect both build on this so their navigation logic cannot drift.
 */
export function useListbox<T extends string | number>({
  options,
  idPrefix,
  query = "",
  filterFn,
  loop = true,
}: UseListboxOptions<T>): UseListboxResult<T> {
  const groups = useMemo(() => buildGroups(options, query, filterFn), [options, query, filterFn]);
  const flat = useMemo(() => groups.flatMap((group) => group.options), [groups]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const moveActive = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => findNextEnabledIndex(flat, current, direction, loop));
    },
    [flat, loop],
  );

  const moveToEdge = useCallback(
    (edge: "start" | "end") => setActiveIndex(findEdgeEnabledIndex(flat, edge)),
    [flat],
  );

  const resetActive = useCallback(() => setActiveIndex(-1), []);
  const getOptionId = useCallback((index: number) => `${idPrefix}-option-${index}`, [idPrefix]);
  const isActive = useCallback((index: number) => index === activeIndex, [activeIndex]);

  return {
    groups,
    flat,
    activeIndex,
    setActiveIndex,
    moveActive,
    moveToEdge,
    resetActive,
    getOptionId,
    isActive,
  };
}

/** Own-value equality that tolerates number/string comparison. */
export function optionEquals<T extends string | number>(a: T, b: T): boolean {
  return a === b;
}
