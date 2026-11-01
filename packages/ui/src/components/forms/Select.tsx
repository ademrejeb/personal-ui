import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../../utilities/cx";
import { useFieldControl } from "./field-utils";
import type { ControlSize } from "../../types";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: ControlSize;
  invalid?: boolean;
  /** Rendered as a hidden, disabled first option. */
  placeholder?: string;
}

/**
 * Accessible single-selection control backed by the native `<select>`, giving
 * correct keyboard, mobile, and form-submission behavior for free.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    size = "md",
    invalid,
    placeholder,
    id,
    disabled,
    required,
    multiple,
    children,
    "aria-describedby": describedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldControl({ id, invalid, disabled, required, "aria-describedby": describedBy });

  return (
    <div className={cx("ui-select", className)} data-size={size}>
      <select
        ref={ref}
        id={field.id}
        disabled={field.disabled || undefined}
        required={field.required || undefined}
        multiple={multiple}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        data-size={size}
        data-invalid={field.invalid || undefined}
        className="ui-select__control ui-control"
        {...rest}
      >
        {placeholder && !multiple ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      {!multiple ? <ChevronDown className="ui-select__chevron" size={16} aria-hidden="true" /> : null}
    </div>
  );
});
Select.displayName = "Select";
