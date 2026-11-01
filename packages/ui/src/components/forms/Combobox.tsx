import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useFieldControl } from "./field-utils";
import { SelectListbox, type RenderOptionState } from "./SelectListbox";
import { getOptionText, useListbox, type SelectOption } from "./select-core";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface ComboboxProps<T extends string | number = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectOption<T>[];
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T | null) => void;
  onSearchChange?: (query: string) => void;
  filterFn?: (option: SelectOption<T>, query: string) => boolean;
  size?: ControlSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  renderOption?: (option: SelectOption<T>, state: RenderOptionState) => ReactNode;
  name?: string;
  /** Accessible name when the combobox is not wrapped in a labelled field. */
  label?: string;
}

/**
 * Searchable single-selection combobox with a custom listbox.
 *
 * Use `Combobox` when you need search, custom option rendering, grouping, or
 * async options. For simple, native-backed selection, prefer `Select`.
 */
export function Combobox<T extends string | number = string>({
  options,
  value: valueProp,
  defaultValue = null,
  onChange,
  onSearchChange,
  filterFn,
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  clearable = true,
  placeholder = "Select…",
  searchPlaceholder,
  emptyMessage = "No results",
  loading,
  error,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
  renderOption,
  name,
  label,
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: ComboboxProps<T>): ReactNode {
  const field = useFieldControl({
    id,
    invalid,
    disabled,
    required,
    "aria-describedby": describedBy,
  });
  const reactId = useId();
  const listboxId = `${field.id}-listbox`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [value, setValue] = useControllableState<T | null>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [query, setQuery] = useState("");

  const listbox = useListbox<T>({
    options,
    idPrefix: reactId,
    query: open ? query : "",
    filterFn,
  });

  const anchorRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );
  const selectedLabel = selected ? getOptionText(selected) : "";

  // When closed, the input shows the selected label; when open it shows the query.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open, value]);

  const displayValue = open ? query : selectedLabel;

  const commit = (option: SelectOption<T>) => {
    if (option.disabled) return;
    setValue(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          listbox.moveActive(1);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          listbox.moveActive(-1);
        }
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          listbox.moveToEdge("start");
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          listbox.moveToEdge("end");
        }
        break;
      case "Enter": {
        if (!open) break;
        event.preventDefault();
        const active = listbox.flat[listbox.activeIndex];
        if (active) commit(active);
        break;
      }
      case "Escape":
        if (open) {
          event.preventDefault();
          setQuery("");
          setOpen(false);
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
      default:
        break;
    }
  };

  const activeOptionId =
    open && listbox.activeIndex >= 0 ? listbox.getOptionId(listbox.activeIndex) : undefined;

  const mergedInputRef = useMergedRefs<HTMLInputElement>(inputRef);

  return (
    <div
      ref={wrapperRef}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      className={cx("ui-combobox", className)}
      {...rest}
    >
      <div
        ref={(node) => {
          anchorRef.current = node;
        }}
        className="ui-combobox__control ui-control"
        data-size={size}
      >
        <input
          ref={mergedInputRef}
          id={field.id}
          name={name}
          role="combobox"
          type="text"
          className="ui-combobox__input"
          value={displayValue}
          placeholder={open ? (searchPlaceholder ?? selectedLabel ?? placeholder) : placeholder}
          disabled={field.disabled}
          readOnly={readOnly}
          required={field.required}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          aria-label={label}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            onSearchChange?.(event.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onMouseDown={() => {
            if (!open && !field.disabled && !readOnly) setOpen(true);
          }}
        />
        {clearable && selected && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-combobox__clear"
            aria-label="Clear selection"
            onClick={(event) => {
              event.stopPropagation();
              setValue(null);
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
        <ChevronDown size={16} className="ui-combobox__chevron" aria-hidden="true" />
      </div>

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        matchTriggerWidth
        keepOpenRefs={[wrapperRef]}
        onDismiss={() => setOpen(false)}
        className="ui-combobox__popup"
      >
            <SelectListbox<T>
              listboxId={listboxId}
              groups={listbox.groups}
              isSelected={(option) => option.value === value}
              onSelect={commit}
              onActiveIndexChange={listbox.setActiveIndex}
              getOptionId={listbox.getOptionId}
              activeIndex={listbox.activeIndex}
              label={label ?? "Options"}
              loading={loading}
              error={error}
              emptyMessage={emptyMessage}
              renderOption={renderOption}
            />
      </FloatingLayer>
    </div>
  );
}
