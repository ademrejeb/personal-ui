import { useMemo, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  useTransfer,
  type TransferDirection,
  type TransferItem,
} from "../../hooks/useTransfer";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import { Checkbox } from "./Checkbox";

export type TransferSlot =
  | "root"
  | "panel"
  | "panelHeader"
  | "panelTitle"
  | "panelCount"
  | "selectAll"
  | "search"
  | "searchInput"
  | "list"
  | "item"
  | "itemBody"
  | "itemLabel"
  | "itemDescription"
  | "operations"
  | "moveRight"
  | "moveLeft"
  | "empty";

export type TransferClassNames = SlotClassNames<TransferSlot>;

export interface TransferProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<TransferSlot> {
  dataSource: TransferItem[];
  /** Controlled list of keys on the right-hand side. */
  targetKeys?: readonly string[];
  defaultTargetKeys?: readonly string[];
  onChange?: (targetKeys: string[], direction: TransferDirection, movedKeys: string[]) => void;
  /** `[source, target]` headings. */
  titles?: [ReactNode, ReactNode];
  showSearch?: boolean;
  searchPlaceholder?: string;
  filterOption?: (item: TransferItem, query: string) => boolean;
  /** Hide the move-back button for one-way transfers. */
  oneWay?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  listHeight?: number;
  label?: string;
  emptyMessage?: string;
  renderItem?: (item: TransferItem) => ReactNode;
}

function countLabel(count: number) {
  return count === 1 ? "1 item" : `${count} items`;
}

/**
 * Dual list for moving many items between a source and a target set. Selection
 * and search are per side, the headers carry a select-all box, and movement is
 * reported with the keys that travelled.
 */
export const Transfer = forwardRef<HTMLDivElement, TransferProps>(function Transfer(
  {
    dataSource,
    className,
    classNames,
    unstyled = false,
    targetKeys,
    defaultTargetKeys,
    onChange,
    titles = ["Source", "Target"],
    showSearch = false,
    searchPlaceholder = "Search…",
    filterOption,
    oneWay = false,
    disabled = false,
    invalid = false,
    listHeight = 240,
    label = "Transfer",
    emptyMessage = "Nothing here",
    renderItem,
    ...rest
  },
  ref,
) {
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);
  const transfer = useTransfer({
    dataSource,
    targetKeys,
    defaultTargetKeys,
    onChange,
    filterOption,
    disabled,
  });

  const panel = (side: TransferDirection, title: ReactNode) => {
    const items = side === "left" ? transfer.sourceItems : transfer.targetItems;
    const query = side === "left" ? transfer.sourceQuery : transfer.targetQuery;
    const allSelected = transfer.allSelected(side);
    const someSelected = transfer.someSelected(side);
    const titleId = `${transfer.panelIds[side]}-title`;

    return (
      <div
        {...transfer.getPanelProps(side, {
          "aria-labelledby": titleId,
          className: slotClass(config, "panel", "ui-transfer__panel"),
        })}
      >
        <div className={slotClass(config, "panelHeader", "ui-transfer__header")}>
          <span
            id={titleId}
            className={slotClass(config, "panelTitle", "ui-transfer__title")}
          >
            {title}
          </span>
          <span className={slotClass(config, "panelCount", "ui-transfer__count")}>
            {countLabel(items.length)}
          </span>
        </div>

        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          disabled={disabled || items.length === 0}
          label="Select all"
          aria-label={`Select all ${side === "left" ? "source" : "target"} items`}
          size="sm"
          className={slotClass(config, "selectAll", "ui-transfer__select-all")}
          onChange={() => transfer.toggleAll(side)}
        />

        {showSearch && (
          <div className={slotClass(config, "search", "ui-transfer__search")}>
            <Search size={14} aria-hidden="true" />
            <input
              type="text"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={`Search ${side === "left" ? "source" : "target"} list`}
              autoComplete="off"
              disabled={disabled}
              className={slotClass(config, "searchInput", "ui-transfer__search-input")}
              onChange={(event) => transfer.setQuery(side, event.target.value)}
            />
          </div>
        )}

        <ul
          className={slotClass(config, "list", "ui-transfer__list")}
          style={{ maxHeight: listHeight }}
        >
          {items.map((item) => {
            const labelId = `${transfer.panelIds[side]}-item-${item.key}`;
            return (
              <li
                key={item.key}
                {...transfer.getItemProps(item, {
                  className: slotClass(config, "item", "ui-transfer__item"),
                })}
              >
                <Checkbox
                  checked={transfer.isSelected(side, item.key)}
                  disabled={disabled || item.disabled}
                  aria-labelledby={labelId}
                  label={
                    <span className={slotClass(config, "itemBody", "ui-transfer__item-body")}>
                      <span
                        id={labelId}
                        className={slotClass(config, "itemLabel", "ui-transfer__item-label")}
                      >
                        {renderItem ? renderItem(item) : item.label}
                      </span>
                      {item.description != null && (
                        <span
                          className={slotClass(
                            config,
                            "itemDescription",
                            "ui-transfer__item-description",
                          )}
                        >
                          {item.description}
                        </span>
                      )}
                    </span>
                  }
                  size="sm"
                  onChange={(event) => transfer.toggle(side, item.key, event.target.checked)}
                />
              </li>
            );
          })}
          {items.length === 0 && (
            <li className={slotClass(config, "empty", "ui-transfer__empty")}>{emptyMessage}</li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      className={slotClass(config, "root", "ui-transfer", className)}
      {...rest}
    >
      {panel("left", titles[0])}

      <div className={slotClass(config, "operations", "ui-transfer__operations")}>
        <button
          type="button"
          aria-label="Move selected to target"
          disabled={disabled || !transfer.canMove("left")}
          className={slotClass(config, "moveRight", "ui-transfer__move-right ui-button ui-button--outline")}
          onClick={() => transfer.move("right")}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        {!oneWay && (
          <button
            type="button"
            aria-label="Move selected to source"
            disabled={disabled || !transfer.canMove("right")}
            className={slotClass(config, "moveLeft", "ui-transfer__move-left ui-button ui-button--outline")}
            onClick={() => transfer.move("left")}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {panel("right", titles[1])}
    </div>
  );
});
