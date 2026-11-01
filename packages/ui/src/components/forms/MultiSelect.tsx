import {
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
import { useSelection } from "../../hooks/useSelection";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useFieldControl } from "./field-utils";
import { SelectListbox, type RenderOptionState } from "./SelectListbox";
import { getOptionText, useListbox, type SelectOption } from "./select-core";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface MultiSelectProps<T extends string | number = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectOption<T>[];
  value?: T[];
  defaultValue?: T[];
  onChange?: (values: T[]) => void;
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
  /** Maximum number of selections; further options are disabled. */
  maxSelected?: number;
  /** Collapse chips beyond this count into a "+N" indicator. */
  maxVisibleChips?: number;
  /** Offer a "select all filtered" action in the popup header. */
  selectAll?: boolean;
  renderOption?: (option: SelectOption<T>, state: RenderOptionState) => ReactNode;
  /** Custom chip renderer. */
  renderChip?: (option: SelectOption<T>, remove: () => void) => ReactNode;
  name?: string;
  label?: string;
}

/**
 * Multi-selection control with chips, search, grouping, overflow handling,
 * and a shared listbox core. Built for datasets where several values are
 * selected at once.
 */
export function MultiSelect<T extends string | number = string>({
  options,
  value: valueProp,
  defaultValue = [],
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
  searchPlaceholder = "Search…",
  emptyMessage = "No results",
  loading,
  error,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
  maxSelected,
  maxVisibleChips,
  selectAll = false,
  renderOption,
  renderChip,
  name,
  label,
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: MultiSelectProps<T>): ReactNode {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });
  const reactId = useId();
  const listboxId = `${field.id}-listbox`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selection = useSelection<T>({
    value: valueProp,
    defaultValue,
    onChange,
    max: maxSelected,
  });
  const values = selection.selected;
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [query, setQuery] = useState("");

  const selectedSet = useMemo(() => new Set(values), [values]);
  const atLimit = selection.atLimit;

  // Once the selection limit is reached, mark every unselected option as
  // disabled so the listbox reflects the constraint to assistive tech too.
  const effectiveOptions = useMemo<SelectOption<T>[]>(() => {
    if (maxSelected == null) return options;
    return options.map((option) =>
      selectedSet.has(option.value) || !atLimit
        ? option
        : { ...option, disabled: true },
    );
  }, [options, maxSelected, selectedSet, atLimit]);

  const listbox = useListbox<T>({ options: effectiveOptions, idPrefix: reactId, query, filterFn });
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const selectedOptions = useMemo(
    () =>
      values
        .map((value) => options.find((option) => option.value === value))
        .filter((option): option is SelectOption<T> => Boolean(option)),
    [values, options],
  );

  const toggle = (option: SelectOption<T>) => {
    if (option.disabled) return;
    selection.toggle(option.value);
  };

  const remove = (value: T) => {
    selection.deselect(value);
    inputRef.current?.focus();
  };

  const enabledFiltered = listbox.flat.filter((option) => !option.disabled);
  const allFilteredSelected = selection.allSelected(enabledFiltered.map((option) => option.value));

  const toggleAllFiltered = () => {
    selection.toggleAll(enabledFiltered.map((option) => option.value));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) setOpen(true);
        else listbox.moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) setOpen(true);
        else listbox.moveActive(-1);
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
      case "Enter":
      case " ": {
        if (!open) break;
        event.preventDefault();
        const active = listbox.flat[listbox.activeIndex];
        if (active) toggle(active);
        break;
      }
      case "Backspace":
        if (query === "" && values.length > 0) {
          event.preventDefault();
          remove(values[values.length - 1]);
        }
        break;
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

  const visibleOptions =
    maxVisibleChips != null ? selectedOptions.slice(0, maxVisibleChips) : selectedOptions;
  const hiddenCount = selectedOptions.length - visibleOptions.length;

  return (
    <div
      ref={wrapperRef}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      className={cx("ui-multiselect", className)}
      {...rest}
    >
      <div
        ref={(node) => {
          anchorRef.current = node;
        }}
        className="ui-multiselect__control ui-control"
        data-size={size}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !field.disabled && !readOnly) {
            inputRef.current?.focus();
          }
        }}
      >
        <div className="ui-multiselect__chips">
          {visibleOptions.map((option) =>
            renderChip ? (
              <span key={String(option.value)}>{renderChip(option, () => remove(option.value))}</span>
            ) : (
              <span key={String(option.value)} className="ui-multiselect__chip">
                <span className="ui-multiselect__chip-label">{option.label ?? getOptionText(option)}</span>
                {!field.disabled && !readOnly ? (
                  <button
                    type="button"
                    className="ui-multiselect__chip-remove"
                    aria-label={`Remove ${getOptionText(option)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(option.value);
                    }}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            ),
          )}
          {hiddenCount > 0 ? (
            <span className="ui-multiselect__chip ui-multiselect__chip--more">+{hiddenCount} more</span>
          ) : null}
          <input
            ref={mergedInputRef}
            id={field.id}
            role="combobox"
            type="text"
            className="ui-multiselect__input"
            value={query}
            placeholder={selectedOptions.length === 0 ? placeholder : searchPlaceholder}
            disabled={field.disabled}
            readOnly={readOnly}
            required={field.required && selectedOptions.length === 0}
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
        </div>
        {clearable && selectedOptions.length > 0 && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-multiselect__clear"
            aria-label="Clear all selections"
            onClick={(event) => {
              event.stopPropagation();
              selection.clear();
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
        <ChevronDown size={16} className="ui-multiselect__chevron" aria-hidden="true" />
      </div>

      {name
        ? values.map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} />)
        : null}

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        matchTriggerWidth
        keepOpenRefs={[wrapperRef]}
        onDismiss={() => setOpen(false)}
        className="ui-multiselect__popup"
      >
            {selectAll && enabledFiltered.length > 0 ? (
              <button
                type="button"
                className="ui-multiselect__select-all"
                onClick={toggleAllFiltered}
              >
                {allFilteredSelected ? "Clear filtered" : "Select all filtered"}
                {atLimit ? " (limit reached)" : ""}
              </button>
            ) : null}
            <SelectListbox<T>
              listboxId={listboxId}
              groups={listbox.groups}
              multiple
              isSelected={(option) => selectedSet.has(option.value)}
              onSelect={(option) => toggle(option)}
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
