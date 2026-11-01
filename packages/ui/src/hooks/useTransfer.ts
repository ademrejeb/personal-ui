import { useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

export type TransferDirection = "left" | "right";

export interface TransferItem {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface UseTransferOptions {
  dataSource: TransferItem[];
  /** Controlled list of keys on the right-hand side. */
  targetKeys?: readonly string[];
  defaultTargetKeys?: readonly string[];
  onChange?: (targetKeys: string[], direction: TransferDirection, movedKeys: string[]) => void;
  /** Case-insensitive "contains" match against string labels by default. */
  filterOption?: (item: TransferItem, query: string) => boolean;
  disabled?: boolean;
}

export interface TransferPanelPropBag extends HTMLAttributes<HTMLDivElement> {
  [dataAttribute: `data-${string}`]: unknown;
}

export interface TransferItemPropBag extends HTMLAttributes<HTMLLIElement> {
  [dataAttribute: `data-${string}`]: unknown;
}

export interface UseTransferResult {
  /** Ids used to wire the panels to their headings. */
  panelIds: { left: string; right: string };
  sourceItems: TransferItem[];
  targetItems: TransferItem[];
  sourceSelected: string[];
  targetSelected: string[];
  sourceQuery: string;
  targetQuery: string;
  setQuery: (side: TransferDirection, query: string) => void;
  isSelected: (side: TransferDirection, key: string) => boolean;
  toggle: (side: TransferDirection, key: string, checked?: boolean) => void;
  toggleAll: (side: TransferDirection) => void;
  allSelected: (side: TransferDirection) => boolean;
  someSelected: (side: TransferDirection) => boolean;
  /** True when the side has a selection that can actually move. */
  canMove: (side: TransferDirection) => boolean;
  move: (direction: TransferDirection) => void;
  getPanelProps: (
    side: TransferDirection,
    props?: HTMLAttributes<HTMLDivElement>,
  ) => TransferPanelPropBag;
  getItemProps: (item: TransferItem, props?: HTMLAttributes<HTMLLIElement>) => TransferItemPropBag;
}

function matchesDefault(item: TransferItem, query: string): boolean {
  if (typeof item.label !== "string") return true;
  return item.label.toLowerCase().includes(query.trim().toLowerCase());
}

/**
 * Headless dual-listbox state: two sides, independent selections and search
 * queries, and a `move` action that reports which keys travelled. The target
 * side can be controlled while the component still owns its checkbox state.
 */
export function useTransfer({
  dataSource,
  targetKeys,
  defaultTargetKeys = [],
  onChange,
  filterOption,
  disabled = false,
}: UseTransferOptions): UseTransferResult {
  const baseId = useId();
  const [uncontrolledTarget, setUncontrolledTarget] = useState<readonly string[]>(defaultTargetKeys);
  const resolvedTarget = targetKeys ?? uncontrolledTarget;

  const [selected, setSelected] = useState<Record<TransferDirection, string[]>>({
    left: [],
    right: [],
  });
  const [query, setQueryState] = useState<Record<TransferDirection, string>>({ left: "", right: "" });
  const targetRef = useRef(resolvedTarget);
  targetRef.current = resolvedTarget;

  const filter = (items: TransferItem[], side: TransferDirection) => {
    const term = query[side];
    if (!term) return items;
    const predicate = filterOption ?? matchesDefault;
    return items.filter((item) => predicate(item, term));
  };

  const sourceItems = filter(
    dataSource.filter((item) => !resolvedTarget.includes(item.key)),
    "left",
  );
  const targetItems = filter(
    dataSource.filter((item) => resolvedTarget.includes(item.key)),
    "right",
  );

  const toggle = (side: TransferDirection, key: string, checked?: boolean) => {
    if (disabled) return;
    setSelected((current) => {
      const next = new Set(current[side]);
      const shouldAdd = checked ?? !next.has(key);
      if (shouldAdd) next.add(key);
      else next.delete(key);
      return { ...current, [side]: [...next] };
    });
  };

  const toggleAll = (side: TransferDirection) => {
    if (disabled) return;
    const items = side === "left" ? sourceItems : targetItems;
    const movable = items.filter((item) => !item.disabled).map((item) => item.key);
    setSelected((current) => {
      const allOn = movable.length > 0 && movable.every((key) => current[side].includes(key));
      return { ...current, [side]: allOn ? [] : movable };
    });
  };

  const move = (direction: TransferDirection) => {
    if (disabled) return;
    const from: TransferDirection = direction === "right" ? "left" : "right";
    const items = from === "left" ? sourceItems : targetItems;
    const movedKeys = selected[from].filter(
      (key) => items.some((item) => item.key === key && !item.disabled),
    );
    if (movedKeys.length === 0) return;

    const next =
      direction === "right"
        ? [...targetRef.current, ...movedKeys]
        : targetRef.current.filter((key) => !movedKeys.includes(key));

    if (targetKeys === undefined) setUncontrolledTarget(next);
    setSelected((current) => ({ ...current, [from]: [] }));
    onChange?.(next, direction, movedKeys);
  };

  const isSelected = (side: TransferDirection, key: string) => selected[side].includes(key);

  const allSelected = (side: TransferDirection) => {
    const items = (side === "left" ? sourceItems : targetItems).filter((item) => !item.disabled);
    return items.length > 0 && items.every((item) => selected[side].includes(item.key));
  };

  const someSelected = (side: TransferDirection) =>
    (side === "left" ? sourceItems : targetItems).some((item) => selected[side].includes(item.key));

  return {
    panelIds: { left: `${baseId}-left-panel`, right: `${baseId}-right-panel` },
    sourceItems,
    targetItems,
    sourceSelected: selected.left,
    targetSelected: selected.right,
    sourceQuery: query.left,
    targetQuery: query.right,
    setQuery: (side, value) => setQueryState((current) => ({ ...current, [side]: value })),
    isSelected,
    toggle,
    toggleAll,
    allSelected,
    someSelected,
    canMove: (side) => {
      const items = side === "left" ? sourceItems : targetItems;
      return selected[side].some((key) =>
        items.some((item) => item.key === key && !item.disabled),
      );
    },
    move,
    getPanelProps: (side, props = {}) => ({
      ...props,
      id: side === "left" ? `${baseId}-left-panel` : `${baseId}-right-panel`,
      "data-side": side,
    }),
    getItemProps: (item, props = {}) => ({
      ...props,
      "data-key": item.key,
      "data-disabled": item.disabled || undefined,
    }),
  };
}
