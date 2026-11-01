import { useMemo, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useCascader, type CascaderOption } from "../../hooks/useCascader";
import { slotClass, slotConfig, type SlotClassNames, type SlotConfig } from "../../utilities/slots";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";
import { useFieldControl } from "./field-utils";

export type CascaderSlot =
  | "root"
  | "trigger"
  | "value"
  | "placeholder"
  | "path"
  | "clear"
  | "indicator"
  | "popup"
  | "menu"
  | "column"
  | "menuItem"
  | "menuItemLabel"
  | "expandIcon"
  | "empty";

export type CascaderClassNames = SlotClassNames<CascaderSlot>;

export interface CascaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    SlotConfig<CascaderSlot> {
  options: CascaderOption[];
  /** Controlled path of option values. */
  value?: string[] | null;
  defaultValue?: string[] | null;
  onChange?: (path: string[] | null, option: CascaderOption | null) => void;
  /** Commit parent rows as well as leaves. */
  changeOnSelect?: boolean;
  expandTrigger?: "click" | "hover";
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  id?: string;
  /** Hidden input name; the value is the joined path. */
  name?: string;
  /** Joins path values for form submission. */
  valueSeparator?: string;
  size?: ControlSize;
  placement?: Placement;
  clearable?: boolean;
  /** Accessible name for the trigger and the popup. */
  label?: string;
  emptyMessage?: string;
  /** Replace the default "A / B / C" trigger rendering. */
  displayRender?: (labels: ReactNode[], path: CascaderOption[]) => ReactNode;
}

/**
 * Selects a path through nested options, one column per level. The trigger stays
 * focused while the popup is open (combobox + `aria-activedescendant`) and every
 * column is a `listbox`, so the control is a single tab stop.
 */
export const Cascader = forwardRef<HTMLDivElement, CascaderProps>(function Cascader(
  {
    options,
    className,
    classNames,
    unstyled = false,
    value,
    defaultValue = null,
    onChange,
    changeOnSelect = false,
    expandTrigger = "click",
    placeholder = "Select…",
    disabled,
    readOnly,
    invalid,
    required,
    id,
    name,
    valueSeparator = "/",
    size = "md",
    placement = "bottom-start",
    clearable = false,
    label,
    emptyMessage = "No options",
    displayRender,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required });
  const config = useMemo(() => slotConfig(unstyled, classNames), [unstyled, classNames]);

  const cascader = useCascader({
    options,
    value,
    defaultValue,
    onChange,
    changeOnSelect,
    expandTrigger,
    disabled: field.disabled,
    readOnly,
  });

  const {
    open,
    setOpen,
    columns,
    activePath,
    selectedPath,
    valuePath,
    anchorRef,
    getTriggerProps,
    getPopupProps,
    getColumnProps,
    getOptionProps,
  } = cascader;

  const labels = selectedPath.map((option) => option.label);
  const triggerContent =
    selectedPath.length > 0
      ? displayRender
        ? displayRender(labels, selectedPath)
        : labels.map((labelNode, index) => (
            <span key={selectedPath[index].value}>
              {index > 0 && (
                <span className={slotClass(config, "path", "ui-cascader__separator")} aria-hidden="true">
                  {" / "}
                </span>
              )}
              {labelNode}
            </span>
          ))
      : null;

  return (
    <div
      ref={ref}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      className={slotClass(config, "root", "ui-cascader", className)}
      {...rest}
    >
      <button
        {...getTriggerProps({
          id: field.id,
          disabled: field.disabled,
          "aria-invalid": field.invalid || undefined,
          "aria-describedby": field.describedBy,
          "aria-required": field.required || undefined,
          "aria-label": label,
          className: slotClass(config, "trigger", "ui-cascader__trigger ui-control"),
          "data-size": size,
        })}
      >
        <span className={slotClass(config, "value", "ui-cascader__value")}>
          {triggerContent ?? (
            <span className={slotClass(config, "placeholder", "ui-cascader__placeholder")}>
              {placeholder}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className={slotClass(config, "indicator", "ui-cascader__indicator")}
        />
      </button>

      {clearable && valuePath && valuePath.length > 0 && !field.disabled && !readOnly && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Clear selection"
          className={slotClass(config, "clear", "ui-cascader__clear")}
          onClick={() => cascader.clear()}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}

      {name && valuePath && valuePath.length > 0 ? (
        <input type="hidden" name={name} value={valuePath.join(valueSeparator)} />
      ) : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        matchTriggerWidth
        returnFocusRef={anchorRef}
        onDismiss={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Tab") setOpen(false);
        }}
        {...getPopupProps({
          className: slotClass(config, "popup", "ui-cascader__popup"),
          "aria-label": label,
        })}
      >
        <div className={slotClass(config, "menu", "ui-cascader__menu")}>
          {columns.map((column) => (
            <ul
              key={column.level}
              {...getColumnProps(column.level, {
                className: slotClass(config, "column", "ui-cascader__column"),
              })}
            >
              {column.options.map((option) => {
                const onActivePath = activePath[column.level] === option.value;
                return (
                  <li
                    key={option.value}
                    {...getOptionProps(option, column.level, {
                      className: slotClass(
                        config,
                        "menuItem",
                        "ui-cascader__option",
                        onActivePath && "ui-cascader__option--active",
                        option.children?.length && "ui-cascader__option--parent",
                      ),
                    })}
                  >
                    <span className={slotClass(config, "menuItemLabel", "ui-cascader__option-label")}>
                      {option.label}
                    </span>
                    {option.children?.length ? (
                      <ChevronRight
                        size={14}
                        aria-hidden="true"
                        className={slotClass(config, "expandIcon", "ui-cascader__expand-icon")}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>

        {options.length === 0 && (
          <div className={slotClass(config, "empty", "ui-cascader__empty")}>{emptyMessage}</div>
        )}
      </FloatingLayer>
    </div>
  );
});
