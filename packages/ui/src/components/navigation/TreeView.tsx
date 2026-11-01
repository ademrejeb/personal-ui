import { forwardRef, useMemo, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  useTree,
  type TreeItem,
  type TreeListProps,
  type TreeRow,
  type TreeSelectionMode,
} from "../../hooks/useTree";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";

export type TreeViewSlot =
  | "root"
  | "item"
  | "row"
  | "toggle"
  | "toggleIcon"
  | "checkbox"
  | "label"
  | "description"
  | "empty";

export type TreeViewClassNames = SlotClassNames<TreeViewSlot>;

export interface TreeViewProps
  extends SlotConfig<TreeViewSlot>,
    Omit<TreeListProps, "className" | "children"> {
  items: TreeItem<string>[];
  className?: string;
  selectionMode?: TreeSelectionMode;
  selectedKeys?: readonly string[];
  defaultSelectedKeys?: readonly string[];
  onSelectedKeysChange?: (keys: string[]) => void;
  expandedKeys?: readonly string[];
  defaultExpandedKeys?: readonly string[];
  /** Expand every parent on first render. */
  defaultExpandAll?: boolean;
  onExpandedKeysChange?: (keys: string[]) => void;
  /** Multiple mode: propagate checks to leaf descendants. Defaults to `true`. */
  cascade?: boolean;
  onActivate?: (key: string) => void;
  /** Row that starts focused, and therefore owns the tree's tab stop. */
  defaultFocusedKey?: string | null;
  /** Accessible name for the tree. */
  label?: string;
  /** Draw an indent guide per level. */
  showLines?: boolean;
  /** Replaces the default label rendering for every row. */
  renderLabel?: (row: TreeRow<string>) => ReactNode;
  /** Leading visual per row (icon, badge, avatar). */
  renderIcon?: (row: TreeRow<string>) => ReactNode;
  emptyMessage?: ReactNode;
}

/**
 * Vertical tree with expand/collapse, roving focus, and single or cascading
 * multi-select. Renders a flat list of `treeitem`s with `aria-level`, which is
 * the approach assistive technology handles most predictably.
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  {
    items,
    className,
    classNames,
    unstyled = false,
    selectionMode = "single",
    selectedKeys,
    defaultSelectedKeys,
    onSelectedKeysChange,
    expandedKeys,
    defaultExpandedKeys,
    defaultExpandAll = false,
    onExpandedKeysChange,
    cascade = true,
    onActivate,
    defaultFocusedKey,
    label,
    showLines = false,
    renderLabel,
    renderIcon,
    emptyMessage = "No items",
    ...rest
  },
  ref,
) {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const initialExpanded = useMemo(() => {
    if (defaultExpandedKeys) return defaultExpandedKeys;
    if (!defaultExpandAll) return [];
    const collect = (nodes: TreeItem<string>[]): string[] =>
      nodes.flatMap((node) => (node.children?.length ? [node.key, ...collect(node.children)] : []));
    return collect(items);
  }, [defaultExpandedKeys, defaultExpandAll, items]);

  const tree = useTree({
    items,
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    onSelectedKeysChange,
    expandedKeys,
    defaultExpandedKeys: initialExpanded,
    onExpandedKeysChange,
    cascade,
    onActivate,
    defaultFocusedKey,
  });

  return (
    <ul
      {...tree.getTreeProps({
        ...rest,
        ref,
        "aria-label": rest["aria-label"] ?? label,
        className: slotClass(config, "root", "ui-tree", showLines && "ui-tree--lines", className),
      })}
    >
      {tree.rows.length === 0 ? (
        <li className={slotClass(config, "empty", "ui-tree__empty")}>{emptyMessage}</li>
      ) : (
        tree.rows.map((row) => (
          <li
            key={row.key}
            style={{ ["--ui-tree-level" as string]: row.level - 1 }}
            className={slotClass(
              config,
              "item",
              "ui-tree__item",
              row.selected && selectionMode === "single" && "ui-tree__item--selected",
              row.disabled && "ui-tree__item--disabled",
            )}
            {...tree.getItemProps(row.key)}
          >
            <span className={slotClass(config, "row", "ui-tree__row")}>
              {row.hasChildren ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  data-state={row.expanded ? "open" : "closed"}
                  className={slotClass(config, "toggle", "ui-tree__toggle")}
                  onClick={(event) => {
                    event.stopPropagation();
                    tree.toggleExpanded(row.key);
                  }}
                >
                  <ChevronRight
                    size={16}
                    className={slotClass(config, "toggleIcon", "ui-tree__toggle-icon")}
                  />
                </button>
              ) : (
                <span aria-hidden="true" className="ui-tree__toggle ui-tree__toggle--leaf" />
              )}

              {selectionMode === "multiple" && (
                <span
                  aria-hidden="true"
                  className={slotClass(config, "checkbox", "ui-tree__checkbox")}
                  data-state={row.checked === "mixed" ? "mixed" : row.checked ? "on" : "off"}
                />
              )}

              {renderIcon?.(row)}
              <span className={slotClass(config, "label", "ui-tree__label")}>
                {renderLabel ? renderLabel(row) : (row.item.label ?? row.key)}
              </span>
              {row.item.description != null && (
                <span className={slotClass(config, "description", "ui-tree__description")}>
                  {row.item.description}
                </span>
              )}
            </span>
          </li>
        ))
      )}
    </ul>
  );
});
