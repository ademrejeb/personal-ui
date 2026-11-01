import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { useControllableState } from "./useControllableState";

/** One node of a tree. Keys must be unique across the whole tree. */
export interface TreeItem<TKey extends string = string> {
  key: TKey;
  label?: ReactNode;
  /** Secondary line rendered under the label. */
  description?: ReactNode;
  children?: TreeItem<TKey>[];
  disabled?: boolean;
  /** Opt a node out of selection without disabling its children. */
  unselectable?: boolean;
}

export type TreeSelectionMode = "single" | "multiple";

/** A visible node, in render order. */
export interface TreeRow<TKey extends string = string> {
  key: TKey;
  item: TreeItem<TKey>;
  /** 1-based depth, matching `aria-level`. */
  level: number;
  index: number;
  parentKey: TKey | null;
  hasChildren: boolean;
  expanded: boolean;
  selected: boolean;
  checked: boolean | "mixed";
  disabled: boolean;
}

export interface UseTreeOptions<TKey extends string = string> {
  items: TreeItem<TKey>[];
  selectionMode?: TreeSelectionMode;
  selectedKeys?: readonly TKey[];
  defaultSelectedKeys?: readonly TKey[];
  onSelectedKeysChange?: (keys: TKey[]) => void;
  expandedKeys?: readonly TKey[];
  defaultExpandedKeys?: readonly TKey[];
  onExpandedKeysChange?: (keys: TKey[]) => void;
  /** Multiple mode: checking a node cascades to its leaf descendants. Defaults to `true`. */
  cascade?: boolean;
  /** Fired on Enter/Space activation and on selectable click. */
  onActivate?: (key: TKey) => void;
  /** Row that starts focused (and therefore owns the tree's tab stop). */
  defaultFocusedKey?: TKey | null;
}

/** Props for the `role="tree"` list, including the ref the hook needs for focus. */
export type TreeListProps = HTMLAttributes<HTMLUListElement> & {
  ref?: Ref<HTMLUListElement>;
};

/**
 * Prune a tree to the branches containing a match, plus the keys that must be
 * expanded to reveal them. Matching is a case-insensitive substring test on the
 * node's string label (falling back to its key).
 */
export function filterTreeItems<TKey extends string>(
  items: TreeItem<TKey>[],
  query: string,
): { items: TreeItem<TKey>[]; expandedKeys: TKey[] } {
  const needle = query.trim().toLowerCase();
  if (!needle) return { items, expandedKeys: [] };

  const keep = (nodes: TreeItem<TKey>[]): TreeItem<TKey>[] =>
    nodes.flatMap((node) => {
      const text = typeof node.label === "string" ? node.label : String(node.key);
      const children = node.children ? keep(node.children) : [];
      if (children.length > 0) return [{ ...node, children }];
      return text.toLowerCase().includes(needle) ? [node] : [];
    });

  const pruned = keep(items);
  const expandedKeys = getAllTreeKeys(pruned).filter((key) => {
    const found = findTreeNode(pruned, key);
    return Boolean(found?.item.children?.length);
  });

  return { items: pruned, expandedKeys };
}

export interface TreeApi<TKey extends string = string> {
  rows: TreeRow<TKey>[];
  selectionMode: TreeSelectionMode;
  expandedKeys: readonly TKey[];
  selectedKeys: readonly TKey[];
  focusedKey: TKey | null;
  setFocusedKey: (key: TKey | null) => void;
  isExpanded: (key: TKey) => boolean;
  isSelected: (key: TKey) => boolean;
  checkedState: (key: TKey) => boolean | "mixed";
  toggleExpanded: (key: TKey) => void;
  setExpanded: (key: TKey, expanded: boolean) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectKey: (key: TKey) => void;
  getTreeProps: (props?: TreeListProps) => TreeListProps;
  getItemProps: (
    key: TKey,
    props?: HTMLAttributes<HTMLLIElement>,
  ) => HTMLAttributes<HTMLLIElement>;
  getGroupProps: (
    key: TKey,
    props?: HTMLAttributes<HTMLUListElement>,
  ) => HTMLAttributes<HTMLUListElement>;
}

