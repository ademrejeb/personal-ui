import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useControllableState } from "../../hooks/useControllableState";
import { FloatingLayer } from "../../primitives/FloatingLayer";
import { useFieldControl } from "./field-utils";
import { SelectListbox, type RenderOptionState } from "./SelectListbox";
import { getOptionText, useListbox, type SelectOption } from "./select-core";
import type { ControlSize } from "../../types";
import type { Placement } from "../../utilities/position";

export interface AutocompleteProps<T extends string | number = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectOption<T>[];
  /** Free-text value. Unlike a combobox, this may not match any option. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fired when the user picks a suggestion (as opposed to typing). */
  onSelectOption?: (option: SelectOption<T>) => void;
  filterFn?: (option: SelectOption<T>, query: string) => boolean;
  /** Only open the list once the query is at least this long. Defaults to 1. */
  minChars?: number;
  /** Allow values that are not in `options`. Defaults to true. */
  allowCustom?: boolean;
  size?: ControlSize;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  placeholder?: string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  renderOption?: (option: SelectOption<T>, state: RenderOptionState) => ReactNode;
  name?: string;
  /** Accessible name when not wrapped in a labelled field. */
  label?: string;
}

/**
 * Free-text input with suggestions. Values are plain strings, so users can type
 * anything the option list does not contain (disable with `allowCustom={false}`).
 */
export function Autocomplete<T extends string | number = string>({
  options,
  value: valueProp,
  defaultValue = "",
  onChange,
  onSelectOption,
  filterFn,
  minChars = 1,
  allowCustom = true,
  size = "md",
  invalid,
  disabled,
  required,
  readOnly,
  clearable = true,
  placeholder = "Type to search…",
  emptyMessage = "No matches",
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
}: AutocompleteProps<T>): ReactNode {
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

  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const canOpen = value.trim().length >= minChars;
  const listbox = useListbox<T>({
    options,
    idPrefix: reactId,
    query: open ? value : "",
    filterFn,
  });
  const visible = canOpen ? listbox.groups : [];
  const hasResults = visible.some((group) => group.options.length > 0);

  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!canOpen) setOpen(false);
  }, [canOpen, setOpen]);

  const commit = (option: SelectOption<T>) => {
    if (option.disabled) return;
    const text = getOptionText(option);
    setValue(text);
    onSelectOption?.(option);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open && canOpen) setOpen(true);
        else listbox.moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open && canOpen) setOpen(true);
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
      case "Enter": {
        if (!open) break;
        const active = listbox.flat[listbox.activeIndex];
        if (active) {
          event.preventDefault();
          commit(active);
        } else {
          setOpen(false);
        }
        break;
      }
      case "Escape":
        if (open) {
          event.preventDefault();
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

  return (
    <div
      ref={wrapperRef}
      data-size={size}
      data-invalid={field.invalid || undefined}
      data-disabled={field.disabled || undefined}
      data-open={open || undefined}
      className={cx("ui-autocomplete", className)}
      {...rest}
    >
      <div
        ref={(node) => {
          anchorRef.current = node;
        }}
        className="ui-autocomplete__control ui-control"
        data-size={size}
      >
        <input
          ref={inputRef}
          id={field.id}
          name={name}
          type="text"
          className="ui-autocomplete__input"
          value={value}
          placeholder={placeholder}
          disabled={field.disabled}
          readOnly={readOnly}
          required={field.required}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          aria-label={label}
          autoComplete="off"
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            if (!open && (allowCustom || next.trim().length >= minChars)) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onMouseDown={() => {
            if (!open && canOpen && !field.disabled && !readOnly) setOpen(true);
          }}
        />
        {clearable && value && !field.disabled && !readOnly ? (
          <button
            type="button"
            className="ui-autocomplete__clear"
            aria-label="Clear"
            onClick={(event) => {
              event.stopPropagation();
              setValue("");
              inputRef.current?.focus();
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <FloatingLayer
        open={open}
        anchorRef={anchorRef}
        placement={placement}
        offset={4}
        matchTriggerWidth
        keepOpenRefs={[wrapperRef]}
        onDismiss={() => setOpen(false)}
        className="ui-autocomplete__popup"
      >
            <SelectListbox<T>
              listboxId={listboxId}
              groups={visible}
              isSelected={(option) => getOptionText(option) === value}
              onSelect={commit}
              onActiveIndexChange={listbox.setActiveIndex}
              getOptionId={listbox.getOptionId}
              activeIndex={listbox.activeIndex}
              label={label ?? "Suggestions"}
              loading={loading}
              error={error}
              emptyMessage={hasResults || loading || error ? emptyMessage : "No matches"}
              renderOption={renderOption}
            />
      </FloatingLayer>
    </div>
  );
}
