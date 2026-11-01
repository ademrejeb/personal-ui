import { forwardRef, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import {
  filterTreeItems,
  findTreeNode,
  type TreeItem,
  type TreeRow,
} from "../../hooks/useTree";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";
import { useFieldControl } from "./field-utils";
import { TreeView } from "../navigation/TreeView";

export type TreeSelectSlot =
  | "root"
  | "trigger"
  | "value"
  | "placeholder"
  | "path"
  | "clear"
  | "indicator"
  | "popup"
  | "search"
  | "searchInput"
  | "tree"
  | "empty";

export type TreeSelectClassNames = SlotClassNames<TreeSelectSlot>;

export interface TreeSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<TreeSelectSlot> {
  items: TreeItem<string>[];
  /** Controlled selected key. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (key: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  /** Renders a hidden input so the value participates in form submission. */
  name?: string;
  size?: ControlSize;
  placement?: Placement;
  clearable?: boolean;
  /** Show a filter box in the popup. */
  searchable?: boolean;
  /** Accessible name for the trigger and the popup tree. */
  label?: string;
  emptyMessage?: string;
  /** Keys expanded when the popup first opens. */
  defaultExpandedKeys?: readonly string[];
  /** Seed expansion with the selected node's ancestors. Defaults to `true`. */
  expandSelectedPath?: boolean;
  /** Render the ancestry of the selection above the label in the trigger. */
  showPathInTrigger?: boolean;
  /** Allow selecting nodes that have children. Defaults to `true`. */
  allowParentSelect?: boolean;
  renderOption?: (row: TreeRow<string>) => React.ReactNode;
}

function ancestorsOf(items: TreeItem<string>[], key: string): string[] {
  const path: string[] = [];
  const walk = (nodes: TreeItem<string>[], trail: string[]): boolean => {
    for (const node of nodes) {
      if (node.key === key) {
        path.push(...trail);
        return true;
      }
      if (node.children?.length && walk(node.children, [...trail, node.key])) return true;
    }
    return false;
  };
  walk(items, []);
  return path;
}

function labelOf(items: TreeItem<string>[], key: string): string {
  const found = findTreeNode(items, key);
  if (!found) return key;
  return typeof found.item.label === "string" ? found.item.label : key;
}

/**
 * Picks one node out of a tree. The popup is a `FloatingLayer` wrapping a
 * `TreeView`, so anchoring, outside/Escape dismissal and focus return come for
 * free, while arrow keys and expansion behave exactly like the standalone tree.
 */
export const TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>(function TreeSelect(
  {
    items,
    className,
    classNames,
    unstyled = false,
    value,
    defaultValue = null,
    onValueChange,
    placeholder = "Select…",
    disabled,
    readOnly,
    invalid,
    required,
    id,
    name,
    size = "md",
    placement = "bottom-start",
    clearable = false,
    searchable = false,
    label,
    emptyMessage = "No matches",
    defaultExpandedKeys,
    expandSelectedPath = true,
    showPathInTrigger = false,
    allowParentSelect = true,
    renderOption,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required });
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const [selected, setSelected] = useState<string | null>(defaultValue);
  const resolvedValue = value !== undefined ? value : selected;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedOverride, setExpandedOverride] = useState<readonly string[] | null>(null);

  const baseId = useId();
  const treeId = `${baseId}-tree`;
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const treeRef = useRef<HTMLUListElement | null>(null);

  const node = resolvedValue ? findTreeNode(items, resolvedValue) : null;
  const path = useMemo(
    () => (resolvedValue ? ancestorsOf(items, resolvedValue) : []),
    [items, resolvedValue],
  );
  const filtered = useMemo(() => filterTreeItems(items, query), [items, query]);

  const expandedKeys = useMemo(() => {
    if (expandedOverride) return expandedOverride;
    const seeded = defaultExpandedKeys ?? (expandSelectedPath ? path : []);
    return [...new Set([...seeded, ...filtered.expandedKeys])];
  }, [expandedOverride, defaultExpandedKeys, expandSelectedPath, path, filtered.expandedKeys]);

  const commit = (key: string) => {
    if (value === undefined) setSelected(key);
    onValueChange?.(key);
    setOpen(false);
    setQuery("");
    setExpandedOverride(null);
    anchorRef.current?.focus();
  };

  const clear = () => {
    if (value === undefined) setSelected(null);
    onValueChange?.(null);
  };

  // The tree owns its own roving focus, so put the tab stop on the selected row
  // (or the first one) as soon as the popup opens.
  useEffect(() => {
    if (!open) return;
    const tree = treeRef.current;
    if (!tree) return;
    const target =
      tree.querySelector<HTMLElement>('[role="treeitem"][aria-selected="true"]') ??
      tree.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]');
    target?.focus();
  }, [open]);

  const firstKey = filtered.items[0]?.key ?? null;

  return (
    <div
      ref={(element) => {
        wrapperRef.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      className={slotClass(config, "root", "ui-treeselect", className)}
      {...rest}
    >
      <button
        ref={(element) => {
          anchorRef.current = element;
        }}
        type="button"
        id={field.id}
        role="combobox"
        aria-haspopup="tree"
        aria-expanded={open}
        aria-controls={open ? treeId : undefined}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        aria-required={field.required || undefined}
        aria-label={label}
        disabled={field.disabled}
        data-size={size}
        className={slotClass(config, "trigger", "ui-treeselect__trigger ui-control")}
        onClick={() => {
          if (!readOnly) setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            if (!readOnly) setOpen(true);
          }
        }}
      >
        <span className={slotClass(config, "value", "ui-treeselect__value")}>
          {node ? (
            <>
              {showPathInTrigger && path.length > 0 && (
                <span className={slotClass(config, "path", "ui-treeselect__path")}>
                  {path.map((key) => labelOf(items, key)).join(" / ")}
                </span>
              )}
              {labelOf(items, resolvedValue as string)}
            </>
          ) : (
            <span className={slotClass(config, "placeholder", "ui-treeselect__placeholder")}>
              {placeholder}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className={slotClass(config, "indicator", "ui-treeselect__indicator")}
        />
      </button>

      {clearable && resolvedValue && !field.disabled && !readOnly && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear selection"
          className={slotClass(config, "clear", "ui-treeselect__clear")}
          onClick={() => clear()}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}

      {name && resolvedValue ? <input type="hidden" name={name} value={resolvedValue} /> : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        matchTriggerWidth
        keepOpenRefs={[wrapperRef]}
        returnFocusRef={anchorRef}
        onDismiss={() => setOpen(false)}
        className={slotClass(config, "popup", "ui-treeselect__popup")}
        onKeyDown={(event) => {
          if (event.key === "Tab") setOpen(false);
        }}
      >
        {searchable && (
          <div className={slotClass(config, "search", "ui-treeselect__search")}>
            <Search size={14} aria-hidden="true" />
            <input
              type="text"
              value={query}
              placeholder="Search…"
              aria-label="Search options"
              autoComplete="off"
              className={slotClass(config, "searchInput", "ui-treeselect__search-input")}
              onChange={(event) => {
                setQuery(event.target.value);
                setExpandedOverride(null);
              }}
            />
          </div>
        )}

        <TreeView
          ref={treeRef}
          id={treeId}
          label={label ?? "Options"}
          className={slotClass(config, "tree", "ui-treeselect__tree")}
          items={filtered.items}
          expandedKeys={expandedKeys}
          onExpandedKeysChange={setExpandedOverride}
          selectedKeys={resolvedValue ? [resolvedValue] : []}
          defaultFocusedKey={resolvedValue ?? firstKey}
          emptyMessage={emptyMessage}
          renderLabel={renderOption}
          onActivate={(key) => {
            const found = findTreeNode(items, key);
            if (!allowParentSelect && found?.item.children?.length) return;
            commit(key);
          }}
        />
      </FloatingLayer>
    </div>
  );
});
