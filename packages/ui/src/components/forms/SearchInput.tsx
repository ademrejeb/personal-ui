import { forwardRef, useState, type ChangeEvent } from "react";
import { Search, X } from "lucide-react";
import { cx } from "../../utilities/cx";
import { Input, type InputProps } from "./Input";

export interface SearchInputProps extends Omit<InputProps, "type"> {
  /** Fired when the clear button is pressed. */
  onClear?: () => void;
  /** Show the clear button when there is a value. */
  clearable?: boolean;
  clearLabel?: string;
}

/** Text input with a leading search icon and a clear affordance. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    className,
    value,
    defaultValue,
    onChange,
    onClear,
    clearable = true,
    clearLabel = "Clear search",
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => String(defaultValue ?? ""));
  const current = isControlled ? String(value ?? "") : internal;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(event.target.value);
    onChange?.(event);
  };

  const handleClear = () => {
    if (!isControlled) setInternal("");
    onClear?.();
  };

  const showClear = clearable && current.length > 0;

  return (
    <div className={cx("ui-search-input", className)} data-size={rest.size ?? "md"}>
      <Search className="ui-search-input__icon" size={16} aria-hidden="true" />
      <Input ref={ref} type="search" value={value} defaultValue={defaultValue} onChange={handleChange} {...rest} />
      {showClear ? (
        <button
          type="button"
          className="ui-search-input__clear"
          onClick={handleClear}
          aria-label={clearLabel}
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});
SearchInput.displayName = "SearchInput";