/** Every key in the tree, parents first (pre-order). */
export function getAllTreeKeys<TKey extends string>(items: TreeItem<TKey>[]): TKey[] {
  return items.flatMap((item) => [item.key, ...getAllTreeKeys(item.children ?? [])]);
}

/** Keys of a node's descendants (not the node itself). */
export function getDescendantKeys<TKey extends string>(item: TreeItem<TKey>): TKey[] {
  return (item.children ?? []).flatMap((child) => [child.key, ...getDescendantKeys(child)]);
}

/** Selectable leaves beneath (and including) a node. */
function getSelectableLeafKeys<TKey extends string>(item: TreeItem<TKey>): TKey[] {
  const children = item.children ?? [];
  if (children.length === 0) {
    return item.unselectable ? [] : [item.key];
  }
  return children.flatMap(getSelectableLeafKeys);
}

/** Locate a node plus its ancestry. */
export function findTreeNode<TKey extends string>(
  items: TreeItem<TKey>[],
  key: TKey,
): { item: TreeItem<TKey>; parentKey: TKey | null; level: number } | null {
  const walk = (
    nodes: TreeItem<TKey>[],
    parentKey: TKey | null,
    level: number,
  ): { item: TreeItem<TKey>; parentKey: TKey | null; level: number } | null => {
    for (const node of nodes) {
      if (node.key === key) return { item: node, parentKey, level };
      const found = walk(node.children ?? [], node.key, level + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(items, null, 1);
}

/** Flatten the tree down to the nodes currently visible. */
export function flattenTree<TKey extends string>(
  items: TreeItem<TKey>[],
  expandedKeys: readonly TKey[],
): Array<{ key: TKey; item: TreeItem<TKey>; level: number; parentKey: TKey | null }> {
  const expanded = new Set(expandedKeys);
  const out: Array<{ key: TKey; item: TreeItem<TKey>; level: number; parentKey: TKey | null }> = [];
  const walk = (nodes: TreeItem<TKey>[], level: number, parentKey: TKey | null) => {
    for (const node of nodes) {
      out.push({ key: node.key, item: node, level, parentKey });
      if (node.children?.length && expanded.has(node.key)) {
        walk(node.children, level + 1, node.key);
      }
    }
  };
  walk(items, 1, null);
  return out;
}

const keySet = <TKey extends string>(keys: readonly TKey[]) => new Set<TKey>(keys);

function edgeEnabledKey<TKey extends string>(
  rows: TreeRow<TKey>[],
  edge: "start" | "end",
): TKey | null {
  if (edge === "start") {
    return rows.find((row) => !row.disabled)?.key ?? null;
  }
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (!rows[index].disabled) return rows[index].key;
  }
  return null;
}

function nextEnabledKey<TKey extends string>(
  rows: TreeRow<TKey>[],
  from: number,
  direction: 1 | -1,
): TKey | null {
  let index = from;
  for (let step = 0; step < rows.length; step += 1) {
    index += direction;
    if (index < 0 || index >= rows.length) return rows[from]?.key ?? null;
    if (!rows[index].disabled) return rows[index].key;
  }
  return rows[from]?.key ?? null;
}

/**
 * Headless tree state: expansion, single/multiple (cascading) selection, roving
 * focus, and the ARIA wiring for `role="tree"` / `treeitem` / `group`.
 *
 * The hook never touches the DOM except to move focus to the item it just
 * activated, which keeps keyboard navigation working with roving tabindex.
 */
export function useTree<TKey extends string = string>({
  items,
  selectionMode = "single",
  selectedKeys: selectedKeysProp,
  defaultSelectedKeys,
  onSelectedKeysChange,
  expandedKeys: expandedKeysProp,
  defaultExpandedKeys,
  onExpandedKeysChange,
  cascade = true,
  onActivate,
  defaultFocusedKey = null,
}: UseTreeOptions<TKey>): TreeApi<TKey> {
  const treeRef = useRef<HTMLUListElement | null>(null);
  const pendingFocus = useRef<TKey | null>(null);

  const [expandedKeys, setExpandedKeysState] = useControllableState<readonly TKey[]>({
    value: expandedKeysProp,
    defaultValue: defaultExpandedKeys ?? [],
    onChange: onExpandedKeysChange ? (keys) => onExpandedKeysChange([...keys]) : undefined,
  });
  const [selectedKeys, setSelectedKeysState] = useControllableState<readonly TKey[]>({
    value: selectedKeysProp,
    defaultValue: defaultSelectedKeys ?? [],
    onChange: onSelectedKeysChange ? (keys) => onSelectedKeysChange([...keys]) : undefined,
  });
  const [focusedKey, setFocusedKey] = useControllableState<TKey | null>({
    value: undefined,
    defaultValue: defaultFocusedKey,
  });

  const expanded = useMemo(() => keySet(expandedKeys), [expandedKeys]);
  const selected = useMemo(() => keySet(selectedKeys), [selectedKeys]);

  const checkedState = useCallback(
    (key: TKey): boolean | "mixed" => {
      const found = findTreeNode(items, key);
      if (!found) return false;
      const { item } = found;
      if (!item.children?.length) return selected.has(key);
      if (!cascade) return selected.has(key);
      const leaves = getSelectableLeafKeys(item).filter((leaf) => leaf !== key);
      if (leaves.length === 0) return selected.has(key);
      const checkedCount = leaves.filter((leaf) => selected.has(leaf)).length;
      if (checkedCount === 0) return false;
      return checkedCount === leaves.length ? true : "mixed";
    },
    [items, selected, cascade],
  );

  const rows = useMemo<TreeRow<TKey>[]>(() => {
    return flattenTree(items, expandedKeys).map((row, index) => ({
      ...row,
      index,
      hasChildren: Boolean(row.item.children?.length),
      expanded: expanded.has(row.key),
      selected: selectionMode === "single" ? selected.has(row.key) : checkedState(row.key) === true,
      checked: selectionMode === "multiple" ? checkedState(row.key) : false,
      disabled: Boolean(row.item.disabled),
    }));
  }, [items, expandedKeys, expanded, selected, selectionMode, checkedState]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const focusKey = useCallback((key: TKey | null) => {
    pendingFocus.current = key;
    setFocusedKey(key);
  }, [setFocusedKey]);

  useEffect(() => {
    const key = pendingFocus.current;
    if (key == null) return;
    pendingFocus.current = null;
    const node = treeRef.current?.querySelector<HTMLElement>(
      `[data-tree-key=${JSON.stringify(key)}]`,
    );
    node?.focus();
  }, [focusedKey, expandedKeys]);

  const setExpanded = useCallback(
    (key: TKey, next: boolean) => {
      setExpandedKeysState((current) => {
        const has = current.includes(key);
        if (has === next) return current;
        return next ? [...current, key] : current.filter((entry) => entry !== key);
      });
    },
    [setExpandedKeysState],
  );

  const toggleExpanded = useCallback(
    (key: TKey) => setExpanded(key, !expanded.has(key)),
    [expanded, setExpanded],
  );

  const selectKey = useCallback(
    (key: TKey) => {
      const found = findTreeNode(items, key);
      if (!found || found.item.disabled || found.item.unselectable) return;
      onActivate?.(key);

      setSelectedKeysState((current) => {
        if (selectionMode === "single") {
          return current.length === 1 && current[0] === key ? current : [key];
        }
        const currentSet = new Set(current);
        const target = cascade ? getSelectableLeafKeys(found.item) : [key];
        const willCheck = !currentSet.has(target[0] ?? key);
        for (const entry of target) {
          if (willCheck) currentSet.add(entry);
          else currentSet.delete(entry);
        }
        return [...currentSet];
      });
    },
    [items, cascade, selectionMode, onActivate, setSelectedKeysState],
  );

  const getTreeProps = useCallback<TreeApi<TKey>["getTreeProps"]>(
    (props) => ({
      ...props,
      ref: (node: HTMLUListElement | null) => {
        treeRef.current = node;
        const external = props?.ref;
        if (typeof external === "function") external(node);
        else if (external) {
          (external as { current: HTMLUListElement | null }).current = node;
        }
      },
      role: props?.role ?? "tree",
      "aria-multiselectable": selectionMode === "multiple" ? true : undefined,
      onKeyDown: (event) => {
        props?.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const list = rowsRef.current;
        if (list.length === 0) return;
        const currentIndex = list.findIndex((row) => row.key === focusedKey);
        const current = currentIndex >= 0 ? list[currentIndex] : null;

        const keys: Record<string, () => void> = {
          ArrowDown: () => focusKey(nextEnabledKey(list, currentIndex < 0 ? -1 : currentIndex, 1)),
          ArrowUp: () => focusKey(nextEnabledKey(list, currentIndex < 0 ? list.length : currentIndex, -1)),
          Home: () => focusKey(edgeEnabledKey(list, "start")),
          End: () => focusKey(edgeEnabledKey(list, "end")),
          ArrowRight: () => {
            if (!current) return;
            if (current.hasChildren && !current.expanded) {
              setExpanded(current.key, true);
              return;
            }
            const child = list.find(
              (row) => row.parentKey === current.key && !row.disabled,
            );
            if (child) focusKey(child.key);
          },
          ArrowLeft: () => {
            if (!current) return;
            if (current.hasChildren && current.expanded) {
              setExpanded(current.key, false);
              return;
            }
            if (current.parentKey) focusKey(current.parentKey);
          },
          Enter: () => {
            if (current) selectKey(current.key);
          },
          " ": () => {
            if (current) selectKey(current.key);
          },
          "*": () => {
            const topLevel = list.filter((row) => row.level === 1 && row.hasChildren);
            setExpandedKeysState((keys) => [
              ...new Set([...keys, ...topLevel.map((row) => row.key)]),
            ]);
          },
        };

        const handler = keys[event.key];
        if (!handler) return;
        event.preventDefault();
        handler();
      },
    }),
    [selectionMode, focusedKey, focusKey, setExpanded, selectKey, setExpandedKeysState],
  );

  const getItemProps = useCallback<TreeApi<TKey>["getItemProps"]>(
    (key, props) => {
      const row = rows.find((entry) => entry.key === key);
      const isFocusable =
        focusedKey === key || (focusedKey == null && rows[0]?.key === key);
      return {
        ...props,
        "data-tree-key": key,
        role: props?.role ?? "treeitem",
        "aria-level": row?.level ?? 1,
        "aria-expanded": row?.hasChildren ? row.expanded : undefined,
        "aria-selected": selectionMode === "single" ? Boolean(row?.selected) : undefined,
        "aria-checked": selectionMode === "multiple" ? row?.checked : undefined,
        "aria-disabled": row?.disabled || undefined,
        tabIndex: row?.disabled ? undefined : isFocusable ? 0 : -1,
        onFocus: (event) => {
          props?.onFocus?.(event);
          if (focusedKey !== key) setFocusedKey(key);
        },
        onClick: (event) => {
          props?.onClick?.(event);
          if (event.defaultPrevented || row?.disabled) return;
          focusKey(key);
          selectKey(key);
        },
      };
    },
    [rows, focusedKey, selectionMode, focusKey, selectKey, setFocusedKey],
  );

  const getGroupProps = useCallback<TreeApi<TKey>["getGroupProps"]>(
    (key, props) => ({
      ...props,
      role: props?.role ?? "group",
      "data-tree-group": key,
      hidden: expanded.has(key) ? undefined : true,
    }),
    [expanded],
  );

  return {
    rows,
    selectionMode,
    expandedKeys,
    selectedKeys,
    focusedKey,
    setFocusedKey: focusKey,
    isExpanded: (key) => expanded.has(key),
    isSelected: (key) => selected.has(key),
    checkedState,
    toggleExpanded,
    setExpanded,
    expandAll: () => setExpandedKeysState(getAllTreeKeys(items)),
    collapseAll: () => setExpandedKeysState([]),
    selectKey,
    getTreeProps,
    getItemProps,
    getGroupProps,
  };
}
